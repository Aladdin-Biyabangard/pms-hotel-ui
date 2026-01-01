import {useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {ChevronLeft, ChevronRight, Plus} from "lucide-react";
import {cn} from "@/lib/utils";
import {
    addMonths,
    eachDayOfInterval,
    endOfMonth,
    format,
    isSameDay,
    isSameMonth,
    startOfMonth,
    subMonths
} from "date-fns";

interface CalendarEvent {
  id: number;
  date: Date;
  type: "check-in" | "check-out" | "maintenance";
  title: string;
  room?: string;
  guest?: string;
  status?: string;
}

interface CalendarViewProps {
  events?: CalendarEvent[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onCreateReservation?: () => void;
}

export function CalendarView({
  events = [],
  onDateClick,
  onEventClick,
  onCreateReservation,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get first day of week for the month
  const firstDayOfWeek = monthStart.getDay();
  const daysBeforeMonth = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
  };

  const previousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  return (
    <Card className="border-border/50 shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-lg">
              {format(currentDate, "MMMM yyyy")}
            </CardTitle>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={onCreateReservation} className="gap-2">
            <Plus className="h-4 w-4" />
            New Reservation
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-muted-foreground p-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells before month start */}
          {daysBeforeMonth.map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}

          {/* Days of month */}
          {daysInMonth.map((day) => {
            const dayEvents = getEventsForDate(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentDate);

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "aspect-square border border-border/50 rounded-lg p-1 cursor-pointer transition-colors",
                  isToday && "ring-2 ring-primary",
                  !isCurrentMonth && "opacity-50",
                  "hover:bg-secondary"
                )}
                onClick={() => onDateClick?.(day)}
              >
                <div className={cn(
                  "text-sm font-medium mb-1",
                  isToday && "text-primary"
                )}>
                  {format(day, "d")}
                </div>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                      className={cn(
                        "text-xs px-1 py-0.5 rounded truncate cursor-pointer",
                        event.type === "check-in" && "bg-success/20 text-success",
                        event.type === "check-out" && "bg-warning/20 text-warning",
                        event.type === "maintenance" && "bg-orange/20 text-orange"
                      )}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-success/20" />
            <span className="text-xs text-muted-foreground">Check-in</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-warning/20" />
            <span className="text-xs text-muted-foreground">Check-out</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-info/20" />
            <span className="text-xs text-muted-foreground">Reservation</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

