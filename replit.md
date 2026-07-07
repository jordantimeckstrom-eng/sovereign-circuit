# JUSCR-FreeForAll — Time Governance dApp

## Overview
A time governance dApp built on the Sovereign Circuit framework. Combines participatory governance, community project funding, time auction calendar, sovereign tribes, curriculum, and AI-guided sovereign design into a unified interface. Includes the Golden Thread Protocol, Ouroboros Ward, Sovereign Tribes system, and the Just Us School of Sovereign Design.

## Project Architecture
- `client/` - React + Vite + TypeScript frontend application
  - `src/pages/` - Dashboard, Governance, Calendar, CommunityProjects, Tribes, Curriculum, Whitepaper, GoldenThread, OuroborosWard, Reflection, JustUsSchool pages
  - `src/components/` - Layout with navigation
  - `src/data/` - Curriculum lessons, whitepaper sections, governance epochs/proposals, goldenthread, ouroboros, tribes
  - `src/styles/` - Global CSS with dark/gold sovereign theme
- `server/` - Express backend server
  - `server/index.ts` - Main Express server with Vite middleware
  - `server/db.ts` - Drizzle ORM database connection
  - `server/routes/basescan.ts` - Base chain RPC API routes (balance, txcount, code, basename, sovereign identity, block, gas)
  - `server/replit_integrations/` - Gemini AI chat and image routes
- `shared/` - Shared types and database schema
  - `shared/models/chat.ts` - Drizzle schema for conversations and messages
- `portal/JustusWithusMaybeYoutoo/` - Original static reflection portal (integrated into dApp)
- `JUSCR/main/SpineAlignTime/` - Ouroboros Triple-Entry Temple (standalone HTML app)
  - `index.html` - Full temple with Ant Design UI, LedgerContext, triple-entry bidding, dawn/dusk scheduler, Solana anchor, Sentinel, WebSocket listener
  - `listener.html` - Lightweight LedgerBridge listener feed
- `AllTimeContract/` - Smart contract source (GovernUniversal Shield Protocol)

## Key Features
- **Dashboard**: Epoch tracker with live countdown, system stats, quick links to Calendar and Community Projects, Dawn Activation Protocol
- **Time Auction Calendar**: 8 weekly time slots (2 x 3hr blocks, 4 days/week), bid on time blocks in USD, weekly goals released each Sunday, 50% of revenue funds Community Projects
- **Community Projects**: Submit community needs, vote on priorities, projects sorted by vote count, funded by 50% of time auction revenue
- **Time Governance**: Epoch management, governance proposals with voting (on-chain features suspended pending API verification)
- **Curriculum**: 4-lesson interactive module (The Master Interface) with progress tracking
- **Whitepaper**: Master Interface as a Sovereign Ritual System - synthesis document with 15 expanded sections
- **Golden Thread Protocol**: Origin story, Four Books, A/B Rhythm, Do Better Week, Three Realms, AI Archetypes, ceremonies, Inverted Reality Wheel, Teacher/Student Framework
- **Ouroboros Ward**: Architectural analysis of idempotency, race conditions, MVA pattern, deployment artifacts
- **Just Us School**: AI-guided sovereign protocol builder with Three Pillars, Protocol Builder, and AI Sovereign Guide chat
- **Sovereign Tribes**: Tribe system with 6 tribes, member tracking (7+1 cap), treasury display, tribe events feed, tribe founding
- **Echo Chamber**: Reflection system with gentle inversions (from original portal)
- **SpineAlignTime Temple**: Ouroboros Triple-Entry Temple with LedgerContext reducer, triple-entry hash receipts, dawn/dusk ceremony scheduler, Solana anchor toggle, global LedgerBridge API, WebSocket email ingestion listener, Sentinel test harness, Framework synthesis panel, and 22-Frame Wheel expansion (Point + Earth 7 + Heaven 7 + Hell 7 sovereign sub-ledgers with per-frame bidding and dual-chain anchors)

## Suspended Features (Coming Soon)
- Multi-chain wallet connection (TRON/Solana via Solflare) — suspended until API keys verified
- Staking/unstaking/cross-chain withdraw — suspended until integrity verified
- Shield Protocol (GovernUniversal smart contract) — suspended
- Time auction bidding in crypto (SOL) — replaced with USD bidding for now

## Deployment
### Replit
- Workflow: `npm run dev` (Express + Vite middleware) on port 5000
- Published via Replit autoscale deployment

### Vercel
- GitHub repo: `jordantimeckstrom-eng/sovereign-circuit`
- `api/` directory contains serverless functions mirroring Express routes
- `api/lib/` shared utilities (rpc.ts, namehash.ts, db.ts, ai.ts, sovereign.ts)
- `vercel.json` configures build, rewrites, CORS headers, and function timeouts
- Frontend builds from `client/` to `client/dist/`
- SpineAlignTime static assets in `client/public/spine-align-time/`
- Environment variables needed on Vercel: `DATABASE_URL`, `GEMINI_API_KEY`

## Tech Stack
- React 18, TypeScript, Vite, React Router v6
- Express 5 (Replit dev), Vercel serverless functions (production)
- Drizzle ORM, PostgreSQL (Neon)
- Gemini AI via Replit AI Integrations or standard Gemini API key
- CSS Modules with dark/gold sovereign theme (Crimson Pro + Inter fonts)

## Design System
- Background: #0A0A12 (deep navy-black)
- Gold accent: #C9A84C
- Ivory text: #F5F0E1
- Fonts: Crimson Pro (headings), Inter (body)

## Dependencies
- js-sha3: keccak256 for ENS-compatible Basename namehash computation

