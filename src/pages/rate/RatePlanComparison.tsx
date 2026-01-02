import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, GitCompare } from "lucide-react";
import { RatePlanPageLayout } from "@/modules/rate/components/shared";
import { useRatePlanComparison } from "@/modules/rate/hooks";
import { RatePlanSelector } from "@/modules/rate/components/shared/RatePlanSelector";
import { RatePlanComparisonTable } from "@/modules/rate/components/shared/RatePlanComparisonTable";

export default function RatePlanComparison() {
  const navigate = useNavigate();
  const {
    selectedRatePlans,
    availableRatePlans,
    isLoadingAvailable,
    addRatePlan,
    removeRatePlan,
    clearSelection,
    canAddMore,
    canCompare,
    comparisonFields,
    fieldDifferences,
    maxRatePlans,
    minRatePlans,
  } = useRatePlanComparison();

  return (
    <RatePlanPageLayout
      title="Rate Plan Comparison"
      subtitle="Compare multiple rate plans side-by-side to identify differences and similarities"
      isLoading={false}
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => navigate("/rate-management")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Rate Management
          </Button>
          <div className="flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">
              Comparing {selectedRatePlans.length} of {maxRatePlans} rate plans
            </span>
          </div>
        </div>

        {/* Rate Plan Selector */}
        <RatePlanSelector
          availableRatePlans={availableRatePlans}
          selectedRatePlans={selectedRatePlans}
          onAddRatePlan={addRatePlan}
          onRemoveRatePlan={removeRatePlan}
          onClearSelection={clearSelection}
          isLoadingAvailable={isLoadingAvailable}
          canAddMore={canAddMore}
          maxRatePlans={maxRatePlans}
          minRatePlans={minRatePlans}
        />

        {/* Comparison Table - Only show when we have enough rate plans */}
        {canCompare && (
          <RatePlanComparisonTable
            selectedRatePlans={selectedRatePlans}
            comparisonFields={comparisonFields}
            fieldDifferences={fieldDifferences}
          />
        )}

        {/* Instructions when not enough rate plans selected */}
        {!canCompare && selectedRatePlans.length > 0 && (
          <div className="text-center py-12">
            <GitCompare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Select More Rate Plans
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              You need to select at least {minRatePlans} rate plans to enable comparison.
              Currently selected: {selectedRatePlans.length} of {minRatePlans} required.
            </p>
          </div>
        )}

        {/* Empty state when no rate plans selected */}
        {selectedRatePlans.length === 0 && !isLoadingAvailable && (
          <div className="text-center py-12">
            <GitCompare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No Rate Plans Selected
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Use the selector above to choose rate plans for comparison.
              You can compare up to {maxRatePlans} rate plans at once.
            </p>
          </div>
        )}
      </div>
    </RatePlanPageLayout>
  );
}
