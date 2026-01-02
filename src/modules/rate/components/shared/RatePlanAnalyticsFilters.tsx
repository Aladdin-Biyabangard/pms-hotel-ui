import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, X } from 'lucide-react';
import { EntityStatus } from '@/types/enums';
import { RateTypeResponse } from '../../Classification/api/rateType';
import { RateCategoryResponse } from '../../Classification/api/rateCategory';
import { RateClassResponse } from '../../Classification/api/rateClass';

interface RatePlanAnalyticsFiltersProps {
  // Filter values
  rateTypeId?: number;
  rateCategoryId?: number;
  rateClassId?: number;
  status?: EntityStatus;
  dateRange?: { start: string; end: string };

  // Reference data
  rateTypes: RateTypeResponse[];
  rateCategories: RateCategoryResponse[];
  rateClasses: RateClassResponse[];

  // Callbacks
  onFiltersChange: (filters: {
    rateTypeId?: number;
    rateCategoryId?: number;
    rateClassId?: number;
    status?: EntityStatus;
    dateRange?: { start: string; end: string };
  }) => void;

  onRefresh: () => void;
  isLoading?: boolean;
}

export function RatePlanAnalyticsFilters({
  rateTypeId,
  rateCategoryId,
  rateClassId,
  status,
  dateRange,
  rateTypes,
  rateCategories,
  rateClasses,
  onFiltersChange,
  onRefresh,
  isLoading
}: RatePlanAnalyticsFiltersProps) {

  const updateFilter = (key: string, value: any) => {
    const newFilters = {
      rateTypeId,
      rateCategoryId,
      rateClassId,
      status,
      dateRange
    };

    if (value === 'all' || value === '') {
      (newFilters as any)[key] = undefined;
    } else {
      (newFilters as any)[key] = value;
    }

    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = rateTypeId || rateCategoryId || rateClassId || status || dateRange;

  const getActiveFilterCount = () => {
    let count = 0;
    if (rateTypeId) count++;
    if (rateCategoryId) count++;
    if (rateClassId) count++;
    if (status) count++;
    if (dateRange) count++;
    return count;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Filters</CardTitle>
            <CardDescription>
              Refine your rate plan analysis
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Badge variant="secondary">
                {getActiveFilterCount()} active
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={isLoading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Primary Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Rate Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Rate Type</label>
            <Select
              value={rateTypeId?.toString() || 'all'}
              onValueChange={(value) => updateFilter('rateTypeId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Rate Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rate Types</SelectItem>
                {rateTypes.map(type => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select
              value={rateCategoryId?.toString() || 'all'}
              onValueChange={(value) => updateFilter('rateCategoryId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {rateCategories.map(category => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Class */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Class</label>
            <Select
              value={rateClassId?.toString() || 'all'}
              onValueChange={(value) => updateFilter('rateClassId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {rateClasses.map(rateClass => (
                  <SelectItem key={rateClass.id} value={rateClass.id.toString()}>
                    {rateClass.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={status || 'all'}
              onValueChange={(value) => updateFilter('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Date Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Date Range (Validity Period)</label>
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange?.start || ''}
              onChange={(e) => updateFilter('dateRange', {
                ...dateRange,
                start: e.target.value
              })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <span className="flex items-center text-muted-foreground">to</span>
            <input
              type="date"
              value={dateRange?.end || ''}
              onChange={(e) => updateFilter('dateRange', {
                ...dateRange,
                end: e.target.value
              })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
              Clear all filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
