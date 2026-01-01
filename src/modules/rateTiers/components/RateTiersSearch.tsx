import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Filter, X} from 'lucide-react';
import {RateTierFilters} from '../hooks/useRateTierFilters';

interface RateTiersSearchProps {
  filters: RateTierFilters;
  onUpdateFilter: <K extends keyof RateTierFilters>(key: K, value: RateTierFilters[K]) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function RateTiersSearch({
  filters,
  onUpdateFilter,
  onClearFilters,
  hasActiveFilters
}: RateTiersSearchProps) {
  return (
    <>
      {/* Basic Search */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <Button
          variant="outline"
          onClick={() => onUpdateFilter('showAdvancedFilters', !filters.showAdvancedFilters)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Advanced Filter
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" onClick={onClearFilters} className="text-muted-foreground">
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Advanced Filter */}
      {filters.showAdvancedFilters && (
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <Input
            placeholder="Min Nights"
            type="number"
            value={filters.minNights}
            onChange={(e) => onUpdateFilter('minNights', e.target.value)}
          />
          <Input
            placeholder="Max Nights"
            type="number"
            value={filters.maxNights}
            onChange={(e) => onUpdateFilter('maxNights', e.target.value)}
          />
          <Select
            value={filters.adjustmentType}
            onValueChange={(value) => onUpdateFilter('adjustmentType', value)}
          >
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="PERCENTAGE">Percentage</SelectItem>
              <SelectItem value="FIXED">Fixed</SelectItem>
              <SelectItem value="MULTIPLIER">Multiplier</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Min Adjustment Value"
            type="number"
            step="0.01"
            value={filters.minAdjustmentValue}
            onChange={(e) => onUpdateFilter('minAdjustmentValue', e.target.value)}
          />
          <Input
            placeholder="Max Adjustment Value"
            type="number"
            step="0.01"
            value={filters.maxAdjustmentValue}
            onChange={(e) => onUpdateFilter('maxAdjustmentValue', e.target.value)}
          />
          <Input
            placeholder="Priority"
            type="number"
            value={filters.priority}
            onChange={(e) => onUpdateFilter('priority', e.target.value)}
          />
          <Select
            value={filters.status}
            onValueChange={(value) => onUpdateFilter('status', value)}
          >
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </>
  );
}
