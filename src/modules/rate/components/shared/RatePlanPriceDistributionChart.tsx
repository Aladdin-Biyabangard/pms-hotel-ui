import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { RatePlanAnalytics } from '../../hooks/useRatePlanAnalytics';

interface RatePlanPriceDistributionChartProps {
  analytics: RatePlanAnalytics;
  isLoading?: boolean;
}

export function RatePlanPriceDistributionChart({ analytics, isLoading }: RatePlanPriceDistributionChartProps) {
  const chartConfig = {
    averagePrice: {
      label: 'Average Price',
      color: 'hsl(var(--chart-1))',
    },
    count: {
      label: 'Rate Plans',
      color: 'hsl(var(--chart-2))',
    },
  };

  const chartData = analytics.ratePlansByType.map(item => ({
    rateType: item.rateType.name,
    averagePrice: Math.round(item.averagePrice * 100) / 100,
    count: item.count,
    fill: `hsl(${200 + (item.rateType.id * 30) % 360}, 70%, 50%)`
  }));

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Price Distribution by Rate Type</CardTitle>
          <CardDescription>Loading chart data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse space-y-4 w-full">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Price Distribution by Rate Type</CardTitle>
          <CardDescription>No data available for the selected filters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            No rate plans found for analysis
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Distribution by Rate Type</CardTitle>
        <CardDescription>
          Average pricing and plan count across different rate types
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="rateType"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              yAxisId="price"
              orientation="left"
              fontSize={12}
              tickFormatter={formatCurrency}
            />
            <YAxis
              yAxisId="count"
              orientation="right"
              fontSize={12}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    if (name === 'averagePrice') {
                      return [formatCurrency(value as number), 'Average Price'];
                    }
                    if (name === 'count') {
                      return [value, 'Rate Plans'];
                    }
                    return [value, name];
                  }}
                  labelFormatter={(label) => `Rate Type: ${label}`}
                />
              }
            />
            <Bar
              yAxisId="price"
              dataKey="averagePrice"
              name="averagePrice"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>

        {/* Summary stats */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">
              {chartData.length}
            </div>
            <div className="text-xs text-muted-foreground">Rate Types</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(Math.max(...chartData.map(d => d.averagePrice)))}
            </div>
            <div className="text-xs text-muted-foreground">Highest Avg Price</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">
              {chartData.reduce((sum, d) => sum + d.count, 0)}
            </div>
            <div className="text-xs text-muted-foreground">Total Plans</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
