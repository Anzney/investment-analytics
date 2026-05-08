import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { portfolio, tvpi, dpi, fmt } from "@/lib/portfolio";
import { PageHeader, Card, Badge } from "@/components/UI";

export const Route = createFileRoute("/investments")({
  head: () => ({ meta: [{ title: "Investments · Investment Agent" }] }),
  component: Investments,
});

function Investments() {
  const [q, setQ] = useState("");
  const [asset, setAsset] = useState<string>("All");
  const [sort, setSort] = useState<"tvpi" | "irr" | "contributed" | "name">("tvpi");

  const assets = ["All", ...Array.from(new Set(portfolio.map((p) => p.assetClass)))];

  const filtered = useMemo(() => {
    let list = portfolio.map((i) => ({ ...i, tvpiVal: tvpi(i), dpiVal: dpi(i) }));
    if (q) list = list.filter((i) => (i.name + i.manager + i.geography).toLowerCase().includes(q.toLowerCase()));
    if (asset !== "All") list = list.filter((i) => i.assetClass === asset);
    list.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "contributed") return b.contributed - a.contributed;
      if (sort === "irr") return b.irr - a.irr;
      return b.tvpiVal - a.tvpiVal;
    });
    return list;
  }, [q, asset, sort]);

  return (
    <div className="space-y-6">
      <PageHeader title="All Investments" subtitle={`${filtered.length} of ${portfolio.length} shown`} />

      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="🔍 Search by name, manager, geography…"
            className="min-w-[200px] flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <select
            value={asset}
            onChange={(e) => setAsset(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            {assets.map((a) => <option key={a}>{a}</option>)}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "tvpi" | "irr" | "contributed" | "name")}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="tvpi">Sort: TVPI</option>
            <option value="irr">Sort: IRR</option>
            <option value="contributed">Sort: Size</option>
            <option value="name">Sort: Name</option>
          </select>
        </div>
      </Card>

      {/* Desktop table */}
      <Card className="hidden overflow-hidden p-0 lg:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left">Investment</th>
                <th className="px-5 py-3 text-left">Asset Class</th>
                <th className="px-5 py-3 text-left">Geography</th>
                <th className="px-5 py-3 text-right">Contributed</th>
                <th className="px-5 py-3 text-right">NAV</th>
                <th className="px-5 py-3 text-right">Distributed</th>
                <th className="px-5 py-3 text-right">TVPI</th>
                <th className="px-5 py-3 text-right">IRR</th>
                <th className="px-5 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr key={i.id} className="border-t border-border transition-colors hover:bg-muted/30">
                  <td className="px-5 py-3">
                    <div className="font-medium">{i.name}</div>
                    <div className="text-xs text-muted-foreground">{i.manager} · {i.vintageYear}</div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{i.assetClass}</td>
                  <td className="px-5 py-3 text-muted-foreground">{i.geography}</td>
                  <td className="px-5 py-3 text-right font-mono text-xs">{fmt(i.contributed)}</td>
                  <td className="px-5 py-3 text-right font-mono text-xs">{fmt(i.nav)}</td>
                  <td className="px-5 py-3 text-right font-mono text-xs">{fmt(i.distributed)}</td>
                  <td className={`px-5 py-3 text-right font-semibold ${i.tvpiVal >= 1 ? "text-primary" : "text-destructive"}`}>
                    {i.tvpiVal.toFixed(2)}x
                  </td>
                  <td className={`px-5 py-3 text-right ${i.irr >= 0 ? "text-primary" : "text-destructive"}`}>
                    {(i.irr * 100).toFixed(1)}%
                  </td>
                  <td className="px-5 py-3 text-center">
                    <Badge tone={i.isActive ? "good" : "neutral"}>{i.isActive ? "Active" : "Closed"}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile cards */}
      <div className="grid gap-3 lg:hidden">
        {filtered.map((i) => (
          <Card key={i.id}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate font-semibold">{i.name}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {i.manager} · {i.geography} · {i.vintageYear}
                </div>
              </div>
              <Badge tone={i.tvpiVal >= 1 ? "good" : "bad"}>{i.tvpiVal.toFixed(2)}x</Badge>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div>
                <div className="text-muted-foreground">Invested</div>
                <div className="mt-0.5 font-mono">{fmt(i.contributed)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">NAV</div>
                <div className="mt-0.5 font-mono">{fmt(i.nav)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">IRR</div>
                <div className={`mt-0.5 font-semibold ${i.irr >= 0 ? "text-primary" : "text-destructive"}`}>
                  {(i.irr * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <Badge>{i.assetClass}</Badge>
              <Badge tone={i.isActive ? "good" : "neutral"}>{i.isActive ? "Active" : "Closed"}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
