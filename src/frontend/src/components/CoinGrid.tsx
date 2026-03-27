import type { CoinData } from "../data/coins";
import { CoinCard } from "./CoinCard";

interface CoinGridProps {
  coins: CoinData[];
  onCoinClick: (coin: CoinData) => void;
}

export function CoinGrid({ coins, onCoinClick }: CoinGridProps) {
  if (coins.length === 0) {
    return (
      <div
        data-ocid="coins.empty_state"
        className="text-center py-16 text-muted-foreground"
      >
        <p className="text-lg font-semibold">No coins found</p>
        <p className="text-sm mt-1">Try a different search term</p>
      </div>
    );
  }

  return (
    <div
      data-ocid="coins.list"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      {coins.map((coin, i) => (
        <CoinCard
          key={coin.symbol}
          coin={coin}
          index={i + 1}
          onClick={() => onCoinClick(coin)}
        />
      ))}
    </div>
  );
}
