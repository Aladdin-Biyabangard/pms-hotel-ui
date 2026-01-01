import {useEffect, useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Badge} from '@/components/ui/badge';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import {
    addMonths,
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    format,
    isSameDay,
    startOfMonth,
    startOfWeek,
    subMonths
} from 'date-fns';
import {rateOverrideApi, RateOverrideResponse} from '../../api/rateOverride';
import {ratePlanApi, RatePlanResponse} from '@/api/ratePlan';
import {roomTypeApi, RoomTypeResponse} from '@/api/roomType';
import {toast} from 'sonner';
import {cn} from '@/lib/utils';

interface OverrideCalendarViewProps {
  onEditOverride?: (override: RateOverrideResponse) => void;
  onDateClick?: (date: Date, override?: RateOverrideResponse) => void;
}

export function OverrideCalendarView({ onEditOverride, onDateClick }: OverrideCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRatePlan, setSelectedRatePlan] = useState<number | null>(null);
  const [selectedRoomType, setSelectedRoomType] = useState<number | null>(null);
  const [ratePlans, setRatePlans] = useState<RatePlanResponse[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[]>([]);
  const [overrides, setOverrides] = useState<Map<string, RateOverrideResponse[]>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedRatePlan) {
      loadOverrides();
    } else {
      setOverrides(new Map());
    }
  }, [currentDate, selectedRatePlan, selectedRoomType]);

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

  const loadOverrides = async () => {
    if (!selectedRatePlan) return;
    
    setIsLoading(true);
    try {
      const startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');
      const ratePlan = ratePlans.find(rp => rp.id === selectedRatePlan);
      
      if (!ratePlan) return;

      const params: any = {
        ratePlanId: selectedRatePlan,
        startDate,
        endDate
      };

      if (selectedRoomType) {
        params.roomTypeId = selectedRoomType;
      }

      const data = await rateOverrideApi.getAllRateOverrides(0, 1000, params);

      const overridesMap = new Map<string, RateOverrideResponse[]>();
      data.content.forEach(override => {
        const key = format(new Date(override.overrideDate), 'yyyy-MM-dd');
        if (!overridesMap.has(key)) {
          overridesMap.set(key, []);
        }
        overridesMap.get(key)!.push(override);
      });

      setOverrides(overridesMap);
    } catch (error) {
      toast.error('Failed to load overrides');
    } finally {
      setIsLoading(false);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handleDateClick = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const dateOverrides = overrides.get(dateKey);
    
    if (onDateClick) {
      onDateClick(date, dateOverrides?.[0]);
    } else if (dateOverrides && dateOverrides.length > 0 && onEditOverride) {
      onEditOverride(dateOverrides[0]);
    }
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const getOverrideTypeColor = (type: string) => {
    switch (type) {
      case 'FIXED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'PERCENTAGE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'DISCOUNT':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'SURCHARGE':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4">
          <CardTitle>Override Calendar</CardTitle>
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-4">
            <Select 
              value={selectedRatePlan?.toString() || ''} 
              onValueChange={(v) => setSelectedRatePlan(v ? parseInt(v) : null)}
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
            
            <Select 
              value={selectedRoomType?.toString() || '_all_'} 
              onValueChange={(v) => setSelectedRoomType(v === '_all_' ? null : parseInt(v))}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Room Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all_">All Room Types</SelectItem>
                {roomTypes.map(rt => (
                  <SelectItem key={rt.id} value={rt.id.toString()}>{rt.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium min-w-[120px] sm:min-w-[150px] text-center text-sm sm:text-base">
                {format(currentDate, 'MMMM yyyy')}
              </span>
              <Button variant="outline" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading overrides...</div>
        ) : !selectedRatePlan ? (
          <div className="text-center py-8 text-muted-foreground">
            Please select a rate plan to view overrides
          </div>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-semibold text-xs sm:text-sm p-1 sm:p-2">
                  {day}
                </div>
              ))}
              {days.map(day => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dateOverrides = overrides.get(dateKey) || [];
                const isToday = isSameDay(day, new Date());
                const isCurrentMonthDay = isCurrentMonth(day);

                return (
                  <div
                    key={dateKey}
                    className={cn(
                      "border rounded p-1 sm:p-2 min-h-[60px] sm:min-h-[100px] cursor-pointer transition-colors",
                      isCurrentMonthDay ? 'bg-background hover:bg-accent' : 'bg-muted/30 opacity-50',
                      isToday && 'border-blue-500 border-2',
                      dateOverrides.length > 0 && isCurrentMonthDay && 'bg-yellow-50 dark:bg-yellow-950/20'
                    )}
                    onClick={() => handleDateClick(day)}
                  >
                    <div className={cn(
                      "text-[10px] sm:text-xs font-medium mb-1",
                      !isCurrentMonthDay && 'text-muted-foreground'
                    )}>
                      {format(day, 'd')}
                    </div>
                    {dateOverrides.length > 0 && isCurrentMonthDay ? (
                      <div className="space-y-0.5 sm:space-y-1">
                        {dateOverrides.slice(0, 2).map((override, idx) => (
                          <div
                            key={override.id}
                            className={cn(
                              "text-[8px] sm:text-[10px] px-1 py-0.5 rounded truncate",
                              getOverrideTypeColor(override.overrideType)
                            )}
                            title={`${override.overrideType}: ${override.overrideType === 'PERCENTAGE' ? `${override.overrideValue}%` : `$${override.overrideValue.toFixed(2)}`}${override.roomTypeName ? ` - ${override.roomTypeName}` : ''}`}
                          >
                            {override.overrideType === 'PERCENTAGE' 
                              ? `${override.overrideValue}%`
                              : `$${override.overrideValue.toFixed(0)}`
                            }
                            {override.roomTypeName && (
                              <span className="text-[7px] opacity-75"> {override.roomTypeName.substring(0, 3)}</span>
                            )}
                          </div>
                        ))}
                        {dateOverrides.length > 2 && (
                          <div className="text-[8px] sm:text-[10px] text-muted-foreground">
                            +{dateOverrides.length - 2} more
                          </div>
                        )}
                      </div>
                    ) : isCurrentMonthDay ? (
                      <div className="text-[10px] sm:text-xs text-muted-foreground">No override</div>
                    ) : null}
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-500 rounded"></div>
                <span>Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-50 dark:bg-yellow-950/20 border rounded"></div>
                <span>Has Override</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-[10px] px-1 py-0">Fixed</Badge>
                <span>Fixed Amount</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-[10px] px-1 py-0">%</Badge>
                <span>Percentage</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

