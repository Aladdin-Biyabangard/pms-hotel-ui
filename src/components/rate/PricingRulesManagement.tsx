import {useEffect, useState} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Badge} from '@/components/ui/badge';
import {Switch} from '@/components/ui/switch';
import {Separator} from '@/components/ui/separator';
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
    Building2,
    Calculator,
    CalendarDays,
    CheckCircle,
    Clock,
    DollarSign,
    Edit,
    Info,
    Moon,
    PauseCircle,
    Percent,
    PlayCircle,
    Plus,
    RefreshCw,
    Save,
    Sparkles,
    Sun,
    Tag,
    Timer,
    Trash2,
    TrendingUp,
    Users,
    XCircle
} from 'lucide-react';
import {format, parseISO} from 'date-fns';
import {
    CreatePricingRuleRequest,
    PRICING_RULE_TYPES,
    pricingRuleApi,
    PricingRuleResponse,
    PricingRuleType,
    UpdatePricingRuleRequest
} from '@/api/pricingRule';
import {toast} from 'sonner';
import {cn} from '@/lib/utils';

// Rule type icons and colors
const RULE_TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  EARLY_BOOKING: { icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  LAST_MINUTE: { icon: Timer, color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
  EXTENDED_STAY: { icon: Moon, color: 'text-indigo-600', bgColor: 'bg-indigo-100 dark:bg-indigo-900/30' },
  WEEKEND: { icon: Sun, color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
  WEEKDAY: { icon: CalendarDays, color: 'text-teal-600', bgColor: 'bg-teal-100 dark:bg-teal-900/30' },
  SEASONAL: { icon: Sparkles, color: 'text-pink-600', bgColor: 'bg-pink-100 dark:bg-pink-900/30' },
  PROMOTIONAL: { icon: Tag, color: 'text-rose-600', bgColor: 'bg-rose-100 dark:bg-rose-900/30' },
  OCCUPANCY_BASED: { icon: TrendingUp, color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' },
  MEMBER_DISCOUNT: { icon: Users, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  CORPORATE: { icon: Building2, color: 'text-slate-600', bgColor: 'bg-slate-100 dark:bg-slate-900/30' },
  GROUP: { icon: Users, color: 'text-cyan-600', bgColor: 'bg-cyan-100 dark:bg-cyan-900/30' },
  OTHER: { icon: Calculator, color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-900/30' },
};

interface PricingRulesManagementProps {
  onRulesChange?: (rules: PricingRuleResponse[]) => void;
}

export function PricingRulesManagement({ onRulesChange }: PricingRulesManagementProps) {
  // State
  const [rules, setRules] = useState<PricingRuleResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  
  // Dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRuleResponse | null>(null);
  const [ruleForm, setRuleForm] = useState<Partial<CreatePricingRuleRequest>>({
    ruleType: 'PROMOTIONAL',
    isActive: true,
    priority: 0,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Load data
  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    setIsLoading(true);
    try {
      const data = await pricingRuleApi.getAllPricingRules(0, 1000);
      const sorted = data.content.sort((a, b) => (b.priority || 0) - (a.priority || 0));
      setRules(sorted);
      onRulesChange?.(sorted);
    } catch (error) {
      toast.error('Failed to load pricing rules');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered rules
  const filteredRules = rules.filter(rule => {
    if (filterType !== 'ALL' && rule.ruleType !== filterType) return false;
    if (filterActive !== null && rule.isActive !== filterActive) return false;
    return true;
  });

  // Group rules by type
  const groupedRules = filteredRules.reduce((acc, rule) => {
    if (!acc[rule.ruleType]) {
      acc[rule.ruleType] = [];
    }
    acc[rule.ruleType].push(rule);
    return acc;
  }, {} as Record<string, PricingRuleResponse[]>);

  // CRUD operations
  const openCreateDialog = () => {
    setEditingRule(null);
    setRuleForm({
      ruleName: '',
      ruleType: 'PROMOTIONAL',
      isActive: true,
      priority: rules.length > 0 ? Math.max(...rules.map(r => r.priority || 0)) + 1 : 1,
    });
    setShowDialog(true);
  };

  const openEditDialog = (rule: PricingRuleResponse) => {
    setEditingRule(rule);
    setRuleForm({
      ruleName: rule.ruleName,
      ruleType: rule.ruleType,
      startDate: rule.startDate,
      endDate: rule.endDate,
      discountPercentage: rule.discountPercentage,
      discountAmount: rule.discountAmount,
      priceAdjustment: rule.priceAdjustment,
      minimumNights: rule.minimumNights,
      maximumNights: rule.maximumNights,
      advanceBookingDays: rule.advanceBookingDays,
      isActive: rule.isActive,
      priority: rule.priority,
      description: rule.description,
      conditions: rule.conditions,
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!ruleForm.ruleName || !ruleForm.ruleType) {
      toast.error('Please fill all required fields');
      return;
    }

    // Validate at least one discount/adjustment is set
    if (!ruleForm.discountPercentage && !ruleForm.discountAmount && !ruleForm.priceAdjustment) {
      toast.error('Please set at least one discount or price adjustment');
      return;
    }

    setIsSaving(true);
    try {
      if (editingRule) {
        await pricingRuleApi.updatePricingRule(editingRule.id, ruleForm as UpdatePricingRuleRequest);
        toast.success('Pricing rule updated');
      } else {
        await pricingRuleApi.createPricingRule(ruleForm as CreatePricingRuleRequest);
        toast.success('Pricing rule created');
      }
      setShowDialog(false);
      loadRules();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save rule');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (rule: PricingRuleResponse) => {
    if (!window.confirm(`Delete pricing rule "${rule.ruleName}"?`)) {
      return;
    }

    try {
      await pricingRuleApi.deletePricingRule(rule.id);
      toast.success('Pricing rule deleted');
      loadRules();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete rule');
    }
  };

  const handleToggleActive = async (rule: PricingRuleResponse) => {
    try {
      await pricingRuleApi.updatePricingRule(rule.id, { isActive: !rule.isActive });
      loadRules();
      toast.success(rule.isActive ? 'Rule deactivated' : 'Rule activated');
    } catch (error) {
      toast.error('Failed to update rule');
    }
  };

  const handleMovePriority = async (rule: PricingRuleResponse, direction: 'up' | 'down') => {
    const currentIndex = rules.findIndex(r => r.id === rule.id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= rules.length) return;
    
    const targetRule = rules[newIndex];
    
    try {
      // Swap priorities
      await Promise.all([
        pricingRuleApi.updatePricingRule(rule.id, { priority: targetRule.priority }),
        pricingRuleApi.updatePricingRule(targetRule.id, { priority: rule.priority })
      ]);
      loadRules();
    } catch (error) {
      toast.error('Failed to update priority');
    }
  };

  // Get type config
  const getTypeConfig = (type: string) => {
    return RULE_TYPE_CONFIG[type] || RULE_TYPE_CONFIG.OTHER;
  };

  // Format discount display
  const formatDiscount = (rule: PricingRuleResponse) => {
    if (rule.discountPercentage) {
      return <span className="text-rose-600">-{rule.discountPercentage}%</span>;
    }
    if (rule.discountAmount) {
      return <span className="text-rose-600">-${rule.discountAmount}</span>;
    }
    if (rule.priceAdjustment) {
      return rule.priceAdjustment > 0 
        ? <span className="text-emerald-600">+${rule.priceAdjustment}</span>
        : <span className="text-rose-600">${rule.priceAdjustment}</span>;
    }
    return '—';
  };

  // Format conditions summary
  const formatConditions = (rule: PricingRuleResponse) => {
    const conditions: string[] = [];
    if (rule.minimumNights) conditions.push(`Min ${rule.minimumNights} nights`);
    if (rule.maximumNights) conditions.push(`Max ${rule.maximumNights} nights`);
    if (rule.advanceBookingDays) conditions.push(`Book ${rule.advanceBookingDays}+ days ahead`);
    if (rule.startDate && rule.endDate) {
      conditions.push(`${format(parseISO(rule.startDate), 'MMM dd')} - ${format(parseISO(rule.endDate), 'MMM dd')}`);
    }
    return conditions.length > 0 ? conditions.join(' • ') : 'No conditions';
  };

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-amber-600" />
              Pricing Rules Management
            </CardTitle>
            <CardDescription>
              Configure automatic pricing adjustments based on conditions
            </CardDescription>
          </div>
          
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Rule
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              {PRICING_RULE_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1 border rounded-md p-1">
            <Button
              variant={filterActive === null ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilterActive(null)}
              className="h-7"
            >
              All
            </Button>
            <Button
              variant={filterActive === true ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilterActive(true)}
              className="h-7"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </Button>
            <Button
              variant={filterActive === false ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilterActive(false)}
              className="h-7"
            >
              <XCircle className="h-3 w-3 mr-1" />
              Inactive
            </Button>
          </div>

          <div className="flex-1" />

          <Button variant="ghost" size="icon" onClick={loadRules} disabled={isLoading}>
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>

        {/* Summary */}
        {rules.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <div className="text-2xl font-bold">{rules.length}</div>
              <div className="text-xs text-muted-foreground">Total Rules</div>
            </div>
            <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {rules.filter(r => r.isActive).length}
              </div>
              <div className="text-xs text-muted-foreground">Active</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <div className="text-2xl font-bold">
                {rules.filter(r => !r.isActive).length}
              </div>
              <div className="text-xs text-muted-foreground">Inactive</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <div className="text-2xl font-bold">
                {new Set(rules.map(r => r.ruleType)).size}
              </div>
              <div className="text-xs text-muted-foreground">Types</div>
            </div>
          </div>
        )}

        {/* Rules List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin mr-3" />
            Loading rules...
          </div>
        ) : filteredRules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Calculator className="h-12 w-12 mb-4 opacity-30" />
            <p className="text-lg font-medium">No Pricing Rules</p>
            <p className="text-sm mb-4">Create rules to automate rate adjustments</p>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Rule
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRules.map((rule, index) => {
              const typeConfig = getTypeConfig(rule.ruleType);
              const Icon = typeConfig.icon;
              const typeInfo = PRICING_RULE_TYPES.find(t => t.value === rule.ruleType);
              
              return (
                <div 
                  key={rule.id}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-lg border transition-all",
                    rule.isActive ? "bg-card" : "bg-muted/30 opacity-60"
                  )}
                >
                  {/* Priority Controls */}
                  <div className="flex flex-col items-center text-muted-foreground">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleMovePriority(rule, 'up')}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <span className="text-xs font-mono">#{rule.priority}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleMovePriority(rule, 'down')}
                      disabled={index === filteredRules.length - 1}
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Type Icon */}
                  <div className={cn("p-3 rounded-lg", typeConfig.bgColor)}>
                    <Icon className={cn("h-6 w-6", typeConfig.color)} />
                  </div>

                  {/* Rule Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{rule.ruleName}</span>
                      <Badge variant="outline" className="text-xs">
                        {typeInfo?.label}
                      </Badge>
                      {!rule.isActive && (
                        <Badge variant="secondary" className="text-xs">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {formatConditions(rule)}
                    </div>
                    {rule.description && (
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        {rule.description}
                      </div>
                    )}
                  </div>

                  {/* Discount */}
                  <div className="text-right min-w-[80px]">
                    <div className="text-lg font-bold">
                      {formatDiscount(rule)}
                    </div>
                    <div className="text-xs text-muted-foreground">Adjustment</div>
                  </div>

                  {/* Active Toggle */}
                  <div 
                    className="cursor-pointer"
                    onClick={() => handleToggleActive(rule)}
                  >
                    {rule.isActive ? (
                      <PlayCircle className="h-6 w-6 text-emerald-600" />
                    ) : (
                      <PauseCircle className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditDialog(rule)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(rule)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Help */}
        <Alert className="mt-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Rules are applied in priority order (highest first). The first matching rule will be used.
            Configure conditions like minimum nights, advance booking days, or date ranges to control when rules apply.
          </AlertDescription>
        </Alert>
      </CardContent>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRule ? 'Edit Pricing Rule' : 'Create Pricing Rule'}
            </DialogTitle>
            <DialogDescription>
              Configure automatic pricing adjustments based on booking conditions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rule Name *</Label>
                <Input
                  value={ruleForm.ruleName || ''}
                  onChange={(e) => setRuleForm({ ...ruleForm, ruleName: e.target.value })}
                  placeholder="e.g., Early Bird Discount"
                />
              </div>
              <div className="space-y-2">
                <Label>Rule Type *</Label>
                <Select 
                  value={ruleForm.ruleType || ''} 
                  onValueChange={(v) => setRuleForm({ ...ruleForm, ruleType: v as PricingRuleType })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRICING_RULE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={ruleForm.description || ''}
                onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })}
                placeholder="Brief description of this rule..."
                rows={2}
              />
            </div>

            <Separator />

            {/* Discount/Adjustment */}
            <div>
              <Label className="text-base font-semibold mb-4 block">Discount / Adjustment</Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    Discount %
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={ruleForm.discountPercentage ?? ''}
                    onChange={(e) => setRuleForm({ 
                      ...ruleForm, 
                      discountPercentage: e.target.value ? parseFloat(e.target.value) : undefined 
                    })}
                    placeholder="e.g., 15"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Discount $
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={ruleForm.discountAmount ?? ''}
                    onChange={(e) => setRuleForm({ 
                      ...ruleForm, 
                      discountAmount: e.target.value ? parseFloat(e.target.value) : undefined 
                    })}
                    placeholder="e.g., 25"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Price Adjustment $
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={ruleForm.priceAdjustment ?? ''}
                    onChange={(e) => setRuleForm({ 
                      ...ruleForm, 
                      priceAdjustment: e.target.value ? parseFloat(e.target.value) : undefined 
                    })}
                    placeholder="e.g., -20 or +30"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use negative for discount, positive for increase
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Conditions */}
            <div>
              <Label className="text-base font-semibold mb-4 block">Conditions</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Minimum Nights</Label>
                  <Input
                    type="number"
                    min="1"
                    value={ruleForm.minimumNights ?? ''}
                    onChange={(e) => setRuleForm({ 
                      ...ruleForm, 
                      minimumNights: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    placeholder="e.g., 3"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Maximum Nights</Label>
                  <Input
                    type="number"
                    min="1"
                    value={ruleForm.maximumNights ?? ''}
                    onChange={(e) => setRuleForm({ 
                      ...ruleForm, 
                      maximumNights: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    placeholder="e.g., 14"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Advance Booking Days</Label>
                  <Input
                    type="number"
                    min="0"
                    value={ruleForm.advanceBookingDays ?? ''}
                    onChange={(e) => setRuleForm({ 
                      ...ruleForm, 
                      advanceBookingDays: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    placeholder="e.g., 30"
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum days in advance to book
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Input
                    type="number"
                    min="0"
                    value={ruleForm.priority ?? 0}
                    onChange={(e) => setRuleForm({ 
                      ...ruleForm, 
                      priority: parseInt(e.target.value) || 0 
                    })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Higher priority rules are checked first
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Validity Period */}
            <div>
              <Label className="text-base font-semibold mb-4 block">Validity Period (Optional)</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={ruleForm.startDate || ''}
                    onChange={(e) => setRuleForm({ ...ruleForm, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={ruleForm.endDate || ''}
                    onChange={(e) => setRuleForm({ ...ruleForm, endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Active Status */}
            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
              <div>
                <Label className="text-base">Active</Label>
                <p className="text-xs text-muted-foreground">
                  Enable this rule to start applying discounts
                </p>
              </div>
              <Switch
                checked={ruleForm.isActive ?? true}
                onCheckedChange={(checked) => setRuleForm({ ...ruleForm, isActive: checked })}
              />
            </div>

            {/* Example calculation */}
            {(ruleForm.discountPercentage || ruleForm.discountAmount || ruleForm.priceAdjustment) && (
              <div className="p-4 rounded-lg bg-muted/50 border">
                <div className="text-sm font-medium mb-2">Example (Base Rate: $200)</div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">$200</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-lg font-bold">
                    ${(() => {
                      let final = 200;
                      if (ruleForm.discountPercentage) {
                        final = final * (1 - ruleForm.discountPercentage / 100);
                      }
                      if (ruleForm.discountAmount) {
                        final = final - ruleForm.discountAmount;
                      }
                      if (ruleForm.priceAdjustment) {
                        final = final + ruleForm.priceAdjustment;
                      }
                      return Math.max(0, final).toFixed(2);
                    })()}
                  </span>
                  <Badge variant="secondary">
                    Save ${(() => {
                      let discount = 0;
                      if (ruleForm.discountPercentage) {
                        discount += 200 * ruleForm.discountPercentage / 100;
                      }
                      if (ruleForm.discountAmount) {
                        discount += ruleForm.discountAmount;
                      }
                      if (ruleForm.priceAdjustment && ruleForm.priceAdjustment < 0) {
                        discount += Math.abs(ruleForm.priceAdjustment);
                      }
                      return discount.toFixed(2);
                    })()}
                  </Badge>
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
                  {editingRule ? 'Update Rule' : 'Create Rule'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

