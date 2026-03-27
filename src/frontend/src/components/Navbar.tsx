import { Input } from "@/components/ui/input";
import { Bell, Search, TrendingUp } from "lucide-react";

interface NavbarProps {
  activeView: "dashboard" | "watchlist";
  onViewChange: (view: "dashboard" | "watchlist") => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function Navbar({
  activeView,
  onViewChange,
  searchQuery,
  onSearchChange,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-[oklch(0.11_0.020_243/0.95)] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 bg-buy rounded-md flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-foreground text-lg tracking-tight hidden sm:block">
            Crypto<span className="text-buy">Advisor</span>
          </span>
        </div>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-1 ml-4">
          <button
            type="button"
            data-ocid="nav.dashboard.link"
            onClick={() => onViewChange("dashboard")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeView === "dashboard"
                ? "bg-buy/15 text-buy"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            Dashboard
          </button>
          <button
            type="button"
            data-ocid="nav.watchlist.link"
            onClick={() => onViewChange("watchlist")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeView === "watchlist"
                ? "bg-buy/15 text-buy"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            Watchlist
          </button>
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search */}
        <div className="relative w-48 sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input
            data-ocid="nav.search_input"
            type="text"
            placeholder="Search coins..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-8 text-sm bg-muted border-border rounded-full"
          />
        </div>

        {/* Bell */}
        <button
          type="button"
          data-ocid="nav.bell.button"
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* Mobile nav */}
        <div className="md:hidden flex gap-1">
          <button
            type="button"
            data-ocid="nav.mobile.dashboard.link"
            onClick={() => onViewChange("dashboard")}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeView === "dashboard"
                ? "bg-buy/15 text-buy"
                : "text-muted-foreground"
            }`}
          >
            Dashboard
          </button>
          <button
            type="button"
            data-ocid="nav.mobile.watchlist.link"
            onClick={() => onViewChange("watchlist")}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeView === "watchlist"
                ? "bg-buy/15 text-buy"
                : "text-muted-foreground"
            }`}
          >
            Watchlist
          </button>
        </div>
      </div>
    </header>
  );
}
