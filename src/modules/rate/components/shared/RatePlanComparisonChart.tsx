import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { RatePlanAnalytics } from '../../hooks/useRatePlanAnalytics';

interface RatePlanComparisonChartProps {
  analytics: RatePlanAnalytics;
  isLoading?: boolean;
}

export function RatePlanComparisonChart({ analytics, isLoading }: RatePlanComparisonChartProps) {
  const chartConfig = {
    count: {
      label: 'Rate Plans',
      color: 'hsl(var(--chart-1))',
    },
    averagePrice: {
      label: 'Average Price',
      color: 'hsl(var(--chart-2))',
    },
  };

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  // Category data
  const categoryData = analytics.ratePlansByCategory.map((item, index) => ({
    name: item.rateCategory.name,
    count: item.count,
    averagePrice: Math.round(item.averagePrice * 100) / 100,
    fill: `hsl(${220 + (index * 40) % 360}, 70%, 50%)`
  }));

  // Class data
  const classData = analytics.ratePlansByClass.map((item, index) => ({
    name: item.rateClass.name,
    count: item.count,
    averagePrice: Math.round(item.averagePrice * 100) / 100,
    fill: `hsl(${280 + (index * 35) % 360}, 70%, 50%)`
  }));

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rate Plan Comparison</CardTitle>
          <CardDescription>Loading comparison data...</CardDescription>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate Plan Comparison</CardTitle>
        <CardDescription>
          Compare rate plans across categories and classes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="categories" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="categories">By Category</TabsTrigger>
            <TabsTrigger value="classes">By Class</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-4">
            {categoryData.length === 0 ? (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                No category data available
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart */}
                <div>
                  <h4 className="text-sm font-medium mb-4">Plan Count & Average Price</h4>
                  <ChartContainer config={chartConfig} className="h-64">
                    <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        fontSize={10}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis fontSize={10} />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value, name) => {
                              if (name === 'averagePrice') {
                                return [formatCurrency(value as number), 'Average Price'];
                              }
                              return [value, 'Rate Plans'];
                            }}
                          />
                        }
                      />
                      <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </div>

                {/* Pie Chart */}
                <div>
                  <h4 className="text-sm font-medium mb-4">Distribution</h4>
                  <ChartContainer config={chartConfig} className="h-64">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="count"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value) => [value, 'Rate Plans']}
                          />
                        }
                      />
                    </PieChart>
                  </ChartContainer>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="classes" className="space-y-4">
            {classData.length === 0 ? (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                No class data available
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart */}
                <div>
                  <h4 className="text-sm font-medium mb-4">Plan Count & Average Price</h4>
                  <ChartContainer config={chartConfig} className="h-64">
                    <BarChart data={classData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        fontSize={10}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis fontSize={10} />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value, name) => {
                              if (name === 'averagePrice') {
                                return [formatCurrency(value as number), 'Average Price'];
                              }
                              return [value, 'Rate Plans'];
                            }}
                          />
                        }
                      />
                      <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </div>

                {/* Pie Chart */}
                <div>
                  <h4 className="text-sm font-medium mb-4">Distribution</h4>
                  <ChartContainer config={chartConfig} className="h-64">
                    <PieChart>
                      <Pie
                        data={classData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="count"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {classData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value) => [value, 'Rate Plans']}
                          />
                        }
                      />
                    </PieChart>
                  </ChartContainer>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
