import type { ReactNode } from 'react';

export default function DashboardPage({ centered = false, children }: { centered?: boolean; children: ReactNode }) {
  return <div className={`mx-auto w-full max-w-7xl${centered ? ' flex flex-1 flex-col justify-center py-6' : ''}`}>{children}</div>;
}
