"use client";

import "@/components/Analytics/chartSetup";

import { useMemo } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import StatCardDefault from "@/components/UI/StatCardDefault";
import EyeLoadingDefault from "@/components/UI/EyeLoadingDefault";
import {
  ChartPanel,
  barOptions,
  doughnutOptions,
} from "@/components/HrCompanyDashboard/ChartPanel";
import {
  employeeLabel,
  formatTalkTime,
  hrChartColors,
  shortName,
} from "@/components/HrCompanyDashboard/SectionNav";
import { useEmployeesRingCentralTexts } from "@/hooks/useEmployees";
import type { CompanyHrAnalytics, Employee } from "@/lib/types";

type Props = {
  data: CompanyHrAnalytics;
  employees: Employee[];
  from: string;
  to: string;
};

export default function RingCentralSection({
  data,
  employees,
  from,
  to,
}: Props) {
  const labels = employees.map((e) => shortName(e));
  const texts = useEmployeesRingCentralTexts(employees, from, to, true);

  const textById = useMemo(() => {
    const map = new Map(
      texts.byEmployee.map((row) => [row.userId, row] as const),
    );
    return map;
  }, [texts.byEmployee]);

  const stacked = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Outbound",
          data: employees.map((e) => e.metrics?.outbound_calls ?? 0),
          backgroundColor: hrChartColors.outbound,
          stack: "rc",
        },
        {
          label: "Inbound",
          data: employees.map((e) => e.metrics?.inbound_calls ?? 0),
          backgroundColor: hrChartColors.inbound,
          stack: "rc",
        },
        {
          label: "Missed",
          data: employees.map((e) => e.metrics?.missed_calls ?? 0),
          backgroundColor: hrChartColors.missed,
          stack: "rc",
        },
        {
          label: "Voicemail",
          data: employees.map((e) => e.metrics?.voicemail_calls ?? 0),
          backgroundColor: hrChartColors.voicemail,
          stack: "rc",
        },
      ],
    }),
    [employees, labels],
  );

  const minutesSplit = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Outbound min",
          data: employees.map((e) => e.metrics?.outbound_minutes ?? 0),
          backgroundColor: hrChartColors.outbound,
          stack: "minutes",
        },
        {
          label: "Inbound min",
          data: employees.map((e) => e.metrics?.inbound_minutes ?? 0),
          backgroundColor: hrChartColors.inbound,
          stack: "minutes",
        },
      ],
    }),
    [employees, labels],
  );

  const textsByUser = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Sent",
          data: employees.map(
            (e) => textById.get(e.id)?.outbound ?? 0,
          ),
          backgroundColor: hrChartColors.textsSent,
          stack: "texts",
        },
        {
          label: "Received",
          data: employees.map(
            (e) => textById.get(e.id)?.inbound ?? 0,
          ),
          backgroundColor: hrChartColors.textsReceived,
          stack: "texts",
        },
      ],
    }),
    [employees, labels, textById],
  );

  const directionMix = useMemo(() => {
    const outbound =
      data.outbound_calls ??
      employees.reduce((sum, e) => sum + (e.metrics?.outbound_calls ?? 0), 0);
    const inbound =
      data.inbound_calls ??
      employees.reduce((sum, e) => sum + (e.metrics?.inbound_calls ?? 0), 0);
    const missed =
      data.missed_calls ??
      employees.reduce((sum, e) => sum + (e.metrics?.missed_calls ?? 0), 0);
    const voicemail =
      data.voicemail_calls ??
      employees.reduce((sum, e) => sum + (e.metrics?.voicemail_calls ?? 0), 0);
    return {
      labels: ["Outbound", "Inbound", "Missed", "Voicemail"],
      datasets: [
        {
          data: [outbound, inbound, missed, voicemail],
          backgroundColor: [
            hrChartColors.outbound,
            hrChartColors.inbound,
            hrChartColors.missed,
            hrChartColors.voicemail,
          ],
          borderWidth: 0,
        },
      ],
    };
  }, [data, employees]);

  const textTotals = useMemo(() => {
    if (
      (data.messages_total ?? 0) > 0 ||
      (data.messages_inbound ?? 0) > 0 ||
      (data.messages_outbound ?? 0) > 0
    ) {
      return {
        total: data.messages_total ?? 0,
        inbound: data.messages_inbound ?? 0,
        outbound: data.messages_outbound ?? 0,
        conversations: data.conversations_count ?? 0,
      };
    }

    return texts.byEmployee.reduce(
      (acc, row) => ({
        total: acc.total + row.total_messages,
        inbound: acc.inbound + row.inbound,
        outbound: acc.outbound + row.outbound,
        conversations: acc.conversations + row.conversations_count,
      }),
      { total: 0, inbound: 0, outbound: 0, conversations: 0 },
    );
  }, [data, texts.byEmployee]);

  const textMix = useMemo(
    () => ({
      labels: ["Sent", "Received"],
      datasets: [
        {
          data: [textTotals.outbound, textTotals.inbound],
          backgroundColor: [
            hrChartColors.textsSent,
            hrChartColors.textsReceived,
          ],
          borderWidth: 0,
        },
      ],
    }),
    [textTotals],
  );

  const outbound =
    data.outbound_calls ??
    employees.reduce((sum, e) => sum + (e.metrics?.outbound_calls ?? 0), 0);
  const missed =
    data.missed_calls ??
    employees.reduce((sum, e) => sum + (e.metrics?.missed_calls ?? 0), 0);

  const rankedTexts = useMemo(() => {
    return [...employees]
      .map((employee) => {
        const stats = textById.get(employee.id);
        return {
          employee,
          total: stats?.total_messages ?? 0,
          outbound: stats?.outbound ?? 0,
          inbound: stats?.inbound ?? 0,
          conversations: stats?.conversations_count ?? 0,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [employees, textById]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCardDefault
          id="rc-users"
          label="Users"
          value={String(data.employee_count ?? employees.length)}
        />
        <StatCardDefault
          id="rc-calls"
          label="Total calls"
          value={String(data.calls_made ?? 0)}
          change="RingCentral"
        />
        <StatCardDefault
          id="rc-talk"
          label="Talk time"
          value={formatTalkTime(data.minutes_on_call ?? 0)}
        />
        <StatCardDefault
          id="rc-out"
          label="Outbound"
          value={String(outbound)}
        />
        <StatCardDefault id="rc-missed" label="Missed" value={String(missed)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCardDefault
          id="rc-texts"
          label="Total texts"
          value={String(textTotals.total)}
          change="SMS"
        />
        <StatCardDefault
          id="rc-texts-sent"
          label="Texts sent"
          value={String(textTotals.outbound)}
        />
        <StatCardDefault
          id="rc-texts-recv"
          label="Texts received"
          value={String(textTotals.inbound)}
        />
        <StatCardDefault
          id="rc-convos"
          label="Conversations"
          value={String(textTotals.conversations)}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartPanel
          title="Calls by user"
          description="Outbound / inbound / missed / voicemail"
        >
          <Bar data={stacked} options={barOptions(true)} />
        </ChartPanel>
        <ChartPanel
          title="Company direction mix"
          description="All users combined"
        >
          <Doughnut data={directionMix} options={doughnutOptions()} />
        </ChartPanel>
        <ChartPanel
          title="Minutes by user"
          description="Outbound vs inbound talk time"
          className="xl:col-span-2"
        >
          <Bar data={minutesSplit} options={barOptions(true)} />
        </ChartPanel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartPanel
          title="Texts by user"
          description="Sent vs received SMS per person"
        >
          {texts.isLoading ? (
            <EyeLoadingDefault size="sm" label="Loading texts" />
          ) : (
            <Bar data={textsByUser} options={barOptions(true)} />
          )}
        </ChartPanel>
        <ChartPanel
          title="Text direction mix"
          description="Company SMS sent vs received"
        >
          {texts.isLoading ? (
            <EyeLoadingDefault size="sm" label="Loading texts" />
          ) : (
            <Doughnut data={textMix} options={doughnutOptions()} />
          )}
        </ChartPanel>
      </div>

      <section className="border border-border bg-surface p-5">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-sm font-medium tracking-wide text-foreground">
              Texts by person
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {from} → {to}
              {texts.isError
                ? " · some SMS summaries failed to load"
                : texts.source === "conversations"
                  ? " · from RingCentral SMS sync"
                  : " · from HR metrics"}
            </p>
          </div>
        </div>

        {texts.isLoading ? (
          <EyeLoadingDefault size="sm" label="Loading text counts" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase tracking-[0.18em] text-muted">
                  <th className="pb-3 pr-4 font-medium">Person</th>
                  <th className="pb-3 pr-4 font-medium">Total</th>
                  <th className="pb-3 pr-4 font-medium">Sent</th>
                  <th className="pb-3 pr-4 font-medium">Received</th>
                  <th className="pb-3 font-medium">Conversations</th>
                </tr>
              </thead>
              <tbody>
                {rankedTexts.map((row) => (
                  <tr
                    key={row.employee.id}
                    className="border-b border-border/60 text-muted-foreground last:border-0"
                  >
                    <td className="py-3 pr-4 text-foreground">
                      {employeeLabel(row.employee)}
                    </td>
                    <td className="py-3 pr-4 font-mono text-foreground">
                      {row.total}
                    </td>
                    <td className="py-3 pr-4 font-mono">{row.outbound}</td>
                    <td className="py-3 pr-4 font-mono">{row.inbound}</td>
                    <td className="py-3 font-mono">{row.conversations}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
