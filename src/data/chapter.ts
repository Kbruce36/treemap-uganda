import { Mic, Presentation, HandHeart, GraduationCap, Sprout, type LucideIcon } from "lucide-react";

export const CHAPTER = {
  name: "United Nations Association of Uganda",
  chapter: "Kyambogo University Chapter",
  shortName: "UNAU Kyambogo",
  tagline: "Global Goals. Local Action.",
  description:
    "A non-profit organisation registered in Uganda and affiliated to the World Federation of United Nations Associations. The Kyambogo Chapter is one of 11 university chapters nationwide. It is student-run and open to every faculty.",
  mission: "To promote the aims and ideals of the United Nations.",
  vision: "A peaceful and prosperous world.",
  address: "Kyambogo University, Banda, Kyambogo Hill Campus, Kampala, Uganda",
  email: "unaukyambogo@gmail.com",
  phone: "+256 709 667270",
  phoneHref: "tel:+256709667270",
  membershipFee: "UGX 10,000",
  socials: {
    instagram: { handle: "@unau_kyambogo", url: "https://instagram.com/unau_kyambogo" },
    x: { handle: "@UnauKYU", url: "https://x.com/UnauKYU" },
  },
} as const;

export interface Pillar {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const PILLARS: Pillar[] = [
  { title: "X-Spaces", description: "Live online forums on the issues that matter to young people.", icon: Mic },
  { title: "Conferences & dialogue", description: "Public dialogue with policymakers and practitioners.", icon: Presentation },
  { title: "Community outreach", description: "Clean-ups, donation drives and tree planting with our neighbours.", icon: HandHeart },
  { title: "Schools & mentorship", description: "Taking what we learn back to younger students.", icon: GraduationCap },
  { title: "Environment", description: "Every tree we plant, mapped and cared for on UNAU TreeMap.", icon: Sprout },
];

export const PROJECT_CATEGORIES = [
  "Environment",
  "Community outreach",
  "Conferences & dialogue",
  "Schools & mentorship",
  "X-Spaces",
  "Chapter life",
] as const;

export const MEMBER_BENEFITS = [
  "A certificate of appreciation for your work",
  "A platform to express your leadership",
  "A global network of like-minded changemakers",
  "A front-row seat in driving the Global Goals",
];
