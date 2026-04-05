import sha3 from "js-sha3";
const { keccak256: keccak256Fn } = sha3;

export function computeNamehashKeccak(name: string): string {
  let node = new Uint8Array(32);
  if (name === "") return "0x" + Buffer.from(node).toString("hex");
  const labels = name.split(".").reverse();
  for (const label of labels) {
    const labelHash = Buffer.from(keccak256Fn.arrayBuffer(new TextEncoder().encode(label)));
    const combined = new Uint8Array(64);
    combined.set(node, 0);
    combined.set(labelHash, 32);
    node = new Uint8Array(keccak256Fn.arrayBuffer(combined));
  }
  return "0x" + Buffer.from(node).toString("hex");
}
