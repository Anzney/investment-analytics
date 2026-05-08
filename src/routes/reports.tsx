import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { portfolio, calculateMetrics, detectAnomalies, tvpi } from "@/lib/portfolio";
import { PageHeader, Card } from "@/components/UI";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports · Investment Agent" }] }),
  component: Reports,
});

function buildReport() {
  const m = calculateMetrics(portfolio);
  const anomalies = detectAnomalies(portfolio, m);
  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const ranked = [...portfolio].map((i) => ({ ...i, t: tvpi(i) }));

  return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 INVESTMENT PORTFOLIO REPORT
${today}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 SUMMARY
Portfolio is delivering ${m.portfolioTvpi.toFixed(2)}x TVPI across ${m.count} positions.
Status: ${m.portfolioTvpi >= 1.5 ? "STRONG" : m.portfolioTvpi >= 1.0 ? "GOOD" : "NEEDS_ATTENTION"}

💰 KEY NUMBERS
Total Invested:  $${m.totalInvested.toLocaleString()}
Current Value:   $${m.totalNav.toLocaleString()}
Total Returned:  $${m.totalDistributed.toLocaleString()}
Portfolio TVPI:  ${m.portfolioTvpi.toFixed(2)}x
Portfolio DPI:   ${m.portfolioDpi.toFixed(2)}x

📈 TOP PERFORMERS
${m.topPerformers.slice(0, 3).map((i) => `  ✅ ${i.name}: ${i.tvpi.toFixed(2)}x TVPI`).join("\n")}

⚠️ WATCH LIST
${ranked.filter((i) => i.t < 1.2).slice(0, 3).map((i) => `  🔴 ${i.name}: ${i.t.toFixed(2)}x TVPI`).join("\n") || "  None"}

💡 KEY INSIGHTS
  • Realised gains of $${(m.totalDistributed - (m.totalInvested - m.totalNav)).toLocaleString()} demonstrate strong DPI execution
  • Diversification across ${Object.keys(m.byAssetClass).length} asset classes reduces single-strategy risk
  • ${anomalies.filter((f) => f.type === "CONCENTRATION").length} concentration flag(s) — review largest positions

🚨 FLAGS
${anomalies.length ? anomalies.map((f) => `  • ${f.message}`).join("\n") : "  No active flags"}

✅ RECOMMENDED ACTIONS
  → Schedule manager review for any TVPI < 0.8x positions
  → Redeploy distributions into 2024-vintage opportunities
  → Compare PE returns vs Cambridge 5Y benchmark

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}

function Reports() {
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const report = useMemo(buildReport, []);

  function generate() {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 800);
  }

  function download() {
    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `portfolio-report-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" subtitle="Weekly portfolio snapshot — WhatsApp / email ready" />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: "📅", title: "Weekly Report", desc: "Auto-generated every Monday", action: "Generate now" },
          { icon: "📊", title: "Quarterly Review", desc: "Deep performance & benchmark", action: "Schedule" },
          { icon: "📤", title: "Send via WhatsApp", desc: "Twilio integration", action: "Configure" },
        ].map((c) => (
          <Card key={c.title}>
            <div className="text-2xl">{c.icon}</div>
            <h3 className="mt-3 font-semibold">{c.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{c.desc}</p>
            <button
              onClick={c.title === "Weekly Report" ? generate : undefined}
              className="mt-4 text-xs font-semibold text-primary hover:underline"
            >
              {c.action} →
            </button>
          </Card>
        ))}
      </div>

      <Card title="📄 Weekly Report Preview">
        {!generated && !generating && (
          <div className="grid place-items-center py-12 text-center">
            <div className="text-5xl">📭</div>
            <p className="mt-4 text-sm text-muted-foreground">No report generated yet</p>
            <button
              onClick={generate}
              className="mt-4 rounded-lg px-5 py-2.5 text-sm font-semibold text-brand-foreground"
              style={{ background: 'var(--gradient-brand)' }}
            >
              Generate Weekly Report
            </button>
          </div>
        )}

        {generating && (
          <div className="grid place-items-center py-12">
            <div className="flex gap-1.5">
              <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:0.15s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:0.3s]" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Crunching portfolio data…</p>
          </div>
        )}

        {generated && (
          <>
            <div className="mb-4 flex flex-wrap gap-2">
              <button
                onClick={download}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-brand-foreground"
                style={{ background: 'var(--gradient-brand)' }}
              >
                ⬇ Download .txt
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(report)}
                className="rounded-lg border border-border bg-background px-4 py-2 text-sm hover:bg-muted"
              >
                📋 Copy
              </button>
              <button
                onClick={generate}
                className="rounded-lg border border-border bg-background px-4 py-2 text-sm hover:bg-muted"
              >
                🔄 Regenerate
              </button>
            </div>
            <pre className="overflow-x-auto rounded-lg border border-border bg-[oklch(0.13_0.02_250)] p-4 text-xs leading-relaxed text-[oklch(0.85_0.02_250)]">
              {report}
            </pre>
          </>
        )}
      </Card>
    </div>
  );
}
