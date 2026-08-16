import { createApp } from "./app.js";
import { env } from "./env.js";
import { prisma } from "./db.js";

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`Backend Cauce escuchando en http://localhost:${env.PORT}`);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
