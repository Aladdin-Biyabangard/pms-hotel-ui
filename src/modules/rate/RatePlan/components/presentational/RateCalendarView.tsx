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
import {roomRateApi, RoomRateResponse} from '@/api/roomRate';
import {ratePlanApi, RatePlanResponse} from '../..';
import {roomTypeApi, RoomTypeResponse} from '@/api/roomType';
import {toast} from 'sonner';

interface RateCalendarViewProps {
  onEditRate?: (rate: RoomRateResponse) => void;
  onDateClick?: (date: Date, rate?: RoomRateResponse) => void;
}

export function RateCalendarView({ onEditRate, onDateClick }: RateCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRatePlan, setSelectedRatePlan] = useState<number | null>(null);
  const [selectedRoomType, setSelectedRoomType] = useState<number | null>(null);
  const [ratePlans, setRatePlans] = useState<RatePlanResponse[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[]>([]);
  const [rates, setRates] = useState<Map<string, RoomRateResponse>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedRatePlan && selectedRoomType) {
      loadRates();
    } else {
      setRates(new Map());
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

  const loadRates = async () => {
    if (!selectedRatePlan || !selectedRoomType) return;
    
    setIsLoading(true);
    try {
      const startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');
      const ratePlan = ratePlans.find(rp => rp.id === selectedRatePlan);
      const roomType = roomTypes.find(rt => rt.id === selectedRoomType);
      
      if (!ratePlan || !roomType) return;

      const data = await roomRateApi.getAllRoomRates(0, 1000, {
        ratePlanCode: ratePlan.code,
        roomTypeCode: roomType.code,
        startDate,
        endDate
      });

      const ratesMap = new Map<string, RoomRateResponse>();
      data.content.forEach(rate => {
        const key = format(new Date(rate.rateDate), 'yyyy-MM-dd');
        ratesMap.set(key, rate);
      });
      setRates(ratesMap);
    } catch (error) {
      toast.error('Failed to load rates');
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
    const rate = rates.get(dateKey);
    
    if (onDateClick) {
      onDateClick(date, rate);
    } else if (rate && onEditRate) {
      onEditRate(rate);
    }
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4">
          <CardTitle>Rate Calendar</CardTitle>
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
              value={selectedRoomType?.toString() || ''} 
              onValueChange={(v) => setSelectedRoomType(v ? parseInt(v) : null)}
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
          <div className="text-center py-8 text-muted-foreground">Loading rates...</div>
        ) : !selectedRatePlan || !selectedRoomType ? (
          <div className="text-center py-8 text-muted-foreground">
            Please select a rate plan and room type to view rates
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
                const rate = rates.get(dateKey);
                const isToday = isSameDay(day, new Date());
                const isCurrentMonthDay = isCurrentMonth(day);

                return (
                  <div
                    key={dateKey}
                    className={`
                      border rounded p-1 sm:p-2 min-h-[60px] sm:min-h-[100px] cursor-pointer transition-colors
                      ${isCurrentMonthDay ? 'bg-background hover:bg-accent' : 'bg-muted/30 opacity-50'}
                      ${isToday ? 'border-blue-500 border-2' : ''}
                    `}
                    onClick={() => handleDateClick(day)}
                  >
                    <div className={`text-[10px] sm:text-xs font-medium mb-1 ${isCurrentMonthDay ? '' : 'text-muted-foreground'}`}>
                      {format(day, 'd')}
                    </div>
                    {rate && isCurrentMonthDay ? (
                      <div className="space-y-0.5 sm:space-y-1">
                        <div className="text-[10px] sm:text-xs font-semibold text-green-600">
                          ${rate.rateAmount.toFixed(2)}
                        </div>
                        <div className="flex flex-wrap gap-0.5 sm:gap-1">
                          {rate.stopSell && (
                            <Badge variant="destructive" className="text-[8px] sm:text-[10px] px-0.5 sm:px-1 py-0">Stop</Badge>
                          )}
                          {rate.closedForArrival && (
                            <Badge variant="secondary" className="text-[8px] sm:text-[10px] px-0.5 sm:px-1 py-0">C/A</Badge>
                          )}
                          {rate.closedForDeparture && (
                            <Badge variant="secondary" className="text-[8px] sm:text-[10px] px-0.5 sm:px-1 py-0">C/D</Badge>
                          )}
                        </div>
                        {rate.availabilityCount !== undefined && (
                          <div className="text-[8px] sm:text-[10px] text-muted-foreground">
                            Avail: {rate.availabilityCount}
                          </div>
                        )}
                      </div>
                    ) : isCurrentMonthDay ? (
                      <div className="text-[10px] sm:text-xs text-muted-foreground">No rate</div>
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
                <Badge variant="destructive" className="text-[10px] px-1 py-0">Stop</Badge>
                <span>Stop Sell</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px] px-1 py-0">C/A</Badge>
                <span>Closed for Arrival</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px] px-1 py-0">C/D</Badge>
                <span>Closed for Departure</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

