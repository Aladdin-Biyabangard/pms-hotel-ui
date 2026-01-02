import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { RatePlanAnalytics } from '../../hooks/useRatePlanAnalytics';

interface RatePlanValidityTrendChartProps {
  analytics: RatePlanAnalytics;
  isLoading?: boolean;
}

export function RatePlanValidityTrendChart({ analytics, isLoading }: RatePlanValidityTrendChartProps) {
  const chartConfig = {
    count: {
      label: 'Rate Plans',
      color: 'hsl(var(--chart-1))',
    },
    averageValidityDays: {
      label: 'Avg Validity Days',
      color: 'hsl(var(--chart-2))',
    },
  };

  const chartData = analytics.validityPeriodTrends.map((item, index) => ({
    period: item.period,
    count: item.count,
    averageValidityDays: Math.round(item.averageValidityDays),
    fill: `hsl(${160 + (index * 25) % 360}, 70%, 50%)`
  }));

  // Sort by period for logical order
  const periodOrder = ['1 month', '1-3 months', '3-6 months', '6-12 months', '1+ years'];
  chartData.sort((a, b) => {
    const aIndex = periodOrder.indexOf(a.period);
    const bIndex = periodOrder.indexOf(b.period);
    return aIndex - bIndex;
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Validity Period Trends</CardTitle>
          <CardDescription>Loading trend data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse space-y-4 w-full">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
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
          <CardTitle>Validity Period Trends</CardTitle>
          <CardDescription>No validity period data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            No rate plans with validity periods found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Validity Period Trends</CardTitle>
        <CardDescription>
          Distribution of rate plans by validity duration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart - Count by Period */}
          <div>
            <h4 className="text-sm font-medium mb-4">Rate Plans by Validity Period</h4>
            <ChartContainer config={chartConfig} className="h-64">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="period"
                  fontSize={11}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis fontSize={10} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => {
                        if (name === 'count') {
                          return [value, 'Rate Plans'];
                        }
                        return [value, name];
                      }}
                    />
                  }
                />
                <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </div>

          {/* Line Chart - Average Days */}
          <div>
            <h4 className="text-sm font-medium mb-4">Average Validity Duration</h4>
            <ChartContainer config={chartConfig} className="h-64">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="period"
                  fontSize={11}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  fontSize={10}
                  tickFormatter={(value) => `${value}d`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => {
                        if (name === 'averageValidityDays') {
                          return [`${value} days`, 'Average Duration'];
                        }
                        return [value, name];
                      }}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="averageValidityDays"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ChartContainer>
          </div>
        </div>

        {/* Summary stats */}
        <div className="mt-6 grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">
              {chartData.reduce((sum, d) => sum + d.count, 0)}
            </div>
            <div className="text-xs text-muted-foreground">Total Plans</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">
              {chartData.find(d => d.count === Math.max(...chartData.map(x => x.count)))?.period || 'N/A'}
            </div>
            <div className="text-xs text-muted-foreground">Most Common</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">
              {Math.round(chartData.reduce((sum, d) => sum + (d.averageValidityDays * d.count), 0) /
                chartData.reduce((sum, d) => sum + d.count, 0))}d
            </div>
            <div className="text-xs text-muted-foreground">Avg Duration</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">
              {Math.max(...chartData.map(d => d.averageValidityDays))}d
            </div>
            <div className="text-xs text-muted-foreground">Max Duration</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
