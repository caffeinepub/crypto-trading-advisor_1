import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface backendInterface {
    addToWatchlist(symbol: string): Promise<boolean>;
    getWatchlist(): Promise<Array<string>>;
    removeFromWatchlist(symbol: string): Promise<boolean>;
}
