import {useEffect, useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Badge} from '@/components/ui/badge';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Edit, Filter, Plus, Search, Trash2} from 'lucide-react';
import {rateCategoryApi, RateCategoryResponse} from '@/api/rateCategory';
import {toast} from 'sonner';

interface RateCategoryListProps {
  onEdit?: (category: RateCategoryResponse) => void;
  onDelete?: (category: RateCategoryResponse) => void;
  onCreate?: () => void;
}

export function RateCategoryList({ onEdit, onDelete, onCreate }: RateCategoryListProps) {
  const [categories, setCategories] = useState<RateCategoryResponse[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<RateCategoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [searchTerm, filterStatus, categories]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await rateCategoryApi.getAllRateCategories(0, 1000);
      setCategories(data.content);
    } catch (error) {
      console.error('Failed to load rate categories', error);
      toast.error('Failed to load rate categories');
    } finally {
      setIsLoading(false);
    }
  };

  const filterCategories = () => {
    let filtered = [...categories];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        cat =>
          cat.code?.toLowerCase().includes(term) ||
          cat.name?.toLowerCase().includes(term) ||
          cat.description?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(cat => {
        if (filterStatus === 'active') return cat.status === 'ACTIVE';
        if (filterStatus === 'inactive') return cat.status === 'INACTIVE';
        return true;
      });
    }

    setFilteredCategories(filtered);
  };

  const handleDelete = async (category: RateCategoryResponse) => {
    if (!window.confirm(`Are you sure you want to delete rate category "${category.name}"?`)) {
      return;
    }

    try {
      await rateCategoryApi.deleteRateCategory(category.id);
      toast.success('Rate category deleted successfully');
      loadData();
      onDelete?.(category);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete rate category');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-muted-foreground">Loading rate categories...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Rate Categories</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredCategories.length} of {categories.length} category(ies)
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No rate categories found</p>
            {onCreate && (
              <Button variant="outline" className="mt-4" onClick={onCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Rate Category
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
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-mono text-sm">{category.code}</TableCell>
                    <TableCell>
                      <div className="font-medium">{category.name}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {category.description ? (
                        <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                          {category.description}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge
                        variant={category.status === 'ACTIVE' ? 'default' : 'secondary'}
                      >
                        {category.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(category)}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(category)}
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









