export type DatePreset = "day" | "week" | "month" | "year" | "custom";

/** Local calendar date as YYYY-MM-DD (no UTC shift). */
export function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Presets are calendar-based, not rolling windows:
 * - day: today
 * - week: Monday of this week → today
 * - month: 1st of this month → today
 * - year: Jan 1 of this year → today
 */
export function getDateRangeForPreset(
  preset: DatePreset | "year",
  custom?: { from: string; to: string },
): { from: string; to: string } {
  if (preset === "custom" && custom) {
    return custom;
  }

  const to = new Date();
  to.setHours(12, 0, 0, 0);
  const from = new Date(to);

  if (preset === "day") {
    // today only
  } else if (preset === "week") {
    const day = from.getDay(); // 0 Sun … 6 Sat
    const daysFromMonday = day === 0 ? 6 : day - 1;
    from.setDate(from.getDate() - daysFromMonday);
  } else if (preset === "month") {
    from.setDate(1);
  } else if (preset === "year") {
    from.setMonth(0, 1);
  }

  return {
    from: formatDateInput(from),
    to: formatDateInput(to),
  };
}
