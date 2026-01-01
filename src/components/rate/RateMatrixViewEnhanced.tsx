import {useEffect, useMemo, useRef, useState} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Badge} from '@/components/ui/badge';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip';
import {ScrollArea, ScrollBar} from '@/components/ui/scroll-area';
import {
    Ban,
    Calendar,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    ClipboardPaste,
    Copy,
    DollarSign,
    Edit,
    Filter,
    Layers,
    Percent,
    RefreshCw,
    ZoomIn,
    ZoomOut
} from 'lucide-react';
import {
    addDays,
    addMonths,
    addWeeks,
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    format,
    isSameDay,
    isWeekend,
    startOfMonth,
    startOfWeek,
    subDays,
    subMonths,
    subWeeks
} from 'date-fns';
import {CreateRoomRateRequest, roomRateApi, RoomRateResponse} from '@/api/roomRate';
import {ratePlanApi, RatePlanResponse} from '@/api/ratePlan';
import {roomTypeApi, RoomTypeResponse} from '@/api/roomType';
import {toast} from 'sonner';
import {cn} from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

// Color coding configuration based on rate ranges
const getRateColorClass = (amount: number, baseRate?: number): string => {
  if (!baseRate) {
    // Absolute coloring based on amount
    if (amount < 100) return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200';
    if (amount < 200) return 'bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-200';
    if (amount < 300) return 'bg-sky-100 dark:bg-sky-900/40 text-sky-800 dark:text-sky-200';
    if (amount < 400) return 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200';
    if (amount < 500) return 'bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200';
    return 'bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-200';
  }
  
  // Relative coloring based on deviation from base rate
  const deviation = ((amount - baseRate) / baseRate) * 100;
  if (deviation < -20) return 'bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-200'; // Much lower
  if (deviation < -10) return 'bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200'; // Lower
  if (deviation < 10) return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200'; // Normal
  if (deviation < 20) return 'bg-sky-100 dark:bg-sky-900/40 text-sky-800 dark:text-sky-200'; // Higher
  return 'bg-violet-100 dark:bg-violet-900/40 text-violet-800 dark:text-violet-200'; // Much higher
};

// View mode types
type ViewMode = 'week' | 'month' | 'custom';
type CellDisplayMode = 'rate' | 'availability' | 'both';

interface CellData {
  rate?: RoomRateResponse;
  roomTypeId: number;
  ratePlanId: number;
  date: Date;
  key: string;
}

interface RateMatrixViewEnhancedProps {
  onEditRate?: (rate: RoomRateResponse, roomType: RoomTypeResponse, ratePlan: RatePlanResponse, date: Date) => void;
  onBulkUpdate?: (updates: Array<{ roomTypeId: number; ratePlanId: number; date: string; data: Partial<CreateRoomRateRequest> }>) => void;
}

