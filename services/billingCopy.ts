import type { Locale } from '../types';
const en = {
  title: 'Choose your plan', subtitle: '30-day prepaid access. Renew manually with a new crypto payment.',
  credits: 'credits', buy: 'Pay with crypto', creating: 'Opening checkout…', refresh: 'Check payment',
  unavailable: 'Checkout is being prepared. Payments are not available yet.',
  browser: 'Access is linked to this browser. Keep your payment receipt; clearing browser cookies removes access.',
  pending: 'Payment pending. Access activates after the payment is fully received and verified.',
  paid: 'Payment verified', expired: 'Access expired', balance: 'Credit allocation',
  bonus: 'Includes 10% extra usage', cancelled: 'Checkout closed. You can check your payment or try again.',
  retry: 'Unable to check payment. Please try again.', resume: 'Continue payment',
  terminal: 'Payment needs attention. Keep your receipt and contact support before sending more funds.',
  sandbox: 'Test checkout — no live payment', preview: 'Paid AI models and usage enforcement are still being prepared. Checkout is disabled until launch.',
};
const ru: typeof en = {
  title: 'Выберите план', subtitle: 'Предоплаченный доступ на 30 дней. Продление вручную новым криптоплатежом.',
  credits: 'кредитов', buy: 'Оплатить криптовалютой', creating: 'Открываем оплату…', refresh: 'Проверить платёж',
  unavailable: 'Оплата ещё настраивается и пока недоступна.',
  browser: 'Доступ привязан к этому браузеру. Сохраните квитанцию; удаление файлов cookie удалит доступ.',
  pending: 'Ожидаем оплату. Доступ активируется после получения и проверки полной суммы.',
  paid: 'Платёж подтверждён', expired: 'Доступ истёк', balance: 'Баланс кредитов',
  bonus: 'Включает 10% дополнительных кредитов', cancelled: 'Оплата закрыта. Проверьте платёж или повторите попытку.',
  retry: 'Не удалось проверить платёж. Попробуйте ещё раз.', resume: 'Продолжить оплату',
  terminal: 'Платёж требует проверки. Сохраните квитанцию и обратитесь в поддержку, прежде чем отправлять ещё средства.',
  sandbox: 'Тестовая оплата — без реального платежа', preview: 'Платные модели ИИ и учёт использования ещё готовятся. Оплата отключена до запуска.',
};
export const billingCopy = (locale: Locale) => locale === 'ru' ? ru : en;

