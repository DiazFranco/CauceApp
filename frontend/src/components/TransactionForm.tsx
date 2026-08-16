import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Currency, TransactionType } from "../types";

interface Props {
  assetId: string;
  onSaved?: () => void;
}

export default function TransactionForm({ assetId, onSaved }: Props) {
  const queryClient = useQueryClient();
  const [type, setType] = useState<TransactionType>("compra");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState<Currency>("ARS");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (body: {
      type: TransactionType;
      quantity: number;
      price: number;
      currency: Currency;
      date: string;
    }) => api.post(`/api/assets/${assetId}/transactions`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setQuantity("");
      setPrice("");
      setDate(new Date().toISOString().slice(0, 10));
      onSaved?.();
    },
    onError: (err: Error) => setError(err.message),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(quantity);
    const p = Number(price);
    if (!quantity || !price || qty <= 0 || p <= 0) {
      setError("Cantidad y precio deben ser mayores a 0");
      return;
    }
    if (!date) {
      setError("La fecha es obligatoria");
      return;
    }
    setError(null);
    mutation.mutate({ type, quantity: qty, price: p, currency, date });
  };

  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">Tipo</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as TransactionType)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="compra">Compra</option>
          <option value="venta">Venta</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">Cantidad</label>
        <input
          type="number"
          step="any"
          min="0"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="10"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">Precio unitario</label>
        <input
          type="number"
          step="any"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="1000"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">Moneda</label>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value as Currency)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="ARS">ARS</option>
          <option value="USD">USD</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs font-medium text-slate-500">Fecha</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {mutation.isPending ? "Guardando…" : "Agregar transacción"}
        </button>
      </div>
    </form>
  );
}
