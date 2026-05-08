export type Investment = {
  id: string;
  name: string;
  assetClass: "Private Equity" | "Venture Capital" | "Real Estate" | "Fixed Income" | "Hedge Fund" | "Listed Equity";
  vintageYear: number;
  manager: string;
  geography: string;
  currency: "USD" | "SAR" | "INR" | "AED" | "GBP";
  contributed: number;
  distributed: number;
  nav: number;
  irr: number;
  isActive: boolean;
};

export const portfolio: Investment[] = [
  { id: "1", name: "KKR Asian Fund IV", assetClass: "Private Equity", vintageYear: 2019, manager: "KKR", geography: "Asia", currency: "USD", contributed: 5_000_000, distributed: 2_000_000, nav: 7_500_000, irr: 0.24, isActive: true },
  { id: "2", name: "Sequoia India Growth", assetClass: "Venture Capital", vintageYear: 2020, manager: "Sequoia", geography: "India", currency: "USD", contributed: 3_000_000, distributed: 500_000, nav: 6_000_000, irr: 0.35, isActive: true },
  { id: "3", name: "Dubai Real Estate Fund", assetClass: "Real Estate", vintageYear: 2018, manager: "Emaar Capital", geography: "UAE", currency: "AED", contributed: 4_000_000, distributed: 3_000_000, nav: 3_500_000, irr: 0.14, isActive: true },
  { id: "4", name: "Emerging Markets Bond", assetClass: "Fixed Income", vintageYear: 2021, manager: "PIMCO", geography: "Global EM", currency: "USD", contributed: 2_000_000, distributed: 800_000, nav: 1_600_000, irr: 0.07, isActive: true },
  { id: "5", name: "Tech Growth Fund III", assetClass: "Private Equity", vintageYear: 2017, manager: "Silver Lake", geography: "USA", currency: "USD", contributed: 6_000_000, distributed: 8_000_000, nav: 4_000_000, irr: 0.28, isActive: true },
  { id: "6", name: "London Prime REIT", assetClass: "Real Estate", vintageYear: 2019, manager: "Blackstone", geography: "UK", currency: "GBP", contributed: 3_500_000, distributed: 1_200_000, nav: 4_100_000, irr: 0.11, isActive: true },
  { id: "7", name: "Bridgewater Pure Alpha", assetClass: "Hedge Fund", vintageYear: 2020, manager: "Bridgewater", geography: "Global", currency: "USD", contributed: 4_000_000, distributed: 600_000, nav: 4_800_000, irr: 0.09, isActive: true },
  { id: "8", name: "Saudi Vision PE Fund", assetClass: "Private Equity", vintageYear: 2022, manager: "PIF Partners", geography: "KSA", currency: "SAR", contributed: 5_500_000, distributed: 200_000, nav: 5_900_000, irr: 0.06, isActive: true },
  { id: "9", name: "S&P 500 Index Mandate", assetClass: "Listed Equity", vintageYear: 2018, manager: "Vanguard", geography: "USA", currency: "USD", contributed: 8_000_000, distributed: 1_500_000, nav: 11_500_000, irr: 0.13, isActive: true },
  { id: "10", name: "Mumbai Logistics Fund", assetClass: "Real Estate", vintageYear: 2021, manager: "Embassy", geography: "India", currency: "INR", contributed: 2_500_000, distributed: 300_000, nav: 2_900_000, irr: 0.10, isActive: true },
  { id: "11", name: "Africa Growth Capital", assetClass: "Venture Capital", vintageYear: 2019, manager: "Helios", geography: "Africa", currency: "USD", contributed: 1_500_000, distributed: 100_000, nav: 900_000, irr: -0.08, isActive: true },
  { id: "12", name: "Gulf Energy Direct", assetClass: "Private Equity", vintageYear: 2016, manager: "Direct", geography: "UAE", currency: "AED", contributed: 4_500_000, distributed: 6_500_000, nav: 2_200_000, irr: 0.22, isActive: false },
];

// ── Metric calculations ──
export const tvpi = (i: Investment) => (i.distributed + i.nav) / i.contributed;
export const dpi = (i: Investment) => i.distributed / i.contributed;
export const rvpi = (i: Investment) => i.nav / i.contributed;
export const moic = (i: Investment) => (i.distributed + i.nav) / i.contributed;

