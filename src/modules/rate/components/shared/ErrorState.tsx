import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  className?: string;
}

export function ErrorState({
  title = "Error",
  message = "Something went wrong. Please try again.",
  className = ""
}: ErrorStateProps) {
  return (
    <div className={`max-w-6xl mx-auto ${className}`}>
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>{title}:</strong> {message}
        </AlertDescription>
      </Alert>
    </div>
  );
}
