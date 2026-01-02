import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DifferenceHighlighterProps {
  value: string | number | boolean | null;
  fieldKey: string;
  hasDifference: boolean;
  className?: string;
  showIcon?: boolean;
}

export function DifferenceHighlighter({
  value,
  fieldKey,
  hasDifference,
  className,
  showIcon = true,
}: DifferenceHighlighterProps) {
  const displayValue = value === null || value === undefined ? '—' : String(value);

  if (!hasDifference) {
    return (
      <span className={cn("text-muted-foreground", className)}>
        {displayValue}
      </span>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "flex items-center gap-2 p-2 rounded-md border-2 transition-colors",
            "border-amber-200 bg-amber-50 text-amber-800",
            className
          )}>
            {showIcon && <AlertTriangle className="h-4 w-4 text-amber-600" />}
            <span className="font-medium">{displayValue}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>This field differs across compared rate plans</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface DifferenceSummaryProps {
  fieldDifferences: Record<string, boolean>;
  totalFields: number;
  className?: string;
}

export function DifferenceSummary({
  fieldDifferences,
  totalFields,
  className,
}: DifferenceSummaryProps) {
  const diffCount = Object.values(fieldDifferences).filter(Boolean).length;
  const diffPercentage = Math.round((diffCount / totalFields) * 100);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge variant={diffCount > 0 ? "default" : "secondary"} className="flex items-center gap-1">
        {diffCount > 0 ? (
          <AlertTriangle className="h-3 w-3" />
        ) : (
          <CheckCircle className="h-3 w-3" />
        )}
        {diffCount} differences ({diffPercentage}%)
      </Badge>
    </div>
  );
}
