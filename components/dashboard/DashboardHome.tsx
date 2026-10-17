'use client';
import { useState } from 'react';
import Generator, { type Kind } from '@/components/generator/Generator';
export default function DashboardHome() {
  const [kind, setKind] = useState<Kind>('cover-letter');
  return <Generator kind={kind} onKindChange={setKind} compact />;
}
