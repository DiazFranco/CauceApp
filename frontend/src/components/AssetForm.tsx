import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { ASSET_TYPE_LABELS } from "./Layout";
import type { Asset, AssetType, Currency } from "../types";

const ASSET_TYPES = Object.keys(ASSET_TYPE_LABELS) as AssetType[];

interface Props {
  asset?: Asset;
  onClose: () => void;
}

export default function AssetForm({ asset, onClose }: Props) {
  const queryClient = useQueryClient();
  const [type, setType] = useState<AssetType>(asset?.type ?? "accion");
  const [ticker, setTicker] = useState(asset?.ticker ?? "");
  const [name, setName] = useState(asset?.name ?? "");
  const [currencyBought, setCurrencyBought] = useState<Currency>(
    asset?.currencyBought ?? "ARS"
  );
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (body: {
      type: AssetType;
      ticker: string;
      name: string;
      currencyBought: Currency;
    }) =>
      asset
        ? api.patch<Asset>(`/api/assets/${asset.id}`, body)
        : api.post<Asset>("/api/assets", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      onClose();
    },
    onError: (err: Error) => setError(err.message),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker.trim()) {
      setError("El ticker es obligatorio");
      return;
    }
    mutation.mutate({
      type,
      ticker: ticker.trim(),
      name: name.trim() || "",
      currencyBought,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {asset ? "Editar activo" : "Nuevo activo"}
        </h2>
        <form onSubmit={submit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
              Tipo
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as AssetType)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            >
              {ASSET_TYPES.map((t) => (
                <option key={t} value={t}>
                  {ASSET_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
              Ticker
            </label>
            <input
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="Ej: AAPL, BTC, SPY"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
              Nombre <span className="text-slate-400 dark:text-slate-500">(opcional)</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Apple, Bitcoin…"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
              Moneda de compra
            </label>
            <select
              value={currencyBought}
              onChange={(e) => setCurrencyBought(e.target.value as Currency)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </select>
          </div>

          {error && <p className="text-sm text-cauce-coral">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-lg bg-cauce-cian px-4 py-2 text-sm font-medium text-cauce-azul hover:bg-cauce-cianOscuro disabled:opacity-50"
            >
              {mutation.isPending ? "Guardando…" : asset ? "Guardar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
