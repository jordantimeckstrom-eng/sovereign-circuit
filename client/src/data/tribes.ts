export interface Tribe {
  id: string;
  name: string;
  sigil: string;
  description: string;
  founder: string;
  members: number;
  maxMembers: number;
  epoch: number;
  status: 'active' | 'forming' | 'sealed';
  protocol: string;
  createdAt: string;
  treasury: number;
  chain: 'TRON' | 'Solana';
}

export interface TribeEvent {
  id: string;
  tribeId: string;
  type: 'ritual' | 'vote' | 'bid' | 'shield' | 'initiation';
  description: string;
  timestamp: string;
  actor: string;
}

export const TRIBES: Tribe[] = [
  {
    id: "tribe-sovereign",
    name: "The Sovereign Circuit",
    sigil: "◈",
    description: "The origin tribe. Architects of the Master Interface and keepers of the binding protocol. Every governance epoch begins here.",
    founder: "TB9s...1E",
    members: 7,
    maxMembers: 8,
    epoch: 1,
    status: "active",
    protocol: "Full Sovereignty — Ghost Mode + Accountability dual-shield",
    createdAt: "2026-01-01",
    treasury: 12400,
    chain: "TRON",
  },
  {
    id: "tribe-dawn",
    name: "Dawn Collective",
    sigil: "☀",
    description: "Sunrise ritualists committed to daily activation protocols. They govern the temporal boundaries of each epoch and anchor the system clock.",
    founder: "7xKX...m4Dp",
    members: 5,
    maxMembers: 8,
    epoch: 3,
    status: "active",
    protocol: "Temporal Sovereignty — Dawn-bound governance cycles",
    createdAt: "2026-01-15",
    treasury: 5800,
    chain: "Solana",
  },
  {
    id: "tribe-ouroboros",
    name: "Ouroboros Guard",
    sigil: "🐍",
    description: "Wardens of idempotency and protectors against duplicate invocations. They maintain the integrity of the sovereign mark across all tribes.",
    founder: "3pYz...k8Rn",
    members: 4,
    maxMembers: 8,
    epoch: 4,
    status: "active",
    protocol: "Ward Protocol — Duplicate prevention + race condition shields",
    createdAt: "2026-01-22",
    treasury: 3200,
    chain: "TRON",
  },
  {
    id: "tribe-golden",
    name: "Golden Thread Weavers",
    sigil: "🧵",
    description: "Storytellers and archivists weaving the narrative thread through every protocol decision. They maintain the A/B Rhythm and the 22-Frame Wheel.",
    founder: "9mBc...f2Wq",
    members: 6,
    maxMembers: 8,
    epoch: 2,
    status: "active",
    protocol: "Narrative Sovereignty — Story-driven governance",
    createdAt: "2026-01-08",
    treasury: 7100,
    chain: "Solana",
  },
  {
    id: "tribe-echo",
    name: "Echo Seekers",
    sigil: "🔮",
    description: "Reflectors and mirror-holders. They practice gentle inversion and maintain the Echo Chamber as a space for sovereign self-inquiry.",
    founder: "5tHn...j7Lx",
    members: 3,
    maxMembers: 8,
    epoch: 5,
    status: "forming",
    protocol: "Reflection Protocol — Mirror-based consensus",
    createdAt: "2026-02-05",
    treasury: 1500,
    chain: "TRON",
  },
  {
    id: "tribe-forge",
    name: "The Forge",
    sigil: "🔥",
    description: "Builders and deployers. Where sovereign spaces are hammered into existence. Every protocol designed in the School finds its first test here.",
    founder: "TB9s...1E",
    members: 2,
    maxMembers: 8,
    epoch: 5,
    status: "forming",
    protocol: "Builder Protocol — Ship-first governance",
    createdAt: "2026-02-15",
    treasury: 800,
    chain: "TRON",
  },
];

export const TRIBE_EVENTS: TribeEvent[] = [
  {
    id: "evt-1",
    tribeId: "tribe-sovereign",
    type: "ritual",
    description: "Dawn Activation Protocol completed — all 7 members bound",
    timestamp: "2026-02-19T06:00:00Z",
    actor: "TB9s...1E",
  },
  {
    id: "evt-2",
    tribeId: "tribe-dawn",
    type: "vote",
    description: "Proposal to extend Dawn Epoch passed with 5/5 consensus",
    timestamp: "2026-02-18T14:30:00Z",
    actor: "7xKX...m4Dp",
  },
  {
    id: "evt-3",
    tribeId: "tribe-ouroboros",
    type: "shield",
    description: "Ghost Mode activated — duplicate invocation blocked",
    timestamp: "2026-02-17T22:15:00Z",
    actor: "3pYz...k8Rn",
  },
  {
    id: "evt-4",
    tribeId: "tribe-sovereign",
    type: "bid",
    description: "Time bid of 500 TRX submitted for Epoch 5 governance slot",
    timestamp: "2026-02-16T10:00:00Z",
    actor: "TB9s...1E",
  },
  {
    id: "evt-5",
    tribeId: "tribe-forge",
    type: "initiation",
    description: "The Forge tribe initiated — sovereign space forging begins",
    timestamp: "2026-02-15T08:00:00Z",
    actor: "TB9s...1E",
  },
  {
    id: "evt-6",
    tribeId: "tribe-golden",
    type: "ritual",
    description: "22-Frame Wheel rotation completed — new narrative cycle begins",
    timestamp: "2026-02-14T12:00:00Z",
    actor: "9mBc...f2Wq",
  },
];
