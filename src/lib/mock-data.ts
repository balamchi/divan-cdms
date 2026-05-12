// Mock ClickUp-shaped data for the Divan CDMS v1 demo.
// Replaced with Lovable Cloud + ClickUp sync in later phases.

export type TaskStatus =
  | "to do"
  | "in progress"
  | "Client Review"
  | "Approved"
  | "complete";

export type TaskKind =
  | "Publish Plan"
  | "Story Plan"
  | "Email"
  | "Ad"
  | "GBP Post"
  | "Influencer";

export interface Company {
  id: string;
  name: string;
  monthlyContentCount: number;
  mrr: number;
  postsDone: number;
  postsPlanned: number;
  reachDelta: number;
}

export interface Task {
  id: string;
  companyId: string;
  subject: string;
  description: string;
  kind: TaskKind;
  status: TaskStatus;
  publishDate: string; // ISO
  assignees: string[];
}

export const COMPANIES: Company[] = [
  { id: "vivia", name: "Vivia Riu Medspa", monthlyContentCount: 20, mrr: 3200, postsDone: 14, postsPlanned: 20, reachDelta: 34 },
  { id: "maple", name: "MapleDerm", monthlyContentCount: 16, mrr: 2800, postsDone: 13, postsPlanned: 16, reachDelta: 12 },
  { id: "par", name: "Par Aesthetics", monthlyContentCount: 18, mrr: 2950, postsDone: 9, postsPlanned: 18, reachDelta: -4 },
  { id: "muchin", name: "Muchin", monthlyContentCount: 12, mrr: 2100, postsDone: 11, postsPlanned: 12, reachDelta: 22 },
  { id: "venus", name: "Venus Cosmedical", monthlyContentCount: 18, mrr: 3050, postsDone: 16, postsPlanned: 18, reachDelta: 41 },
  { id: "rose", name: "Rose Beauty", monthlyContentCount: 14, mrr: 2200, postsDone: 6, postsPlanned: 14, reachDelta: -11 },
  { id: "maxx", name: "Maxx & Afi", monthlyContentCount: 16, mrr: 2100, postsDone: 12, postsPlanned: 16, reachDelta: 8 },
];

const today = new Date();
const iso = (offsetDays: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString();
};

export const TASKS: Task[] = [
  {
    id: "t-001",
    companyId: "vivia",
    subject: "May reel · Lip filler aftercare",
    description:
      "Vertical reel walking through the 24-hour aftercare routine for lip filler patients. Soft-lit B-roll over Vivia voiceover, captions burned in, brand teal lower-third.",
    kind: "Story Plan",
    status: "Client Review",
    publishDate: iso(2),
    assignees: ["Rahil", "Farnaz"],
  },
  {
    id: "t-002",
    companyId: "vivia",
    subject: "Carousel · 3 myths about Botox",
    description:
      "5-slide carousel debunking common Botox myths. Editorial type, off-white background, Vivia clinic photo on slide 1.",
    kind: "Publish Plan",
    status: "Client Review",
    publishDate: iso(4),
    assignees: ["Farnaz"],
  },
  {
    id: "t-003",
    companyId: "vivia",
    subject: "Story sequence · Behind the scenes shoot day",
    description: "9 vertical stories from the May 12 production day.",
    kind: "Story Plan",
    status: "in progress",
    publishDate: iso(5),
    assignees: ["Rahil"],
  },
  {
    id: "t-004",
    companyId: "vivia",
    subject: "Email · May newsletter — summer skin",
    description: "Monthly newsletter, 3 sections, CTA to book consult.",
    kind: "Email",
    status: "Approved",
    publishDate: iso(7),
    assignees: ["Moses"],
  },
  {
    id: "t-005",
    companyId: "vivia",
    subject: "GBP post · New patient promo",
    description: "Google Business Profile post, square asset.",
    kind: "GBP Post",
    status: "Approved",
    publishDate: iso(3),
    assignees: ["Milad"],
  },
  {
    id: "t-006",
    companyId: "maple",
    subject: "Reel · Microneedling explained",
    description: "60s educational reel.",
    kind: "Story Plan",
    status: "Client Review",
    publishDate: iso(1),
    assignees: ["Farnaz"],
  },
  {
    id: "t-007",
    companyId: "par",
    subject: "Carousel · Spring skincare routine",
    description: "5-slide carousel.",
    kind: "Publish Plan",
    status: "in progress",
    publishDate: iso(0),
    assignees: ["Rahil"],
  },
  {
    id: "t-008",
    companyId: "venus",
    subject: "Ad · Summer body promo",
    description: "Static ad, 1080x1350.",
    kind: "Ad",
    status: "to do",
    publishDate: iso(6),
    assignees: ["Mohammad"],
  },
  {
    id: "t-009",
    companyId: "muchin",
    subject: "Story · Owner takeover Friday",
    description: "Short story sequence by owner.",
    kind: "Story Plan",
    status: "Approved",
    publishDate: iso(2),
    assignees: ["Rahil"],
  },
  {
    id: "t-010",
    companyId: "rose",
    subject: "Publish · Brow lamination before/after",
    description: "Single post.",
    kind: "Publish Plan",
    status: "Client Review",
    publishDate: iso(3),
    assignees: ["Farnaz"],
  },
];

export const DIVAN_TEAM_FOR_CLIENT = [
  { name: "Shahab", role: "Account lead", initials: "SB" },
  { name: "Rahil", role: "Editor", initials: "RN" },
  { name: "Farnaz", role: "Designer", initials: "FA" },
];

export const TODAY_TASKS_FOR_TEAM = [
  { ...TASKS[2], active: true, timer: "01:24:38" },
  TASKS[6],
  TASKS[5],
  TASKS[8],
];
