import {useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {AlertCircle, CheckCircle2, RefreshCw, XCircle} from "lucide-react";
import {cn} from "@/lib/utils";

interface RoomStatus {
  roomNumber: string;
  status: "clean" | "dirty" | "inspected" | "out-of-order" | "maintenance";
  housekeeper?: string;
  lastUpdated?: string;
  notes?: string;
  priority?: "low" | "medium" | "high";
}

interface HousekeepingBoardProps {
  rooms?: RoomStatus[];
  onStatusChange?: (roomNumber: string, status: RoomStatus["status"]) => void;
  onRefresh?: () => void;
}

const statusConfig = {
  clean: {
    label: "Clean",
    icon: CheckCircle2,
    color: "bg-success text-success-foreground",
    bgColor: "bg-success/10",
  },
  dirty: {
    label: "Dirty",
    icon: XCircle,
    color: "bg-destructive text-destructive-foreground",
    bgColor: "bg-destructive/10",
  },
  inspected: {
    label: "Inspected",
    icon: CheckCircle2,
    color: "bg-info text-info-foreground",
    bgColor: "bg-info/10",
  },
  "out-of-order": {
    label: "OOO",
    icon: AlertCircle,
    color: "bg-warning text-warning-foreground",
    bgColor: "bg-warning/10",
  },
  maintenance: {
    label: "Maintenance",
    icon: AlertCircle,
    color: "bg-muted text-muted-foreground",
    bgColor: "bg-muted/10",
  },
};

export function HousekeepingBoard({
  rooms = [],
  onStatusChange,
  onRefresh,
}: HousekeepingBoardProps) {
  const [filter, setFilter] = useState<"all" | RoomStatus["status"]>("all");

  const filteredRooms = rooms.filter(room => {
    if (filter === "all") return true;
    return room.status === filter;
  });

  const groupedRooms = filteredRooms.reduce((acc, room) => {
    if (!acc[room.status]) {
      acc[room.status] = [];
    }
    acc[room.status].push(room);
    return acc;
  }, {} as Record<RoomStatus["status"], RoomStatus[]>);

  return (
    <Card className="border-border/50 shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Housekeeping Board</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(statusConfig).map(([status, config]) => {
            const statusRooms = groupedRooms[status as RoomStatus["status"]] || [];
            const Icon = config.icon;

            return (
              <div key={status} className="space-y-2">
                <div className={cn(
                  "flex items-center justify-between p-2 rounded-lg",
                  config.bgColor
                )}>
                  <div className="flex items-center gap-2">
                    <Icon className={cn("h-4 w-4", config.color)} />
                    <span className="text-sm font-semibold">{config.label}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {statusRooms.length}
                  </Badge>
                </div>
                <div className="space-y-1 min-h-[200px]">
                  {statusRooms.map((room) => (
                    <div
                      key={room.roomNumber}
                      className={cn(
                        "p-2 border border-border/50 rounded-lg cursor-pointer transition-colors",
                        "hover:bg-secondary hover:border-primary/50"
                      )}
                      onClick={() => onStatusChange?.(room.roomNumber, room.status)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">Room {room.roomNumber}</span>
                        {room.priority && room.priority !== "low" && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              room.priority === "high" && "border-warning text-warning",
                              room.priority === "medium" && "border-info text-info"
                            )}
                          >
                            {room.priority}
                          </Badge>
                        )}
                      </div>
                      {room.housekeeper && (
                        <p className="text-xs text-muted-foreground">
                          {room.housekeeper}
                        </p>
                      )}
                      {room.lastUpdated && (
                        <p className="text-xs text-muted-foreground">
                          {room.lastUpdated}
                        </p>
                      )}
                      {room.notes && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {room.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

