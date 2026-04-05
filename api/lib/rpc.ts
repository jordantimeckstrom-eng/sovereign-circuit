const BASE_RPC = "https://mainnet.base.org";

export async function rpcCall(method: string, params: any[] = []) {
  const res = await fetch(BASE_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  if (!res.ok) throw new Error(`Base RPC error: ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || "RPC error");
  return data.result;
}

export function weiToEth(weiHex: string): string {
  const balanceWei = BigInt(weiHex);
  const whole = balanceWei / BigInt(1e18);
  const remainder = balanceWei % BigInt(1e18);
  const decimal = remainder.toString().padStart(18, "0").slice(0, 6);
  return `${whole}.${decimal}`;
}
