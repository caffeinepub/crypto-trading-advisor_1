import Set "mo:core/Set";
import Text "mo:core/Text";

actor {
  let supportedCoins = Set.fromArray(["BTC", "ETH", "ICP", "XRP", "BNB", "SOL", "ADA", "DOT", "AVAX", "MATIC", "LINK", "UNI", "AAVE", "FET", "XDC", "VET", "XLM", "KSM", "SAND", "ILV"]);

  let watchlist = Set.empty<Text>();

  public shared ({ caller }) func addToWatchlist(symbol : Text) : async Bool {
    if (not supportedCoins.contains(symbol)) { return false };
    watchlist.add(symbol);
    true;
  };

  public shared ({ caller }) func removeFromWatchlist(symbol : Text) : async Bool {
    if (not watchlist.contains(symbol)) { return false };
    watchlist.remove(symbol);
    true;
  };

  public query ({ caller }) func getWatchlist() : async [Text] {
    watchlist.toArray();
  };
};
