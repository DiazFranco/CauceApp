import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export const DOLAR_LABELS: Record<string, string> = {
  oficial: "Oficial",
  blue: "Blue",
  mep: "MEP",
  ccl: "CCL",
};

interface Me {
  id: string;
  email: string;
  name: string | null;
  fxReference: string;
}

export default function FxSelector() {
  const queryClient = useQueryClient();
  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: () => api.get<Me>("/api/me"),
  });

  const mutation = useMutation({
    mutationFn: (fxReference: string) => api.patch<Me>("/api/me", { fxReference }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["me"], updated);
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  if (!me) return null;

  return (
    <label className="flex items-center gap-2 text-sm text-slate-500">
      <span className="hidden sm:inline">Dólar:</span>
      <select
        value={me.fxReference}
        onChange={(e) => mutation.mutate(e.target.value)}
        disabled={mutation.isPending}
        className="rounded-lg border border-slate-300 px-2 py-1 text-sm text-slate-700"
      >
        {Object.entries(DOLAR_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
