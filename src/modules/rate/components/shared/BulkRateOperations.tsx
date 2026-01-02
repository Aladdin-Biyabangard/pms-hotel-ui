import {useEffect, useMemo, useState} from 'react';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Badge} from '@/components/ui/badge';
import {Checkbox} from '@/components/ui/checkbox';
import {Separator} from '@/components/ui/separator';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {Progress} from '@/components/ui/progress';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from '@/components/ui/table';
import {
    AlertTriangle,
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    Ban,
    Calculator,
    Calendar,
    Check,
    CheckCircle,
    Copy,
    DollarSign,
    Eye,
    FileText,
    Layers,
    Percent,
    RefreshCw,
    Settings2,
    X
} from 'lucide-react';
import {differenceInDays, eachDayOfInterval, format, isWeekend, parseISO} from 'date-fns';
import {CreateRoomRateRequest, roomRateApi, RoomRateResponse} from '@/api/roomRate';
import {ratePlanApi, RatePlanResponse} from '@/modules/rate/RatePlan';
import {roomTypeApi, RoomTypeResponse} from '@/api/roomType';
import {toast} from 'sonner';
import {cn} from '@/lib/utils';

// Operation types
type OperationType = 
  | 'SET_RATE' 
  | 'INCREASE_PERCENT' 
  | 'DECREASE_PERCENT' 
  | 'INCREASE_FIXED' 
  | 'DECREASE_FIXED'
  | 'COPY_FROM_DATE'
  | 'SET_AVAILABILITY'
  | 'SET_STOP_SELL';

interface BulkOperation {
  type: OperationType;
  value?: number;
  sourceDate?: string;
  stopSell?: boolean;
}

interface PreviewChange {
  roomTypeId: number;
  roomTypeName: string;
  ratePlanId: number;
  ratePlanName: string;
  date: string;
  currentRate?: number;
  newRate: number;
  currentAvailability?: number;
  newAvailability?: number;
  currentStopSell?: boolean;
  newStopSell?: boolean;
  hasChange: boolean;
}

interface BulkRateOperationsProps {
  onComplete?: () => void;
}

const OPERATION_OPTIONS = [
  { value: 'SET_RATE', label: 'Set Rate', icon: DollarSign, description: 'Set a fixed rate amount' },
  { value: 'INCREASE_PERCENT', label: 'Increase by %', icon: ArrowUpRight, description: 'Increase rates by percentage' },
  { value: 'DECREASE_PERCENT', label: 'Decrease by %', icon: ArrowDownRight, description: 'Decrease rates by percentage' },
  { value: 'INCREASE_FIXED', label: 'Increase by $', icon: ArrowUpRight, description: 'Add fixed amount to rates' },
  { value: 'DECREASE_FIXED', label: 'Decrease by $', icon: ArrowDownRight, description: 'Subtract fixed amount from rates' },
  { value: 'COPY_FROM_DATE', label: 'Copy from Date', icon: Copy, description: 'Copy rates from a specific date' },
  { value: 'SET_AVAILABILITY', label: 'Set Availability', icon: Layers, description: 'Set room availability count' },
  { value: 'SET_STOP_SELL', label: 'Stop Sell', icon: Ban, description: 'Enable or disable stop sell' },
];

