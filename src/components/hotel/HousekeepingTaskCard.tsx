import {cn} from "@/lib/utils";
import {Card, CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {BedDouble, Clock, User} from "lucide-react";

type TaskStatus = "pending" | "in-progress" | "completed";
type TaskPriority = "low" | "medium" | "high";

interface HousekeepingTaskCardProps {
  roomNumber: string;
  roomType: string;
  floor: number;
  taskType: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string;
  estimatedTime?: number; // in minutes
  onClick?: () => void;
  className?: string;
}

const statusColors: Record<TaskStatus, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  "in-progress": "bg-info/10 text-info border-info/20",
  completed: "bg-success/10 text-success border-success/20",
};

const priorityColors: Record<TaskPriority, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-warning/10 text-warning",
  high: "bg-destructive/10 text-destructive",
};

export const HousekeepingTaskCard = ({
  roomNumber,
  roomType,
  floor,
  taskType,
  status,
  priority,
  assignedTo,
  estimatedTime,
  onClick,
  className,
}: HousekeepingTaskCardProps) => {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-elevated group",
        "border-border/50 hover:border-accent/50",
        status === "completed" && "opacity-60",
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <BedDouble className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                Room {roomNumber}
              </h3>
              <p className="text-sm text-muted-foreground">
                {roomType} • Floor {floor}
              </p>
            </div>
          </div>
          <Badge variant="outline" className={cn("text-xs", statusColors[status])}>
            {status.replace("-", " ")}
          </Badge>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium text-foreground">{taskType}</span>
          <Badge variant="secondary" className={cn("text-xs", priorityColors[priority])}>
            {priority}
          </Badge>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          {assignedTo ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {assignedTo.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">{assignedTo}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Unassigned</span>
            </div>
          )}

          {estimatedTime && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{estimatedTime} min</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
