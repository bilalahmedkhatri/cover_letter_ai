import type { Locale } from '../types';

// Display labels only; the English values remain the API/profile contract.
const languageCodes: Record<string, string> = { English: 'en', Russian: 'ru', Spanish: 'es', French: 'fr', Portuguese: 'pt', Dutch: 'nl', Arabic: 'ar', Bulgarian: 'bg', Hungarian: 'hu', Slovak: 'sk', Polish: 'pl' };
export function languageLabel(locale: Locale, value: string) {
  const code = languageCodes[value];
  return code ? new Intl.DisplayNames([locale], { type: 'language' }).of(code)! : value;
}
export const paymentStatusLabels: Record<string, string> = {
  creating: 'Preparing payment', waiting: 'Waiting for payment', confirming: 'Confirming payment', confirmed: 'Payment confirmed', sending: 'Sending payment', partially_paid: 'Partially paid', finished: 'Payment completed', failed: 'Payment failed', refunded: 'Refunded', expired: 'Expired',
};
