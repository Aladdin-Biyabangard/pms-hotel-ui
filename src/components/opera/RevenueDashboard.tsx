import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {BarChart3, TrendingDown, TrendingUp} from "lucide-react";

interface RevenueMetric {
  label: string;
  value: string;
  change: number;
  trend: "up" | "down";
  period: string;
}

interface RevenueDashboardProps {
  metrics?: RevenueMetric[];
  onPeriodChange?: (period: "today" | "week" | "month" | "year") => void;
}

export function RevenueDashboard({
  metrics = [],
  onPeriodChange,
}: RevenueDashboardProps) {
  const defaultMetrics: RevenueMetric[] = [
    {
      label: "Total Revenue",
      value: "$125,450",
      change: 12.5,
      trend: "up",
      period: "This Month",
    },
    {
      label: "ADR (Average Daily Rate)",
      value: "$245",
      change: 5.2,
      trend: "up",
      period: "This Month",
    },
    {
      label: "RevPAR (Revenue per Available Room)",
      value: "$185",
      change: -2.1,
      trend: "down",
      period: "This Month",
    },
    {
      label: "Occupancy Rate",
      value: "75.5%",
      change: 3.4,
      trend: "up",
      period: "This Month",
    },
  ];

  const displayMetrics = metrics.length > 0 ? metrics : defaultMetrics;

  return (
    <Card className="border-border/50 shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Revenue Management</CardTitle>
          <Tabs defaultValue="month" onValueChange={(v) => onPeriodChange?.(v as any)}>
            <TabsList>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayMetrics.map((metric, index) => (
            <Card key={index} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    {metric.label}
                  </span>
                  {metric.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  )}
                </div>
                <div className="text-2xl font-bold mb-1">{metric.value}</div>
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={
                      metric.trend === "up" ? "text-success" : "text-destructive"
                    }
                  >
                    {metric.trend === "up" ? "+" : ""}
                    {metric.change}%
                  </span>
                  <span className="text-muted-foreground">
                    vs {metric.period}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Revenue Chart Placeholder */}
        <div className="mt-6 p-4 border border-border/50 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Revenue Trend</h3>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="h-64 flex items-center justify-center text-muted-foreground bg-secondary/50 rounded">
            Revenue Chart (Integration Required)
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

