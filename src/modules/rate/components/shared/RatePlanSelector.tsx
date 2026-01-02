import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus, X, Search, CheckCircle, AlertCircle } from "lucide-react";
import { RatePlanResponse } from "../../RatePlan/api";
import { LoadingState } from "./LoadingState";

interface RatePlanSelectorProps {
  availableRatePlans: RatePlanResponse[];
  selectedRatePlans: RatePlanResponse[];
  onAddRatePlan: (ratePlan: RatePlanResponse) => void;
  onRemoveRatePlan: (ratePlanId: number) => void;
  onClearSelection: () => void;
  isLoadingAvailable: boolean;
  canAddMore: boolean;
  maxRatePlans: number;
  minRatePlans: number;
}

export function RatePlanSelector({
  availableRatePlans,
  selectedRatePlans,
  onAddRatePlan,
  onRemoveRatePlan,
  onClearSelection,
  isLoadingAvailable,
  canAddMore,
  maxRatePlans,
  minRatePlans,
}: RatePlanSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState<"all" | "rateType" | "category" | "class">("all");

  // Filter available rate plans based on search and filters
  const filteredRatePlans = availableRatePlans.filter(ratePlan => {
    const matchesSearch = !searchTerm ||
      ratePlan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ratePlan.code.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterBy === "all") return matchesSearch;

    switch (filterBy) {
      case "rateType":
        return matchesSearch && ratePlan.rateType?.name;
      case "category":
        return matchesSearch && ratePlan.rateCategoryName;
      case "class":
        return matchesSearch && ratePlan.rateClassName;
      default:
        return matchesSearch;
    }
  });

  // Group rate plans by filter criteria for better organization
  const groupedRatePlans = filteredRatePlans.reduce((groups, ratePlan) => {
    let groupKey = "Other";

    switch (filterBy) {
      case "rateType":
        groupKey = ratePlan.rateType?.name || "No Rate Type";
        break;
      case "category":
        groupKey = ratePlan.rateCategoryName || "No Category";
        break;
      case "class":
        groupKey = ratePlan.rateClassName || "No Class";
        break;
      default:
        groupKey = ratePlan.rateType?.name || "Other";
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(ratePlan);
    return groups;
  }, {} as Record<string, RatePlanResponse[]>);

  const isSelected = (ratePlanId: number) => selectedRatePlans.some(rp => rp.id === ratePlanId);

  if (isLoadingAvailable) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Rate Plans to Compare</CardTitle>
          <CardDescription>Loading available rate plans...</CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingState height="h-48" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Select Rate Plans to Compare
              <Badge variant="secondary">
                {selectedRatePlans.length}/{maxRatePlans}
              </Badge>
            </CardTitle>
            <CardDescription>
              Choose {minRatePlans}-{maxRatePlans} rate plans to compare side-by-side
            </CardDescription>
          </div>
          {selectedRatePlans.length > 0 && (
            <Button variant="outline" size="sm" onClick={onClearSelection}>
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected Rate Plans Summary */}
        {selectedRatePlans.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Selected for Comparison:</h4>
            <div className="flex flex-wrap gap-2">
              {selectedRatePlans.map((ratePlan) => (
                <Badge key={ratePlan.id} variant="default" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  {ratePlan.code} - {ratePlan.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => onRemoveRatePlan(ratePlan.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <Separator />
          </div>
        )}

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by code or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rate Plans</SelectItem>
              <SelectItem value="rateType">By Rate Type</SelectItem>
              <SelectItem value="category">By Category</SelectItem>
              <SelectItem value="class">By Class</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Available Rate Plans */}
        <ScrollArea className="h-96 border rounded-md p-4">
          {Object.keys(groupedRatePlans).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>No rate plans found matching your criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedRatePlans).map(([groupName, ratePlans]) => (
                <div key={groupName}>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    {groupName}
                    <Badge variant="outline" className="text-xs">
                      {ratePlans.length}
                    </Badge>
                  </h4>
                  <div className="grid gap-2">
                    {ratePlans.map((ratePlan) => {
                      const selected = isSelected(ratePlan.id);
                      return (
                        <div
                          key={ratePlan.id}
                          className={`flex items-center justify-between p-3 border rounded-md transition-colors ${
                            selected
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{ratePlan.code}</span>
                              <span className="text-muted-foreground">-</span>
                              <span className="text-sm truncate">{ratePlan.name}</span>
                              {selected && <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              {ratePlan.rateType?.name && (
                                <Badge variant="secondary" className="text-xs">
                                  {ratePlan.rateType.name}
                                </Badge>
                              )}
                              {ratePlan.rateCategoryName && (
                                <span>{ratePlan.rateCategoryName}</span>
                              )}
                              {ratePlan.status !== 'ACTIVE' && (
                                <Badge variant="destructive" className="text-xs">
                                  {ratePlan.status}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant={selected ? "outline" : "default"}
                            size="sm"
                            onClick={() => selected ? onRemoveRatePlan(ratePlan.id) : onAddRatePlan(ratePlan)}
                            disabled={!selected && !canAddMore}
                            className="ml-2 flex-shrink-0"
                          >
                            {selected ? (
                              <>
                                <X className="h-4 w-4 mr-1" />
                                Remove
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                              </>
                            )}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Status Messages */}
        {selectedRatePlans.length < minRatePlans && (
          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
            <AlertCircle className="h-4 w-4" />
            Select at least {minRatePlans} rate plans to enable comparison
          </div>
        )}
        {selectedRatePlans.length >= minRatePlans && selectedRatePlans.length <= maxRatePlans && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-md">
            <CheckCircle className="h-4 w-4" />
            Ready to compare {selectedRatePlans.length} rate plans
          </div>
        )}
      </CardContent>
    </Card>
  );
}
