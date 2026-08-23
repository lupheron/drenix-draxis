"use client";

import { useEffect, useState } from "react";
import type { AttendanceTimezone } from "@/utils/attendance-display";

const STORAGE_KEY = "draxis-attendance-timezone";

export function useAttendanceTimezone(defaultTz: AttendanceTimezone = "Asia/Tashkent") {
  const [timezone, setTimezone] = useState<AttendanceTimezone>(defaultTz);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "Asia/Tashkent" || stored === "America/Chicago") {
      setTimezone(stored);
    }
  }, []);

  function updateTimezone(next: AttendanceTimezone) {
    setTimezone(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  return { timezone, setTimezone: updateTimezone };
}
