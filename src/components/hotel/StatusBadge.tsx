import {cn} from "@/lib/utils";
import {Badge} from "@/components/ui/badge";

type RoomStatus = "available" | "occupied" | "cleaning" | "maintenance" | "reserved";

interface StatusBadgeProps {
  status: RoomStatus;
  className?: string;
}

const statusConfig: Record<RoomStatus, { label: string; className: string }> = {
  available: {
    label: "Available",
    className: "bg-success/10 text-success border-success/20 hover:bg-success/20",
  },
  occupied: {
    label: "Occupied",
    className: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
  },
  cleaning: {
    label: "Cleaning",
    className: "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20",
  },
  maintenance: {
    label: "Maintenance",
    className: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20",
  },
  reserved: {
    label: "Reserved",
    className: "bg-info/10 text-info border-info/20 hover:bg-info/20",
  },
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium text-xs px-2.5 py-0.5 rounded-full transition-colors",
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  );
};

export type { RoomStatus };
