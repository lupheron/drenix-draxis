import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
};

type DataTableDefaultProps<T> = {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  className?: string;
};

export default function DataTableDefault<T extends { id: string }>({
  columns,
  data,
  emptyMessage = "No records found.",
  className,
}: DataTableDefaultProps<T>) {
  return (
    <div className={cn("overflow-x-auto border border-border", className)}>
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-elevated">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  "px-4 py-3 text-[10px] font-normal uppercase tracking-[0.2em] text-muted",
                  column.className,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-sm text-muted"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border last:border-b-0 hover:bg-accent-dim/30"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn("px-4 py-3 text-muted-foreground", column.className)}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
