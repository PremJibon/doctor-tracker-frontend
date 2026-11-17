import { PageHeader } from "@/components/shared/PageHeader";

export default function DoctorsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Doctors Directory"
        description="Manage clinical medical staff and specialized rosters"
      />
      <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Doctor directory and filters initializing...
        </p>
      </div>
    </div>
  );
}
