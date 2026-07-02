import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type ModalDefaultProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
};

export default function ModalDefault({
  open,
  title,
  description,
  children,
  onClose,
  className,
}: ModalDefaultProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-label="Close modal"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          "relative z-10 w-full max-w-lg border border-border bg-surface p-6 shadow-2xl",
          className,
        )}
      >
        <div className="mb-6">
          <h2
            id="modal-title"
            className="text-lg font-light tracking-wide text-foreground"
          >
            {title}
          </h2>
          {description ? (
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}
