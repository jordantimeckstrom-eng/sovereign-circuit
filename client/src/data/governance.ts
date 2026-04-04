export interface Epoch {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'upcoming' | 'completed';
  totalBids: number;
  totalStaked: number;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  status: 'active' | 'passed' | 'rejected' | 'pending';
  votesFor: number;
  votesAgainst: number;
  epoch: number;
  createdAt: string;
}

export interface TimeBid {
  id: string;
  bidder: string;
  amount: number;
  epochId: number;
  timeSlot: string;
  status: 'pending' | 'accepted' | 'outbid';
  timestamp: string;
}

export const EPOCHS: Epoch[] = [
  {
    id: 1,
    name: "Genesis Epoch",
    startDate: "2026-01-01",
    endDate: "2026-01-07",
    status: "completed",
    totalBids: 42,
    totalStaked: 1250,
  },
  {
    id: 2,
    name: "Threshold Epoch",
    startDate: "2026-01-08",
    endDate: "2026-01-14",
    status: "completed",
    totalBids: 67,
    totalStaked: 2340,
  },
  {
    id: 3,
    name: "Binding Epoch",
    startDate: "2026-01-15",
    endDate: "2026-01-21",
    status: "completed",
    totalBids: 89,
    totalStaked: 3100,
  },
  {
    id: 4,
    name: "Sovereign Epoch",
    startDate: "2026-01-22",
    endDate: "2026-01-28",
    status: "completed",
    totalBids: 103,
    totalStaked: 4200,
  },
  {
    id: 5,
    name: "Dawn Epoch",
    startDate: "2026-02-01",
    endDate: "2026-02-28",
    status: "completed",
    totalBids: 56,
    totalStaked: 5800,
  },
  {
    id: 6,
    name: "Emergence Epoch",
    startDate: "2026-03-01",
    endDate: "2026-03-31",
    status: "active",
    totalBids: 0,
    totalStaked: 0,
  },
];

export interface StakedPosition {
  id: string;
  epochId: number;
  epochName: string;
  amountStaked: number;
  stakedAt: string;
  lockEndDate: string;
  status: 'locked' | 'unlockable' | 'unstaking';
  rewardsEarned: number;
  unstakeCooldown: number;
  stakeTxHash: string;
}

export interface TransactionRecord {
  id: string;
  type: 'stake' | 'unstake' | 'withdraw';
  amount: number;
  txHash: string;
  timestamp: string;
  epochName?: string;
  destination?: string;
  chain?: 'solana' | 'base';
  bridge?: string;
}

export const STAKED_POSITIONS: StakedPosition[] = [
  {
    id: "stake-1",
    epochId: 1,
    epochName: "Genesis Epoch",
    amountStaked: 25,
    stakedAt: "2026-01-02",
    lockEndDate: "2026-01-07",
    status: "unlockable",
    rewardsEarned: 1.8,
    unstakeCooldown: 0,
    stakeTxHash: "4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZAMdL4VZHirAn5GKRdNRfkLQg9bwn7e6TiPJErGT3bbDhmCXhj8u7QD2v",
  },
  {
    id: "stake-2",
    epochId: 2,
    epochName: "Threshold Epoch",
    amountStaked: 40,
    stakedAt: "2026-01-09",
    lockEndDate: "2026-01-14",
    status: "unlockable",
    rewardsEarned: 3.2,
    unstakeCooldown: 0,
    stakeTxHash: "2jE8T5fVzKhBx5pN9gvR3tFmQDwXkZA8rUVm1HcYpJnS4bCz6dEfG7hIjK9lMnO1pQrS2tUvW3xYzA4bCdEfG5h",
  },
  {
    id: "stake-3",
    epochId: 3,
    epochName: "Binding Epoch",
    amountStaked: 55,
    stakedAt: "2026-01-16",
    lockEndDate: "2026-01-21",
    status: "unlockable",
    rewardsEarned: 4.1,
    unstakeCooldown: 0,
    stakeTxHash: "3kF9U6gWLiCy6qO0hxS4uGnR4iFmRExYkZA8rUVm1HcYpJnS4bCz6dEfG7hIjK9lMnO1pQrS2tUvW3xYzA4bC",
  },
  {
    id: "stake-4",
    epochId: 5,
    epochName: "Dawn Epoch",
    amountStaked: 80,
    stakedAt: "2026-02-03",
    lockEndDate: "2026-02-28",
    status: "locked",
    rewardsEarned: 2.4,
    unstakeCooldown: 6,
    stakeTxHash: "5mH1W8iYNkEA8sQ2jzU6wIpT6kHnTGzAlBc9sVXn2JdZrLpT5cDz7fGhIjK0mNpO2qRtS3uVwX4yZaB5cDeF6g",
  },
];

export const PROPOSALS: Proposal[] = [
  {
    id: "prop-1",
    title: "Extend Dawn Epoch by 7 Days",
    description: "Proposal to extend the current Dawn Epoch to allow more participants to complete their binding ceremonies and submit time bids.",
    proposer: "7xKX...m4Dp",
    status: "rejected",
    votesFor: 34,
    votesAgainst: 12,
    epoch: 5,
    createdAt: "2026-02-10",
  },
  {
    id: "prop-2",
    title: "Reduce Minimum Bid Threshold",
    description: "Lower the minimum time bid from 10 SOL to 5 SOL to increase accessibility for new cohort members.",
    proposer: "3pYz...k8Rn",
    status: "passed",
    votesFor: 45,
    votesAgainst: 23,
    epoch: 5,
    createdAt: "2026-02-12",
  },
  {
    id: "prop-3",
    title: "Implement Dual-Path Attestation",
    description: "Add Anchor-based attestation alongside raw transaction attestation for ritual completion verification.",
    proposer: "9mBc...f2Wq",
    status: "passed",
    votesFor: 89,
    votesAgainst: 4,
    epoch: 4,
    createdAt: "2026-01-25",
  },
  {
    id: "prop-4",
    title: "Cohort Size Cap at 8",
    description: "Limit each cohort to (7+1) members as specified in the original protocol, maintaining intimate governance circles.",
    proposer: "5tHn...j7Lx",
    status: "passed",
    votesFor: 72,
    votesAgainst: 15,
    epoch: 3,
    createdAt: "2026-01-18",
  },
];
