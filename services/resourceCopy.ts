import type { Locale } from '../types';
import {publicWorkflows} from './workflow.mjs';
import { compareTranslations } from './compareCopy';
import { guidesTranslations } from './guidesCopy';

export type ResourcePage = '/features' | '/guides' | '/compare';
export const resourceLabels: Record<Locale, [string, string, string, string]> = {
  en: ['Features', 'Writing guides', 'Compare', 'Resources'],
  ru: ['Возможности', 'Как писать', 'Сравнение', 'Ресурсы'],
  es: ['Funciones', 'Guías de escritura', 'Comparar', 'Recursos'],
  fr: ['Fonctionnalités', 'Guides de rédaction', 'Comparer', 'Ressources'],
  nl: ['Functies', 'Schrijfgidsen', 'Vergelijken', 'Informatie'],
  pt: ['Recursos', 'Guias de escrita', 'Comparar', 'Guias'],
  ar: ['المزايا', 'أدلة الكتابة', 'المقارنة', 'الموارد'],
};
export const resourceNotice: Record<Locale, string> = {
  en: '', ru: '', es: 'Esta página está disponible en inglés y ruso.',
  fr: 'Cette page est disponible en anglais et en russe.', nl: 'Deze pagina is beschikbaar in het Engels en Russisch.',
  pt: 'Esta página está disponível em inglês e russo.', ar: 'هذه الصفحة متاحة بالإنجليزية والروسية.',
};
const en = {
  featuresTitle: 'A writing workspace for your next opportunity.',
  featuresIntro: 'Build a letter around your own experience. Bring in the opportunity details, choose how it should sound, and keep control of the final draft.',
  features: [
    ['Three ways to write', 'Prepare a job cover letter, university motivation letter or professional email. The same workspace adapts to your purpose, so you do not need to start over in a separate tool.'],
    ['Context before the first sentence', 'Add your experience and skills, upload a resume, and supply a vacancy URL or screenshot. For university applications, add the program name and university website. Only include achievements you can support.'],
    ['Tone and language you choose', 'Choose Professional, Formal, Enthusiastic or Concise, then select your output language. Add instructions about the audience, length and points you want to emphasize.'],
    ['A draft you can work on', 'Edit directly in the workspace. The live review shows word count and flags common unfinished placeholders. Set a target length based on the actual application requirements.'],
    ['Copy, download, revisit', 'Copy your edited text, download a plain-text file or export a PDF. Generated sessions are saved in this browser; they are not an account backup or cross-device sync.'],
    ['University context with sources', 'The university analysis tool can gather program information and source links. Confirm deadlines, eligibility and fees on the university’s official website before applying.'],
  ],
  limitsTitle: 'Know what the tools can tell you.',
  limits: 'The draft review checks length and common placeholders locally. It does not judge your qualifications, predict an ATS score or verify factual claims. AI drafts and research can contain mistakes; you make the final decision.',
  guidesTitle: 'Make your next draft specific.',
  guidesIntro: 'Use these practical outlines to prepare your inputs. A clear example from your own experience is more useful than a long list of generic strengths.',
  guides: [
    { kind: 'job', title: 'Job cover letter', audience: 'Connect one relevant achievement to the role.', steps: ['Opening: name the role and explain why this work interests you.', 'Evidence: describe one real project, your contribution and the result.', 'Fit: connect that example to a requirement in the vacancy.', 'Close: offer a conversation and check the recipient’s name.'], example: 'Instead of “I am a hardworking team player,” explain what you did: “I coordinated the weekly support handover so the incoming team had a clear list of unresolved cases.” Use your own example and add numbers only if you can verify them.', prompt: 'Write a focused cover letter for the role described. Connect my actual experience to one or two job requirements. Do not invent employers, achievements or metrics. Keep the language direct and end with a polite invitation to discuss the role.' },
    { kind: 'university', title: 'University motivation letter', audience: 'Show the connection between your background and this program.', steps: ['Motivation: explain the academic question or field you want to explore.', 'Preparation: use a course, project or work example as evidence.', 'Program fit: mention a verified module, research group or course feature.', 'Direction: explain how the program fits your next step.'], example: 'A program name alone is not a reason to apply. Explain which course or research topic connects to a project you have already done. Check that the course is offered in the relevant intake; do not invent a professor or scholarship.', prompt: 'Write a university motivation letter using my actual background and the selected program. Explain academic preparation and program fit. Use only verified program details supplied by me. Do not invent faculty names, scholarships or admission promises.' },
    { kind: 'email', title: 'Professional email', audience: 'Make it easy for the recipient to know what happens next.', steps: ['Subject: state the purpose in a short phrase.', 'Context: explain why you are contacting this person.', 'Request: ask for one clear action and include a real deadline if needed.', 'Close: thank the reader and check your signature.'], example: 'Replace a vague “Please get back to me” with a specific request, such as “Could you confirm whether the draft is ready for review by Thursday?” Use a real date and avoid making commitments on someone else’s behalf.', prompt: 'Write a concise professional email based on the context I provide. Include a clear subject, a specific request and a polite closing. Do not invent deadlines or commitments. Keep the tone helpful and direct.' },
  ],
  useOutline: 'Use this outline', outlineNote: 'Adds writing instructions to the generator. Your personal details stay unchanged.',
  beforeSend: 'Before you send', checks: ['Replace every placeholder with a real detail.', 'Read names, dates, qualifications and claims against your source information.', 'Follow the recipient’s word limit and document requirements.', 'Read it aloud and remove phrases you would never use yourself.'],
  compareTitle: 'Compare the price—and the work you need to do.',
  compareIntro: 'Our planned Starter price is $10 for 30 days, below the listed Rezi Pro and Teal+ 30-day prices. These products offer different tools and usage limits, so price alone does not tell the whole story.',
  compareHeading: 'A focused writing plan, from $10.',
  product: 'Product / plan', price: 'Listed price (USD)', focus: 'What you are choosing', source: 'Official pricing',
  ownFocus: 'Letter and email drafting. Starter maximum: 30 standard OR 8 premium letters OR 5 university researches from a shared allowance. Paid plans are being prepared.',
  reziFocus: 'A resume and job-application suite, including cover letters, resume tools and a monthly expert resume review.',
  tealFocus: 'A resume and job-search workspace, including job tracking, resume analysis and AI cover letters.',
  ownPeriod: ' / 30 days · planned', reziPeriod: ' / month', tealPeriod: ' / 30 days',
  checked: 'Official sources checked October 12, 2026. Published USD prices; taxes, currency conversion and promotions may differ. Competitor prices can change.',
  fair: 'Rezi and Teal also offer free options. Longer billing periods or promotions can reduce their effective price. Our Plus ($20) and Pro ($28) are also below these specific $29 plans, but we do not claim to be the cheapest tool or to offer equivalent unlimited usage.',
  choiceTitle: 'Which approach fits your application?',
  choice: 'Choose a focused writing workspace if your main task is drafting and refining a letter or email. Consider a broader career suite if you also need a resume builder, application tracking or expert resume reviews. Compare the features you will actually use, not just the headline price.',
  guideSection: 'From a general claim to a useful example.',
  guideSectionIntro: 'Strong letters explain what you contributed and why it matters to this opportunity. Start with a real situation, add your action, then connect the result to the role or program.',
  generic: 'Too general', specific: 'More specific', genericExample: '“I have excellent communication skills.”',
  specificExample: '“I wrote a handover guide that helped the next support shift understand open customer issues.”',
  exampleNote: 'Illustrative wording, not a claim about your experience. Replace it with something you actually did.',
  reviewSteps: ['Gather one relevant example from your background.', 'Explain your action without exaggeration.', 'Check the draft’s length and unfinished placeholders.'],
  viewGuides: 'Explore writing guides', viewCompare: 'Read the full comparison', start: 'Open the writing workspace',
};
const ru: typeof en = {
  featuresTitle: 'Рабочее пространство для вашего следующего письма.',
  featuresIntro: 'Создайте письмо на основе своего опыта. Добавьте сведения о вакансии или программе, выберите стиль и сохраните контроль над окончательным текстом.',
  features: [
    ['Три задачи в одном месте', 'Готовьте сопроводительные письма, мотивационные письма для университета и деловые электронные письма. Рабочее пространство подстраивается под вашу задачу.'],
    ['Сначала — контекст', 'Добавьте опыт и навыки, загрузите резюме, укажите ссылку или скриншот вакансии. Для университета добавьте название программы и сайт. Используйте только подтверждённые достижения.'],
    ['Ваш язык и стиль', 'Выберите профессиональный, формальный, воодушевлённый или краткий стиль и язык письма. Укажите получателя, желаемый объём и важные детали в инструкциях.'],
    ['Редактируемый черновик', 'Правьте текст прямо в рабочем пространстве. Проверка показывает количество слов и отмечает распространённые незаполненные шаблонные поля. Задайте объём по требованиям получателя.'],
    ['Копирование и загрузка', 'Копируйте текст, скачивайте TXT или экспортируйте PDF. Созданные сессии сохраняются в этом браузере: это не резервная копия аккаунта и не синхронизация между устройствами.'],
    ['Информация об университете', 'Инструмент анализа может собрать сведения о программе и ссылки на источники. Перед подачей проверьте сроки, требования и стоимость на официальном сайте университета.'],
  ],
  limitsTitle: 'Понимайте границы инструментов.',
  limits: 'Локальная проверка оценивает объём и распространённые шаблонные поля. Она не оценивает квалификацию, не прогнозирует балл ATS и не проверяет факты. ИИ может ошибаться; окончательное решение принимаете вы.',
  guidesTitle: 'Сделайте следующий черновик конкретнее.',
  guidesIntro: 'Используйте эти структуры для подготовки данных. Один реальный пример из вашего опыта полезнее длинного списка общих достоинств.',
  guides: [
    { kind: 'job', title: 'Сопроводительное письмо', audience: 'Свяжите реальное достижение с требованиями вакансии.', steps: ['Начало: назовите должность и объясните интерес к работе.', 'Доказательство: опишите проект, свой вклад и результат.', 'Соответствие: свяжите пример с требованием вакансии.', 'Завершение: предложите обсудить роль и проверьте имя получателя.'], example: 'Вместо «Я трудолюбивый командный игрок» расскажите о действии: «Я организовал передачу смены, чтобы новая команда видела список нерешённых обращений». Используйте свой пример и только подтверждённые цифры.', prompt: 'Напиши конкретное сопроводительное письмо для описанной вакансии. Свяжи мой реальный опыт с одним или двумя требованиями. Не придумывай работодателей, достижения или цифры. Используй ясный стиль и вежливо предложи обсудить роль.' },
    { kind: 'university', title: 'Мотивационное письмо', audience: 'Покажите связь между вашей подготовкой и программой.', steps: ['Мотивация: объясните интерес к области или исследовательскому вопросу.', 'Подготовка: приведите пример курса, проекта или работы.', 'Программа: упомяните проверенный модуль или направление исследований.', 'Цель: объясните, как обучение связано с вашим следующим шагом.'], example: 'Одного названия университета недостаточно. Объясните связь конкретного курса с вашим проектом. Проверьте, что курс доступен в нужном наборе; не придумывайте профессоров или стипендии.', prompt: 'Напиши мотивационное письмо на основе моего реального опыта и выбранной программы. Объясни подготовку и соответствие программе. Используй только предоставленные проверенные сведения. Не придумывай преподавателей, стипендии или обещания поступления.' },
    { kind: 'email', title: 'Деловое электронное письмо', audience: 'Помогите получателю понять следующий шаг.', steps: ['Тема: коротко укажите цель письма.', 'Контекст: объясните причину обращения.', 'Просьба: сформулируйте одно действие и реальный срок при необходимости.', 'Завершение: поблагодарите и проверьте подпись.'], example: 'Вместо «Прошу ответить» задайте конкретный вопрос: «Можете подтвердить, будет ли черновик готов к проверке к четвергу?» Указывайте реальные сроки и не обещайте что-либо от имени другого человека.', prompt: 'Напиши краткое деловое письмо на основе моего контекста. Добавь ясную тему, конкретную просьбу и вежливое завершение. Не придумывай сроки или обязательства. Используй понятный доброжелательный стиль.' },
  ],
  useOutline: 'Использовать структуру', outlineNote: 'Добавляет инструкции в генератор. Ваши личные данные остаются прежними.',
  beforeSend: 'Перед отправкой', checks: ['Замените все шаблонные поля реальными данными.', 'Сверьте имена, даты, квалификацию и утверждения с источниками.', 'Соблюдайте требования к объёму и формату.', 'Прочитайте текст вслух и уберите неестественные для вас фразы.'],
  compareTitle: 'Сравните цену и задачи, которые вам нужно решить.',
  compareIntro: 'Планируемая цена Starter — $10 за 30 дней, ниже указанной цены Rezi Pro и Teal+ за сопоставимый период. Инструменты и лимиты различаются: одной цены недостаточно для выбора.',
  compareHeading: 'Письма и электронная почта — от $10.',
  product: 'Продукт / тариф', price: 'Цена в USD', focus: 'Что вы выбираете', source: 'Официальные цены',
  ownFocus: 'Письма и электронная почта. Максимум Starter: 30 стандартных ИЛИ 8 премиальных писем ИЛИ 5 исследований университета из общего лимита. Платные тарифы готовятся к запуску.',
  reziFocus: 'Инструменты для резюме и поиска работы: сопроводительные письма, работа с резюме и ежемесячная экспертная проверка резюме.',
  tealFocus: 'Рабочее пространство для резюме и поиска работы: учёт вакансий, анализ резюме и сопроводительные письма с ИИ.',
  ownPeriod: ' / 30 дней · планируется', reziPeriod: ' / месяц', tealPeriod: ' / 30 дней',
  checked: 'Официальные источники проверены 12 октября 2026 г. Указаны опубликованные цены в USD; налоги, конвертация и акции могут отличаться. Цены конкурентов могут измениться.',
  fair: 'У Rezi и Teal есть бесплатные варианты. Длительные периоды оплаты и акции могут снизить стоимость. Plus ($20) и Pro ($28) тоже ниже этих конкретных тарифов за $29, но мы не заявляем, что наш сервис самый дешёвый или предлагает аналогичное безлимитное использование.',
  choiceTitle: 'Какой подход подходит вашей заявке?',
  choice: 'Выбирайте рабочее пространство для писем, если главная задача — создать и отредактировать текст. Рассмотрите более широкий карьерный сервис, если вам нужны конструктор резюме, учёт заявок или экспертная проверка. Сравнивайте функции, которыми будете пользоваться.',
  guideSection: 'От общего утверждения к полезному примеру.',
  guideSectionIntro: 'Хорошее письмо объясняет ваш вклад и его связь с вакансией или программой. Начните с реальной ситуации, опишите действие и свяжите результат с задачей.',
  generic: 'Слишком общее', specific: 'Конкретнее', genericExample: '«У меня отличные коммуникативные навыки».',
  specificExample: '«Я написал инструкцию по передаче смены, чтобы следующая команда понимала нерешённые обращения клиентов».',
  exampleNote: 'Это иллюстрация, а не утверждение о вашем опыте. Замените её реальным примером.',
  reviewSteps: ['Выберите один подходящий пример из своего опыта.', 'Опишите действие без преувеличений.', 'Проверьте объём и незаполненные шаблонные поля.'],
  viewGuides: 'Открыть руководства', viewCompare: 'Посмотреть сравнение', start: 'Открыть рабочее пространство',
};
export function resourceCopy(locale: Locale, page?: ResourcePage) {
  const base = locale === 'ru' ? ru : en;
  const translatedGuide = page === '/guides' ? guidesTranslations[locale] : undefined;
  const copy = page === '/compare' ? { ...base, ...compareTranslations[locale] } : translatedGuide
    ? { ...base, ...translatedGuide, guides: base.guides.map(guide => translatedGuide.guides.find(item => item.kind === guide.kind) ?? guide) } : base;
  return publicWorkflows.length===1 ? {...copy,features:[
    locale==='ru'?['Сопроводительные письма для работы','Подготовьте письмо на основе своего опыта и требований вакансии.']:['Job cover letters','Prepare a job cover letter from your own experience and the role requirements.'],
    locale==='ru'?['Контекст перед первым предложением','Добавьте опыт, навыки, резюме и текст вакансии. Используйте только подтверждённые факты.']:['Context before the first sentence','Add your experience and skills, upload a resume and supply the vacancy details. Include only achievements you can support.'],
    ...copy.features.slice(2),
  ]} : copy;
}
export function resourceMetadata(locale: Locale, page: ResourcePage) {
  const copy = resourceCopy(locale, page);
  return { title: ({ '/features': copy.featuresTitle, '/guides': copy.guidesTitle, '/compare': copy.compareTitle })[page] + ' | AI Letter Generator', description: ({ '/features': copy.featuresIntro, '/guides': copy.guidesIntro, '/compare': copy.compareIntro })[page] };
}
