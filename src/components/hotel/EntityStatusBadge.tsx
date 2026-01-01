import {cn} from "@/lib/utils";
import {Badge} from "@/components/ui/badge";
import {EntityStatus} from "@/types/enums";

interface EntityStatusBadgeProps {
  status: EntityStatus | string;
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  ACTIVE: {
    label: "Active",
    className: "bg-success/10 text-success border-success/20 hover:bg-success/20",
  },
  INACTIVE: {
    label: "Inactive",
    className: "bg-muted/10 text-muted-foreground border-muted/20 hover:bg-muted/20",
  },
  PENDING: {
    label: "Pending",
    className: "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20",
  },
  DELETED: {
    label: "Deleted",
    className: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20",
  },
  CREATED: {
    label: "Created",
    className: "bg-info/10 text-info border-info/20 hover:bg-info/20",
  },
  PUBLISHED: {
    label: "Published",
    className: "bg-success/10 text-success border-success/20 hover:bg-success/20",
  },
  DRAFT: {
    label: "Draft",
    className: "bg-muted/10 text-muted-foreground border-muted/20 hover:bg-muted/20",
  },
};

export const EntityStatusBadge = ({ status, className }: EntityStatusBadgeProps) => {
  const config = statusConfig[status] || statusConfig.ACTIVE;

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

