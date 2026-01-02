import {useEffect, useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {ChevronLeft, ChevronRight, ClipboardPaste, Copy} from 'lucide-react';
import {addWeeks, eachDayOfInterval, endOfWeek, format, startOfWeek, subWeeks} from 'date-fns';
import {CreateRoomRateRequest, roomRateApi, RoomRateResponse} from '@/api/roomRate';
import {ratePlanApi, RatePlanResponse} from '../..';
import {roomTypeApi, RoomTypeResponse} from '@/api/roomType';
import {toast} from 'sonner';
import {cn} from '@/lib/utils';

interface RateMatrixViewProps {
  onEditRate?: (rate: RoomRateResponse, roomType: RoomTypeResponse, ratePlan: RatePlanResponse, date: Date) => void;
  onBulkUpdate?: (updates: Array<{ roomTypeId: number; ratePlanId: number; date: string; data: Partial<CreateRoomRateRequest> }>) => void;
}

export function RateMatrixView({ onEditRate, onBulkUpdate }: RateMatrixViewProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedRatePlans, setSelectedRatePlans] = useState<number[]>([]);
  const [selectedRoomTypes, setSelectedRoomTypes] = useState<number[]>([]);
  const [ratePlans, setRatePlans] = useState<RatePlanResponse[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[]>([]);
  const [rates, setRates] = useState<Map<string, RoomRateResponse>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [editingCell, setEditingCell] = useState<{ roomTypeId: number; ratePlanId: number; date: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [copiedRates, setCopiedRates] = useState<Map<string, RoomRateResponse>>(new Map());
  const [isSelectingRange, setIsSelectingRange] = useState(false);
  const [rangeStart, setRangeStart] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedRatePlans.length > 0 && selectedRoomTypes.length > 0) {
      loadRates();
    } else {
      setRates(new Map());
    }
  }, [currentWeek, selectedRatePlans, selectedRoomTypes]);

  const loadInitialData = async () => {
    try {
      const [ratePlansData, roomTypesData] = await Promise.all([
        ratePlanApi.getAllRatePlans(0, 1000),
        roomTypeApi.getAllRoomTypes(0, 1000)
      ]);
      setRatePlans(ratePlansData.content);
      setRoomTypes(roomTypesData.content);
    } catch (error) {
      toast.error('Failed to load data');
    }
  };

  const loadRates = async () => {
    if (selectedRatePlans.length === 0 || selectedRoomTypes.length === 0) return;
    
    setIsLoading(true);
    try {
      const weekStart = startOfWeek(currentWeek);
      const weekEnd = endOfWeek(currentWeek);
      const startDate = format(weekStart, 'yyyy-MM-dd');
      const endDate = format(weekEnd, 'yyyy-MM-dd');

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
                startDate,
                endDate
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

  const weekStart = startOfWeek(currentWeek);
  const weekEnd = endOfWeek(currentWeek);
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getRateKey = (ratePlanId: number, roomTypeId: number, date: Date) => {
    return `${ratePlanId}-${roomTypeId}-${format(date, 'yyyy-MM-dd')}`;
  };

  const getRate = (ratePlanId: number, roomTypeId: number, date: Date): RoomRateResponse | undefined => {
    const key = getRateKey(ratePlanId, roomTypeId, date);
    return rates.get(key);
  };

  const handleCellClick = (ratePlanId: number, roomTypeId: number, date: Date, rate?: RoomRateResponse) => {
    const cellKey = getRateKey(ratePlanId, roomTypeId, date);

    if (isSelectingRange) {
      if (!rangeStart) {
        setRangeStart(cellKey);
        setSelectedCells(new Set([cellKey]));
      } else {
        // Select range
        const start = rangeStart;
        const end = cellKey;
        const selected = new Set<string>();
        
        // Simple range selection (can be improved)
        selected.add(start);
        selected.add(end);
        setSelectedCells(selected);
        setIsSelectingRange(false);
        setRangeStart(null);
      }
    } else {
      const ratePlan = ratePlans.find(rp => rp.id === ratePlanId);
      const roomType = roomTypes.find(rt => rt.id === roomTypeId);
      
      if (rate && onEditRate && ratePlan && roomType) {
        onEditRate(rate, roomType, ratePlan, date);
      } else {
        // Start editing
        setEditingCell({ roomTypeId, ratePlanId, date: format(date, 'yyyy-MM-dd') });
        setEditValue(rate?.rateAmount.toString() || '');
      }
    }
  };

  const handleCellDoubleClick = (ratePlanId: number, roomTypeId: number, date: Date) => {
    setEditingCell({ roomTypeId, ratePlanId, date: format(date, 'yyyy-MM-dd') });
    const rate = getRate(ratePlanId, roomTypeId, date);
    setEditValue(rate?.rateAmount.toString() || '');
  };

  const handleSaveEdit = async () => {
    if (!editingCell) return;

    const ratePlan = ratePlans.find(rp => rp.id === editingCell.ratePlanId);
    const roomType = roomTypes.find(rt => rt.id === editingCell.roomTypeId);

    if (!ratePlan || !roomType || !editValue) {
      toast.error('Invalid data');
      return;
    }

    try {
      const rateAmount = parseFloat(editValue);
      if (isNaN(rateAmount) || rateAmount < 0) {
        toast.error('Invalid rate amount');
        return;
      }

      const existingRate = getRate(editingCell.ratePlanId, editingCell.roomTypeId, new Date(editingCell.date));
      
      const payload: CreateRoomRateRequest = {
        ratePlanCode: ratePlan.code,
        roomTypeCode: roomType.code,
        rateDate: editingCell.date,
        rateAmount: rateAmount,
      };

      if (existingRate) {
        await roomRateApi.updateRoomRate(existingRate.id, payload);
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

  const handleCopy = () => {
    if (selectedCells.size === 0) {
      toast.error('No cells selected');
      return;
    }

    const copied = new Map<string, RoomRateResponse>();
    selectedCells.forEach(key => {
      const rate = Array.from(rates.values()).find(r => {
        const ratePlan = ratePlans.find(rp => rp.id === parseInt(key.split('-')[0]));
        const roomType = roomTypes.find(rt => rt.id === parseInt(key.split('-')[1]));
        return rate && ratePlan && roomType &&
               rate.ratePlan?.code === ratePlan.code &&
               rate.roomTypeResponse?.code === roomType.code &&
               rate.rateDate === key.split('-')[2];
      });
      if (rate) {
        copied.set(key, rate);
      }
    });

    setCopiedRates(copied);
    toast.success(`Copied ${copied.size} rate(s)`);
  };

  const handlePaste = async () => {
    if (copiedRates.size === 0) {
      toast.error('No rates copied');
      return;
    }

    if (selectedCells.size === 0) {
      toast.error('No cells selected for paste');
      return;
    }

    try {
      const updates: Array<{ roomTypeId: number; ratePlanId: number; date: string; data: Partial<CreateRoomRateRequest> }> = [];
      
      const copiedArray = Array.from(copiedRates.values());
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
              }
            });
          }
        }
      });

      if (onBulkUpdate) {
        onBulkUpdate(updates);
      } else {
        // Fallback: update individually
        for (const update of updates) {
          try {
            await roomRateApi.createRoomRate(update.data as CreateRoomRateRequest);
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

  const handleBulkUpdate = async () => {
    if (selectedCells.size === 0) {
      toast.error('No cells selected');
      return;
    }

    // This would open a bulk update dialog
    // For now, just show a message
    toast.info('Bulk update feature - select cells and use the bulk update button');
  };

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

  const isCellSelected = (ratePlanId: number, roomTypeId: number, date: Date) => {
    const key = getRateKey(ratePlanId, roomTypeId, date);
    return selectedCells.has(key);
  };

  const isCellEditing = (ratePlanId: number, roomTypeId: number, date: Date) => {
    if (!editingCell) return false;
    return editingCell.ratePlanId === ratePlanId &&
           editingCell.roomTypeId === roomTypeId &&
           editingCell.date === format(date, 'yyyy-MM-dd');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4">
          <CardTitle>Rate Matrix</CardTitle>
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-4">
            {/* Week Navigation */}
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium min-w-[150px] text-center text-sm sm:text-base">
                {format(weekStart, 'MMM dd')} - {format(weekEnd, 'MMM dd, yyyy')}
              </span>
              <Button variant="outline" size="icon" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Rate Plan Selection */}
            <Select 
              value={selectedRatePlans.length > 0 ? selectedRatePlans[0].toString() : ''} 
              onValueChange={(v) => {
                if (v) {
                  setSelectedRatePlans([parseInt(v)]);
                } else {
                  setSelectedRatePlans([]);
                }
              }}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select Rate Plan" />
              </SelectTrigger>
              <SelectContent>
                {ratePlans.map(rp => (
                  <SelectItem key={rp.id} value={rp.id.toString()}>{rp.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Room Type Selection */}
            <Select 
              value={selectedRoomTypes.length > 0 ? selectedRoomTypes[0].toString() : ''} 
              onValueChange={(v) => {
                if (v) {
                  setSelectedRoomTypes([parseInt(v)]);
                } else {
                  setSelectedRoomTypes([]);
                }
              }}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select Room Type" />
              </SelectTrigger>
              <SelectContent>
                {roomTypes.map(rt => (
                  <SelectItem key={rt.id} value={rt.id.toString()}>{rt.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

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
                disabled={copiedRates.size === 0}
              >
                <ClipboardPaste className="h-4 w-4 mr-2" />
                Paste
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkUpdate}
                disabled={selectedCells.size === 0}
              >
                Bulk Update
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading rates...</div>
        ) : selectedRatePlans.length === 0 || selectedRoomTypes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Please select at least one rate plan and one room type
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 bg-background border p-2 text-left min-w-[150px]">
                      Room Type / Rate Plan
                    </th>
                    {days.map(day => (
                      <th key={format(day, 'yyyy-MM-dd')} className="border p-2 text-center min-w-[100px]">
                        <div className="text-xs font-medium">{format(day, 'EEE')}</div>
                        <div className="text-xs text-muted-foreground">{format(day, 'MMM dd')}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedRoomTypes.map(roomTypeId => {
                    const roomType = roomTypes.find(rt => rt.id === roomTypeId);
                    return selectedRatePlans.map(ratePlanId => {
                      const ratePlan = ratePlans.find(rp => rp.id === ratePlanId);
                      return (
                        <tr key={`${roomTypeId}-${ratePlanId}`}>
                          <td className="sticky left-0 z-10 bg-background border p-2 font-medium">
                            <div className="text-sm">{roomType?.name}</div>
                            <div className="text-xs text-muted-foreground">{ratePlan?.name}</div>
                          </td>
                          {days.map(day => {
                            const rate = getRate(ratePlanId, roomTypeId, day);
                            const isSelected = isCellSelected(ratePlanId, roomTypeId, day);
                            const isEditing = isCellEditing(ratePlanId, roomTypeId, day);
                            
                            return (
                              <td
                                key={format(day, 'yyyy-MM-dd')}
                                className={cn(
                                  "border p-1 text-center cursor-pointer transition-colors",
                                  isSelected && "bg-blue-100 dark:bg-blue-900",
                                  isEditing && "bg-yellow-100 dark:bg-yellow-900",
                                  !rate && "bg-muted/30"
                                )}
                                onClick={() => handleCellClick(ratePlanId, roomTypeId, day, rate)}
                                onDoubleClick={() => handleCellDoubleClick(ratePlanId, roomTypeId, day)}
                              >
                                {isEditing ? (
                                  <div className="flex items-center gap-1">
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      onBlur={handleSaveEdit}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleSaveEdit();
                                        } else if (e.key === 'Escape') {
                                          setEditingCell(null);
                                          setEditValue('');
                                        }
                                      }}
                                      className="h-8 text-xs"
                                      autoFocus
                                    />
                                  </div>
                                ) : (
                                  <div>
                                    {rate ? (
                                      <div className="text-sm font-semibold text-green-600">
                                        ${rate.rateAmount.toFixed(2)}
                                      </div>
                                    ) : (
                                      <div className="text-xs text-muted-foreground">-</div>
                                    )}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    });
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

