import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RatePlanResponse, ComparisonField } from "../../hooks/useRatePlanComparison";
import { DifferenceHighlighter, DifferenceSummary } from "./DifferenceHighlighter";

interface RatePlanComparisonTableProps {
  selectedRatePlans: RatePlanResponse[];
  comparisonFields: ComparisonField[];
  fieldDifferences: Record<string, boolean>;
}

export function RatePlanComparisonTable({
  selectedRatePlans,
  comparisonFields,
  fieldDifferences,
}: RatePlanComparisonTableProps) {
  if (selectedRatePlans.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rate Plan Comparison</CardTitle>
          <CardDescription>
            Select rate plans above to see the comparison table
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No rate plans selected for comparison
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group fields by category for better organization
  const basicFields = comparisonFields.filter(field =>
    ['code', 'name', 'rateType', 'isDefault', 'isPublic', 'isPackage', 'status'].includes(field.key)
  );

  const classificationFields = comparisonFields.filter(field =>
    ['rateCategory', 'rateClass'].includes(field.key)
  );

  const validityFields = comparisonFields.filter(field =>
    ['validPeriod', 'viewedPeriod'].includes(field.key)
  );

  const restrictionFields = comparisonFields.filter(field =>
    ['minStayNights', 'requiresGuarantee', 'nonRefundable'].includes(field.key)
  );

  const renderFieldValue = (ratePlan: RatePlanResponse, field: ComparisonField) => {
    const rawValue = field.getValue(ratePlan);
    const displayValue = field.formatValue ? field.formatValue(rawValue) : rawValue;
    const hasDifference = fieldDifferences[field.key];

    return (
      <DifferenceHighlighter
        key={`${ratePlan.id}-${field.key}`}
        value={displayValue}
        fieldKey={field.key}
        hasDifference={hasDifference && field.isDifference}
        showIcon={false}
        className="justify-center"
      />
    );
  };

  const renderFieldRow = (field: ComparisonField) => (
    <TableRow key={field.key}>
      <TableHead className="font-medium w-48">
        {field.label}
        {field.isDifference && fieldDifferences[field.key] && (
          <Badge variant="outline" className="ml-2 text-xs">
            Differs
          </Badge>
        )}
      </TableHead>
      {selectedRatePlans.map((ratePlan) => (
        <TableCell key={ratePlan.id} className="text-center">
          {renderFieldValue(ratePlan, field)}
        </TableCell>
      ))}
    </TableRow>
  );

  const renderSection = (title: string, fields: ComparisonField[], showSummary = false) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        {showSummary && (
          <DifferenceSummary
            fieldDifferences={fieldDifferences}
            totalFields={fields.length}
          />
        )}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-48">Field</TableHead>
              {selectedRatePlans.map((ratePlan) => (
                <TableHead key={ratePlan.id} className="text-center min-w-48">
                  <div className="space-y-1">
                    <div className="font-semibold">{ratePlan.code}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {ratePlan.name}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {ratePlan.status}
                    </Badge>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map(renderFieldRow)}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Rate Plan Comparison</CardTitle>
            <CardDescription>
              Comparing {selectedRatePlans.length} rate plans side-by-side
            </CardDescription>
          </div>
          <DifferenceSummary
            fieldDifferences={fieldDifferences}
            totalFields={comparisonFields.filter(f => f.isDifference).length}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Basic Information */}
        {renderSection("Basic Information", basicFields)}

        <Separator />

        {/* Classification */}
        {renderSection("Classification", classificationFields)}

        <Separator />

        {/* Validity Periods */}
        {renderSection("Validity Periods", validityFields)}

        <Separator />

        {/* Restrictions & Policies */}
        {renderSection("Restrictions & Policies", restrictionFields, true)}

        {/* Summary Footer */}
        <div className="flex items-center justify-center pt-4 border-t">
          <div className="text-center text-sm text-muted-foreground">
            <p>Comparison completed for {selectedRatePlans.length} rate plans</p>
            <p className="mt-1">
              Fields highlighted in amber indicate differences between rate plans
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
