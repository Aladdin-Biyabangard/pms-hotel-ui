import {useEffect, useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Badge} from '@/components/ui/badge';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Edit, Eye, Filter, Plus, Search, Trash2} from 'lucide-react';
import {rateOverrideApi, RateOverrideResponse} from '@/api/rateOverride';
import {ratePlanApi, RatePlanResponse} from '@/api/ratePlan';
import {roomTypeApi, RoomTypeResponse} from '@/api/roomType';
import {toast} from 'sonner';
import {format} from 'date-fns';

interface OverrideListProps {
  onEdit?: (override: RateOverrideResponse) => void;
  onView?: (override: RateOverrideResponse) => void;
  onDelete?: (override: RateOverrideResponse) => void;
  onCreate?: () => void;
}

export function OverrideList({ onEdit, onView, onDelete, onCreate }: OverrideListProps) {
  const [overrides, setOverrides] = useState<RateOverrideResponse[]>([]);
  const [filteredOverrides, setFilteredOverrides] = useState<RateOverrideResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRatePlan, setFilterRatePlan] = useState<string>('all');
  const [filterRoomType, setFilterRoomType] = useState<string>('all');
  const [filterOverrideType, setFilterOverrideType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [ratePlans, setRatePlans] = useState<RatePlanResponse[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterOverrides();
  }, [searchTerm, filterRatePlan, filterRoomType, filterOverrideType, filterStatus, overrides]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [overridesData, ratePlansData, roomTypesData] = await Promise.all([
        rateOverrideApi.getAllRateOverrides(0, 1000),
        ratePlanApi.getAllRatePlans(0, 1000),
        roomTypeApi.getAllRoomTypes(0, 1000)
      ]);
      setOverrides(overridesData.content);
      setRatePlans(ratePlansData.content);
      setRoomTypes(roomTypesData.content);
    } catch (error) {
      console.error('Failed to load overrides', error);
      toast.error('Failed to load overrides');
    } finally {
      setIsLoading(false);
    }
  };

  const filterOverrides = () => {
    let filtered = [...overrides];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        ov =>
          ov.ratePlanName?.toLowerCase().includes(term) ||
          ov.roomTypeName?.toLowerCase().includes(term) ||
          ov.reason?.toLowerCase().includes(term) ||
          ov.overrideType?.toLowerCase().includes(term)
      );
    }

    // Rate plan filter
    if (filterRatePlan !== 'all') {
      filtered = filtered.filter(ov => ov.ratePlanId.toString() === filterRatePlan);
    }

    // Room type filter
    if (filterRoomType !== 'all') {
      if (filterRoomType === 'none') {
        filtered = filtered.filter(ov => !ov.roomTypeId);
      } else {
        filtered = filtered.filter(ov => ov.roomTypeId?.toString() === filterRoomType);
      }
    }

    // Override type filter
    if (filterOverrideType !== 'all') {
      filtered = filtered.filter(ov => ov.overrideType === filterOverrideType);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(ov => {
        if (filterStatus === 'active') return ov.status === 'ACTIVE';
        if (filterStatus === 'inactive') return ov.status === 'INACTIVE';
        return true;
      });
    }

    setFilteredOverrides(filtered);
  };

  const handleDelete = async (override: RateOverrideResponse) => {
    if (!window.confirm(`Are you sure you want to delete override for "${override.ratePlanName}" on ${format(new Date(override.overrideDate), 'MMM dd, yyyy')}?`)) {
      return;
    }

    try {
      await rateOverrideApi.deleteRateOverride(override.id);
      toast.success('Override deleted successfully');
      loadData();
      onDelete?.(override);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete override');
    }
  };

  const getOverrideTypeBadge = (type: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      FIXED: { variant: 'default', label: 'Fixed' },
      PERCENTAGE: { variant: 'secondary', label: 'Percentage' },
      DISCOUNT: { variant: 'outline', label: 'Discount' },
      SURCHARGE: { variant: 'destructive', label: 'Surcharge' },
    };
    return variants[type] || { variant: 'outline' as const, label: type };
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-muted-foreground">Loading overrides...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Rate Overrides</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredOverrides.length} of {overrides.length} override(s)
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
              placeholder="Search by rate plan, room type, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterRatePlan} onValueChange={setFilterRatePlan}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Rate Plans" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rate Plans</SelectItem>
              {ratePlans.map((rp) => (
                <SelectItem key={rp.id} value={rp.id.toString()}>
                  {rp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterRoomType} onValueChange={setFilterRoomType}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Room Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Room Types</SelectItem>
              <SelectItem value="none">No Room Type (All)</SelectItem>
              {roomTypes.map((rt) => (
                <SelectItem key={rt.id} value={rt.id.toString()}>
                  {rt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterOverrideType} onValueChange={setFilterOverrideType}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="FIXED">Fixed</SelectItem>
              <SelectItem value="PERCENTAGE">Percentage</SelectItem>
              <SelectItem value="DISCOUNT">Discount</SelectItem>
              <SelectItem value="SURCHARGE">Surcharge</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[120px]">
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
        {filteredOverrides.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No overrides found</p>
            {onCreate && (
              <Button variant="outline" className="mt-4" onClick={onCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Override
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Date</TableHead>
                  <TableHead>Rate Plan</TableHead>
                  <TableHead className="hidden md:table-cell">Room Type</TableHead>
                  <TableHead className="hidden lg:table-cell">Type</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="hidden lg:table-cell">Reason</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOverrides.map((override) => {
                  const typeBadge = getOverrideTypeBadge(override.overrideType);
                  return (
                    <TableRow key={override.id}>
                      <TableCell className="font-medium">
                        {format(new Date(override.overrideDate), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{override.ratePlanName}</div>
                          <div className="text-sm text-muted-foreground">{override.ratePlanCode}</div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {override.roomTypeName ? (
                          <div>
                            <div className="font-medium">{override.roomTypeName}</div>
                            <div className="text-sm text-muted-foreground">{override.roomTypeCode}</div>
                          </div>
                        ) : (
                          <Badge variant="outline">All Room Types</Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {override.overrideType === 'PERCENTAGE' 
                          ? `${override.overrideValue}%`
                          : `$${override.overrideValue.toFixed(2)}`
                        }
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {override.reason ? (
                          <div className="max-w-[200px] truncate text-sm text-muted-foreground" title={override.reason}>
                            {override.reason}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge
                          variant={override.status === 'ACTIVE' ? 'default' : 'secondary'}
                        >
                          {override.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          {onView && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onView(override)}
                              className="h-8 w-8"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {onEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(override)}
                              className="h-8 w-8"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(override)}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

