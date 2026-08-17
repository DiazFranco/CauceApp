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
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [txSuccess, setTxSuccess] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setTxSuccess(msg);
    window.setTimeout(() => setTxSuccess(null), 3000);
  };

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

  const toggleAddForm = () => {
    setEditingTx(null);
    setShowTxForm((v) => !v);
  };

  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
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
            onClick={toggleAddForm}
            className="text-xs font-medium text-cauce-cian hover:text-cauce-cianOscuro"
          >
            {showTxForm ? "Ocultar" : "+ Agregar"}
          </button>
        </div>

        {showTxForm && (
          <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {editingTx
                  ? `Editando transacción del ${formatDate(editingTx.date)}`
                  : "Nueva transacción"}
              </span>
              {editingTx && (
                <button
                  onClick={() => setEditingTx(null)}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancelar edición
                </button>
              )}
            </div>
            <TransactionForm
              key={editingTx?.id ?? "nueva"}
              assetId={asset.id}
              transaction={editingTx ?? undefined}
              onSaved={() => {
                const wasEditing = editingTx !== null;
                setShowTxForm(false);
                setEditingTx(null);
                showSuccess(
                  wasEditing
                    ? "Transacción actualizada correctamente"
                    : "Transacción agregada correctamente"
                );
              }}
            />
          </div>
        )}

        {txSuccess && !showTxForm && (
          <p className="mb-4 rounded-lg bg-cauce-verde/10 px-3 py-2 text-sm text-cauce-verde">
            {txSuccess}
          </p>
        )}

        {!transactions || transactions.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-400">
            Sin transacciones. Agregá la primera compra para calcular tu posición.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
              <tr>
                <th className="px-2 py-2">Fecha</th>
                <th className="px-2 py-2">Tipo</th>
                <th className="px-2 py-2 text-right">Cantidad</th>
                <th className="px-2 py-2 text-right">Precio</th>
                <th className="px-2 py-2 text-right">Moneda</th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="px-2 py-2 text-slate-600 dark:text-slate-300">{formatDate(tx.date)}</td>
                  <td className="px-2 py-2">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                        tx.type === "compra"
                          ? "bg-cauce-verde/15 text-cauce-verde"
                          : "bg-cauce-coral/15 text-cauce-coral"
                      }`}
                    >
                      {tx.type === "compra" ? "Compra" : "Venta"}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-right text-slate-600 dark:text-slate-300">
                    {formatNumber(tx.quantity)}
                  </td>
                  <td className="px-2 py-2 text-right text-slate-600 dark:text-slate-300">
                    {formatNumber(tx.price)}
                  </td>
                  <td className="px-2 py-2 text-right text-slate-600 dark:text-slate-300">{tx.currency}</td>
                  <td className="px-2 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingTx(tx);
                          setShowTxForm(true);
                        }}
                        className="text-xs text-cauce-cian hover:text-cauce-cianOscuro"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteTx(tx.id)}
                        className="text-xs text-slate-400 hover:text-cauce-coral"
                      >
                        Eliminar
                      </button>
                    </div>
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
        className="text-sm font-medium text-cauce-coral hover:text-cauce-coralOscuro disabled:opacity-50"
      >
        Eliminar activo
      </button>
    </div>
  );
}
