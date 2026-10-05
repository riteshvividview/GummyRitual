import { Bone, Brain, Droplet, Heart, LayoutGrid, Shield, TrendingUp, Zap, type LucideIcon } from "lucide-react";
import type { HeaderIcon } from "../../data/headerContent";

export const headerIconMap: Record<HeaderIcon, LucideIcon> = {
  shield: Shield,
  bone: Bone,
  brain: Brain,
  droplet: Droplet,
  grid: LayoutGrid,
  trendingUp: TrendingUp,
  zap: Zap,
  heart: Heart,
};
