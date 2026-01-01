import {useEffect, useState} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Badge} from '@/components/ui/badge';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    ArrowDown,
    ArrowUp,
    DollarSign,
    Edit,
    GripVertical,
    Info,
    Layers,
    Moon,
    Percent,
    Plus,
    RefreshCw,
    Save,
    Trash2
} from 'lucide-react';
import {CreateRateTierRequest, rateTierApi, RateTierResponse, UpdateRateTierRequest} from '@/api/rateTier';
import {ratePlanApi, RatePlanResponse} from '@/api/ratePlan';
import {toast} from 'sonner';
import {cn} from '@/lib/utils';

interface RateTierManagementProps {
  ratePlanId?: number;
  onTiersChange?: (tiers: RateTierResponse[]) => void;
}

const ADJUSTMENT_TYPES = [
  { value: 'PERCENTAGE', label: 'Percentage', icon: Percent, format: (v: number) => `${v}%` },
  { value: 'FIXED', label: 'Fixed Amount', icon: DollarSign, format: (v: number) => `$${v.toFixed(2)}` },
  { value: 'MULTIPLIER', label: 'Multiplier', icon: null, format: (v: number) => `×${v}` },
];

// Visual tier colors based on adjustment
const getTierColor = (type: string, value: number) => {
  if (type === 'PERCENTAGE') {
    if (value < 0) return 'bg-rose-100 border-rose-300 dark:bg-rose-900/30 dark:border-rose-700';
    if (value > 0) return 'bg-emerald-100 border-emerald-300 dark:bg-emerald-900/30 dark:border-emerald-700';
    return 'bg-gray-100 border-gray-300 dark:bg-gray-800/30 dark:border-gray-600';
  }
  if (type === 'FIXED') {
    if (value < 0) return 'bg-rose-100 border-rose-300 dark:bg-rose-900/30 dark:border-rose-700';
    if (value > 0) return 'bg-emerald-100 border-emerald-300 dark:bg-emerald-900/30 dark:border-emerald-700';
    return 'bg-gray-100 border-gray-300 dark:bg-gray-800/30 dark:border-gray-600';
  }
  if (type === 'MULTIPLIER') {
    if (value < 1) return 'bg-rose-100 border-rose-300 dark:bg-rose-900/30 dark:border-rose-700';
    if (value > 1) return 'bg-emerald-100 border-emerald-300 dark:bg-emerald-900/30 dark:border-emerald-700';
    return 'bg-gray-100 border-gray-300 dark:bg-gray-800/30 dark:border-gray-600';
  }
  return '';
};

