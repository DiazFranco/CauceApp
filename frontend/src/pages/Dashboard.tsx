import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "../lib/api";
import { ASSET_TYPE_LABELS } from "../components/Layout";
import { formatArs, formatUsd } from "../lib/format";
import type { Asset, PortfolioSnapshot, Transaction } from "../types";

interface DashboardData {
  totalArs: number;
  totalUsd: number;
  fxRate: number;
  fxName: string;
  assets: (Asset & {
    quantity: number;
    totalCostArs: number;
    valueArs: number;
    valueUsd: number;
    returnArs: number;
    returnPercent: number;
    lastPrice: number | null;
    lastUpdated?: string;
  })[];
  history: PortfolioSnapshot[];
  transactions: Transaction[];
}

export default function Dashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get<DashboardData>("/api/dashboard"),
  });

  const [returnMode, setReturnMode] = useState<"percent" | "value">(() => {
    const stored = localStorage.getItem("cauce-rendimiento");
    return stored === "value" || stored === "percent" ? stored : "percent";
  });

  const changeReturnMode = (mode: "percent" | "value") => {
    setReturnMode(mode);
    localStorage.setItem("cauce-rendimiento", mode);
  };

  if (isLoading) return <p className="text-slate-500">Cargando portfolio…</p>;
  if (isError) return <p className="text-cauce-coral">Error al cargar el portfolio.</p>;
  if (!data) return null;

  const hasAssets = data.assets.length > 0;

  const unvaluedCount = data.assets.filter((a) => a.valueArs === 0).length;

  const typeTotals = Object.entries(
    data.assets.reduce<Record<string, number>>((acc, a) => {
      acc[a.type] = (acc[a.type] ?? 0) + a.valueArs;
      return acc;
    }, {})
  )
    .filter(([, v]) => v > 0)
    .map(([type, value]) => ({
      name: ASSET_TYPE_LABELS[type] ?? type,
      value,
    }))
    .sort((a, b) => b.value - a.value);

  const CHART_COLORS = ["#00B4D8", "#10B981", "#0ea5e9", "#8b5cf6", "#f59e0b", "#F43F5E", "#64748b"];

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-3">
        <Card
          label="Caudal Total ARS"
          value={formatArs(data.totalArs)}
          sub={`Cotización ${data.fxName}: $${data.fxRate.toFixed(2)}`}
          accent="bg-cauce-cian"
        />
        <Card
          label="Caudal Total USD"
          value={formatUsd(data.totalUsd)}
          sub="Valuado al dólar de referencia"
          accent="bg-sky-500"
        />
        <Card
          label="Posiciones"
          value={String(data.assets.length)}
          sub="activos distintos"
          accent="bg-violet-500"
        />
      </section>

      {!hasAssets && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-slate-600 dark:text-slate-300">Todavía no cargaste activos.</p>
          <p className="mt-1 text-sm text-slate-400 dark:text-slate-400">
            Empezá agregando tu primera posición desde la sección{" "}
            <span className="font-medium text-slate-600 dark:text-slate-300">Activos</span>.
          </p>
        </div>
      )}

      {hasAssets && (
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
            <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              Distribución por tipo
            </h2>
            {typeTotals.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={typeTotals}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={2}
                      label={(e: { name: string; percent: number }) =>
                        `${e.name} ${(e.percent * 100).toFixed(0)}%`
                      }
                    >
                      {typeTotals.map((entry, i) => (
                        <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip
                      formatter={(value: number) => formatArs(value)}
                      labelFormatter={(label) => String(label)}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {unvaluedCount > 0 && (
                  <p className="mt-2 text-xs text-slate-400">
                    {unvaluedCount} activo{unvaluedCount > 1 ? "s" : ""} sin valor no se muestran
                    (falta precio o transacción).
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-400">Sin datos de distribución.</p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
            <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              Evolución del portfolio (ARS)
            </h2>
            {data.history.length > 1 ? (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={data.history}>
                  <defs>
                    <linearGradient id="cauceFlujo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00B4D8" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#00B4D8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => new Date(d).toLocaleDateString("es-AR")}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                  />
                  <YAxis
                    tickFormatter={(v) =>
                      `$${Math.round(Number(v)).toLocaleString("es-AR")}`
                    }
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    width={95}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalArs"
                    stroke="#00B4D8"
                    strokeWidth={2}
                    fill="url(#cauceFlujo)"
                    dot={false}
                  />
                  <Tooltip
                    formatter={(value: number) => formatArs(value)}
                    labelFormatter={(label) =>
                      new Date(String(label)).toLocaleDateString("es-AR")
                    }
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-slate-400">
                Todavía no hay historial suficiente para graficar.
              </p>
            )}
          </div>
        </section>
      )}

      {hasAssets && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">Posiciones</h2>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Activo</th>
                  <th className="px-4 py-3 text-right">Cantidad</th>
                  <th className="px-4 py-3 text-right">Costo</th>
                  <th className="px-4 py-3 text-right">Valor ARS</th>
                  <th className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className="mr-1 text-slate-500 dark:text-slate-400">Rendimiento</span>
                      <button
                        onClick={() => changeReturnMode("percent")}
                        aria-label="Ver rendimiento en porcentaje"
                        className={`rounded-md px-2 py-1 text-xs font-semibold ${
                          returnMode === "percent"
                            ? "bg-cauce-cian text-cauce-azul"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                        }`}
                      >
                        %
                      </button>
                      <button
                        onClick={() => changeReturnMode("value")}
                        aria-label="Ver rendimiento en valor"
                        className={`rounded-md px-2 py-1 text-xs font-semibold ${
                          returnMode === "value"
                            ? "bg-cauce-cian text-cauce-azul"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                        }`}
                      >
                        $
                      </button>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {data.assets.map((asset) => (
                  <tr key={asset.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 dark:text-slate-100">{asset.ticker}</div>
                      <div className="text-xs text-slate-400">
                        {asset.name}
                        {asset.lastUpdated &&
                          ` · actualizado ${new Date(asset.lastUpdated).toLocaleDateString("es-AR")}`}
                      </div>
                      {asset.lastPrice === null && asset.valueArs > 0 && (
                        <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                          <Dot /> sin precio · valuado al costo
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                      {asset.quantity}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                      {formatArs(asset.totalCostArs)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-slate-100">
                      {formatArs(asset.valueArs)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                          asset.returnPercent >= 0
                            ? "bg-cauce-verde/15 text-cauce-verde"
                            : "bg-cauce-coral/15 text-cauce-coral"
                        }`}
                      >
                        {returnMode === "percent"
                          ? `${asset.returnPercent >= 0 ? "+" : ""}${asset.returnPercent.toFixed(2)}%`
                          : `${asset.returnArs >= 0 ? "+" : ""}${formatArs(asset.returnArs)}`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function Card({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
        <span className={`inline-block h-2 w-2 rounded-full ${accent}`} />
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</div>
      {sub && <div className="mt-1 text-xs text-slate-400">{sub}</div>}
    </div>
  );
}

function Dot() {
  return <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />;
}
