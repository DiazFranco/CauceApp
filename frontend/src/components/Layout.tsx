import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import FxSelector from "./FxSelector";
import { Brand } from "./Brand";

export const ASSET_TYPE_LABELS: Record<string, string> = {
  accion: "Acción",
  cedear: "CEDEAR",
  cripto: "Cripto",
  fci: "FCI",
  bono: "Bono",
  plazo_fijo: "Plazo fijo",
  otro: "Otro",
};

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium ${
    isActive
      ? "bg-cauce-cian text-cauce-azul"
      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
  }`;

export default function Layout() {
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center">
            <Brand />
          </Link>
          <nav className="flex items-center gap-2">
            <NavLink to="/" end className={navLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/activos" className={navLinkClass}>
              Activos
            </NavLink>
            <div className="ml-4 flex items-center gap-3">
              <button
                onClick={toggle}
                aria-label="Cambiar tema"
                title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
                className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {theme === "dark" ? <SunIcon /> : <MoonIcon />}
              </button>
              <FxSelector />
              {user && (
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {user.user_metadata?.full_name ?? user.email}
                </span>
              )}
              <button
                onClick={signOut}
                className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Salir
              </button>
            </div>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path strokeLinecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}