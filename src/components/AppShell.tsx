import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { useState } from "react";

const nav = [
  { to: "/", label: "Dashboard", icon: "📊" },
  { to: "/investments", label: "Investments", icon: "💼" },
  { to: "/analytics", label: "Analytics", icon: "📈" },
  { to: "/insights", label: "AI Insights", icon: "🤖" },
  { to: "/reports", label: "Reports", icon: "📄" },
  { to: "/about", label: "About", icon: "ℹ️" },
] as const;

// SVG icons matching real-world dashboards
function PanelLeftIcon({ open }: { open: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {open ? (
        // panel-left-close
        <>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18" />
          <path d="m16 15-3-3 3-3" />
        </>
      ) : (
        // panel-left-open
        <>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18" />
          <path d="m14 9 3 3-3 3" />
        </>
      )}
    </svg>
  );
}

export default function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const loc = useLocation();

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "oklch(0.14 0.02 250)", color: "oklch(0.97 0.01 250)" }}>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ backgroundColor: "oklch(0 0 0 / 0.6)" }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ══════════════════════════════════
          SIDEBAR
      ══════════════════════════════════ */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex flex-col h-full
          transition-[width,transform] duration-200 ease-in-out
          lg:static lg:h-auto lg:shrink-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${collapsed ? "w-[60px]" : "w-[240px]"}
        `}
        style={{
          backgroundColor: "oklch(0.17 0.022 250)",
          borderRight: "1px solid oklch(0.28 0.025 250)",
        }}
      >
        {/* ── Logo area ── */}
        <div
          className="flex h-14 items-center shrink-0 px-3"
          style={{ borderBottom: "1px solid oklch(0.28 0.025 250)" }}
        >
          {/* Logo icon — always visible */}
          <div
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-bold"
            style={{ background: "var(--gradient-brand)", color: "oklch(0.14 0.02 250)" }}
          >
            IA
          </div>

          {/* Name — hidden when collapsed */}
          <div
            className="ml-3 overflow-hidden transition-all duration-200"
            style={{ width: collapsed ? 0 : "auto", opacity: collapsed ? 0 : 1 }}
          >
            <div className="whitespace-nowrap text-sm font-semibold" style={{ color: "oklch(0.97 0.01 250)" }}>
              Investment Agent
            </div>
            <div className="whitespace-nowrap text-[10px] font-medium uppercase tracking-widest" style={{ color: "oklch(0.5 0.02 250)" }}>
              Family Office
            </div>
          </div>
        </div>

        {/* ── Nav items ── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-0.5">
          {nav.map((n) => {
            const active = loc.pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? n.label : undefined}
                className={`
                  relative flex items-center gap-3 rounded-lg
                  text-sm font-medium transition-colors duration-150
                  ${collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"}
                `}
                style={
                  active
                    ? { background: "var(--gradient-brand)", color: "oklch(0.14 0.02 250)" }
                    : { color: "oklch(0.65 0.02 250)" }
                }
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "oklch(0.24 0.03 250)";
                    (e.currentTarget as HTMLAnchorElement).style.color = "oklch(0.97 0.01 250)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "";
                    (e.currentTarget as HTMLAnchorElement).style.color = "oklch(0.65 0.02 250)";
                  }
                }}
              >
                <span className="shrink-0 text-base leading-none">{n.icon}</span>
                {!collapsed && (
                  <span className="truncate">{n.label}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ══════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════ */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* ── Top header ── */}
        <header
          className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between px-4"
          style={{
            backgroundColor: "oklch(0.14 0.02 250 / 0.9)",
            borderBottom: "1px solid oklch(0.28 0.025 250)",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Left: sidebar toggle */}
          <div className="flex items-center gap-3">
            {/* Desktop: panel toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:grid h-8 w-8 place-items-center rounded-md transition-colors duration-150"
              style={{ color: "oklch(0.55 0.02 250)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.24 0.03 250)";
                (e.currentTarget as HTMLElement).style.color = "oklch(0.97 0.01 250)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "";
                (e.currentTarget as HTMLElement).style.color = "oklch(0.55 0.02 250)";
              }}
              title={collapsed ? "Open sidebar" : "Close sidebar"}
              aria-label="Toggle sidebar"
            >
              <PanelLeftIcon open={!collapsed} />
            </button>

            {/* Mobile: hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="grid lg:hidden h-8 w-8 place-items-center rounded-md transition-colors duration-150"
              style={{ color: "oklch(0.55 0.02 250)" }}
              aria-label="Toggle nav"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <span className="hidden text-sm lg:block" style={{ color: "oklch(0.5 0.02 250)" }}>
              Welcome back ·{" "}
              <span style={{ color: "oklch(0.97 0.01 250)" }}>Portfolio overview</span>
            </span>
          </div>

          {/* Right: avatar with dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="grid h-8 w-8 place-items-center rounded-full text-xs font-bold transition-opacity hover:opacity-80"
              style={{ background: "var(--gradient-brand)", color: "oklch(0.14 0.02 250)" }}
              aria-label="User menu"
            >
              FO
            </button>

            {/* Dropdown */}
            {profileOpen && (
              <>
                {/* Click outside to close */}
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div
                  className="absolute right-0 top-10 z-50 w-52 rounded-xl py-1 shadow-xl"
                  style={{
                    backgroundColor: "oklch(0.20 0.025 250)",
                    border: "1px solid oklch(0.30 0.025 250)",
                  }}
                >
                  {/* User info */}
                  <div className="px-4 py-3" style={{ borderBottom: "1px solid oklch(0.28 0.025 250)" }}>
                    <div className="text-sm font-semibold" style={{ color: "oklch(0.97 0.01 250)" }}>Family Office</div>
                    <div className="text-xs mt-0.5" style={{ color: "oklch(0.55 0.02 250)" }}>Administrator</div>
                  </div>

                  {/* Menu items */}
                  {[
                    { icon: "👤", label: "Profile" },
                    { icon: "⚙️", label: "Settings" },
                  ].map((item) => (
                    <button
                      key={item.label}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                      style={{ color: "oklch(0.75 0.02 250)" }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.26 0.03 250)";
                        (e.currentTarget as HTMLElement).style.color = "oklch(0.97 0.01 250)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = "";
                        (e.currentTarget as HTMLElement).style.color = "oklch(0.75 0.02 250)";
                      }}
                      onClick={() => setProfileOpen(false)}
                    >
                      <span>{item.icon}</span>
                      {item.label}
                    </button>
                  ))}

                  {/* Sign out */}
                  <div style={{ borderTop: "1px solid oklch(0.28 0.025 250)", marginTop: "4px", paddingTop: "4px" }}>
                    <button
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                      style={{ color: "oklch(0.65 0.22 25)" }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.65 0.22 25 / 0.1)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = "";
                      }}
                      onClick={() => setProfileOpen(false)}
                    >
                      <span>🚪</span>
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
