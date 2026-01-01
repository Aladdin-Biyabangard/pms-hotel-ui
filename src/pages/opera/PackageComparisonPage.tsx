import {PackageComparisonTool} from "@/components/rate/PackageComparisonTool";

export default function PackageComparisonPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Package Comparison</h1>
          <p className="text-muted-foreground">
            Compare packages side-by-side to find the best offerings
          </p>
        </div>
      </div>

      <PackageComparisonTool />
    </div>
  );
}
