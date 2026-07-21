export type DatePreset = "day" | "week" | "month" | "year" | "custom";

export function getDateRangeForPreset(
  preset: DatePreset | "year",
  custom?: { from: string; to: string },
): { from: string; to: string } {
  if (preset === "custom" && custom) {
    return custom;
  }

  const to = new Date();
  const from = new Date();

  if (preset === "day") {
    // today only
  } else if (preset === "week") {
    from.setDate(from.getDate() - 6);
  } else if (preset === "month") {
    from.setMonth(from.getMonth() - 1);
  } else if (preset === "year") {
    from.setFullYear(from.getFullYear() - 1);
  }

  return {
    from: formatDateInput(from),
    to: formatDateInput(to),
  };
}

export function formatDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}
