import type { Locale } from '../types';
import { translations, type TranslationKeys } from './translations';
import { localizedPath, localeCodes, siteOrigin, type Page } from './routing';
import { resourceMetadata, type ResourcePage } from './resourceCopy';
import { pricingLabel } from './pricingCopy';
import { businessLetterCopy } from './businessLetterCopy.mjs';
import { blogCopy, findBlogPost } from './blogContent.mjs';

const titles: Partial<Record<Page, TranslationKeys>> = {
  '/': 'titleHome', '/dashboard': 'titleDashboard', '/about': 'titleAbout',
  '/privacy': 'titlePrivacy', '/terms': 'titleTerms', '/404': 'title404', '/login': 'titleDashboard', '/account': 'titleDashboard',
};
const descriptions: Record<Locale, string[]> = {
  en: [
    'Draft a cover letter, university application or professional email with AI. Add your background and opportunity details, then review and edit your draft.',
    'Create your letter step by step. Add your experience, job or university details, choose a tone and review the generated draft before using it.',
    'Learn how AI Letter Generator helps you prepare job applications, university admission letters and professional emails.',
    'Read the AI Letter Generator privacy policy, including information processing, third-party services and contact details.',
    'Read the terms for using AI Letter Generator, including user responsibilities and the limitations of AI-generated drafts.',
  ],
  ru: [
    'Создайте сопроводительное письмо, письмо для поступления в университет или деловое электронное письмо с ИИ. Добавьте свои данные и отредактируйте черновик.',
    'Создайте письмо пошагово: укажите опыт, сведения о вакансии или университете, выберите тон и проверьте готовый черновик.',
    'Узнайте, как AI Letter Generator помогает готовить сопроводительные письма, заявления в университет и деловые электронные письма.',
    'Ознакомьтесь с политикой конфиденциальности AI Letter Generator: обработка информации, сторонние сервисы и контактные данные.',
    'Ознакомьтесь с условиями использования AI Letter Generator, обязанностями пользователей и ограничениями текстов, созданных ИИ.',
  ],
  es: [
    'Redacta una carta de presentación, una solicitud universitaria o un correo profesional con IA. Añade tus datos y revisa y edita el borrador.',
    'Crea tu carta paso a paso: añade tu experiencia y los detalles del empleo o universidad, elige el tono y revisa el borrador.',
    'Descubre cómo AI Letter Generator te ayuda a preparar cartas de presentación, solicitudes universitarias y correos profesionales.',
    'Lee la política de privacidad de AI Letter Generator: tratamiento de información, servicios de terceros y datos de contacto.',
    'Consulta las condiciones de AI Letter Generator, las responsabilidades del usuario y las limitaciones de los borradores creados con IA.',
  ],
  fr: [
    'Rédigez une lettre de motivation, une candidature universitaire ou un e-mail professionnel avec l’IA. Ajoutez vos informations et révisez votre brouillon.',
    'Créez votre lettre étape par étape : expérience, détails du poste ou de l’université, choix du ton et relecture du brouillon.',
    'Découvrez comment AI Letter Generator vous aide à préparer des lettres de motivation, des candidatures universitaires et des e-mails professionnels.',
    'Consultez la politique de confidentialité d’AI Letter Generator : traitement des informations, services tiers et coordonnées.',
    'Consultez les conditions d’AI Letter Generator, les responsabilités des utilisateurs et les limites des brouillons générés par IA.',
  ],
  nl: [
    'Schrijf met AI een sollicitatiebrief, toelatingsbrief voor een universiteit of zakelijke e-mail. Voeg je gegevens toe en controleer en bewerk het concept.',
    'Maak je brief stap voor stap: voeg ervaring en vacature- of opleidingsgegevens toe, kies een toon en controleer het concept.',
    'Ontdek hoe AI Letter Generator helpt bij sollicitatiebrieven, toelatingsbrieven voor universiteiten en zakelijke e-mails.',
    'Lees het privacybeleid van AI Letter Generator over informatieverwerking, diensten van derden en contactgegevens.',
    'Lees de gebruiksvoorwaarden van AI Letter Generator, gebruikersverantwoordelijkheden en beperkingen van AI-concepten.',
  ],
  pt: [
    'Crie uma carta de apresentação, candidatura universitária ou e-mail profissional com IA. Adicione seus dados e revise e edite o rascunho.',
    'Crie sua carta passo a passo: informe sua experiência e os detalhes da vaga ou universidade, escolha o tom e revise o rascunho.',
    'Saiba como o AI Letter Generator ajuda a preparar cartas de apresentação, candidaturas universitárias e e-mails profissionais.',
    'Leia a política de privacidade do AI Letter Generator: processamento de informações, serviços de terceiros e contatos.',
    'Leia os termos do AI Letter Generator, as responsabilidades dos usuários e as limitações dos rascunhos gerados por IA.',
  ],
  ar: [
    'أنشئ خطاب تقديم لوظيفة أو طلب قبول جامعي أو بريدًا مهنيًا بالذكاء الاصطناعي. أضف معلوماتك ثم راجع المسودة وعدّلها.',
    'أنشئ خطابك خطوة بخطوة: أضف خبراتك وتفاصيل الوظيفة أو الجامعة، واختر الأسلوب ثم راجع المسودة قبل استخدامها.',
    'تعرّف على كيفية استخدام AI Letter Generator لإعداد خطابات التقديم للوظائف والقبول الجامعي ورسائل البريد المهني.',
    'اطّلع على سياسة خصوصية AI Letter Generator، بما فيها معالجة المعلومات وخدمات الجهات الخارجية وبيانات الاتصال.',
    'اطّلع على شروط استخدام AI Letter Generator ومسؤوليات المستخدمين وحدود المسودات المنشأة بالذكاء الاصطناعي.',
  ],
};
const pages = ['/', '/dashboard', '/about', '/privacy', '/terms'];
const ogLocales: Record<Locale, string> = { en: 'en_US', ru: 'ru_RU', es: 'es_ES', fr: 'fr_FR', nl: 'nl_NL', pt: 'pt_BR', ar: 'ar_AR' };
export const legalLanguageNotice: Record<Locale, string> = {
  en: 'This policy is currently available in English.',
  ru: 'Текст этой политики пока доступен только на английском языке.',
  es: 'El texto de esta política está disponible actualmente en inglés.',
  fr: 'Le texte de cette politique est actuellement disponible en anglais.',
  nl: 'De tekst van dit beleid is momenteel beschikbaar in het Engels.',
  pt: 'O texto desta política está atualmente disponível em inglês.',
  ar: 'نص هذه السياسة متاح حاليًا باللغة الإنجليزية.',
};

