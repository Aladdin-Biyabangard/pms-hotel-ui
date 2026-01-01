import {useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
// import {DatePickerWithRange} from "@/components/ui/date-picker";
import {BarChart3, Download, FileText, LineChart, PieChart, TrendingUp} from "lucide-react";

interface Report {
  id: string;
  name: string;
  category: "revenue" | "occupancy" | "guest" | "operational" | "financial";
  description: string;
  lastGenerated?: Date;
}

export function ReportingAnalytics() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("month");

  const reports: Report[] = [
    {
      id: "rev-daily",
      name: "Daily Revenue Report",
      category: "revenue",
      description: "Daily revenue breakdown by source and room type",
    },
    {
      id: "occ-monthly",
      name: "Monthly Occupancy Report",
      category: "occupancy",
      description: "Monthly occupancy rates and trends",
    },
    {
      id: "guest-profile",
      name: "Guest Profile Analysis",
      category: "guest",
      description: "Guest demographics and preferences analysis",
    },
    {
      id: "operational-kpi",
      name: "Operational KPI Dashboard",
      category: "operational",
      description: "Key performance indicators for operations",
    },
    {
      id: "financial-summary",
      name: "Financial Summary Report",
      category: "financial",
      description: "Comprehensive financial overview",
    },
  ];

  const filteredReports = selectedCategory === "all"
    ? reports
    : reports.filter(r => r.category === selectedCategory);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Reporting & Analytics</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="reports">
            <TabsList>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="kpi">KPI Dashboard</TabsTrigger>
            </TabsList>

            <TabsContent value="reports" className="mt-4">
              <div className="flex gap-4 mb-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="occupancy">Occupancy</SelectItem>
                    <SelectItem value="guest">Guest</SelectItem>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredReports.map((report) => (
                  <Card key={report.id} className="border-border/50">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{report.name}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {report.description}
                          </p>
                        </div>
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{report.category}</Badge>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Download className="h-4 w-4" />
                          Generate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Revenue Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground bg-secondary/50 rounded">
                      Revenue Chart (Integration Required)
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Occupancy Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground bg-secondary/50 rounded">
                      Occupancy Chart (Integration Required)
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="h-5 w-5" />
                      Guest Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground bg-secondary/50 rounded">
                      Guest Trends Chart (Integration Required)
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground bg-secondary/50 rounded">
                      Performance Chart (Integration Required)
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="kpi" className="mt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground mb-1">ADR</div>
                    <div className="text-2xl font-bold">$245</div>
                    <div className="text-xs text-success mt-1">↑ 5.2%</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground mb-1">RevPAR</div>
                    <div className="text-2xl font-bold">$185</div>
                    <div className="text-xs text-success mt-1">↑ 3.4%</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground mb-1">Occupancy</div>
                    <div className="text-2xl font-bold">75.5%</div>
                    <div className="text-xs text-success mt-1">↑ 2.1%</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground mb-1">GOPPAR</div>
                    <div className="text-2xl font-bold">$142</div>
                    <div className="text-xs text-destructive mt-1">↓ 1.2%</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

