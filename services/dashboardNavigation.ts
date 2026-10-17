import { SquarePen, GraduationCap, BookOpen, Mail, Settings, CreditCard } from 'lucide-react';

export const dashboardNavigation = [
  { view: 'overview', suffix: '', title: 'New Chat', Icon: SquarePen },
  { view: 'university', suffix: '/university', title: 'University application', Icon: GraduationCap },
  { view: 'research', suffix: '/research', title: 'University research', Icon: BookOpen },
  { view: 'email', suffix: '/email', title: 'Professional email', Icon: Mail },
  { view: 'billing', suffix: '/billing', title: 'Plan & usage', Icon: CreditCard },
  { view: 'settings', suffix: '/settings', title: 'Profile & settings', Icon: Settings },
] as const;
