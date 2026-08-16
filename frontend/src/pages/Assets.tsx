import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { ASSET_TYPE_LABELS } from "../components/Layout";
import AssetForm from "../components/AssetForm";
import AssetDetail from "../components/AssetDetail";
import type { Asset } from "../types";

export default function Assets() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Asset | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["assets"],
    queryFn: () => api.get<Asset[]>("/api/assets"),
  });

  if (isLoading) return <p className="text-slate-500">Cargando activos…</p>;
  if (isError) return <p className="text-red-600">Error al cargar los activos.</p>;

  const assets = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Activos</h1>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Nuevo activo
        </button>
      </div>

      {assets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-slate-600">No hay activos cargados todavía.</p>
          <p className="mt-1 text-sm text-slate-400">
            Empezá creando tu primer activo para después cargarle compras y ventas.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {assets.map((asset) => (
            <div key={asset.id} className="rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between px-4 py-3">
                <button
                  onClick={() =>
                    setExpandedId(expandedId === asset.id ? null : asset.id)
                  }
                  className="flex flex-1 items-center justify-between text-left"
                >
                  <div>
                    <div className="font-medium text-slate-900">{asset.ticker}</div>
                    <div className="text-xs text-slate-400">{asset.name}</div>
                  </div>
                  <span className="ml-4 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                    {ASSET_TYPE_LABELS[asset.type]}
                  </span>
                </button>
                <div className="ml-4 flex items-center gap-2">
                  <button
                    onClick={() => setEditing(asset)}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
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