## Universal Ceremonial Access (LedgerContext)
- `client/src/context/LedgerContext.tsx` — global state with bids, ghosts, dawn/dusk counts, chain count, signal status. Reducer actions: `INGEST_BID`, `DIGEST_GHOST`, `INCREMENT_DAWN/DUSK/CHAIN`, `EVOLVE_SYSTEM`, `SET_SIGNALR`. Persists to localStorage.
- `client/src/context/LedgerBridge.ts` — exposes dispatch globally so non-React code (email webhooks, schedulers, external API listeners) can dispatch ceremonies. Browser console: `window.__sovereignLedger.ingestBid({...})`.
- `client/src/services/ceremonyScheduler.ts` — auto-fires dawn/dusk ceremonies at 6am/6pm, syncs every minute.
- `LedgerProvider` wraps the app in `client/src/main.tsx`.

## Sovereign Circuit Unified Page (`/circuit`)
- `client/src/pages/SovereignCircuit.tsx` — single-page interface with 7 tabs: Zenith dashboard, SpineAlign protocols, Phoenix Fortress (1132-step alignment counter), Time Auction, Tribes (6 corner archetypes), The School (Sarai chat via Gemini streaming), Live Ledger (universal ceremonial access feed).
- All tabs read/write the shared LedgerContext — bids placed in Time Auction appear in Live Ledger; SpineAlign engagements digest as ghosts; Fortress commits increment chainCount.

## Human Network Whitepaper (`/human-network`)
- `client/src/pages/HumanNetwork.tsx` — summary of Holonym Foundation's threshold network paper. Covers VOPRF, ElGamal decryption on ZK-friendly curves, n/t-quorums, DKG, Feldman VSS, Lagrange interpolation, DLEQ proofs. Positioned as the identity substrate for Sovereign Circuit.

## Real-Time Ledger Platform
- `server/realtime/gateway.ts` — WebSocket gateway attached to the Express HTTP server at path `/ws/ledger` (via `noServer` upgrade handling so it never collides with Vite HMR). On connect, sends a full history snapshot; relays published actions to all other clients (excludes sender to avoid double-apply); persists every action to Postgres.
- `server/routes/ledger.ts` — REST parity: `GET /api/ledger/snapshot` (full shared state) and `POST /api/ledger/event` (persist + broadcast; also usable by external webhooks/schedulers).
- `shared/models/ledger.ts` — `ledger_events` table (eventId unique for idempotent dedup, kind, action, jsonb payload, createdAt) as the shared source of truth.
- `client/src/services/realtimeClient.ts` — WS client with auto-reconnect and REST-polling fallback. `wrapDispatch` publishes locally-originated syncable actions (`INGEST_BID`, `DIGEST_GHOST`, `INCREMENT_DAWN/DUSK/CHAIN`); remote actions apply via raw dispatch (no re-publish). Counters hydrate from server aggregation (not incremental replay) so they never double-count.
- LedgerProvider wires wrapped dispatch to consumers + the global bridge, and passes raw dispatch to the realtime client. `signalRConnected` reflects live WS status.
- Vercel: `api/lib/ledger.ts` + `api/ledger/snapshot.ts` + `api/ledger/event.ts` provide REST persistence in serverless (WebSockets are not supported on Vercel serverless, so production clients use the polling fallback).

## Recent Changes
- Jul 2026: Wired the `/rhythm` 7-Day view to real ledger data (bids + timestamped events grouped by real calendar day). Built the real-time ledger platform — WebSocket gateway (`/ws/ledger`) + Postgres persistence (`ledger_events`) + REST snapshot/event endpoints, with client auto-reconnect and polling fallback. Ledger activity (bids, ceremonies, reflections) now syncs live across all connected clients.
- Apr 2026: Added `/circuit` unified Sovereign Circuit page (Zenith/SpineAlign/Fortress/Auction/Tribes/School/Ledger), LedgerContext + LedgerBridge for universal ceremonial access, ceremony scheduler, `/human-network` whitepaper page summarizing Holonym threshold cryptography
- Apr 2026: Restructured for Vercel — `api/` directory with serverless functions, `vercel.json` config, GitHub repo `jordantimeckstrom-eng/sovereign-circuit`
- Mar 2026: Bug fixes — fixed division-by-zero in governance vote bar, corrected stale epoch data (Dawn→completed, Emergence→active, proposals updated), added Initiate Tribe button handler, improved wallet disconnect with sessionStorage flag to prevent auto-reconnect
- Mar 2026: Added 22-Frame Wheel to SpineAlignTime Temple — 22 sovereign sub-ledgers (Point, Earth x7, Heaven x7, Hell x7) with per-frame bidding, dual-chain anchors (Solana + Ethereum), realm-colored cards, detail modals
- Mar 2026: Added SpineAlignTime Ouroboros Triple-Entry Temple — merged temple UI + Sentinel listener, served at `/spine-align-time`, accessible from nav
- Feb 2026: Re-enabled Base chain integration — Base Explorer, MetaMask wallet connection (Base mainnet only), Basename identity bond
- Feb 2026: Added sovereign identity bond to Dashboard (`jordaneckstrom.base.eth`, address `0x40ad9FA81fF51d738132C891fC7F95A555b3dA09`)
- Feb 2026: Base API routes with input validation: balance, txcount, code, basename resolution, sovereign identity, block/latest, gasprice
- Feb 2026: Added Time Auction Calendar page (8 slots, 2x3hr blocks, 4 days/week, starting March 2 2026)
- Feb 2026: Added Community Projects page (submit needs, vote on priorities, 50% auction revenue funding)
- Feb 2026: Suspended Solana/TRON/Solflare wallet connections, staking, cross-chain withdraw pending API verification
- Feb 2026: Updated Dashboard to reference Calendar and Community Projects instead of crypto stats
- Feb 2026: Trimmed Governance to Epochs + Proposals only, added "coming soon" notice for on-chain features
