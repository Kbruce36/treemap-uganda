import {
  BookOpen,
  Building2,
  Droplet,
  Equal,
  Factory,
  Fish,
  Globe,
  Handshake,
  HeartPulse,
  Recycle,
  Scale,
  Soup,
  Sun,
  TreeDeciduous,
  TrendingUp,
  Users,
  ArrowLeftRight,
  type LucideIcon,
} from "lucide-react";

export interface Sdg {
  number: number;
  title: string;
  short: string;
  color: string;
  icon: LucideIcon;
}

// Official UN SDG colours.
export const SDGS: Sdg[] = [
  { number: 1, title: "No Poverty", short: "No poverty", color: "#E5243B", icon: Users },
  { number: 2, title: "Zero Hunger", short: "Zero hunger", color: "#DDA63A", icon: Soup },
  { number: 3, title: "Good Health and Well-being", short: "Good health", color: "#4C9F38", icon: HeartPulse },
  { number: 4, title: "Quality Education", short: "Quality education", color: "#C5192D", icon: BookOpen },
  { number: 5, title: "Gender Equality", short: "Gender equality", color: "#FF3A21", icon: Equal },
  { number: 6, title: "Clean Water and Sanitation", short: "Clean water", color: "#26BDE2", icon: Droplet },
  { number: 7, title: "Affordable and Clean Energy", short: "Clean energy", color: "#FCC30B", icon: Sun },
  { number: 8, title: "Decent Work and Economic Growth", short: "Decent work", color: "#A21942", icon: TrendingUp },
  { number: 9, title: "Industry, Innovation and Infrastructure", short: "Innovation", color: "#FD6925", icon: Factory },
  { number: 10, title: "Reduced Inequalities", short: "Reduced inequalities", color: "#DD1367", icon: ArrowLeftRight },
  { number: 11, title: "Sustainable Cities and Communities", short: "Sustainable cities", color: "#FD9D24", icon: Building2 },
  { number: 12, title: "Responsible Consumption and Production", short: "Responsible consumption", color: "#BF8B2E", icon: Recycle },
  { number: 13, title: "Climate Action", short: "Climate action", color: "#3F7E44", icon: Globe },
  { number: 14, title: "Life Below Water", short: "Life below water", color: "#0A97D9", icon: Fish },
  { number: 15, title: "Life on Land", short: "Life on land", color: "#56C02B", icon: TreeDeciduous },
  { number: 16, title: "Peace, Justice and Strong Institutions", short: "Peace & justice", color: "#00689D", icon: Scale },
  { number: 17, title: "Partnerships for the Goals", short: "Partnerships", color: "#19486A", icon: Handshake },
];

export const getSdg = (n: number) => SDGS.find((s) => s.number === n);

/** Goals the chapter actively works on (the "bright" tiles on the chapter poster). */
export const CHAPTER_SDGS = [3, 4, 5, 13, 15, 16];
