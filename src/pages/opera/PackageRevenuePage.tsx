import { PackageRevenueAnalytics } from "@/components/rate/PackageRevenueAnalytics";

export default function PackageRevenuePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Package Revenue Analytics</h1>
          <p className="text-muted-foreground">
            Detailed revenue analysis and profitability metrics for packages
          </p>
        </div>
      </div>

      <PackageRevenueAnalytics />
    </div>
  );
}
