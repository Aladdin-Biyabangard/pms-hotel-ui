import {useEffect, useMemo, useState} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Badge} from '@/components/ui/badge';
import {Separator} from '@/components/ui/separator';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {
    ArrowDownRight,
    ArrowUpRight,
    Calendar,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    DollarSign,
    Edit,
    Grid3X3,
    List,
    Percent,
    Plus,
    RefreshCw,
    Save,
    Sparkles,
    Trash2
} from 'lucide-react';
import {
    addMonths,
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    format,
    isBefore,
    isSameMonth,
    isToday,
    isWeekend,
    parseISO,
    startOfMonth,
    startOfWeek,
    subMonths
} from 'date-fns';
import {
    CreateRateOverrideRequest,
    rateOverrideApi,
    RateOverrideResponse,
    UpdateRateOverrideRequest
} from '../../api/rateOverride';
import {ratePlanApi, RatePlanResponse} from '@/api/ratePlan';
import {roomTypeApi, RoomTypeResponse} from '@/api/roomType';
import {toast} from 'sonner';
import {cn} from '@/lib/utils';

// Override types
const OVERRIDE_TYPES = [
  { value: 'PERCENTAGE_INCREASE', label: 'Increase %', icon: ArrowUpRight, color: 'text-emerald-600' },
  { value: 'PERCENTAGE_DECREASE', label: 'Decrease %', icon: ArrowDownRight, color: 'text-rose-600' },
  { value: 'FIXED_INCREASE', label: 'Increase $', icon: ArrowUpRight, color: 'text-emerald-600' },
  { value: 'FIXED_DECREASE', label: 'Decrease $', icon: ArrowDownRight, color: 'text-rose-600' },
  { value: 'SET_RATE', label: 'Set Rate', icon: DollarSign, color: 'text-blue-600' },
  { value: 'MULTIPLIER', label: 'Multiplier', icon: Sparkles, color: 'text-purple-600' },
];

// Common override reasons
const COMMON_REASONS = [
  'Holiday Premium',
  'Special Event',
  'Peak Season',
  'Off-Season Discount',
  'Flash Sale',
  'Corporate Event',
  'Conference',
  'Local Festival',
  'Low Demand',
  'High Demand',
  'Maintenance',
  'Renovation',
];

interface RateOverrideCalendarProps {
  ratePlanId?: number;
  onOverrideChange?: () => void;
}

type ViewMode = 'calendar' | 'list';

