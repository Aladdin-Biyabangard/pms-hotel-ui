import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {PageWrapper} from "@/components/layout/PageWrapper";
import {StatsCard} from "@/components/hotel";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart";
import {Badge} from "@/components/ui/badge";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {
    Activity,
    AlertCircle,
    ArrowRight,
    BarChart3,
    Cloud,
    DollarSign,
    GripVertical,
    Hotel,
    Percent,
    Plus,
    Receipt,
    Settings,
    Sun,
    Target,
    TrendingUp,
    Users,
    X
} from "lucide-react";
import {cn} from "@/lib/utils";
import {Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis} from "recharts";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Enhanced stats with trends and real data simulation
  const [stats] = useState({
    totalHotels: 12,
    totalRooms: 485,
    totalGuests: 2347,
    totalRevenue: 1256800,
    occupancyRate: 78.5,
    averageDailyRate: 285,
    bookingsToday: 24,
    checkInsToday: 18,
    checkOutsToday: 22,
  });

  // Revenue trend data for the last 7 days
  const revenueData = [
    { day: "Mon", revenue: 15200, bookings: 12 },
    { day: "Tue", revenue: 18900, bookings: 15 },
    { day: "Wed", revenue: 22100, bookings: 18 },
    { day: "Thu", revenue: 19800, bookings: 16 },
    { day: "Fri", revenue: 25400, bookings: 22 },
    { day: "Sat", revenue: 28900, bookings: 28 },
    { day: "Sun", revenue: 26700, bookings: 24 },
  ];

  // Occupancy data for the last 30 days
  const occupancyData = [
    { date: "Jan 1", occupied: 78, total: 485 },
    { date: "Jan 8", occupied: 82, total: 485 },
    { date: "Jan 15", occupied: 85, total: 485 },
    { date: "Jan 22", occupied: 79, total: 485 },
    { date: "Jan 29", occupied: 88, total: 485 },
  ];

  // Recent activities
  const recentActivities = [
    { id: 1, type: "check-in", guest: "John Smith", room: "201", time: "2 hours ago", avatar: "/api/placeholder/32/32" },
    { id: 2, type: "booking", guest: "Sarah Johnson", room: "305", time: "4 hours ago", avatar: "/api/placeholder/32/32" },
    { id: 3, type: "check-out", guest: "Mike Davis", room: "108", time: "6 hours ago", avatar: "/api/placeholder/32/32" },
    { id: 4, type: "maintenance", guest: "Room Service", room: "412", time: "8 hours ago", avatar: "/api/placeholder/32/32" },
  ];

  // Alerts and notifications
  const alerts = [
    { id: 1, type: "warning", message: "Room 305 maintenance scheduled for tomorrow", time: "1 hour ago" },
    { id: 2, type: "info", message: "New booking received for Deluxe Suite", time: "3 hours ago" },
    { id: 3, type: "success", message: "All housekeeping tasks completed", time: "5 hours ago" },
  ];

  const quickActions = [
    { icon: Plus, label: "New Booking", color: "bg-accent text-accent-foreground", onClick: () => navigate("/reservations/new") },
    { icon: Hotel, label: "Manage Hotels", color: "bg-primary text-primary-foreground", onClick: () => navigate("/hotels") },
    { icon: Users, label: "Guest Directory", color: "bg-info text-info-foreground", onClick: () => navigate("/guests") },
    { icon: Receipt, label: "Financial Reports", color: "bg-success text-success-foreground", onClick: () => navigate("/reports") },
  ];

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getGreetingIcon = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return Sun;
    if (hour < 17) return Cloud;
    return Activity;
  };

  const GreetingIcon = getGreetingIcon();

  return (
    <PageWrapper title="Dashboard" subtitle={`${getGreeting()}, here's your hotel overview`}>
      {/* Page Composer Toggle - OPERA Cloud Style */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <GreetingIcon className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {getGreeting()}, Admin!
            </h2>
            <p className="text-sm text-muted-foreground">
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
        <Button
          variant={isCustomizing ? "default" : "outline"}
          size="sm"
          onClick={() => setIsCustomizing(!isCustomizing)}
          className="gap-2"
        >
          {isCustomizing ? (
            <>
              <X className="h-4 w-4" />
              Exit Customization
            </>
          ) : (
            <>
              <Settings className="h-4 w-4" />
              Customize Dashboard
            </>
          )}
        </Button>
      </div>

      {isCustomizing && (
        <div className="mb-6 p-4 bg-info/10 border border-info/20 rounded-lg">
          <p className="text-sm text-foreground flex items-center gap-2">
            <GripVertical className="h-4 w-4" />
            <span>Drag widgets to reorder • Click gear icon to customize individual widgets</span>
          </p>
        </div>
      )}

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className={cn("relative group", isCustomizing && "ring-2 ring-primary/50 rounded-lg")}>
          {isCustomizing && (
            <div className="absolute -top-2 -right-2 z-10">
              <Button variant="secondary" size="icon" className="h-6 w-6 rounded-full">
                <Settings className="h-3 w-3" />
              </Button>
            </div>
          )}
          <StatsCard
            title="Total Hotels"
            value={stats.totalHotels.toString()}
            subtitle="Active properties"
            icon={Hotel}
            trend={{ value: 8.2, isPositive: true }}
            iconClassName="bg-primary/10"
            className="transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
          />
        </div>
        <div className={cn("relative group", isCustomizing && "ring-2 ring-primary/50 rounded-lg")}>
          {isCustomizing && (
            <div className="absolute -top-2 -right-2 z-10">
              <Button variant="secondary" size="icon" className="h-6 w-6 rounded-full">
                <Settings className="h-3 w-3" />
              </Button>
            </div>
          )}
          <StatsCard
            title="Occupancy Rate"
            value={`${stats.occupancyRate}%`}
            subtitle="Current occupancy"
            icon={Percent}
            trend={{ value: 3.1, isPositive: true }}
            iconClassName="bg-info/10"
            className="transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
          />
        </div>
        <div className={cn("relative group", isCustomizing && "ring-2 ring-primary/50 rounded-lg")}>
          {isCustomizing && (
            <div className="absolute -top-2 -right-2 z-10">
              <Button variant="secondary" size="icon" className="h-6 w-6 rounded-full">
                <Settings className="h-3 w-3" />
              </Button>
            </div>
          )}
          <StatsCard
            title="Avg. Daily Rate"
            value={`$${stats.averageDailyRate}`}
            subtitle="Revenue per room"
            icon={DollarSign}
            trend={{ value: 5.7, isPositive: true }}
            iconClassName="bg-success/10"
            className="transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
          />
        </div>
        <div className={cn("relative group", isCustomizing && "ring-2 ring-primary/50 rounded-lg")}>
          {isCustomizing && (
            <div className="absolute -top-2 -right-2 z-10">
              <Button variant="secondary" size="icon" className="h-6 w-6 rounded-full">
                <Settings className="h-3 w-3" />
              </Button>
            </div>
          )}
          <StatsCard
            title="Today's Revenue"
            value={`$${revenueData[revenueData.length - 1]?.revenue.toLocaleString() || '0'}`}
            subtitle="Revenue today"
            icon={TrendingUp}
            trend={{ value: 12.4, isPositive: true }}
            iconClassName="bg-accent/10"
            className="transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
          />
        </div>
      </div>

      {/* Charts and Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend Chart */}
        <div className={cn("relative", isCustomizing && "ring-2 ring-primary/50 rounded-lg")}>
          {isCustomizing && (
            <div className="absolute -top-2 -right-2 z-10">
              <Button variant="secondary" size="icon" className="h-6 w-6 rounded-full">
                <Settings className="h-3 w-3" />
              </Button>
            </div>
          )}
          <Card className="border-border/50 shadow-soft">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Weekly Revenue Trend
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  Last 7 days
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  revenue: {
                    label: "Revenue",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-[200px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Occupancy Chart */}
        <div className={cn("relative", isCustomizing && "ring-2 ring-primary/50 rounded-lg")}>
          {isCustomizing && (
            <div className="absolute -top-2 -right-2 z-10">
              <Button variant="secondary" size="icon" className="h-6 w-6 rounded-full">
                <Settings className="h-3 w-3" />
              </Button>
            </div>
          )}
          <Card className="border-border/50 shadow-soft">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Occupancy Trend
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  Last 30 days
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  occupied: {
                    label: "Occupied Rooms",
                    color: "hsl(var(--info))",
                  },
                }}
                className="h-[200px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={occupancyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="occupied"
                      stroke="hsl(var(--info))"
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--info))", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Section: Activities, Alerts, and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className={cn("relative", isCustomizing && "ring-2 ring-primary/50 rounded-lg")}>
          {isCustomizing && (
            <div className="absolute -top-2 -right-2 z-10">
              <Button variant="secondary" size="icon" className="h-6 w-6 rounded-full">
                <Settings className="h-3 w-3" />
              </Button>
            </div>
          )}
          <Card className="border-border/50 shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={activity.avatar} />
                    <AvatarFallback>
                      {activity.guest.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {activity.guest}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.type} • Room {activity.room}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {activity.time}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Alerts & Notifications */}
        <div className={cn("relative", isCustomizing && "ring-2 ring-primary/50 rounded-lg")}>
          {isCustomizing && (
            <div className="absolute -top-2 -right-2 z-10">
              <Button variant="secondary" size="icon" className="h-6 w-6 rounded-full">
                <Settings className="h-3 w-3" />
              </Button>
            </div>
          )}
          <Card className="border-border/50 shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Alerts & Updates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={cn(
                    "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                    alert.type === 'warning' && "bg-yellow-500",
                    alert.type === 'info' && "bg-blue-500",
                    alert.type === 'success' && "bg-green-500"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      {alert.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {alert.time}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Quick Actions */}
        <div className={cn("relative", isCustomizing && "ring-2 ring-primary/50 rounded-lg")}>
          {isCustomizing && (
            <div className="absolute -top-2 -right-2 z-10">
              <Button variant="secondary" size="icon" className="h-6 w-6 rounded-full">
                <Settings className="h-3 w-3" />
              </Button>
            </div>
          )}
          <Card className="border-border/50 shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="w-full justify-start h-12 hover:border-accent/50 transition-all duration-200 hover:shadow-md"
                  onClick={action.onClick}
                >
                  <div className={`w-9 h-9 rounded-lg ${action.color} flex items-center justify-center mr-3 transition-transform group-hover:scale-110`}>
                    <action.icon className="h-4 w-4" />
                  </div>
                  <span className="font-medium">{action.label}</span>
                  <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground transition-transform group-hover:translate-x-1" />
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Dashboard;
