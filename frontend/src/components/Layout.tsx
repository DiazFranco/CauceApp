import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import FxSelector from "./FxSelector";

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
    isActive ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"
  }`;

export default function Layout() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-bold text-indigo-600">
            Cauce
          </Link>
          <nav className="flex items-center gap-2">
            <NavLink to="/" end className={navLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/activos" className={navLinkClass}>
              Activos
            </NavLink>
            <div className="ml-4 flex items-center gap-3">
              <FxSelector />
              {user && (
                <span className="text-sm text-slate-500">
                  {user.user_metadata?.full_name ?? user.email}
                </span>
              )}
              <button
                onClick={signOut}
                className="text-sm font-medium text-slate-500 hover:text-slate-800"
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
