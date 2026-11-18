"use client";

import React, { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  UserPlus,
  Stethoscope,
  Building2,
  Phone,
  Mail,
  ChevronRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { FilterBar, ActiveFilter } from "@/components/shared/FilterBar";
import { DataTable, Column } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { DateRangePicker } from "@/components/shared/DateRangePicker";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useDoctors } from "@/features/doctors/hooks";
import { CreateDoctorDialog } from "@/features/doctors/components/CreateDoctorDialog";
import { DoctorBulkDeleteDialog } from "@/features/doctors/components/DoctorBulkDeleteDialog";
import { Doctor } from "@/types/doctor";
import { formatDateTime } from "@/lib/utils";

function DoctorsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [selectedDoctorIds, setSelectedDoctorIds] = React.useState<Set<string>>(new Set());
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = React.useState(false);

  // Read URL search params
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = 10;
  const search = searchParams.get("search") || undefined;
  const specialization = searchParams.get("specialization") || undefined;
  const hospital = searchParams.get("hospital") || undefined;
  const from = searchParams.get("from") || undefined;
  const to = searchParams.get("to") || undefined;
  const sort = searchParams.get("sort") || "createdAt:desc";

  // Clear selections whenever filters/search change (adjust during render per React 19)
  const filterKey = `${search}-${specialization}-${hospital}-${from}-${to}`;
  const [prevFilterKey, setPrevFilterKey] = React.useState(filterKey);
  if (prevFilterKey !== filterKey) {
    setPrevFilterKey(filterKey);
    setSelectedDoctorIds(new Set());
  }

  // TanStack Query
  const { data, isLoading, isError, error, refetch, isFetching } = useDoctors({
    page,
    limit,
    search,
    specialization,
    hospital,
    from,
    to,
    sort,
  });

  const updateParam = (key: string, value: string | null) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page"); // Reset to page 1 on filter change
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  };

  const handleResetFilters = () => {
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  // Build active filters list for FilterBar badges
  const activeFilters: ActiveFilter[] = [];
  if (search) {
    activeFilters.push({
      id: "search",
      label: "Search",
      value: search,
      onRemove: () => updateParam("search", null),
    });
  }
  if (specialization) {
    activeFilters.push({
      id: "specialization",
      label: "Specialty",
      value: specialization,
      onRemove: () => updateParam("specialization", null),
    });
  }
  if (hospital) {
    activeFilters.push({
      id: "hospital",
      label: "Hospital",
      value: hospital,
      onRemove: () => updateParam("hospital", null),
    });
  }
  if (from || to) {
    const fmt = (dStr?: string) => {
      if (!dStr) return "";
      const [y, m, d] = dStr.split("-").map(Number);
      return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
        new Date(y, m - 1, d)
      );
    };
    const label =
      from && to ? `${fmt(from)} – ${fmt(to)}` : from ? `From ${fmt(from)}` : `Until ${fmt(to)}`;
    activeFilters.push({
      id: "dates",
      label: "Date",
      value: label,
      onRemove: () => {
        startTransition(() => {
          const params = new URLSearchParams(searchParams.toString());
          params.delete("from");
          params.delete("to");
          params.delete("page");
          const qs = params.toString();
          router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
        });
      },
    });
  }

  // Doctors table columns
  const columns: Column<Doctor>[] = [
    {
      key: "name",
      header: "Practitioner",
      render: (doc) => {
        const docId = doc._id || doc.id || "";
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-primary font-semibold text-xs">
              {doc.name
                .replace(/^Dr\.\s*/i, "")
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase() || "DR"}
            </div>
            <div>
              <Link
                href={`/doctors/${docId}`}
                className="font-medium text-foreground hover:text-primary transition-colors inline-block"
              >
                {doc.name}
              </Link>
              <div className="text-xs text-muted-foreground flex items-center gap-1.5 md:hidden">
                <Building2 className="h-3 w-3" />
                <span>{doc.hospital}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "specialization",
      header: "Specialization",
      render: (doc) => (
        <Badge variant="accent" className="font-medium text-xs">
          {doc.specialization}
        </Badge>
      ),
    },
    {
      key: "hospital",
      header: "Hospital",
      render: (doc) => (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Building2 className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate max-w-[200px]">{doc.hospital}</span>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (doc) => (
        <div className="space-y-0.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Phone className="h-3 w-3" />
            <span>{doc.phone}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Mail className="h-3 w-3" />
            <span className="truncate max-w-[170px]">{doc.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Registered",
      render: (doc) => (
        <span className="text-xs text-muted-foreground">
          {formatDateTime(doc.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      headerClassName: "w-[100px] text-right",
      className: "text-right",
      render: (doc) => {
        const docId = doc._id || doc.id || "";
        return (
          <Link
            href={`/doctors/${docId}`}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover px-2.5 py-1.5 rounded-md hover:bg-surface-muted transition-colors min-h-[36px]"
          >
            <span>View</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        );
      },
    },
  ];

  const doctorsList = data?.data || [];
  const meta = data?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Doctors Directory"
        description="Manage licensed healthcare providers, affiliations, and clinical assignments."
        actions={
          <CreateDoctorDialog
            trigger={
              <Button type="button" variant="default" className="gap-2 min-h-[40px]">
                <UserPlus className="h-4 w-4" />
                <span>Add Doctor</span>
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
              placeholder="Search doctors by name, specialization, or hospital..."
              paramName="search"
            />
          </div>
          <div className="w-full sm:w-auto shrink-0 flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => updateParam("sort", e.target.value)}
              aria-label="Sort doctors"
              className="flex h-10 w-full sm:w-44 rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[40px]"
            >
              <option value="createdAt:desc">Newest First</option>
              <option value="createdAt:asc">Oldest First</option>
              <option value="name:asc">Name (A-Z)</option>
              <option value="name:desc">Name (Z-A)</option>
            </select>
          </div>
        </div>

        {/* FilterBar with Secondary Filters */}
        <FilterBar
          activeFilters={activeFilters}
          onReset={handleResetFilters}
          totalResults={meta.total}
          title="Filter Doctors"
        >
          {/* Specialization Filter */}
          <div className="w-full sm:w-48">
            <Input
              type="text"
              placeholder="Filter by specialty..."
              value={specialization || ""}
              onChange={(e) => updateParam("specialization", e.target.value || null)}
              className="h-10 text-sm"
            />
          </div>

          {/* Hospital Filter */}
          <div className="w-full sm:w-48">
            <Input
              type="text"
              placeholder="Filter by hospital..."
              value={hospital || ""}
              onChange={(e) => updateParam("hospital", e.target.value || null)}
              className="h-10 text-sm rounded-xl"
            />
          </div>

          {/* Unified Popup Calendar DateRangePicker */}
          <DateRangePicker fromParam="from" toParam="to" resetPageParam="page" />
        </FilterBar>
      </div>

      {/* Main Content Area (4-State Rule) */}
      {isError ? (
        <div className="rounded-xl border border-danger/30 bg-danger/5 p-6 text-center space-y-3 shadow-raised-sm">
          <div className="flex justify-center text-danger">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h3 className="text-base font-semibold text-danger">
            Failed to load doctors
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {error instanceof Error ? error.message : "An unexpected error occurred while fetching doctor records."}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => refetch()}
            className="gap-2 min-h-[40px] border-danger/30 text-danger hover:bg-danger/10 rounded-xl"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <DataTable
            columns={columns}
            data={doctorsList}
            isLoading={isLoading}
            keyExtractor={(doc) => doc._id || doc.id || Math.random().toString()}
            onRowClick={(doc) => {
              const docId = doc._id || doc.id;
              if (docId) router.push(`/doctors/${docId}`);
            }}
            selectable={true}
            selectedIds={selectedDoctorIds}
            onSelectionChange={setSelectedDoctorIds}
            bulkActions={[{ label: "Delete", value: "delete", variant: "danger" }]}
            onBulkAction={(action) => {
              if (action === "delete") {
                setBulkDeleteDialogOpen(true);
              }
            }}
            emptyState={
              <EmptyState
                icon={<Stethoscope className="h-6 w-6" />}
                title="No doctors found"
                description={
                  activeFilters.length > 0
                    ? "Try adjusting or clearing your search and filters to find doctor records."
                    : "No doctors have been registered in the system yet. Get started by adding the first doctor."
                }
                action={
                  activeFilters.length > 0
                    ? {
                        label: "Clear All Filters",
                        onClick: handleResetFilters,
                      }
                    : undefined
                }
              />
            }
            mobileCardRenderer={(doc) => {
              const docId = doc._id || doc.id || "";
              return (
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-primary font-semibold text-xs">
                        {doc.name
                          .replace(/^Dr\.\s*/i, "")
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase() || "DR"}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">
                          {doc.name}
                        </h4>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Building2 className="h-3 w-3 shrink-0" />
                          <span>{doc.hospital}</span>
                        </p>
                      </div>
                    </div>
                    <Badge variant="accent" className="text-xs">
                      {doc.specialization}
                    </Badge>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3 w-3" />
                      <span>{doc.phone}</span>
                    </div>
                    <Link
                      href={`/doctors/${docId}`}
                      className="inline-flex items-center gap-1 font-medium text-primary hover:text-primary-hover p-1"
                    >
                      <span>Details</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            }}
          />

          {/* Pagination Controls */}
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

      {/* Bulk Delete Dialog */}
      <DoctorBulkDeleteDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        selectedIds={Array.from(selectedDoctorIds)}
        onSuccess={() => setSelectedDoctorIds(new Set())}
      />
    </div>
  );
}

export default function DoctorsPage() {
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
      <DoctorsPageContent />
    </React.Suspense>
  );
}
