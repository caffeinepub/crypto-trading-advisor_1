import { TrendingUp } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <footer className="mt-16 border-t border-border bg-[oklch(0.10_0.018_243)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-buy rounded-md flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-foreground text-lg">
                Crypto<span className="text-buy">Advisor</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Simulated cryptocurrency trading signals for educational purposes.
              Not financial advice. Always conduct your own research before
              investing.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">
              Features
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-foreground transition-colors cursor-pointer">
                Signal Dashboard
              </li>
              <li className="hover:text-foreground transition-colors cursor-pointer">
                Market Sentiment
              </li>
              <li className="hover:text-foreground transition-colors cursor-pointer">
                Portfolio Watchlist
              </li>
              <li className="hover:text-foreground transition-colors cursor-pointer">
                Technical Analysis
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">
              Legal
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-foreground transition-colors cursor-pointer">
                Disclaimer
              </li>
              <li className="hover:text-foreground transition-colors cursor-pointer">
                Privacy Policy
              </li>
              <li className="hover:text-foreground transition-colors cursor-pointer">
                Terms of Use
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>
            ⚠️ All signals are simulated. Not financial advice. Educational use
            only.
          </p>
          <p>
            © {year}.{" "}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-buy transition-colors"
            >
              Built with ❤️ using caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
