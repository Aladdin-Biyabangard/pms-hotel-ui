import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Eye, Filter, Plus, Trash2, X } from 'lucide-react';
import { COMPONENT_TYPES, ratePackageComponentApi, RatePackageComponentResponse } from '@/api/ratePackageComponent';
import { ratePlanApi, RatePlanResponse } from '@/api/ratePlan';
import { toast } from 'sonner';
import { EditPackageComponentDialog } from './EditPackageComponentDialog';
import { ViewPackageComponentDialog } from './ViewPackageComponentDialog';

interface PackageComponentListProps {
  ratePlanId?: number;
  onDelete?: (component: RatePackageComponentResponse) => void;
  onCreate?: () => void;
}

export function PackageComponentList({
                                       ratePlanId,
                                       onDelete,
                                       onCreate
                                     }: PackageComponentListProps) {
  const [components, setComponents] = useState<RatePackageComponentResponse[]>([]);
  const [filteredComponents, setFilteredComponents] = useState<RatePackageComponentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [editingComponent, setEditingComponent] = useState<RatePackageComponentResponse | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewingComponent, setViewingComponent] = useState<RatePackageComponentResponse | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const [searchName, setSearchName] = useState('');
  const [searchCode, setSearchCode] = useState('');
  const [searchDescription, setSearchDescription] = useState('');

  const [selectedRatePlan, setSelectedRatePlan] = useState<number | undefined>(ratePlanId);
  const [filterComponentType, setFilterComponentType] = useState<string>('all');
  const [filterIsIncluded, setFilterIsIncluded] = useState<string>('all');
  const [minUnitPrice, setMinUnitPrice] = useState<string>('');
  const [maxUnitPrice, setMaxUnitPrice] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [ratePlans, setRatePlans] = useState<RatePlanResponse[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedRatePlan) {
      loadComponents();
    } else {
      setComponents([]);
      setFilteredComponents([]);
    }
  }, [selectedRatePlan]);


  const loadInitialData = async () => {
    try {
      const ratePlansData = await ratePlanApi.getAllRatePlans(0, 1000);
      setRatePlans(ratePlansData.content);
    } catch (error) {
      toast.error('Failed to load rate plans');
    }
  };

  const loadComponents = async () => {
    if (!selectedRatePlan) return;

    setIsLoading(true);
    try {
      const data = await ratePackageComponentApi.getAllRatePackageComponents(0, 50, {
        ratePlanId: selectedRatePlan ,
        componentName: searchName || undefined,
        componentCode: searchCode || undefined,
        componentType: filterComponentType !== 'all' ? filterComponentType : undefined,
        isIncluded:
            filterIsIncluded === 'included'
                ? true
                : filterIsIncluded === 'not-included'
                    ? false
                    : undefined,
        minUnitPrice: minUnitPrice ? parseFloat(minUnitPrice) : undefined,
        maxUnitPrice: maxUnitPrice ? parseFloat(maxUnitPrice) : undefined,
        status: filterStatus !== 'all' ? (filterStatus as any) : undefined
      });
      setComponents(data.content);
      setFilteredComponents(data.content);
    } catch (error) {
      console.error('Failed to load package components', error);
      toast.error('Failed to load package components');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (component: RatePackageComponentResponse) => {
    setEditingComponent(component);
    setEditDialogOpen(true);
  };

  const handleView = (component: RatePackageComponentResponse) => {
    setViewingComponent(component);
    setViewDialogOpen(true);
  };

  const handleEditSuccess = () => {
    loadComponents(); // Reload the list after successful edit
  };

  const filterComponents = () => {
    let filtered = [...components];

    if (searchName.trim()) {
      const term = searchName.toLowerCase();
      filtered = filtered.filter((comp) => comp.componentName?.toLowerCase().includes(term));
    }

    if (searchCode.trim()) {
      const term = searchCode.toLowerCase();
      filtered = filtered.filter((comp) => comp.componentCode?.toLowerCase().includes(term));
    }

    if (searchDescription.trim()) {
      const term = searchDescription.toLowerCase();
      filtered = filtered.filter((comp) => comp.description?.toLowerCase().includes(term));
    }

    if (filterComponentType !== 'all') {
      filtered = filtered.filter((comp) => comp.componentType === filterComponentType);
    }

    if (filterIsIncluded !== 'all') {
      filtered = filtered.filter((comp) => {
        if (filterIsIncluded === 'included') return comp.isIncluded === true;
        if (filterIsIncluded === 'not-included') return comp.isIncluded === false;
        return true;
      });
    }

    if (minUnitPrice) {
      filtered = filtered.filter(
          (comp) => comp.unitPrice !== undefined && comp.unitPrice >= parseFloat(minUnitPrice)
      );
    }

    if (maxUnitPrice) {
      filtered = filtered.filter(
          (comp) => comp.unitPrice !== undefined && comp.unitPrice <= parseFloat(maxUnitPrice)
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((comp) => comp.status === filterStatus);
    }

    setFilteredComponents(filtered);
  };

  const handleDelete = async (component: RatePackageComponentResponse) => {
    if (!window.confirm(`Are you sure you want to delete component "${component.componentName}"?`)) return;

    try {
      await ratePackageComponentApi.deleteRatePackageComponent(component.id);
      toast.success('Package component deleted successfully');
      loadComponents();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete package component');
    }
  };

  const getComponentTypeBadge = (type: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      SERVICE: { variant: 'default', label: 'Service' },
      MEAL: { variant: 'secondary', label: 'Meal' },
      ACTIVITY: { variant: 'outline', label: 'Activity' },
      TRANSPORTATION: { variant: 'outline', label: 'Transportation' },
      AMENITY: { variant: 'secondary', label: 'Amenity' },
      DISCOUNT: { variant: 'destructive', label: 'Discount' },
      OTHER: { variant: 'outline', label: 'Other' }
    };
    return variants[type] || { variant: 'outline' as const, label: type };
  };

  if (isLoading) {
    return (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8 text-muted-foreground">Loading package components...</div>
          </CardContent>
        </Card>
    );
  }

  return (
      <>
        <EditPackageComponentDialog
          component={editingComponent}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={handleEditSuccess}
        />
        <ViewPackageComponentDialog
          component={viewingComponent}
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
        />
        <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Package Components</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredComponents.length} of {components.length} component(s) for selected rate plan
              </p>
            </div>
            <div className="flex gap-2">
              {!ratePlanId && (
                  <Select value={selectedRatePlan?.toString() || ''} onValueChange={(v) => setSelectedRatePlan(v ? parseInt(v) : undefined)}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Select Rate Plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {ratePlans.filter((rp) => rp.isPackage).map((rp) => (
                          <SelectItem key={rp.id} value={rp.id.toString()}>
                            {rp.name}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              )}
              <Button variant="outline" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!selectedRatePlan ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>Please select a rate plan to view package components</p>
                <p className="text-sm mt-2">Note: Only package rate plans are shown</p>
              </div>
          ) : (
              <>
                {/* Basic Search */}
                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                  <Input placeholder="Search by Name" value={searchName} onChange={(e) => setSearchName(e.target.value)} />
                </div>

                {/* Advanced Filter */}
                {showAdvancedFilters && (
                    <div className="flex flex-col sm:flex-row gap-2 mb-4">
                      <Input placeholder="Search by Code" value={searchCode} onChange={(e) => setSearchCode(e.target.value)} />
                      <Input
                          placeholder="Search by Description"
                          value={searchDescription}
                          onChange={(e) => setSearchDescription(e.target.value)}
                      />
                      <Select value={filterComponentType} onValueChange={setFilterComponentType}>
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
                      <Select value={filterIsIncluded} onValueChange={setFilterIsIncluded}>
                        <SelectTrigger className="w-full sm:w-[150px]">
                          <SelectValue placeholder="Included?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="included">Included</SelectItem>
                          <SelectItem value="not-included">Not Included</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input placeholder="Min Unit Price" type="number" value={minUnitPrice} onChange={(e) => setMinUnitPrice(e.target.value)} />
                      <Input placeholder="Max Unit Price" type="number" value={maxUnitPrice} onChange={(e) => setMaxUnitPrice(e.target.value)} />
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
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

                {/* Table */}
                {filteredComponents.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>No package components found</p>
                      {onCreate && (
                          <Button variant="outline" className="mt-4" onClick={onCreate}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Component
                          </Button>
                      )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Component Name</TableHead>
                            <TableHead className="hidden md:table-cell">Type</TableHead>
                            <TableHead className="hidden lg:table-cell">Code</TableHead>
                            <TableHead className="text-right">Quantity</TableHead>
                            <TableHead className="text-right">Unit Price</TableHead>
                            <TableHead className="hidden lg:table-cell">Adult Price</TableHead>
                            <TableHead className="hidden lg:table-cell">Child Price</TableHead>
                            <TableHead className="hidden md:table-cell">Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredComponents.map((component) => {
                            const typeBadge = getComponentTypeBadge(component.componentType);
                            const totalPrice = component.unitPrice && component.quantity ? component.unitPrice * component.quantity : component.unitPrice || 0;

                            return (
                                <TableRow key={component.id}>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium">{component.componentName}</div>
                                      {component.description && (
                                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">{component.description}</div>
                                      )}
                                      <div className="flex items-center gap-2 mt-1">
                                        {component.isIncluded ? (
                                            <Badge variant="default" className="text-xs">Included</Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-xs">Additional</Badge>
                                        )}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="hidden md:table-cell">
                                    <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>
                                  </TableCell>
                                  <TableCell className="hidden lg:table-cell">
                                    {component.componentCode || <span className="text-muted-foreground">-</span>}
                                  </TableCell>
                                  <TableCell className="text-right">{component.quantity || 1}</TableCell>
                                  <TableCell className="text-right">
                                    {component.unitPrice ? (
                                        <div>
                                          <div className="font-semibold">${component.unitPrice.toFixed(2)}</div>
                                          {component.quantity && component.quantity > 1 && (
                                              <div className="text-xs text-muted-foreground">Total: ${totalPrice.toFixed(2)}</div>
                                          )}
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground">Free</span>
                                    )}
                                  </TableCell>
                                  <TableCell className="hidden lg:table-cell text-right">
                                    {component.priceAdult ? <span className="font-semibold">${component.priceAdult.toFixed(2)}</span> : <span className="text-muted-foreground">-</span>}
                                  </TableCell>
                                  <TableCell className="hidden lg:table-cell text-right">
                                    {component.priceChild ? <span className="font-semibold">${component.priceChild.toFixed(2)}</span> : <span className="text-muted-foreground">-</span>}
                                  </TableCell>
                                  <TableCell className="hidden md:table-cell">
                                    <Badge variant={component.status === 'ACTIVE' ? 'default' : 'secondary'}>{component.status}</Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex justify-end gap-2">
                                      <Button variant="ghost" size="icon" onClick={() => handleView(component)} className="h-8 w-8" title="View Details">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="icon" onClick={() => handleEdit(component)} className="h-8 w-8" title="Edit">
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      {onDelete && (
                                          <Button variant="ghost" size="icon" onClick={() => handleDelete(component)} className="h-8 w-8 text-destructive hover:text-destructive" title="Delete">
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
              </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
