import { cn } from "@/utils/cn";

type StaffRowActionsDefaultProps = {
  onEdit: () => void;
  onWriteCharge?: () => void;
  onDelete: () => void;
  hideCharges?: boolean;
};

type ActionConfig = {
  key: string;
  label: string;
  emoji: string;
  onClick: () => void;
  className: string;
};

export default function StaffRowActionsDefault({
  onEdit,
  onWriteCharge,
  onDelete,
  hideCharges = true,
}: StaffRowActionsDefaultProps) {
  const actions: ActionConfig[] = [
    {
      key: "edit",
      label: "Edit",
      emoji: "✏️",
      onClick: onEdit,
      className:
        "border-warning/35 bg-warning/15 text-warning hover:border-warning/50 hover:bg-warning/25",
    },
    ...(hideCharges || !onWriteCharge
      ? []
      : [
          {
            key: "charges",
            label: "Charges",
            emoji: "💰",
            onClick: onWriteCharge,
            className:
              "border-amber-500/30 bg-amber-500/10 text-amber-300 hover:border-amber-400/50 hover:bg-amber-500/20",
          },
        ]),
    {
      key: "delete",
      label: "Delete",
      emoji: "🗑️",
      onClick: onDelete,
      className:
        "border-danger/30 bg-danger/10 text-danger hover:border-danger/50 hover:bg-danger/20",
    },
  ];

  return (
    <div className="flex items-center gap-1.5">
      {actions.map((action) => (
        <button
          key={action.key}
          type="button"
          onClick={action.onClick}
          title={action.label}
          aria-label={action.label}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 border px-2.5 text-xs font-medium transition-colors",
            action.className,
          )}
        >
          <span aria-hidden="true" className="text-sm leading-none">
            {action.emoji}
          </span>
          <span className="hidden sm:inline">{action.label}</span>
        </button>
      ))}
    </div>
  );
}
