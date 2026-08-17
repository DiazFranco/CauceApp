import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Currency } from "../types";

interface Props {
  assetId: string;
  isCrypto: boolean;
}

export default function PriceForm({ assetId, isCrypto }: Props) {
  const queryClient = useQueryClient();
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState<Currency>("ARS");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["assets"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const manualMutation = useMutation({
    mutationFn: (body: { price: number; currency: Currency }) =>
      api.put(`/api/assets/${assetId}/price`, body),
    onSuccess: () => {
      invalidate();
      setPrice("");
      setMessage("Precio actualizado");
      setError(null);
    },
    onError: (err: Error) => setError(err.message),
  });

  const fetchMutation = useMutation({
    mutationFn: () => api.post(`/api/assets/${assetId}/price/fetch`, {}),
    onSuccess: () => {
      invalidate();
      setMessage("Precio actualizado desde el mercado");
      setError(null);
    },
    onError: (err: Error) => setError(err.message),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = Number(price);
    if (!price || p <= 0) {
      setError("Ingresá un precio válido");
      return;
    }
    setError(null);
    setMessage(null);
    manualMutation.mutate({ price: p, currency });
  };

  return (
    <div className="space-y-3">
      <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Último precio
          </label>
          <input
            type="number"
            step="any"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="123.45"
            className="w-32 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Moneda
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="ARS">ARS</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={manualMutation.isPending}
          className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-900 disabled:opacity-50 dark:bg-slate-700 dark:hover:bg-slate-600"
        >
          Guardar
        </button>
      </form>

      {isCrypto && (
        <button
          onClick={() => fetchMutation.mutate()}
          disabled={fetchMutation.isPending}
          className="rounded-lg border border-cauce-cian bg-cauce-cian/10 px-3 py-2 text-sm font-medium text-cauce-cianOscuro hover:bg-cauce-cian/20 disabled:opacity-50"
        >
          {fetchMutation.isPending ? "Consultando…" : "Traer precio automático (cripto)"}
        </button>
      )}

      {error && <p className="text-sm text-cauce-coral">{error}</p>}
      {message && <p className="text-sm text-cauce-verde">{message}</p>}
    </div>
  );
}
