export function StatCard({
  label,
  value,
  delta,
  hint,
}: {
  label: string;
  value: string;
  delta?: number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-colors hover:border-primary/40">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-bold tracking-tight">{value}</div>
      {typeof delta === "number" && (
        <div className={`mt-1 text-xs ${delta >= 0 ? "text-primary" : "text-destructive"}`}>
          {delta >= 0 ? "▲" : "▼"} {(Math.abs(delta) * 100).toFixed(1)}%
        </div>
      )}
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function Card({
  title,
  subtitle,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6 ${className}`}>
      {title && (
        <div className="mb-4">
          <h3 className="font-semibold tracking-tight">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title} </h1>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle} </p>}
    </div>
  );
}

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "good" | "bad" | "warn" | "neutral" }) {
  const map = {
    good: "border-primary/30 bg-primary/10 text-primary",
    bad: "border-destructive/30 bg-destructive/10 text-destructive",
    warn: "border-accent/30 bg-accent/10 text-accent",
    neutral: "border-border bg-muted text-muted-foreground",
  };
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${map[tone]}`}>{children}</span>;
}

// Simple SVG donut
export function Donut({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let acc = 0;
  const r = 80;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Bigger centered donut */}
      <svg width="200" height="200" viewBox="0 0 200 200" className="shrink-0">
        <g transform="translate(100 100) rotate(-90)">
          {data.map((d, i) => {
            const len = (d.value / total) * c;
            const dash = `${len} ${c - len}`;
            const offset = -acc;
            acc += len;
            return (
              <circle
                key={i}
                r={r}
                fill="none"
                stroke={d.color}
                strokeWidth="24"
                strokeDasharray={dash}
                strokeDashoffset={offset}
              />
            );
          })}
        </g>
        <text x="100" y="94" textAnchor="middle" className="fill-muted-foreground" fontSize="10" fontFamily="inherit" letterSpacing="1">
          TOTAL
        </text>
        <text x="100" y="114" textAnchor="middle" className="fill-foreground" fontSize="18" fontWeight="700" fontFamily="inherit">
          ${(total / 1e6).toFixed(1)}M
        </text>
      </svg>

      {/* 2-column grid legend — fills horizontal space */}
      <div className="grid w-full grid-cols-2 gap-x-6 gap-y-3">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2 min-w-0">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: d.color }} />
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{d.label}</div>
              <div className="text-xs text-muted-foreground">
                {((d.value / total) * 100).toFixed(1)}%
                <span className="ml-1.5 font-mono" style={{ color: "oklch(0.85 0.02 250)" }}>
                  ${(d.value / 1e6).toFixed(2)}M
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


export function BarRow({ label, value, max, suffix, tone = "good" }: { label: string; value: number; max: number; suffix?: string; tone?: "good" | "bad" }) {
  const pct = Math.min(100, (Math.abs(value) / max) * 100);
  const bg = tone === "good" ? "var(--gradient-brand)" : "oklch(0.65 0.22 25)";
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="truncate font-medium">{label}</span>
        <span className={tone === "good" ? "text-primary" : "text-destructive"}>{suffix ?? value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: bg }} />
      </div>
    </div>
  );
}
