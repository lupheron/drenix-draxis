"use client";

import { useEffect, useId, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { format, parse, isValid } from "date-fns";
import { cn } from "@/utils/cn";
import "react-day-picker/style.css";

type DatePickerDefaultProps = {
  label?: string;
  hint?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  min?: string;
  max?: string;
  className?: string;
  wrapperClassName?: string;
  id?: string;
};

function parseIso(value: string): Date | undefined {
  if (!value) return undefined;
  const parsed = parse(value, "yyyy-MM-dd", new Date());
  return isValid(parsed) ? parsed : undefined;
}

function toIso(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export default function DatePickerDefault({
  label,
  hint,
  error,
  value,
  onChange,
  placeholder = "Select date",
  required,
  disabled,
  min,
  max,
  className,
  wrapperClassName,
  id,
}: DatePickerDefaultProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const selected = parseIso(value);
  const minDate = parseIso(min ?? "");
  const maxDate = parseIso(max ?? "");

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={cn("relative flex flex-col gap-2", wrapperClassName)}
    >
      {label ? (
        <label
          htmlFor={inputId}
          className="text-xs uppercase tracking-[0.2em] text-muted-foreground"
        >
          {label}
          {required ? <span className="text-danger"> *</span> : null}
        </label>
      ) : null}

      <button
        id={inputId}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex h-10 w-full items-center justify-between border border-border bg-surface px-3 text-left text-sm outline-none transition-colors",
          "hover:border-border-strong focus:border-border-strong focus:bg-surface-elevated",
          error ? "border-danger/50" : undefined,
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          className,
        )}
      >
        <span className={selected ? "text-foreground" : "text-muted"}>
          {selected ? format(selected, "MMM d, yyyy") : placeholder}
        </span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted">
          Date
        </span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label={label ?? "Choose date"}
          className="absolute left-0 top-[calc(100%+6px)] z-50 border border-border bg-surface-elevated p-3 shadow-none"
        >
          <DayPicker
            mode="single"
            selected={selected}
            defaultMonth={selected}
            disabled={(date) => {
              if (minDate && date < minDate) return true;
              if (maxDate && date > maxDate) return true;
              return false;
            }}
            onSelect={(date) => {
              if (!date) {
                onChange("");
                return;
              }
              onChange(toIso(date));
              setOpen(false);
            }}
            className="draxis-day-picker"
          />
          <div className="mt-2 flex justify-between gap-2 border-t border-border pt-2">
            <button
              type="button"
              className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
              onClick={() => {
                onChange(toIso(new Date()));
                setOpen(false);
              }}
            >
              Today
            </button>
            <button
              type="button"
              className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
