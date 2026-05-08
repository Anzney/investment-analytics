import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { portfolio, calculateMetrics, detectAnomalies, tvpi } from "@/lib/portfolio";
import { PageHeader, Card, Badge } from "@/components/UI";

export const Route = createFileRoute("/insights")({
  head: () => ({ meta: [{ title: "AI Insights · Investment Agent" }] }),
  component: Insights,
});

const sampleQuestions = [
  "Which fund has the best IRR?",
  "How much have I invested in PE?",
  "Which investments should I consider exiting?",
  "What is my concentration risk?",
];

// local "AI" — pattern matched answers using portfolio data
function answer(q: string): string {
  const m = calculateMetrics(portfolio);
  const ql = q.toLowerCase();
  const ranked = [...portfolio].map((i) => ({ ...i, t: tvpi(i) }));

  if (ql.includes("best") && (ql.includes("irr") || ql.includes("return"))) {
    const best = [...portfolio].sort((a, b) => b.irr - a.irr)[0];
    return `${best.name} has the highest IRR at ${(best.irr * 100).toFixed(1)}%, managed by ${best.manager} (vintage ${best.vintageYear}). It's a ${best.assetClass} fund based in ${best.geography}.`;
  }
  if (ql.includes("worst") || ql.includes("losing") || ql.includes("exit") || ql.includes("underperform")) {
    const worst = ranked.filter((i) => i.t < 1).sort((a, b) => a.t - b.t);
    if (!worst.length) return "Good news — no investments are below 1.0x TVPI right now.";
    return `Consider reviewing: ${worst.slice(0, 2).map((i) => `${i.name} (${i.t.toFixed(2)}x TVPI, ${(i.irr * 100).toFixed(1)}% IRR)`).join(" and ")}. Both are below break-even.`;
  }
  if ((ql.includes("how much") || ql.includes("invested")) && (ql.includes("pe") || ql.includes("private equity"))) {
    const pe = m.byAssetClass["Private Equity"];
    return `You've invested $${(pe.invested / 1e6).toFixed(2)}M across ${pe.count} Private Equity funds. Current NAV stands at $${(pe.currentValue / 1e6).toFixed(2)}M.`;
  }
  if (ql.includes("concentration") || ql.includes("risk")) {
    const flags = detectAnomalies(portfolio, m).filter((f) => f.type === "CONCENTRATION");
    if (!flags.length) return "Concentration looks healthy — no single position exceeds 15% of the portfolio.";
    return flags.map((f) => f.message).join(" ");
  }
  if (ql.includes("total") || ql.includes("overall")) {
    return `Total invested: $${(m.totalInvested / 1e6).toFixed(2)}M. Current value: $${(m.totalNav / 1e6).toFixed(2)}M. Distributions: $${(m.totalDistributed / 1e6).toFixed(2)}M. Portfolio TVPI ${m.portfolioTvpi.toFixed(2)}x, DPI ${m.portfolioDpi.toFixed(2)}x.`;
  }
  if (ql.includes("top") || ql.includes("performer")) {
    const top = m.topPerformers.slice(0, 3);
    return `Top 3 by TVPI: ${top.map((i) => `${i.name} (${i.tvpi.toFixed(2)}x)`).join(", ")}.`;
  }
  return `Portfolio snapshot: $${(m.totalInvested / 1e6).toFixed(2)}M invested, ${m.portfolioTvpi.toFixed(2)}x TVPI, ${m.portfolioDpi.toFixed(2)}x DPI. Try asking about a specific fund, asset class, or risk concern.`;
}

