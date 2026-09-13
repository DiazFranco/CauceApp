-- CreateTable
CREATE TABLE "Portfolio" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Portfolio_pkey" PRIMARY KEY ("id")
);

-- Backfill: cartera principal para cada usuario existente
INSERT INTO "Portfolio" (id, "userId", name, "isDefault", "createdAt", "updatedAt")
SELECT gen_random_uuid(), id, 'Cartera principal', true, now(), now()
FROM "User";

-- DropIndex
DROP INDEX "PortfolioSnapshot_userId_date_idx";

-- AlterTable (columnas primero nullable para poder backfillear)
ALTER TABLE "Asset" ADD COLUMN "portfolioId" TEXT;
ALTER TABLE "PortfolioSnapshot" ADD COLUMN "portfolioId" TEXT;

-- Backfill: asignar activos y snapshots a la cartera principal de cada usuario
UPDATE "Asset" a
SET "portfolioId" = p.id
FROM "Portfolio" p
WHERE p."userId" = a."userId";

UPDATE "PortfolioSnapshot" s
SET "portfolioId" = p.id
FROM "Portfolio" p
WHERE p."userId" = s."userId";

-- Ahora sí: exigir el valor
ALTER TABLE "Asset" ALTER COLUMN "portfolioId" SET NOT NULL;
ALTER TABLE "PortfolioSnapshot" ALTER COLUMN "portfolioId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Portfolio_userId_idx" ON "Portfolio"("userId");

-- CreateIndex
CREATE INDEX "Asset_portfolioId_idx" ON "Asset"("portfolioId");

-- CreateIndex
CREATE INDEX "PortfolioSnapshot_portfolioId_date_idx" ON "PortfolioSnapshot"("portfolioId", "date");

-- AddForeignKey
ALTER TABLE "Portfolio" ADD CONSTRAINT "Portfolio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioSnapshot" ADD CONSTRAINT "PortfolioSnapshot_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;