export function RateOverrideCalendar({ ratePlanId: initialRatePlanId, onOverrideChange }: RateOverrideCalendarProps) {
  // State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [overrides, setOverrides] = useState<RateOverrideResponse[]>([]);
  const [ratePlans, setRatePlans] = useState<RatePlanResponse[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[]>([]);
  const [selectedRatePlanId, setSelectedRatePlanId] = useState<number | undefined>(initialRatePlanId);
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  
  // Dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [editingOverride, setEditingOverride] = useState<RateOverrideResponse | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [overrideForm, setOverrideForm] = useState<Partial<CreateRateOverrideRequest>>({
    overrideType: 'PERCENTAGE_INCREASE',
    overrideValue: 0,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Load initial data
  useEffect(() => {
    loadReferenceData();
  }, []);

  // Load overrides when filters change
  useEffect(() => {
    loadOverrides();
  }, [currentMonth, selectedRatePlanId, selectedRoomTypeId]);

  const loadReferenceData = async () => {
    try {
      const [ratePlansData, roomTypesData] = await Promise.all([
        ratePlanApi.getAllRatePlans(0, 1000),
        roomTypeApi.getAllRoomTypes(0, 1000)
      ]);
      setRatePlans(ratePlansData.content);
      setRoomTypes(roomTypesData.content);
    } catch (error) {
      toast.error('Failed to load reference data');
    }
  };

  const loadOverrides = async () => {
    setIsLoading(true);
    try {
      const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
      
      const data = await rateOverrideApi.getAllRateOverrides(0, 1000, {
        ratePlanId: selectedRatePlanId,
        roomTypeId: selectedRoomTypeId,
        startDate,
        endDate
      });
      
      setOverrides(data.content);
    } catch (error) {
      toast.error('Failed to load overrides');
    } finally {
      setIsLoading(false);
    }
  };

  // Calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  // Get overrides for a specific date
  const getOverridesForDate = (date: Date): RateOverrideResponse[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return overrides.filter(o => o.overrideDate === dateStr);
  };

  // Navigation
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(direction === 'prev' ? subMonths(currentMonth, 1) : addMonths(currentMonth, 1));
  };

  // Open dialog for new override
  const openCreateDialog = (date?: Date) => {
    setEditingOverride(null);
    setSelectedDate(date || new Date());
    setOverrideForm({
      ratePlanId: selectedRatePlanId,
      roomTypeId: selectedRoomTypeId,
      overrideDate: date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      overrideType: 'PERCENTAGE_INCREASE',
      overrideValue: 10,
      reason: '',
    });
    setShowDialog(true);
  };

  // Open dialog for edit
  const openEditDialog = (override: RateOverrideResponse) => {
    setEditingOverride(override);
    setSelectedDate(parseISO(override.overrideDate));
    setOverrideForm({
      ratePlanId: override.ratePlanId,
      roomTypeId: override.roomTypeId,
      overrideDate: override.overrideDate,
      overrideType: override.overrideType,
      overrideValue: override.overrideValue,
      reason: override.reason || '',
    });
    setShowDialog(true);
  };

  // Save override
  const handleSave = async () => {
    if (!overrideForm.ratePlanId || !overrideForm.overrideDate || !overrideForm.overrideType || overrideForm.overrideValue === undefined) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSaving(true);
    try {
      if (editingOverride) {
        await rateOverrideApi.updateRateOverride(editingOverride.id, overrideForm as UpdateRateOverrideRequest);
        toast.success('Override updated');
      } else {
        await rateOverrideApi.createRateOverride(overrideForm as CreateRateOverrideRequest);
        toast.success('Override created');
      }
      setShowDialog(false);
      loadOverrides();
      onOverrideChange?.();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save override');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete override
  const handleDelete = async (override: RateOverrideResponse) => {
    if (!window.confirm(`Delete override for ${format(parseISO(override.overrideDate), 'MMM dd, yyyy')}?`)) {
      return;
    }

    try {
      await rateOverrideApi.deleteRateOverride(override.id);
      toast.success('Override deleted');
      loadOverrides();
      onOverrideChange?.();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete override');
    }
  };

  // Get override type info
  const getOverrideTypeInfo = (type: string) => {
    return OVERRIDE_TYPES.find(t => t.value === type);
  };

  // Format override value display
  const formatOverrideValue = (type: string, value: number) => {
    switch (type) {
      case 'PERCENTAGE_INCREASE':
        return `+${value}%`;
      case 'PERCENTAGE_DECREASE':
        return `-${value}%`;
      case 'FIXED_INCREASE':
        return `+$${value}`;
      case 'FIXED_DECREASE':
        return `-$${value}`;
      case 'SET_RATE':
        return `$${value}`;
      case 'MULTIPLIER':
        return `×${value}`;
      default:
        return value.toString();
    }
  };

  // Render calendar day
  const renderCalendarDay = (date: Date) => {
    const dayOverrides = getOverridesForDate(date);
    const isCurrentMonth = isSameMonth(date, currentMonth);
    const isCurrentDay = isToday(date);
    const isPast = isBefore(date, new Date()) && !isToday(date);
    const isWeekendDay = isWeekend(date);
    
    return (
      <div
        key={date.toISOString()}
        className={cn(
          "min-h-[100px] p-1 border-b border-r cursor-pointer transition-colors",
          !isCurrentMonth && "bg-muted/30 text-muted-foreground",
          isWeekendDay && isCurrentMonth && "bg-muted/20",
          isCurrentDay && "ring-2 ring-primary ring-inset",
          isPast && isCurrentMonth && "opacity-60"
        )}
        onClick={() => openCreateDialog(date)}
      >
        {/* Day number */}
        <div className={cn(
          "text-sm font-medium mb-1",
          isCurrentDay && "text-primary font-bold"
        )}>
          {format(date, 'd')}
        </div>
        
        {/* Overrides */}
        <div className="space-y-1">
          {dayOverrides.slice(0, 3).map(override => {
            const typeInfo = getOverrideTypeInfo(override.overrideType);
            return (
              <TooltipProvider key={override.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditDialog(override);
                      }}
                      className={cn(
                        "text-xs px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80",
                        override.overrideType.includes('INCREASE') && "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
                        override.overrideType.includes('DECREASE') && "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
                        override.overrideType === 'SET_RATE' && "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
                        override.overrideType === 'MULTIPLIER' && "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200"
                      )}
                    >
                      {formatOverrideValue(override.overrideType, override.overrideValue)}
                      {override.roomTypeCode && ` • ${override.roomTypeCode}`}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs">
                      <div className="font-medium">{override.ratePlanName}</div>
                      {override.roomTypeName && <div>{override.roomTypeName}</div>}
                      <div>{formatOverrideValue(override.overrideType, override.overrideValue)}</div>
                      {override.reason && <div className="text-muted-foreground">{override.reason}</div>}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
          {dayOverrides.length > 3 && (
            <div className="text-xs text-muted-foreground text-center">
              +{dayOverrides.length - 3} more
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <Card>
        <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-rose-600" />
                Rate Override Calendar
              </CardTitle>
              <CardDescription>
                Manage special rate adjustments for specific dates
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-3">
              <Button onClick={() => openCreateDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Override
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          {/* Filters & Navigation */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            {/* Month Navigation */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-[150px] text-center font-semibold">
                {format(currentMonth, 'MMMM yyyy')}
              </div>
              <Button variant="outline" size="icon" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date())}>
                Today
              </Button>
            </div>

            <Separator orientation="vertical" className="h-8" />

            {/* Rate Plan Filter */}
            <Select 
              value={selectedRatePlanId?.toString() || 'all'} 
              onValueChange={(v) => setSelectedRatePlanId(v === 'all' ? undefined : parseInt(v))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Rate Plans" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rate Plans</SelectItem>
                {ratePlans.map(rp => (
                  <SelectItem key={rp.id} value={rp.id.toString()}>
                    {rp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Room Type Filter */}
            <Select 
              value={selectedRoomTypeId?.toString() || 'all'} 
              onValueChange={(v) => setSelectedRoomTypeId(v === 'all' ? undefined : parseInt(v))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Room Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Room Types</SelectItem>
                {roomTypes.map(rt => (
                  <SelectItem key={rt.id} value={rt.id.toString()}>
                    {rt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex-1" />

            {/* View Toggle */}
            <div className="flex items-center gap-1 border rounded-md p-1">
              <Button
                variant={viewMode === 'calendar' ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => setViewMode('calendar')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <Button variant="ghost" size="icon" onClick={loadOverrides} disabled={isLoading}>
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
          </div>

          {/* Calendar View */}
          {viewMode === 'calendar' && (
            <div className="border rounded-lg overflow-hidden">
              {/* Week day headers */}
              <div className="grid grid-cols-7 bg-muted/50">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium border-b border-r last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar grid */}
              <div className="grid grid-cols-7">
                {calendarDays.map(day => renderCalendarDay(day))}
              </div>
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Rate Plan</TableHead>
                    <TableHead>Room Type</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overrides.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No overrides found for this month
                      </TableCell>
                    </TableRow>
                  ) : (
                    overrides.sort((a, b) => a.overrideDate.localeCompare(b.overrideDate)).map(override => {
                      const typeInfo = getOverrideTypeInfo(override.overrideType);
                      const Icon = typeInfo?.icon || DollarSign;
                      return (
                        <TableRow key={override.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {format(parseISO(override.overrideDate), 'MMM dd, yyyy')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{override.ratePlanCode}</Badge>
                          </TableCell>
                          <TableCell>
                            {override.roomTypeName || <span className="text-muted-foreground">All</span>}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Icon className={cn("h-4 w-4", typeInfo?.color)} />
                              <span className="text-sm">{typeInfo?.label}</span>
                            </div>
                          </TableCell>
                          <TableCell className={cn(
                            "text-right font-semibold",
                            override.overrideType.includes('INCREASE') && "text-emerald-600",
                            override.overrideType.includes('DECREASE') && "text-rose-600"
                          )}>
                            {formatOverrideValue(override.overrideType, override.overrideValue)}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate text-muted-foreground">
                            {override.reason || '—'}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEditDialog(override)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleDelete(override)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs">
            <span className="font-medium">Legend:</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-emerald-100 dark:bg-emerald-900/40" />
              <span>Increase</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-rose-100 dark:bg-rose-900/40" />
              <span>Decrease</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-blue-100 dark:bg-blue-900/40" />
              <span>Set Rate</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-purple-100 dark:bg-purple-900/40" />
              <span>Multiplier</span>
            </div>
          </div>
        </CardContent>

        {/* Create/Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingOverride ? 'Edit Override' : 'Create Override'}
              </DialogTitle>
              <DialogDescription>
                {selectedDate && `${editingOverride ? 'Edit' : 'Add'} rate override for ${format(selectedDate, 'MMMM dd, yyyy')}`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Date */}
              <div className="space-y-2">
                <Label>Override Date *</Label>
                <Input
                  type="date"
                  value={overrideForm.overrideDate || ''}
                  onChange={(e) => setOverrideForm({ ...overrideForm, overrideDate: e.target.value })}
                />
              </div>

              {/* Rate Plan */}
              <div className="space-y-2">
                <Label>Rate Plan *</Label>
                <Select 
                  value={overrideForm.ratePlanId?.toString() || ''} 
                  onValueChange={(v) => setOverrideForm({ ...overrideForm, ratePlanId: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rate plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {ratePlans.map(rp => (
                      <SelectItem key={rp.id} value={rp.id.toString()}>
                        {rp.name} ({rp.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Room Type (Optional) */}
              <div className="space-y-2">
                <Label>Room Type (optional)</Label>
                <Select 
                  value={overrideForm.roomTypeId?.toString() || 'all'} 
                  onValueChange={(v) => setOverrideForm({ ...overrideForm, roomTypeId: v === 'all' ? undefined : parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All room types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Room Types</SelectItem>
                    {roomTypes.map(rt => (
                      <SelectItem key={rt.id} value={rt.id.toString()}>
                        {rt.name} ({rt.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Leave empty to apply to all room types
                </p>
              </div>

              {/* Override Type */}
              <div className="space-y-2">
                <Label>Override Type *</Label>
                <div className="grid grid-cols-3 gap-2">
                  {OVERRIDE_TYPES.map(type => {
                    const Icon = type.icon;
                    return (
                      <Button
                        key={type.value}
                        type="button"
                        variant={overrideForm.overrideType === type.value ? "default" : "outline"}
                        className={cn(
                          "flex flex-col h-auto py-2",
                          overrideForm.overrideType === type.value && type.value.includes('INCREASE') && "bg-emerald-600 hover:bg-emerald-700",
                          overrideForm.overrideType === type.value && type.value.includes('DECREASE') && "bg-rose-600 hover:bg-rose-700"
                        )}
                        onClick={() => setOverrideForm({ ...overrideForm, overrideType: type.value })}
                      >
                        <Icon className="h-4 w-4 mb-0.5" />
                        <span className="text-xs">{type.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Override Value */}
              <div className="space-y-2">
                <Label>Value *</Label>
                <div className="relative">
                  {overrideForm.overrideType?.includes('PERCENTAGE') && (
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  )}
                  {(overrideForm.overrideType?.includes('FIXED') || overrideForm.overrideType === 'SET_RATE') && (
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  )}
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={overrideForm.overrideValue ?? ''}
                    onChange={(e) => setOverrideForm({ ...overrideForm, overrideValue: parseFloat(e.target.value) })}
                    placeholder="0"
                    className={overrideForm.overrideType !== 'MULTIPLIER' ? "pl-9" : ""}
                  />
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <Label>Reason</Label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {COMMON_REASONS.slice(0, 6).map(reason => (
                    <Badge
                      key={reason}
                      variant={overrideForm.reason === reason ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() => setOverrideForm({ ...overrideForm, reason })}
                    >
                      {reason}
                    </Badge>
                  ))}
                </div>
                <Textarea
                  value={overrideForm.reason || ''}
                  onChange={(e) => setOverrideForm({ ...overrideForm, reason: e.target.value })}
                  placeholder="Reason for this override..."
                  rows={2}
                />
              </div>

              {/* Example calculation */}
              {overrideForm.overrideType && overrideForm.overrideValue !== undefined && (
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <div className="text-sm text-muted-foreground mb-1">Example (Base Rate: $100)</div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">$100</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-lg font-bold">
                      ${(() => {
                        const base = 100;
                        const value = overrideForm.overrideValue || 0;
                        switch (overrideForm.overrideType) {
                          case 'PERCENTAGE_INCREASE': return (base * (1 + value / 100)).toFixed(2);
                          case 'PERCENTAGE_DECREASE': return (base * (1 - value / 100)).toFixed(2);
                          case 'FIXED_INCREASE': return (base + value).toFixed(2);
                          case 'FIXED_DECREASE': return (base - value).toFixed(2);
                          case 'SET_RATE': return value.toFixed(2);
                          case 'MULTIPLIER': return (base * value).toFixed(2);
                          default: return base.toFixed(2);
                        }
                      })()}
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
                    {editingOverride ? 'Update' : 'Create'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </TooltipProvider>
  );
}

