import {PackagePerformanceDashboard} from "@/modules/rate";

export default function PackagePerformancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Package Performance</h1>
          <p className="text-muted-foreground">
            Monitor package performance with Opera-specific analytics
          </p>
        </div>
      </div>

      <PackagePerformanceDashboard />
    </div>
  );
}
