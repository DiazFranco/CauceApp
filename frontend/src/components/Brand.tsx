export function LogoMark({ className = "h-6 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 36"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 30 C 18 27, 32 20, 44 10"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M4 20 C 15 18, 27 13, 38 5"
        stroke="currentColor"
        strokeOpacity="0.5"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Brand({ withTagline = false }: { withTagline?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-cauce-cian">
        <LogoMark className="h-6 w-8" />
      </span>
      <span className="leading-tight">
        <span className="block text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Cauce
        </span>
        {withTagline && (
          <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Tus inversiones en el rumbo correcto
          </span>
        )}
      </span>
    </div>
  );
}