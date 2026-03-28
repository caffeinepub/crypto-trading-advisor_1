import Set "mo:core/Set";
import Map "mo:core/Map";
import Text "mo:core/Text";

module {
  type OldActor = {
    watchlist : Set.Set<Text>;
  };

  type NewActor = {
    watchlist : Set.Set<Text>;
    userData : Map.Map<Text, Text>;
  };

  public func run(old : OldActor) : NewActor {
    let userData = Map.empty<Text, Text>();
    { old with userData };
  };
};
