import { prisma } from "../db.js";
import { getDolar, type DolarKind } from "../lib/dolarApi.js";
import { getCryptoPriceUsd, CRYPTO_COIN_IDS } from "../lib/coingecko.js";
import type { FxReference } from "@prisma/client";

const FX_REFERENCE_TO_KIND: Record<FxReference, DolarKind> = {
  blue: "blue",
  mep: "mep",
  ccl: "ccl",
  oficial: "oficial",
};

export interface Position {
  id: string;
  type: string;
  ticker: string;
  name: string | null;
  currencyBought: string;
  quantity: number;
  totalCostArs: number;
  valueArs: number;
  valueUsd: number;
  returnArs: number;
  returnPercent: number;
  lastPrice: number | null;
  lastPriceCurrency: string | null;
  lastUpdated: string | null;
}

export interface PortfolioResult {
  fxRate: number;
  fxName: string;
  totalArs: number;
  totalUsd: number;
  positions: Position[];
}

export async function computePortfolio(userId: string): Promise<PortfolioResult> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  const fxKind = FX_REFERENCE_TO_KIND[user.fxReference];
  const [dolar, assets, transactions, snapshots] = await Promise.all([
    getDolar(fxKind),
    prisma.asset.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.transaction.findMany({
      where: { asset: { userId } },
      orderBy: { date: "asc" },
    }),
    prisma.priceSnapshot.findMany({
      where: { asset: { userId } },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const fxRate = dolar.venta;

  const txByAsset = new Map<string, typeof transactions>();
  for (const tx of transactions) {
    const list = txByAsset.get(tx.assetId) ?? [];
    list.push(tx);
    txByAsset.set(tx.assetId, list);
  }

  const lastSnapshotByAsset = new Map<string, (typeof snapshots)[number]>();
  for (const snap of snapshots) {
    if (!lastSnapshotByAsset.has(snap.assetId)) {
      lastSnapshotByAsset.set(snap.assetId, snap);
    }
  }

  const positions: Position[] = [];
  let totalArs = 0;
  let totalUsd = 0;

  for (const asset of assets) {
    const txs = txByAsset.get(asset.id) ?? [];
    const snapshot = lastSnapshotByAsset.get(asset.id) ?? null;

    const quantity = txs.reduce(
      (acc, tx) => acc + (tx.type === "compra" ? tx.quantity.toNumber() : -tx.quantity.toNumber()),
      0
    );

    const totalCost = txs.reduce(
      (acc, tx) => acc + tx.quantity.toNumber() * tx.price.toNumber(),
      0
    );

    let lastPrice: number | null = null;
    let lastPriceCurrency: string | null = null;
    if (snapshot) {
      lastPrice = snapshot.price.toNumber();
      lastPriceCurrency = snapshot.currency;
    } else if (asset.type === "cripto") {
      const coinId = CRYPTO_COIN_IDS[asset.ticker.toUpperCase()];
      if (coinId) {
        try {
          lastPrice = await getCryptoPriceUsd(coinId);
          lastPriceCurrency = "USD";
        } catch {
          lastPrice = null;
        }
      }
    }

    const pricedInUsd = lastPriceCurrency === "USD";
    const totalCostArs =
      asset.currencyBought === "USD" ? totalCost * fxRate : totalCost;

    const hasPrice = lastPrice !== null && quantity > 0;
    const valueUsd =
      hasPrice
        ? (pricedInUsd ? lastPrice! * quantity : (lastPrice! * quantity) / fxRate)
        : quantity > 0
          ? totalCostArs / fxRate
          : 0;
    const valueArs =
      hasPrice
        ? (pricedInUsd ? lastPrice! * quantity * fxRate : lastPrice! * quantity)
        : quantity > 0
          ? totalCostArs
          : 0;

    const returnArs = valueArs - totalCostArs;
    const returnPercent = totalCostArs > 0 ? (returnArs / totalCostArs) * 100 : 0;

    positions.push({
      id: asset.id,
      type: asset.type,
      ticker: asset.ticker,
      name: asset.name,
      currencyBought: asset.currencyBought,
      quantity,
      totalCostArs,
      valueArs,
      valueUsd,
      returnArs,
      returnPercent,
      lastPrice,
      lastPriceCurrency,
      lastUpdated: snapshot?.updatedAt.toISOString() ?? null,
    });

    totalArs += valueArs;
    totalUsd += valueUsd;
  }

  return { fxRate, fxName: fxKind, totalArs, totalUsd, positions };
}

export async function savePortfolioSnapshot(userId: string, result: PortfolioResult) {
  return prisma.portfolioSnapshot.create({
    data: {
      userId,
      totalArs: result.totalArs,
      totalUsd: result.totalUsd,
    },
  });
}
