import {useEffect, useMemo, useState} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Progress} from '@/components/ui/progress';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {
    Activity,
    BarChart3,
    DollarSign,
    Package,
    RefreshCw,
    Target,
    TrendingDown,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react';
import {differenceInDays, format, parseISO, subDays} from 'date-fns';
import {ratePackageComponentApi, RatePackageComponentResponse} from '@/api/ratePackageComponent';
import {ratePlanApi, RatePlanResponse} from '@/modules/rate/RatePlan';
import {roomRateApi, RoomRateResponse} from '@/api/roomRate';
import {toast} from 'sonner';
import {cn} from '@/lib/utils';

// Performance metrics interface
interface PackagePerformanceMetrics {
    packageId: number;
    packageName: string;
    packageCode: string;
    totalBookings: number;
    totalRevenue: number;
    averageRevenuePerBooking: number;
    utilizationRate: number; // Percentage of time package was booked
    revPar: number; // Revenue per available room
    adr: number; // Average daily rate
    occupancyRate: number;
    averagePackageValue: number;
    topComponents: Array<{
        componentName: string;
        revenue: number;
        utilization: number;
    }>;
    seasonalPerformance: Array<{
        period: string;
        revenue: number;
        bookings: number;
        avgRate: number;
    }>;
    competitorPositioning: {
        marketPosition: 'premium' | 'standard' | 'budget';
        pricePositioning: number; // Percentage above/below market average
        demandElasticity: number;
    };
}

interface OperaPackageAnalysis {
    packageId: number;
    operaPackageCode: string;
    lastSyncDate: string;
    syncStatus: 'synced' | 'pending' | 'conflict' | 'error';
    operaMetrics: {
        occupancyRate: number;
        averageRate: number;
        marketDemand: 'high' | 'medium' | 'low';
        competitiveIndex: number;
    };
}

interface PackagePerformanceDashboardProps {
    dateRange?: { start: string; end: string };
    selectedPackageId?: number;
}

export function PackagePerformanceDashboard({
    dateRange,
    selectedPackageId
}: PackagePerformanceDashboardProps) {
    // State
    const [packages, setPackages] = useState<RatePlanResponse[]>([]);
    const [selectedPackage, setSelectedPackage] = useState<RatePlanResponse | null>(null);
    const [packageComponents, setPackageComponents] = useState<RatePackageComponentResponse[]>([]);
    const [roomRates, setRoomRates] = useState<RoomRateResponse[]>([]);
    const [operaAnalysis, setOperaAnalysis] = useState<OperaPackageAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState<'7days' | '30days' | '90days' | '1year'>('30days');

    // Date range based on selected period
    const dateRangeForPeriod = useMemo(() => {
        const end = new Date();
        const start = subDays(end, selectedPeriod === '7days' ? 7 :
                                   selectedPeriod === '30days' ? 30 :
                                   selectedPeriod === '90days' ? 90 : 365);
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
            loadPackagePerformanceData();
        }
    }, [selectedPackage, dateRangeForPeriod]);

    const loadPackageData = async () => {
        try {
            // Load package rate plans (only those marked as packages)
            const ratePlansData = await ratePlanApi.getAllRatePlans(0, 1000);
            const packageRatePlans = ratePlansData.content.filter(rp => rp.isPackage);
            setPackages(packageRatePlans);

            // Auto-select first package or specified package
            if (selectedPackageId) {
                const selected = packageRatePlans.find(p => p.id === selectedPackageId);
                setSelectedPackage(selected || null);
            } else if (packageRatePlans.length > 0) {
                setSelectedPackage(packageRatePlans[0]);
            }
        } catch (error) {
            toast.error('Failed to load package data');
        }
    };

    const loadPackagePerformanceData = async () => {
        if (!selectedPackage) return;

        setIsLoading(true);
        try {
            // Load package components
            const componentsData = await ratePackageComponentApi.getAllRatePackageComponents(
                0, 1000, { ratePlanId: selectedPackage.id }
            );
            setPackageComponents(componentsData.content);

            // Load room rates for the package
            const ratesData = await roomRateApi.getAllRoomRates(0, 10000, {
                ratePlanCode: selectedPackage.code,
                startDate: dateRangeForPeriod.start,
                endDate: dateRangeForPeriod.end
            });
            setRoomRates(ratesData.content);

            // Simulate Opera analysis data (in real implementation, this would come from Opera API)
            setOperaAnalysis({
                packageId: selectedPackage.id,
                operaPackageCode: `OPERA_${selectedPackage.code}`,
                lastSyncDate: new Date().toISOString(),
                syncStatus: 'synced',
                operaMetrics: {
                    occupancyRate: 78.5,
                    averageRate: 245.00,
                    marketDemand: 'high',
                    competitiveIndex: 1.15
                }
            });

        } catch (error) {
            toast.error('Failed to load package performance data');
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate performance metrics
    const performanceMetrics = useMemo((): PackagePerformanceMetrics | null => {
        if (!selectedPackage || roomRates.length === 0) return null;

        // Calculate total available days (simplified - assuming all room types are available)
        const totalDays = differenceInDays(
            parseISO(dateRangeForPeriod.end),
            parseISO(dateRangeForPeriod.start)
        ) + 1;

        const totalRoomNights = roomRates.length; // Simplified calculation
        const bookedRoomNights = roomRates.filter(r => (r.availabilityCount || 0) > 0).length;

        // Calculate revenue (simplified - using base rate)
        const totalRevenue = roomRates.reduce((sum, rate) => sum + rate.rateAmount, 0);
        const averageRate = totalRevenue / roomRates.length;

        // Component analysis
        const componentRevenue = packageComponents.map(comp => ({
            componentName: comp.componentName,
            revenue: (comp.unitPrice || 0) * (comp.quantity || 1),
            utilization: comp.isIncluded ? 100 : Math.random() * 100 // Mock data
        })).sort((a, b) => b.revenue - a.revenue);

        // Seasonal performance (mock data)
        const seasonalPerformance = [
            { period: 'Current Month', revenue: totalRevenue * 0.3, bookings: Math.floor(bookedRoomNights * 0.3), avgRate: averageRate * 0.95 },
            { period: 'Last Month', revenue: totalRevenue * 0.25, bookings: Math.floor(bookedRoomNights * 0.25), avgRate: averageRate * 0.9 },
            { period: 'Peak Season', revenue: totalRevenue * 0.35, bookings: Math.floor(bookedRoomNights * 0.35), avgRate: averageRate * 1.2 },
            { period: 'Off Season', revenue: totalRevenue * 0.1, bookings: Math.floor(bookedRoomNights * 0.1), avgRate: averageRate * 0.8 }
        ];

        return {
            packageId: selectedPackage.id,
            packageName: selectedPackage.name,
            packageCode: selectedPackage.code,
            totalBookings: bookedRoomNights,
            totalRevenue,
            averageRevenuePerBooking: totalRevenue / Math.max(bookedRoomNights, 1),
            utilizationRate: (bookedRoomNights / totalRoomNights) * 100,
            revPar: totalRevenue / totalRoomNights,
            adr: averageRate,
            occupancyRate: (bookedRoomNights / totalRoomNights) * 100,
            averagePackageValue: averageRate,
            topComponents: componentRevenue.slice(0, 5),
            seasonalPerformance,
            competitorPositioning: {
                marketPosition: averageRate > 300 ? 'premium' : averageRate > 150 ? 'standard' : 'budget',
                pricePositioning: Math.random() * 40 - 20, // -20% to +20%
                demandElasticity: Math.random() * 2 + 0.5 // 0.5 to 2.5
            }
        };
    }, [selectedPackage, roomRates, packageComponents, dateRangeForPeriod]);

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
                <RefreshCw className="h-8 w-8 animate-spin mr-3" />
                Loading package performance data...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border-b">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-purple-600" />
                                Package Performance Dashboard
                            </CardTitle>
                            <CardDescription>
                                Opera-specific package performance analytics and KPIs
                            </CardDescription>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
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
                                    <SelectItem value="7days">7 Days</SelectItem>
                                    <SelectItem value="30days">30 Days</SelectItem>
                                    <SelectItem value="90days">90 Days</SelectItem>
                                    <SelectItem value="1year">1 Year</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                variant="outline"
                                size="icon"
                                onClick={loadPackagePerformanceData}
                                disabled={!selectedPackage}
                            >
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                {selectedPackage && performanceMetrics && (
                    <CardContent className="p-6">
                        {/* KPI Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                            {/* Total Revenue */}
                            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <DollarSign className="h-8 w-8 opacity-80" />
                                        <div className="text-right">
                                            <div className="text-2xl font-bold">{formatCurrency(performanceMetrics.totalRevenue)}</div>
                                            <div className="text-xs opacity-80">Total Revenue</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Occupancy Rate */}
                            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <Users className="h-8 w-8 opacity-80" />
                                        <div className="text-right">
                                            <div className="text-2xl font-bold">{formatPercent(performanceMetrics.occupancyRate)}</div>
                                            <div className="text-xs opacity-80">Occupancy</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Average Daily Rate */}
                            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <Target className="h-8 w-8 opacity-80" />
                                        <div className="text-right">
                                            <div className="text-2xl font-bold">{formatCurrency(performanceMetrics.adr)}</div>
                                            <div className="text-xs opacity-80">ADR</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* RevPAR */}
                            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <Activity className="h-8 w-8 opacity-80" />
                                        <div className="text-right">
                                            <div className="text-2xl font-bold">{formatCurrency(performanceMetrics.revPar)}</div>
                                            <div className="text-xs opacity-80">RevPAR</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Total Bookings */}
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <Package className="h-8 w-8 text-muted-foreground" />
                                        <div className="text-right">
                                            <div className="text-2xl font-bold">{performanceMetrics.totalBookings}</div>
                                            <div className="text-xs text-muted-foreground">Bookings</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Utilization Rate */}
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <Zap className="h-8 w-8 text-muted-foreground" />
                                        <div className="text-right">
                                            <div className="text-2xl font-bold">{formatPercent(performanceMetrics.utilizationRate)}</div>
                                            <div className="text-xs text-muted-foreground">Utilization</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Opera Integration Status */}
                        {operaAnalysis && (
                            <Card className="mb-6 border-l-4 border-l-blue-500">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-sm font-medium">Opera Integration</span>
                                                <Badge variant={
                                                    operaAnalysis.syncStatus === 'synced' ? 'default' :
                                                    operaAnalysis.syncStatus === 'pending' ? 'secondary' : 'destructive'
                                                }>
                                                    {operaAnalysis.syncStatus}
                                                </Badge>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Last sync: {format(parseISO(operaAnalysis.lastSyncDate), 'MMM dd, yyyy HH:mm')}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm">Market Demand</div>
                                            <Badge variant={
                                                operaAnalysis.operaMetrics.marketDemand === 'high' ? 'default' :
                                                operaAnalysis.operaMetrics.marketDemand === 'medium' ? 'secondary' : 'outline'
                                            }>
                                                {operaAnalysis.operaMetrics.marketDemand}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Detailed Analysis Tabs */}
                        <Tabs defaultValue="components" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="components">Components</TabsTrigger>
                                <TabsTrigger value="seasonal">Seasonal</TabsTrigger>
                                <TabsTrigger value="competitor">Market Position</TabsTrigger>
                                <TabsTrigger value="opera">Opera Data</TabsTrigger>
                            </TabsList>

                            {/* Components Analysis */}
                            <TabsContent value="components" className="mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Top Performing Components</CardTitle>
                                        <CardDescription>Revenue contribution by package component</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {performanceMetrics.topComponents.map((component, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-sm font-medium">{component.componentName}</div>
                                                        <Badge variant="outline">{formatPercent(component.utilization)} utilized</Badge>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-semibold">{formatCurrency(component.revenue)}</div>
                                                        <Progress value={component.utilization} className="w-20 h-2 mt-1" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Seasonal Analysis */}
                            <TabsContent value="seasonal" className="mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Seasonal Performance</CardTitle>
                                        <CardDescription>Package performance across different periods</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {performanceMetrics.seasonalPerformance.map((season, index) => {
                                                const indicator = getPerformanceIndicator(season.revenue, performanceMetrics.averageRevenuePerBooking);
                                                const IndicatorIcon = indicator.icon;
                                                return (
                                                    <Card key={index}>
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="font-medium">{season.period}</span>
                                                                <IndicatorIcon className={cn("h-4 w-4", indicator.color)} />
                                                            </div>
                                                            <div className="grid grid-cols-3 gap-2 text-sm">
                                                                <div>
                                                                    <div className="text-muted-foreground">Revenue</div>
                                                                    <div className="font-semibold">{formatCurrency(season.revenue)}</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-muted-foreground">Bookings</div>
                                                                    <div className="font-semibold">{season.bookings}</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-muted-foreground">Avg Rate</div>
                                                                    <div className="font-semibold">{formatCurrency(season.avgRate)}</div>
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

                            {/* Market Positioning */}
                            <TabsContent value="competitor" className="mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Market Positioning</CardTitle>
                                        <CardDescription>How this package performs against market standards</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {/* Market Position */}
                                            <Card>
                                                <CardContent className="p-4 text-center">
                                                    <div className="text-2xl font-bold capitalize mb-1">
                                                        {performanceMetrics.competitorPositioning.marketPosition}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">Market Position</div>
                                                </CardContent>
                                            </Card>

                                            {/* Price Positioning */}
                                            <Card>
                                                <CardContent className="p-4 text-center">
                                                    <div className={cn(
                                                        "text-2xl font-bold",
                                                        performanceMetrics.competitorPositioning.pricePositioning > 0 ? "text-emerald-600" : "text-rose-600"
                                                    )}>
                                                        {performanceMetrics.competitorPositioning.pricePositioning > 0 ? '+' : ''}
                                                        {formatPercent(Math.abs(performanceMetrics.competitorPositioning.pricePositioning))}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">vs Market Average</div>
                                                </CardContent>
                                            </Card>

                                            {/* Demand Elasticity */}
                                            <Card>
                                                <CardContent className="p-4 text-center">
                                                    <div className="text-2xl font-bold">
                                                        {performanceMetrics.competitorPositioning.demandElasticity.toFixed(2)}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">Demand Elasticity</div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Performance Insights */}
                                        <div className="p-4 rounded-lg bg-muted/50">
                                            <h4 className="font-medium mb-2">Performance Insights</h4>
                                            <ul className="text-sm space-y-1 text-muted-foreground">
                                                <li>• Package positioned as {performanceMetrics.competitorPositioning.marketPosition} offering</li>
                                                <li>• Priced {Math.abs(performanceMetrics.competitorPositioning.pricePositioning).toFixed(1)}%
                                                    {performanceMetrics.competitorPositioning.pricePositioning > 0 ? ' above' : ' below'} market average</li>
                                                <li>• Demand elasticity indicates {performanceMetrics.competitorPositioning.demandElasticity > 1.5 ? 'high' : 'moderate'} price sensitivity</li>
                                            </ul>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Opera Data */}
                            <TabsContent value="opera" className="mt-4">
                                {operaAnalysis ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-sm">Opera Metrics</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-muted-foreground">Occupancy Rate</span>
                                                        <span className="font-semibold">{formatPercent(operaAnalysis.operaMetrics.occupancyRate)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-muted-foreground">Average Rate</span>
                                                        <span className="font-semibold">{formatCurrency(operaAnalysis.operaMetrics.averageRate)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-muted-foreground">Competitive Index</span>
                                                        <span className="font-semibold">{operaAnalysis.operaMetrics.competitiveIndex.toFixed(2)}x</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-sm">Sync Information</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-muted-foreground">Package Code</span>
                                                        <Badge variant="outline">{operaAnalysis.operaPackageCode}</Badge>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-muted-foreground">Last Sync</span>
                                                        <span className="text-sm">{format(parseISO(operaAnalysis.lastSyncDate), 'MMM dd, HH:mm')}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-muted-foreground">Status</span>
                                                        <Badge variant={
                                                            operaAnalysis.syncStatus === 'synced' ? 'default' :
                                                            operaAnalysis.syncStatus === 'pending' ? 'secondary' : 'destructive'
                                                        }>
                                                            {operaAnalysis.syncStatus}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ) : (
                                    <Card>
                                        <CardContent className="p-8 text-center text-muted-foreground">
                                            <Package className="h-12 w-12 mx-auto mb-4 opacity-30" />
                                            <p>No Opera integration data available</p>
                                            <p className="text-sm">Configure Opera sync to view detailed metrics</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                )}
            </Card>
        </div>
    );
}