export type PortfolioMetrics = {
  totalInvested: number;
  totalNav: number;
  totalDistributed: number;
  totalValue: number;
  portfolioTvpi: number;
  portfolioDpi: number;
  unrealisedGl: number;
  realisedGl: number;
  byAssetClass: Record<string, { invested: number; currentValue: number; count: number }>;
  byGeography: Record<string, number>;
  topPerformers: (Investment & { tvpi: number })[];
  underperformers: (Investment & { tvpi: number })[];
  count: number;
};

export function calculateMetrics(items: Investment[]): PortfolioMetrics {
  const totalInvested = items.reduce((s, i) => s + i.contributed, 0);
  const totalNav = items.reduce((s, i) => s + i.nav, 0);
  const totalDistributed = items.reduce((s, i) => s + i.distributed, 0);
  const totalValue = totalNav + totalDistributed;

  const byAssetClass: PortfolioMetrics["byAssetClass"] = {};
  const byGeography: Record<string, number> = {};
  for (const i of items) {
    if (!byAssetClass[i.assetClass]) byAssetClass[i.assetClass] = { invested: 0, currentValue: 0, count: 0 };
    byAssetClass[i.assetClass].invested += i.contributed;
    byAssetClass[i.assetClass].currentValue += i.nav;
    byAssetClass[i.assetClass].count += 1;
    byGeography[i.geography] = (byGeography[i.geography] || 0) + i.contributed;
  }

  const ranked = items.map((i) => ({ ...i, tvpi: tvpi(i) }));
  return {
    totalInvested,
    totalNav,
    totalDistributed,
    totalValue,
    portfolioTvpi: totalInvested ? (totalDistributed + totalNav) / totalInvested : 0,
    portfolioDpi: totalInvested ? totalDistributed / totalInvested : 0,
    unrealisedGl: totalNav - (totalInvested - totalDistributed),
    realisedGl: totalDistributed - (totalInvested - totalNav),
    byAssetClass,
    byGeography,
    topPerformers: [...ranked].sort((a, b) => b.tvpi - a.tvpi).slice(0, 5),
    underperformers: [...ranked].sort((a, b) => a.tvpi - b.tvpi).slice(0, 3),
    count: items.length,
  };
}

export function detectAnomalies(items: Investment[], metrics: PortfolioMetrics) {
  const flags: { type: string; severity: "HIGH" | "MEDIUM" | "LOW"; investment: string; message: string }[] = [];
  for (const inv of items) {
    const t = tvpi(inv);
    if (t < 0.8) {
      flags.push({
        type: "UNDERPERFORMANCE",
        severity: "HIGH",
        investment: inv.name,
        message: `${inv.name} TVPI is ${t.toFixed(2)}x — significantly below 1.0x. Consider reviewing with manager.`,
      });
    }
    const share = inv.contributed / metrics.totalInvested;
    if (share > 0.15) {
      flags.push({
        type: "CONCENTRATION",
        severity: share > 0.2 ? "HIGH" : "MEDIUM",
        investment: inv.name,
        message: `${inv.name} represents ${(share * 100).toFixed(1)}% of portfolio — concentration risk.`,
      });
    }
  }
  return flags;
}

export const benchmarks: Record<string, { "1Y": number; "3Y": number; "5Y": number; "10Y": number }> = {
  "Private Equity": { "1Y": 0.18, "3Y": 0.21, "5Y": 0.17, "10Y": 0.15 },
  "Venture Capital": { "1Y": 0.22, "3Y": 0.25, "5Y": 0.2, "10Y": 0.18 },
  "Real Estate": { "1Y": 0.12, "3Y": 0.14, "5Y": 0.11, "10Y": 0.1 },
  "Hedge Fund": { "1Y": 0.08, "3Y": 0.09, "5Y": 0.08, "10Y": 0.07 },
  "Fixed Income": { "1Y": 0.05, "3Y": 0.06, "5Y": 0.05, "10Y": 0.04 },
  "Listed Equity": { "1Y": 0.12, "3Y": 0.14, "5Y": 0.12, "10Y": 0.1 },
};

export const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
export const fmtCompact = (n: number) => {
  if (Math.abs(n) >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
  if (Math.abs(n) >= 1e3) return "$" + (n / 1e3).toFixed(1) + "K";
  return "$" + n.toFixed(0);
};
