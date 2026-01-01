import {useEffect, useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Badge} from '@/components/ui/badge';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Edit, Filter, Plus, Search, Trash2} from 'lucide-react';
import {rateTypeApi, RateTypeResponse} from '@/api/rateType';
import {toast} from 'sonner';

interface RateTypeListProps {
  onEdit?: (rateType: RateTypeResponse) => void;
  onDelete?: (rateType: RateTypeResponse) => void;
  onCreate?: () => void;
}

export function RateTypeList({ onEdit, onDelete, onCreate }: RateTypeListProps) {
  const [rateTypes, setRateTypes] = useState<RateTypeResponse[]>([]);
  const [filteredRateTypes, setFilteredRateTypes] = useState<RateTypeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterRateTypes();
  }, [searchTerm, filterStatus, rateTypes]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await rateTypeApi.getAllRateTypes(0, 1000);
      setRateTypes(data.content);
    } catch (error) {
      console.error('Failed to load rate types', error);
      toast.error('Failed to load rate types');
    } finally {
      setIsLoading(false);
    }
  };

  const filterRateTypes = () => {
    let filtered = [...rateTypes];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        rt =>
          rt.code?.toLowerCase().includes(term) ||
          rt.name?.toLowerCase().includes(term) ||
          rt.description?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(rt => {
        if (filterStatus === 'active') return rt.status === 'ACTIVE';
        if (filterStatus === 'inactive') return rt.status === 'INACTIVE';
        return true;
      });
    }

    setFilteredRateTypes(filtered);
  };

  const handleDelete = async (rateType: RateTypeResponse) => {
    if (!window.confirm(`Are you sure you want to delete rate type "${rateType.name}"?`)) {
      return;
    }

    try {
      await rateTypeApi.deleteRateType(rateType.id);
      toast.success('Rate type deleted successfully');
      loadData();
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
              {filteredRateTypes.length} of {rateTypes.length} rate type(s)
            </p>
          </div>
          {/*{onCreate && (*/}
          {/*  <Button onClick={onCreate} className="w-full sm:w-auto">*/}
          {/*    <Plus className="h-4 w-4 mr-2" />*/}
          {/*    Create Rate Type*/}
          {/*  </Button>*/}
          {/*)}*/}
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
      </CardContent>
    </Card>
  );
}









