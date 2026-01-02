import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {StatsCard} from '@/components/hotel/StatsCard';
import {Badge} from '@/components/ui/badge';
import {
    AlertCircle,
    Calendar,
    Copy,
    DollarSign,
    FileSpreadsheet,
    Grid3x3,
    Package,
    Plus,
    RefreshCw,
    TrendingUp
} from 'lucide-react';
import {ratePlanApi, RatePlanResponse} from '@/modules/rate/RatePlan';
import {roomRateApi, RoomRateResponse} from '@/api/roomRate';
import {rateOverrideApi} from '@/modules/rate/RateOverride/api/rateOverride';
import {toast} from 'sonner';
import {format, isAfter, isBefore} from 'date-fns';
import {cn} from '@/lib/utils';

interface RateManagementDashboardProps {
  onNavigateToTab?: (tab: string) => void; // Deprecated - kept for backwards compatibility
}

export function RateManagementDashboard({ onNavigateToTab }: RateManagementDashboardProps) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRatePlans: 0,
    activeRatePlans: 0,
    totalRoomRates: 0,
    averageRate: 0,
    totalOverrides: 0,
    upcomingExpirations: 0,
    ratePlansWithoutRates: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentRatePlans, setRecentRatePlans] = useState<RatePlanResponse[]>([]);
  const [upcomingExpirations, setUpcomingExpirations] = useState<RatePlanResponse[]>([]);
  const [todayRates, setTodayRates] = useState<RoomRateResponse[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const ratePlansData = await ratePlanApi.getAllRatePlans(0, 1000);

      const ratePlans = ratePlansData.content;
      const activeRatePlans = ratePlans.filter(rp => rp.status === 'ACTIVE');
      
      // Load today's rates
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayRatesData = await roomRateApi.getAllRoomRates(0, 1000, {
        rateDate: today
      });

      // Load overrides
      const overridesData = await rateOverrideApi.getAllRateOverrides(0, 1000);

      // Calculate statistics
      const totalRates = todayRatesData.content.length;
      const averageRate = totalRates > 0
        ? todayRatesData.content.reduce((sum, rate) => sum + rate.rateAmount, 0) / totalRates
        : 0;

      // Find upcoming expirations (next 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const expiring = ratePlans.filter(rp => {
        if (!rp.validTo) return false;
        const validTo = new Date(rp.validTo);
        return isAfter(validTo, new Date()) && isBefore(validTo, thirtyDaysFromNow);
      });

      // Find rate plans without rates
      const ratePlansWithoutRates = ratePlans.filter(rp => {
        return !todayRatesData.content.some(rate => rate.ratePlan?.id === rp.id);
      });

      setStats({
        totalRatePlans: ratePlans.length,
        activeRatePlans: activeRatePlans.length,
        totalRoomRates: totalRates,
        averageRate: averageRate,
        totalOverrides: overridesData.content.length,
        upcomingExpirations: expiring.length,
        ratePlansWithoutRates: ratePlansWithoutRates.length,
      });

      // Set recent rate plans (last 5)
      setRecentRatePlans(ratePlans.slice(0, 5));
      setUpcomingExpirations(expiring.slice(0, 5));
      setTodayRates(todayRatesData.content.slice(0, 10));
    } catch (error) {
      console.error('Failed to load dashboard data', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      label: 'Create Rate Plan',
      icon: Plus,
      onClick: () => navigate('/rate-plans/new'),
      color: 'bg-blue-500',
    },
    {
      label: 'Add Daily Rate',
      icon: Calendar,
      onClick: () => navigate('/daily-rates/new'),
      color: 'bg-green-500',
    },
    {
      label: 'Bulk Update',
      icon: Copy,
      onClick: () => navigate('/bulk-rate-update'),
      color: 'bg-purple-500',
    },
    {
      label: 'Rate Matrix',
      icon: Grid3x3,
      onClick: () => navigate('/rate-matrix'),
      color: 'bg-orange-500',
    },
    {
      label: 'Export Rates',
      icon: FileSpreadsheet,
      onClick: () => toast.info('Export feature coming soon'),
      color: 'bg-indigo-500',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Rate Plans"
          value={stats.totalRatePlans}
          subtitle={`${stats.activeRatePlans} active`}
          icon={Package}
          trend={stats.totalRatePlans > 0 ? { value: 0, isPositive: true } : undefined}
        />
        <StatsCard
          title="Today's Rates"
          value={stats.totalRoomRates}
          subtitle={`Avg: $${stats.averageRate.toFixed(2)}`}
          icon={DollarSign}
        />
        <StatsCard
          title="Active Overrides"
          value={stats.totalOverrides}
          subtitle="Rate overrides"
          icon={TrendingUp}
        />
        <StatsCard
          title="Expiring Soon"
          value={stats.upcomingExpirations}
          subtitle="Next 30 days"
          icon={AlertCircle}
          iconClassName={stats.upcomingExpirations > 0 ? 'bg-yellow-500/10' : undefined}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common rate management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto flex-col gap-2 py-4 hover:bg-accent transition-colors"
                onClick={action.onClick}
              >
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', action.color, 'text-white')}>
                  <action.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-center">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts & Warnings */}
      {(stats.upcomingExpirations > 0 || stats.ratePlansWithoutRates > 0) && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <AlertCircle className="h-5 w-5" />
              Attention Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.upcomingExpirations > 0 && (
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium">Rate Plans Expiring Soon</p>
                  <p className="text-sm text-muted-foreground">
                    {stats.upcomingExpirations} rate plan(s) will expire in the next 30 days
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/rate-plans')}
                >
                  Review
                </Button>
              </div>
            )}
            {stats.ratePlansWithoutRates > 0 && (
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium">Rate Plans Without Rates</p>
                  <p className="text-sm text-muted-foreground">
                    {stats.ratePlansWithoutRates} rate plan(s) have no rates set for today
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/lendar')}
                >
                  Add Rates
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Activity & Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Rate Plans */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Rate Plans</CardTitle>
                <CardDescription>Latest rate plans created</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/rate-plans')}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentRatePlans.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No rate plans yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => navigate('/rate-plans/new')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Rate Plan
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentRatePlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => navigate(`/rate-plans/${plan.id}`)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{plan.name}</p>
                        <Badge variant={plan.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {plan.status}
                        </Badge>
                        {plan.isDefault && (
                          <Badge variant="outline">Default</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{plan.code}</p>
                    </div>
                    <div className="text-right">
                      {plan.rateType && (
                        <p className="text-sm font-medium">{plan.rateType.name}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Rates Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Today's Rates</CardTitle>
                <CardDescription>Rates for {format(new Date(), 'MMM dd, yyyy')}</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/rate-matrix')}
              >
                View Calendar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {todayRates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No rates set for today</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => navigate('/daily-rates/new')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rates
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {todayRates.slice(0, 5).map((rate) => (
                  <div
                    key={rate.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => navigate('/rate-matrix')}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {rate.roomType?.name || 'Unknown Room Type'}
                        </p>
                        {rate.stopSell && (
                          <Badge variant="destructive" className="text-xs">Stop</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {rate.ratePlan?.name || 'Unknown Rate Plan'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        ${rate.rateAmount.toFixed(2)}
                      </p>
                      {rate.availabilityCount !== undefined && (
                        <p className="text-xs text-muted-foreground">
                          Avail: {rate.availabilityCount}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {todayRates.length > 5 && (
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => navigate('/rate-matrix')}
                  >
                    View All {todayRates.length} Rates
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Expirations */}
      {upcomingExpirations.length > 0 && (
        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Upcoming Expirations
            </CardTitle>
            <CardDescription>Rate plans expiring in the next 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingExpirations.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center justify-between p-3 border border-yellow-200 rounded-lg bg-yellow-50 dark:bg-yellow-950/20"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{plan.name}</p>
                      <Badge variant="outline" className="bg-yellow-100">
                        Expires: {plan.validTo ? format(new Date(plan.validTo), 'MMM dd, yyyy') : 'N/A'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.code}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/rate-plans/${plan.id}/edit`)}
                  >
                    Extend
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={loadDashboardData}
          disabled={isLoading}
        >
          <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
          Refresh Data
        </Button>
      </div>
    </div>
  );
}

