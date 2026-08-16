const BASE_URL = "https://api.coingecko.com/api/v3";

const TTL_MS = 5 * 60 * 1000;

const cache = new Map<string, { at: number; priceUsd: number }>();

export async function getCryptoPriceUsd(coinId: string): Promise<number> {
  const cached = cache.get(coinId);
  if (cached && Date.now() - cached.at < TTL_MS) {
    return cached.priceUsd;
  }

  const url = `${BASE_URL}/simple/price?ids=${encodeURIComponent(coinId)}&vs_currencies=usd`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`CoinGecko respondió ${res.status} para ${coinId}`);
  }

  const data = (await res.json()) as Record<string, { usd?: number }>;
  const price = data[coinId]?.usd;
  if (typeof price !== "number") {
    throw new Error(`CoinGecko no encontró ${coinId}`);
  }

  cache.set(coinId, { at: Date.now(), priceUsd: price });
  return price;
}

export const CRYPTO_COIN_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  USDT: "tether",
  USDC: "usd-coin",
  DAI: "dai",
  SOL: "solana",
  BNB: "binancecoin",
  XRP: "ripple",
  ADA: "cardano",
  MATIC: "matic-network",
  LTC: "litecoin",
  DOGE: "dogecoin",
};
