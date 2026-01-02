interface NotFoundStateProps {
  title?: string;
  message?: string;
  className?: string;
}

export function NotFoundState({
  title = "Not Found",
  message = "The requested item could not be found.",
  className = ""
}: NotFoundStateProps) {
  return (
    <div className={`max-w-6xl mx-auto ${className}`}>
      <p className="text-muted-foreground text-center py-8">{message}</p>
    </div>
  );
}
