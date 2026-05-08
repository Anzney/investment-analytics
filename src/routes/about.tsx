import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card } from "@/components/UI";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About · Investment Agent" }] }),
  component: About,
});

const modules = [
  { num: "01", title: "Core Data Structures", desc: "Investment, PerformanceRecord, PortfolioSnapshot — type-safe Python dataclasses with AssetClass and Currency enums." },
  { num: "02", title: "Cambridge Associates Handler", desc: "Parses CA Excel exports (Fund Name, Vintage Year, Commitment, NAV, TVPI, IRR) and serves benchmark IRRs." },
  { num: "03", title: "Performance Analytics", desc: "TVPI, DPI, RVPI, MOIC, and scipy-brentq IRR. Portfolio rollup + asset-class breakdown + top/bottom performers." },
  { num: "04", title: "AI Agent (Claude)", desc: "Generates structured JSON insights, answers natural-language portfolio questions, and detects underperformance + concentration anomalies." },
  { num: "05", title: "Streamlit Dashboard", desc: "5 KPI cards, donut allocation, TVPI bar chart, AI insights panel, ask-AI box, full investments table." },
];

function About() {
  return (
    <div className="space-y-6">
      <PageHeader title="About this app" subtitle="What's under the hood" />

      <Card>
        <p className="text-sm leading-relaxed text-muted-foreground">
          This is a fully functional frontend for the <span className="text-foreground font-semibold">Investment Performance Agent</span> —
          a Python system designed for sophisticated family-office investors. It loads Cambridge Associates
          data, calculates institutional-grade private-market metrics (TVPI, DPI, IRR), generates AI-powered
          insights with Claude, and ships a Streamlit dashboard. This UI mirrors that flow in a clean,
          responsive web experience.
        </p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {modules.map((m) => (
          <Card key={m.num}>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-primary/30">{m.num}</span>
              <h3 className="font-semibold">{m.title}</h3>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{m.desc}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Tech Stack">
          <div className="flex flex-wrap gap-2">
            {["Python", "pandas", "numpy", "scipy", "Anthropic Claude", "Streamlit", "Plotly", "openpyxl", "Twilio", "Cambridge Associates"].map((t) => (
              <span key={t} className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                {t}
              </span>
            ))}
          </div>
        </Card>

        <Card title="This Frontend">
          <div className="flex flex-wrap gap-2">
            {["TanStack Start", "React 19", "TypeScript", "Tailwind CSS v4", "SVG charts", "Responsive", "SSR", "Dark theme"].map((t) => (
              <span key={t} className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                {t}
              </span>
            ))}
          </div>
        </Card>
      </div>

      {/* PROJECT STRUCTURE — commented out for client demo
      <Card title="📂 Project Structure">
        <pre className="overflow-x-auto rounded-lg border border-border bg-[oklch(0.13_0.02_250)] p-4 text-xs leading-relaxed text-[oklch(0.85_0.02_250)]">
{`investment_agent/
├── main.py
├── data_handlers/
│   ├── cambridge_handler.py
│   ├── excel_parser.py
│   └── pdf_parser.py
├── analytics/
│   ├── performance.py
│   └── benchmarking.py
├── ai/
│   ├── insights_agent.py
│   ├── qa_agent.py
│   └── anomaly_detector.py
├── delivery/
│   ├── dashboard.py
│   ├── whatsapp_sender.py
│   └── report_generator.py
├── models/
│   └── data_models.py
├── .env
└── requirements.txt`}
        </pre>
      </Card>
      */}
    </div>
  );
}
