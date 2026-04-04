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

## Running
- Workflow: `npm run dev` (runs Express server with Vite middleware) on port 5000
- Express serves API routes and Vite dev server in middleware mode
- Database: PostgreSQL via Drizzle ORM (conversations + messages for AI chat)

## Tech Stack
- React 18, TypeScript, Vite, React Router v6
- Express 5, Drizzle ORM, PostgreSQL (Neon)
- Gemini AI via Replit AI Integrations (no API key needed)
- CSS Modules with dark/gold sovereign theme (Crimson Pro + Inter fonts)

## Design System
- Background: #0A0A12 (deep navy-black)
- Gold accent: #C9A84C
- Ivory text: #F5F0E1
- Fonts: Crimson Pro (headings), Inter (body)

## Dependencies
- js-sha3: keccak256 for ENS-compatible Basename namehash computation

## Recent Changes
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
