import {useEffect, useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Badge} from '@/components/ui/badge';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Edit, Eye, Filter, Plus, Search, Trash2} from 'lucide-react';
import {ratePlanApi, RatePlanResponse} from '@/api/ratePlan';
import {rateTypeApi, RateTypeResponse} from '@/api/rateType';
import {toast} from 'sonner';
import {format} from 'date-fns';

interface RatePlanListProps {
  onEdit?: (ratePlan: RatePlanResponse) => void;
  onView?: (ratePlan: RatePlanResponse) => void;
  onDelete?: (ratePlan: RatePlanResponse) => void;
  onCreate?: () => void;
}

export function RatePlanList({ onEdit, onView, onDelete, onCreate }: RatePlanListProps) {
  const [ratePlans, setRatePlans] = useState<RatePlanResponse[]>([]);
  const [filteredRatePlans, setFilteredRatePlans] = useState<RatePlanResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRateType, setFilterRateType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [rateTypes, setRateTypes] = useState<RateTypeResponse[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterRatePlans();
  }, [searchTerm, filterRateType, filterStatus, ratePlans]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [ratePlansData, rateTypesData] = await Promise.all([
        ratePlanApi.getAllRatePlans(0, 1000),
        rateTypeApi.getAllRateTypes(0, 1000)
      ]);
      setRatePlans(ratePlansData.content);
      setRateTypes(rateTypesData.content);
    } catch (error) {
      console.error('Failed to load rate plans', error);
      toast.error('Failed to load rate plans');
    } finally {
      setIsLoading(false);
    }
  };

  const filterRatePlans = () => {
    let filtered = [...ratePlans];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        rp =>
          rp.code?.toLowerCase().includes(term) ||
          rp.name?.toLowerCase().includes(term) ||
          rp.description?.toLowerCase().includes(term)
      );
    }

    // Rate type filter
    if (filterRateType !== 'all') {
      filtered = filtered.filter(rp => rp.rateType?.id.toString() === filterRateType);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(rp => {
        if (filterStatus === 'active') return rp.status === 'ACTIVE';
        if (filterStatus === 'inactive') return rp.status === 'INACTIVE';
        return true;
      });
    }

    setFilteredRatePlans(filtered);
  };

  const handleDelete = async (ratePlan: RatePlanResponse) => {
    if (!window.confirm(`Are you sure you want to delete rate plan "${ratePlan.name}"?`)) {
      return;
    }

    try {
      await ratePlanApi.deleteRatePlan(ratePlan.id);
      toast.success('Rate plan deleted successfully');
      loadData();
      onDelete?.(ratePlan);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete rate plan');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-muted-foreground">Loading rate plans...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Rate Plans</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredRatePlans.length} of {ratePlans.length} rate plans
            </p>
          </div>
          {onCreate && (
            <Button onClick={onCreate} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Create Rate Plan
            </Button>
          )}
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
          <Select value={filterRateType} onValueChange={setFilterRateType}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Rate Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rate Types</SelectItem>
              {rateTypes.map((rt) => (
                <SelectItem key={rt.id} value={rt.id.toString()}>
                  {rt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[200px]">
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
        {filteredRatePlans.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No rate plans found</p>
            {onCreate && (
              <Button variant="outline" className="mt-4" onClick={onCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Rate Plan
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
                  <TableHead>Rate Type</TableHead>
                  <TableHead className="hidden md:table-cell">Validity</TableHead>
                  <TableHead className="hidden lg:table-cell">Settings</TableHead>
                  <TableHead className="hidden lg:table-cell">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRatePlans.map((ratePlan) => (
                  <TableRow key={ratePlan.id}>
                    <TableCell className="font-mono text-sm">{ratePlan.code}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{ratePlan.name}</div>
                        {ratePlan.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {ratePlan.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {ratePlan.rateType ? (
                        <Badge variant="outline">{ratePlan.rateType.name}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {ratePlan.validFrom || ratePlan.validTo ? (
                        <div className="text-sm">
                          {ratePlan.validFrom && (
                            <div>From: {format(new Date(ratePlan.validFrom), 'MMM dd, yyyy')}</div>
                          )}
                          {ratePlan.validTo && (
                            <div>To: {format(new Date(ratePlan.validTo), 'MMM dd, yyyy')}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No limit</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {ratePlan.isDefault && (
                          <Badge variant="default" className="text-xs">Default</Badge>
                        )}
                        {ratePlan.isPublic && (
                          <Badge variant="secondary" className="text-xs">Public</Badge>
                        )}
                        {ratePlan.isPackage && (
                          <Badge variant="outline" className="text-xs">Package</Badge>
                        )}
                        {ratePlan.nonRefundable && (
                          <Badge variant="destructive" className="text-xs">Non-Refundable</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge
                        variant={ratePlan.status === 'ACTIVE' ? 'default' : 'secondary'}
                      >
                        {ratePlan.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {onView && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onView(ratePlan)}
                            className="h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(ratePlan)}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(ratePlan)}
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

