import { PageHeader } from "@/components/shared/PageHeader";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Clinical analytics and system overview"
      />
      <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Dashboard analytics and visualization charts initializing...
        </p>
      </div>
    </div>
  );
}
