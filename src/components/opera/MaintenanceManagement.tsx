import {useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Calendar, Plus, Wrench} from "lucide-react";
import {format} from "date-fns";

interface MaintenanceRequest {
  id: number;
  roomNumber: string;
  category: "plumbing" | "electrical" | "hvac" | "furniture" | "appliance" | "other";
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in-progress" | "completed" | "cancelled";
  reportedBy: string;
  assignedTo?: string;
  reportedDate: Date;
  completedDate?: Date;
  estimatedCost?: number;
  actualCost?: number;
}

export function MaintenanceManagement() {
  const [filter, setFilter] = useState<"all" | MaintenanceRequest["status"]>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const requests: MaintenanceRequest[] = [
    {
      id: 1,
      roomNumber: "205",
      category: "hvac",
      description: "AC not working properly",
      priority: "high",
      status: "in-progress",
      reportedBy: "Housekeeping",
      assignedTo: "Maintenance Team A",
      reportedDate: new Date(),
      estimatedCost: 150,
    },
    {
      id: 2,
      roomNumber: "301",
      category: "plumbing",
      description: "Leaking faucet in bathroom",
      priority: "medium",
      status: "pending",
      reportedBy: "Guest",
      reportedDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
      estimatedCost: 75,
    },
    {
      id: 3,
      roomNumber: "102",
      category: "electrical",
      description: "Light fixture needs replacement",
      priority: "low",
      status: "completed",
      reportedBy: "Housekeeping",
      assignedTo: "Maintenance Team B",
      reportedDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      completedDate: new Date(),
      estimatedCost: 50,
      actualCost: 45,
    },
  ];

  const filteredRequests = requests.filter((req) => {
    if (filter !== "all" && req.status !== filter) return false;
    if (priorityFilter !== "all" && req.priority !== priorityFilter) return false;
    return true;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === "pending").length,
    inProgress: requests.filter(r => r.status === "in-progress").length,
    completed: requests.filter(r => r.status === "completed").length,
    urgent: requests.filter(r => r.priority === "urgent").length,
  };

  const getPriorityColor = (priority: MaintenanceRequest["priority"]) => {
    switch (priority) {
      case "urgent":
        return "bg-destructive text-destructive-foreground";
      case "high":
        return "bg-warning text-warning-foreground";
      case "medium":
        return "bg-info text-info-foreground";
      case "low":
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="border-border/50 shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Maintenance Management</CardTitle>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Request
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground mb-1">Total</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground mb-1">Pending</div>
              <div className="text-2xl font-bold text-warning">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground mb-1">In Progress</div>
              <div className="text-2xl font-bold text-info">{stats.inProgress}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground mb-1">Completed</div>
              <div className="text-2xl font-bold text-success">{stats.completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground mb-1">Urgent</div>
              <div className="text-2xl font-bold text-destructive">{stats.urgent}</div>
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
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Requests Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reported By</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    No maintenance requests found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.roomNumber}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{request.category}</Badge>
                    </TableCell>
                    <TableCell>{request.description}</TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(request.priority)}>
                        {request.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          request.status === "completed"
                            ? "default"
                            : request.status === "in-progress"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{request.reportedBy}</TableCell>
                    <TableCell>{request.assignedTo || "—"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {format(request.reportedDate, "MMM dd, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      {request.actualCost ? (
                        <div>
                          <div className="font-medium">${request.actualCost}</div>
                          {request.estimatedCost && request.estimatedCost !== request.actualCost && (
                            <div className="text-xs text-muted-foreground">
                              Est: ${request.estimatedCost}
                            </div>
                          )}
                        </div>
                      ) : request.estimatedCost ? (
                        <span className="text-muted-foreground">Est: ${request.estimatedCost}</span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Wrench className="h-4 w-4" />
                      </Button>
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

