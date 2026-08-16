export type AssetType =
  | "accion"
  | "cedear"
  | "cripto"
  | "fci"
  | "bono"
  | "plazo_fijo"
  | "otro";

export type Currency = "ARS" | "USD";

export type TransactionType = "compra" | "venta";

export interface Asset {
  id: string;
  userId: string;
  type: AssetType;
  ticker: string;
  name: string;
  currencyBought: Currency;
  createdAt: string;
}

export interface Transaction {
  id: string;
  assetId: string;
  type: TransactionType;
  quantity: number;
  price: number;
  currency: Currency;
  date: string;
}

export interface PriceSnapshot {
  id: string;
  assetId: string;
  price: number;
  currency: Currency;
  updatedAt: string;
}

export interface PortfolioSnapshot {
  id: string;
  userId: string;
  totalArs: number;
  totalUsd: number;
  date: string;
}
