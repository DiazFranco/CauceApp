import { useQuery } from "@tanstack/react-query";
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "../lib/api";
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

  if (isLoading) return <p className="text-slate-500">Cargando portfolio…</p>;
  if (isError) return <p className="text-red-600">Error al cargar el portfolio.</p>;
  if (!data) return null;

  const hasAssets = data.assets.length > 0;

  const typeTotals = Object.entries(
    data.assets.reduce<Record<string, number>>((acc, a) => {
      acc[a.type] = (acc[a.type] ?? 0) + a.valueArs;
      return acc;
    }, {})
  )
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  const CHART_COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#64748b"];

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-3">
        <Card
          label="Total ARS"
          value={formatArs(data.totalArs)}
          sub={`Cotización ${data.fxName}: $${data.fxRate.toFixed(2)}`}
        />
        <Card
          label="Total USD"
          value={formatUsd(data.totalUsd)}
          sub="Valuado al dólar de referencia"
        />
        <Card label="Posiciones" value={String(data.assets.length)} sub="activos distintos" />
      </section>

      {!hasAssets && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-slate-600">Todavía no cargaste activos.</p>
          <p className="mt-1 text-sm text-slate-400">
            Empezá agregando tu primera posición desde la sección{" "}
            <span className="font-medium text-slate-600">Activos</span>.
          </p>
        </div>
      )}

      {hasAssets && (
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-2 text-lg font-semibold text-slate-900">
              Distribución por tipo
            </h2>
            {typeTotals.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={typeTotals}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {typeTotals.map((entry, i) => (
                      <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatArs(value)}
                    labelFormatter={(label) => String(label)}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-slate-400">Sin datos de distribución.</p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-2 text-lg font-semibold text-slate-900">
              Evolución del portfolio
            </h2>
            {data.history.length > 1 ? (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={data.history}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => new Date(d).toLocaleDateString("es-AR")}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    tickFormatter={(v) => `$${Math.round(v)}`}
                    tick={{ fontSize: 11 }}
                    width={80}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalArs"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Tooltip
                    formatter={(value: number) => formatArs(value)}
                    labelFormatter={(label) =>
                      new Date(String(label)).toLocaleDateString("es-AR")
                    }
                  />
                </LineChart>
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
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Posiciones</h2>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3">Activo</th>
                  <th className="px-4 py-3 text-right">Cantidad</th>
                  <th className="px-4 py-3 text-right">Costo</th>
                  <th className="px-4 py-3 text-right">Valor ARS</th>
                  <th className="px-4 py-3 text-right">Rendimiento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.assets.map((asset) => (
                  <tr key={asset.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{asset.ticker}</div>
                      <div className="text-xs text-slate-400">
                        {asset.name}
                        {asset.lastUpdated &&
                          ` · actualizado ${new Date(asset.lastUpdated).toLocaleDateString("es-AR")}`}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {asset.quantity}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {formatArs(asset.totalCostArs)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      {formatArs(asset.valueArs)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={
                          asset.returnPercent >= 0 ? "text-green-600" : "text-red-600"
                        }
                      >
                        {formatArs(asset.returnArs)} · {asset.returnPercent.toFixed(2)}%
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

function Card({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
      {sub && <div className="mt-1 text-xs text-slate-400">{sub}</div>}
    </div>
  );
}
