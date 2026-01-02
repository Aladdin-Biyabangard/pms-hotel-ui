import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

export function BackButton({
  onClick,
  label = "Back",
  className = ""
}: BackButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className={className}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}

interface ActionButtonsProps {
  onCancel?: () => void;
  onSave?: () => void;
  cancelLabel?: string;
  saveLabel?: string;
  isSaving?: boolean;
  saveDisabled?: boolean;
  className?: string;
}

export function ActionButtons({
  onCancel,
  onSave,
  cancelLabel = "Cancel",
  saveLabel = "Save",
  isSaving = false,
  saveDisabled = false,
  className = "flex justify-end gap-4",
}: ActionButtonsProps) {
  return (
    <div className={className}>
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
        >
          {cancelLabel}
        </Button>
      )}
      {onSave && (
        <Button
          type="button"
          onClick={onSave}
          disabled={isSaving || saveDisabled}
        >
          {isSaving ? "Saving..." : saveLabel}
        </Button>
      )}
    </div>
  );
}
