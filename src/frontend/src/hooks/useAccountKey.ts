const ACCOUNT_KEY_STORAGE = "crypto_account_key";

export function getAccountKey(): string {
  let key = localStorage.getItem(ACCOUNT_KEY_STORAGE);
  if (!key) {
    key = crypto.randomUUID();
    localStorage.setItem(ACCOUNT_KEY_STORAGE, key);
  }
  return key;
}

export function setAccountKey(key: string): void {
  localStorage.setItem(ACCOUNT_KEY_STORAGE, key);
}
