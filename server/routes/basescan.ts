import type { Express, Request, Response } from "express";
import sha3 from "js-sha3";
const { keccak256: keccak256Fn } = sha3;

const BASE_RPC = "https://mainnet.base.org";

const SOVEREIGN_IDENTITY = {
  name: "jordaneckstrom.base.eth",
  address: "0x40ad9FA81fF51d738132C891fC7F95A555b3dA09",
  mintTx: "0xd61eb6483668e2fc8050575a70b22e24f42c82152e52210fd8fd27dcdd65d948",
  mintDate: "2026-02-13T11:58:00Z",
  status: "Complete",
};

function computeNamehashKeccak(name: string): string {
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

async function resolveSovereignIdentity() {
  try {
    const namehash = computeNamehashKeccak(SOVEREIGN_IDENTITY.name);
    const resolverAddr = "0xC6d566A56A1aFf6508b41f6c90ff131615583BCD";
    const addrSelector = "0x3b3b57de";
    const callData = addrSelector + namehash.slice(2);

    const result = await rpcCall("eth_call", [
      { to: resolverAddr, data: callData },
      "latest",
    ]);

    if (result && result !== "0x" && result !== "0x" + "0".repeat(64)) {
      SOVEREIGN_IDENTITY.address = "0x" + result.slice(26);
    }
  } catch (err) {
    console.log("Basename resolution attempted, using known identity data");
  }
}

async function rpcCall(method: string, params: any[] = []) {
  const res = await fetch(BASE_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params,
    }),
  });
  if (!res.ok) {
    throw new Error(`Base RPC error: ${res.status}`);
  }
  const data = await res.json();
  if (data.error) {
    throw new Error(data.error.message || "RPC error");
  }
  return data.result;
}

export function registerBasescanRoutes(app: Express) {
  resolveSovereignIdentity();

  app.get("/api/base/balance/:address", async (req: Request, res: Response) => {
    try {
      const addr = req.params.address;
      if (!/^0x[0-9a-fA-F]{40}$/.test(addr)) {
        res.status(400).json({ error: "Invalid address format" });
        return;
      }
      const result = await rpcCall("eth_getBalance", [addr, "latest"]);
      const balanceWei = BigInt(result);
      const whole = balanceWei / BigInt(1e18);
      const remainder = balanceWei % BigInt(1e18);
      const decimal = remainder.toString().padStart(18, "0").slice(0, 6);
      const balanceEth = `${whole}.${decimal}`;
      res.json({
        address: addr,
        balance: balanceEth,
        balanceWei: balanceWei.toString(),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/base/tx/:hash", async (req: Request, res: Response) => {
    try {
      const hash = req.params.hash;
      if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) {
        res.status(400).json({ error: "Invalid transaction hash format" });
        return;
      }
      const tx = await rpcCall("eth_getTransactionByHash", [hash]);
      if (!tx) {
        res.status(404).json({ error: "Transaction not found" });
        return;
      }
      const receipt = await rpcCall("eth_getTransactionReceipt", [hash]);
      const block = tx.blockNumber
        ? await rpcCall("eth_getBlockByNumber", [tx.blockNumber, false])
        : null;

      res.json({
        transaction: {
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: (() => {
            const val = BigInt(tx.value || "0x0");
            const w = val / BigInt(1e18);
            const r = val % BigInt(1e18);
            return `${w}.${r.toString().padStart(18, "0").slice(0, 6)}`;
          })(),
          blockNumber: tx.blockNumber ? parseInt(tx.blockNumber, 16) : null,
          gas: parseInt(tx.gas, 16),
          gasPrice: tx.gasPrice ? (parseInt(tx.gasPrice, 16) / 1e9).toFixed(4) : null,
          nonce: parseInt(tx.nonce, 16),
          status: receipt ? (receipt.status === "0x1" ? "success" : "failed") : "pending",
          gasUsed: receipt ? parseInt(receipt.gasUsed, 16) : null,
          timestamp: block ? parseInt(block.timestamp, 16) : null,
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/base/block/latest", async (_req: Request, res: Response) => {
    try {
      const block = await rpcCall("eth_getBlockByNumber", ["latest", false]);
      res.json({
        blockNumber: parseInt(block.number, 16),
        timestamp: parseInt(block.timestamp, 16),
        gasUsed: parseInt(block.gasUsed, 16),
        gasLimit: parseInt(block.gasLimit, 16),
        txCount: block.transactions.length,
        hash: block.hash,
        parentHash: block.parentHash,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/base/gasprice", async (_req: Request, res: Response) => {
    try {
      const result = await rpcCall("eth_gasPrice");
      const gasPriceWei = parseInt(result, 16);
      const gasPriceGwei = (gasPriceWei / 1e9).toFixed(4);
      res.json({ gasPriceWei, gasPriceGwei });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/base/txcount/:address", async (req: Request, res: Response) => {
    try {
      const addr = req.params.address;
      if (!/^0x[0-9a-fA-F]{40}$/.test(addr)) {
        res.status(400).json({ error: "Invalid address format" });
        return;
      }
      const result = await rpcCall("eth_getTransactionCount", [addr, "latest"]);
      res.json({
        address: addr,
        transactionCount: parseInt(result, 16),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/base/code/:address", async (req: Request, res: Response) => {
    try {
      const addr = req.params.address;
      if (!/^0x[0-9a-fA-F]{40}$/.test(addr)) {
        res.status(400).json({ error: "Invalid address format" });
        return;
      }
      const result = await rpcCall("eth_getCode", [addr, "latest"]);
      res.json({
        address: addr,
        isContract: result !== "0x",
        codeSize: result === "0x" ? 0 : (result.length - 2) / 2,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/base/basename/:name", async (req: Request, res: Response) => {
    try {
      const name = req.params.name as string;
      if (!name || name.length > 64 || !/^[a-zA-Z0-9._-]+$/.test(name)) {
        res.status(400).json({ error: "Invalid basename format" });
        return;
      }
      const fullName = name.endsWith(".base.eth") ? name : `${name}.base.eth`;

      if (fullName === SOVEREIGN_IDENTITY.name) {
        res.json({
          name: SOVEREIGN_IDENTITY.name,
          address: SOVEREIGN_IDENTITY.address,
          mintTx: SOVEREIGN_IDENTITY.mintTx,
          mintDate: SOVEREIGN_IDENTITY.mintDate,
          status: SOVEREIGN_IDENTITY.status,
        });
        return;
      }

      const namehash = computeNamehashKeccak(fullName);
      const resolverAddr = "0xC6d566A56A1aFf6508b41f6c90ff131615583BCD";
      const addrSelector = "0x3b3b57de";
      const callData = addrSelector + namehash.slice(2);

      const result = await rpcCall("eth_call", [
        { to: resolverAddr, data: callData },
        "latest",
      ]);

      if (!result || result === "0x" || result === "0x" + "0".repeat(64)) {
        res.status(404).json({ error: "Basename not found or not resolved" });
        return;
      }

      const address = "0x" + result.slice(26);
      res.json({
        name: fullName,
        address,
        mintTx: null,
        mintDate: null,
        status: "Active",
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/base/sovereign", (_req: Request, res: Response) => {
    res.json({
      name: SOVEREIGN_IDENTITY.name,
      address: SOVEREIGN_IDENTITY.address,
      mintTx: SOVEREIGN_IDENTITY.mintTx,
      mintDate: SOVEREIGN_IDENTITY.mintDate,
      status: SOVEREIGN_IDENTITY.status,
    });
  });
}

