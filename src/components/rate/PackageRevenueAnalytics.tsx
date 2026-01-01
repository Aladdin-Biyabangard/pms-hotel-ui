import {useEffect, useMemo, useState} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Progress} from '@/components/ui/progress';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {
    BarChart3,
    Calendar,
    DollarSign,
    LineChart,
    PieChart,
    Target,
    TrendingDown,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react';
import {eachDayOfInterval, format, parseISO, subDays} from 'date-fns';
import {ratePackageComponentApi, RatePackageComponentResponse} from '@/api/ratePackageComponent';
import {ratePlanApi, RatePlanResponse} from '@/api/ratePlan';
import {roomRateApi, RoomRateResponse} from '@/api/roomRate';
import {toast} from 'sonner';
import {cn} from '@/lib/utils';

// Revenue analytics interfaces
interface RevenueMetrics {
    totalRevenue: number;
    totalBookings: number;
    averageRevenuePerBooking: number;
    contributionMargin: number;
    profitMargin: number;
    roi: number; // Return on Investment
    paybackPeriod: number; // months
}

interface RevenueBreakdown {
    baseRoomRevenue: number;
    packageComponentRevenue: number;
    upsellRevenue: number;
    totalRevenue: number;
}

interface TimeSeriesData {
    date: string;
    revenue: number;
    bookings: number;
    averageRate: number;
    occupancyRate: number;
}

interface ChannelPerformance {
    channel: string;
    revenue: number;
    bookings: number;
    averageRate: number;
    marketShare: number;
}

interface SeasonalAnalysis {
    period: string;
    revenue: number;
    growth: number;
    peakSeason: boolean;
    demandIndex: number;
}

interface PackageRevenueAnalyticsProps {
    packageId?: number;
    dateRange?: { start: string; end: string };
}

export function PackageRevenueAnalytics({
    packageId,
    dateRange
}: PackageRevenueAnalyticsProps) {
    // State
    const [packages, setPackages] = useState<RatePlanResponse[]>([]);
    const [selectedPackage, setSelectedPackage] = useState<RatePlanResponse | null>(null);
    const [packageComponents, setPackageComponents] = useState<RatePackageComponentResponse[]>([]);
    const [revenueData, setRevenueData] = useState<RoomRateResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState<'30days' | '90days' | '6months' | '1year'>('90days');

    // Date range based on selected period
    const dateRangeForPeriod = useMemo(() => {
        const end = new Date();
        const start = subDays(end, selectedPeriod === '30days' ? 30 :
                                   selectedPeriod === '90days' ? 90 :
                                   selectedPeriod === '6months' ? 180 : 365);
        return {
            start: format(start, 'yyyy-MM-dd'),
            end: format(end, 'yyyy-MM-dd')
        };
    }, [selectedPeriod]);

    // Load initial data
    useEffect(() => {
        loadPackageData();
    }, []);

    // Load package-specific data when selection changes
    useEffect(() => {
        if (selectedPackage) {
            loadRevenueData();
        }
    }, [selectedPackage, dateRangeForPeriod]);

    const loadPackageData = async () => {
        try {
            // Load package rate plans (only those marked as packages)
            const ratePlansData = await ratePlanApi.getAllRatePlans(0, 1000);
            const packageRatePlans = ratePlansData.content.filter(rp => rp.isPackage);
            setPackages(packageRatePlans);

            // Auto-select package if specified
            if (packageId) {
                const selected = packageRatePlans.find(p => p.id === packageId);
                setSelectedPackage(selected || null);
            } else if (packageRatePlans.length > 0) {
                setSelectedPackage(packageRatePlans[0]);
            }
        } catch (error) {
            toast.error('Failed to load package data');
        }
    };

    const loadRevenueData = async () => {
        if (!selectedPackage) return;

        setIsLoading(true);
        try {
            // Load package components
            const componentsData = await ratePackageComponentApi.getAllRatePackageComponents(
                0, 1000, { ratePlanId: selectedPackage.id }
            );
            setPackageComponents(componentsData.content);

            // Load room rates for revenue analysis
            const ratesData = await roomRateApi.getAllRoomRates(0, 10000, {
                ratePlanCode: selectedPackage.code,
                startDate: dateRangeForPeriod.start,
                endDate: dateRangeForPeriod.end
            });
            setRevenueData(ratesData.content);

        } catch (error) {
            toast.error('Failed to load revenue data');
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate revenue metrics
    const revenueMetrics = useMemo((): RevenueMetrics => {
        if (!selectedPackage || revenueData.length === 0) {
            return {
                totalRevenue: 0,
                totalBookings: 0,
                averageRevenuePerBooking: 0,
                contributionMargin: 0,
                profitMargin: 0,
                roi: 0,
                paybackPeriod: 0
            };
        }

        // Calculate base metrics
        const totalRoomNights = revenueData.length;
        const bookedRoomNights = revenueData.filter(r => (r.availabilityCount || 0) > 0).length;
        const baseRevenue = revenueData.reduce((sum, rate) => sum + rate.rateAmount, 0);

        // Calculate component revenue (simplified - assuming 20% of base rate comes from components)
        const componentRevenue = baseRevenue * 0.2;

        // Calculate costs (simplified estimates)
        const costOfGoodsSold = baseRevenue * 0.35; // 35% of revenue
        const operatingCosts = baseRevenue * 0.25; // 25% of revenue
        const marketingCosts = baseRevenue * 0.08; // 8% of revenue
        const totalCosts = costOfGoodsSold + operatingCosts + marketingCosts;

        // Calculate margins
        const grossProfit = baseRevenue - costOfGoodsSold;
        const contributionMargin = ((grossProfit - operatingCosts) / baseRevenue) * 100;
        const profitMargin = (grossProfit / baseRevenue) * 100;

        // Calculate ROI (simplified - assuming initial investment)
        const initialInvestment = 50000; // Mock investment for package setup
        const annualRevenue = baseRevenue * 4; // Extrapolate to annual
        const roi = ((annualRevenue - totalCosts * 4 - initialInvestment) / initialInvestment) * 100;

        // Calculate payback period
        const annualProfit = grossProfit * 4 - operatingCosts * 4 - marketingCosts * 4;
        const paybackPeriod = initialInvestment / annualProfit;

        return {
            totalRevenue: baseRevenue,
            totalBookings: bookedRoomNights,
            averageRevenuePerBooking: baseRevenue / Math.max(bookedRoomNights, 1),
            contributionMargin,
            profitMargin,
            roi,
            paybackPeriod
        };
    }, [selectedPackage, revenueData]);

    // Revenue breakdown
    const revenueBreakdown = useMemo((): RevenueBreakdown => {
        if (!selectedPackage || revenueData.length === 0) {
            return {
                baseRoomRevenue: 0,
                packageComponentRevenue: 0,
                upsellRevenue: 0,
                totalRevenue: 0
            };
        }

        const baseRevenue = revenueData.reduce((sum, rate) => sum + rate.rateAmount, 0);
        const componentRevenue = packageComponents.reduce((sum, comp) =>
            sum + ((comp.unitPrice || 0) * (comp.quantity || 1)), 0
        ) * revenueData.filter(r => (r.availabilityCount || 0) > 0).length;

        // Mock upsell revenue (additional services sold with packages)
        const upsellRevenue = baseRevenue * 0.15;

        return {
            baseRoomRevenue: baseRevenue,
            packageComponentRevenue: componentRevenue,
            upsellRevenue,
            totalRevenue: baseRevenue + componentRevenue + upsellRevenue
        };
    }, [selectedPackage, revenueData, packageComponents]);

    // Time series data for trends
    const timeSeriesData = useMemo((): TimeSeriesData[] => {
        if (!dateRangeForPeriod.start || !dateRangeForPeriod.end) return [];

        try {
            const days = eachDayOfInterval({
                start: parseISO(dateRangeForPeriod.start),
                end: parseISO(dateRangeForPeriod.end)
            });

            return days.map(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const dayRates = revenueData.filter(r => r.rateDate === dateStr);
                const dayRevenue = dayRates.reduce((sum, rate) => sum + rate.rateAmount, 0);
                const dayBookings = dayRates.filter(r => (r.availabilityCount || 0) > 0).length;
                const dayOccupancy = dayRates.length > 0 ? dayBookings / dayRates.length : 0;

                return {
                    date: dateStr,
                    revenue: dayRevenue,
                    bookings: dayBookings,
                    averageRate: dayRates.length > 0 ? dayRevenue / dayRates.length : 0,
                    occupancyRate: dayOccupancy * 100
                };
            }).filter(day => day.revenue > 0); // Only show days with revenue
        } catch {
            return [];
        }
    }, [revenueData, dateRangeForPeriod]);

    // Channel performance (mock data)
    const channelPerformance = useMemo((): ChannelPerformance[] => [
        {
            channel: 'Direct Website',
            revenue: revenueMetrics.totalRevenue * 0.45,
            bookings: Math.floor(revenueMetrics.totalBookings * 0.45),
            averageRate: revenueMetrics.averageRevenuePerBooking * 1.1,
            marketShare: 45
        },
        {
            channel: 'OTA (Booking.com)',
            revenue: revenueMetrics.totalRevenue * 0.30,
            bookings: Math.floor(revenueMetrics.totalBookings * 0.30),
            averageRate: revenueMetrics.averageRevenuePerBooking * 0.95,
            marketShare: 30
        },
        {
            channel: 'Corporate',
            revenue: revenueMetrics.totalRevenue * 0.15,
            bookings: Math.floor(revenueMetrics.totalBookings * 0.15),
            averageRate: revenueMetrics.averageRevenuePerBooking * 1.05,
            marketShare: 15
        },
        {
            channel: 'Walk-in',
            revenue: revenueMetrics.totalRevenue * 0.10,
            bookings: Math.floor(revenueMetrics.totalBookings * 0.10),
            averageRate: revenueMetrics.averageRevenuePerBooking * 0.9,
            marketShare: 10
        }
    ], [revenueMetrics]);

    // Seasonal analysis (mock data)
    const seasonalAnalysis = useMemo((): SeasonalAnalysis[] => [
        {
            period: 'Current Month',
            revenue: revenueMetrics.totalRevenue * 0.25,
            growth: 12.5,
            peakSeason: true,
            demandIndex: 1.15
        },
        {
            period: 'Last Month',
            revenue: revenueMetrics.totalRevenue * 0.22,
            growth: 8.3,
            peakSeason: false,
            demandIndex: 1.08
        },
        {
            period: '3 Months Ago',
            revenue: revenueMetrics.totalRevenue * 0.28,
            growth: -5.2,
            peakSeason: true,
            demandIndex: 1.22
        },
        {
            period: 'Peak Season (Avg)',
            revenue: revenueMetrics.totalRevenue * 0.35,
            growth: 18.7,
            peakSeason: true,
            demandIndex: 1.35
        }
    ], [revenueMetrics]);

    // Component profitability analysis
    const componentProfitability = useMemo(() => {
        return packageComponents.map(comp => {
            const revenue = (comp.unitPrice || 0) * (comp.quantity || 1) * revenueMetrics.totalBookings;
            const cost = revenue * 0.3; // Mock cost estimate
            const profit = revenue - cost;
            const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

            return {
                componentName: comp.componentName,
                componentType: comp.componentType,
                revenue,
                cost,
                profit,
                margin,
                utilization: comp.isIncluded ? 100 : Math.random() * 80 + 20 // Mock utilization
            };
        }).sort((a, b) => b.profit - a.profit);
    }, [packageComponents, revenueMetrics]);

    // Format currency
    const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

    // Format percentage
    const formatPercent = (value: number) => `${value.toFixed(1)}%`;

    // Get performance indicator
    const getPerformanceIndicator = (value: number, benchmark: number) => {
        if (value > benchmark * 1.1) return { icon: TrendingUp, color: 'text-emerald-600', label: 'Above Target' };
        if (value < benchmark * 0.9) return { icon: TrendingDown, color: 'text-rose-600', label: 'Below Target' };
        return { icon: Target, color: 'text-amber-600', label: 'On Target' };
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3">Loading revenue analytics...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-b">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-emerald-600" />
                                Package Revenue Analytics
                            </CardTitle>
                            <CardDescription>
                                Detailed revenue analysis and profitability metrics for package offerings
                            </CardDescription>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Package Selector */}
                            <Select
                                value={selectedPackage?.id?.toString() || ''}
                                onValueChange={(value) => {
                                    const pkg = packages.find(p => p.id.toString() === value);
                                    setSelectedPackage(pkg || null);
                                }}
                            >
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Select Package" />
                                </SelectTrigger>
                                <SelectContent>
                                    {packages.map(pkg => (
                                        <SelectItem key={pkg.id} value={pkg.id.toString()}>
                                            {pkg.name} ({pkg.code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Period Selector */}
                            <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="30days">30 Days</SelectItem>
                                    <SelectItem value="90days">90 Days</SelectItem>
                                    <SelectItem value="6months">6 Months</SelectItem>
                                    <SelectItem value="1year">1 Year</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button variant="outline" onClick={loadRevenueData}>
                                <Zap className="h-4 w-4 mr-2" />
                                Refresh
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                {selectedPackage && (
                    <CardContent className="p-6">
                        {/* Key Metrics Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
                            {/* Total Revenue */}
                            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                                <CardContent className="p-4">
                                    <DollarSign className="h-8 w-8 opacity-80 mb-2" />
                                    <div className="text-2xl font-bold">{formatCurrency(revenueMetrics.totalRevenue)}</div>
                                    <div className="text-xs opacity-80">Total Revenue</div>
                                </CardContent>
                            </Card>

                            {/* Total Bookings */}
                            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                <CardContent className="p-4">
                                    <Users className="h-8 w-8 opacity-80 mb-2" />
                                    <div className="text-2xl font-bold">{revenueMetrics.totalBookings}</div>
                                    <div className="text-xs opacity-80">Total Bookings</div>
                                </CardContent>
                            </Card>

                            {/* Average Revenue per Booking */}
                            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                                <CardContent className="p-4">
                                    <Target className="h-8 w-8 opacity-80 mb-2" />
                                    <div className="text-2xl font-bold">{formatCurrency(revenueMetrics.averageRevenuePerBooking)}</div>
                                    <div className="text-xs opacity-80">Avg per Booking</div>
                                </CardContent>
                            </Card>

                            {/* Contribution Margin */}
                            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                                <CardContent className="p-4">
                                    <TrendingUp className="h-8 w-8 opacity-80 mb-2" />
                                    <div className="text-2xl font-bold">{formatPercent(revenueMetrics.contributionMargin)}</div>
                                    <div className="text-xs opacity-80">Contribution Margin</div>
                                </CardContent>
                            </Card>

                            {/* Profit Margin */}
                            <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
                                <CardContent className="p-4">
                                    <LineChart className="h-8 w-8 opacity-80 mb-2" />
                                    <div className="text-2xl font-bold">{formatPercent(revenueMetrics.profitMargin)}</div>
                                    <div className="text-xs opacity-80">Profit Margin</div>
                                </CardContent>
                            </Card>

                            {/* ROI */}
                            <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                                <CardContent className="p-4">
                                    <BarChart3 className="h-8 w-8 opacity-80 mb-2" />
                                    <div className="text-2xl font-bold">{formatPercent(revenueMetrics.roi)}</div>
                                    <div className="text-xs opacity-80">ROI</div>
                                </CardContent>
                            </Card>

                            {/* Payback Period */}
                            <Card className="bg-gradient-to-br from-rose-500 to-rose-600 text-white">
                                <CardContent className="p-4">
                                    <Calendar className="h-8 w-8 opacity-80 mb-2" />
                                    <div className="text-2xl font-bold">{revenueMetrics.paybackPeriod.toFixed(1)}mo</div>
                                    <div className="text-xs opacity-80">Payback Period</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Detailed Analytics Tabs */}
                        <Tabs defaultValue="breakdown" className="w-full">
                            <TabsList className="grid w-full grid-cols-5">
                                <TabsTrigger value="breakdown">Revenue Breakdown</TabsTrigger>
                                <TabsTrigger value="components">Component Profitability</TabsTrigger>
                                <TabsTrigger value="channels">Channel Performance</TabsTrigger>
                                <TabsTrigger value="seasonal">Seasonal Analysis</TabsTrigger>
                                <TabsTrigger value="trends">Revenue Trends</TabsTrigger>
                            </TabsList>

                            {/* Revenue Breakdown */}
                            <TabsContent value="breakdown" className="mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Revenue Breakdown</CardTitle>
                                        <CardDescription>Detailed breakdown of revenue sources</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {/* Revenue Sources */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <Card>
                                                    <CardContent className="p-4">
                                                        <div className="text-center">
                                                            <div className="text-2xl font-bold text-emerald-600">
                                                                {formatCurrency(revenueBreakdown.baseRoomRevenue)}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">Base Room Revenue</div>
                                                            <div className="text-xs text-muted-foreground mt-1">
                                                                {formatPercent((revenueBreakdown.baseRoomRevenue / revenueBreakdown.totalRevenue) * 100)}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                <Card>
                                                    <CardContent className="p-4">
                                                        <div className="text-center">
                                                            <div className="text-2xl font-bold text-blue-600">
                                                                {formatCurrency(revenueBreakdown.packageComponentRevenue)}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">Package Components</div>
                                                            <div className="text-xs text-muted-foreground mt-1">
                                                                {formatPercent((revenueBreakdown.packageComponentRevenue / revenueBreakdown.totalRevenue) * 100)}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                <Card>
                                                    <CardContent className="p-4">
                                                        <div className="text-center">
                                                            <div className="text-2xl font-bold text-purple-600">
                                                                {formatCurrency(revenueBreakdown.upsellRevenue)}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">Upsell Revenue</div>
                                                            <div className="text-xs text-muted-foreground mt-1">
                                                                {formatPercent((revenueBreakdown.upsellRevenue / revenueBreakdown.totalRevenue) * 100)}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>

                                            {/* Revenue Distribution Chart (Simplified) */}
                                            <div className="p-4 border rounded-lg">
                                                <h4 className="font-medium mb-3">Revenue Distribution</h4>
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm">Base Room Revenue</span>
                                                        <div className="flex items-center gap-2">
                                                            <Progress
                                                                value={(revenueBreakdown.baseRoomRevenue / revenueBreakdown.totalRevenue) * 100}
                                                                className="w-24"
                                                            />
                                                            <span className="text-sm font-medium w-12 text-right">
                                                                {formatPercent((revenueBreakdown.baseRoomRevenue / revenueBreakdown.totalRevenue) * 100)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm">Package Components</span>
                                                        <div className="flex items-center gap-2">
                                                            <Progress
                                                                value={(revenueBreakdown.packageComponentRevenue / revenueBreakdown.totalRevenue) * 100}
                                                                className="w-24"
                                                            />
                                                            <span className="text-sm font-medium w-12 text-right">
                                                                {formatPercent((revenueBreakdown.packageComponentRevenue / revenueBreakdown.totalRevenue) * 100)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm">Upsell Revenue</span>
                                                        <div className="flex items-center gap-2">
                                                            <Progress
                                                                value={(revenueBreakdown.upsellRevenue / revenueBreakdown.totalRevenue) * 100}
                                                                className="w-24"
                                                            />
                                                            <span className="text-sm font-medium w-12 text-right">
                                                                {formatPercent((revenueBreakdown.upsellRevenue / revenueBreakdown.totalRevenue) * 100)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Component Profitability */}
                            <TabsContent value="components" className="mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Component Profitability Analysis</CardTitle>
                                        <CardDescription>Revenue, costs, and profit margins by component</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Component</TableHead>
                                                    <TableHead>Type</TableHead>
                                                    <TableHead className="text-right">Revenue</TableHead>
                                                    <TableHead className="text-right">Cost</TableHead>
                                                    <TableHead className="text-right">Profit</TableHead>
                                                    <TableHead className="text-right">Margin</TableHead>
                                                    <TableHead className="text-right">Utilization</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {componentProfitability.map((comp, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell className="font-medium">{comp.componentName}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="capitalize">
                                                                {comp.componentType.toLowerCase()}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right font-semibold">
                                                            {formatCurrency(comp.revenue)}
                                                        </TableCell>
                                                        <TableCell className="text-right text-rose-600">
                                                            {formatCurrency(comp.cost)}
                                                        </TableCell>
                                                        <TableCell className="text-right text-emerald-600 font-semibold">
                                                            {formatCurrency(comp.profit)}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <span className={cn(
                                                                "font-semibold",
                                                                comp.margin > 60 ? "text-emerald-600" :
                                                                comp.margin > 40 ? "text-amber-600" : "text-rose-600"
                                                            )}>
                                                                {formatPercent(comp.margin)}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center gap-2">
                                                                <Progress value={comp.utilization} className="w-16" />
                                                                <span className="text-sm">{formatPercent(comp.utilization)}</span>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Channel Performance */}
                            <TabsContent value="channels" className="mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Channel Performance</CardTitle>
                                        <CardDescription>Revenue analysis by booking channel</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {channelPerformance.map((channel, index) => (
                                                <Card key={index}>
                                                    <CardContent className="p-4">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center gap-3">
                                                                <PieChart className="h-5 w-5 text-muted-foreground" />
                                                                <span className="font-medium">{channel.channel}</span>
                                                            </div>
                                                            <Badge variant="outline">{formatPercent(channel.marketShare)} market share</Badge>
                                                        </div>

                                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                                            <div>
                                                                <div className="text-muted-foreground">Revenue</div>
                                                                <div className="font-semibold">{formatCurrency(channel.revenue)}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-muted-foreground">Bookings</div>
                                                                <div className="font-semibold">{channel.bookings}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-muted-foreground">Avg Rate</div>
                                                                <div className="font-semibold">{formatCurrency(channel.averageRate)}</div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Seasonal Analysis */}
                            <TabsContent value="seasonal" className="mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Seasonal Revenue Analysis</CardTitle>
                                        <CardDescription>Performance across different time periods</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {seasonalAnalysis.map((season, index) => {
                                                const growthIndicator = getPerformanceIndicator(season.growth, 0);
                                                const GrowthIcon = growthIndicator.icon;

                                                return (
                                                    <Card key={index} className={season.peakSeason ? "border-l-4 border-l-emerald-500" : ""}>
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <span className="font-medium">{season.period}</span>
                                                                {season.peakSeason && <Badge variant="default">Peak Season</Badge>}
                                                            </div>

                                                            <div className="space-y-2">
                                                                <div className="flex justify-between">
                                                                    <span className="text-sm text-muted-foreground">Revenue</span>
                                                                    <span className="font-semibold">{formatCurrency(season.revenue)}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-sm text-muted-foreground">Growth</span>
                                                                    <div className="flex items-center gap-1">
                                                                        <GrowthIcon className={cn("h-3 w-3", growthIndicator.color)} />
                                                                        <span className={cn("text-sm font-semibold", growthIndicator.color)}>
                                                                            {season.growth > 0 ? '+' : ''}{formatPercent(season.growth)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-sm text-muted-foreground">Demand Index</span>
                                                                    <span className="font-semibold">{season.demandIndex.toFixed(2)}x</span>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Revenue Trends */}
                            <TabsContent value="trends" className="mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Revenue Trends</CardTitle>
                                        <CardDescription>Daily revenue and performance trends</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {/* Trend Summary */}
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <Card>
                                                    <CardContent className="p-3 text-center">
                                                        <div className="text-lg font-bold text-emerald-600">
                                                            {timeSeriesData.length > 0 ? formatCurrency(
                                                                timeSeriesData.reduce((sum, day) => sum + day.revenue, 0) / timeSeriesData.length
                                                            ) : '$0.00'}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">Daily Avg Revenue</div>
                                                    </CardContent>
                                                </Card>

                                                <Card>
                                                    <CardContent className="p-3 text-center">
                                                        <div className="text-lg font-bold text-blue-600">
                                                            {timeSeriesData.length > 0 ? (
                                                                timeSeriesData.reduce((sum, day) => sum + day.bookings, 0) / timeSeriesData.length
                                                            ).toFixed(1) : '0'}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">Daily Avg Bookings</div>
                                                    </CardContent>
                                                </Card>

                                                <Card>
                                                    <CardContent className="p-3 text-center">
                                                        <div className="text-lg font-bold text-purple-600">
                                                            {timeSeriesData.length > 0 ? formatPercent(
                                                                (timeSeriesData.reduce((sum, day) => sum + day.occupancyRate, 0) / timeSeriesData.length)
                                                            ) : '0%'}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">Avg Occupancy</div>
                                                    </CardContent>
                                                </Card>

                                                <Card>
                                                    <CardContent className="p-3 text-center">
                                                        <div className="text-lg font-bold text-orange-600">
                                                            {timeSeriesData.length > 1 ?
                                                                ((timeSeriesData[timeSeriesData.length - 1].revenue - timeSeriesData[0].revenue) / timeSeriesData[0].revenue * 100).toFixed(1) + '%'
                                                                : '0%'
                                                            }
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">Period Growth</div>
                                                    </CardContent>
                                                </Card>
                                            </div>

                                            {/* Simple Trend Visualization */}
                                            <div className="p-4 border rounded-lg">
                                                <h4 className="font-medium mb-3">Revenue Trend (Last {selectedPeriod})</h4>
                                                <div className="flex items-end gap-1 h-32 overflow-x-auto">
                                                    {timeSeriesData.slice(-20).map((day, index) => { // Show last 20 days
                                                        const maxRevenue = Math.max(...timeSeriesData.map(d => d.revenue));
                                                        const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;

                                                        return (
                                                            <div
                                                                key={day.date}
                                                                className="flex flex-col items-center min-w-[20px]"
                                                                title={`${format(parseISO(day.date), 'MMM dd')}: ${formatCurrency(day.revenue)}`}
                                                            >
                                                                <div
                                                                    className="w-3 bg-emerald-500 rounded-t transition-all hover:bg-emerald-600"
                                                                    style={{ height: `${Math.max(height, 2)}%` }}
                                                                />
                                                                {index % 5 === 0 && (
                                                                    <span className="text-[10px] text-muted-foreground mt-1 -rotate-45 origin-left">
                                                                        {format(parseISO(day.date), 'dd')}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                )}
            </Card>
        </div>
    );
}
