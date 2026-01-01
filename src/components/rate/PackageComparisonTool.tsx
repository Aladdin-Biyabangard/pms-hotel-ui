import {useEffect, useMemo, useState} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Progress} from '@/components/ui/progress';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {ArrowDownRight, ArrowUpRight, CheckCircle, Minus, Package, Plus, RefreshCw, Scale, Target} from 'lucide-react';
import {format, subDays} from 'date-fns';
import {ratePackageComponentApi, RatePackageComponentResponse} from '@/api/ratePackageComponent';
import {ratePlanApi, RatePlanResponse} from '@/api/ratePlan';
import {roomRateApi} from '@/api/roomRate';
import {toast} from 'sonner';
import {cn} from '@/lib/utils';

// Package comparison data interface
interface PackageComparisonData {
    packageId: number;
    packageName: string;
    packageCode: string;
    totalValue: number;
    componentCount: number;
    includedComponents: number;
    extraComponents: number;
    components: RatePackageComponentResponse[];
    performance: {
        occupancyRate: number;
        averageRate: number;
        totalRevenue: number;
        bookingsCount: number;
    };
    marketPosition: {
        tier: 'budget' | 'standard' | 'premium' | 'luxury';
        competitiveness: number; // 0-100
        demandScore: number; // 0-100
    };
}

interface ComparisonMetrics {
    priceDifference: number;
    priceDifferencePercent: number;
    componentOverlap: number; // Percentage of shared components
    valueProposition: 'better' | 'worse' | 'similar';
    recommendation: string;
    uniqueAdvantages: string[];
    potentialIssues: string[];
}

interface PackageComparisonToolProps {
    dateRange?: { start: string; end: string };
    initialPackageIds?: number[];
}

