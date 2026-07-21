"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/utils/cn";

type ModalDefaultProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
  /** Drag edges/corner to change width and height. */
  resizable?: boolean;
  /** Starting width when resizable (px). */
  defaultWidth?: number;
  /** Starting height when resizable (px). */
  defaultHeight?: number;
};

type ResizeEdge = "e" | "s" | "se" | "w" | "n" | "ne" | "sw" | "nw";

export default function ModalDefault({
  open,
  title,
  description,
  children,
  onClose,
  className,
  resizable = false,
  defaultWidth = 960,
  defaultHeight = 720,
}: ModalDefaultProps) {
  const [size, setSize] = useState({
    width: defaultWidth,
    height: defaultHeight,
  });
  const dragRef = useRef<{
    edge: ResizeEdge;
    startX: number;
    startY: number;
    startW: number;
    startH: number;
  } | null>(null);

  useEffect(() => {
    if (open && resizable) {
      setSize({ width: defaultWidth, height: defaultHeight });
    }
  }, [open, resizable, defaultWidth, defaultHeight]);

  useEffect(() => {
    if (!resizable || !open) return;

    function onMove(event: globalThis.PointerEvent) {
      const drag = dragRef.current;
      if (!drag) return;

      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      const maxW = Math.min(window.innerWidth - 32, 1400);
      const maxH = Math.min(window.innerHeight - 32, 960);
      const minW = 420;
      const minH = 360;

      let nextW = drag.startW;
      let nextH = drag.startH;

      if (drag.edge.includes("e")) nextW = drag.startW + dx;
      if (drag.edge.includes("w")) nextW = drag.startW - dx;
      if (drag.edge.includes("s")) nextH = drag.startH + dy;
      if (drag.edge.includes("n")) nextH = drag.startH - dy;

      setSize({
        width: Math.min(maxW, Math.max(minW, nextW)),
        height: Math.min(maxH, Math.max(minH, nextH)),
      });
    }

    function onUp() {
      dragRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [resizable, open]);

  function startResize(edge: ResizeEdge, event: PointerEvent) {
    event.preventDefault();
    event.stopPropagation();
    dragRef.current = {
      edge,
      startX: event.clientX,
      startY: event.clientY,
      startW: size.width,
      startH: size.height,
    };
    document.body.style.userSelect = "none";
    if (edge === "e" || edge === "w") document.body.style.cursor = "ew-resize";
    else if (edge === "n" || edge === "s") document.body.style.cursor = "ns-resize";
    else document.body.style.cursor = "nwse-resize";
  }

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
          "relative z-10 flex w-full flex-col border border-border bg-surface p-6 shadow-2xl",
          !resizable && "max-w-lg",
          className,
        )}
        style={
          resizable
            ? {
                width: size.width,
                height: size.height,
                maxWidth: "calc(100vw - 2rem)",
                maxHeight: "calc(100vh - 2rem)",
              }
            : undefined
        }
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
        >
          <span className="text-lg leading-none" aria-hidden>
            ×
          </span>
        </button>

        <div className="mb-6 shrink-0 pr-10">
          <h2
            id="modal-title"
            className="text-lg font-light tracking-wide text-foreground"
          >
            {title}
          </h2>
          {description ? (
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          ) : null}
          {resizable ? (
            <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-muted">
              Drag edges or corner to resize
            </p>
          ) : null}
        </div>

        <div className={cn(resizable && "min-h-0 flex-1 overflow-y-auto")}>
          {children}
        </div>

        {resizable ? (
          <>
            <ResizeHandle
              className="absolute inset-y-3 right-0 w-1.5 cursor-ew-resize"
              onPointerDown={(event) => startResize("e", event)}
            />
            <ResizeHandle
              className="absolute inset-y-3 left-0 w-1.5 cursor-ew-resize"
              onPointerDown={(event) => startResize("w", event)}
            />
            <ResizeHandle
              className="absolute inset-x-3 bottom-0 h-1.5 cursor-ns-resize"
              onPointerDown={(event) => startResize("s", event)}
            />
            <ResizeHandle
              className="absolute inset-x-3 top-0 h-1.5 cursor-ns-resize"
              onPointerDown={(event) => startResize("n", event)}
            />
            <button
              type="button"
              aria-label="Resize modal"
              title="Drag to resize"
              onPointerDown={(event) => startResize("se", event)}
              className="absolute bottom-0 right-0 z-20 h-5 w-5 cursor-nwse-resize border-b border-r border-border-strong bg-accent-dim"
            />
          </>
        ) : null}
      </div>
    </div>
  );
}

function ResizeHandle({
  className,
  onPointerDown,
}: {
  className: string;
  onPointerDown: (event: PointerEvent) => void;
}) {
  return (
    <div
      role="presentation"
      className={cn("z-20 hover:bg-foreground/10", className)}
      onPointerDown={onPointerDown}
    />
  );
}
