import {
  PlaneTakeoff,
  Mountain,
  CalendarCheck,
  Clock,
  Briefcase,
  MapPin,
  Sparkles,
  Star,
  type LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  PlaneTakeoff,
  Mountain,
  CalendarCheck,
  Clock,
  Briefcase,
  MapPin,
  Sparkles,
  Star,
};

export function resolveIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? MapPin;
}