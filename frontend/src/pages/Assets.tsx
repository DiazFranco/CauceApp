import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { ASSET_TYPE_LABELS } from "../components/Layout";
import AssetForm from "../components/AssetForm";
import AssetDetail from "../components/AssetDetail";
import type { Asset } from "../types";

const TYPE_BADGE_CLASSES: Record<string, string> = {
  accion: "bg-cauce-verde/15 text-cauce-verde",
  cedear: "bg-cauce-cian/15 text-cauce-cianOscuro dark:text-cauce-cian",
  cripto: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  fci: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  bono: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  plazo_fijo: "bg-teal-500/15 text-teal-600 dark:text-teal-400",
  otro: "bg-slate-500/15 text-slate-600 dark:text-slate-300",
};

export default function Assets() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Asset | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["assets"],
    queryFn: () => api.get<Asset[]>("/api/assets"),
  });

  if (isLoading) return <p className="text-slate-500 dark:text-slate-400">Cargando activos…</p>;
  if (isError) return <p className="text-cauce-coral">Error al cargar los activos.</p>;

  const assets = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Activos</h1>
        <div className="flex items-center gap-3">
          {isFetching && (
            <span className="flex items-center gap-2 text-sm text-slate-400">
              <Spinner /> Actualizando…
            </span>
          )}
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-cauce-cian px-4 py-2 text-sm font-medium text-cauce-azul hover:bg-cauce-cianOscuro"
          >
            + Nuevo activo
          </button>
        </div>
      </div>

      {assets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-slate-600 dark:text-slate-300">No hay activos cargados todavía.</p>
          <p className="mt-1 text-sm text-slate-400">
            Empezá creando tu primer activo para después cargarle compras y ventas.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {assets.map((asset) => (
            <div key={asset.id} className="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center justify-between px-4 py-3">
                <button
                  onClick={() =>
                    setExpandedId(expandedId === asset.id ? null : asset.id)
                  }
                  className="flex flex-1 items-center justify-between text-left"
                >
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">{asset.ticker}</div>
                    <div className="text-xs text-slate-400">{asset.name}</div>
                  </div>
                  <span className={`ml-4 rounded-full px-3 py-1 text-xs font-medium ${TYPE_BADGE_CLASSES[asset.type] ?? TYPE_BADGE_CLASSES.otro}`}>
                    {ASSET_TYPE_LABELS[asset.type]}
                  </span>
                </button>
                <div className="ml-4 flex items-center gap-2">
                  <button
                    onClick={() => setEditing(asset)}
                    className="text-xs font-medium text-cauce-cian hover:text-cauce-cianOscuro"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setExpandedId(expandedId === asset.id ? null : asset.id)}
                    className="text-xs font-medium text-slate-500 hover:text-slate-800"
                  >
                    {expandedId === asset.id ? "Cerrar" : "Detalle"}
                  </button>
                </div>
              </div>
              {expandedId === asset.id && (
                <div className="border-t border-slate-100 p-4">
                  <AssetDetail asset={asset} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {(showForm || editing) && (
        <AssetForm asset={editing ?? undefined} onClose={() => { setShowForm(false); setEditing(null); }} />
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin text-cauce-cian"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}