function Insights() {
  const m = calculateMetrics(portfolio);
  const anomalies = detectAnomalies(portfolio, m);
  const top = m.topPerformers[0];
  const worst = m.underperformers[0];

  const [q, setQ] = useState("");
  const [chat, setChat] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Hi 👋 I'm your portfolio AI. Ask me anything about your investments." },
  ]);
  const [thinking, setThinking] = useState(false);

  function ask(text: string) {
    if (!text.trim()) return;
    setChat((c) => [...c, { role: "user", text }]);
    setQ("");
    setThinking(true);
    setTimeout(() => {
      setChat((c) => [...c, { role: "ai", text: answer(text) }]);
      setThinking(false);
    }, 600);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="AI Insights" subtitle="Powered by portfolio intelligence" />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <span 
              className="grid h-7 w-7 place-items-center rounded-md text-xs font-bold text-brand-foreground"
              style={{ background: 'var(--gradient-brand)' }}
            >
              AI
            </span>
            <h3 className="font-semibold">Headline</h3>
            <Badge tone={m.portfolioTvpi >= 1.5 ? "good" : m.portfolioTvpi >= 1.0 ? "warn" : "bad"}>
              {m.portfolioTvpi >= 1.5 ? "STRONG" : m.portfolioTvpi >= 1.0 ? "GOOD" : "ATTENTION"}
            </Badge>
          </div>
          <p className="mt-3 text-sm">
            Portfolio is delivering <span className="font-semibold text-primary">{m.portfolioTvpi.toFixed(2)}x TVPI</span> across {m.count} positions, with realised distributions of <span className="font-semibold">${(m.totalDistributed / 1e6).toFixed(2)}M</span> already returned.
            {top && <> Standout performer is <span className="font-semibold">{top.name}</span> at {top.tvpi.toFixed(2)}x.</>}
            {worst && worst.tvpi < 1 && <> Watch list anchored by <span className="font-semibold">{worst.name}</span> at {worst.tvpi.toFixed(2)}x.</>}
          </p>

          <h4 className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Key Insights</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex gap-2"><span className="text-primary">•</span> Realised gains of ${((m.totalDistributed - (m.totalInvested - m.totalNav)) / 1e6).toFixed(2)}M demonstrate strong DPI execution.</li>
            <li className="flex gap-2"><span className="text-primary">•</span> Asset-class diversification spans {Object.keys(m.byAssetClass).length} categories — reduces single-strategy risk.</li>
            <li className="flex gap-2"><span className="text-primary">•</span> {anomalies.filter((f) => f.type === "CONCENTRATION").length} concentration flag(s) — review position sizing on largest holdings.</li>
          </ul>

          <h4 className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recommended Actions</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex gap-2"><span className="text-accent">→</span> Schedule manager review for any TVPI &lt; 0.8x positions.</li>
            <li className="flex gap-2"><span className="text-accent">→</span> Consider redeploying distributions from Tech Growth Fund III into 2024-vintage opportunities.</li>
            <li className="flex gap-2"><span className="text-accent">→</span> Compare PE returns against Cambridge 5Y benchmark in the Analytics tab.</li>
          </ul>
        </Card>

        <Card title="🚨 Risk Flags" subtitle={`${anomalies.length} active`}>
          <ul className="space-y-3 text-sm">
            {anomalies.map((f, i) => (
              <li key={i} className="rounded-lg border border-border bg-background/40 p-3">
                <Badge tone={f.severity === "HIGH" ? "bad" : "warn"}>{f.type}</Badge>
                <p className="mt-2 text-xs text-muted-foreground">{f.message}</p>
              </li>
            ))}
            {!anomalies.length && <p className="text-xs text-muted-foreground">No flags raised.</p>}
          </ul>
        </Card>
      </div>

      <Card title="💬 Ask Your Portfolio" subtitle="Natural language Q&A on your data">
        <div className="space-y-3">
          {chat.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "user"
                    ? "text-brand-foreground"
                    : "border border-border bg-background"
                }`}
                style={m.role === "user" ? { background: 'var(--gradient-brand)' } : {}}
              >
                {m.text}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-border bg-background px-4 py-2.5 text-sm text-muted-foreground">
                <span className="inline-flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:0.3s]" />
                </span>
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(q);
          }}
          className="mt-5 flex gap-2"
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g. Which fund has the best IRR?"
            className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="rounded-lg px-5 py-2.5 text-sm font-semibold text-brand-foreground"
            style={{ background: 'var(--gradient-brand)' }}
          >
            Send
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {sampleQuestions.map((s) => (
            <button
              key={s}
              onClick={() => ask(s)}
              className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
