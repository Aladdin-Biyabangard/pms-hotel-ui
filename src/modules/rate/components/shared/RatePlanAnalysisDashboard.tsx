import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Table, TrendingUp, Target, Filter, ArrowLeft } from 'lucide-react';
import { useRatePlanAnalytics } from '../../hooks/useRatePlanAnalytics';
import { RatePlanAnalyticsSummary } from './RatePlanAnalyticsSummary';
import { RatePlanPriceDistributionChart } from './RatePlanPriceDistributionChart';
import { RatePlanComparisonChart } from './RatePlanComparisonChart';
import { RatePlanValidityTrendChart } from './RatePlanValidityTrendChart';
import { RatePlanAnalyticsTable } from './RatePlanAnalyticsTable';
import { RatePlanAnalyticsFilters } from './RatePlanAnalyticsFilters';
import { EntityStatus } from '@/types/enums';

interface RatePlanAnalysisDashboardProps {
  initialFilters?: {
    rateTypeId?: number;
    rateCategoryId?: number;
    rateClassId?: number;
    status?: EntityStatus;
    dateRange?: { start: string; end: string };
  };
}

export function RatePlanAnalysisDashboard({ initialFilters }: RatePlanAnalysisDashboardProps) {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(initialFilters || {});

  const {
    analytics,
    isLoading,
    error,
    refetch,
    rateTypes,
    rateCategories,
    rateClasses
  } = useRatePlanAnalytics(filters);

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    refetch();
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rate Plan Analysis Dashboard</CardTitle>
          <CardDescription>Analyze rate plan performance and pricing strategy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-destructive mb-2">Failed to load analytics data</div>
            <div className="text-sm text-muted-foreground">{error}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Rate Plan Analysis Dashboard
              </CardTitle>
              <CardDescription>
                Comprehensive analytics for rate plan pricing strategy and performance insights
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/rate-management')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <RatePlanAnalyticsFilters
        rateTypeId={filters.rateTypeId}
        rateCategoryId={filters.rateCategoryId}
        rateClassId={filters.rateClassId}
        status={filters.status}
        dateRange={filters.dateRange}
        rateTypes={rateTypes}
        rateCategories={rateCategories}
        rateClasses={rateClasses}
        onFiltersChange={handleFiltersChange}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />

      {/* Summary Cards */}
      <RatePlanAnalyticsSummary
        analytics={analytics}
        isLoading={isLoading}
      />

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="distribution" className="gap-2">
            <Target className="h-4 w-4" />
            Distribution
          </TabsTrigger>
          <TabsTrigger value="comparison" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Comparison
          </TabsTrigger>
          <TabsTrigger value="trends" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="details" className="gap-2">
            <Table className="h-4 w-4" />
            Details
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RatePlanPriceDistributionChart
              analytics={analytics}
              isLoading={isLoading}
            />
            <RatePlanComparisonChart
              analytics={analytics}
              isLoading={isLoading}
            />
          </div>
          <RatePlanValidityTrendChart
            analytics={analytics}
            isLoading={isLoading}
          />
        </TabsContent>

        {/* Distribution Tab */}
        <TabsContent value="distribution" className="space-y-6">
          <RatePlanPriceDistributionChart
            analytics={analytics}
            isLoading={isLoading}
          />
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-6">
          <RatePlanComparisonChart
            analytics={analytics}
            isLoading={isLoading}
          />
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <RatePlanValidityTrendChart
            analytics={analytics}
            isLoading={isLoading}
          />
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <RatePlanAnalyticsTable
            analytics={analytics}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
