import {useEffect, useState} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Badge} from '@/components/ui/badge';
import {Switch} from '@/components/ui/switch';
import {ScrollArea} from '@/components/ui/scroll-area';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger,} from "@/components/ui/accordion";
import {
    Car,
    Check,
    CircleDollarSign,
    Copy,
    Dumbbell,
    Edit,
    Gift,
    Package,
    PercentCircle,
    Plus,
    RefreshCw,
    Save,
    Search,
    Sparkles,
    Trash2,
    Utensils,
    Wifi,
    X
} from 'lucide-react';
import {
    COMPONENT_TYPES,
    CreateRatePackageComponentRequest,
    ratePackageComponentApi,
    RatePackageComponentResponse,
    UpdateRatePackageComponentRequest
} from '@/api/ratePackageComponent';
import {ratePlanApi, RatePlanResponse} from '@/api/ratePlan';
import {toast} from 'sonner';
import {cn} from '@/lib/utils';

// Component type icons and colors
const COMPONENT_TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  SERVICE: { icon: Sparkles, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  MEAL: { icon: Utensils, color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
  ACTIVITY: { icon: Dumbbell, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  TRANSPORTATION: { icon: Car, color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' },
  AMENITY: { icon: Wifi, color: 'text-cyan-600', bgColor: 'bg-cyan-100 dark:bg-cyan-900/30' },
  DISCOUNT: { icon: PercentCircle, color: 'text-rose-600', bgColor: 'bg-rose-100 dark:bg-rose-900/30' },
  OTHER: { icon: Gift, color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-900/30' },
};

// Predefined component templates
const COMPONENT_TEMPLATES = [
  { type: 'MEAL', name: 'Breakfast Buffet', description: 'Full breakfast buffet at hotel restaurant', unitPrice: 25 },
  { type: 'MEAL', name: 'Half Board', description: 'Breakfast and dinner included', unitPrice: 60 },
  { type: 'MEAL', name: 'Full Board', description: 'All meals included', unitPrice: 90 },
  { type: 'MEAL', name: 'Room Service', description: 'In-room dining service', unitPrice: 15 },
  { type: 'TRANSPORTATION', name: 'Airport Transfer', description: 'Round-trip airport shuttle', unitPrice: 50 },
  { type: 'TRANSPORTATION', name: 'Parking', description: 'Daily parking included', unitPrice: 20 },
  { type: 'SERVICE', name: 'Spa Access', description: 'Complimentary spa facilities access', unitPrice: 30 },
  { type: 'SERVICE', name: 'Gym Access', description: 'Fitness center access', unitPrice: 0 },
  { type: 'SERVICE', name: 'Late Checkout', description: 'Checkout until 2 PM', unitPrice: 25 },
  { type: 'SERVICE', name: 'Early Check-in', description: 'Check-in from 11 AM', unitPrice: 25 },
  { type: 'AMENITY', name: 'Welcome Drink', description: 'Complimentary welcome drink', unitPrice: 0 },
  { type: 'AMENITY', name: 'Fruit Basket', description: 'Fresh fruit in room', unitPrice: 15 },
  { type: 'AMENITY', name: 'Mini Bar', description: 'Mini bar items included', unitPrice: 40 },
  { type: 'ACTIVITY', name: 'City Tour', description: 'Guided city sightseeing tour', unitPrice: 45 },
  { type: 'DISCOUNT', name: 'Restaurant Discount', description: '15% off at hotel restaurants', unitPrice: 0 },
];

interface RatePackageComponentManagementProps {
  ratePlanId?: number;
  onComponentsChange?: (components: RatePackageComponentResponse[]) => void;
}

export function RatePackageComponentManagement({ ratePlanId, onComponentsChange }: RatePackageComponentManagementProps) {
  // State
  const [components, setComponents] = useState<RatePackageComponentResponse[]>([]);
  const [ratePlans, setRatePlans] = useState<RatePlanResponse[]>([]);
  const [selectedRatePlanId, setSelectedRatePlanId] = useState<number | undefined>(ratePlanId);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter state
  const [filterType, setFilterType] = useState<string | 'ALL'>('ALL');
  const [filterIncluded, setFilterIncluded] = useState<boolean | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [editingComponent, setEditingComponent] = useState<RatePackageComponentResponse | null>(null);
  const [componentForm, setComponentForm] = useState<Partial<CreateRatePackageComponentRequest>>({
    componentType: 'SERVICE',
    quantity: 1,
    isIncluded: true,
    priceAdult: undefined,
    priceChild: undefined,
    priceInfant: undefined,
  });
  const [isSaving, setIsSaving] = useState(false);
  
  // Template dialog
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);

  // Load initial data
  useEffect(() => {
    loadRatePlans();
  }, []);

  // Load components when rate plan changes
  useEffect(() => {
    if (selectedRatePlanId) {
      loadComponents();
    } else {
      setComponents([]);
    }
  }, [selectedRatePlanId]);

  const loadRatePlans = async () => {
    try {
      const data = await ratePlanApi.getAllRatePlans(0, 1000);
      setRatePlans(data.content);
    } catch (error) {
      toast.error('Failed to load rate plans');
    }
  };

  const loadComponents = async () => {
    if (!selectedRatePlanId) return;
    
    setIsLoading(true);
    try {
      const data = await ratePackageComponentApi.getAllRatePackageComponents(0, 1000, { 
        ratePlanId: selectedRatePlanId 
      });
      setComponents(data.content);
      onComponentsChange?.(data.content);
    } catch (error) {
      toast.error('Failed to load package components');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered components
  const filteredComponents = components.filter(c => {
    // Type filter
    if (filterType !== 'ALL' && c.componentType !== filterType) return false;

    // Included filter
    if (filterIncluded !== null && c.isIncluded !== filterIncluded) return false;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesName = c.componentName?.toLowerCase().includes(query);
      const matchesDescription = c.description?.toLowerCase().includes(query);
      const matchesCode = c.componentCode?.toLowerCase().includes(query);
      const matchesType = c.componentType?.toLowerCase().includes(query);

      if (!matchesName && !matchesDescription && !matchesCode && !matchesType) {
        return false;
      }
    }

    return true;
  });

  // Group components by type
  const groupedComponents = filteredComponents.reduce((acc, component) => {
    if (!acc[component.componentType]) {
      acc[component.componentType] = [];
    }
    acc[component.componentType].push(component);
    return acc;
  }, {} as Record<string, RatePackageComponentResponse[]>);

  // CRUD operations
  const openCreateDialog = () => {
    setEditingComponent(null);
    setComponentForm({
      ratePlanId: selectedRatePlanId,
      componentType: 'SERVICE',
      quantity: 1,
      isIncluded: true,
      priceAdult: undefined,
      priceChild: undefined,
      priceInfant: undefined,
    });
    setShowDialog(true);
  };

  const openEditDialog = (component: RatePackageComponentResponse) => {
    setEditingComponent(component);
    setComponentForm({
      ratePlanId: component.ratePlanId,
      componentType: component.componentType,
      componentCode: component.componentCode,
      componentName: component.componentName,
      quantity: component.quantity,
      unitPrice: component.unitPrice,
      priceAdult: component.priceAdult,
      priceChild: component.priceChild,
      priceInfant: component.priceInfant,
      isIncluded: component.isIncluded,
      description: component.description,
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!componentForm.componentType || !componentForm.componentName) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSaving(true);
    try {
      if (editingComponent) {
        await ratePackageComponentApi.updateRatePackageComponent(editingComponent.id, componentForm as UpdateRatePackageComponentRequest);
        toast.success('Component updated');
      } else {
        await ratePackageComponentApi.createRatePackageComponent({
          ...componentForm,
          ratePlanId: selectedRatePlanId!,
        } as CreateRatePackageComponentRequest);
        toast.success('Component added');
      }
      setShowDialog(false);
      loadComponents();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save component');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (component: RatePackageComponentResponse) => {
    if (!window.confirm(`Remove "${component.componentName}" from this package?`)) {
      return;
    }

    try {
      await ratePackageComponentApi.deleteRatePackageComponent(component.id);
      toast.success('Component removed');
      loadComponents();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to remove component');
    }
  };

  const handleToggleIncluded = async (component: RatePackageComponentResponse) => {
    try {
      await ratePackageComponentApi.updateRatePackageComponent(component.id, {
        isIncluded: !component.isIncluded
      });
      loadComponents();
    } catch (error) {
      toast.error('Failed to update component');
    }
  };

  const handleAddFromTemplate = async (template: typeof COMPONENT_TEMPLATES[0]) => {
    if (!selectedRatePlanId) return;

    try {
      await ratePackageComponentApi.createRatePackageComponent({
        ratePlanId: selectedRatePlanId,
        componentType: template.type,
        componentName: template.name,
        description: template.description,
        unitPrice: template.unitPrice,
        quantity: 1,
        isIncluded: true,
      });
      toast.success(`Added "${template.name}"`);
      loadComponents();
      setShowTemplateDialog(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to add component');
    }
  };

  // Get component type config
  const getTypeConfig = (type: string) => {
    return COMPONENT_TYPE_CONFIG[type] || COMPONENT_TYPE_CONFIG.OTHER;
  };

  // Calculate total package value
  const packageTotal = components.reduce((sum, c) => {
    if (c.isIncluded) {
      return sum + ((c.unitPrice || 0) * (c.quantity || 1));
    }
    return sum;
  }, 0);

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-teal-600" />
              Package Component Management
            </CardTitle>
            <CardDescription>
              Manage services, meals, and amenities included in rate packages
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-3">
            {!ratePlanId && (
              <Select 
                value={selectedRatePlanId?.toString() || ''} 
                onValueChange={(v) => setSelectedRatePlanId(v ? parseInt(v) : undefined)}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Select Rate Plan" />
                </SelectTrigger>
                <SelectContent>
                  {ratePlans.map(rp => (
                    <SelectItem key={rp.id} value={rp.id.toString()}>
                      {rp.name} ({rp.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {!selectedRatePlanId ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Package className="h-12 w-12 mb-4 opacity-30" />
            <p className="text-lg font-medium">No Rate Plan Selected</p>
            <p className="text-sm">Please select a rate plan to manage package components</p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin mr-3" />
            Loading components...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Actions & Filters */}
            <div className="flex flex-wrap items-center gap-4">
              {/*<Button onClick={openCreateDialog}>*/}
              {/*  <Plus className="h-4 w-4 mr-2" />*/}
              {/*  Add package*/}
              {/*</Button>*/}
              <Button variant="outline" onClick={() => setShowTemplateDialog(true)}>
                <Copy className="h-4 w-4 mr-2" />
                From Template
              </Button>

              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search components..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 w-[250px]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

            <div className="flex-1" />

            {/* Results Count */}
            <div className="text-sm text-muted-foreground">
              {filteredComponents.length} of {components.length} components
            </div>

            <div className="flex items-center gap-3">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    {COMPONENT_TYPES.map(ct => (
                      <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2 border rounded-md p-1">
                  <Button
                    variant={filterIncluded === null ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setFilterIncluded(null)}
                    className="h-7"
                  >
                    All
                  </Button>
                  <Button
                    variant={filterIncluded === true ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setFilterIncluded(true)}
                    className="h-7"
                  >
                    Included
                  </Button>
                  <Button
                    variant={filterIncluded === false ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setFilterIncluded(false)}
                    className="h-7"
                  >
                    Extra
                  </Button>
                </div>
              </div>
            </div>

            {/* Package Summary */}
            {components.length > 0 && (
              <div className="p-4 rounded-lg bg-gradient-to-r from-teal-100/50 to-cyan-100/50 dark:from-teal-900/20 dark:to-cyan-900/20 border">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Package Summary</div>
                    <div className="text-2xl font-bold">
                      {components.length} component{components.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Included</div>
                      <div className="text-xl font-semibold text-emerald-600">
                        {components.filter(c => c.isIncluded).length}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Extra Charge</div>
                      <div className="text-xl font-semibold text-amber-600">
                        {components.filter(c => !c.isIncluded).length}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Total Value</div>
                      <div className="text-xl font-semibold">${packageTotal.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Components by Type */}
            {Object.keys(groupedComponents).length > 0 ? (
              <Accordion type="multiple" defaultValue={Object.keys(groupedComponents)} className="space-y-4">
                {Object.entries(groupedComponents).map(([type, typeComponents]) => {
                  const config = getTypeConfig(type);
                  const Icon = config.icon;
                  const typeLabel = COMPONENT_TYPES.find(ct => ct.value === type)?.label || type;
                  
                  return (
                    <AccordionItem key={type} value={type} className="border rounded-lg overflow-hidden">
                      <AccordionTrigger className={cn("px-4 py-3 hover:no-underline", config.bgColor)}>
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-full bg-white dark:bg-gray-800", config.color)}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className="font-semibold">{typeLabel}</span>
                          <Badge variant="secondary" className="ml-2">
                            {typeComponents.length}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-0">
                        <div className="divide-y">
                          {typeComponents.map(component => (
                            <div 
                              key={component.id}
                              className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                            >
                              {/* Status toggle */}
                              <div 
                                className={cn(
                                  "flex items-center justify-center w-10 h-10 rounded-full cursor-pointer transition-all",
                                  component.isIncluded 
                                    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30"
                                    : "bg-amber-100 text-amber-600 dark:bg-amber-900/30"
                                )}
                                onClick={() => handleToggleIncluded(component)}
                                title={component.isIncluded ? 'Included (click to change)' : 'Extra charge (click to change)'}
                              >
                                {component.isIncluded ? (
                                  <Check className="h-5 w-5" />
                                ) : (
                                  <CircleDollarSign className="h-5 w-5" />
                                )}
                              </div>

                              {/* Component info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{component.componentName}</span>
                                  {component.componentCode && (
                                    <span className="text-xs text-muted-foreground font-mono">
                                      [{component.componentCode}]
                                    </span>
                                  )}
                                </div>
                                {component.description && (
                                  <p className="text-sm text-muted-foreground truncate">
                                    {component.description}
                                  </p>
                                )}
                              </div>

                              {/* Quantity */}
                              <div className="text-center min-w-[60px]">
                                <div className="text-xs text-muted-foreground">Qty</div>
                                <div className="font-semibold">{component.quantity}</div>
                              </div>

                              {/* Price */}
                              <div className="text-center min-w-[80px]">
                                <div className="text-xs text-muted-foreground">Unit Price</div>
                                <div className="font-semibold">
                                  {component.unitPrice !== undefined ? `$${component.unitPrice.toFixed(2)}` : 'Free'}
                                </div>
                              </div>

                              {/* Total */}
                              <div className="text-center min-w-[80px]">
                                <div className="text-xs text-muted-foreground">Total</div>
                                <div className="font-semibold">
                                  ${((component.unitPrice || 0) * (component.quantity || 1)).toFixed(2)}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditDialog(component)}
                                  className="h-8 w-8"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(component)}
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mb-4 opacity-30" />
                <p className="text-lg font-medium">No Components</p>
                <p className="text-sm mb-4">Add services and amenities to this package</p>
                <div className="flex gap-3">
                  <Button onClick={openCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Component
                  </Button>
                  <Button variant="outline" onClick={() => setShowTemplateDialog(true)}>
                    <Copy className="h-4 w-4 mr-2" />
                    From Template
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingComponent ? 'Edit Component' : 'Add Component'}
            </DialogTitle>
            <DialogDescription>
              Configure package component details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Component type */}
            <div className="space-y-2">
              <Label>Component Type *</Label>
              <div className="grid grid-cols-4 gap-2">
                {COMPONENT_TYPES.slice(0, 4).map(ct => {
                  const config = COMPONENT_TYPE_CONFIG[ct.value];
                  const Icon = config?.icon || Gift;
                  return (
                    <Button
                      key={ct.value}
                      type="button"
                      variant={componentForm.componentType === ct.value ? "default" : "outline"}
                      className="flex flex-col h-auto py-3"
                      onClick={() => setComponentForm({ ...componentForm, componentType: ct.value })}
                    >
                      <Icon className="h-5 w-5 mb-1" />
                      <span className="text-xs">{ct.label}</span>
                    </Button>
                  );
                })}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {COMPONENT_TYPES.slice(4).map(ct => {
                  const config = COMPONENT_TYPE_CONFIG[ct.value];
                  const Icon = config?.icon || Gift;
                  return (
                    <Button
                      key={ct.value}
                      type="button"
                      variant={componentForm.componentType === ct.value ? "default" : "outline"}
                      className="flex flex-col h-auto py-3"
                      onClick={() => setComponentForm({ ...componentForm, componentType: ct.value })}
                    >
                      <Icon className="h-5 w-5 mb-1" />
                      <span className="text-xs">{ct.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Name & Code */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Component Name *</Label>
                <Input
                  value={componentForm.componentName || ''}
                  onChange={(e) => setComponentForm({ ...componentForm, componentName: e.target.value })}
                  placeholder="e.g., Breakfast Buffet"
                />
              </div>
              <div className="space-y-2">
                <Label>Code (optional)</Label>
                <Input
                  value={componentForm.componentCode || ''}
                  onChange={(e) => setComponentForm({ ...componentForm, componentCode: e.target.value })}
                  placeholder="BRK"
                  className="font-mono uppercase"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={componentForm.description || ''}
                onChange={(e) => setComponentForm({ ...componentForm, description: e.target.value })}
                placeholder="Brief description of this component..."
                rows={2}
              />
            </div>

            {/* Quantity & Price */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min={1}
                  value={componentForm.quantity || 1}
                  onChange={(e) => setComponentForm({ ...componentForm, quantity: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Unit Price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  value={componentForm.unitPrice ?? ''}
                  onChange={(e) => setComponentForm({ ...componentForm, unitPrice: parseFloat(e.target.value) || undefined })}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Age-based Pricing */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Age-Based Pricing (Optional)
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Adult Price ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    value={componentForm.priceAdult ?? ''}
                    onChange={(e) => setComponentForm({ ...componentForm, priceAdult: parseFloat(e.target.value) || undefined })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Child Price ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    value={componentForm.priceChild ?? ''}
                    onChange={(e) => setComponentForm({ ...componentForm, priceChild: parseFloat(e.target.value) || undefined })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Infant Price ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    value={componentForm.priceInfant ?? ''}
                    onChange={(e) => setComponentForm({ ...componentForm, priceInfant: parseFloat(e.target.value) || undefined })}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Included toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
              <div>
                <Label className="text-base">Included in Package</Label>
                <p className="text-xs text-muted-foreground">
                  {componentForm.isIncluded 
                    ? 'No extra charge for this component'
                    : 'Guest will be charged for this component'
                  }
                </p>
              </div>
              <Switch
                checked={componentForm.isIncluded ?? true}
                onCheckedChange={(checked) => setComponentForm({ ...componentForm, isIncluded: checked })}
              />
            </div>

            {/* Total display */}
            {componentForm.unitPrice !== undefined && componentForm.unitPrice > 0 && (
              <div className="p-3 rounded-lg bg-muted/50 border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Component Total:</span>
                  <span className="text-lg font-bold">
                    ${((componentForm.unitPrice || 0) * (componentForm.quantity || 1)).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {editingComponent ? 'Update' : 'Add Component'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Selection Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Add from Template</DialogTitle>
            <DialogDescription>
              Quick add common package components
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {Object.entries(
                COMPONENT_TEMPLATES.reduce((acc, template) => {
                  if (!acc[template.type]) acc[template.type] = [];
                  acc[template.type].push(template);
                  return acc;
                }, {} as Record<string, typeof COMPONENT_TEMPLATES>)
              ).map(([type, templates]) => {
                const config = getTypeConfig(type);
                const Icon = config.icon;
                const typeLabel = COMPONENT_TYPES.find(ct => ct.value === type)?.label || type;
                
                return (
                  <div key={type}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={cn("h-4 w-4", config.color)} />
                      <span className="font-medium text-sm">{typeLabel}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {templates.map((template, index) => (
                        <div
                          key={index}
                          onClick={() => handleAddFromTemplate(template)}
                          className={cn(
                            "p-3 rounded-lg border cursor-pointer transition-all",
                            "hover:border-primary hover:bg-primary/5"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{template.name}</span>
                            <Badge variant="outline" className="ml-2">
                              {template.unitPrice > 0 ? `$${template.unitPrice}` : 'Free'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {template.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