export function RateTierManagement({ ratePlanId, onTiersChange }: RateTierManagementProps) {
  // State
  const [tiers, setTiers] = useState<RateTierResponse[]>([]);
  const [ratePlans, setRatePlans] = useState<RatePlanResponse[]>([]);
  const [selectedRatePlanId, setSelectedRatePlanId] = useState<number | undefined>(ratePlanId);
  const [isLoading, setIsLoading] = useState(false);
  
  // Drag state
  const [draggedTier, setDraggedTier] = useState<RateTierResponse | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  // Dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [editingTier, setEditingTier] = useState<RateTierResponse | null>(null);
  const [tierForm, setTierForm] = useState<Partial<CreateRateTierRequest>>({
    minNights: 1,
    adjustmentType: 'PERCENTAGE',
    adjustmentValue: 0,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Load initial data
  useEffect(() => {
    loadRatePlans();
  }, []);

  // Load tiers when rate plan changes
  useEffect(() => {
    if (selectedRatePlanId) {
      loadTiers();
    } else {
      setTiers([]);
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

  const loadTiers = async () => {
    if (!selectedRatePlanId) return;
    
    setIsLoading(true);
    try {
      const data = await rateTierApi.getAllRateTiers(0, 1000, { ratePlanId: selectedRatePlanId });
      const sorted = data.content.sort((a, b) => (a.priority || 0) - (b.priority || 0));
      setTiers(sorted);
      onTiersChange?.(sorted);
    } catch (error) {
      toast.error('Failed to load rate tiers');
    } finally {
      setIsLoading(false);
    }
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, tier: RateTierResponse) => {
    setDraggedTier(tier);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', tier.id.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    
    if (!draggedTier) return;
    
    const dragIndex = tiers.findIndex(t => t.id === draggedTier.id);
    if (dragIndex === dropIndex) {
      setDraggedTier(null);
      return;
    }

    // Reorder tiers
    const newTiers = [...tiers];
    newTiers.splice(dragIndex, 1);
    newTiers.splice(dropIndex, 0, draggedTier);

    // Update priorities
    const updatedTiers = newTiers.map((tier, index) => ({
      ...tier,
      priority: index + 1
    }));

    setTiers(updatedTiers);
    setDraggedTier(null);

    // Save new priorities to server
    try {
      await Promise.all(
        updatedTiers.map(tier => 
          rateTierApi.updateRateTier(tier.id, { priority: tier.priority })
        )
      );
      toast.success('Tier order updated');
      onTiersChange?.(updatedTiers);
    } catch (error) {
      toast.error('Failed to update tier order');
      loadTiers(); // Reload on error
    }
  };

  const handleDragEnd = () => {
    setDraggedTier(null);
    setDragOverIndex(null);
  };

  // Move with buttons (alternative to drag)
  const moveTier = async (tier: RateTierResponse, direction: 'up' | 'down') => {
    const currentIndex = tiers.findIndex(t => t.id === tier.id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= tiers.length) return;

    const newTiers = [...tiers];
    const targetTier = newTiers[newIndex];
    
    // Swap priorities
    const tempPriority = tier.priority;
    newTiers[currentIndex] = { ...tier, priority: targetTier.priority };
    newTiers[newIndex] = { ...targetTier, priority: tempPriority };
    
    // Sort by priority
    newTiers.sort((a, b) => (a.priority || 0) - (b.priority || 0));
    setTiers(newTiers);

    try {
      await Promise.all([
        rateTierApi.updateRateTier(tier.id, { priority: targetTier.priority }),
        rateTierApi.updateRateTier(targetTier.id, { priority: tempPriority })
      ]);
      onTiersChange?.(newTiers);
    } catch (error) {
      toast.error('Failed to update tier order');
      loadTiers();
    }
  };

  // CRUD operations
  const openCreateDialog = () => {
    setEditingTier(null);
    setTierForm({
      ratePlanId: selectedRatePlanId,
      minNights: 1,
      adjustmentType: 'PERCENTAGE',
      adjustmentValue: 0,
      priority: tiers.length + 1,
    });
    setShowDialog(true);
  };

  const openEditDialog = (tier: RateTierResponse) => {
    setEditingTier(tier);
    setTierForm({
      ratePlanId: tier.ratePlanId,
      minNights: tier.minNights,
      maxNights: tier.maxNights,
      adjustmentType: tier.adjustmentType,
      adjustmentValue: tier.adjustmentValue,
      priority: tier.priority,
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!tierForm.minNights || !tierForm.adjustmentType || tierForm.adjustmentValue === undefined) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSaving(true);
    try {
      if (editingTier) {
        await rateTierApi.updateRateTier(editingTier.id, tierForm as UpdateRateTierRequest);
        toast.success('Rate tier updated');
      } else {
        await rateTierApi.createRateTier({
          ...tierForm,
          ratePlanId: selectedRatePlanId!,
        } as CreateRateTierRequest);
        toast.success('Rate tier created');
      }
      setShowDialog(false);
      loadTiers();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save tier');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (tier: RateTierResponse) => {
    if (!window.confirm(`Delete tier for ${tier.minNights}${tier.maxNights ? `-${tier.maxNights}` : '+'} nights?`)) {
      return;
    }

    try {
      await rateTierApi.deleteRateTier(tier.id);
      toast.success('Rate tier deleted');
      loadTiers();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete tier');
    }
  };

  // Format tier nights display
  const formatNights = (min: number, max?: number) => {
    if (max) return `${min} - ${max} nights`;
    return `${min}+ nights`;
  };

  // Get adjustment type info
  const getAdjustmentInfo = (type: string) => {
    return ADJUSTMENT_TYPES.find(t => t.value === type);
  };

  // Calculate example rate
  const calculateExampleRate = (baseRate: number, type: string, value: number) => {
    switch (type) {
      case 'PERCENTAGE':
        return baseRate * (1 + value / 100);
      case 'FIXED':
        return baseRate + value;
      case 'MULTIPLIER':
        return baseRate * value;
      default:
        return baseRate;
    }
  };

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-violet-600" />
              Rate Tier Management
            </CardTitle>
            <CardDescription>
              Length-of-stay based pricing tiers with drag & drop ordering
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
            
            {selectedRatePlanId && (
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Tier
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {!selectedRatePlanId ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Layers className="h-12 w-12 mb-4 opacity-30" />
            <p className="text-lg font-medium">No Rate Plan Selected</p>
            <p className="text-sm">Please select a rate plan to manage tiers</p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin mr-3" />
            Loading tiers...
          </div>
        ) : tiers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Layers className="h-12 w-12 mb-4 opacity-30" />
            <p className="text-lg font-medium">No Tiers Configured</p>
            <p className="text-sm mb-4">Create tiers for length-of-stay pricing</p>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Tier
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Visual tier representation */}
            <div className="p-4 rounded-lg bg-muted/30 border">
              <div className="text-sm font-medium mb-3">Tier Visualization (Base Rate: $100)</div>
              <div className="flex flex-wrap gap-2">
                {tiers.map((tier, index) => {
                  const exampleRate = calculateExampleRate(100, tier.adjustmentType, tier.adjustmentValue);
                  const adjustmentInfo = getAdjustmentInfo(tier.adjustmentType);
                  return (
                    <div 
                      key={tier.id}
                      className={cn(
                        "flex flex-col items-center p-3 rounded-lg border-2 min-w-[100px]",
                        getTierColor(tier.adjustmentType, tier.adjustmentValue)
                      )}
                    >
                      <div className="text-xs text-muted-foreground mb-1">
                        {tier.minNights}{tier.maxNights ? `-${tier.maxNights}` : '+'}
                      </div>
                      <div className="text-lg font-bold">${exampleRate.toFixed(0)}</div>
                      <div className="text-xs">
                        {adjustmentInfo?.format(tier.adjustmentValue)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tier list with drag & drop */}
            <div className="space-y-2">
              {tiers.map((tier, index) => {
                const adjustmentInfo = getAdjustmentInfo(tier.adjustmentType);
                const Icon = adjustmentInfo?.icon;
                
                return (
                  <div
                    key={tier.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, tier)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg border bg-card transition-all",
                      "hover:shadow-md cursor-grab active:cursor-grabbing",
                      dragOverIndex === index && "border-primary border-2 bg-primary/5",
                      draggedTier?.id === tier.id && "opacity-50"
                    )}
                  >
                    {/* Drag handle */}
                    <div className="flex flex-col items-center text-muted-foreground">
                      <GripVertical className="h-5 w-5" />
                      <span className="text-xs font-mono">#{tier.priority}</span>
                    </div>

                    {/* Priority controls */}
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveTier(tier, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveTier(tier, 'down')}
                        disabled={index === tiers.length - 1}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Nights range */}
                    <div className="flex items-center gap-3 min-w-[140px]">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                        <Moon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-semibold">{formatNights(tier.minNights, tier.maxNights)}</div>
                        <div className="text-xs text-muted-foreground">Length of stay</div>
                      </div>
                    </div>

                    {/* Adjustment type & value */}
                    <div className="flex-1 grid grid-cols-2 gap-6">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          {adjustmentInfo?.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-xl font-bold tabular-nums",
                          tier.adjustmentValue < 0 && "text-rose-600",
                          tier.adjustmentValue > 0 && tier.adjustmentType !== 'MULTIPLIER' && "text-emerald-600",
                          tier.adjustmentType === 'MULTIPLIER' && tier.adjustmentValue > 1 && "text-emerald-600",
                          tier.adjustmentType === 'MULTIPLIER' && tier.adjustmentValue < 1 && "text-rose-600"
                        )}>
                          {tier.adjustmentType === 'PERCENTAGE' && (tier.adjustmentValue >= 0 ? '+' : '')}{adjustmentInfo?.format(tier.adjustmentValue)}
                        </span>
                      </div>
                    </div>

                    {/* Status */}
                    <Badge 
                      variant={tier.status === 'ACTIVE' ? 'default' : 'secondary'}
                      className={tier.status === 'ACTIVE' ? 'bg-emerald-500' : ''}
                    >
                      {tier.status}
                    </Badge>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(tier)}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(tier)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Help text */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Drag and drop tiers to reorder priority. Tiers are applied in order from highest to lowest priority. 
                The first matching tier based on length of stay will be used.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTier ? 'Edit Rate Tier' : 'Create Rate Tier'}
            </DialogTitle>
            <DialogDescription>
              Configure length-of-stay based pricing adjustment
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Nights range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Nights *</Label>
                <Input
                  type="number"
                  min={1}
                  value={tierForm.minNights || ''}
                  onChange={(e) => setTierForm({ ...tierForm, minNights: parseInt(e.target.value) || undefined })}
                  placeholder="1"
                />
              </div>
              <div className="space-y-2">
                <Label>Max Nights (optional)</Label>
                <Input
                  type="number"
                  min={tierForm.minNights || 1}
                  value={tierForm.maxNights || ''}
                  onChange={(e) => setTierForm({ ...tierForm, maxNights: parseInt(e.target.value) || undefined })}
                  placeholder="Leave empty for unlimited"
                />
              </div>
            </div>

            {/* Adjustment type selection */}
            <div className="space-y-2">
              <Label>Adjustment Type *</Label>
              <div className="grid grid-cols-3 gap-2">
                {ADJUSTMENT_TYPES.map(type => {
                  const Icon = type.icon;
                  return (
                    <Button
                      key={type.value}
                      type="button"
                      variant={tierForm.adjustmentType === type.value ? "default" : "outline"}
                      className="flex flex-col h-auto py-3"
                      onClick={() => setTierForm({ ...tierForm, adjustmentType: type.value })}
                    >
                      {Icon && <Icon className="h-5 w-5 mb-1" />}
                      <span className="text-xs">{type.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Adjustment value */}
            <div className="space-y-2">
              <Label>Adjustment Value *</Label>
              <div className="relative">
                {tierForm.adjustmentType === 'PERCENTAGE' && (
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                )}
                {tierForm.adjustmentType === 'FIXED' && (
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                )}
                <Input
                  type="number"
                  step={tierForm.adjustmentType === 'PERCENTAGE' ? '0.1' : '0.01'}
                  value={tierForm.adjustmentValue ?? ''}
                  onChange={(e) => setTierForm({ ...tierForm, adjustmentValue: parseFloat(e.target.value) })}
                  placeholder="0"
                  className={tierForm.adjustmentType !== 'MULTIPLIER' ? "pl-9" : ""}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {tierForm.adjustmentType === 'PERCENTAGE' && 'Use negative values for discounts'}
                {tierForm.adjustmentType === 'FIXED' && 'Amount to add (use negative for discount)'}
                {tierForm.adjustmentType === 'MULTIPLIER' && 'e.g., 0.9 = 10% discount, 1.1 = 10% increase'}
              </p>
            </div>

            {/* Example calculation */}
            {tierForm.adjustmentValue !== undefined && tierForm.adjustmentType && (
              <div className="p-3 rounded-lg bg-muted/50 border">
                <div className="text-sm text-muted-foreground mb-1">Example (Base: $100)</div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">$100</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-lg font-bold">
                    ${calculateExampleRate(100, tierForm.adjustmentType, tierForm.adjustmentValue || 0).toFixed(2)}
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
                  {editingTier ? 'Update Tier' : 'Create Tier'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

