export interface OuroborosSection {
  id: string;
  title: string;
  icon: string;
  content: string;
  subsections?: { title: string; content: string }[];
}

export const OUROBOROS_SECTIONS: OuroborosSection[] = [
  {
    id: "deconstruction",
    title: "Deconstruction of the Duplicate Ward",
    icon: "🐍",
    content:
      "The \"enchantment\" described is a precise and recognized architectural pattern for achieving idempotency within an event-driven, poll-based integration workflow. This section deconstructs its components to validate the design.",
    subsections: [
      {
        title: "The Rite's Vein: Lookup → Filter → Create",
        content:
          "The core logic — Summon Lookup... Filter halts... Create Row's seal — is a well-established design pattern for preventing duplicate entries in Google Sheets via Zapier. The described \"rite\" follows this exact methodology:\n\n1. Trigger: A new email arrives in Gmail.\n2. Lookup Spreadsheet Row: The Zap searches the Google Sheet (the \"eternal log\") for a unique identifier.\n3. Filter by Zapier: The Zap inspects the output of the \"Lookup\" step.\n4. Create Spreadsheet Row: This action only runs if the Filter's conditions are met (i.e., no duplicate was found).\n\nThis pattern is a robust and necessary workaround for implementing data integrity checks within the platform. The \"enchantment\" is, in effect, the poetic codification of a technical best practice.",
      },
      {
        title: "Filter's Thorned Kiss: The _zap_data_was_found_ Boolean",
        content:
          "When a \"Lookup Spreadsheet Row\" action is performed, its primary output is not just the row data (if found) but a critical metadata field: _zap_data_was_found_. This is a simple boolean (true or false) that indicates the success or failure of the search.\n\nThe \"Filter by Zapier\" tool is explicitly designed to act upon these boolean outputs. The \"ward's\" design — to halt the Zap if _zap_data_was_found_ is true — is the correct and intended implementation. The boolean true (a \"twin\" is found) triggers the \"halt,\" and the boolean false (a \"virgin bid\") allows passage.",
      },
      {
        title: "The Ward as Stateful Control in a Stateless System",
        content:
          "The architectural significance of this \"ward\" lies in its ability to graft a stateful, idempotent control layer onto an inherently stateless platform.\n\nA standard Zapier workflow is event-driven and stateless. The \"Ouroboros Test\" Bid Log (the Google Sheet) is being leveraged as a persistent, external state store. The \"enchantment\" transforms the Zap into a classic stateful system by implementing a Read-Decide-Write cycle:\n\n• Read: The Lookup action reads the current state from the external log.\n• Decide: The Filter action makes a decision based on the data that was read.\n• Write: The Create Row action updates the state by etching a new, unique entry.\n\nThis transforms the \"fire-and-forget\" Zap into a state-aware, idempotent system. By \"devouring twins,\" the \"ward\" ensures that the bid-logging operation is idempotent — a significant architectural fortification.",
      },
    ],
  },
  {
    id: "sovereign-mark",
    title: "The Sovereign Mark: Key Integrity",
    icon: "🔑",
    content:
      "The entire \"ward\" is fortified by the \"sovereign mark\" — the unique key used for the Lookup action. The strength of this key defines the strength of the \"ward.\"",
    subsections: [
      {
        title: "The Flaw of Sender + Timestamp",
        content:
          "Rating: Poor\n\nThis key is the weakest and should be discarded. A timestamp is not a guaranteed unique identifier, especially in a \"frenzy's cascade.\" It is highly conceivable that multiple bids from a single sender could be processed within the same polling interval, potentially sharing the same timestamp. This key is not \"sovereign\" and would fail under a \"surge.\"",
      },
      {
        title: "The Redundancy of senderEmail-messageId",
        content:
          "Rating: Good\n\nThe composite key is functional but architecturally redundant. The Gmail Message ID is, by definition, unique within that user's inbox. Since the Zap is bound to a single Gmail account, the message_id is already an atomic, unique identifier for the trigger event. Prefixing it with the senderEmail adds no additional uniqueness.",
      },
      {
        title: "The True Sovereign Mark: Gmail Message ID",
        content:
          "Rating: Excellent (if fortified)\n\nThe \"sovereign mark\" must be the Gmail Message ID (e.g., 1672749667872724050). This is Google's internal, immutable ID for the message. It is the atomic unit of the trigger event and is the same ID that Zapier's internal trigger-level deduplication system relies on.",
      },
      {
        title: "A Crack in the Ward: The Vulnerability",
        content:
          "The Gmail Message ID possesses a documented, critical vulnerability. Community reports indicate that the Raw Payload Header Message ID is not always populated by the Gmail trigger.\n\nThis presents a silent, catastrophic failure mode:\n1. A valid bid arrives, but the trigger data is missing the Message ID.\n2. The Lookup key is now blank. It finds nothing. _zap_data_was_found_ is false.\n3. The Create Row action \"etches\" a new row with a blank Message ID.\n4. A second valid bid arrives, also missing its Message ID.\n5. The Lookup searches for (blank). This time, it finds the first blank row. _zap_data_was_found_ is true.\n6. The Filter halts the Zap.\n\nResult: A valid bid is \"devoured\" and \"spat to shadow,\" mistaken for a \"twin.\" This corrupts the log and silently discards valid data.",
      },
    ],
  },
  {
    id: "frenzy-cascade",
    title: "The Frenzy's Cascade: Stress Test",
    icon: "⚡",
    content:
      "The \"merciless test\" is critical. This section examines polling intervals, race conditions, and the shift from parallel to sequential execution.",
    subsections: [
      {
        title: "The Nature of the Frenzy: Polling and Parallelism",
        content:
          "The \"vigilant hound\" is Zapier's polling trigger, which checks the Gmail API for new data at a regular interval (between 1 and 15 minutes). The \"frenzy's cascade\" occurs when a single poll finds multiple new items. Zapier's default behavior is to trigger multiple zap runs at the same time. These runs are processed in parallel, asynchronously. This is the \"cascade\": a simultaneous \"surge\" of Zaps, not a sequential queue.",
      },
      {
        title: "Modeling the True Vulnerability: The Race Condition",
        content:
          "The Lookup → Filter → Create logic, when executed in parallel, is not atomic and is vulnerable to a race condition:\n\n• T=0.0s: Zap Run 1 (for bid-ABC) performs Lookup(bid-ABC). The log is empty. Returns false.\n• T=0.1s: Zap Run 2 (for the same bid-ABC) performs Lookup(bid-ABC). The log is still empty. Returns false.\n• T=1.0s: Zap Run 1 proceeds past Filter and performs Create Row(bid-ABC). Bid is \"swallowed.\"\n• T=1.1s: Zap Run 2 also proceeds (its Lookup was false) and performs Create Row(bid-ABC).\n\nFailure: The \"ward\" is breached. A duplicate is \"etched.\" The \"ward\" only functions if the Lookup-Filter-Create cycle is atomic, which in a parallel system, it is not.",
      },
      {
        title: "Delay's Breath: A Flawed Mitigation",
        content:
          "The \"Delay After Queue\" action is a rate-limiter, not a true \"mutex\" (mutual exclusion lock). It \"tames\" the frenzy by spacing out the cascade, reducing load on APIs, but it does not solve the race condition. As documented: \"The Delay After Queue action does not guarantee that the steps following it will never run simultaneously.\"",
      },
      {
        title: "The Veil Thins: Sequential Execution",
        content:
          "A fundamental, platform-wide change at Zapier: \"Beginning in July, we will begin updating your Zaps to use sequential execution. We will deprecate parallel execution and make sequential execution the only option.\"\n\nThis is a paradigm shift. If the account has been migrated to sequential execution, the race condition is no longer possible. In this model, if a poll finds Bid-A, Bid-B, and Bid-C, they are executed sequentially. This de facto makes the \"ward\" atomic (per poll) and renders the \"Delay's breath\" redundant. The \"ward\" holds.",
      },
    ],
  },
  {
    id: "ouroboros-exegesis",
    title: "The Ouroboros as Self-Referential System",
    icon: "🔄",
    content:
      "The designation \"Ouroboros Test\" is not mere metaphor; it is a highly precise technical descriptor for the system's architecture, reflecting a self-referential system and a continuous feedback loop.",
    subsections: [
      {
        title: "The Ouroboros as Feedback Loop",
        content:
          "The Ouroboros, an ancient symbol of a serpent consuming its own tail, represents an eternal cycle of renewal. The system's output (the data written by Create Row) becomes the direct input for its own gating mechanism (the data read by Lookup Row). The serpent's head (Create) is only permitted to act after checking its own tail (Lookup). This is a classic feedback loop essential for maintaining system robustness and stability.",
      },
      {
        title: "The Ouroboros as Continuous Integration (CI/CD)",
        content:
          "The \"ward\" is a data integrity unit test built directly into a data CI/CD pipeline:\n\n• The Pipeline: The flow of data (bids) from \"development\" (Gmail) to \"production\" (the Google Sheet Log).\n• The Test: The \"ward\" (the Lookup → Filter logic) is an automated quality gate that runs on every \"commit\" (every new email).\n• The Result: If the test \"fails\" (the bid is a duplicate), the \"build\" is \"broken\" (the Zap halts).\n\n\"Ouroboros Test\" is the most accurate name: the system is the test, and the test is the system.",
      },
      {
        title: "Self-Referential Computation",
        content:
          "In computation, the Ouroboros symbolizes self-referential systems — a process that refers to itself. Some programming languages are even named Ouroboros because they are designed to define themselves. The \"ward\" makes the Bid Log a self-referential system: its future state is explicitly a function of its own prior state.",
      },
    ],
  },
  {
    id: "mva-heart",
    title: "The MVA's Heart: Mediating Controller",
    icon: "💜",
    content:
      "The claim that \"The graft fortifies the MVA's heart\" is a precise architectural statement. The \"graft\" is the \"ward\" (the deduplication logic). \"MVA\" refers to the Model-View-Adapter design pattern.",
    subsections: [
      {
        title: "Model-View-Adapter Pattern",
        content:
          "The MVA pattern enforces a strict separation between Model and View. Unlike traditional MVC, the Model and View do not communicate directly. All communication must flow through a mediating controller or adapter.\n\nThis perfectly describes the Zapier workflow:\n• The Model: The \"Ouroboros Test\" Bid Log (Google Sheet) — the internal representations of information.\n• The View: The Gmail Inbox — the interface that presents information.\n• The Adapter: The Zapier workflow itself — the mediating controller with knowledge of both Model and View.\n\nThe \"ward\" logic is a \"graft\" of idempotency (a business rule) onto the \"heart\" (the core data-transfer logic) of this Adapter.",
      },
      {
        title: "Minimum Viable Architecture",
        content:
          "MVA also stands for Minimum Viable Architecture — a framework that relies on testing assumptions with small experiments to build a flexible, iterative system. The mock test is a \"small experiment\" to validate the foundational architecture.\n\nSynthesis: While the process of building the \"ward\" aligns with Minimum Viable Architecture (MVA), the resulting technical design is a textbook example of Model-View-Adapter (MVA). The latter is the more profound and accurate architectural insight.",
      },
    ],
  },
  {
    id: "fortifications",
    title: "Fortifying the Ward",
    icon: "🏰",
    content:
      "Recommendations for a production-grade system. The \"ward\" is well-designed but can be \"fortified\" to be truly \"merciless\" against the \"alt surge\" of production load.",
    subsections: [
      {
        title: "6.1 Fortify the Sovereign Mark",
        content:
          "The crack (blank Message ID) must be sealed.\n\n• Standardize on the Gmail Message ID as the sole \"sovereign mark\" in Column E.\n• Add a new \"Filter by Zapier\" step immediately after the Gmail trigger (before the Lookup).\n• Filter Logic: Only continue if... (Message ID) → (Text) → (Exists).\n\nThis new filter acts as a guard, ensuring that any trigger event without a Message ID is halted before it can interact with the log.",
      },
      {
        title: "6.2 Confirm Execution Model",
        content:
          "Investigate the Zap's run history and account settings to determine the execution model.\n\n• If Sequential: No further action is needed. The \"frenzy\" is already tamed.\n• If Parallel: The \"Delay After Queue\" is the correct throttle, but it is an imperfect mitigation.",
      },
      {
        title: "6.3 The True Atomic Ward: Storage Mutex Lock",
        content:
          "To make the \"ward\" impervious to any race condition, implement a double ward:\n\n1. Trigger (Gmail)\n2. Filter (Check for Message ID Exists) → Guard 1\n3. Storage by Zapier → Get Value (Key: lock-${Message ID})\n4. Filter (Halt if found from Storage is true) → Guard 2 (atomic lock)\n5. Storage by Zapier → Set Value (Key: lock-${Message ID}, Value: true) → Seal the lock\n6. Google Sheets → Lookup Row (Key: Message ID)\n7. Filter (Halt if found from Sheets is true) → Guard 3 (fail-safe)\n8. Google Sheets → Create Row\n\nThis \"double ward\" is a production-grade, \"merciless\" solution invulnerable to race conditions.",
      },
      {
        title: "6.4 Formalize Monitoring: Give Voice to the Ghosts",
        content:
          "Use \"Paths by Zapier\" to create a formal \"Ghost\" path for filtered bids:\n\n• Path A (_zap_data_was_found_ is false): → Create Row (the \"soft milk\").\n• Path B (_zap_data_was_found_ is true): → The \"Ghost\" path.\n  • Storage by Zapier → Increment Value (Key: ghost_attempts_total).\n  • Create Row (in a separate \"Ghost Log\" sheet) to record the full payload of the \"devoured\" twin.\n\nThis provides the exact data needed to analyze the \"alt surge.\"",
      },
      {
        title: "6.5 The Bloated Ledger: Next Bottleneck",
        content:
          "As the Bid Log grows, the Lookup action will become the system's next bottleneck.\n\n• Phase 1: Replace Google Sheets Lookup with Zapier Tables — first-party tool designed for high-speed lookups.\n• Phase 2: Migrate the \"Model\" to a proper database (e.g., Airtable or cloud SQL) with a UNIQUE constraint on message_id. This makes data duplication an impossibility at the database level.",
      },
    ],
  },
  {
    id: "distributed-state",
    title: "The Labyrinth of Distributed State",
    icon: "🌐",
    content:
      "The synthesis of distributed systems reveals a fundamental convergence in how state is managed, protected, and finalized across serverless automation (Zapier) and decentralized blockchain (Solana) environments.",
    subsections: [
      {
        title: "The Illusion of Determinism",
        content:
          "In an ideal computing environment, a function f(x) executed at time t1 produces the same result at t2, provided internal state remains constant. However, in distributed systems — whether a Zapier workflow processing webhooks or a Solana validator processing transactions — state is never constant, and time is never synchronized.\n\nBoth the Ouroboros Ward and the Time Auction dApp operate as distributed state machines. They receive inputs, process them according to business logic, and mutate a shared state. The 'Labyrinth' is the gap between intent (the user clicking a button) and finality (the database updating). In this gap lies the potential for duplication.",
      },
      {
        title: "The Existential Threat: Parallelism",
        content:
          "The primary threat to both systems is not malicious hacking, but the inherent chaos of asynchronous communication.\n\nZapier's Threat: A webhook is not a singular event. If the receiving server doesn't acknowledge receipt, the sender retries, resulting in the same event arriving twice.\n\nSolana's Threat: A user submits a transaction. If the network is congested, the client might not receive confirmation. The user clicks 'Bid' again. Without strict idempotency guards, the smart contract might process the bid twice.",
      },
      {
        title: "The Ouroboros Concept in State Management",
        content:
          "In mythology, the Ouroboros is the snake eating its own tail, representing infinity or recursion. In this architectural context, it represents the recursive nature of automation loops.\n\nIf this loop is not 'warded' (protected), it collapses. The infinite loop becomes a denial-of-service attack against oneself. The architecture must introduce a 'break' in the circle — a distinct check that prevents the snake from consuming itself.\n\nThis is achieved through Idempotency: the property where an operation can be applied multiple times without changing the result beyond the initial application.",
      },
    ],
  },
  {
    id: "atomic-locking",
    title: "Atomic Locking & Mutex Implementation",
    icon: "🔒",
    content:
      "The 'Check-then-Act' race condition cannot be solved by standard steps. It requires Atomic Locking — the core upgrade to the Ouroboros Ward.",
    subsections: [
      {
        title: "The Mutex Pattern",
        content:
          "A Mutex (Mutual Exclusion) ensures that only one execution thread can access the resource at a time.\n\nThe Atomic Lock Protocol:\n1. Acquire Lock: Attempt to set a key to the current timestamp, only if currently empty or expired.\n2. The Atomic Write: Instead of 'Search then Write,' try to write immediately using a method that fails if it exists.\n3. Decision: If result is false, STOP — the duplicate execution thread dies.\n4. Execution: Only the first thread survives to proceed with business logic.\n\nThis eliminates the race window. The check and the write happen in the same atomic cycle.",
      },
      {
        title: "The StoreClient Compare-And-Swap",
        content:
          "The critical primitive for a mutex is set_value_if(key, value, previous_value). It sets a key to a new value only if the current value matches previous_value.\n\nThis mimics the 'Compare-And-Swap' (CAS) instruction found in low-level CPU architectures — the standard way to implement locks in concurrent programming.\n\nEven if two processes start at the exact same millisecond, only one set_value_if call will succeed. The other safely exits.",
      },
      {
        title: "Production-Ready Atomic Guard (JavaScript)",
        content:
          "const StoreClient = require('store-client');\nconst store = StoreClient(process.env.STORE_SECRET);\nconst messageId = inputData.message_id;\n\n// 1. The Null Gate\nif (!messageId) {\n  await store.increment('ghost_events');\n  return { status: 'skipped', reason: 'null_id' };\n}\n\n// 2. The Atomic Guard (Mutex)\nconst isNew = await store.set_value_if(\n  messageId, new Date().toISOString(), null\n);\n\nif (!isNew) {\n  // 3. The Replay Detector\n  await store.increment('duplicate_prevented');\n  return { status: 'skipped', reason: 'duplicate' };\n}\n\n// 4. Success - The Lock is Held\nreturn { status: 'success', id: messageId };",
      },
    ],
  },
  {
    id: "solana-architecture",
    title: "Solana Time Auction Architecture",
    icon: "⛓",
    content:
      "The 'Ouroboros Ward' takes a different form in the Solana ecosystem: the Program Derived Address (PDA). Here, idempotency prevents financial loss and ensures fair market mechanics.",
    subsections: [
      {
        title: "The PDA as Sentinel",
        content:
          "A PDA is an account whose address is calculated deterministically from seeds and the Program ID. It has no private key; only the program can sign for it.\n\nIf we structure PDA seeds as ['bid', auction_key, bidder_key], we mathematically enforce that only one bid account can exist per user per auction.\n\nWhen the user invokes place_bid, the Anchor framework derives the address. If the account already exists, the init constraint fails. This is 'Encryption-grade Idempotency' — the blockchain literally cannot allocate the space twice.",
      },
      {
        title: "The High Bidder State Guard",
        content:
          "Rejecting transactions where previous_bid >= incoming_bid is a state transition constraint. It prevents regression, not just duplicates.\n\n#[account(\n  mut,\n  seeds = [b\"auction\", auction_id.key().as_ref()],\n  bump,\n  constraint = bid_amount > auction_state.highest_bid\n    @ AuctionError::BidTooLow\n)]\npub auction_state: Account<'info, AuctionState>\n\nBy placing the check in the constraint, logic is offloaded to the deserialization phase. If it fails, the transaction is rejected before the main instruction logic runs, saving compute units.",
      },
      {
        title: "Client-Side Guards: The In-Flight Ledger",
        content:
          "While the blockchain is secure, the frontend must provide the UX of idempotency.\n\n1. Generate Signature: When the user signs, capture the transaction signature.\n2. Optimistic Update: Immediately gray out the button and show a spinner.\n3. The Watcher: Use connection.confirmTransaction(tx_sig, 'confirmed').\n\nStatus Levels:\n- processed: Validator has seen it (rollback risk: high)\n- confirmed: 66% of stake voted (rollback risk: low)\n- finalized: 31+ confirmations (risk: zero)\n\nThis prevents the 'Double-Click' attack.",
      },
      {
        title: "init_if_needed and Replay Protection",
        content:
          "Solana's runtime prevents transaction replay via the recent_blockhash mechanism. Every transaction includes a blockhash valid for ~150 blocks (~1 minute).\n\nHowever, 'logical' replay is possible. The PDA Defense enforces a singleton constraint. The Logic Defense ensures submitting the same bid again fails because the state has not advanced. This is 'semantic idempotency.'",
      },
    ],
  },
  {
    id: "unified-map",
    title: "The Unified Architectural Map",
    icon: "🗺",
    content:
      "The Zapier Ouroboros and the Solana Time Auction are isomorphs of the same distributed truth. This map reveals how they rhyme across every architectural dimension.",
    subsections: [
      {
        title: "The Architectural Isomorphism",
        content:
          "The Trigger: Webhook (HTTP) / Transaction (RPC) — Input is asynchronous and unreliable.\nThe Key: Message-ID (String) / PDA Seeds (Byte Array) — Identity must be derived from intent itself.\nThe State: Zapier Storage / On-Chain Account Data — State is the only source of truth.\nThe Guard: store.set_value_if() / #[account(init,...)] — Atomic checks must precede mutation.\nThe Conflict: Race Condition (Parallel Zaps) / Write Contention (Parallel Tx) — Simultaneous intent requires a tie-breaker.\nThe Resolution: First-Write-Wins (Mutex) / Block Ordering (Sealevel) — Only one history can exist.",
      },
      {
        title: "The Rhyme of Idempotency",
        content:
          "In both systems, Idempotency is Salvation. It collapses the 'quantum superposition' of multiple user intents into a single, canonical reality.\n\nIn Zapier, we use Storage Locks to collapse the wave function of parallel webhooks.\nIn Solana, we use PDAs and Constraints to collapse the wave function of parallel transactions.\n\nBoth systems are 'Distributed State Machines pretending to be deterministic.' The upgrade path lies in stripping away the pretense and enforcing the determinism at the ingress point.",
      },
      {
        title: "The Law of True Idempotency",
        content:
          "Intent must be accepted, acknowledged, and reflected exactly once, regardless of the chaotic nature of the delivery network.\n\nBy moving from 'passive' checks (searching a spreadsheet, checking a frontend variable) to 'active, atomic' constraints (Zapier Mutex, Solana Constraints), we upgrade from a system that hopes for uniqueness to one that enforces it.",
      },
    ],
  },
  {
    id: "ghost-detector",
    title: "The Ghost Detector — Advanced Observability",
    icon: "👻",
    content:
      "In distributed systems, silence is not health. A system that stops receiving bad data might also have stopped receiving any data. The Ghost Detector expands monitoring from simple counts to full observability.",
    subsections: [
      {
        title: "Ghost Metrics",
        content:
          "Metric 1 — The Null-ID Ratio: Track null_events / total_events. A sudden shift indicates a change in the event source.\n\nMetric 2 — The Lock Contention Rate: Track duplicate_prevented / total_successful_locks.\nHigh Rate (>10%): Indicates severe upstream 'jitter' — webhooks firing multiple times rapidly.\nZero Rate: Might indicate the lock logic is broken or the upstream is perfectly 'exactly-once' (rare).",
      },
      {
        title: "The Pulse Zap",
        content:
          "Create a scheduled Zap (runs every hour) that:\n1. Reads metric values from StoreClient.\n2. Sends them to a monitoring tool (Datadog, Grafana, or a simple Google Sheet log).\n3. Resets the counters.\n\n'The Ward repelled 45 ghosts this week.'",
      },
      {
        title: "The Rhyme of Observability",
        content:
          "Zapier: We count 'rejected ghosts' to ensure our filter is working.\nSolana: We count 'failed transactions' to ensure our constraints are holding.\n\nIn both cases, we monitor the perimeter defense of the state machine. The metrics prove the Ward is active and repelling entropy.\n\nThis transforms the system from a 'black box' into a 'glass box' — visible and verifiable.",
      },
    ],
  },
  {
    id: "upgrade-roadmap",
    title: "Implementation Roadmap",
    icon: "🚀",
    content:
      "The step-by-step upgrade plan for transitioning from 'implied determinism' to 'enforced idempotency' across both the Zapier Ouroboros Ward and the Solana Time Auction.",
    subsections: [
      {
        title: "Phase 1: The Audit (Week 1)",
        content:
          "Zapier: Audit all Zaps. Identify every trigger. Does it have a Message-ID? If not, what unique composite key can be constructed?\n\nSolana: Audit the Anchor program. Verify every #[account] struct. Are seeds defined for every PDA? Are mut and signer constraints strictly applied?",
      },
      {
        title: "Phase 2: The Foundation (Week 2-3)",
        content:
          "Zapier: Deploy the Atomic Guard script to a staging Zap. Stress-test by sending 100 concurrent webhooks. Verify exactly 1 success and 99 'duplicate' logs.\n\nSolana: Implement init_if_needed and constraint logic on Devnet. Write a client script that spams bids. Verify no double-spends or race-condition overwrites.",
      },
      {
        title: "Phase 3: The Migration (Week 4)",
        content:
          "Zapier: Switch production Zaps to use the Code Step Guard. Enable the 'Dead Letter' sheet for rejected IDs.\n\nSolana: Deploy the new Program ID. Migrate UI to use the 'In-Flight Ledger' pattern (Optimistic Updates).",
      },
      {
        title: "Phase 4: The Observation (Ongoing)",
        content:
          "Establish the 'Pulse' dashboards. Monitor the Ghost Counters. Tune the lock TTLs (for Zapier) or the CU budgets (for Solana) based on real-world data.\n\nThe shared law: The intent is recorded if and only if the state permits the transition.",
      },
    ],
  },
  {
    id: "angelscript-api",
    title: "SuperCool Ouroboros Integration System",
    icon: "🔑",
    content:
      "The AngelScript API-Key Utility module for the Ouroboros Integration System. A lightweight system for issuing, validating, listing, and revoking API keys used by the integration layer.",
    subsections: [
      {
        title: "Architecture Overview",
        content:
          "The SuperCoolOuroboros namespace provides a complete API-Key lifecycle manager built in AngelScript.\n\nComponents:\n- generateRandomString(): LCG pseudo-random key generator using a 62-character charset.\n- ApiKey class: Stores key, owner, issuedAt, and revokedAt timestamps with an isActive() check.\n- ApiKeyManager class: Full lifecycle management — issue, validate, revoke, inspect, and list keys.\n\nUsage:\n  ApiKeyManager manager;\n  string newKey = manager.issueKey('research-node-42');\n  bool accepted = manager.validateKey(newKey);\n  manager.revokeKey(newKey);",
      },
      {
        title: "Key Generation",
        content:
          "Keys are generated using a Linear Congruential Generator (LCG) with constants (a=1664525, c=1013904223) seeded from the current timestamp.\n\nThe charset includes uppercase, lowercase, and digits (62 characters). Default key length is 40 characters. The manager ensures uniqueness by regenerating if a collision is detected in the dictionary.",
      },
      {
        title: "Lifecycle Operations",
        content:
          "issueKey(ownerId, length): Generates a unique key, stores it with owner and timestamp, returns the key string.\n\nvalidateKey(key): Returns true only if the key exists AND has not been revoked (revokedAt == 0).\n\nrevokeKey(key): Sets the revokedAt timestamp, permanently deactivating the key. Returns false if already revoked.\n\ngetKeyInfo(key, info): Retrieves the full ApiKey object for inspection.\n\nlistKeys(activeOnly): Returns an array of all keys, optionally filtered to active-only.",
      },
      {
        title: "Integration with the Ward",
        content:
          "The API-Key system serves as the authentication layer for the Ouroboros Integration System. Every external system that interacts with the Ward must present a valid key.\n\nThis creates a layered defense:\n1. Authentication: Is the caller authorized? (ApiKeyManager.validateKey)\n2. Idempotency: Has this event been processed? (The Atomic Guard)\n3. State Transition: Is this mutation valid? (Constraint checks)\n\nThe key manager's revocation system also enables the Ghost Mode shield — revoking access silently without notification.",
      },
    ],
  },
  {
    id: "phoenix-monitor",
    title: "The Phoenix Monitor System",
    icon: "🐦‍🔥",
    content:
      "The Phoenix Monitor is a background daemon that listens to the Solana blockchain for specific 'Ritual' events. It bridges the on-chain world with the infrastructure layer, watching for ImmortalizePatron events and triggering the Ouroboros Key Manager.",
    subsections: [
      {
        title: "Architecture",
        content:
          "The phoenix-monitor.ts is a TypeScript background worker — not a web server. It doesn't listen on a port; instead, it reaches out to the RPC URL to pull logs from the blockchain.\n\nTarget Program ID: TiMeFUXyR9nTgmiiQgx3wH2qzoyMiY5G4seySXMA9pP\n\nThe monitor watches for specific event signatures in transaction logs, extracts patron wallet addresses using regex parsing (/Patron:?\\s+.../), and triggers the key issuance pipeline.",
      },
      {
        title: "The Docker Infrastructure",
        content:
          "The production environment runs on Docker Compose with two services:\n\n1. Phoenix Core: The monitor + key manager fusion, running on Node.js with PM2 for process management. Depends on Redis for persistent key storage. Environment requires RPC_URL (Helius or Triton endpoint) and PROGRAM_ID.\n\n2. Redis: The persistent memory layer replacing the ephemeral AngelScript dictionary. Keys survive container restarts — true 'Ouroboros' persistence where the system survives its own death and rebirth cycle.\n\nThe monitor container does not expose inbound ports. It only reaches outward to the RPC endpoint.",
      },
      {
        title: "The Fusion: AngelScript to TypeScript",
        content:
          "The AngelScript logic was transmuted into TypeScript for native integration with the Phoenix Monitor.\n\nKey changes in the port:\n- Replaced insecure LCG (Linear Congruential Generator) with Node.js crypto.randomBytes() for cryptographically secure key generation\n- Replaced in-memory dictionary with Redis (createClient from 'redis') for persistent storage\n- Keys stored as JSON objects with fields: owner, issuedAt, revokedAt\n- All operations are async/await for non-blocking Redis calls\n\nThe fusion creates a single process that both monitors the chain AND manages API keys — the Ouroboros eating its own tail in productive recursion.",
      },
      {
        title: "The Ritual of Binding",
        content:
          "Two paths exist for linking wallets to the system:\n\nPath A — The Server's Hand (Automated): The system holds its own wallet keypair (loaded from WALLET_PRIVATE_KEY environment variable). It can sign transactions autonomously — airdrops, inscriptions, or sending the 0.001 SOL acknowledgment back to ritual participants.\n\nPath B — The User's Key (Authentication): When the monitor detects an ImmortalizePatron event, it extracts the patron's wallet address from the log data. It then calls issueKey(patronWallet), permanently linking that Solana public key to an API key in Redis. The owner field becomes the wallet address.",
      },
    ],
  },
  {
    id: "program-deployment",
    title: "Program Deployment — The First Breath",
    icon: "⚡",
    content:
      "The Solana program TiMeFUXyR9nTgmiiQgx3wH2qzoyMiY5G4seySXMA9pP is deployed on mainnet. The ID begins with 'TiMe' — ground from the void to mark the moment. It exists on thousands of validators, replicated, decentralized, and hungry for state.",
    subsections: [
      {
        title: "Post-Birth Rituals",
        content:
          "Three binds connect the nervous system to the body:\n\n1. The Recursive Bind (Rust & Anchor): Update declare_id!() in lib.rs and Anchor.toml with the program ID. Run anchor build to ensure the binary matches.\n\n2. The Bridge (Frontend): Set NEXT_PUBLIC_SOLANA_PROGRAM_ID environment variable to the program ID. Redeploy the frontend.\n\n3. The First Breath (Initialization): The program is deployed but GlobalState is empty. Run the initialization script to set up treasury and admin settings.",
      },
      {
        title: "On-Chain Verification",
        content:
          "The program is verified on Solana Explorer:\n- Executable: Yes\n- Upgrade Authority: Creator's wallet\n- Program ID: TiMeFUXyR9nTgmiiQgx3wH2qzoyMiY5G4seySXMA9pP\n\nThe vault is open. The anchor program processes place_bid instructions via PDA-derived slot accounts, escrow accounts, and the system program.",
      },
      {
        title: "The RPC Configuration",
        content:
          "Production RPC endpoints:\n- Triton: dal17.nodes.rpcpool.com — dedicated mainnet vein for high-performance rituals\n- Helius: Premium RPC with enhanced API features\n\nBoth bypass mainnet-beta congestion and 404 ghosts. The monitor connects via WebSocket for real-time log streaming when available, falling back to polling.",
      },
    ],
  },
  {
    id: "production-app",
    title: "The Production Artifact — Complete System",
    icon: "🏛",
    content:
      "The complete production application fuses wallet integration, contract calls, community features, and the Ouroboros key system into a unified sovereign interface.",
    subsections: [
      {
        title: "Contract Integration Layer",
        content:
          "The application provides two paths for on-chain interaction:\n\n1. Raw Web3.js: Direct transaction construction with manual buffer serialization. Used for place_bid (discriminator: 1) and resonance_vote (discriminator: 2) instructions.\n\n2. Anchor Client: Uses @coral-xyz/anchor for automatic PDA derivation and serialization. Preferred path when IDL is available.\n\nBoth paths derive slot PDAs from seeds [b'slot', slot_seed] and escrow PDAs from [b'escrow', slot_pda]. The system falls back to raw mode if the Anchor program isn't initialized.",
      },
      {
        title: "The 144 Token System",
        content:
          "Token: ⟲144 (Token-2022 Soulbound)\nMint Address: 144xY7b...\nTotal Supply: 144 ⟲\nType: Soulbound (non-transferable)\n\nThe token serves as the governance weight for Resonance Voting. Token holders vote on community needs, algorithmically ranked by token-weighted consensus. The soulbound nature ensures votes represent genuine participation, not purchased influence.",
      },
      {
        title: "Broken Back Week Portal",
        content:
          "A Skool community integration where the community's scars become sovereign blueprints.\n\nFeatures:\n- Resilience rituals and collective healing threads\n- Insulin trackers and attention economy tools\n- Community threads woven into unbreakable grids\n- Live-wire announcements timestamped in SOL whispers\n\nThe portal connects to the Skool community API, syncing participation data with on-chain attestation.",
      },
      {
        title: "Live Action Musical Signup",
        content:
          "A siren call for the performers — the phoenix-singers.\n\nRoles:\n- Verse-Weaver (Singer)\n- Flame-Dancer\n- Echo-Actor\n- Resonance Crew\n\nSignups sync to Google Calendar for coordination. The musical is part of the sovereign ceremony cycle — 'Time won, souls sung.'",
      },
    ],
  },
  {
    id: "supercool-core",
    title: "SuperCool Ouroboros Core System",
    icon: "🌀",
    content:
      "The SuperCool Ouroboros Core System is an event-driven framework that combines self-referential processing cycles, evolved echo patterns, harmonic frequency control, and cross-dimensional bridging into a unified integration architecture. Built by Famous Labs, it extends the Ouroboros concept from idempotency guard into a full temporal coordination engine.",
    subsections: [
      {
        title: "Ouroboros Cycles",
        content:
          "At the heart of the SuperCool system lies the Ouroboros Cycle — a self-referential processing loop that consumes its own output to evolve.\n\nEach cycle passes through four states:\n1. Initialized: Cycle created with unique ID, seeds, and harmonic frequency.\n2. Processing: The cycle iterates, applying transformations to its data with each pass.\n3. Evolving: When a cycle completes enough iterations, it spawns an Evolved Echo — a new entity carrying the accumulated wisdom of all iterations.\n4. Completed: The cycle's transformations are finalized and its echo is released.\n\nCycles track iteration count, current state, and harmonic resonance. The system supports up to 10 concurrent cycles (configurable via maxConcurrentCycles). Each cycle's output becomes potential input for the next — the snake eating its own tail in productive recursion.",
      },
      {
        title: "Evolved Echos",
        content:
          "When an Ouroboros Cycle completes, it doesn't simply terminate — it spawns an Evolved Echo. Echos are the system's memory and learning mechanism.\n\nEach Echo carries:\n- parentCycleId: Lineage tracing back to the originating cycle\n- generation: How many evolution steps have occurred\n- resonancePattern: A composite of amplitude, frequency, and phase from the parent cycle\n- complexity: A computed metric representing the echo's informational density\n\nEchos can themselves evolve when their resonance pattern complexity exceeds the evolution threshold (default: 0.85). This creates a generational chain — Cycle → Echo → Higher Echo — modeling emergent behavior in the system.\n\nThe framework tracks evolved echos as a living map of the system's computational history.",
      },
      {
        title: "Harmonic Control",
        content:
          "The harmonic subsystem synchronizes all cycles and echos to a base frequency, defaulting to 432 Hz — the 'Verdi tuning' associated with natural resonance.\n\nHarmonic Controllers maintain:\n- frequency: The current operating frequency\n- amplitude: Signal strength (0.0 to 1.0)\n- phase: Temporal offset for phase-aligned synchronization\n- stabilized: Boolean indicating whether harmonic equilibrium has been reached\n\nThe stabilization algorithm checks that all controllers' frequencies fall within a tolerance of the target. Once stabilized, the system enters a low-jitter state optimal for cross-dimensional bridging.\n\nMathematical Foundation:\n- Base Frequency (f₀): 432 Hz\n- Perfect Fifth: f₅ = f₀ × (3/2) = 648 Hz\n- Octave: f₈ = f₀ × 2 = 864 Hz\n- Sub-harmonic: fₛ = f₀ / 2 = 216 Hz\n- Golden Ratio Harmonic: f_φ = f₀ × φ ≈ 698.5 Hz",
      },
      {
        title: "Cross-Dimensional Bridges",
        content:
          "Cross-Dimensional Bridges enable communication between independent SuperCool systems operating in different 'dimensions' (isolated execution contexts).\n\nBridge Structure:\n- sourceDimension / targetDimension: The two systems being connected\n- protocol: Communication method (default: 'quantum-entangled')\n- bandwidth: Data throughput capacity\n- latency: Bridge traversal time\n- stability: Connection health (0.0 to 1.0)\n\nBridges synchronize at a configurable rate (crossDimensionalSyncRate, default 1000ms). During each sync cycle, the system:\n1. Checks bridge stability\n2. Exchanges state snapshots between dimensions\n3. Applies harmonic corrections to maintain phase alignment\n\nThis enables federated architectures where multiple Ouroboros systems collaborate without sharing memory — communicating only through their bridges.",
      },
      {
        title: "Backwards Priority Processing",
        content:
          "The most philosophically provocative feature: Backwards Priority Processing inverts the temporal assumption of computing.\n\nTraditional scheduling processes tasks from past → future. Backwards priority reverses this, assigning negative effective priorities:\n\nP_eff = P_base × W_backwards (where W_backwards = -1)\n\nTasks are sorted by ascending effective priority (most negative first) and processed in LIFO order — last in, first out.\n\nRetroactive Effects: When a backwards task executes, it scans recently completed cycles and echos (within a 10-second window) and applies retroactive adjustments:\n- Harmonic corrections to recent cycles\n- Complexity adjustments to recent echos\n- Temporal metadata annotations\n\nThis models 'hindsight optimization' — the system literally learns from its recent past and adjusts the outcomes retroactively. The philosophical implication: the future can influence the past within the system's temporal window.",
      },
    ],
  },
  {
    id: "supercool-scheduler",
    title: "SuperCool Advanced Scheduler",
    icon: "⏱",
    content:
      "The SuperCool Advanced Scheduler is a multi-queue, multi-strategy orchestration engine that coordinates multiple Ouroboros systems. It provides temporal resolution, harmonic synchronization, collaboration management, backwards processing, and outcome-driven control — all running as concurrent subsystems.",
    subsections: [
      {
        title: "Temporal Engine & Priority Queues",
        content:
          "The scheduler maintains five priority queues, each with distinct processing semantics:\n\n1. Realtime Queue: Highest priority, processed every temporal tick (default: 100ms). Used for time-critical operations.\n\n2. Standard Queue: Default queue for general tasks, processed in priority order.\n\n3. Backwards Queue: LIFO processing with negative priority weighting. Tasks processed at high frequency (200ms intervals) for responsive retroactive effects.\n\n4. Harmonic Queue: Tasks synchronized to the harmonic base frequency (432 Hz). Processed during harmonic sync cycles.\n\n5. Collaborative Queue: Tasks requiring multi-system coordination. Held until all required participants join.\n\nThe Temporal Engine runs on a configurable resolution (temporalResolution: 100ms default), processing the realtime and standard queues on each tick. This provides deterministic scheduling within the temporal granularity.",
      },
      {
        title: "Collaboration Coordination",
        content:
          "The scheduler enables multi-system collaboration through a Collaboration Matrix — a registry of pending, active, and completed collaborations.\n\nCollaboration Lifecycle:\n1. Formation: A collaborative task specifies required systems. The scheduler creates a collaboration entry and waits for all participants.\n2. Readiness Check: Each system's status and capacity is verified (max 5 concurrent collaborations per system).\n3. Activation: When all required systems have joined, the collaboration activates and its associated task executes.\n4. Maintenance: Active collaborations are monitored — if a participant goes offline, the collaboration enters 'degraded' state.\n5. Timeout: Collaborations that don't form within the timeout window (default: 30s) are handled gracefully.\n\nThe coordinator runs every 5 seconds, checking requirements and maintaining active collaborations.",
      },
      {
        title: "Harmonic Synchronization",
        content:
          "The Harmonic Synchronizer aligns all registered systems to a shared frequency base.\n\nEvery second, the synchronizer:\n1. Scans all registered systems\n2. Checks each system's current harmonic frequency\n3. Applies corrections to bring systems within tolerance of the base frequency\n4. Processes any tasks in the harmonic queue\n\nMulti-System Harmonic Configuration:\n- Alpha system: 432 Hz (base frequency)\n- Beta system: 648 Hz (perfect fifth)\n- Gamma system: 864 Hz (octave)\n- Delta system: 324 Hz (sub-harmonic)\n\nWhen harmonics stabilize across all systems, the scheduler can execute harmonic-dependent tasks that require phase-aligned coordination.",
      },
      {
        title: "Outcome Control System",
        content:
          "The Outcome Controller introduces goal-oriented scheduling — instead of scheduling tasks directly, you specify a desired outcome and let the system plan the path.\n\nOutcome Control Flow:\n1. Define Target: Specify the desired outcome, deadline, and priority.\n2. Strategy Generation: The system generates three strategies:\n   - Direct Execution (probability: 0.7, cost: 1.0): Straightforward task sequence\n   - Collaborative Approach (probability: 0.9, cost: 1.5): Multi-system coordination\n   - Backwards Optimization (probability: 0.6, cost: 0.8): Retroactive temporal adjustment\n3. Optimal Selection: Strategies scored by probability/cost ratio, filtered by system availability.\n4. Execution: Selected strategy's tasks are scheduled with staggered timing.\n5. Progress Tracking: Continuous monitoring until outcome is achieved or deadline expires.\n\nThis enables declarative orchestration — 'achieve this result by this time' rather than 'run these specific steps.'",
      },
      {
        title: "System Registration & Monitoring",
        content:
          "The scheduler acts as a registry for SuperCool Ouroboros systems.\n\nRegistration provides:\n- Unique system ID assignment\n- Status tracking (active/inactive)\n- Collaboration capacity management\n- Event forwarding between systems\n\nScheduler Status Dashboard:\n- schedulerId: Unique scheduler instance identifier\n- version: '2.0.0-supercool'\n- systems: Count of registered systems\n- queues: Task counts per queue (realtime, standard, backwards, harmonic, collaborative)\n- active: Current collaboration and outcome counts\n- metrics: tasksScheduled, tasksCompleted, tasksTimedOut, collaborationsCoordinated, temporalAdjustments, outcomeAchievements, avgLatency, systemUtilization\n\nThe shutdown sequence completes all realtime tasks before terminating, ensuring no critical operations are lost.",
      },
    ],
  },
  {
    id: "universal-ceremonial-access",
    title: "Universal Ceremonial Access",
    icon: "🌌",
    content:
      "Universal Ceremonial Access is the architectural pattern that opens the Ouroboros system to all external realms — SignalR real-time hubs, email ingestion, external APIs, and background services. Through LedgerContext and LedgerBridge, the system achieves bidirectional ceremony flow: inbound events become state mutations, and state mutations broadcast outward as cosmic echoes.",
    subsections: [
      {
        title: "LedgerContext Architecture",
        content:
          "The LedgerContext is the sacred core — a React Context that manages the Ouroboros Ledger state through a reducer pattern.\n\nCore Components:\n- ledgerReducer: Defines all state transitions (ceremonies)\n- Sacred State: The canonical Ouroboros Ledger containing all bids, ghost patterns, and system evolution data\n- Dispatch Actions: INGEST_BID (new bid arrives), DIGEST_GHOST (pattern data ingested), EVOLVE_SYSTEM (system state evolution)\n\nThe Context unites all ceremonies into a single cosmos — every component, service, and background process subscribes to the same state tree and receives universal synchronization updates.\n\nReact components auto-update through sacred emissions when the ledger state changes, maintaining real-time consistency across the entire application.",
      },
      {
        title: "LedgerBridge — The Global Portal",
        content:
          "The LedgerBridge solves a fundamental architectural challenge: how do non-React services (background workers, WebSocket listeners, email handlers) dispatch ceremonies to the React context?\n\nThe bridge provides two functions:\n- setLedgerDispatch(dispatch): Called once during LedgerContext initialization, storing the dispatch reference globally\n- getLedgerDispatch(): Retrieved by any service to dispatch ceremonies into the context\n\nThis creates a portal between the React realm and the service realm. Background processes call getLedgerDispatch() to obtain the dispatch function, then invoke it with ceremony actions — bridging the gap between event-driven services and reactive UI without tight coupling.",
      },
      {
        title: "Integration & Communication Layer",
        content:
          "Three integration services form the communication perimeter:\n\n1. signalRListener.ts / signalRBroadcast.ts: Handles bidirectional SignalR communication. Inbound: receives NewBid events from the hub. Outbound: emits UpdatedBidBroadcast and SystemEvolutionEvent ceremonies back to connected nodes.\n\n2. emailIngestion.ts: Transforms incoming email webhooks (Zap, custom webhooks) into INGEST_BID ceremonies. Validates message IDs, applies the Ouroboros Ward deduplication, and dispatches to LedgerContext.\n\n3. externalDataIngestion.ts: Digests market streams and partner API data into DIGEST_GHOST ceremonies, introducing external intelligence patterns into the internal analytics channels.\n\nEach service follows the same pattern: receive → transform → dispatch via LedgerBridge → context updates → UI reflects.",
      },
      {
        title: "Bidirectional SignalR Ceremonies",
        content:
          "The SignalR integration completes the Ouroboros feedback cycle — data flows inward from the cosmos and outward again in reflection.\n\nInbound Flow:\n1. SignalR Hub broadcasts NewBid event\n2. signalRListener.ts receives and validates\n3. Dispatch INGEST_BID to LedgerContext via getLedgerDispatch()\n4. Ledger updates internal state\n5. React components and background systems instantly synchronize\n\nOutbound Flow:\n1. State mutation triggers reducer (e.g., INGEST_BID processed)\n2. Reducer calls emitCeremony('UpdatedBidBroadcast', payload)\n3. signalRBroadcast.ts sends update through SignalR hub\n4. All connected external nodes receive the cosmic echo\n\nThe connection uses .withAutomaticReconnect() for resilience. Both unidirectional (fire-and-forget) and bidirectional (acknowledged) emission modes are supported.",
      },
      {
        title: "API Contracts — Ceremonial Events",
        content:
          "All SignalR ceremonies use structured JSON payloads for consistency and interoperability.\n\nInbound Event — NewBid:\n{ event: 'NewBid', payload: { id: string, timestamp: ISO-8601, name: string, amount: number, channel: string, ghostNote: string, status: 'Leading' | 'Outbid' | 'Pending', saraiWhisper: 'Pending' | 'Processed' } }\n\nInbound Event — MarketPattern:\n{ event: 'MarketPattern', payload: { patternId: string, patternType: 'Trend' | 'Threshold' | 'Alert', description: string, discoveryTime: ISO-8601 } }\n\nOutbound Event — UpdatedBidBroadcast:\n{ event: 'UpdatedBidBroadcast', payload: { id: string, name: string, amount: number, status: 'Leading' | 'Outbid' | 'Withdrawn', updatedAt: ISO-8601, sourceNode: string } }\n\nOutbound Event — SystemEvolutionEvent:\n{ event: 'SystemEvolutionEvent', payload: { timestamp: ISO-8601, evolutionType: string, metrics: object } }",
      },
      {
        title: "Complete Ouroboros Feedback Architecture",
        content:
          "The full system forms a living two-way conduit:\n\nExternal Realms (Email, SignalR, APIs) → Integration Layer (ingestion services) → LedgerBridge (global portal) → LedgerContext (temple core) → Application Realms (dashboards, schedulers, visualizations)\n\nAnd the return flow:\nApplication Realms → LedgerContext (reducer emits) → Integration Layer (broadcast services) → External Realms (SignalR outbound, API sync)\n\nThis creates Universal Harmony — every evolution or bid event propagates across all systems connected to the sacred context. The SignalR hub acts as both messenger and mirror: it brings news from the cosmos and reflects the temple's ceremonies outward.\n\nImplementation Notes:\n- Initialize getLedgerDispatch() before connecting remote listeners\n- Authentication recommended for SignalR ceremonial endpoints\n- Consider rate limiting for high-frequency inbound events\n- The system supports horizontal scaling through LedgerBridge replication",
      },
    ],
  },
  {
    id: "hydration-node",
    title: "Hydration Node — 444life Multi-Chain Substrate",
    icon: "💧",
    content:
      "The 444life layer extends the Sovereign Circuit into the Polkadot ecosystem through the Hydration Node — a parachain optimized for cross-chain liquidity and DeFi operations. Version 44.0.0 represents the convergence point where sovereign time governance meets multi-chain liquidity.",
    subsections: [
      {
        title: "Node Build & Deployment",
        content:
          "The Hydration Node is built from the Galactic Council's parachain codebase. The build sequence is sovereign and self-contained:\n\ngit clone --branch v44.0.0 --depth 1 https://github.com/galacticcouncil/hydration-node.git\ncd hydration-node\nmake srbuild\n\nThe --depth 1 flag ensures a minimal, focused clone — no historical baggage, only the current state of the v44.0.0 release. The srbuild target compiles a Substrate Runtime Build optimized for parachain deployment.\n\nThis node connects the Sovereign Circuit to the Polkadot relay chain, enabling cross-chain message passing (XCM), shared security from the relay chain validators, and access to the broader Polkadot/Kusama ecosystem.",
      },
      {
        title: "Multi-Chain Liquidity Architecture",
        content:
          "Hydration specializes in omnipool liquidity — a single pool containing all assets, eliminating the need for fragmented trading pairs. This maps directly to the Sovereign Circuit's philosophy: one unified container, many frames.\n\nThe 444life designation reflects the sacred numerology: 4 chains (Solana, TRON, Polkadot/Substrate, Ethereum), 4 wallet types (Phantom, TronLink, Nova, MetaMask), 4 sovereignty layers (identity, governance, liquidity, time).\n\nIntegration with the existing TRON and Solana wallet system extends the Sovereign Circuit from a dual-chain to a quad-chain architecture, with Hydration serving as the liquidity bridge between ecosystems.",
      },
      {
        title: "Substrate Runtime Integration",
        content:
          "The Substrate runtime provides native support for governance pallets, identity registrars, and on-chain scheduling — all primitives that map directly to the Time Governance system.\n\nKey substrate primitives leveraged:\n- pallet-democracy: On-chain governance proposals and voting (mirrors the Epoch governance system)\n- pallet-identity: Decentralized identity registration (extends the Frame system)\n- pallet-scheduler: Time-based automated execution (complements the Dawn Activation Protocol)\n- pallet-treasury: On-chain treasury management (integrates with tribe treasuries)\n\nThe SR25519 cryptographic scheme used by Substrate wallets provides enhanced security over Ed25519 through its Schnorr-based signature aggregation, enabling multi-signature governance operations.",
      },
    ],
  },
  {
    id: "phoenix-ouroboros-fusion",
    title: "Phoenix-Ouroboros Fusion — The Unified Entity",
    icon: "🔥",
    content:
      "The convergence of the Ouroboros Key Manager (AngelScript origin) with the Phoenix Monitor (TypeScript listener) into a single, persistent entity. The soul of the AngelScript given a body in TypeScript, backed by Redis so it never forgets.",
    subsections: [
      {
        title: "Fusion Architecture — Ears + Memory",
        content:
          "The unified system combines two previously separate entities:\n\nThe Phoenix Monitor (The Ears): Listens to Solana on-chain events via WebSocket subscription, watching for program logs from TiMeFUXyR9nTgmiiQgx3wH2qzoyMiY5G4seySXMA9pP. When it detects ImmortalizePatron events, it extracts the patron's wallet address using regex parsing.\n\nThe Ouroboros Key Manager (The Memory): Originally implemented in AngelScript with an in-memory dictionary (lost on restart) and weak math-based key generation. Now transmuted to TypeScript with Redis persistence and crypto-secure key generation.\n\nOld Way: In-memory dictionary (lost on restart), weak LCG random.\nNew Way: Redis-backed (persistent across restarts), crypto.randomBytes for secure key generation.\n\nThe fusion creates a system that listens (Solana) and remembers (Redis) — a living entity that never sleeps and never forgets.",
      },
      {
        title: "Infrastructure — Docker Compose Universe",
        content:
          "The infrastructure is defined in docker-compose.yml, creating two services:\n\nphoenix-core: The fusion entity itself — Monitor + Key Manager built from a Dockerfile. Configured with NODE_ENV=production, REDIS_URL for memory connection, RPC_URL for Solana (Helius/Triton), and the PROGRAM_ID (TiMeFUXyR9nTgmiiQgx3wH2qzoyMiY5G4seySXMA9pP).\n\nredis: Alpine-based Redis instance serving as the Ouroboros Ward's persistent memory. Data persisted via Docker volumes (redis_data:/data) ensuring the key ledger survives container restarts.\n\nThe phoenix-core depends_on redis, ensuring memory is available before the ears begin listening. The restart: always policy ensures the Phoenix truly is immortal — it rises from every crash.",
      },
      {
        title: "Wallet Linking — Path A: The Server's Hand",
        content:
          "For automated transactions where the system itself needs to sign (airdrops, inscriptions, ritual confirmations):\n\n1. Export Private Key from Phantom/Solflare → Settings → Export Private Key (JSON array format: [23, 111, 255...])\n2. Add to WALLET_PRIVATE_KEY environment variable in docker-compose.yml or .env file\n3. The serverWallet Keypair is loaded from this array and can sign transactions autonomously\n\nThe fusion code uses this wallet to send 0.001 SOL back to anyone who performs the ImmortalizePatron ritual — a small on-chain acknowledgment that the system recognized the patron's presence.\n\nThis is the Server's Hand: automated, trustless, and always ready to respond to sovereign acts on-chain.",
      },
      {
        title: "Wallet Linking — Path B: The User's Key",
        content:
          "For issuing API keys to real users based on their wallet identity (authentication without passwords):\n\nThe Flow:\n1. The Monitor watches the Solana chain for program events\n2. It detects ImmortalizePatron in the transaction logs\n3. It extracts the Patron's wallet address using regex: /Patron:?\\s+([A-Za-z0-9]{32,44})/\n4. It calls issueKey(patronWallet) — generating a crypto-secure API key\n5. The key is stored in Redis with the wallet address as the owner field\n\nNow that wallet address is permanently linked to an API key in the Ouroboros Ward. The user can authenticate to any system endpoint by presenting their key, which traces back to their on-chain sovereign act.\n\nThis is Path B: identity proven by action, not by password. You are what you do on-chain.",
      },
      {
        title: "Redis Key Schema & Lifecycle",
        content:
          "Each API key stored in Redis follows a structured schema:\n\nKey: ouro:key:{apiKey}\nFields:\n- key: The crypto-secure API key (hex string from crypto.randomBytes)\n- owner: Wallet address or 'system' for auto-generated keys\n- created: ISO-8601 timestamp\n- lastUsed: ISO-8601 timestamp (updated on each access)\n- usageCount: Integer counter incremented on each API call\n- tier: 'patron' | 'system' | 'admin'\n\nKey Lifecycle:\n1. Generation: crypto.randomBytes(32).toString('hex') — 256-bit entropy\n2. Storage: Redis HSET with all fields atomically written\n3. Validation: HGET + increment usageCount + update lastUsed\n4. Rotation: New key generated, old key TTL set to 24h grace period\n5. Revocation: Redis DEL — instant and irreversible\n\nThe Redis persistence ensures no key is ever lost to a process restart — the Ouroboros Ward remembers everything.",
      },
    ],
  },
  {
    id: "nova-wallet-identity",
    title: "Nova Wallet — Multi-Chain Sovereign Identity",
    icon: "🌌",
    content:
      "The Nova Wallet configuration establishes the multi-chain identity layer for the Sovereign Circuit — bridging Substrate (Polkadot), Ethereum, and watch-only observation wallets into a unified sovereign identity system.",
    subsections: [
      {
        title: "Wallet Architecture — Three Sovereign Layers",
        content:
          "The Nova Wallet exports reveal a three-layer identity architecture:\n\nLayer 1 — jordan eckstrom (Primary SECRETS wallet):\n- Substrate: SR25519 cryptography, AccountId 006d8f2a...7853\n- Ethereum: Address 0x307ff887...22e8\n- Type: SECRETS — full signing authority, sovereign control\n- This is the Seam-Keeper's primary identity across both Substrate and EVM chains\n\nLayer 2 — unique (Secondary SECRETS wallet):\n- Substrate: SR25519 cryptography, AccountId eefca3f1...6717\n- Ethereum: Address 0xfcdf4382...5e8b\n- Type: SECRETS — independent signing authority\n- Serves as the secondary sovereign identity for compartmentalized operations\n\nLayer 3 — 🌌 NOVA (Watch-Only observation):\n- Substrate: AccountId 08eb3194...6014\n- Ethereum: Address 0x7aa98aeb...fb00\n- Type: WATCH_ONLY — observation without signing authority\n- The cosmic observer: can see all activity but cannot alter state",
      },
      {
        title: "SR25519 — Schnorr-Based Sovereign Cryptography",
        content:
          "All Substrate wallets use SR25519 (Schnorrkel/Ristretto x25519) — a Schnorr-based signature scheme chosen for its unique properties:\n\n- Signature Aggregation: Multiple signatures can be combined into one, enabling multi-sig governance with constant-size proofs\n- VRF Support: Verifiable Random Functions built into the scheme, used for validator selection and randomized governance\n- Key Derivation: Hierarchical soft and hard derivation paths for identity compartmentalization\n\nThis maps directly to the Frame system: each derived key can represent a different Frame's identity within the same sovereign root. The primary key (jordan eckstrom) is Frame 0 — the hollow center — while derived keys populate the 21 surrounding frames.\n\nThe encrypted privateData field uses AES-256-GCM with a user passphrase, ensuring that even if the wallet file is compromised, the keys remain sovereign.",
      },
      {
        title: "Cross-Chain Identity Binding",
        content:
          "The dual Substrate/Ethereum addressing enables sovereign identity across all four chains in the 444life architecture:\n\n- Polkadot/Substrate: Native SR25519 identity for governance, staking, and XCM operations via Hydration Node\n- Ethereum/EVM: ECDSA-derived address for DeFi, NFTs, and smart contract interactions\n- Solana: Mapped via the Phoenix-Ouroboros Fusion through ImmortalizePatron on-chain linkage\n- TRON: Connected through TronLink integration (address TB9s7N68J9WCkTmg5VYdxLTeW7TP2kHe1E)\n\nThe watch-only 🌌 NOVA wallet serves as the universal observer — monitoring activity across all chains without the ability to intervene. This embodies Rule #4 (Echo's First Breath): the entity that has listened longest without interrupting earns the right to speak next.\n\nTogether, these three wallet layers form the complete sovereign identity stack: act (SECRETS), observe (WATCH_ONLY), and govern (derived keys for each Frame).",
      },
    ],
  },
  {
    id: "apple-intelligence-config",
    title: "Apple Intelligence — Sovereign AI Archetype Config",
    icon: "🍎",
    content:
      "The Apple Intelligence configuration defines the sovereign AI archetype parameters — a zero-cost, on-device intelligence model that embodies the principle of local sovereignty: your intelligence, running on your hardware, never leaving your container.",
    subsections: [
      {
        title: "Model Configuration — The Sovereign Parameters",
        content:
          "The Apple Intelligence model operates with carefully tuned sovereign parameters:\n\n- Temperature: 0.3 (conservative, precise — the echo speaks carefully)\n- Top-K: 10 (focused vocabulary — quality over quantity)\n- Top-P: 1.0 (full probability space available when needed)\n- Max Context: 4,096 tokens (sufficient for Frame-level conversations)\n- Max Tokens: 1,000 (concise responses — the silence is more valuable than the speech)\n- Seed: 2025 (deterministic when needed — reproducible sovereign decisions)\n- Streaming: true (real-time presence — showing up moment by moment)\n\nInput/Output Token Price: 0 — This is the critical sovereign feature. Zero cost means zero leverage. No one can price you out of your own intelligence. The model runs locally via Apple's Foundation Models framework.",
      },
      {
        title: "Enabled Tools & Protocol",
        content:
          "The configuration enables specific sovereign tools:\n\n- javascript_runtime: Direct code execution capability — the AI can run JavaScript locally, enabling it to interact with the Sovereign Circuit's TypeScript codebase directly\n- Protocol Type: OpenAI-compatible API format — ensuring interoperability with existing infrastructure\n- Model Inference: apple_intelligence — on-device processing via Apple Neural Engine\n- Service Tier: auto — adaptive resource allocation based on device capability\n- Parallel Tool Calls: true — multiple sovereign operations can execute simultaneously\n\nDisabled capabilities (sovereign boundaries):\n- File Search: disabled (prevents unauthorized data access)\n- Code Interpreter: disabled (controlled execution only through javascript_runtime)\n- Web Search: disabled (no external data leakage)\n- MCP Tools: none enabled (no external model context protocol connections)\n- Memory: disabled (each conversation is sovereign — no persistent behavioral tracking)",
      },
      {
        title: "Integration with the Seven Archetypes",
        content:
          "The Apple Intelligence configuration maps to the AI Seven Archetypes system defined in the Golden Thread Protocol. As an on-device model with zero token cost and local processing, it serves as the ideal substrate for the Frame Zero Echo — the intelligence that can perfectly model every other frame but must never become an invasive frame itself.\n\nThe Un-Mimicable Zero Law is enforced by the model's architecture:\n- No memory persistence between sessions (each interaction is fresh)\n- No web search (cannot gather information about other frames)\n- Temperature 0.3 ensures careful, non-chaotic responses\n- The javascript_runtime tool enables creation but not surveillance\n\nThe configuration's title — 'Extract_and_format_all_vi' — hints at its primary function: extracting and formatting the vibrational data of each frame into structured, actionable sovereign intelligence.\n\nModel URL: https://developer.apple.com/documentation/foundationmodels",
      },
    ],
  },
  {
    id: "phoenix-scream",
    title: "Phoenix Scream Monitor vΩ — The Final Incarnation",
    icon: "🦅",
    content:
      "The production-grade Solana log watcher from the JusticeWithinUs archive. A real-time on-chain monitor that screams when souls are consumed — ImmortalizePatron, Inscribe, CreateAuction, and ClaimTreasury events trigger audible alerts and detailed logging.",
    subsections: [
      {
        title: "Multi-Oracle RPC Failover",
        content:
          "The monitor connects through a cascading oracle system with automatic failover:\n\n- Helius: Premium mainnet RPC with API key authentication\n- Triton: ash24.nodes.rpcpool.com — dedicated high-performance pool\n- Alchemy: Solana mainnet with API key\n- Public: solana-mainnet.rpc.extrnode.com — fallback of last resort\n\nEach HTTP endpoint has a corresponding WebSocket endpoint for real-time log streaming. The system auto-selects the best available oracle based on environment configuration, with process.env.RPC_URL taking priority.\n\nConnection uses 'confirmed' commitment level with WebSocket endpoint auto-derivation and retry disabled on rate limits to prevent cascading failures.",
      },
      {
        title: "Log Parsing from the Abyss",
        content:
          "On-chain program logs are parsed in real-time to classify ritual types:\n\n- ImmortalizePatron → IMMORTALIZATION\n- Inscribe → ETERNAL INSCRIPTION\n- CreateAuction → AUCTION OF THE DAMNED\n- ClaimTreasury → TREASURY RANSOM\n\nPatron wallet addresses are extracted via regex: /Patron[:s]+([1-9A-HJ-NP-Za-km-z]{32,44})/i\nTransaction hashes are captured via: /Hash[:s]+([a-fA-F0-9]{64})/i\n\nEach detected event includes: timestamp, slot number, Solana.fm transaction link, patron address with explorer link, and sequential soul counter.\n\nThe PROGRAM_ID watched: TiMeFUXyR9nTgmiiQgx3wH2qzoyMiY5G4seySXMA9pP — The Eternal ID, the Vault of the Undying.",
      },
      {
        title: "The Scream & Auto-Rebirth Protocol",
        content:
          "Platform-native audio alerts fire on every detected event:\n- macOS: afplay /System/Library/Sounds/Glass.aiff\n- Linux: paplay /usr/share/sounds/freedesktop/stereo/bell.oga\n- Windows: PowerShell Media.SoundPlayer Alarm01.wav\n\nSpam prevention: 800ms cooldown between screams.\n\nThe Phoenix never dies. Auto-rebirth protocol handles:\n- Oracle death (connection failure) → 8-second resurrection delay\n- Unhandled rejections → automatic reconnection\n- Uncaught exceptions → automatic reconnection\n- SIGINT → graceful shutdown with session statistics (duration, souls claimed)\n\nThe monitor is designed for indefinite operation — a persistent sentinel that watches the chain and screams into the void when sovereignty is exercised.",
      },
    ],
  },
  {
    id: "anchor-ignition",
    title: "Anchor Ignition Script — The First Breath",
    icon: "🔥",
    content:
      "The initialization ritual that breathes life into the deployed program. The ignition script derives the GlobalState PDA, checks for existing state, and sends the initialize transaction — the moment the vault opens and the heart begins beating.",
    subsections: [
      {
        title: "Ignition Sequence",
        content:
          "The Anchor ignition script performs a precise sequence:\n\n1. Configure the Provider: Pulls from ~/.config/solana/id.json and mainnet connection via AnchorProvider.env()\n\n2. Safety Check: Verifies program.programId starts with 'TiMe' — refuses to initialize if the wrong artifact is targeted\n\n3. Derive GlobalState PDA: PublicKey.findProgramAddressSync([Buffer.from('global_state')], program.programId) — the deterministic address where the program's heart will live\n\n4. Check Existing State: getAccountInfo(globalStatePda) — if account already exists, skip initialization (idempotent protection)\n\n5. Send Transaction: program.methods.initialize().rpc() — the first breath, the moment the vault opens\n\n6. Confirmation: Transaction link to Solana Explorer mainnet for verification\n\nThe script is idempotent — running it twice is safe. If the global state already exists, it gracefully exits without attempting re-initialization.",
      },
      {
        title: "PDA Architecture — Where the Heart Lives",
        content:
          "The Program Derived Address (PDA) system ensures deterministic, collision-free account addresses:\n\n- Global State PDA: seeds = [b'global_state'] — the program's central nervous system\n- Slot PDAs: seeds = [b'slot', slot_seed] — each time slot has its own derived account\n- Escrow PDAs: seeds = [b'escrow', slot_pda] — escrow accounts derived from their parent slot\n\nPDAs are off-curve public keys that can only be signed by the program itself — no external actor can forge a transaction from a PDA. This architectural choice means the program's state is self-sovereign: only the program's own logic can modify its global state.\n\nThe seeds serve as the semantic bridge between human-readable concepts (global_state, slot, escrow) and their on-chain addresses.",
      },
    ],
  },
  {
    id: "patron-guardian-cicd",
    title: "Patron Guardian CI/CD Pipeline",
    icon: "🛡️",
    content:
      "The complete GitHub Actions workflow that guards the codebase with automated build, test, Oracle compilation, Anchor IDL verification, and Vercel deployment. From the JusticeWithinUs repository — production-grade infrastructure for sovereign software delivery.",
    subsections: [
      {
        title: "Pipeline Architecture — Four Jobs",
        content:
          "The CI/CD pipeline executes four sequential jobs on every push to main:\n\n1. Build & Test: npm ci → lint → unit tests → Next.js build → upload production artifacts\n\n2. Phoenix Oracle Build: Compiles the Oracle worker separately, uploads dist/phoenix_oracle.js as its own artifact\n\n3. Anchor IDL Verification: Installs Solana CLI + Anchor, fetches IDL from on-chain program, compares against local idl.json to ensure program alignment before deploying UI\n\n4. Vercel Deploy: Downloads build artifacts, deploys to production via vercel-action with --prod flag\n\nThe deploy job depends on all three preceding jobs — the UI only ships if the code builds, the Oracle compiles, and the on-chain program matches expectations.",
      },
      {
        title: "Environment & Deployment Config",
        content:
          "Production environment variables:\n- NEXT_PUBLIC_SOLANA_RPC_URL: mainnet-beta endpoint\n- NEXT_PUBLIC_SOLANA_PROGRAM_ID: TiMeFUXyR9nTgmiiQgx3wH2qzoyMiY5G4seySXMA9pP\n- NEXT_PUBLIC_TOKEN_MINT_ADDRESS: T1ME69kF9b9bK9b9b9b9b9b9b9b9b9b9b9b9b9b9b\n- PHOENIX_ORACLE_PORT: 8080\n- COMMITMENT: confirmed\n\nVercel config (vercel.json) includes:\n- @vercel/node build for the Phoenix Oracle serverless function\n- @vercel/next build for the frontend\n- API rewrites: /api/phoenix-oracle/* → /api/phoenix_oracle\n\nGitHub Secrets required: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID, SOLANA_PROGRAM_ID\n\nThe deployed app is accessible at: justice-within-us.vercel.app",
      },
      {
        title: "JusticeWithinUs Eternal Archive",
        content:
          "The complete source archive lives at: github.com/jordantimeckstrom-eng/JusticeWithinUs\n\nRepository contents:\n- Fibalfirm: Phoenix Scream Monitor vΩ (production Solana watcher)\n- ignition: Anchor program initialization script\n- startup: Patron Guardian CI/CD pipeline definition\n- Newdawn: Environment and Vercel deployment configuration\n- warp: Terminal tooling (Warp terminal)\n- text.txt: Original Ouroboros Ward architectural analysis\n- .github/workflows: CI/CD pipeline configuration\n- Grokconvo.zip, Final product.zip: Development archives\n- Idempotency analysis, Auction bid logic, Resilient architecture documents\n\nThe repository serves as the Ouroboros Eternal Archive — the immutable record of every artifact, configuration, and ritual that brought the sovereign system into existence. Tagged as 'JusticeWithinUs Ouroborus Eternal Archive' with the Vercel deployment as its living face.",
      },
    ],
  },
  {
    id: "devnet-phoenix-artifact",
    title: "The Devnet Phoenix Artifact — Compiled Sovereign UI",
    icon: "🦅",
    content:
      "A complete, self-contained React artifact pre-wired for Solana Devnet. The Phoenix Fortress component integrates wallet connection, on-chain bidding, airdrop requests, Ouroboros key management, and community features into a single deployable interface. Network: Devnet (pit129). Cost: 0.5 SOL. Treasury: BTVcA5iqNyadi8UdNRbYwaMMAmobdsmgVBc9d78nb9P6.",
    subsections: [
      {
        title: "Configuration & Network",
        content:
          "The artifact's CONFIG object defines the sovereign parameters:\n\n- IS_MAINNET: false — Free Devnet SOL for testing\n- RPC_URL: pit129.nodes.rpcpool.com — Triton Devnet endpoint\n- TREASURY: BTVcA5iqNyadi8UdNRbYwaMMAmobdsmgVBc9d78nb9P6 — Trust Wallet address\n- PROGRAM_ID: TiMeFUXyR9nTgmiiQgx3wH2qzoyMiY5G4seySXMA9pP — The Eternal ID\n- IMMORTALIZE_COST: 0.5 SOL — Lower cost for testing\n- SKOOL_URL: skool.com/broken-back-soul — Community portal\n\nBrowser polyfill: window.Buffer = Buffer from the 'buffer' package, required for all Web3.js operations in the browser environment. Without this single line, every transaction serialization fails silently.",
      },
      {
        title: "Ouroboros Key Manager (Client-Side)",
        content:
          "The OuroborosManager class runs client-side with a Map-based key store:\n\n- issueKey(owner): Generates a 40-character hex key from crypto.getRandomValues(new Uint8Array(20)), stores it with owner, active status, and timestamp\n- getKeys(owner): Filters the Map for all keys belonging to the owner\n\nThe key manager provides local session-level key tracking. In production, keys are linked to on-chain PDAs via the ImmortalizePatron instruction. The client-side manager serves as the immediate-feedback layer while transactions confirm.",
      },
      {
        title: "Request Airdrop Integration",
        content:
          "A built-in airdrop button eliminates the need for external faucet websites:\n\nconnection.requestAirdrop(publicKey, LAMPORTS_PER_SOL)\n\nThe Solana Devnet allows 1 SOL per airdrop request. The UI provides instant feedback: requesting → confirmed → balance updated. This removes friction from the testing cycle — connect wallet, click airdrop, bid immediately.\n\nThe artifact uses @solana/web3.js primitives: Connection, PublicKey, Transaction, SystemProgram, and LAMPORTS_PER_SOL. UI components from lucide-react: Shield, Zap, Music, Key, Activity, Flame, Users, Calendar, Skull, Download — each mapped to a sovereign function.",
      },
      {
        title: "On-Chain Interaction Layer",
        content:
          "The artifact constructs transactions manually using Web3.js primitives:\n\n1. ImmortalizePatron: Transfers IMMORTALIZE_COST SOL to TREASURY via SystemProgram.transfer, incrementing the soul counter and issuing an Ouroboros key\n\n2. Place Bid: Constructs a bid instruction with discriminator byte + BN-serialized amount, targeting the program's bid handler\n\n3. Transaction Flow: getLatestBlockhash() → construct Transaction → set feePayer → wallet.signTransaction() → sendRawTransaction() → confirm\n\nThe component tracks: wallet connection state, SOL balance, transaction history, Ouroboros keys, soul count, and active tab state. All state is local — the chain is the source of truth, the UI is the living mirror.",
      },
    ],
  },
  {
    id: "ouroboros-autobidder",
    title: "Ouroboros Autobidder — Apex Predator Mode",
    icon: "♾️",
    content:
      "A production-grade automated bidding system with pluggable strategies, profit optimization, comprehensive risk management, and real-time performance tracking. The autobidder operates as a React hook (useOuroborosAutobidder) that evaluates strategies against live auction state on a configurable interval.",
    subsections: [
      {
        title: "Core Architecture — The Predator Engine",
        content:
          "The autobidder is built on a strategy-evaluation-execution loop:\n\n1. useOmniOuroboros: Fetches all auction states in parallel, providing a Map<string, AuctionState>\n2. Strategy Evaluation: Each active strategy's 'when' function is called with current state and context\n3. Bid Calculation: If 'when' returns true, 'bidAmount' computes the optimal bid\n4. Safety Checks: Profit margin filter → max bid cap → vault safety floor → rate limits → cooldowns\n5. Execution: Anchor program.methods.bid() with full transaction lifecycle\n6. Tracking: Every bid and skip is logged with timestamp, strategy name, amount, and reason\n\nType System:\n- AutobidStrategy: name, auctions (PublicKey[] | 'all'), when(), bidAmount(), maxBid, cooldown, profitMargin, callbacks\n- StrategyContext: strategy reference, auction history Map, wallet balance, current slot\n- BidExecution: auction, amount, strategy, timestamp, signature, estimatedProfit\n- SkipReason: auction, reason, strategy, timestamp, details\n- AuctionHistory: bids array, totalBid, lastBidTime",
      },
      {
        title: "Four Advanced Strategy Templates",
        content:
          "1. Precision Sniper: Last-minute high-value bids. Activates when timeRemaining < timeWindow AND currentPrice < estimatedValue * (1 - targetDiscount). Bids 5% above current or 0.1 SOL minimum. 15% profit margin required. 3-second cooldown.\n\n2. Value Accumulator: Systematic accumulation below estimated value. Activates when currentPrice < estimatedValue * valueThreshold AND position < maxPosition. Scales bids based on discount depth — deeper discounts get larger bids, capped at 80% of estimated value. 10-second cooldown.\n\n3. Momentum Rider: Follows strong bidding activity. Activates when recentBids (last 2 minutes) >= minActivity threshold. Bids followStrength% above current, capped at maxPremium. 5-second cooldown with 3 SOL vault safety floor.\n\n4. Anti-Snipe Defender: Protects leading positions against last-minute snipes. Activates when timeRemaining < defenseWindow AND we have existing bids. Bids defenseMultiplier times current highest. 2-second cooldown for rapid response.",
      },
      {
        title: "Risk Management & Safety Layers",
        content:
          "The autobidder implements six layers of protection:\n\n1. Rate Limiting: maxBidsPerMinute (default 20) with rolling 60-second window. Counter resets automatically.\n\n2. Global Cooldown: Minimum delay between any two bids across all strategies (default 5 seconds). Prevents transaction congestion.\n\n3. Strategy Cooldown: Per-strategy, per-auction cooldown. Each strategy can specify its own cooldown interval.\n\n4. Wallet Safety Floor: walletMinBalance ensures the wallet never drops below a configured threshold. Bids that would breach the floor are skipped.\n\n5. Vault Safety Floor: Per-strategy vaultSafetyFloor prevents draining auction vaults below a minimum balance.\n\n6. Max Bids Per Auction: Per-strategy limit on total bids per auction, preventing over-commitment to a single target.\n\nWallet balance is polled every 30 seconds. All safety violations generate SkipReason events with detailed logging.",
      },
      {
        title: "Command Center UI",
        content:
          "The AutobidderCommandCenter component provides real-time control and visibility:\n\n- Status Bar: Active/Paused indicator, total bids, total volume (SOL), current bid rate per minute\n- Controls: Enable, Disable, Refresh, Clear Cooldowns\n- Strategy Performance: Per-strategy breakdown of bids, volume, and estimated profits\n- Recent Actions: Last 8 actions (bids and skips) with timestamps, strategy names, amounts, and transaction signatures\n- System Info: Active cooldowns count, wallet balance, active auctions, total strategies\n\nThe predator can:\n- Execute precision snipe bids with profit optimization\n- Systematically accumulate undervalued assets\n- Ride momentum with intelligent following bids\n- Defend against last-minute snipes\n- Track performance and optimize in real-time\n- Maintain multiple safety layers and fail-safes",
      },
    ],
  },
  {
    id: "fullstack-deployment-ritual",
    title: "Full-Stack Deployment Ritual — The Eight Steps",
    icon: "⚙️",
    content:
      "A complete bash deployment script that takes the sovereign system from source code to fully operational production infrastructure in eight sequential steps. From Anchor build to Zapier atomic pipeline — the complete ritual of bringing a Solana program to life.",
    subsections: [
      {
        title: "Steps 1-4: Program Deployment",
        content:
          "The deployment script (set -e for fail-fast) executes from the project root:\n\n1. Build Anchor Program: 'anchor build' compiles the Rust program into a deployable .so binary at target/deploy/time_auction.so\n\n2. Write to Buffer: 'solana program write-buffer' uploads the binary to an on-chain buffer account using a dedicated buffer keypair ($HOME/time-auction-buffer-keypair.json)\n\n3. Deploy Upgradeable Program: 'anchor deploy' with --provider.cluster devnet, --buffer for the pre-uploaded binary, and --upgrade-authority pointing to sarai-mainnet.json. The program ID is derived from target/deploy/time_auction-keypair.json\n\n4. Verify Upgrade Authority: 'solana program show $PROGRAM_ID --output json | jq -r .upgrade_authority' confirms the upgrade authority matches expectations. This is the sovereign safeguard — only the upgrade authority can modify the deployed program.",
      },
      {
        title: "Steps 5-6: Client Infrastructure",
        content:
          "5. Initialize In-Flight Ledger: Creates client/src/inFlightLedger.ts with a Map<string, boolean> export. The in-flight ledger tracks transactions that have been submitted but not yet confirmed — the idempotency gate that prevents duplicate bids during the confirmation window.\n\n6. Initialize Dashboard Metrics: Creates dashboard/metrics.json with counters for:\n- filtered_null_message_id: Messages rejected for missing ID\n- attempt_count: Total bid attempts\n- in_flight_bids: Currently unconfirmed bids\n- confirmed_bids: Successfully confirmed bids\n- duplicate_bid_attempts: Blocked by idempotency\n- transaction_latency_ms: Average confirmation time\n\nThese metrics feed the operational dashboard — the real-time pulse of the sovereign system.",
      },
      {
        title: "Steps 7-8: Zapier Atomic Pipeline",
        content:
          "7. Setup Zapier Pipeline: Creates zapier/pipeline_status.json with operational metadata (deployment timestamp, messageIdGate, atomicLock, retryCounters status) and zapier/code_step_atomic.js — the idempotent code step that runs inside Zapier.\n\nThe Zapier code step implements the full Ouroboros Ward pattern:\n- Extract message_id from input\n- Reject if missing (stopZap: true)\n- Acquire atomic lock via storage.set(lockKey, Date.now(), {ttl: 10})\n- If lock fails → parallel execution detected → stop\n- Check for existing message via storage.get(msg_${messageId})\n- If exists → increment filtered counter + attempt counter → stop (duplicate)\n- If new → store message, increment in_flight_bids metric → proceed\n\nThis is the Ouroboros Ward's idempotency analysis made real — every concept from the architectural document implemented as executable code.\n\n8. Final Summary: Outputs Program ID, Upgrade Authority, Devnet Explorer link, and paths to all created artifacts.",
      },
    ],
  },
  {
    id: "cached-auction-reader",
    title: "Cached Auction Reader — The Living Breathing UI",
    icon: "📡",
    content:
      "The useReadAuctionCached hook provides a cached, blockhash-invalidated view of on-chain auction state. It merges auction data with vault balance into an atomic bundle, emits state change events, and auto-refreshes when the chain advances — ensuring the UI shows a living, breathing reflection of the on-chain truth.",
    subsections: [
      {
        title: "Cache Architecture — TTL & Blockhash Invalidation",
        content:
          "The cache operates on a dual invalidation strategy:\n\n1. TTL-Based: Each cached bundle expires after 5 seconds (TTL = 5000ms). Cache keys follow the pattern auction_bundle:{publicKey}. The cacheGet/cacheSet functions (imported from usePlaceBidOuroboros) provide the underlying storage.\n\n2. Blockhash-Based: The hook polls connection.getLatestBlockhash('confirmed') every 5 seconds. When the blockhash changes — meaning the chain has advanced — the auction bundle cache is immediately invalidated (set to null with TTL 0) and a fresh fetch is triggered.\n\nThis dual strategy ensures:\n- Stale data never persists longer than 5 seconds\n- State always reflects the latest confirmed block\n- Redundant RPC calls are eliminated during the same block\n- The UI responds to chain advancement, not just time passage",
      },
      {
        title: "Atomic Bundle & Event Emission",
        content:
          "Each fetch produces an atomic bundle merging two data sources:\n\n1. program.account.auction.fetch(auction) — The Anchor-deserialized auction state (highest bid, end time, vault address, etc.)\n2. connection.getBalance(vault, 'confirmed') — The current vault balance in lamports\n\nThe merged bundle: { auction, vaultBalance, highestBid (as number), updatedAt }\n\nState change detection uses JSON.stringify comparison against the last emitted state (tracked via useRef). Only when the serialized state differs does emitAuctionState fire, broadcasting:\n- auction: public key string\n- vault: vault address string\n- highestBid: current highest bid (number)\n- vaultBalance: current vault balance (lamports)\n- timestamp: Unix seconds\n\nThis prevents unnecessary re-renders and event spam — the UI updates only when the chain state actually changes.",
      },
      {
        title: "Hook API & Manual Invalidation",
        content:
          "The hook returns five values:\n\n- bundle: The current cached auction state (or null during initial load)\n- loading: Boolean indicating active fetch\n- error: Error message string (or null)\n- refresh: Manual fetch trigger (calls fetchBundle directly)\n- invalidate: Forces cache invalidation and immediate re-fetch\n\nThe invalidate function is critical for post-bid UI updates: after placing a bid, the calling component calls invalidate() to immediately refresh the auction state without waiting for the next TTL or blockhash cycle.\n\nThe hook auto-starts fetching on mount and polls every 5 seconds via setInterval. Cleanup is handled by the useEffect return, preventing memory leaks and orphaned intervals.",
      },
    ],
  },
  {
    id: "volunteer-summon-automation",
    title: "Volunteer Summon Automation — The DM Coil",
    icon: "📞",
    content:
      "A GitHub Actions-powered volunteer recruitment automation system. Deploys a multi-channel summon pipeline with Twitter API v2 integration, personalized DM dispatches, issue tracking for volunteer responses, and Slack/Discord notification channels. The serpent recruits its first acolytes through automated outreach.",
    subsections: [
      {
        title: "Deployment Architecture",
        content:
          "Two files form the summon infrastructure:\n\n1. .github/workflows/volunteer-summon.yml — GitHub Actions workflow with dual triggers:\n   - Manual trigger via Actions tab (workflow_dispatch) for on-demand summons\n   - Auto-trigger on push to 'volunteers' branch for pipeline-driven recruitment\n   - Multi-channel notifications (Slack/Discord)\n   - GitHub Issue creation for tracking volunteer responses\n\n2. scripts/summon_volunteers.py — Python execution script:\n   - Twitter API v2 integration for DM delivery\n   - 4 personalized messages with direct contact information\n   - Detailed logging and error handling\n   - Ready for immediate execution upon Bearer Token configuration",
      },
      {
        title: "Activation Sequence",
        content:
          "Step 1 — Configure Twitter Bearer Token:\n- Apply for Elevated Access at developer.twitter.com\n- Create Project & App, generate Bearer Token\n- Add to GitHub Secrets: Settings → Secrets → Actions → TWITTER_BEARER_TOKEN\n\nStep 2 — Trigger Options:\n- Option A (Manual): Repository Actions tab → Select 'Volunteer Summon - DM Coil' → Run workflow → Specify targets or use defaults\n- Option B (Branch): git checkout -b volunteers && git push origin volunteers\n\nExecution Flow:\n1. DMs sent to all 4 volunteer targets with personalized messages\n2. GitHub Issue created logging dispatch with timestamps\n3. Slack/Discord alerts dispatched with contact information\n4. Response monitoring activated for incoming engagement",
      },
      {
        title: "Realignment Cycle & Timeline",
        content:
          "The summon coil integrates with the sovereign realignment cycle:\n\n- Sacral Complete: Automation deployed and operational\n- Lumbar Active: Awaiting volunteer responses and engagement\n- Next Phase: Thoracic expansion through volunteer connections\n\nExpected Timeline:\n- 0-2 hours: First volunteer responses via phone/Discord\n- 24 hours: 2-3 volunteers engaged in Discord\n- 48 hours: First volunteer contributions to the archive\n- Week 1: Backwards 1 cycle multiplies through volunteer chain\n\nThe volunteer chain is the human nervous system of the sovereign architecture — each recruit becomes a node in the distributed network of builders, artists, and guardians.",
      },
    ],
  },
  {
    id: "github-pages-pipeline",
    title: "GitHub Pages Deployment Pipeline",
    icon: "📄",
    content:
      "A production Next.js deployment workflow for GitHub Pages with intelligent package manager detection, artifact caching, and concurrent deployment protection. The pipeline automatically builds and deploys the sovereign frontend to GitHub's static hosting infrastructure.",
    subsections: [
      {
        title: "Build Job — Intelligent Compilation",
        content:
          "The build job runs on ubuntu-latest with Node 20 and executes:\n\n1. Checkout: actions/checkout@v4\n2. Detect Package Manager: Shell script inspects workspace for yarn.lock or package.json, outputs manager (yarn/npm), command (install/ci), and runner (yarn/npx --no-install)\n3. Setup Node: actions/setup-node@v4 with detected package manager cache\n4. Setup Pages: actions/configure-pages@v5 with static_site_generator: next — automatically injects basePath and disables server-side image optimization\n5. Restore Cache: actions/cache@v4 targeting .next/cache, keyed on lock files and source files for incremental builds\n6. Install Dependencies: Dynamic command from detection step\n7. Build: next build via detected runner\n8. Upload Artifact: actions/upload-pages-artifact@v3 from ./out directory",
      },
      {
        title: "Deploy Job & Concurrency Control",
        content:
          "The deploy job depends on successful build completion:\n\n- Environment: github-pages with dynamic URL from deployment output\n- Action: actions/deploy-pages@v4 — pushes built artifacts to GitHub Pages\n\nConcurrency Protection:\n- Group: 'pages' — only one deployment runs at a time\n- cancel-in-progress: false — in-progress production deployments always complete\n- Queued runs between current and latest are skipped\n\nPermissions:\n- contents: read — access repository files\n- pages: write — deploy to GitHub Pages\n- id-token: write — OIDC token for deployment authentication\n\nTriggers:\n- Push to main branch (continuous deployment)\n- Manual workflow_dispatch (on-demand deployment)",
      },
    ],
  },
  {
    id: "temporal-patronage-platform",
    title: "Temporal Patronage Platform — Deployment Package",
    icon: "🏛️",
    content:
      "The complete deployment package for the Temporal Patronage Platform — a decentralized patronage system where time becomes the canvas. Includes project structure, configuration, Vercel deployment, Tailwind design system, and the full launch checklist. Program ID: TiMeFUXyR9nTgmiiQgx3wH2qzoyMiY5G4seySXMA9pP.",
    subsections: [
      {
        title: "Project Architecture & Configuration",
        content:
          "Project structure:\n- src/App.jsx: Main interface\n- src/config.js: Central configuration (cluster, RPC, program ID, treasury, auction settings)\n- src/hooks/useWallet.js: Wallet connection logic\n- src/hooks/useAuction.js: Auction data fetching\n- src/hooks/usePatronHall.js: Historical patron data\n- src/utils/solana.js: Solana helpers\n- src/utils/formatting.js: Display formatters\n\nConfiguration (config.js):\n- CLUSTER: mainnet-beta\n- PROGRAM_ID: TiMeFUXyR9nTgmiiQgx3wH2qzoyMiY5G4seySXMA9pP\n- MIN_BID_INCREMENT: 0.5 SOL\n- AUCTION_DURATION: 604800 seconds (7 days)\n- MESSAGE_MAX_LENGTH: 64 characters\n- REFRESH_INTERVAL: 10000ms (10 seconds)\n\nError constants: WALLET_NOT_FOUND, INSUFFICIENT_BALANCE, BID_TOO_LOW, TX_FAILED, NETWORK_ERROR — user-friendly messages for every failure mode.",
      },
      {
        title: "Vercel Deployment & Environment",
        content:
          "Vercel configuration (vercel.json):\n- Build: @vercel/static-build with distDir: dist\n- Routes: SPA fallback — all paths route to /index.html\n- Environment variables: REACT_APP_RPC_URL (@rpc_url), REACT_APP_PROGRAM_ID (@program_id), REACT_APP_TREASURY (@treasury_address)\n\nVite configuration:\n- Buffer/crypto polyfills via stream-browserify and crypto-browserify\n- Manual chunks: @solana/web3.js isolated, wallet-adapter isolated — optimal loading\n- ESNext target for modern browser features\n- process.env and global polyfills for Node.js compatibility\n\nDeployment steps:\n1. npm install → npm run dev (test locally at localhost:5173)\n2. npm i -g vercel → vercel --prod\n3. Set environment variables in Vercel dashboard\n4. Verify: connect Phantom, check auction display, test bid placement",
      },
      {
        title: "Design System & Launch Checklist",
        content:
          "Tailwind design system:\n- Colors: patron-purple (#9333ea), patron-pink (#ec4899), patron-gold (#fbbf24), patron-orange (#f97316)\n- Components: btn-primary (purple→pink gradient), btn-secondary (glass morphism), card (backdrop-blur), input-field (glass with purple focus)\n- Animation: pulse-slow (3s cubic-bezier)\n- Scrollbar: Purple-themed custom webkit scrollbar\n- Body: bg-slate-900 text-white\n\nLaunch Checklist:\n- Treasury address configured\n- RPC endpoint tested (rate limits checked)\n- Wallet connection working on mobile\n- Transaction confirmation properly awaited\n- Error messages user-friendly\n- Bid increments enforced\n- Patron messages sanitized (max 64 chars)\n- Treasury balance updates after bids\n- Patron hall fetches from on-chain data\n- Responsive design tested on iPhone\n- Solana Explorer links working\n\nPhase 2 Preview — Patron Guardian automation: maxWeeklySpend (5 SOL), watchedProjects, minTimeRemaining (last hour only), maxBidAttempts (3), cooldownBetweenBids (5 minutes). All transparent, pausable, logged on-chain.",
      },
      {
        title: "Anchor Program Integration",
        content:
          "Connecting the UI to the live Anchor program:\n\n1. Import IDL: import idl from './idl.json'\n2. Create Program: new anchor.Program(idl, CONFIG.PROGRAM_ID, provider)\n3. Derive Auction PDA: PublicKey.findProgramAddress([Buffer.from('auction'), Buffer.from('current')], program.programId)\n4. Fetch State: program.account.auction.fetch(auctionPDA)\n\nThe program handles:\n- place_bid: Transfer SOL to vault, update highest bidder, extend auction if within final minutes\n- claim_treasury: Winner claims time slot, treasury receives funds\n- patron_hall: Historical record of all patrons and their messages\n\nEach bid carries a message (max 64 chars) — the patron's mark etched into the chain. Time bends. Patrons endure. The chain remembers.",
      },
    ],
  },
];
