import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Filter, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { RateTypeResponse, rateTypesApi } from '../../api/rateType.api';
import { useRateTypes } from '../../hooks/useRateTypes';
import { useRateTypeFilters } from '../../hooks/useRateTypeFilters';
import { Pagination } from '@/components/ui/pagination';

interface RateTypeListProps {
  onEdit?: (rateType: RateTypeResponse) => void;
  onDelete?: (rateType: RateTypeResponse) => void;
  onCreate?: () => void;
}

export function RateTypeList({ onEdit, onDelete, onCreate }: RateTypeListProps) {
  const {
    rateTypes,
    isLoading,
    currentPage,
    totalPages,
    totalElements,
    handlePageChange,
    refreshCurrentPage
  } = useRateTypes({ enablePagination: true });

  // For client-side filtering, we use all data but show paginated results
  const { filters, updateFilter, clearFilters, filteredRateTypes, hasActiveFilters } = useRateTypeFilters(rateTypes);

  const handleDelete = async (rateType: RateTypeResponse) => {
    if (!window.confirm(`Are you sure you want to delete rate type "${rateType.name}"?`)) {
      return;
    }

    try {
      await rateTypesApi.delete(rateType.id);
      toast.success('Rate type deleted successfully');
      refreshCurrentPage();
      onDelete?.(rateType);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete rate type');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-muted-foreground">Loading rate types...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Rate Types</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredRateTypes.length} of {totalElements} rate type{totalElements !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by code, name, or description..."
              value={filters.name}
              onChange={(e) => updateFilter('name', e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
              Clear Filters
            </Button>
          )}
        </div>

        {/* Table */}
        {filteredRateTypes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No rate types found</p>
            {onCreate && (
              <Button variant="outline" className="mt-4" onClick={onCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Rate Type
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRateTypes.map((rateType) => (
                  <TableRow key={rateType.id}>
                    <TableCell className="font-mono text-sm">{rateType.code}</TableCell>
                    <TableCell>
                      <div className="font-medium">{rateType.name}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {rateType.description ? (
                        <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                          {rateType.description}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge
                        variant={rateType.status === 'ACTIVE' ? 'default' : 'secondary'}
                      >
                        {rateType.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(rateType)}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(rateType)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showPageNumbers={false}
          />
        )}
      </CardContent>
    </Card>
  );
}
