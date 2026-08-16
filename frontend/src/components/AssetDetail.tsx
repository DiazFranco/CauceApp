import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import TransactionForm from "./TransactionForm";
import PriceForm from "./PriceForm";
import { formatDate, formatNumber } from "../lib/format";
import type { Asset, Transaction } from "../types";

interface Props {
  asset: Asset;
}

export default function AssetDetail({ asset }: Props) {
  const queryClient = useQueryClient();
  const [showTxForm, setShowTxForm] = useState(false);

  const { data: transactions } = useQuery({
    queryKey: ["transactions", asset.id],
    queryFn: () => api.get<Transaction[]>(`/api/assets/${asset.id}/transactions`),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/api/assets/${asset.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const deleteTx = (id: string) => {
    api.delete(`/api/transactions/${id}`).then(() => {
      queryClient.invalidateQueries({ queryKey: ["transactions", asset.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    });
  };

  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">
          Actualizar precio
        </h3>
        <PriceForm assetId={asset.id} isCrypto={asset.type === "cripto"} />
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">
            Transacciones
          </h3>
          <button
            onClick={() => setShowTxForm(!showTxForm)}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
          >
            {showTxForm ? "Ocultar" : "+ Agregar"}
          </button>
        </div>

        {showTxForm && (
          <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <TransactionForm assetId={asset.id} onSaved={() => setShowTxForm(false)} />
          </div>
        )}

        {!transactions || transactions.length === 0 ? (
          <p className="text-sm text-slate-400">
            Sin transacciones. Agregá la primera compra para calcular tu posición.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-xs text-slate-500">
              <tr>
                <th className="px-2 py-2">Fecha</th>
                <th className="px-2 py-2">Tipo</th>
                <th className="px-2 py-2 text-right">Cantidad</th>
                <th className="px-2 py-2 text-right">Precio</th>
                <th className="px-2 py-2 text-right">Moneda</th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="px-2 py-2 text-slate-600">{formatDate(tx.date)}</td>
                  <td className="px-2 py-2">
                    <span
                      className={
                        tx.type === "compra" ? "text-green-600" : "text-red-600"
                      }
                    >
                      {tx.type === "compra" ? "Compra" : "Venta"}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-right text-slate-600">
                    {formatNumber(tx.quantity)}
                  </td>
                  <td className="px-2 py-2 text-right text-slate-600">
                    {formatNumber(tx.price)}
                  </td>
                  <td className="px-2 py-2 text-right text-slate-600">{tx.currency}</td>
                  <td className="px-2 py-2 text-right">
                    <button
                      onClick={() => deleteTx(tx.id)}
                      className="text-xs text-slate-400 hover:text-red-600"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <button
        onClick={() => deleteMutation.mutate()}
        disabled={deleteMutation.isPending}
        className="text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
      >
        Eliminar activo
      </button>
    </div>
  );
}
