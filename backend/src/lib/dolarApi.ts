const BASE_URL = "https://dolarapi.com/v1/dolares";

export interface DolarQuote {
  compra: number;
  venta: number;
  fecha: string;
}

export type DolarKind = "oficial" | "blue" | "mep" | "ccl";

const ENDPOINTS: Record<DolarKind, string> = {
  oficial: "oficial",
  blue: "blue",
  mep: "bolsa",
  ccl: "contadoconliqui",
};

const TTL_MS = 5 * 60 * 1000;

const cache = new Map<DolarKind, { at: number; quote: DolarQuote }>();

export async function getDolar(kind: DolarKind): Promise<DolarQuote> {
  const cached = cache.get(kind);
  if (cached && Date.now() - cached.at < TTL_MS) {
    return cached.quote;
  }

  const res = await fetch(`${BASE_URL}/${ENDPOINTS[kind]}`);
  if (!res.ok) {
    throw new Error(`DolarAPI respondió ${res.status} para ${kind}`);
  }

  const data = (await res.json()) as {
    compra: number;
    venta: number;
    fecha: string;
  };

  const quote: DolarQuote = {
    compra: Number(data.compra),
    venta: Number(data.venta),
    fecha: data.fecha,
  };

  cache.set(kind, { at: Date.now(), quote });
  return quote;
}

export const DOLAR_KINDS: Record<string, DolarKind> = {
  oficial: "oficial",
  blue: "blue",
  mep: "mep",
  ccl: "ccl",
};

export const DOLAR_LABELS: Record<DolarKind, string> = {
  oficial: "Oficial",
  blue: "Blue",
  mep: "MEP",
  ccl: "CCL",
};