export function PackageComparisonTool({
    dateRange,
    initialPackageIds = []
}: PackageComparisonToolProps) {
    // State
    const [packages, setPackages] = useState<RatePlanResponse[]>([]);
    const [selectedPackages, setSelectedPackages] = useState<number[]>(initialPackageIds);
    const [comparisonData, setComparisonData] = useState<PackageComparisonData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState<'30days' | '90days' | '1year'>('30days');

    // Date range based on selected period
    const dateRangeForPeriod = useMemo(() => {
        const end = new Date();
        const start = subDays(end, selectedPeriod === '30days' ? 30 :
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

    // Load comparison data when selection changes
    useEffect(() => {
        if (selectedPackages.length >= 2) {
            loadComparisonData();
        } else {
            setComparisonData([]);
        }
    }, [selectedPackages, dateRangeForPeriod]);

    const loadPackageData = async () => {
        try {
            // Load package rate plans (only those marked as packages)
            const ratePlansData = await ratePlanApi.getAllRatePlans(0, 1000);
            const packageRatePlans = ratePlansData.content.filter(rp => rp.isPackage);
            setPackages(packageRatePlans);
        } catch (error) {
            toast.error('Failed to load package data');
        }
    };

    const loadComparisonData = async () => {
        setIsLoading(true);
        try {
            const comparisonPromises = selectedPackages.map(async (packageId) => {
                const packageInfo = packages.find(p => p.id === packageId);
                if (!packageInfo) return null;

                // Load components
                const componentsData = await ratePackageComponentApi.getAllRatePackageComponents(
                    0, 1000, { ratePlanId: packageId }
                );

                // Load room rates for performance data
                const ratesData = await roomRateApi.getAllRoomRates(0, 10000, {
                    ratePlanCode: packageInfo.code,
                    startDate: dateRangeForPeriod.start,
                    endDate: dateRangeForPeriod.end
                });

                // Calculate metrics
                const totalValue = componentsData.content.reduce((sum, comp) =>
                    sum + ((comp.unitPrice || 0) * (comp.quantity || 1)), 0
                );

                const totalRoomNights = ratesData.content.length;
                const bookedRoomNights = ratesData.content.filter(r => (r.availabilityCount || 0) > 0).length;
                const totalRevenue = ratesData.content.reduce((sum, rate) => sum + rate.rateAmount, 0);
                const averageRate = totalRoomNights > 0 ? totalRevenue / totalRoomNights : 0;

                return {
                    packageId,
                    packageName: packageInfo.name,
                    packageCode: packageInfo.code,
                    totalValue,
                    componentCount: componentsData.content.length,
                    includedComponents: componentsData.content.filter(c => c.isIncluded).length,
                    extraComponents: componentsData.content.filter(c => !c.isIncluded).length,
                    components: componentsData.content,
                    performance: {
                        occupancyRate: totalRoomNights > 0 ? (bookedRoomNights / totalRoomNights) * 100 : 0,
                        averageRate,
                        totalRevenue,
                        bookingsCount: bookedRoomNights
                    },
                    marketPosition: {
                        tier: averageRate > 400 ? 'luxury' : averageRate > 250 ? 'premium' : averageRate > 150 ? 'standard' : 'budget',
                        competitiveness: Math.random() * 100, // Mock data
                        demandScore: Math.random() * 100 // Mock data
                    }
                } as PackageComparisonData;
            });

            const results = await Promise.all(comparisonPromises);
            setComparisonData(results.filter(Boolean) as PackageComparisonData[]);

        } catch (error) {
            toast.error('Failed to load comparison data');
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate comparison metrics between packages
    const getComparisonMetrics = (package1: PackageComparisonData, package2: PackageComparisonData): ComparisonMetrics => {
        const priceDifference = package1.totalValue - package2.totalValue;
        const priceDifferencePercent = package1.totalValue > 0 ?
            (priceDifference / package1.totalValue) * 100 : 0;

        // Calculate component overlap
        const comp1Names = new Set(package1.components.map(c => c.componentName.toLowerCase()));
        const comp2Names = new Set(package2.components.map(c => c.componentName.toLowerCase()));
        const overlap = new Set([...comp1Names].filter(x => comp2Names.has(x)));
        const componentOverlap = (overlap.size / Math.max(comp1Names.size, comp2Names.size)) * 100;

        // Determine value proposition
        let valueProposition: 'better' | 'worse' | 'similar' = 'similar';
        let recommendation = '';

        if (priceDifferencePercent > 15) {
            valueProposition = 'worse';
            recommendation = `${package1.packageName} offers better value for money`;
        } else if (priceDifferencePercent < -15) {
            valueProposition = 'better';
            recommendation = `${package1.packageName} provides superior value`;
        } else {
            recommendation = `Both packages offer similar value`;
        }

        // Unique advantages
        const uniqueAdvantages: string[] = [];
        if (package1.performance.occupancyRate > package2.performance.occupancyRate + 10) {
            uniqueAdvantages.push('Higher occupancy rate');
        }
        if (package1.componentCount > package2.componentCount) {
            uniqueAdvantages.push('More package components');
        }
        if (package1.marketPosition.competitiveness > package2.marketPosition.competitiveness + 20) {
            uniqueAdvantages.push('Better market competitiveness');
        }

        // Potential issues
        const potentialIssues: string[] = [];
        if (package1.performance.occupancyRate < package2.performance.occupancyRate - 10) {
            potentialIssues.push('Lower occupancy rate');
        }
        if (package1.totalValue > package2.totalValue * 1.5) {
            potentialIssues.push('Significantly higher price');
        }

        return {
            priceDifference,
            priceDifferencePercent,
            componentOverlap,
            valueProposition,
            recommendation,
            uniqueAdvantages,
            potentialIssues
        };
    };

    // Toggle package selection
    const togglePackageSelection = (packageId: number) => {
        setSelectedPackages(prev => {
            if (prev.includes(packageId)) {
                return prev.filter(id => id !== packageId);
            } else if (prev.length < 4) { // Limit to 4 packages for comparison
                return [...prev, packageId];
            } else {
                toast.error('Maximum 4 packages can be compared at once');
                return prev;
            }
        });
    };

    // Format currency
    const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

    // Format percentage
    const formatPercent = (value: number) => `${value.toFixed(1)}%`;

    // Get price comparison indicator
    const getPriceIndicator = (value: number) => {
        if (value > 0) return { icon: ArrowUpRight, color: 'text-emerald-600', label: 'Higher' };
        if (value < 0) return { icon: ArrowDownRight, color: 'text-rose-600', label: 'Lower' };
        return { icon: Minus, color: 'text-muted-foreground', label: 'Same' };
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin mr-3" />
                Loading comparison data...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 border-b">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Scale className="h-5 w-5 text-cyan-600" />
                                Package Comparison Tool
                            </CardTitle>
                            <CardDescription>
                                Compare package offerings, pricing, and performance side by side
                            </CardDescription>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Period Selector */}
                            <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="30days">30 Days</SelectItem>
                                    <SelectItem value="90days">90 Days</SelectItem>
                                    <SelectItem value="1year">1 Year</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                variant="outline"
                                onClick={loadComparisonData}
                                disabled={selectedPackages.length < 2}
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Compare
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-6">
                    {/* Package Selection */}
                    <div className="mb-6">
                        <h3 className="text-sm font-medium mb-3">Select Packages to Compare (2-4 packages)</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {packages.map(pkg => {
                                const isSelected = selectedPackages.includes(pkg.id);
                                return (
                                    <Card
                                        key={pkg.id}
                                        className={cn(
                                            "cursor-pointer transition-all hover:shadow-md",
                                            isSelected && "ring-2 ring-primary bg-primary/5"
                                        )}
                                        onClick={() => togglePackageSelection(pkg.id)}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                {isSelected && <CheckCircle className="h-4 w-4 text-primary" />}
                                            </div>
                                            <div className="text-sm font-medium">{pkg.name}</div>
                                            <div className="text-xs text-muted-foreground">{pkg.code}</div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>

                    {/* Comparison Results */}
                    {comparisonData.length >= 2 && (
                        <div className="space-y-6">
                            {/* Overview Comparison Table */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Package Overview Comparison</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Package</TableHead>
                                                <TableHead className="text-right">Total Value</TableHead>
                                                <TableHead className="text-right">Components</TableHead>
                                                <TableHead className="text-right">Included</TableHead>
                                                <TableHead className="text-right">Extra</TableHead>
                                                <TableHead className="text-right">Occupancy</TableHead>
                                                <TableHead className="text-right">Avg Rate</TableHead>
                                                <TableHead className="text-center">Market Tier</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {comparisonData.map(pkg => (
                                                <TableRow key={pkg.packageId}>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{pkg.packageName}</div>
                                                            <div className="text-xs text-muted-foreground">{pkg.packageCode}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right font-semibold">
                                                        {formatCurrency(pkg.totalValue)}
                                                    </TableCell>
                                                    <TableCell className="text-right">{pkg.componentCount}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Badge variant="default">{pkg.includedComponents}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Badge variant="outline">{pkg.extraComponents}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {formatPercent(pkg.performance.occupancyRate)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {formatCurrency(pkg.performance.averageRate)}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="outline" className="capitalize">
                                                            {pkg.marketPosition.tier}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            {/* Detailed Comparisons */}
                            {comparisonData.length === 2 && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Price Comparison */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Price Comparison</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {(() => {
                                                const metrics = getComparisonMetrics(comparisonData[0], comparisonData[1]);
                                                const indicator = getPriceIndicator(metrics.priceDifference);
                                                const IndicatorIcon = indicator.icon;

                                                return (
                                                    <>
                                                        <div className="text-center p-4 rounded-lg bg-muted/50">
                                                            <div className="text-2xl font-bold mb-2">
                                                                {formatCurrency(Math.abs(metrics.priceDifference))}
                                                            </div>
                                                            <div className="flex items-center justify-center gap-2">
                                                                <IndicatorIcon className={cn("h-5 w-5", indicator.color)} />
                                                                <span className="text-sm text-muted-foreground">
                                                                    {comparisonData[0].packageName} is {formatPercent(Math.abs(metrics.priceDifferencePercent))} {indicator.label.toLowerCase()}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="text-center">
                                                                <div className="text-2xl font-bold text-primary">
                                                                    {formatCurrency(comparisonData[0].totalValue)}
                                                                </div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    {comparisonData[0].packageName}
                                                                </div>
                                                            </div>
                                                            <div className="text-center">
                                                                <div className="text-2xl font-bold text-muted-foreground">
                                                                    {formatCurrency(comparisonData[1].totalValue)}
                                                                </div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    {comparisonData[1].packageName}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </CardContent>
                                    </Card>

                                    {/* Feature Comparison */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Feature Comparison</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {(() => {
                                                const metrics = getComparisonMetrics(comparisonData[0], comparisonData[1]);
                                                return (
                                                    <div className="space-y-4">
                                                        <div className="text-center p-4 rounded-lg bg-muted/50">
                                                            <div className="text-2xl font-bold mb-2">
                                                                {formatPercent(metrics.componentOverlap)}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                Component Overlap
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <h4 className="font-medium mb-2">{comparisonData[0].packageName}</h4>
                                                                <div className="text-2xl font-bold text-primary mb-1">
                                                                    {comparisonData[0].componentCount}
                                                                </div>
                                                                <div className="text-sm text-muted-foreground">Total Components</div>
                                                            </div>
                                                            <div>
                                                                <h4 className="font-medium mb-2">{comparisonData[1].packageName}</h4>
                                                                <div className="text-2xl font-bold text-muted-foreground mb-1">
                                                                    {comparisonData[1].componentCount}
                                                                </div>
                                                                <div className="text-sm text-muted-foreground">Total Components</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Component Breakdown Comparison */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Component Breakdown</CardTitle>
                                    <CardDescription>Detailed comparison of package components</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {/* Get all unique component types */}
                                        {(() => {
                                            const allComponentTypes = new Set<string>();
                                            comparisonData.forEach(pkg => {
                                                pkg.components.forEach(comp => {
                                                    allComponentTypes.add(comp.componentType);
                                                });
                                            });

                                            return Array.from(allComponentTypes).map(componentType => (
                                                <div key={componentType} className="border rounded-lg p-4">
                                                    <h4 className="font-medium mb-3 capitalize">{componentType.toLowerCase()}</h4>
                                                    <div className="grid gap-2">
                                                        {comparisonData.map(pkg => {
                                                            const typeComponents = pkg.components.filter(c => c.componentType === componentType);
                                                            return (
                                                                <div key={pkg.packageId} className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <Badge variant="outline" className="w-20 text-center">
                                                                            {pkg.packageCode}
                                                                        </Badge>
                                                                        <span className="text-sm">
                                                                            {typeComponents.length} component{typeComponents.length !== 1 ? 's' : ''}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        {typeComponents.slice(0, 2).map(comp => (
                                                                            <Badge
                                                                                key={comp.id}
                                                                                variant={comp.isIncluded ? "default" : "secondary"}
                                                                                className="text-xs"
                                                                            >
                                                                                {comp.componentName}
                                                                            </Badge>
                                                                        ))}
                                                                        {typeComponents.length > 2 && (
                                                                            <Badge variant="outline" className="text-xs">
                                                                                +{typeComponents.length - 2} more
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ));
                                        })()}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Performance Comparison */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Performance Comparison</CardTitle>
                                    <CardDescription>Revenue and occupancy performance metrics</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {comparisonData.map(pkg => (
                                            <Card key={pkg.packageId}>
                                                <CardContent className="p-4">
                                                    <div className="text-center mb-4">
                                                        <div className="font-medium">{pkg.packageName}</div>
                                                        <div className="text-sm text-muted-foreground">{pkg.packageCode}</div>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-muted-foreground">Revenue</span>
                                                            <span className="font-semibold">{formatCurrency(pkg.performance.totalRevenue)}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-muted-foreground">Occupancy</span>
                                                            <span className="font-semibold">{formatPercent(pkg.performance.occupancyRate)}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-muted-foreground">Avg Rate</span>
                                                            <span className="font-semibold">{formatCurrency(pkg.performance.averageRate)}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-muted-foreground">Bookings</span>
                                                            <span className="font-semibold">{pkg.performance.bookingsCount}</span>
                                                        </div>
                                                    </div>

                                                    {/* Market position indicator */}
                                                    <div className="mt-4 pt-3 border-t">
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="text-muted-foreground">Competitiveness</span>
                                                            <span className="font-medium">{formatPercent(pkg.marketPosition.competitiveness)}</span>
                                                        </div>
                                                        <Progress value={pkg.marketPosition.competitiveness} className="mt-1" />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recommendations */}
                            {comparisonData.length === 2 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Target className="h-5 w-5" />
                                            Comparison Insights
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {(() => {
                                            const metrics = getComparisonMetrics(comparisonData[0], comparisonData[1]);
                                            return (
                                                <div className="space-y-4">
                                                    <div className="p-4 rounded-lg bg-muted/50">
                                                        <h4 className="font-medium mb-2">Recommendation</h4>
                                                        <p className="text-sm text-muted-foreground">{metrics.recommendation}</p>
                                                    </div>

                                                    {metrics.uniqueAdvantages.length > 0 && (
                                                        <div>
                                                            <h4 className="font-medium mb-2 text-emerald-700">Unique Advantages</h4>
                                                            <ul className="space-y-1">
                                                                {metrics.uniqueAdvantages.map((advantage, index) => (
                                                                    <li key={index} className="flex items-center gap-2 text-sm">
                                                                        <Plus className="h-3 w-3 text-emerald-600" />
                                                                        {advantage}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {metrics.potentialIssues.length > 0 && (
                                                        <div>
                                                            <h4 className="font-medium mb-2 text-amber-700">Potential Issues</h4>
                                                            <ul className="space-y-1">
                                                                {metrics.potentialIssues.map((issue, index) => (
                                                                    <li key={index} className="flex items-center gap-2 text-sm">
                                                                        <Minus className="h-3 w-3 text-amber-600" />
                                                                        {issue}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

                    {selectedPackages.length < 2 && (
                        <Card>
                            <CardContent className="p-8 text-center text-muted-foreground">
                                <Scale className="h-12 w-12 mx-auto mb-4 opacity-30" />
                                <p className="text-lg font-medium">Select at least 2 packages to compare</p>
                                <p className="text-sm">Choose packages from the selection above to see detailed comparisons</p>
                            </CardContent>
                        </Card>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
