import { createFileRoute, Link } from "@tanstack/react-router";
import { portfolio, calculateMetrics, detectAnomalies, fmtCompact, tvpi } from "@/lib/portfolio";
import { StatCard, Card, PageHeader, Donut, BarRow, Badge } from "@/components/UI";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard · Investment Agent" }] }),
  component: Dashboard,
});

const palette = [
  "oklch(0.78 0.17 145)",
  "oklch(0.82 0.15 85)",
  "oklch(0.7 0.18 220)",
  "oklch(0.75 0.18 30)",
  "oklch(0.65 0.18 300)",
  "oklch(0.7 0.15 180)",
];

function Dashboard() {
  const m = calculateMetrics(portfolio);
  const anomalies = detectAnomalies(portfolio, m);
  const allocData = Object.entries(m.byAssetClass).map(([k, v], i) => ({
    label: k,
    value: v.invested,
    color: palette[i % palette.length],
  }));
  const ranked = [...portfolio].map((i) => ({ ...i, t: tvpi(i) })).sort((a, b) => b.t - a.t);

  return (
    <div className="space-y-6">
      <PageHeader title="Portfolio Dashboard" subtitle={`${m.count} active investments · Updated just now`} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total Invested" value={fmtCompact(m.totalInvested)} hint={`${m.count} positions`} />
        <StatCard
          label="Current NAV"
          value={fmtCompact(m.totalNav)}
          delta={(m.totalNav - m.totalInvested) / m.totalInvested}
        />
        <StatCard label="Distributed" value={fmtCompact(m.totalDistributed)} hint="Returned to investor" />
        <StatCard label="Portfolio TVPI" value={`${m.portfolioTvpi.toFixed(2)}x`} hint="Total Value / Paid-In" />
        <StatCard label="Portfolio DPI" value={`${m.portfolioDpi.toFixed(2)}x`} hint="Distributions / Paid-In" />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card title="Allocation by Asset Class" subtitle="By committed capital" className="lg:col-span-2">
          <Donut data={allocData} />
        </Card>

        <Card title="TVPI by Investment" subtitle="Top 8 · break-even at 1.0x" className="lg:col-span-3">
          <div className="space-y-3.5">
            {ranked.slice(0, 8).map((i) => (
              <BarRow
                key={i.id}
                label={i.name}
                value={i.t}
                max={3}
                suffix={`${i.t.toFixed(2)}x`}
                tone={i.t >= 1 ? "good" : "bad"}
              />
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="🏆 Top Performers" className="lg:col-span-1">
          <ul className="space-y-3">
            {m.topPerformers.slice(0, 3).map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{i.name}</div>
                  <div className="text-xs text-muted-foreground">{i.assetClass}</div>
                </div>
                <Badge tone="good">{i.tvpi.toFixed(2)}x</Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="⚠️ Watch List" className="lg:col-span-1">
          <ul className="space-y-3">
            {m.underperformers.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{i.name}</div>
                  <div className="text-xs text-muted-foreground">{i.assetClass}</div>
                </div>
                <Badge tone={i.tvpi < 1 ? "bad" : "warn"}>{i.tvpi.toFixed(2)}x</Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="🚨 Risk Flags" subtitle={`${anomalies.length} active`} className="lg:col-span-1">
          <ul className="space-y-3 text-sm">
            {anomalies.slice(0, 4).map((f, i) => (
              <li key={i} className="rounded-lg border border-border bg-background/40 p-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge tone={f.severity === "HIGH" ? "bad" : "warn"}>{f.type}</Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{f.message}</p>
              </li>
            ))}
            {!anomalies.length && <p className="text-xs text-muted-foreground">No flags raised. Portfolio looks healthy.</p>}
          </ul>
        </Card>
      </div>

      <Card title="Quick Actions">
        <div className="flex flex-wrap gap-3">
          <Link 
            to="/investments" 
            className="rounded-lg px-4 py-2 text-sm font-semibold text-brand-foreground"
            style={{ background: 'var(--gradient-brand)' }}
          >
            View All Investments →
          </Link>
          <Link to="/insights" className="rounded-lg border border-border bg-card px-4 py-2 text-sm hover:bg-muted">
            🤖 Ask AI
          </Link>
          <Link to="/reports" className="rounded-lg border border-border bg-card px-4 py-2 text-sm hover:bg-muted">
            📄 Generate Weekly Report
          </Link>
        </div>
      </Card>
    </div>
  );
}
