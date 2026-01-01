import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Filter, X} from 'lucide-react';
import {ComponentFilters} from '../hooks/useComponentFilters';
import {COMPONENT_TYPES} from '../api/packageComponents.api';

interface PackageComponentSearchProps {
  filters: ComponentFilters;
  onUpdateFilter: <K extends keyof ComponentFilters>(key: K, value: ComponentFilters[K]) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function PackageComponentSearch({
  filters,
  onUpdateFilter,
  onClearFilters,
  hasActiveFilters
}: PackageComponentSearchProps) {
  return (
    <>
      {/* Basic Search */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <Input
          placeholder="Search by Name"
          value={filters.searchName}
          onChange={(e) => onUpdateFilter('searchName', e.target.value)}
        />
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
            placeholder="Search by Code"
            value={filters.searchCode}
            onChange={(e) => onUpdateFilter('searchCode', e.target.value)}
          />
          <Input
            placeholder="Search by Description"
            value={filters.searchDescription}
            onChange={(e) => onUpdateFilter('searchDescription', e.target.value)}
          />
          <Select
            value={filters.componentType}
            onValueChange={(value) => onUpdateFilter('componentType', value)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {COMPONENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.isIncluded}
            onValueChange={(value) => onUpdateFilter('isIncluded', value)}
          >
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Included?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="included">Included</SelectItem>
              <SelectItem value="not-included">Not Included</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Min Unit Price"
            type="number"
            value={filters.minUnitPrice}
            onChange={(e) => onUpdateFilter('minUnitPrice', e.target.value)}
          />
          <Input
            placeholder="Max Unit Price"
            type="number"
            value={filters.maxUnitPrice}
            onChange={(e) => onUpdateFilter('maxUnitPrice', e.target.value)}
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
