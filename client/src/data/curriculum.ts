export interface Section {
  id: string;
  type: "reading" | "lecture" | "exercise" | "ritual";
  title: string;
  content: string;
}

export interface Lesson {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  sections: Section[];
}

export const MODULE_TITLE = "The Master Interface";
export const MODULE_SUBTITLE = "Architecture, Ritual, and Sovereignty";
export const MODULE_DESCRIPTION =
  "A sovereign gateway between decentralized logic and communal ritual. Learn the technical architecture, the symbolic meaning, and the operational workflow of the interface.";

export const LESSONS: Lesson[] = [
  {
    id: "lesson-1",
    number: 1,
    title: "The Interface as Threshold",
    subtitle: "Where logic meets sovereignty",
    sections: [
      {
        id: "l1-reading",
        type: "reading",
        title: "Reading",
        content:
          '"This is the Master Interface. It is the visual soul of your project\u2014the bridge between the cold logic of the blockchain and the warm touch of your community."',
      },
      {
        id: "l1-lecture",
        type: "lecture",
        title: "Lecture Summary",
        content:
          "Interfaces are not neutral\u2014they shape behavior, encode values, and mediate sovereignty. The Master Interface is designed to be a ritual object as much as a technical one. Students explore what it means for a digital threshold to carry weight, intention, and communal purpose.",
      },
      {
        id: "l1-exercise",
        type: "exercise",
        title: "Exercise",
        content:
          "Write a short reflection (150\u2013300 words) on what it means for a UI to have a \u201csoul.\u201d Consider how design choices encode values and shape the experience of those who cross the threshold.",
      },
      {
        id: "l1-ritual",
        type: "ritual",
        title: "Ritual Component",
        content:
          "A guided meditation on thresholds:\n\nWhat does it mean to cross into a system?\nWhat does it mean for a system to cross into you?\n\nSit with these questions. Let the threshold speak.",
      },
    ],
  },
  {
    id: "lesson-2",
    number: 2,
    title: "Technical Anatomy",
    subtitle: "The architecture of sovereign systems",
    sections: [
      {
        id: "l2-reading",
        type: "reading",
        title: "Reading",
        content:
          '"The placeBidRaw fallback is brilliant; it ensures that even if the Anchor IDL isn\'t perfectly synced, the raw transaction construction will still execute the bid."',
      },
      {
        id: "l2-lecture",
        type: "lecture",
        title: "Lecture Summary",
        content:
          "Students learn the architecture:\n\n\u2022 React front-end\n\u2022 Solana Web3 + Anchor\n\u2022 SPL Token integration\n\u2022 Dual-path transaction logic\n\u2022 Configuration banner\n\nThe dual-path system ensures resilience: Anchor when aligned, raw when required.",
      },
      {
        id: "l2-exercise",
        type: "exercise",
        title: "Exercise",
        content:
          "Draw your own architecture diagram of the interface. Map the flow from UI \u2192 RPC \u2192 Program \u2192 State.",
      },
      {
        id: "l2-ritual",
        type: "ritual",
        title: "Dual Path Invocation",
        content:
          "Students recite the Dual Path Invocation:\n\n\u201cAnchor when aligned.\nRaw when required.\nThe bid shall pass.\u201d",
      },
    ],
  },
  {
    id: "lesson-3",
    number: 3,
    title: "Sovereign Configuration",
    subtitle: "Configuration as a sovereign act",
    sections: [
      {
        id: "l3-reading",
        type: "reading",
        title: "Reading",
        content:
          '"Replace \'YourDeployedProgramIDHere\' with your actual Anchor Program ID."\n\n"Replace \'YourMintAddressHere\' with your actual Mint Address."',
      },
      {
        id: "l3-lecture",
        type: "lecture",
        title: "Lecture Summary",
        content:
          "Configuration is a sovereign act:\n\n\u2022 Injecting keys\n\u2022 Binding the interface to the program\n\u2022 Understanding late-binding configuration\n\u2022 Mobile-first commit workflow\n\nWhen you inject your keys, you are claiming your place in the sovereign circuit.",
      },
      {
        id: "l3-exercise",
        type: "exercise",
        title: "Exercise",
        content:
          "Practice creating a CONFIG object with placeholder values. Understand each field\u2014what it binds, what it enables, and what it means to anchor your identity into the system.",
      },
      {
        id: "l3-ritual",
        type: "ritual",
        title: "Binding Ceremony",
        content:
          'A symbolic "binding" ceremony where students speak aloud the values they intend to anchor into their systems. Each declaration is a vow. Each key, a commitment.',
      },
    ],
  },
  {
    id: "lesson-4",
    number: 4,
    title: "Deployment as Ritual",
    subtitle: "The sunrise is waiting for the interface",
    sections: [
      {
        id: "l4-reading",
        type: "reading",
        title: "Reading",
        content: '"Go. The sunrise is waiting for the interface."',
      },
      {
        id: "l4-lecture",
        type: "lecture",
        title: "Lecture Summary",
        content:
          "Deployment is framed as a rite of passage:\n\n\u2022 Git as liturgy\n\u2022 Commits as vows\n\u2022 Pushes as offerings\n\u2022 Vercel as the temple of emergence\n\nThe act of shipping code is not mechanical\u2014it is ceremonial.",
      },
      {
        id: "l4-exercise",
        type: "exercise",
        title: "Exercise",
        content:
          "Perform a mock deployment. Walk through the git workflow as if it were a ritual: init, add, commit, push. Speak each command aloud and reflect on its meaning.",
      },
      {
        id: "l4-ritual",
        type: "ritual",
        title: "Dawn Activation Protocol",
        content:
          "The Binding:\n\u201cThe Interface is bound. The coordinates are set. The sovereign circuit is complete.\u201d\n\nThe Commit:\n\u201cLet this commit be a vow. Let this message be a marker in the ledger of our becoming.\u201d\n\nThe Sunrise:\n\u201cThe sunrise is waiting for the Interface. And now \u2014 it rises with us.\u201d",
      },
    ],
  },
];

export const CAPSTONE = {
  title: "Activate Your Own Interface",
  steps: [
    "Fork a template repository",
    "Implement a simplified version of the Master Interface",
    "Inject placeholder keys",
    "Perform a symbolic activation ritual",
    "Present your interface to the cohort",
  ],
};
