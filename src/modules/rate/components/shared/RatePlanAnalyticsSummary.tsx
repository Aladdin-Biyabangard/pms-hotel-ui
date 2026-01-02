import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  CheckCircle,
  XCircle,
  DollarSign,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { RatePlanAnalytics } from '../../hooks/useRatePlanAnalytics';
import { cn } from '@/lib/utils';

interface RatePlanAnalyticsSummaryProps {
  analytics: RatePlanAnalytics;
  isLoading?: boolean;
}

export function RatePlanAnalyticsSummary({ analytics, isLoading }: RatePlanAnalyticsSummaryProps) {
  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  const summaryCards = [
    {
      title: 'Total Rate Plans',
      value: analytics.totalRatePlans,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'Active Rate Plans',
      value: analytics.activeRatePlans,
      subtitle: `${analytics.inactiveRatePlans} inactive`,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20'
    },
    {
      title: 'Average Base Price',
      value: formatCurrency(analytics.averageBasePrice),
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      title: 'Price Range',
      value: `${formatCurrency(analytics.minPrice)} - ${formatCurrency(analytics.maxPrice)}`,
      icon: TrendingUp,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      subtitle: analytics.maxPrice > analytics.minPrice ?
        `${((analytics.maxPrice - analytics.minPrice) / analytics.minPrice * 100).toFixed(1)}% spread` :
        'No variation'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-24"></div>
                  <div className="h-8 bg-muted rounded w-16"></div>
                </div>
                <div className="h-12 w-12 bg-muted rounded-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {summaryCards.map((card, index) => (
        <Card key={index} className={cn("transition-all duration-200 hover:shadow-md", card.bgColor)}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">
                    {card.value}
                  </p>
                  {card.title === 'Active Rate Plans' && analytics.totalRatePlans > 0 && (
                    <Badge
                      variant={analytics.activeRatePlans === analytics.totalRatePlans ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {((analytics.activeRatePlans / analytics.totalRatePlans) * 100).toFixed(0)}%
                    </Badge>
                  )}
                </div>
                {card.subtitle && (
                  <p className="text-xs text-muted-foreground">
                    {card.subtitle}
                  </p>
                )}
              </div>
              <card.icon className={cn("h-12 w-12 opacity-80", card.color)} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
