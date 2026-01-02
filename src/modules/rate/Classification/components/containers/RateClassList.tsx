import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Filter, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { RateClassResponse, rateClassesApi } from '../../api/rateClass.api';
import { useRateClasses } from '../../hooks/useRateClasses';
import { useRateClassFilters } from '../../hooks/useRateClassFilters';

interface RateClassListProps {
  onEdit?: (rateClass: RateClassResponse) => void;
  onDelete?: (rateClass: RateClassResponse) => void;
  onCreate?: () => void;
}

export function RateClassList({ onEdit, onDelete, onCreate }: RateClassListProps) {
  const { rateClasses, isLoading } = useRateClasses();
  const { filters, updateFilter, clearFilters, filteredRateClasses, hasActiveFilters } = useRateClassFilters(rateClasses);

  const handleDelete = async (rateClass: RateClassResponse) => {
    if (!window.confirm(`Are you sure you want to delete rate class "${rateClass.name}"?`)) {
      return;
    }

    try {
      await rateClassesApi.delete(rateClass.id);
      toast.success('Rate class deleted successfully');
      // Refresh the data
      const response = await rateClassesApi.getAll(0, 1000);
      setRateClasses(response.content);
      onDelete?.(rateClass);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete rate class');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-muted-foreground">Loading rate classes...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Rate Classes</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredRateClasses.length} of {rateClasses.length} rate class(es)
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
        {filteredRateClasses.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No rate classes found</p>
            {onCreate && (
              <Button variant="outline" className="mt-4" onClick={onCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Rate Class
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
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRateClasses.map((rateClass) => (
                  <TableRow key={rateClass.id}>
                    <TableCell className="font-mono text-sm">{rateClass.code}</TableCell>
                    <TableCell>
                      <div className="font-medium">{rateClass.name}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline">
                        {rateClass.rateCategoryName || rateClass.rateCategoryCode || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {rateClass.description ? (
                        <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                          {rateClass.description}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge
                        variant={rateClass.status === 'ACTIVE' ? 'default' : 'secondary'}
                      >
                        {rateClass.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(rateClass)}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(rateClass)}
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
      </CardContent>
    </Card>
  );
}