// Legal bodies remain the original English text until full policy translations are reviewed.
export function alternateLocales(page: Page): Locale[] {
  if (page.startsWith('/blog/')) return []; // Article bodies currently remain English.
  if (['/login','/account'].includes(page) || page.startsWith('/dashboard')) return [];
  if (['/pricing', '/features', '/guides', '/compare'].includes(page)) return ['en', 'ru'];
  return page === '/privacy' || page === '/terms' ? [] : localeCodes;
}
export function getMetadata(locale: Locale, page: Page) {
  const resource = ['/features', '/guides', '/compare'].includes(page) ? resourceMetadata(locale, page as ResourcePage) : null;
  const business = page === '/' ? businessLetterCopy[locale] : null;
  const post = page.startsWith('/blog/') ? findBlogPost(page.slice(6)) : null;
  const blog = page === '/blog' ? { title: `${blogCopy[locale].label} | ailettergen`, description: blogCopy[locale].intro } : post ? { title: `${post.title} | ailettergen`, description: post.intro } : null;
  return {
    title: page.startsWith('/dashboard') ? `${locale==='ru'?'Ваш кабинет':'Your dashboard'} | AI Letter Generator` : ['/login','/account'].includes(page) ? `${locale === 'ru' ? (page === '/login' ? 'Войти' : 'Ваш кабинет') : (page === '/login' ? 'Sign in' : 'Your account')} | AI Letter Generator` : blog?.title ?? resource?.title ?? (page === '/pricing' ? `${pricingLabel[locale]} | AI Letter Generator` : translations[locale][titles[page as keyof typeof titles]]),
    description: blog?.description ?? business?.description ?? resource?.description ?? (page === '/pricing' ? (locale === 'ru' ? 'Сравните Starter за $10, Plus за $20 и Pro за $28: кредиты, лимиты писем и исследований, возможности и продление на 30 дней. Платные тарифы готовятся к запуску.' : 'Compare Starter $10, Plus $20 and Pro $28: shared credits, letter and research limits, features and 30-day prepaid renewal. Paid plans are being prepared.') : descriptions[locale][pages.indexOf(page)] || translations[locale].title404),
    canonical: siteOrigin + localizedPath(post ? 'en' : locale, page),
    ogLocale: ogLocales[locale],
  };
}
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]!));
}
export function metadataHtml(locale: Locale, page: Page): string {
  const meta = getMetadata(locale, page);
  return `<title>${escapeHtml(meta.title)}</title>
<meta name="description" content="${escapeHtml(meta.description)}">
<meta name="robots" content="${['/404','/login','/account'].includes(page) ? 'noindex,follow' : 'index,follow'}">
${page === '/404' ? '' : `<link rel="canonical" href="${meta.canonical}">`}
${page === '/404' ? '' : alternateLocales(page).map(code => `<link rel="alternate" hreflang="${code}" href="${siteOrigin + localizedPath(code, page)}">`).join('\n')}
${page === '/404' || alternateLocales(page).length === 0 ? '' : `<link rel="alternate" hreflang="x-default" href="${siteOrigin + localizedPath('en', page)}">`}
<meta property="og:site_name" content="AI Letter Generator">
<meta property="og:type" content="website">
<meta property="og:title" content="${escapeHtml(meta.title)}">
<meta property="og:description" content="${escapeHtml(meta.description)}">
<meta property="og:url" content="${meta.canonical}">
<meta property="og:locale" content="${meta.ogLocale}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${escapeHtml(meta.title)}">
<meta name="twitter:description" content="${escapeHtml(meta.description)}">`;
}
export function updateMetadata(locale: Locale, page: Page): void {
  const meta = getMetadata(locale, page);
  document.title = meta.title;
  const setMeta = (attribute: 'name' | 'property', key: string, value: string) => {
    let element = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
    if (!element) { element = document.createElement('meta'); element.setAttribute(attribute, key); document.head.append(element); }
    element.content = value;
  };
  setMeta('name', 'description', meta.description);
  setMeta('name', 'robots', ['/404','/login','/account'].includes(page) ? 'noindex,follow' : 'index,follow');
  setMeta('property', 'og:title', meta.title);
  setMeta('property', 'og:description', meta.description);
  setMeta('property', 'og:locale', meta.ogLocale);
  setMeta('name', 'twitter:title', meta.title);
  setMeta('name', 'twitter:description', meta.description);
}
