import {useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Switch} from "@/components/ui/switch";
import {AlertCircle, CheckCircle2, Globe, Settings} from "lucide-react";

interface Channel {
  id: number;
  name: string;
  type: "ota" | "gds" | "direct" | "metasearch";
  status: "active" | "inactive" | "error";
  bookings: number;
  revenue: number;
  commission: number;
  lastSync?: Date;
  syncStatus: "success" | "pending" | "error";
}

export function ChannelManagement() {
  const [channels, setChannels] = useState<Channel[]>([
    {
      id: 1,
      name: "Booking.com",
      type: "ota",
      status: "active",
      bookings: 245,
      revenue: 61250,
      commission: 12250,
      syncStatus: "success",
    },
    {
      id: 2,
      name: "Expedia",
      type: "ota",
      status: "active",
      bookings: 189,
      revenue: 47250,
      commission: 9450,
      syncStatus: "success",
    },
    {
      id: 3,
      name: "Hotel Website",
      type: "direct",
      status: "active",
      bookings: 156,
      revenue: 39000,
      commission: 0,
      syncStatus: "success",
    },
    {
      id: 4,
      name: "Amadeus GDS",
      type: "gds",
      status: "active",
      bookings: 78,
      revenue: 19500,
      commission: 975,
      syncStatus: "pending",
    },
    {
      id: 5,
      name: "Trivago",
      type: "metasearch",
      status: "inactive",
      bookings: 0,
      revenue: 0,
      commission: 0,
      syncStatus: "error",
    },
  ]);

  const toggleChannel = (id: number) => {
    setChannels(channels.map(ch => 
      ch.id === id ? { ...ch, status: ch.status === "active" ? "inactive" : "active" } : ch
    ));
  };

  const totalBookings = channels.reduce((sum, ch) => sum + ch.bookings, 0);
  const totalRevenue = channels.reduce((sum, ch) => sum + ch.revenue, 0);
  const totalCommission = channels.reduce((sum, ch) => sum + ch.commission, 0);

  return (
    <Card className="border-border/50 shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Channel Management</CardTitle>
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Configure
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground mb-1">Total Channels</div>
              <div className="text-2xl font-bold">{channels.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground mb-1">Total Bookings</div>
              <div className="text-2xl font-bold">{totalBookings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground mb-1">Total Revenue</div>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground mb-1">Total Commission</div>
              <div className="text-2xl font-bold">${totalCommission.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Channels Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Channel</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Sync Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {channels.map((channel) => (
                <TableRow key={channel.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{channel.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{channel.type.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={channel.status === "active"}
                        onCheckedChange={() => toggleChannel(channel.id)}
                      />
                      <Badge
                        variant={channel.status === "active" ? "default" : "secondary"}
                      >
                        {channel.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{channel.bookings}</TableCell>
                  <TableCell>${channel.revenue.toLocaleString()}</TableCell>
                  <TableCell>${channel.commission.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {channel.syncStatus === "success" && (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      )}
                      {channel.syncStatus === "error" && (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                      {channel.syncStatus === "pending" && (
                        <div className="h-4 w-4 rounded-full border-2 border-info border-t-transparent animate-spin" />
                      )}
                      <span className="text-sm capitalize">{channel.syncStatus}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

