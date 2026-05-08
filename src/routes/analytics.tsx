import { createFileRoute } from "@tanstack/react-router";
import { portfolio, calculateMetrics, benchmarks, tvpi } from "@/lib/portfolio";
import { PageHeader, Card, BarRow, Donut } from "@/components/UI";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics · Investment Agent" }] }),
  component: Analytics,
});

const palette = [
  "oklch(0.78 0.17 145)",
  "oklch(0.82 0.15 85)",
  "oklch(0.7 0.18 220)",
  "oklch(0.75 0.18 30)",
  "oklch(0.65 0.18 300)",
  "oklch(0.7 0.15 180)",
  "oklch(0.85 0.15 60)",
];

function Analytics() {
  const m = calculateMetrics(portfolio);

  // weighted IRR per asset class
  const acIrr: Record<string, { irr: number; weight: number }> = {};
  for (const i of portfolio) {
    if (!acIrr[i.assetClass]) acIrr[i.assetClass] = { irr: 0, weight: 0 };
    acIrr[i.assetClass].irr += i.irr * i.contributed;
    acIrr[i.assetClass].weight += i.contributed;
  }

  const geoData = Object.entries(m.byGeography).map(([k, v], i) => ({
    label: k,
    value: v,
    color: palette[i % palette.length],
  }));

  const ranked = [...portfolio].map((i) => ({ ...i, t: tvpi(i) })).sort((a, b) => b.t - a.t);
  const maxIrr = Math.max(...portfolio.map((i) => Math.abs(i.irr)));

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics & Benchmarks" subtitle="Cambridge Associates comparison · Asset class & geography breakdown" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Geography Allocation" subtitle="By committed capital">
          <Donut data={geoData} />
        </Card>

        <Card title="Asset Class — Invested vs Current NAV">
          <div className="space-y-4">
            {Object.entries(m.byAssetClass).map(([k, v]) => {
              const max = Math.max(...Object.values(m.byAssetClass).map((x) => Math.max(x.invested, x.currentValue)));
              return (
                <div key={k}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-medium">{k}</span>
                    <span className="text-muted-foreground">
                      ${(v.invested / 1e6).toFixed(1)}M → ${(v.currentValue / 1e6).toFixed(1)}M
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-muted-foreground/40" style={{ width: `${(v.invested / max) * 100}%` }} />
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full" style={{ width: `${(v.currentValue / max) * 100}%`, background: "var(--gradient-brand)" }} />
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><span className="h-2 w-4 rounded bg-muted-foreground/40" /> Invested</div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-4 rounded" style={{ background: "var(--gradient-brand)" }} /> Current NAV</div>
            </div>
          </div>
        </Card>
      </div>

      <Card title="📊 vs Cambridge Associates Benchmark" subtitle="Weighted IRR per asset class vs CA 5-year benchmark">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-2 text-left">Asset Class</th>
                <th className="py-2 text-right">Your IRR</th>
                <th className="py-2 text-right">CA 5Y Bench</th>
                <th className="py-2 text-right">Spread</th>
                <th className="py-2 text-right">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(acIrr).map(([k, v]) => {
                const yourIrr = v.irr / v.weight;
                const bench = benchmarks[k]?.["5Y"] ?? 0.1;
                const spread = yourIrr - bench;
                return (
                  <tr key={k} className="border-t border-border">
                    <td className="py-3">{k}</td>
                    <td className={`py-3 text-right font-semibold ${yourIrr >= 0 ? "text-primary" : "text-destructive"}`}>
                      {(yourIrr * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 text-right text-muted-foreground">{(bench * 100).toFixed(1)}%</td>
                    <td className={`py-3 text-right ${spread >= 0 ? "text-primary" : "text-destructive"}`}>
                      {spread >= 0 ? "+" : ""}{(spread * 100).toFixed(1)} bps
                    </td>
                    <td className="py-3 text-right text-xs">
                      {spread >= 0.02 ? "🟢 Outperform" : spread >= -0.02 ? "🟡 Inline" : "🔴 Underperform"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="IRR by Investment" subtitle="Annualised internal rate of return">
        <div className="space-y-3.5">
          {ranked.map((i) => (
            <BarRow
              key={i.id}
              label={i.name}
              value={i.irr}
              max={maxIrr}
              suffix={`${(i.irr * 100).toFixed(1)}%`}
              tone={i.irr >= 0 ? "good" : "bad"}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
