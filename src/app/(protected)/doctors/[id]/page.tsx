"use client";

import React, { useState, useTransition } from "react";
import { useParams, useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  Calendar,
  UserPlus,
  Trash2,
  Users,
  AlertCircle,
  RefreshCw,
  Clock,
} from "lucide-react";
import { useDoctor, useDoctorPatients, useRemoveDoctorPatientMutation } from "@/features/doctors/hooks";
import { AddDoctorPatientDialog } from "@/features/doctors/components/AddDoctorPatientDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable, Column } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { SearchInput } from "@/components/shared/SearchInput";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Patient } from "@/types/patient";
import { formatDateTime } from "@/lib/utils";

function DoctorDetailContent() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const doctorId = (params?.id as string) || "";

  // Patient sub-list state from search params
  const patientPage = parseInt(searchParams.get("patientPage") || "1", 10);
  const patientSearch = searchParams.get("patientSearch") || undefined;

  // Selected patient for deletion confirmation
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  // Add patient dialog open state
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);

  // Queries
  const {
    data: doctorData,
    isLoading: doctorLoading,
    isError: doctorError,
    error: doctorErrorObj,
    refetch: refetchDoctor,
  } = useDoctor(doctorId);

  const {
    data: patientsData,
    isLoading: patientsLoading,
    isError: patientsError,
    error: patientsErrorObj,
    refetch: refetchPatients,
  } = useDoctorPatients(doctorId, {
    page: patientPage,
    limit: 10,
    search: patientSearch,
  });

  // Delete mutation
  const removePatientMutation = useRemoveDoctorPatientMutation(doctorId);

  const doctor = doctorData?.doctor;
  const patientsList = patientsData?.data || [];
  const patientsMeta = patientsData?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const handleDeletePatient = () => {
    if (!patientToDelete) return;
    const pId = patientToDelete._id || patientToDelete.id;
    if (!pId) return;

    removePatientMutation.mutate(pId, {
      onSuccess: () => {
        setPatientToDelete(null);
      },
    });
  };

  const handlePatientPageChange = (newPage: number) => {
    startTransition(() => {
      const sp = new URLSearchParams(searchParams.toString());
      if (newPage === 1) {
        sp.delete("patientPage");
      } else {
        sp.set("patientPage", String(newPage));
      }
      const qs = sp.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  };

  // Patients table columns
  const patientColumns: Column<Patient>[] = [
    {
      key: "name",
      header: "Patient Name",
      render: (patient) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-muted text-foreground font-semibold text-xs">
            {patient.name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase() || "PT"}
          </div>
          <div>
            <span className="font-medium text-foreground block">{patient.name}</span>
            <span className="text-xs text-muted-foreground md:hidden">
              {patient.gender}, {patient.age} yrs
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "demographics",
      header: "Age / Gender",
      render: (patient) => (
        <span className="text-xs text-muted-foreground">
          {patient.age} yrs • {patient.gender}
        </span>
      ),
    },
    {
      key: "condition",
      header: "Diagnosis / Condition",
      render: (patient) => (
        <Badge variant="secondary" className="font-medium text-xs">
          {patient.condition}
        </Badge>
      ),
    },
    {
      key: "phone",
      header: "Contact Phone",
      render: (patient) => (
        <span className="text-xs text-muted-foreground font-mono">
          {patient.phone}
        </span>
      ),
    },
    {
      key: "admittedAt",
      header: "Admission Date",
      render: (patient) => (
        <span className="text-xs text-muted-foreground">
          {patient.admittedAt ? formatDateTime(patient.admittedAt) : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      headerClassName: "w-[80px] text-right",
      className: "text-right",
      render: (patient) => (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setPatientToDelete(patient);
          }}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-danger hover:bg-danger/10"
          aria-label={`Remove patient ${patient.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <div>
        <Link
          href="/doctors"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors p-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Doctors Directory</span>
        </Link>
      </div>

      {/* Doctor Profile Card */}
      {doctorLoading ? (
        <Card className="p-6">
          <CardContent className="p-0 space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      ) : doctorError || !doctor ? (
        <div className="rounded-lg border border-danger/30 bg-danger/5 p-6 text-center space-y-3">
          <AlertCircle className="h-8 w-8 text-danger mx-auto" />
          <h3 className="text-base font-semibold text-danger">Doctor not found</h3>
          <p className="text-sm text-muted-foreground">
            {doctorErrorObj instanceof Error
              ? doctorErrorObj.message
              : "Unable to retrieve the requested doctor profile."}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => refetchDoctor()}
            className="border-danger/30 text-danger"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      ) : (
        <Card className="p-6 border-border shadow-xs">
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent text-primary text-xl font-bold">
                  {doctor.name
                    .replace(/^Dr\.\s*/i, "")
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase() || "DR"}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                      {doctor.name}
                    </h1>
                    <Badge variant="accent" className="text-xs font-semibold">
                      {doctor.specialization}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                    <Building2 className="h-4 w-4 shrink-0 text-primary" />
                    <span>{doctor.hospital}</span>
                  </p>
                </div>
              </div>

              {/* Add Patient Action */}
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddPatientOpen(true)}
                className="gap-2 min-h-[40px] shrink-0"
              >
                <UserPlus className="h-4 w-4" />
                <span>Add Patient</span>
              </Button>
            </div>

            {/* Profile Meta Grid */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <span className="block font-medium text-foreground">Phone</span>
                  <span>{doctor.phone}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <span className="block font-medium text-foreground">Email</span>
                  <span className="truncate">{doctor.email}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <span className="block font-medium text-foreground">Registered</span>
                  <span>{formatDateTime(doctor.createdAt)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Doctor's Patients Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Assigned Patients</span>
              {!patientsLoading && (
                <Badge variant="secondary" className="text-xs font-semibold ml-1">
                  {patientsMeta.total}
                </Badge>
              )}
            </h2>
            <p className="text-xs text-muted-foreground">
              Patients currently under care of this physician.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
            <div className="w-full sm:w-64">
              <SearchInput
                placeholder="Search patients..."
                paramName="patientSearch"
                resetPageParam="patientPage"
              />
            </div>
            <Button
              type="button"
              variant="default"
              onClick={() => setIsAddPatientOpen(true)}
              className="gap-2 min-h-[40px] w-full sm:w-auto shrink-0 shadow-xs"
            >
              <UserPlus className="h-4 w-4" />
              <span>Add Patient</span>
            </Button>
          </div>
        </div>

        {/* Patients Sub-table */}
        {patientsError ? (
          <div className="rounded-lg border border-danger/30 bg-danger/5 p-6 text-center space-y-2">
            <AlertCircle className="h-6 w-6 text-danger mx-auto" />
            <p className="text-sm font-medium text-danger">Failed to load patients list</p>
            <p className="text-xs text-muted-foreground">
              {patientsErrorObj instanceof Error ? patientsErrorObj.message : "Error fetching patient records"}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetchPatients()}
              className="mt-2 text-danger border-danger/30"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Retry
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <DataTable
              columns={patientColumns}
              data={patientsList}
              isLoading={patientsLoading}
              keyExtractor={(p) => p._id || p.id || Math.random().toString()}
              emptyState={
                <EmptyState
                  icon={<Users className="h-6 w-6" />}
                  title="No assigned patients"
                  description={
                    patientSearch
                      ? `No patients match "${patientSearch}". Try another query.`
                      : "This doctor currently has no patients assigned. Click 'Add Patient' to register one."
                  }
                  action={{
                    label: "Add Patient",
                    onClick: () => setIsAddPatientOpen(true),
                  }}
                />
              }
              mobileCardRenderer={(patient) => (
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">
                        {patient.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {patient.gender}, {patient.age} yrs • {patient.phone}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {patient.condition}
                    </Badge>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {patient.admittedAt ? formatDateTime(patient.admittedAt) : "Admitted"}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setPatientToDelete(patient)}
                      className="h-8 px-2 text-danger hover:bg-danger/10"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              )}
            />

            {/* Pagination for Doctor's Patients */}
            {!patientsLoading && patientsMeta.totalPages > 1 && (
              <Pagination
                totalPages={patientsMeta.totalPages}
                currentPage={patientsMeta.page}
                totalItems={patientsMeta.total}
                pageSize={patientsMeta.limit}
                paramName="patientPage"
                onPageChange={handlePatientPageChange}
              />
            )}
          </div>
        )}
      </div>

      {/* Confirm Dialog for Patient Removal */}
      <ConfirmDialog
        open={Boolean(patientToDelete)}
        onOpenChange={(open) => {
          if (!open) setPatientToDelete(null);
        }}
        title="Remove Patient from Doctor"
        description={`Are you sure you want to remove ${patientToDelete?.name || "this patient"} from Dr. ${doctor?.name || "this doctor"}? This will unlink the patient record.`}
        confirmText="Remove Patient"
        onConfirm={handleDeletePatient}
        isPending={removePatientMutation.isPending}
        variant="danger"
      />

      {/* Add Patient Dialog */}
      <AddDoctorPatientDialog
        doctorId={doctorId}
        doctorName={doctor?.name}
        open={isAddPatientOpen}
        onOpenChange={setIsAddPatientOpen}
      />
    </div>
  );
}

export default function DoctorDetailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-5 w-36 rounded-md bg-surface-muted animate-pulse" />
          <div className="h-44 rounded-lg bg-surface border border-border p-6 animate-pulse" />
          <div className="h-64 rounded-lg bg-surface border border-border p-4 animate-pulse" />
        </div>
      }
    >
      <DoctorDetailContent />
    </React.Suspense>
  );
}