export function RateMatrixViewEnhanced({ onEditRate, onBulkUpdate }: RateMatrixViewEnhancedProps) {
  // State management
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [cellDisplayMode, setCellDisplayMode] = useState<CellDisplayMode>('both');
  const [selectedRatePlans, setSelectedRatePlans] = useState<number[]>([]);
  const [selectedRoomTypes, setSelectedRoomTypes] = useState<number[]>([]);
  const [ratePlans, setRatePlans] = useState<RatePlanResponse[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[]>([]);
  const [rates, setRates] = useState<Map<string, RoomRateResponse>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Cell selection & editing
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [copiedCells, setCopiedCells] = useState<Map<string, RoomRateResponse>>(new Map());
  const [editingCell, setEditingCell] = useState<CellData | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isSelectingRange, setIsSelectingRange] = useState(false);
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [rangeEnd, setRangeEnd] = useState<string | null>(null);

  // Bulk edit dialog
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkOperation, setBulkOperation] = useState<'set' | 'increase_percent' | 'decrease_percent' | 'increase_fixed' | 'decrease_fixed'>('set');
  const [bulkValue, setBulkValue] = useState<string>('');
  const [bulkStopSell, setBulkStopSell] = useState<boolean | undefined>();
  const [bulkAvailability, setBulkAvailability] = useState<string>('');

  // Keyboard navigation ref
  const containerRef = useRef<HTMLDivElement>(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load rates when filters change
  useEffect(() => {
    if (selectedRatePlans.length > 0 && selectedRoomTypes.length > 0) {
      loadRates();
    } else {
      setRates(new Map());
    }
  }, [currentDate, viewMode, selectedRatePlans, selectedRoomTypes]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+C: Copy
      if (e.ctrlKey && e.key === 'c') {
        handleCopy();
        e.preventDefault();
      }
      // Ctrl+V: Paste
      if (e.ctrlKey && e.key === 'v') {
        handlePaste();
        e.preventDefault();
      }
      // Escape: Clear selection
      if (e.key === 'Escape') {
        setSelectedCells(new Set());
        setEditingCell(null);
        setIsSelectingRange(false);
        setRangeStart(null);
        setRangeEnd(null);
      }
      // Delete: Open bulk delete/clear
      if (e.key === 'Delete' && selectedCells.size > 0) {
        setShowBulkDialog(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCells, copiedCells]);

  const loadInitialData = async () => {
    try {
      const [ratePlansData, roomTypesData] = await Promise.all([
        ratePlanApi.getAllRatePlans(0, 1000),
        roomTypeApi.getAllRoomTypes(0, 1000)
      ]);
      setRatePlans(ratePlansData.content);
      setRoomTypes(roomTypesData.content);
      
      // Auto-select first items if available
      if (ratePlansData.content.length > 0 && roomTypesData.content.length > 0) {
        setSelectedRatePlans([ratePlansData.content[0].id]);
        setSelectedRoomTypes(roomTypesData.content.slice(0, 3).map(rt => rt.id));
      }
    } catch (error) {
      toast.error('Failed to load initial data');
    }
  };

  const loadRates = async () => {
    if (selectedRatePlans.length === 0 || selectedRoomTypes.length === 0) return;
    
    setIsLoading(true);
    try {
      const { startDate, endDate } = getDateRange();

      // Load rates for all combinations
      const ratePromises: Promise<any>[] = [];
      
      for (const ratePlanId of selectedRatePlans) {
        for (const roomTypeId of selectedRoomTypes) {
          const ratePlan = ratePlans.find(rp => rp.id === ratePlanId);
          const roomType = roomTypes.find(rt => rt.id === roomTypeId);
          
          if (ratePlan && roomType) {
            ratePromises.push(
              roomRateApi.getAllRoomRates(0, 1000, {
                ratePlanCode: ratePlan.code,
                roomTypeCode: roomType.code,
                startDate: format(startDate, 'yyyy-MM-dd'),
                endDate: format(endDate, 'yyyy-MM-dd')
              })
            );
          }
        }
      }

      const results = await Promise.all(ratePromises);
      const ratesMap = new Map<string, RoomRateResponse>();

      results.forEach((data, index) => {
        const ratePlanIndex = Math.floor(index / selectedRoomTypes.length);
        const roomTypeIndex = index % selectedRoomTypes.length;
        const ratePlanId = selectedRatePlans[ratePlanIndex];
        const roomTypeId = selectedRoomTypes[roomTypeIndex];

        data.content.forEach((rate: RoomRateResponse) => {
          const key = `${ratePlanId}-${roomTypeId}-${rate.rateDate}`;
          ratesMap.set(key, rate);
        });
      });

      setRates(ratesMap);
    } catch (error) {
      toast.error('Failed to load rates');
    } finally {
      setIsLoading(false);
    }
  };

  const getDateRange = () => {
    switch (viewMode) {
      case 'week':
        return {
          startDate: startOfWeek(currentDate, { weekStartsOn: 1 }),
          endDate: endOfWeek(currentDate, { weekStartsOn: 1 })
        };
      case 'month':
        return {
          startDate: startOfMonth(currentDate),
          endDate: endOfMonth(currentDate)
        };
      default:
        return {
          startDate: currentDate,
          endDate: addDays(currentDate, 30)
        };
    }
  };

  const days = useMemo(() => {
    const { startDate, endDate } = getDateRange();
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDate, viewMode]);

  const getRateKey = (ratePlanId: number, roomTypeId: number, date: Date) => {
    return `${ratePlanId}-${roomTypeId}-${format(date, 'yyyy-MM-dd')}`;
  };

  const getRate = (ratePlanId: number, roomTypeId: number, date: Date): RoomRateResponse | undefined => {
    const key = getRateKey(ratePlanId, roomTypeId, date);
    return rates.get(key);
  };

  // Navigation
  const navigate = (direction: 'prev' | 'next') => {
    switch (viewMode) {
      case 'week':
        setCurrentDate(direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1));
        break;
      case 'month':
        setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
        break;
      default:
        setCurrentDate(direction === 'prev' ? subDays(currentDate, 7) : addDays(currentDate, 7));
    }
  };

  // Cell selection handlers
  const handleCellMouseDown = (cellData: CellData, e: React.MouseEvent) => {
    if (e.shiftKey && rangeStart) {
      // Extend selection
      const newSelection = getSelectionRange(rangeStart, cellData.key);
      setSelectedCells(newSelection);
      setRangeEnd(cellData.key);
    } else if (e.ctrlKey || e.metaKey) {
      // Toggle individual cell
      const newSelection = new Set(selectedCells);
      if (newSelection.has(cellData.key)) {
        newSelection.delete(cellData.key);
      } else {
        newSelection.add(cellData.key);
      }
      setSelectedCells(newSelection);
    } else {
      // Start new selection
      setRangeStart(cellData.key);
      setSelectedCells(new Set([cellData.key]));
      setIsSelectingRange(true);
    }
  };

  const handleCellMouseEnter = (cellData: CellData) => {
    if (isSelectingRange && rangeStart) {
      const newSelection = getSelectionRange(rangeStart, cellData.key);
      setSelectedCells(newSelection);
      setRangeEnd(cellData.key);
    }
  };

  const handleCellMouseUp = () => {
    setIsSelectingRange(false);
  };

  const handleCellDoubleClick = (cellData: CellData) => {
    setEditingCell(cellData);
    setEditValue(cellData.rate?.rateAmount?.toString() || '');
  };

  const getSelectionRange = (startKey: string, endKey: string): Set<string> => {
    const selected = new Set<string>();
    const [startRatePlanId, startRoomTypeId, startDateStr] = startKey.split('-');
    const [endRatePlanId, endRoomTypeId, endDateStr] = endKey.split('-');
    
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    const minDate = startDate < endDate ? startDate : endDate;
    const maxDate = startDate > endDate ? startDate : endDate;

    // Get range of room types
    const startRoomTypeIdx = selectedRoomTypes.indexOf(parseInt(startRoomTypeId));
    const endRoomTypeIdx = selectedRoomTypes.indexOf(parseInt(endRoomTypeId));
    const minRoomTypeIdx = Math.min(startRoomTypeIdx, endRoomTypeIdx);
    const maxRoomTypeIdx = Math.max(startRoomTypeIdx, endRoomTypeIdx);

    // Get range of rate plans
    const startRatePlanIdx = selectedRatePlans.indexOf(parseInt(startRatePlanId));
    const endRatePlanIdx = selectedRatePlans.indexOf(parseInt(endRatePlanId));
    const minRatePlanIdx = Math.min(startRatePlanIdx, endRatePlanIdx);
    const maxRatePlanIdx = Math.max(startRatePlanIdx, endRatePlanIdx);

    // Generate all cells in range
    const datesInRange = eachDayOfInterval({ start: minDate, end: maxDate });
    for (let rpIdx = minRatePlanIdx; rpIdx <= maxRatePlanIdx; rpIdx++) {
      for (let rtIdx = minRoomTypeIdx; rtIdx <= maxRoomTypeIdx; rtIdx++) {
        for (const date of datesInRange) {
          const key = `${selectedRatePlans[rpIdx]}-${selectedRoomTypes[rtIdx]}-${format(date, 'yyyy-MM-dd')}`;
          selected.add(key);
        }
      }
    }

    return selected;
  };

  // Copy/Paste handlers
  const handleCopy = () => {
    if (selectedCells.size === 0) {
      toast.error('No cells selected');
      return;
    }

    const copied = new Map<string, RoomRateResponse>();
    selectedCells.forEach(key => {
      const rate = rates.get(key);
      if (rate) {
        copied.set(key, rate);
      }
    });

    setCopiedCells(copied);
    toast.success(`Copied ${selectedCells.size} cell(s)`);
  };

  const handlePaste = async () => {
    if (copiedCells.size === 0) {
      toast.error('No cells copied');
      return;
    }

    if (selectedCells.size === 0) {
      toast.error('No cells selected for paste');
      return;
    }

    try {
      const updates: Array<{ roomTypeId: number; ratePlanId: number; date: string; data: Partial<CreateRoomRateRequest> }> = [];
      const copiedArray = Array.from(copiedCells.values());
      const selectedArray = Array.from(selectedCells);

      selectedArray.forEach((cellKey, index) => {
        const [ratePlanId, roomTypeId, date] = cellKey.split('-');
        const sourceRate = copiedArray[index % copiedArray.length];
        
        if (sourceRate) {
          const ratePlan = ratePlans.find(rp => rp.id === parseInt(ratePlanId));
          const roomType = roomTypes.find(rt => rt.id === parseInt(roomTypeId));
          
          if (ratePlan && roomType) {
            updates.push({
              roomTypeId: parseInt(roomTypeId),
              ratePlanId: parseInt(ratePlanId),
              date,
              data: {
                ratePlanCode: ratePlan.code,
                roomTypeCode: roomType.code,
                rateDate: date,
                rateAmount: sourceRate.rateAmount,
                availabilityCount: sourceRate.availabilityCount,
                stopSell: sourceRate.stopSell,
              }
            });
          }
        }
      });

      if (onBulkUpdate) {
        onBulkUpdate(updates);
      } else {
        for (const update of updates) {
          try {
            const existingRate = rates.get(`${update.ratePlanId}-${update.roomTypeId}-${update.date}`);
            if (existingRate) {
              await roomRateApi.updateRoomRate(existingRate.id, update.data as CreateRoomRateRequest);
            } else {
              await roomRateApi.createRoomRate(update.data as CreateRoomRateRequest);
            }
          } catch (error) {
            console.error('Failed to update rate', error);
          }
        }
        toast.success(`Pasted ${updates.length} rate(s)`);
        loadRates();
      }

      setSelectedCells(new Set());
    } catch (error) {
      toast.error('Failed to paste rates');
    }
  };

  // Inline edit save
  const handleSaveEdit = async () => {
    if (!editingCell) return;

    const ratePlan = ratePlans.find(rp => rp.id === editingCell.ratePlanId);
    const roomType = roomTypes.find(rt => rt.id === editingCell.roomTypeId);

    if (!ratePlan || !roomType || !editValue) {
      setEditingCell(null);
      return;
    }

    try {
      const rateAmount = parseFloat(editValue);
      if (isNaN(rateAmount) || rateAmount < 0) {
        toast.error('Invalid rate amount');
        return;
      }

      const payload: CreateRoomRateRequest = {
        ratePlanCode: ratePlan.code,
        roomTypeCode: roomType.code,
        rateDate: format(editingCell.date, 'yyyy-MM-dd'),
        rateAmount: rateAmount,
      };

      if (editingCell.rate) {
        await roomRateApi.updateRoomRate(editingCell.rate.id, payload);
        toast.success('Rate updated');
      } else {
        await roomRateApi.createRoomRate(payload);
        toast.success('Rate created');
      }

      setEditingCell(null);
      setEditValue('');
      loadRates();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save rate');
    }
  };

  // Bulk operations
  const handleBulkApply = async () => {
    if (selectedCells.size === 0) {
      toast.error('No cells selected');
      return;
    }

    if (!bulkValue && bulkStopSell === undefined && !bulkAvailability) {
      toast.error('Please enter a value');
      return;
    }

    try {
      const updates: CreateRoomRateRequest[] = [];

      for (const cellKey of selectedCells) {
        const [ratePlanId, roomTypeId, date] = cellKey.split('-');
        const ratePlan = ratePlans.find(rp => rp.id === parseInt(ratePlanId));
        const roomType = roomTypes.find(rt => rt.id === parseInt(roomTypeId));
        const existingRate = rates.get(cellKey);

        if (!ratePlan || !roomType) continue;

        let newAmount = existingRate?.rateAmount || 0;
        const value = parseFloat(bulkValue);

        switch (bulkOperation) {
          case 'set':
            newAmount = value;
            break;
          case 'increase_percent':
            newAmount = newAmount * (1 + value / 100);
            break;
          case 'decrease_percent':
            newAmount = newAmount * (1 - value / 100);
            break;
          case 'increase_fixed':
            newAmount = newAmount + value;
            break;
          case 'decrease_fixed':
            newAmount = newAmount - value;
            break;
        }

        updates.push({
          ratePlanCode: ratePlan.code,
          roomTypeCode: roomType.code,
          rateDate: date,
          rateAmount: Math.max(0, newAmount),
          stopSell: bulkStopSell,
          availabilityCount: bulkAvailability ? parseInt(bulkAvailability) : undefined,
        });
      }

      // Apply updates
      for (const update of updates) {
        const key = `${selectedRatePlans.find(rp => ratePlans.find(p => p.id === rp)?.code === update.ratePlanCode)}-${selectedRoomTypes.find(rt => roomTypes.find(t => t.id === rt)?.code === update.roomTypeCode)}-${update.rateDate}`;
        const existingRate = rates.get(key);

        if (existingRate) {
          await roomRateApi.updateRoomRate(existingRate.id, update);
        } else {
          await roomRateApi.createRoomRate(update);
        }
      }

      toast.success(`Updated ${updates.length} rate(s)`);
      setShowBulkDialog(false);
      setBulkValue('');
      setBulkStopSell(undefined);
      setBulkAvailability('');
      setSelectedCells(new Set());
      loadRates();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to apply bulk update');
    }
  };

  // Toggle functions
  const toggleRatePlan = (ratePlanId: number) => {
    setSelectedRatePlans(prev => 
      prev.includes(ratePlanId) 
        ? prev.filter(id => id !== ratePlanId)
        : [...prev, ratePlanId]
    );
  };

  const toggleRoomType = (roomTypeId: number) => {
    setSelectedRoomTypes(prev => 
      prev.includes(roomTypeId) 
        ? prev.filter(id => id !== roomTypeId)
        : [...prev, roomTypeId]
    );
  };

  const selectAllRatePlans = () => {
    if (selectedRatePlans.length === ratePlans.length) {
      setSelectedRatePlans([]);
    } else {
      setSelectedRatePlans(ratePlans.map(rp => rp.id));
    }
  };

  const selectAllRoomTypes = () => {
    if (selectedRoomTypes.length === roomTypes.length) {
      setSelectedRoomTypes([]);
    } else {
      setSelectedRoomTypes(roomTypes.map(rt => rt.id));
    }
  };

  // Render cell content
  const renderCellContent = (cellData: CellData) => {
    const { rate } = cellData;
    const isSelected = selectedCells.has(cellData.key);
    const isEditing = editingCell?.key === cellData.key;
    const isWeekendDay = isWeekend(cellData.date);
    const isCopied = copiedCells.has(cellData.key);

    if (isEditing) {
      return (
        <div className="flex items-center p-1">
          <Input
            type="number"
            step="0.01"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveEdit();
              if (e.key === 'Escape') {
                setEditingCell(null);
                setEditValue('');
              }
            }}
            className="h-8 text-xs w-full"
            autoFocus
          />
        </div>
      );
    }

    if (!rate) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50">
          <span className="text-xs">—</span>
        </div>
      );
    }

    const rateColorClass = getRateColorClass(rate.rateAmount);

    return (
      <div className={cn(
        "flex flex-col items-center justify-center h-full p-1 transition-all",
        rateColorClass,
        rate.stopSell && "opacity-60 relative"
      )}>
        {rate.stopSell && (
          <div className="absolute top-0.5 right-0.5">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Ban className="h-3 w-3 text-destructive" />
                </TooltipTrigger>
                <TooltipContent>Stop Sell Active</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
        
        {(cellDisplayMode === 'rate' || cellDisplayMode === 'both') && (
          <span className="text-sm font-bold tabular-nums">
            ${rate.rateAmount.toFixed(0)}
          </span>
        )}
        
        {(cellDisplayMode === 'availability' || cellDisplayMode === 'both') && rate.availabilityCount !== undefined && (
          <span className={cn(
            "text-[10px] font-medium",
            rate.availabilityCount <= 2 && "text-destructive",
            rate.availabilityCount > 2 && rate.availabilityCount <= 5 && "text-amber-600",
            rate.availabilityCount > 5 && "text-emerald-600"
          )}>
            {rate.availabilityCount} avl
          </span>
        )}
      </div>
    );
  };

  // Main cell styles
  const getCellStyles = (cellData: CellData) => {
    const isSelected = selectedCells.has(cellData.key);
    const isCopied = copiedCells.has(cellData.key);
    const isWeekendDay = isWeekend(cellData.date);
    const isToday = isSameDay(cellData.date, new Date());

    return cn(
      "border border-border/50 cursor-pointer transition-all select-none",
      "hover:ring-2 hover:ring-primary/30",
      isSelected && "ring-2 ring-primary bg-primary/10",
      isCopied && !isSelected && "ring-2 ring-amber-500/50 bg-amber-50 dark:bg-amber-900/20",
      isWeekendDay && !isSelected && "bg-muted/30",
      isToday && "ring-2 ring-indigo-500"
    );
  };

  // Calculate min cell width based on zoom
  const cellWidth = Math.round(80 * zoomLevel);
  const cellHeight = Math.round(52 * zoomLevel);

  return (
    <TooltipProvider>
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  Rate Matrix
                </CardTitle>
                <CardDescription>
                  Oracle OPERA style rate management grid
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(showFilters && "bg-muted")}
                >
                  <Filter className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-1 border rounded-md p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
                    disabled={zoomLevel <= 0.5}
                    className="h-7 w-7"
                  >
                    <ZoomOut className="h-3 w-3" />
                  </Button>
                  <span className="text-xs w-10 text-center">{Math.round(zoomLevel * 100)}%</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setZoomLevel(Math.min(1.5, zoomLevel + 0.1))}
                    disabled={zoomLevel >= 1.5}
                    className="h-7 w-7"
                  >
                    <ZoomIn className="h-3 w-3" />
                  </Button>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={loadRates}
                  disabled={isLoading}
                >
                  <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                </Button>
              </div>
            </div>

            {/* Navigation & Controls */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Date Navigation */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => navigate('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="min-w-[180px] text-center">
                  <span className="font-semibold">
                    {viewMode === 'week' && (
                      <>
                        {format(days[0], 'MMM dd')} - {format(days[days.length - 1], 'MMM dd, yyyy')}
                      </>
                    )}
                    {viewMode === 'month' && format(currentDate, 'MMMM yyyy')}
                  </span>
                </div>
                <Button variant="outline" size="icon" onClick={() => navigate('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())}>
                  Today
                </Button>
              </div>

              {/* View Mode */}
              <Select value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>

              {/* Display Mode */}
              <Select value={cellDisplayMode} onValueChange={(v) => setCellDisplayMode(v as CellDisplayMode)}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rate">Rate Only</SelectItem>
                  <SelectItem value="availability">Availability Only</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex-1" />

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  disabled={selectedCells.size === 0}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePaste}
                  disabled={copiedCells.size === 0 || selectedCells.size === 0}
                >
                  <ClipboardPaste className="h-4 w-4 mr-2" />
                  Paste
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowBulkDialog(true)}
                  disabled={selectedCells.size === 0}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Bulk Edit ({selectedCells.size})
                </Button>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4 border-t">
                {/* Room Types */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Room Types</Label>
                    <Button variant="link" size="sm" className="h-auto p-0" onClick={selectAllRoomTypes}>
                      {selectedRoomTypes.length === roomTypes.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                    {roomTypes.map(rt => (
                      <Badge
                        key={rt.id}
                        variant={selectedRoomTypes.includes(rt.id) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleRoomType(rt.id)}
                      >
                        {rt.code}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Rate Plans */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Rate Plans</Label>
                    <Button variant="link" size="sm" className="h-auto p-0" onClick={selectAllRatePlans}>
                      {selectedRatePlans.length === ratePlans.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                    {ratePlans.map(rp => (
                      <Badge
                        key={rp.id}
                        variant={selectedRatePlans.includes(rp.id) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleRatePlan(rp.id)}
                      >
                        {rp.code}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <RefreshCw className="h-6 w-6 animate-spin mr-3" />
              Loading rates...
            </div>
          ) : selectedRatePlans.length === 0 || selectedRoomTypes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Calendar className="h-12 w-12 mb-4 opacity-30" />
              <p className="text-lg font-medium">No Selection</p>
              <p className="text-sm">Please select at least one rate plan and one room type</p>
            </div>
          ) : (
            <div 
              ref={containerRef}
              className="overflow-auto"
              onMouseUp={handleCellMouseUp}
              onMouseLeave={handleCellMouseUp}
            >
              <ScrollArea className="w-full">
                <table className="w-full border-collapse" style={{ fontSize: `${12 * zoomLevel}px` }}>
                  <thead>
                    <tr>
                      <th 
                        className="sticky left-0 z-20 bg-background border-b border-r p-2 text-left"
                        style={{ minWidth: 180 }}
                      >
                        <div className="font-semibold text-sm">Room / Rate</div>
                      </th>
                      {days.map(day => (
                        <th 
                          key={format(day, 'yyyy-MM-dd')} 
                          className={cn(
                            "border-b p-1 text-center",
                            isWeekend(day) && "bg-muted/50",
                            isSameDay(day, new Date()) && "bg-primary/10"
                          )}
                          style={{ minWidth: cellWidth }}
                        >
                          <div className="font-medium">{format(day, 'EEE')}</div>
                          <div className="text-muted-foreground text-[10px]">{format(day, 'MMM d')}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRoomTypes.map(roomTypeId => {
                      const roomType = roomTypes.find(rt => rt.id === roomTypeId);
                      return selectedRatePlans.map((ratePlanId, rpIndex) => {
                        const ratePlan = ratePlans.find(rp => rp.id === ratePlanId);
                        return (
                          <tr key={`${roomTypeId}-${ratePlanId}`}>
                            <td 
                              className={cn(
                                "sticky left-0 z-10 bg-background border-b border-r p-2",
                                rpIndex === 0 && "border-t-2 border-t-muted-foreground/20"
                              )}
                            >
                              <div className="flex flex-col">
                                {rpIndex === 0 && (
                                  <span className="font-semibold text-sm">{roomType?.name}</span>
                                )}
                                <span className={cn(
                                  "text-xs",
                                  rpIndex === 0 ? "text-muted-foreground" : "text-primary"
                                )}>
                                  {ratePlan?.code}
                                </span>
                              </div>
                            </td>
                            {days.map(day => {
                              const rate = getRate(ratePlanId, roomTypeId, day);
                              const cellKey = getRateKey(ratePlanId, roomTypeId, day);
                              const cellData: CellData = {
                                rate,
                                roomTypeId,
                                ratePlanId,
                                date: day,
                                key: cellKey
                              };
                              
                              return (
                                <td
                                  key={format(day, 'yyyy-MM-dd')}
                                  className={getCellStyles(cellData)}
                                  style={{ minWidth: cellWidth, height: cellHeight }}
                                  onMouseDown={(e) => handleCellMouseDown(cellData, e)}
                                  onMouseEnter={() => handleCellMouseEnter(cellData)}
                                  onDoubleClick={() => handleCellDoubleClick(cellData)}
                                >
                                  {renderCellContent(cellData)}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      });
                    })}
                  </tbody>
                </table>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          )}
        </CardContent>

        {/* Color Legend */}
        {!isLoading && (selectedRatePlans.length > 0 && selectedRoomTypes.length > 0) && (
          <div className="border-t p-3 bg-muted/20">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="font-medium">Legend:</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-emerald-100 dark:bg-emerald-900/40" />
                <span>&lt;$100</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-teal-100 dark:bg-teal-900/40" />
                <span>$100-$200</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-sky-100 dark:bg-sky-900/40" />
                <span>$200-$300</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-amber-100 dark:bg-amber-900/40" />
                <span>$300-$400</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-orange-100 dark:bg-orange-900/40" />
                <span>$400-$500</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-rose-100 dark:bg-rose-900/40" />
                <span>&gt;$500</span>
              </div>
              <div className="flex items-center gap-1 ml-4">
                <Ban className="h-4 w-4 text-destructive" />
                <span>Stop Sell</span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Bulk Edit Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Rate Update</DialogTitle>
            <DialogDescription>
              Update {selectedCells.size} selected cell(s)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Operation</Label>
              <Select value={bulkOperation} onValueChange={(v) => setBulkOperation(v as typeof bulkOperation)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="set">Set Rate</SelectItem>
                  <SelectItem value="increase_percent">Increase by %</SelectItem>
                  <SelectItem value="decrease_percent">Decrease by %</SelectItem>
                  <SelectItem value="increase_fixed">Increase by $</SelectItem>
                  <SelectItem value="decrease_fixed">Decrease by $</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Value</Label>
              <div className="relative">
                {(bulkOperation === 'increase_percent' || bulkOperation === 'decrease_percent') ? (
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                ) : (
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                )}
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={bulkValue}
                  onChange={(e) => setBulkValue(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Availability (optional)</Label>
              <Input
                type="number"
                placeholder="Leave blank to keep unchanged"
                value={bulkAvailability}
                onChange={(e) => setBulkAvailability(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Stop Sell</Label>
              <div className="flex gap-2">
                <Button
                  variant={bulkStopSell === true ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => setBulkStopSell(bulkStopSell === true ? undefined : true)}
                >
                  <Ban className="h-4 w-4 mr-1" />
                  On
                </Button>
                <Button
                  variant={bulkStopSell === false ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBulkStopSell(bulkStopSell === false ? undefined : false)}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Off
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkApply}>
              Apply Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}

