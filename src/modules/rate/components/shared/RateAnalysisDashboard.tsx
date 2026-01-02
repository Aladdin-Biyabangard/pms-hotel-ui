import {useEffect, useMemo, useState} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Badge} from '@/components/ui/badge';
import {Separator} from '@/components/ui/separator';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {
    Activity,
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    Ban,
    BarChart3,
    BedDouble,
    Calendar,
    DollarSign,
    Info,
    Layers,
    LineChart,
    Minus,
    RefreshCw,
    Target,
    TrendingDown,
    TrendingUp,
    XCircle
} from 'lucide-react';
import {
    differenceInDays,
    eachDayOfInterval,
    endOfMonth,
    format,
    isWeekend,
    parseISO,
    startOfMonth,
    subMonths
} from 'date-fns';
import {roomRateApi, RoomRateResponse} from '@/api/roomRate';
import {ratePlanApi, RatePlanResponse} from '@/modules/rate/RatePlan';
import {roomTypeApi, RoomTypeResponse} from '@/api/roomType';
import {rateOverrideApi, RateOverrideResponse} from '@/modules/rate/RateOverride/api/rateOverride';
import {toast} from 'sonner';
import {cn} from '@/lib/utils';

// Analytics types
interface RateStats {
  avgRate: number;
  minRate: number;
  maxRate: number;
  totalRates: number;
  ratesWithStopSell: number;
  ratesWithCTA: number;
  ratesWithCTD: number;
  occupancy: number;
  weekdayAvg: number;
  weekendAvg: number;
}

interface RoomTypeStats extends RateStats {
  roomType: RoomTypeResponse;
}

interface RatePlanStats extends RateStats {
  ratePlan: RatePlanResponse;
}

interface DailyStats {
  date: string;
  avgRate: number;
  totalRates: number;
  stopSellCount: number;
  availability: number;
  isWeekend: boolean;
}

interface RateAnalysisDashboardProps {
  initialDateRange?: { start: string; end: string };
}