export function BulkRateOperations({ onComplete }: BulkRateOperationsProps) {
  // Selection state
  const [startDate, setStartDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedRoomTypes, setSelectedRoomTypes] = useState<number[]>([]);
  const [selectedRatePlans, setSelectedRatePlans] = useState<number[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']);
  
  // Reference data
  const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[]>([]);
  const [ratePlans, setRatePlans] = useState<RatePlanResponse[]>([]);
  
  // Operation state
  const [operation, setOperation] = useState<BulkOperation>({ type: 'SET_RATE' });
  
  // Preview & execution
  const [previewChanges, setPreviewChanges] = useState<PreviewChange[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applyProgress, setApplyProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  
  // Existing rates cache
  const [existingRates, setExistingRates] = useState<Map<string, RoomRateResponse>>(new Map());

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [roomTypesData, ratePlansData] = await Promise.all([
        roomTypeApi.getAllRoomTypes(0, 1000),
        ratePlanApi.getAllRatePlans(0, 1000)
      ]);
      setRoomTypes(roomTypesData.content);
      setRatePlans(ratePlansData.content);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate dates in range
  const datesInRange = useMemo(() => {
    if (!startDate || !endDate) return [];
    try {
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      if (start > end) return [];
      
      const allDays = eachDayOfInterval({ start, end });
      
      // Filter by selected days of week
      return allDays.filter(date => {
        const dayName = format(date, 'EEEE').toUpperCase();
        return selectedDays.includes(dayName);
      });
    } catch {
      return [];
    }
  }, [startDate, endDate, selectedDays]);

  // Total operations count
  const totalOperations = useMemo(() => {
    return datesInRange.length * selectedRoomTypes.length * selectedRatePlans.length;
  }, [datesInRange, selectedRoomTypes, selectedRatePlans]);

  // Days of week for filtering
  const DAYS_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleAllDays = () => {
    if (selectedDays.length === DAYS_OF_WEEK.length) {
      setSelectedDays([]);
    } else {
      setSelectedDays([...DAYS_OF_WEEK]);
    }
  };

  const toggleRoomType = (id: number) => {
    setSelectedRoomTypes(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAllRoomTypes = () => {
    if (selectedRoomTypes.length === roomTypes.length) {
      setSelectedRoomTypes([]);
    } else {
      setSelectedRoomTypes(roomTypes.map(rt => rt.id));
    }
  };

  const toggleRatePlan = (id: number) => {
    setSelectedRatePlans(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAllRatePlans = () => {
    if (selectedRatePlans.length === ratePlans.length) {
      setSelectedRatePlans([]);
    } else {
      setSelectedRatePlans(ratePlans.map(rp => rp.id));
    }
  };

  // Generate preview
  const handleGeneratePreview = async () => {
    if (selectedRoomTypes.length === 0 || selectedRatePlans.length === 0 || datesInRange.length === 0) {
      toast.error('Please select room types, rate plans, and a valid date range');
      return;
    }

    if (operation.type !== 'SET_STOP_SELL' && operation.value === undefined && !operation.sourceDate) {
      toast.error('Please enter a value for the operation');
      return;
    }

    setIsPreviewing(true);
    setShowPreview(false);
    
    try {
      // Load existing rates for the date range
      const ratesMap = new Map<string, RoomRateResponse>();
      
      for (const ratePlanId of selectedRatePlans) {
        for (const roomTypeId of selectedRoomTypes) {
          const ratePlan = ratePlans.find(rp => rp.id === ratePlanId);
          const roomType = roomTypes.find(rt => rt.id === roomTypeId);
          
          if (ratePlan && roomType) {
            const data = await roomRateApi.getAllRoomRates(0, 20, {
              ratePlanCode: ratePlan.code,
              roomTypeCode: roomType.code,
              startDate: startDate,
              endDate: endDate
            });
            
            data.content.forEach((rate: RoomRateResponse) => {
              const key = `${ratePlanId}-${roomTypeId}-${rate.rateDate}`;
              ratesMap.set(key, rate);
            });
          }
        }
      }
      
      setExistingRates(ratesMap);

      // Load source date rates if copying
      let sourceRates: Map<string, RoomRateResponse> = new Map();
      if (operation.type === 'COPY_FROM_DATE' && operation.sourceDate) {
        for (const ratePlanId of selectedRatePlans) {
          for (const roomTypeId of selectedRoomTypes) {
            const ratePlan = ratePlans.find(rp => rp.id === ratePlanId);
            const roomType = roomTypes.find(rt => rt.id === roomTypeId);
            
            if (ratePlan && roomType) {
              const data = await roomRateApi.getAllRoomRates(0, 1000, {
                ratePlanCode: ratePlan.code,
                roomTypeCode: roomType.code,
                rateDate: operation.sourceDate
              });
              
              data.content.forEach((rate: RoomRateResponse) => {
                const key = `${ratePlanId}-${roomTypeId}`;
                sourceRates.set(key, rate);
              });
            }
          }
        }
      }

      // Generate preview changes
      const changes: PreviewChange[] = [];
      
      for (const date of datesInRange) {
        const dateStr = format(date, 'yyyy-MM-dd');
        
        for (const ratePlanId of selectedRatePlans) {
          for (const roomTypeId of selectedRoomTypes) {
            const ratePlan = ratePlans.find(rp => rp.id === ratePlanId);
            const roomType = roomTypes.find(rt => rt.id === roomTypeId);
            const key = `${ratePlanId}-${roomTypeId}-${dateStr}`;
            const existingRate = ratesMap.get(key);
            
            const currentRate = existingRate?.rateAmount;
            const currentAvailability = existingRate?.availabilityCount;
            const currentStopSell = existingRate?.stopSell;
            
            let newRate = currentRate || 0;
            let newAvailability = currentAvailability;
            let newStopSell = currentStopSell;
            
            switch (operation.type) {
              case 'SET_RATE':
                newRate = operation.value || 0;
                break;
              case 'INCREASE_PERCENT':
                newRate = currentRate ? currentRate * (1 + (operation.value || 0) / 100) : 0;
                break;
              case 'DECREASE_PERCENT':
                newRate = currentRate ? currentRate * (1 - (operation.value || 0) / 100) : 0;
                break;
              case 'INCREASE_FIXED':
                newRate = (currentRate || 0) + (operation.value || 0);
                break;
              case 'DECREASE_FIXED':
                newRate = (currentRate || 0) - (operation.value || 0);
                break;
              case 'COPY_FROM_DATE':
                const sourceKey = `${ratePlanId}-${roomTypeId}`;
                const sourceRate = sourceRates.get(sourceKey);
                newRate = sourceRate?.rateAmount || currentRate || 0;
                newAvailability = sourceRate?.availabilityCount ?? currentAvailability;
                newStopSell = sourceRate?.stopSell ?? currentStopSell;
                break;
              case 'SET_AVAILABILITY':
                newAvailability = operation.value;
                newRate = currentRate || 0;
                break;
              case 'SET_STOP_SELL':
                newStopSell = operation.stopSell ?? false;
                newRate = currentRate || 0;
                break;
            }
            
            // Ensure rate is not negative
            newRate = Math.max(0, newRate);
            
            const hasChange = 
              newRate !== currentRate ||
              newAvailability !== currentAvailability ||
              newStopSell !== currentStopSell;
            
            changes.push({
              roomTypeId,
              roomTypeName: roomType?.name || '',
              ratePlanId,
              ratePlanName: ratePlan?.name || '',
              date: dateStr,
              currentRate,
              newRate,
              currentAvailability,
              newAvailability,
              currentStopSell,
              newStopSell,
              hasChange
            });
          }
        }
      }
      
      setPreviewChanges(changes);
      setShowPreview(true);
    } catch (error) {
      toast.error('Failed to generate preview');
    } finally {
      setIsPreviewing(false);
    }
  };

  // Apply changes
  const handleApplyChanges = async () => {
    const changesToApply = previewChanges.filter(c => c.hasChange);
    
    if (changesToApply.length === 0) {
      toast.info('No changes to apply');
      return;
    }

    setIsApplying(true);
    setApplyProgress(0);
    
    try {
      let completed = 0;
      const total = changesToApply.length;
      
      for (const change of changesToApply) {
        const ratePlan = ratePlans.find(rp => rp.id === change.ratePlanId);
        const roomType = roomTypes.find(rt => rt.id === change.roomTypeId);
        
        if (!ratePlan || !roomType) continue;
        
        const key = `${change.ratePlanId}-${change.roomTypeId}-${change.date}`;
        const existingRate = existingRates.get(key);
        
        const payload: CreateRoomRateRequest = {
          ratePlanCode: ratePlan.code,
          roomTypeCode: roomType.code,
          rateDate: change.date,
          rateAmount: change.newRate,
          availabilityCount: change.newAvailability,
          stopSell: change.newStopSell,
        };
        
        try {
          if (existingRate) {
            await roomRateApi.updateRoomRate(existingRate.id, payload);
          } else {
            await roomRateApi.createRoomRate(payload);
          }
        } catch (error) {
          console.error(`Failed to update rate for ${key}`, error);
        }
        
        completed++;
        setApplyProgress((completed / total) * 100);
      }
      
      toast.success(`Successfully updated ${completed} rates`);
      setShowPreview(false);
      setPreviewChanges([]);
      onComplete?.();
    } catch (error) {
      toast.error('Failed to apply changes');
    } finally {
      setIsApplying(false);
      setApplyProgress(0);
    }
  };

  // Summary stats
  const summaryStats = useMemo(() => {
    if (previewChanges.length === 0) return null;
    
    const changesOnly = previewChanges.filter(c => c.hasChange);
    const rateChanges = changesOnly.filter(c => c.newRate !== c.currentRate);
    const avgChange = rateChanges.length > 0 
      ? rateChanges.reduce((sum, c) => sum + (c.newRate - (c.currentRate || 0)), 0) / rateChanges.length
      : 0;
    
    return {
      total: previewChanges.length,
      changes: changesOnly.length,
      unchanged: previewChanges.length - changesOnly.length,
      avgRateChange: avgChange
    };
  }, [previewChanges]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <RefreshCw className="h-6 w-6 animate-spin mr-3" />
        <span>Loading data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-b">
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-amber-600" />
            Bulk Rate Operations
          </CardTitle>
          <CardDescription>
            Update multiple rates at once across date ranges, room types, and rate plans
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Step 1: Date Range */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-full">1</Badge>
              <h3 className="text-lg font-semibold">Select Date Range</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            
            {/* Days of week filter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Apply to Days</Label>
                <Button variant="link" size="sm" className="h-auto p-0" onClick={toggleAllDays}>
                  {selectedDays.length === DAYS_OF_WEEK.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {DAYS_OF_WEEK.map(day => (
                  <Button
                    key={day}
                    variant={selectedDays.includes(day) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleDay(day)}
                    className={cn(
                      "min-w-[60px]",
                      (day === 'SATURDAY' || day === 'SUNDAY') && selectedDays.includes(day) && "bg-blue-600 hover:bg-blue-700"
                    )}
                  >
                    {day.slice(0, 3)}
                  </Button>
                ))}
              </div>
            </div>
            
            {datesInRange.length > 0 && (
              <div className="text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 inline mr-1" />
                {datesInRange.length} days selected ({differenceInDays(parseISO(endDate), parseISO(startDate)) + 1} total days in range)
              </div>
            )}
          </div>

          <Separator />

          {/* Step 2: Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-full">2</Badge>
              <h3 className="text-lg font-semibold">Select Room Types & Rate Plans</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Room Types */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Room Types</Label>
                  <Button variant="link" size="sm" className="h-auto p-0" onClick={toggleAllRoomTypes}>
                    {selectedRoomTypes.length === roomTypes.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                <ScrollArea className="h-40 rounded-md border p-3">
                  <div className="space-y-2">
                    {roomTypes.map(rt => (
                      <div key={rt.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`rt-${rt.id}`}
                          checked={selectedRoomTypes.includes(rt.id)}
                          onCheckedChange={() => toggleRoomType(rt.id)}
                        />
                        <label htmlFor={`rt-${rt.id}`} className="text-sm cursor-pointer flex-1">
                          <span className="font-medium">{rt.name}</span>
                          <span className="text-muted-foreground ml-2">({rt.code})</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="text-xs text-muted-foreground">
                  {selectedRoomTypes.length} of {roomTypes.length} selected
                </div>
              </div>

              {/* Rate Plans */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Rate Plans</Label>
                  <Button variant="link" size="sm" className="h-auto p-0" onClick={toggleAllRatePlans}>
                    {selectedRatePlans.length === ratePlans.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                <ScrollArea className="h-40 rounded-md border p-3">
                  <div className="space-y-2">
                    {ratePlans.map(rp => (
                      <div key={rp.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`rp-${rp.id}`}
                          checked={selectedRatePlans.includes(rp.id)}
                          onCheckedChange={() => toggleRatePlan(rp.id)}
                        />
                        <label htmlFor={`rp-${rp.id}`} className="text-sm cursor-pointer flex-1">
                          <span className="font-medium">{rp.name}</span>
                          <span className="text-muted-foreground ml-2">({rp.code})</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="text-xs text-muted-foreground">
                  {selectedRatePlans.length} of {ratePlans.length} selected
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Step 3: Operation */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-full">3</Badge>
              <h3 className="text-lg font-semibold">Choose Operation</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {OPERATION_OPTIONS.map(op => {
                const Icon = op.icon;
                const isSelected = operation.type === op.value;
                return (
                  <div
                    key={op.value}
                    onClick={() => setOperation({ type: op.value as OperationType })}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-all",
                      "hover:border-primary/50 hover:bg-muted/50",
                      isSelected && "border-primary bg-primary/5 ring-2 ring-primary/20"
                    )}
                  >
                    <Icon className={cn("h-6 w-6", isSelected && "text-primary")} />
                    <span className="text-sm font-medium text-center">{op.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Operation value input */}
            <div className="p-4 rounded-lg border bg-muted/30">
              {(operation.type === 'SET_RATE' || operation.type === 'INCREASE_FIXED' || operation.type === 'DECREASE_FIXED') && (
                <div className="space-y-2">
                  <Label>Amount ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={operation.value ?? ''}
                      onChange={(e) => setOperation({ ...operation, value: parseFloat(e.target.value) || undefined })}
                      className="pl-9"
                    />
                  </div>
                </div>
              )}

              {(operation.type === 'INCREASE_PERCENT' || operation.type === 'DECREASE_PERCENT') && (
                <div className="space-y-2">
                  <Label>Percentage (%)</Label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      placeholder="0"
                      value={operation.value ?? ''}
                      onChange={(e) => setOperation({ ...operation, value: parseFloat(e.target.value) || undefined })}
                      className="pl-9"
                    />
                  </div>
                </div>
              )}

              {operation.type === 'COPY_FROM_DATE' && (
                <div className="space-y-2">
                  <Label>Source Date</Label>
                  <Input
                    type="date"
                    value={operation.sourceDate || ''}
                    onChange={(e) => setOperation({ ...operation, sourceDate: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Rates from this date will be copied to all selected dates
                  </p>
                </div>
              )}

              {operation.type === 'SET_AVAILABILITY' && (
                <div className="space-y-2">
                  <Label>Availability Count</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="10"
                    value={operation.value ?? ''}
                    onChange={(e) => setOperation({ ...operation, value: parseInt(e.target.value) || undefined })}
                  />
                </div>
              )}

              {operation.type === 'SET_STOP_SELL' && (
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Stop Sell Status</Label>
                    <p className="text-xs text-muted-foreground">Enable to prevent bookings</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={operation.stopSell === true ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => setOperation({ ...operation, stopSell: true })}
                    >
                      <Ban className="h-4 w-4 mr-1" />
                      Enable
                    </Button>
                    <Button
                      type="button"
                      variant={operation.stopSell === false ? "default" : "outline"}
                      size="sm"
                      onClick={() => setOperation({ ...operation, stopSell: false })}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Disable
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          {totalOperations > 0 && (
            <Alert>
              <Calculator className="h-4 w-4" />
              <AlertTitle>Operation Summary</AlertTitle>
              <AlertDescription>
                This will affect <strong>{totalOperations}</strong> rate entries 
                ({datesInRange.length} dates × {selectedRoomTypes.length} room types × {selectedRatePlans.length} rate plans)
              </AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="border-t bg-muted/30 flex justify-between">
          <div className="text-sm text-muted-foreground">
            {showPreview ? `${previewChanges.filter(c => c.hasChange).length} changes to apply` : 'Preview changes before applying'}
          </div>
          <div className="flex gap-3">
            {showPreview && (
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel Preview
              </Button>
            )}
            <Button 
              onClick={handleGeneratePreview}
              disabled={isPreviewing || totalOperations === 0}
            >
              {isPreviewing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Changes
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Preview Panel */}
      {showPreview && previewChanges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Preview Changes
            </CardTitle>
            <CardDescription>
              Review the changes before applying them
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Summary stats */}
            {summaryStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <div className="text-2xl font-bold">{summaryStats.total}</div>
                  <div className="text-xs text-muted-foreground">Total Entries</div>
                </div>
                <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-center">
                  <div className="text-2xl font-bold text-emerald-600">{summaryStats.changes}</div>
                  <div className="text-xs text-muted-foreground">With Changes</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <div className="text-2xl font-bold">{summaryStats.unchanged}</div>
                  <div className="text-xs text-muted-foreground">Unchanged</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <div className={cn(
                    "text-2xl font-bold",
                    summaryStats.avgRateChange > 0 && "text-emerald-600",
                    summaryStats.avgRateChange < 0 && "text-rose-600"
                  )}>
                    {summaryStats.avgRateChange >= 0 ? '+' : ''}{summaryStats.avgRateChange.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">Avg Rate Change</div>
                </div>
              </div>
            )}

            {/* Changes table */}
            <ScrollArea className="h-[400px] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Room Type</TableHead>
                    <TableHead>Rate Plan</TableHead>
                    <TableHead className="text-right">Current</TableHead>
                    <TableHead className="text-center">→</TableHead>
                    <TableHead className="text-right">New</TableHead>
                    <TableHead className="text-center">Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewChanges.filter(c => c.hasChange).slice(0, 100).map((change, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm">
                        {format(parseISO(change.date), 'MMM dd')}
                        {isWeekend(parseISO(change.date)) && (
                          <Badge variant="outline" className="ml-2 text-[10px]">WE</Badge>
                        )}
                      </TableCell>
                      <TableCell>{change.roomTypeName}</TableCell>
                      <TableCell>{change.ratePlanName}</TableCell>
                      <TableCell className="text-right font-mono">
                        {change.currentRate !== undefined ? `$${change.currentRate.toFixed(2)}` : '—'}
                      </TableCell>
                      <TableCell className="text-center">
                        <ArrowRight className="h-4 w-4 mx-auto text-muted-foreground" />
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        ${change.newRate.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        {change.currentRate !== undefined && (
                          <Badge 
                            variant={change.newRate > change.currentRate ? 'default' : 'secondary'}
                            className={cn(
                              change.newRate > change.currentRate && "bg-emerald-500",
                              change.newRate < change.currentRate && "bg-rose-500"
                            )}
                          >
                            {change.newRate > change.currentRate ? '+' : ''}
                            {((change.newRate - change.currentRate) / change.currentRate * 100).toFixed(1)}%
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {previewChanges.filter(c => c.hasChange).length > 100 && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Showing first 100 of {previewChanges.filter(c => c.hasChange).length} changes
                </div>
              )}
            </ScrollArea>
          </CardContent>

          <CardFooter className="border-t bg-muted/30 flex justify-between">
            {isApplying ? (
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Applying changes...</span>
                </div>
                <Progress value={applyProgress} className="h-2" />
              </div>
            ) : (
              <>
                <Alert className="flex-1 mr-4" variant="default">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This action will modify {previewChanges.filter(c => c.hasChange).length} rate entries. This cannot be undone.
                  </AlertDescription>
                </Alert>
                <Button onClick={handleApplyChanges} className="bg-emerald-600 hover:bg-emerald-700">
                  <Check className="h-4 w-4 mr-2" />
                  Apply {previewChanges.filter(c => c.hasChange).length} Changes
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

