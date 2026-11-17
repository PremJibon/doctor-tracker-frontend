import { PageHeader } from "@/components/shared/PageHeader";

export default function PatientsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Patients Directory"
        description="Comprehensive clinical patient roster and diagnostic records"
      />
      <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Patient records and condition filters initializing...
        </p>
      </div>
    </div>
  );
}