export function RateAnalysisDashboard({ initialDateRange }: RateAnalysisDashboardProps) {
  // Date range
  const [startDate, setStartDate] = useState(initialDateRange?.start || format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(initialDateRange?.end || format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  
  // Data
  const [rates, setRates] = useState<RoomRateResponse[]>([]);
  const [ratePlans, setRatePlans] = useState<RatePlanResponse[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[]>([]);
  const [overrides, setOverrides] = useState<RateOverrideResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filters
  const [selectedRatePlanId, setSelectedRatePlanId] = useState<number | undefined>();
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<number | undefined>();

  // Load data
  useEffect(() => {
    loadReferenceData();
  }, []);

  useEffect(() => {
    loadAnalyticsData();
  }, [startDate, endDate, selectedRatePlanId, selectedRoomTypeId]);

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

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Load rates
      const ratesData = await roomRateApi.getAllRoomRates(0, 10000, {
        startDate,
        endDate,
        ratePlanCode: selectedRatePlanId 
          ? ratePlans.find(rp => rp.id === selectedRatePlanId)?.code 
          : undefined,
        roomTypeCode: selectedRoomTypeId 
          ? roomTypes.find(rt => rt.id === selectedRoomTypeId)?.code 
          : undefined,
      });
      setRates(ratesData.content);
      
      // Load overrides
      const overridesData = await rateOverrideApi.getAllRateOverrides(0, 1000, {
        startDate,
        endDate,
        ratePlanId: selectedRatePlanId,
        roomTypeId: selectedRoomTypeId,
      });
      setOverrides(overridesData.content);
    } catch (error) {
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate overall stats
  const overallStats = useMemo((): RateStats => {
    if (rates.length === 0) {
      return {
        avgRate: 0,
        minRate: 0,
        maxRate: 0,
        totalRates: 0,
        ratesWithStopSell: 0,
        ratesWithCTA: 0,
        ratesWithCTD: 0,
        occupancy: 0,
        weekdayAvg: 0,
        weekendAvg: 0,
      };
    }

    const rateAmounts = rates.map(r => r.rateAmount);
    const weekdayRates = rates.filter(r => !isWeekend(parseISO(r.rateDate)));
    const weekendRates = rates.filter(r => isWeekend(parseISO(r.rateDate)));
    
    return {
      avgRate: rateAmounts.reduce((a, b) => a + b, 0) / rateAmounts.length,
      minRate: Math.min(...rateAmounts),
      maxRate: Math.max(...rateAmounts),
      totalRates: rates.length,
      ratesWithStopSell: rates.filter(r => r.stopSell).length,
      ratesWithCTA: rates.filter(r => r.closedForArrival).length,
      ratesWithCTD: rates.filter(r => r.closedForDeparture).length,
      occupancy: rates.filter(r => (r.availabilityCount || 0) > 0).length / rates.length * 100,
      weekdayAvg: weekdayRates.length > 0 
        ? weekdayRates.reduce((a, r) => a + r.rateAmount, 0) / weekdayRates.length 
        : 0,
      weekendAvg: weekendRates.length > 0 
        ? weekendRates.reduce((a, r) => a + r.rateAmount, 0) / weekendRates.length 
        : 0,
    };
  }, [rates]);

  // Stats by room type
  const roomTypeStats = useMemo((): RoomTypeStats[] => {
    return roomTypes.map(roomType => {
      const typeRates = rates.filter(r => r.roomTypeResponse?.id === roomType.id);
      if (typeRates.length === 0) {
        return {
          roomType,
          avgRate: 0,
          minRate: 0,
          maxRate: 0,
          totalRates: 0,
          ratesWithStopSell: 0,
          ratesWithCTA: 0,
          ratesWithCTD: 0,
          occupancy: 0,
          weekdayAvg: 0,
          weekendAvg: 0,
        };
      }
      
      const rateAmounts = typeRates.map(r => r.rateAmount);
      const weekdayRates = typeRates.filter(r => !isWeekend(parseISO(r.rateDate)));
      const weekendRates = typeRates.filter(r => isWeekend(parseISO(r.rateDate)));
      
      return {
        roomType,
        avgRate: rateAmounts.reduce((a, b) => a + b, 0) / rateAmounts.length,
        minRate: Math.min(...rateAmounts),
        maxRate: Math.max(...rateAmounts),
        totalRates: typeRates.length,
        ratesWithStopSell: typeRates.filter(r => r.stopSell).length,
        ratesWithCTA: typeRates.filter(r => r.closedForArrival).length,
        ratesWithCTD: typeRates.filter(r => r.closedForDeparture).length,
        occupancy: typeRates.filter(r => (r.availabilityCount || 0) > 0).length / typeRates.length * 100,
        weekdayAvg: weekdayRates.length > 0 
          ? weekdayRates.reduce((a, r) => a + r.rateAmount, 0) / weekdayRates.length 
          : 0,
        weekendAvg: weekendRates.length > 0 
          ? weekendRates.reduce((a, r) => a + r.rateAmount, 0) / weekendRates.length 
          : 0,
      };
    }).filter(s => s.totalRates > 0);
  }, [rates, roomTypes]);

  // Stats by rate plan
  const ratePlanStats = useMemo((): RatePlanStats[] => {
    return ratePlans.map(ratePlan => {
      const planRates = rates.filter(r => r.ratePlan?.id === ratePlan.id);
      if (planRates.length === 0) {
        return {
          ratePlan,
          avgRate: 0,
          minRate: 0,
          maxRate: 0,
          totalRates: 0,
          ratesWithStopSell: 0,
          ratesWithCTA: 0,
          ratesWithCTD: 0,
          occupancy: 0,
          weekdayAvg: 0,
          weekendAvg: 0,
        };
      }
      
      const rateAmounts = planRates.map(r => r.rateAmount);
      const weekdayRates = planRates.filter(r => !isWeekend(parseISO(r.rateDate)));
      const weekendRates = planRates.filter(r => isWeekend(parseISO(r.rateDate)));
      
      return {
        ratePlan,
        avgRate: rateAmounts.reduce((a, b) => a + b, 0) / rateAmounts.length,
        minRate: Math.min(...rateAmounts),
        maxRate: Math.max(...rateAmounts),
        totalRates: planRates.length,
        ratesWithStopSell: planRates.filter(r => r.stopSell).length,
        ratesWithCTA: planRates.filter(r => r.closedForArrival).length,
        ratesWithCTD: planRates.filter(r => r.closedForDeparture).length,
        occupancy: planRates.filter(r => (r.availabilityCount || 0) > 0).length / planRates.length * 100,
        weekdayAvg: weekdayRates.length > 0 
          ? weekdayRates.reduce((a, r) => a + r.rateAmount, 0) / weekdayRates.length 
          : 0,
        weekendAvg: weekendRates.length > 0 
          ? weekendRates.reduce((a, r) => a + r.rateAmount, 0) / weekendRates.length 
          : 0,
      };
    }).filter(s => s.totalRates > 0);
  }, [rates, ratePlans]);

  // Daily stats for trend
  const dailyStats = useMemo((): DailyStats[] => {
    if (!startDate || !endDate) return [];
    
    try {
      const days = eachDayOfInterval({ 
        start: parseISO(startDate), 
        end: parseISO(endDate) 
      });
      
      return days.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayRates = rates.filter(r => r.rateDate === dateStr);
        
        return {
          date: dateStr,
          avgRate: dayRates.length > 0 
            ? dayRates.reduce((a, r) => a + r.rateAmount, 0) / dayRates.length 
            : 0,
          totalRates: dayRates.length,
          stopSellCount: dayRates.filter(r => r.stopSell).length,
          availability: dayRates.reduce((a, r) => a + (r.availabilityCount || 0), 0),
          isWeekend: isWeekend(day),
        };
      });
    } catch {
      return [];
    }
  }, [rates, startDate, endDate]);

  // Alerts/Issues
  const alerts = useMemo(() => {
    const issues: { type: 'warning' | 'info' | 'error'; message: string }[] = [];
    
    // No rates configured
    if (rates.length === 0) {
      issues.push({ type: 'warning', message: 'No rates found for the selected period' });
    }
    
    // High stop sell count
    if (overallStats.ratesWithStopSell > rates.length * 0.1) {
      issues.push({ 
        type: 'warning', 
        message: `${overallStats.ratesWithStopSell} rates have Stop Sell enabled (${((overallStats.ratesWithStopSell / rates.length) * 100).toFixed(1)}%)` 
      });
    }
    
    // Large rate variance
    if (overallStats.maxRate > overallStats.minRate * 3) {
      issues.push({ 
        type: 'info', 
        message: `Large rate variance detected: ${overallStats.minRate.toFixed(0)} - ${overallStats.maxRate.toFixed(0)}` 
      });
    }
    
    // Weekend vs weekday difference
    const weekendDiff = ((overallStats.weekendAvg - overallStats.weekdayAvg) / overallStats.weekdayAvg) * 100;
    if (overallStats.weekdayAvg > 0 && Math.abs(weekendDiff) > 30) {
      issues.push({ 
        type: 'info', 
        message: `Weekend rates are ${weekendDiff > 0 ? 'higher' : 'lower'} by ${Math.abs(weekendDiff).toFixed(1)}% compared to weekdays` 
      });
    }
    
    // Active overrides
    if (overrides.length > 0) {
      issues.push({ 
        type: 'info', 
        message: `${overrides.length} rate override(s) active in this period` 
      });
    }
    
    return issues;
  }, [rates, overallStats, overrides]);

  // Quick date presets
  const setDatePreset = (preset: 'thisMonth' | 'lastMonth' | 'next30' | 'next90') => {
    const today = new Date();
    switch (preset) {
      case 'thisMonth':
        setStartDate(format(startOfMonth(today), 'yyyy-MM-dd'));
        setEndDate(format(endOfMonth(today), 'yyyy-MM-dd'));
        break;
      case 'lastMonth':
        const lastMonth = subMonths(today, 1);
        setStartDate(format(startOfMonth(lastMonth), 'yyyy-MM-dd'));
        setEndDate(format(endOfMonth(lastMonth), 'yyyy-MM-dd'));
        break;
      case 'next30':
        setStartDate(format(today, 'yyyy-MM-dd'));
        setEndDate(format(new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'));
        break;
      case 'next90':
        setStartDate(format(today, 'yyyy-MM-dd'));
        setEndDate(format(new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'));
        break;
    }
  };

  // Format number with currency
  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  // Get rate change indicator
  const getRateChangeIndicator = (current: number, baseline: number) => {
    if (current === baseline || baseline === 0) return { icon: Minus, color: 'text-muted-foreground', change: 0 };
    const change = ((current - baseline) / baseline) * 100;
    if (change > 0) return { icon: ArrowUpRight, color: 'text-emerald-600', change };
    return { icon: ArrowDownRight, color: 'text-rose-600', change };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Rate Analysis Dashboard
              </CardTitle>
              <CardDescription>
                Analyze rate performance, trends, and distribution
              </CardDescription>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Date Range */}
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-[140px]"
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-[140px]"
                />
              </div>
              
              {/* Quick Presets */}
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => setDatePreset('thisMonth')}>
                  This Month
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDatePreset('next30')}>
                  Next 30
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDatePreset('next90')}>
                  Next 90
                </Button>
              </div>
              
              <Button variant="ghost" size="icon" onClick={loadAnalyticsData} disabled={isLoading}>
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-4">
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

            <Badge variant="outline" className="h-9 px-4">
              {differenceInDays(parseISO(endDate), parseISO(startDate)) + 1} days
            </Badge>
          </div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="space-y-2 mb-6">
              {alerts.map((alert, index) => (
                <div 
                  key={index}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-lg text-sm",
                    alert.type === 'warning' && "bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200",
                    alert.type === 'error' && "bg-rose-50 text-rose-800 dark:bg-rose-900/20 dark:text-rose-200",
                    alert.type === 'info' && "bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200"
                  )}
                >
                  {alert.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
                  {alert.type === 'error' && <XCircle className="h-4 w-4" />}
                  {alert.type === 'info' && <Info className="h-4 w-4" />}
                  {alert.message}
                </div>
              ))}
            </div>
          )}

          {/* KPI Cards */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin mr-3" />
              Loading analytics...
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <DollarSign className="h-8 w-8 opacity-80" />
                    <div className="text-right">
                      <div className="text-2xl font-bold">{formatCurrency(overallStats.avgRate)}</div>
                      <div className="text-xs opacity-80">Average Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <TrendingDown className="h-8 w-8 opacity-80" />
                    <div className="text-right">
                      <div className="text-2xl font-bold">{formatCurrency(overallStats.minRate)}</div>
                      <div className="text-xs opacity-80">Minimum Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <TrendingUp className="h-8 w-8 opacity-80" />
                    <div className="text-right">
                      <div className="text-2xl font-bold">{formatCurrency(overallStats.maxRate)}</div>
                      <div className="text-xs opacity-80">Maximum Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <Layers className="h-8 w-8 text-muted-foreground" />
                    <div className="text-right">
                      <div className="text-2xl font-bold">{overallStats.totalRates}</div>
                      <div className="text-xs text-muted-foreground">Total Rates</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <Ban className="h-8 w-8 text-rose-500" />
                    <div className="text-right">
                      <div className="text-2xl font-bold text-rose-600">{overallStats.ratesWithStopSell}</div>
                      <div className="text-xs text-muted-foreground">Stop Sells</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <Activity className="h-8 w-8 text-amber-500" />
                    <div className="text-right">
                      <div className="text-2xl font-bold">{overrides.length}</div>
                      <div className="text-xs text-muted-foreground">Overrides</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      {!isLoading && rates.length > 0 && (
        <Tabs defaultValue="roomTypes" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="roomTypes" className="gap-2">
              <BedDouble className="h-4 w-4" />
              By Room Type
            </TabsTrigger>
            <TabsTrigger value="ratePlans" className="gap-2">
              <Layers className="h-4 w-4" />
              By Rate Plan
            </TabsTrigger>
            <TabsTrigger value="trend" className="gap-2">
              <LineChart className="h-4 w-4" />
              Daily Trend
            </TabsTrigger>
            <TabsTrigger value="comparison" className="gap-2">
              <Target className="h-4 w-4" />
              Comparison
            </TabsTrigger>
          </TabsList>

          {/* By Room Type */}
          <TabsContent value="roomTypes">
            <Card>
              <CardHeader>
                <CardTitle>Rate Analysis by Room Type</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Room Type</TableHead>
                      <TableHead className="text-right">Avg Rate</TableHead>
                      <TableHead className="text-right">Min</TableHead>
                      <TableHead className="text-right">Max</TableHead>
                      <TableHead className="text-right">Weekday Avg</TableHead>
                      <TableHead className="text-right">Weekend Avg</TableHead>
                      <TableHead className="text-right">Stop Sells</TableHead>
                      <TableHead className="text-right">Rates</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roomTypeStats.map(stat => {
                      const weekendChange = getRateChangeIndicator(stat.weekendAvg, stat.weekdayAvg);
                      return (
                        <TableRow key={stat.roomType.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <BedDouble className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{stat.roomType.name}</div>
                                <div className="text-xs text-muted-foreground">{stat.roomType.code}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(stat.avgRate)}
                          </TableCell>
                          <TableCell className="text-right text-emerald-600">
                            {formatCurrency(stat.minRate)}
                          </TableCell>
                          <TableCell className="text-right text-rose-600">
                            {formatCurrency(stat.maxRate)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(stat.weekdayAvg)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {formatCurrency(stat.weekendAvg)}
                              <weekendChange.icon className={cn("h-3 w-3", weekendChange.color)} />
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {stat.ratesWithStopSell > 0 ? (
                              <Badge variant="destructive" className="text-xs">
                                {stat.ratesWithStopSell}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">0</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline">{stat.totalRates}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* By Rate Plan */}
          <TabsContent value="ratePlans">
            <Card>
              <CardHeader>
                <CardTitle>Rate Analysis by Rate Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rate Plan</TableHead>
                      <TableHead className="text-right">Avg Rate</TableHead>
                      <TableHead className="text-right">Min</TableHead>
                      <TableHead className="text-right">Max</TableHead>
                      <TableHead className="text-right">Weekday Avg</TableHead>
                      <TableHead className="text-right">Weekend Avg</TableHead>
                      <TableHead className="text-right">Stop Sells</TableHead>
                      <TableHead className="text-right">Rates</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ratePlanStats.map(stat => {
                      const weekendChange = getRateChangeIndicator(stat.weekendAvg, stat.weekdayAvg);
                      return (
                        <TableRow key={stat.ratePlan.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Layers className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{stat.ratePlan.name}</div>
                                <div className="text-xs text-muted-foreground">{stat.ratePlan.code}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(stat.avgRate)}
                          </TableCell>
                          <TableCell className="text-right text-emerald-600">
                            {formatCurrency(stat.minRate)}
                          </TableCell>
                          <TableCell className="text-right text-rose-600">
                            {formatCurrency(stat.maxRate)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(stat.weekdayAvg)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {formatCurrency(stat.weekendAvg)}
                              <weekendChange.icon className={cn("h-3 w-3", weekendChange.color)} />
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {stat.ratesWithStopSell > 0 ? (
                              <Badge variant="destructive" className="text-xs">
                                {stat.ratesWithStopSell}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">0</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline">{stat.totalRates}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Daily Trend */}
          <TabsContent value="trend">
            <Card>
              <CardHeader>
                <CardTitle>Daily Rate Trend</CardTitle>
                <CardDescription>Average rate and stop sell status by day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {/* Simple bar chart visualization */}
                  <div className="flex items-end gap-1 h-40 overflow-x-auto pb-4">
                    {dailyStats.map((day, index) => {
                      const height = overallStats.maxRate > 0 
                        ? (day.avgRate / overallStats.maxRate) * 100 
                        : 0;
                      return (
                        <div 
                          key={day.date}
                          className="flex flex-col items-center min-w-[24px]"
                          title={`${format(parseISO(day.date), 'MMM dd')}: ${formatCurrency(day.avgRate)}`}
                        >
                          <div 
                            className={cn(
                              "w-5 rounded-t transition-all",
                              day.isWeekend ? "bg-blue-500" : "bg-emerald-500",
                              day.stopSellCount > 0 && "opacity-50"
                            )}
                            style={{ height: `${Math.max(height, 4)}%` }}
                          />
                          {index % 3 === 0 && (
                            <span className="text-[10px] text-muted-foreground mt-1 -rotate-45 origin-left">
                              {format(parseISO(day.date), 'dd')}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Legend */}
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-emerald-500" />
                      <span>Weekday</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-blue-500" />
                      <span>Weekend</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-emerald-500 opacity-50" />
                      <span>With Stop Sell</span>
                    </div>
                  </div>
                </div>

                {/* Daily table */}
                <div className="mt-6 max-h-[300px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Day</TableHead>
                        <TableHead className="text-right">Avg Rate</TableHead>
                        <TableHead className="text-right">Rates</TableHead>
                        <TableHead className="text-right">Stop Sells</TableHead>
                        <TableHead className="text-right">Availability</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dailyStats.map(day => (
                        <TableRow key={day.date} className={day.isWeekend ? "bg-muted/30" : ""}>
                          <TableCell>{format(parseISO(day.date), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>
                            <Badge variant={day.isWeekend ? "secondary" : "outline"}>
                              {format(parseISO(day.date), 'EEE')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {day.avgRate > 0 ? formatCurrency(day.avgRate) : '—'}
                          </TableCell>
                          <TableCell className="text-right">{day.totalRates}</TableCell>
                          <TableCell className="text-right">
                            {day.stopSellCount > 0 ? (
                              <Badge variant="destructive" className="text-xs">{day.stopSellCount}</Badge>
                            ) : '—'}
                          </TableCell>
                          <TableCell className="text-right">{day.availability}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comparison */}
          <TabsContent value="comparison">
            <Card>
              <CardHeader>
                <CardTitle>Weekday vs Weekend Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Weekday */}
                  <div className="p-6 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="h-5 w-5 text-emerald-600" />
                      <h3 className="text-lg font-semibold">Weekday</h3>
                    </div>
                    <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">
                      {formatCurrency(overallStats.weekdayAvg)}
                    </div>
                    <div className="text-sm text-muted-foreground">Average Rate</div>
                    <Separator className="my-4" />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Mon-Fri</div>
                        <div className="font-medium">5 days/week</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Rates</div>
                        <div className="font-medium">
                          {rates.filter(r => !isWeekend(parseISO(r.rateDate))).length}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Weekend */}
                  <div className="p-6 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold">Weekend</h3>
                    </div>
                    <div className="text-3xl font-bold text-blue-700 dark:text-blue-400 mb-2">
                      {formatCurrency(overallStats.weekendAvg)}
                    </div>
                    <div className="text-sm text-muted-foreground">Average Rate</div>
                    <Separator className="my-4" />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Sat-Sun</div>
                        <div className="font-medium">2 days/week</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Rates</div>
                        <div className="font-medium">
                          {rates.filter(r => isWeekend(parseISO(r.rateDate))).length}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Difference */}
                {overallStats.weekdayAvg > 0 && (
                  <div className="mt-6 p-4 rounded-lg bg-muted/50 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Weekend vs Weekday Difference</div>
                    <div className={cn(
                      "text-2xl font-bold",
                      overallStats.weekendAvg > overallStats.weekdayAvg ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {overallStats.weekendAvg > overallStats.weekdayAvg ? '+' : ''}
                      {formatCurrency(overallStats.weekendAvg - overallStats.weekdayAvg)}
                      {' '}
                      ({((overallStats.weekendAvg - overallStats.weekdayAvg) / overallStats.weekdayAvg * 100).toFixed(1)}%)
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

