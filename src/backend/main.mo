import Text "mo:core/Text";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Migration "migration";

// Migration is specified in with-clause
(with migration = Migration.run)
actor {
  let supportedCoins = Set.fromArray(["BTC", "ETH", "ICP", "XRP", "BNB", "SOL", "ADA", "DOT", "AVAX", "MATIC", "LINK", "UNI", "AAVE", "FET", "XDC", "VET", "XLM", "KSM", "SAND", "ILV"]);

  let watchlist = Set.empty<Text>();
  let userData = Map.empty<Text, Text>();

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

  public shared ({ caller }) func saveUserData(accountKey : Text, dataKey : Text, json : Text) : async () {
    userData.add(accountKey # ":" # dataKey, json);
  };

  public query ({ caller }) func getUserData(accountKey : Text, dataKey : Text) : async ?Text {
    userData.get(accountKey # ":" # dataKey);
  };
};
