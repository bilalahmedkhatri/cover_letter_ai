import 'server-only';
import type { Locale } from '../types';
import { resourceCopy } from './resourceCopy';

const labels: Record<Locale, [string, string, string, string, string, string, string, string]> = {
  en: ['A practical guide to your next application', 'Prepare accurate details, support your claims and review the final letter.', 'In this guide', 'Writing reference', 'Prepare your outline', 'Use real evidence', 'Review before sending', 'Open the writing workspace'],
  ru: ['Практическое руководство для следующей заявки', 'Подготовьте точные сведения, подтвердите утверждения и проверьте готовое письмо.', 'В этом руководстве', 'Руководство по написанию', 'Подготовьте структуру', 'Используйте реальные примеры', 'Проверьте перед отправкой', 'Открыть рабочее пространство'],
  es: ['Una guía práctica para tu próxima candidatura', 'Prepara datos precisos, respalda tus afirmaciones y revisa la carta final.', 'En esta guía', 'Guía de redacción', 'Prepara tu estructura', 'Usa evidencias reales', 'Revisa antes de enviar', 'Abrir el espacio de redacción'],
  fr: ['Un guide pratique pour votre prochaine candidature', 'Préparez des informations exactes, étayez vos affirmations et relisez la lettre finale.', 'Dans ce guide', 'Guide de rédaction', 'Préparez votre plan', 'Appuyez-vous sur des faits', 'Relisez avant l’envoi', 'Ouvrir l’espace de rédaction'],
  nl: ['Een praktische gids voor je volgende sollicitatie', 'Verzamel juiste gegevens, onderbouw je beweringen en controleer de uiteindelijke brief.', 'In deze gids', 'Schrijfgids', 'Bereid je opzet voor', 'Gebruik echte voorbeelden', 'Controleer vóór verzending', 'Open de schrijfwerkruimte'],
  pt: ['Um guia prático para sua próxima candidatura', 'Prepare informações corretas, sustente suas afirmações e revise a carta final.', 'Neste guia', 'Guia de escrita', 'Prepare sua estrutura', 'Use evidências reais', 'Revise antes de enviar', 'Abrir o espaço de escrita'],
  ar: ['دليل عملي لطلبك القادم', 'جهّز معلومات دقيقة وادعم ادعاءاتك وراجع الخطاب النهائي.', 'في هذا الدليل', 'دليل الكتابة', 'جهّز خطتك', 'استخدم أدلة حقيقية', 'راجع قبل الإرسال', 'افتح مساحة الكتابة'],
};

export function writingGuide(locale: Locale) {
  const [title, intro, contents, reference, outline, evidence, review, link] = labels[locale];
  const copy = resourceCopy(locale, '/guides');
  const job = copy.guides.find(guide => guide.kind === 'job')!;
  return { title, intro, contents, reference, link, sections: [
    { id: 'writing-outline', title: outline, paragraphs: job.steps, link: '/dashboard' },
    { id: 'writing-evidence', title: evidence, paragraphs: [job.example], link: '/dashboard' },
    { id: 'writing-review', title: review, paragraphs: copy.checks, link: '/dashboard' },
  ] };
}
