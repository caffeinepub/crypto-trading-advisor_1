import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { type CoinData, getSignalColor } from "../data/coins";

interface WatchlistProps {
  coins: CoinData[];
  watchlist: string[];
  onRemove: (symbol: string) => void;
  onCoinClick: (coin: CoinData) => void;
}

export function Watchlist({
  coins,
  watchlist,
  onRemove,
  onCoinClick,
}: WatchlistProps) {
  const watched = coins.filter((c) => watchlist.includes(c.symbol));

  if (watched.length === 0) {
    return (
      <div
        data-ocid="watchlist.empty_state"
        className="bg-card border border-border rounded-xl p-12 text-center"
      >
        <div className="text-4xl mb-4">📋</div>
        <p className="text-lg font-semibold text-foreground mb-2">
          Your watchlist is empty
        </p>
        <p className="text-sm text-muted-foreground">
          Click on any coin in the Dashboard to add it to your watchlist.
        </p>
      </div>
    );
  }

  return (
    <div
      data-ocid="watchlist.table"
      className="bg-card border border-border rounded-xl overflow-hidden shadow-card"
    >
      <div className="px-5 py-4 border-b border-border">
        <h2 className="font-display font-bold text-foreground text-lg">
          My Portfolio Watchlist
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {watched.length} coins tracked
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
              Asset
            </TableHead>
            <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
              Price
            </TableHead>
            <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
              24h Change
            </TableHead>
            <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
              Signal
            </TableHead>
            <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
              Strength
            </TableHead>
            <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {watched.map((coin, i) => {
            const isPositive = coin.priceChange24h >= 0;
            const signalColor = getSignalColor(coin.signal);
            const priceFormatted =
              coin.currentPrice >= 1000
                ? `$${coin.currentPrice.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                : coin.currentPrice >= 1
                  ? `$${coin.currentPrice.toFixed(2)}`
                  : `$${coin.currentPrice.toFixed(4)}`;

            return (
              <TableRow
                key={coin.symbol}
                data-ocid={`watchlist.row.${i + 1}`}
                className="border-border hover:bg-muted/50 cursor-pointer"
                onClick={() => onCoinClick(coin)}
              >
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ background: coin.iconColor }}
                    >
                      {coin.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {coin.symbol}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {coin.name}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-mono font-semibold text-foreground text-sm">
                    {priceFormatted}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className="font-mono text-sm font-semibold"
                    style={{ color: isPositive ? "#22E17A" : "#FF4B4B" }}
                  >
                    {isPositive ? "+" : ""}
                    {coin.priceChange24h.toFixed(2)}%
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className="text-xs font-mono font-bold px-2 py-0.5 rounded-full"
                    style={{
                      color: signalColor,
                      background: `${signalColor}22`,
                    }}
                  >
                    {coin.signal}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm text-foreground">
                    {coin.signalStrength}%
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    data-ocid={`watchlist.delete_button.${i + 1}`}
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(coin.symbol);
                    }}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
