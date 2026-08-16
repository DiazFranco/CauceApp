import dotenv from "dotenv";
dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}. Copiá backend/.env.example a backend/.env`);
  }
  return value;
}

export const env = {
  DATABASE_URL: required("DATABASE_URL"),
  SUPABASE_URL: required("SUPABASE_URL"),
  SUPABASE_SERVICE_ROLE_KEY: required("SUPABASE_SERVICE_ROLE_KEY"),
  PORT: Number(process.env.PORT ?? 4000),
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
};
