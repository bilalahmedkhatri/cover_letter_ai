import type { Locale } from '../types';

export const pricingLabel: Record<Locale, string> = { en: 'Pricing', ru: 'Тарифы', es: 'Precios', fr: 'Tarifs', nl: 'Prijzen', pt: 'Preços', ar: 'الأسعار' };
export const pricingNotice: Record<Locale, string> = {
  en: '', ru: '', es: 'Los detalles de los planes están disponibles en inglés y ruso.',
  fr: 'Les détails des offres sont disponibles en anglais et en russe.',
  nl: 'De plandetails zijn beschikbaar in het Engels en Russisch.',
  pt: 'Os detalhes dos planos estão disponíveis em inglês e russo.',
  ar: 'تفاصيل الخطط متاحة باللغتين الإنجليزية والروسية.',
};
const en = {
  heading: 'A plan for your next application.',
  intro: 'Choose how much writing support you need. Every plan supports job letters, university applications and professional emails.',
  compare: 'Compare every plan', compareIntro: 'The same writing tools, with an allowance that fits your workload.',
  period: 'per 30 days', flexible: 'Features & usage',
  audiences: ['For a focused shortlist of applications.', 'For an active application season.', 'For a larger application workload.'],
  standard: 'Standard letters', premium: 'Premium letters', research: 'University research reports',
  upTo: 'Up to', or: 'or', wallet: 'These are alternative maximums. Standard letters, premium letters and research share one plan allowance; you can mix them.',
  categoryUsage: 'Writing & research allowance', categoryWriting: 'Writing tools', categoryResearch: 'Research scope',
  included: 'Included', noCredits: 'No usage deducted', planned: 'Coming soon',
  features: ['Job application letters', 'University admission letters', 'Professional emails', 'Seven interface languages', 'Tone and length controls', 'Manual editing, copy and local export'],
  report: 'One university / program per report', sources: 'Up to 5 official source pages per report', searches: 'Up to 3 web searches per report',
  faq: 'Before you choose', questions: [
    ['How do the letter limits work?', 'Each plan has one shared allowance. Starter covers up to 30 standard letters or 8 premium letters; Plus up to 70 or 18; Pro up to 100 or 28. A mix uses a portion of both limits, rather than adding the maximums together.'],
    ['Does editing use my allowance?', 'Manual changes, copying and local exports do not use your AI allowance. A fresh AI-generated draft or rewrite counts as another generation.'],
    ['What does university research include?', 'A report covers one university or program, with up to five official source pages and three web searches. Available requirements, deadlines, scholarships and contacts are presented with sources. An admission letter is a separate generation.'],
    ['Which plan should I choose?', 'Starter suits a focused shortlist. Plus gives more room for an active search. Pro offers the largest allowance for ongoing applications. All plans include the same writing tools.'],
  ],
  view: 'View plans and features', teaser: 'Find the right plan for your application workload.', statusTitle: 'Your plan',
};
const ru: typeof en = {
  heading: 'Тариф для вашей следующей заявки.',
  intro: 'Выберите объём помощи с письмами. Все тарифы поддерживают сопроводительные письма, заявки в университет и деловые письма.',
  compare: 'Сравнить все тарифы', compareIntro: 'Одинаковые инструменты с лимитом под вашу нагрузку.',
  period: 'за 30 дней', flexible: 'Возможности и лимиты',
  audiences: ['Для небольшого списка заявок.', 'Для активного поиска работы или учёбы.', 'Для большого объёма заявок.'],
  standard: 'Стандартные письма', premium: 'Премиальные письма', research: 'Отчёты об университетах',
  upTo: 'До', or: 'или', wallet: 'Это альтернативные максимумы. Стандартные письма, премиальные письма и исследования используют один общий лимит; задачи можно сочетать.',
  categoryUsage: 'Лимиты писем и исследований', categoryWriting: 'Инструменты для письма', categoryResearch: 'Объём исследования',
  included: 'Включено', noCredits: 'Без расхода лимита', planned: 'Скоро',
  features: ['Сопроводительные письма', 'Письма для поступления в университет', 'Деловые электронные письма', 'Семь языков интерфейса', 'Настройка тона и длины', 'Ручное редактирование, копирование и локальный экспорт'],
  report: 'Один университет / программа на отчёт', sources: 'До 5 официальных страниц на отчёт', searches: 'До 3 веб-поисков на отчёт',
  faq: 'Перед выбором тарифа', questions: [
    ['Как работают лимиты писем?', 'У каждого тарифа общий лимит. Starter: до 30 стандартных или 8 премиальных писем. Plus: до 70 или 18. Pro: до 100 или 28. При сочетании задач расходуются доли общего лимита, а не отдельные максимумы.'],
    ['Редактирование расходует лимит?', 'Ручные правки, копирование и локальный экспорт не расходуют лимит ИИ. Новый черновик или переписывание с ИИ считается новой генерацией.'],
    ['Что входит в исследование университета?', 'Отчёт охватывает один университет или программу: до пяти официальных страниц и трёх веб-поисков. Доступные требования, сроки, стипендии и контакты приводятся с источниками. Письмо для поступления создаётся отдельно.'],
    ['Какой тариф выбрать?', 'Starter подходит для небольшого списка заявок. Plus — для активного поиска. Pro даёт наибольший лимит для большого объёма заявок. Инструменты для письма одинаковы во всех тарифах.'],
  ],
  view: 'Тарифы и возможности', teaser: 'Выберите тариф под объём ваших заявок.', statusTitle: 'Ваш тариф',
};
export const pricingCopy = (locale: Locale) => locale === 'ru' ? ru : en;
