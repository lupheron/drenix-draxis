type EmptyStateDefaultProps = {
  message?: string;
};

export default function EmptyStateDefault({
  message = "No data yet. Connect your API to load records.",
}: EmptyStateDefaultProps) {
  return (
    <div className="flex min-h-32 items-center justify-center border border-dashed border-border bg-background/40 px-6 py-10">
      <p className="text-center text-sm text-muted">{message}</p>
    </div>
  );
}
