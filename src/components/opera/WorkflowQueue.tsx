import {useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {CheckCircle2, Circle, Clock, Filter} from "lucide-react";
import {cn} from "@/lib/utils";

interface Task {
  id: number;
  type: "check-in" | "check-out" | "housekeeping" | "maintenance" | "payment";
  title: string;
  description?: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in-progress" | "completed";
  assignedTo?: string;
  dueTime?: string;
  room?: string;
  guest?: string;
}

interface WorkflowQueueProps {
  tasks?: Task[];
  onTaskClick?: (task: Task) => void;
  onTaskComplete?: (taskId: number) => void;
}

export function WorkflowQueue({
  tasks = [],
  onTaskClick,
  onTaskComplete,
}: WorkflowQueueProps) {
  const [filter, setFilter] = useState<"all" | "pending" | "in-progress" | "completed">("all");

  const filteredTasks = tasks.filter(task => {
    if (filter === "all") return true;
    return task.status === filter;
  });

  const getPriorityColor = (priority: Task["priority"]) => {
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

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-info" />;
      case "pending":
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="border-border/50 shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Workflow Queue</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({tasks.length})</TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({tasks.filter(t => t.status === "pending").length})
            </TabsTrigger>
            <TabsTrigger value="in-progress">
              In Progress ({tasks.filter(t => t.status === "in-progress").length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({tasks.filter(t => t.status === "completed").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-4">
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No tasks found
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick?.(task)}
                    className={cn(
                      "p-3 rounded-lg border border-border/50 cursor-pointer transition-colors",
                      "hover:bg-secondary hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(task.status)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{task.title}</span>
                            <Badge
                              variant="outline"
                              className={cn("text-xs", getPriorityColor(task.priority))}
                            >
                              {task.priority}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="text-xs text-muted-foreground mb-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {task.room && (
                              <span>Room: {task.room}</span>
                            )}
                            {task.guest && (
                              <span>Guest: {task.guest}</span>
                            )}
                            {task.assignedTo && (
                              <span>Assigned: {task.assignedTo}</span>
                            )}
                            {task.dueTime && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {task.dueTime}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {task.status !== "completed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTaskComplete?.(task.id);
                          }}
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

