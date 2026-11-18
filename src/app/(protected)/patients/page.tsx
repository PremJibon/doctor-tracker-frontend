"use client";

import React, { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Users,
  UserPlus,
  Pencil,
  Trash2,
  AlertCircle,
  RefreshCw,
  Phone,
  Stethoscope,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { FilterBar, ActiveFilter } from "@/components/shared/FilterBar";
import { DataTable, Column } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { usePatients, useDeletePatientMutation } from "@/features/patients/hooks";
import { useDoctors } from "@/features/doctors/hooks";
import { EditPatientDialog } from "@/features/patients/components/EditPatientDialog";
import { AddDoctorPatientDialog } from "@/features/doctors/components/AddDoctorPatientDialog";
import { Patient } from "@/types/patient";
import { formatDateTime } from "@/lib/utils";

function getConditionBadgeVariant(
  condition: string
): "success" | "warning" | "danger" | "accent" {
  const c = condition.toLowerCase();
  if (
    c.includes("cancer") ||
    c.includes("critical") ||
    c.includes("severe") ||
    c.includes("failure")
  )
    return "danger";
  if (
    c.includes("hypertension") ||
    c.includes("diabetes") ||
    c.includes("chronic")
  )
    return "warning";
  if (c.includes("recovered") || c.includes("stable") || c.includes("healthy"))
    return "success";
  return "accent";
}

function getDoctorName(patient: Patient): string {
  if (!patient.doctorId) return "—";
  if (typeof patient.doctorId === "object" && patient.doctorId?.name) {
    return patient.doctorId.name;
  }
  return "—";
}

function PatientsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deletePatient, setDeletePatient] = useState<Patient | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { mutate: doDelete, isPending: isDeleting } = useDeletePatientMutation();

  // URL params
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = 10;
  const search = searchParams.get("search") || undefined;
  const condition = searchParams.get("condition") || undefined;
  const doctorId = searchParams.get("doctorId") || undefined;
  const from = searchParams.get("from") || undefined;
  const to = searchParams.get("to") || undefined;
  const sort = searchParams.get("sort") || "createdAt:desc";

  const { data, isLoading, isError, error, refetch, isFetching } = usePatients({
    page,
    limit,
    search,
    condition,
    doctorId,
    from,
    to,
    sort,
  });

  // Fetch doctors for the filter dropdown
  const { data: doctorsData } = useDoctors({ limit: 100 });
  const doctorsList = doctorsData?.data || [];

  const updateParam = (key: string, value: string | null) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  };

  const handleResetFilters = () => {
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  const activeFilters: ActiveFilter[] = [];
  if (search) {
    activeFilters.push({
      id: "search",
      label: "Search",
      value: search,
      onRemove: () => updateParam("search", null),
    });
  }
  if (condition) {
    activeFilters.push({
      id: "condition",
      label: "Condition",
      value: condition,
      onRemove: () => updateParam("condition", null),
    });
  }
  if (doctorId) {
    const doc = doctorsList.find((d) => (d._id || d.id) === doctorId);
    activeFilters.push({
      id: "doctorId",
      label: "Doctor",
      value: doc?.name || doctorId,
      onRemove: () => updateParam("doctorId", null),
    });
  }
  if (from) {
    activeFilters.push({
      id: "from",
      label: "From",
      value: from,
      onRemove: () => updateParam("from", null),
    });
  }
  if (to) {
    activeFilters.push({
      id: "to",
      label: "To",
      value: to,
      onRemove: () => updateParam("to", null),
    });
  }

  const patients = data?.data || [];
  const meta = data?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const columns: Column<Patient>[] = [
    {
      key: "name",
      header: "Patient",
      render: (patient) => (
        <div>
          <p className="font-medium text-foreground text-sm">{patient.name}</p>
          <p className="text-xs text-muted-foreground">
            {patient.age}y · {patient.gender}
          </p>
        </div>
      ),
    },
    {
      key: "condition",
      header: "Condition",
      render: (patient) => (
        <Badge variant={getConditionBadgeVariant(patient.condition)} className="text-xs">
          {patient.condition}
        </Badge>
      ),
    },
    {
      key: "phone",
      header: "Contact",
      render: (patient) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Phone className="h-3 w-3 shrink-0" />
          <span>{patient.phone}</span>
        </div>
      ),
    },
    {
      key: "doctor",
      header: "Assigned Doctor",
      render: (patient) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Stethoscope className="h-3 w-3 shrink-0" />
          <span>{getDoctorName(patient)}</span>
        </div>
      ),
    },
    {
      key: "admittedAt",
      header: "Admitted",
      render: (patient) => (
        <span className="text-xs text-muted-foreground">
          {formatDateTime(patient.admittedAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      headerClassName: "w-[100px] text-right",
      className: "text-right",
      render: (patient) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
            aria-label="Edit patient"
            onClick={(e) => {
              e.stopPropagation();
              setEditPatient(patient);
              setEditOpen(true);
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-danger"
            aria-label="Delete patient"
            onClick={(e) => {
              e.stopPropagation();
              setDeletePatient(patient);
              setDeleteOpen(true);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patients Directory"
        description="Comprehensive clinical patient roster, diagnostics, and care assignments."
        actions={
          <AddDoctorPatientDialog
            trigger={
              <Button type="button" variant="default" className="gap-2 min-h-[40px] shadow-xs">
                <UserPlus className="h-4 w-4" />
                <span>Add Patient</span>
              </Button>
            }
          />
        }
      />

      {/* Search & Filter Controls */}
      <div className="space-y-3 rounded-lg border border-border bg-surface p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="flex-1 w-full">
            <SearchInput
              placeholder="Search patients by name, condition, or phone..."
              paramName="search"
            />
          </div>
          <div className="w-full sm:w-auto shrink-0">
            <select
              value={sort}
              onChange={(e) => updateParam("sort", e.target.value)}
              aria-label="Sort patients"
              className="flex h-10 w-full sm:w-44 rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[40px]"
            >
              <option value="createdAt:desc">Newest First</option>
              <option value="createdAt:asc">Oldest First</option>
              <option value="name:asc">Name (A-Z)</option>
              <option value="name:desc">Name (Z-A)</option>
              <option value="age:asc">Age (Youngest)</option>
              <option value="age:desc">Age (Oldest)</option>
            </select>
          </div>
        </div>

        <FilterBar
          activeFilters={activeFilters}
          onReset={handleResetFilters}
          totalResults={meta.total}
          title="Filter Patients"
        >
          {/* Condition Filter */}
          <div className="w-full sm:w-48">
            <Input
              type="text"
              placeholder="Filter by condition..."
              value={condition || ""}
              onChange={(e) => updateParam("condition", e.target.value || null)}
              className="h-10 text-sm"
            />
          </div>

          {/* Doctor Filter */}
          <div className="w-full sm:w-52">
            <select
              value={doctorId || ""}
              onChange={(e) => updateParam("doctorId", e.target.value || null)}
              aria-label="Filter by doctor"
              className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">All Doctors</option>
              {doctorsList.map((doc) => (
                <option key={doc._id || doc.id} value={doc._id || doc.id || ""}>
                  {doc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range: From */}
          <div className="w-full sm:w-36">
            <Input
              type="date"
              aria-label="Filter admitted from"
              value={from || ""}
              onChange={(e) => updateParam("from", e.target.value || null)}
              className="h-10 text-xs"
            />
          </div>

          {/* Date Range: To */}
          <div className="w-full sm:w-36">
            <Input
              type="date"
              aria-label="Filter admitted to"
              value={to || ""}
              onChange={(e) => updateParam("to", e.target.value || null)}
              className="h-10 text-xs"
            />
          </div>
        </FilterBar>
      </div>

      {/* 4-State content area */}
      {isError ? (
        <div className="rounded-lg border border-danger/30 bg-danger/5 p-6 text-center space-y-3">
          <div className="flex justify-center text-danger">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h3 className="text-base font-semibold text-danger">
            Failed to load patients
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {error instanceof Error
              ? error.message
              : "An unexpected error occurred while fetching patient records."}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => refetch()}
            className="gap-2 min-h-[40px] border-danger/30 text-danger hover:bg-danger/10"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <DataTable
            columns={columns}
            data={patients}
            isLoading={isLoading}
            keyExtractor={(p) => p._id || p.id || Math.random().toString()}
            emptyState={
              <EmptyState
                icon={<Users className="h-6 w-6" />}
                title="No patients found"
                description={
                  activeFilters.length > 0
                    ? "Try adjusting or clearing your filters to find patient records."
                    : "No patients have been registered in the system yet."
                }
                action={
                  activeFilters.length > 0
                    ? { label: "Clear All Filters", onClick: handleResetFilters }
                    : undefined
                }
              />
            }
            mobileCardRenderer={(patient) => (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">
                      {patient.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {patient.age}y · {patient.gender}
                    </p>
                  </div>
                  <Badge
                    variant={getConditionBadgeVariant(patient.condition)}
                    className="text-xs shrink-0"
                  >
                    {patient.condition}
                  </Badge>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3 w-3" />
                    <span>{patient.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Stethoscope className="h-3 w-3" />
                    <span>{getDoctorName(patient)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(patient.admittedAt)}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 text-muted-foreground hover:text-primary"
                      aria-label="Edit patient"
                      onClick={() => {
                        setEditPatient(patient);
                        setEditOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 text-muted-foreground hover:text-danger"
                      aria-label="Delete patient"
                      onClick={() => {
                        setDeletePatient(patient);
                        setDeleteOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          />

          {!isLoading && meta.totalPages > 1 && (
            <Pagination
              totalPages={meta.totalPages}
              currentPage={meta.page}
              totalItems={meta.total}
              pageSize={meta.limit}
              paramName="page"
            />
          )}

          {isFetching && !isLoading && (
            <div className="text-center text-xs text-muted-foreground pt-1">
              Updating list...
            </div>
          )}
        </div>
      )}

      {/* Edit Dialog */}
      <EditPatientDialog
        patient={editPatient}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Patient Record"
        description={
          deletePatient
            ? `You are about to permanently delete ${deletePatient.name}'s record. This action cannot be undone.`
            : "Are you sure you want to delete this patient?"
        }
        confirmText="Delete Patient"
        variant="danger"
        isPending={isDeleting}
        onConfirm={() => {
          if (!deletePatient) return;
          doDelete(deletePatient._id || deletePatient.id || "", {
            onSuccess: () => setDeleteOpen(false),
          });
        }}
      />
    </div>
  );
}

export default function PatientsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-8 w-48 rounded-md bg-surface-muted animate-pulse" />
            <div className="h-4 w-72 rounded-md bg-surface-muted animate-pulse" />
          </div>
          <div className="h-24 rounded-lg bg-surface border border-border p-4 animate-pulse" />
          <div className="h-64 rounded-lg bg-surface border border-border p-4 animate-pulse" />
        </div>
      }
    >
      <PatientsPageContent />
    </React.Suspense>
  );
}
