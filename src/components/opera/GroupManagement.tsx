import {useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Badge} from "@/components/ui/badge";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Calendar, Edit, Plus, Trash2, Users} from "lucide-react";
import {format} from "date-fns";

interface Group {
  id: number;
  name: string;
  type: "corporate" | "travel" | "event" | "convention";
  contactPerson: string;
  email: string;
  phone: string;
  checkIn: Date;
  checkOut: Date;
  rooms: number;
  guests: number;
  status: "pending" | "confirmed" | "checked-in" | "checked-out" | "cancelled";
  totalAmount: number;
  deposit: number;
  balance: number;
  specialRequests?: string;
  blockCode?: string;
}

interface GroupManagementProps {
  groups?: Group[];
  onCreate?: () => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export function GroupManagement({
  groups = [],
  onCreate,
  onEdit,
  onDelete,
}: GroupManagementProps) {
  const [filter, setFilter] = useState<"all" | Group["status"]>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredGroups = groups.filter((group) => {
    if (filter !== "all" && group.status !== filter) return false;
    if (typeFilter !== "all" && group.type !== typeFilter) return false;
    return true;
  });

  const defaultGroups: Group[] = [
    {
      id: 1,
      name: "Tech Conference 2024",
      type: "convention",
      contactPerson: "John Smith",
      email: "john@techconf.com",
      phone: "+1-555-0100",
      checkIn: new Date(),
      checkOut: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      rooms: 50,
      guests: 100,
      status: "confirmed",
      totalAmount: 75000,
      deposit: 15000,
      balance: 60000,
      blockCode: "TC2024",
    },
  ];

  const displayGroups = groups.length > 0 ? filteredGroups : defaultGroups;

  const stats = {
    total: displayGroups.length,
    confirmed: displayGroups.filter(g => g.status === "confirmed").length,
    checkedIn: displayGroups.filter(g => g.status === "checked-in").length,
    totalRevenue: displayGroups.reduce((sum, g) => sum + g.totalAmount, 0),
    totalRooms: displayGroups.reduce((sum, g) => sum + g.rooms, 0),
  };

  return (
    <Card className="border-border/50 shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Group Management</CardTitle>
          <Button onClick={onCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            New Group
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground mb-1">Total Groups</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground mb-1">Confirmed</div>
              <div className="text-2xl font-bold text-info">{stats.confirmed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground mb-1">Checked In</div>
              <div className="text-2xl font-bold text-success">{stats.checkedIn}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground mb-1">Total Rooms</div>
              <div className="text-2xl font-bold">{stats.totalRooms}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground mb-1">Revenue</div>
              <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="checked-in">Checked In</SelectItem>
              <SelectItem value="checked-out">Checked Out</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="corporate">Corporate</SelectItem>
              <SelectItem value="travel">Travel</SelectItem>
              <SelectItem value="event">Event</SelectItem>
              <SelectItem value="convention">Convention</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Groups Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Rooms/Guests</TableHead>
                <TableHead>Block Code</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayGroups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No groups found
                  </TableCell>
                </TableRow>
              ) : (
                displayGroups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">{group.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{group.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{group.contactPerson}</div>
                        <div className="text-xs text-muted-foreground">{group.email}</div>
                        <div className="text-xs text-muted-foreground">{group.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {format(group.checkIn, "MMM dd")} - {format(group.checkOut, "MMM dd")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {group.rooms} rooms / {group.guests} guests
                      </div>
                    </TableCell>
                    <TableCell>
                      {group.blockCode && (
                        <Badge variant="secondary">{group.blockCode}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">${group.totalAmount.toLocaleString()}</div>
                        {group.deposit > 0 && (
                          <div className="text-xs text-muted-foreground">
                            Deposit: ${group.deposit.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          group.status === "confirmed" || group.status === "checked-in"
                            ? "default"
                            : group.status === "cancelled"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {group.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => onEdit?.(group.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete?.(group.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

