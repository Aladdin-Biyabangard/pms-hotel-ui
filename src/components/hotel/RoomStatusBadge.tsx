import {cn} from "@/lib/utils";
import {Badge} from "@/components/ui/badge";
import {RoomStatus} from "@/types/enums";

interface RoomStatusBadgeProps {
  status: RoomStatus | string;
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  AVAILABLE: {
    label: "Available",
    className: "bg-success/10 text-success border-success/20 hover:bg-success/20",
  },
  OCCUPIED: {
    label: "Occupied",
    className: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
  },
  OUT_OF_SERVICE: {
    label: "Out of Service",
    className: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20",
  },
};

export const RoomStatusBadge = ({ status, className }: RoomStatusBadgeProps) => {
  const config = statusConfig[status] || statusConfig.AVAILABLE;

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

