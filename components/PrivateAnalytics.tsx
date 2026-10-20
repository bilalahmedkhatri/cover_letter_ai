'use client';
import { Analytics } from '@vercel/analytics/next';
import { redactAnalyticsEvent } from '@/services/analyticsPrivacy.mjs';

export default function PrivateAnalytics() {
  return <Analytics beforeSend={redactAnalyticsEvent}/>;
}
