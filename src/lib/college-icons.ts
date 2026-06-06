import {
  Wrench,
  Stethoscope,
  FlaskConical,
  Briefcase,
  Palette,
  Scale,
  BookMarked,
  GraduationCap,
  Dumbbell,
  Plane,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  eng: Wrench,
  med: Stethoscope,
  sci: FlaskConical,
  biz: Briefcase,
  arts: Palette,
  law: Scale,
  sharia: BookMarked,
  edu: GraduationCap,
  sport: Dumbbell,
  tour: Plane,
  general: Sparkles,
};

export const collegeIcon = (id: string): LucideIcon => map[id] ?? Sparkles;