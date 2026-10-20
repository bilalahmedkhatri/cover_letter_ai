import type { Locale } from '../types';

const copy: Record<Locale, { writing: string; research: string; opening: string; wait: string }> = {
  en: { writing: 'Preparing your draft…', research: 'Preparing your research…', opening: 'Opening your draft…', wait: 'This may take a moment. Your result will open automatically when it’s ready.' },
  ru: { writing: 'Готовим ваш черновик…', research: 'Готовим исследование…', opening: 'Открываем ваш черновик…', wait: 'Это может занять некоторое время. Готовый результат откроется автоматически.' },
  fr: { writing: 'Préparation de votre brouillon…', research: 'Préparation de votre recherche…', opening: 'Ouverture de votre brouillon…', wait: 'Cela peut prendre un moment. Le résultat s’ouvrira automatiquement dès qu’il sera prêt.' },
  es: { writing: 'Preparando tu borrador…', research: 'Preparando tu investigación…', opening: 'Abriendo tu borrador…', wait: 'Puede tardar un momento. El resultado se abrirá automáticamente cuando esté listo.' },
  pt: { writing: 'Preparando seu rascunho…', research: 'Preparando sua pesquisa…', opening: 'Abrindo seu rascunho…', wait: 'Isso pode levar um momento. O resultado será aberto automaticamente quando estiver pronto.' },
  nl: { writing: 'Je concept wordt voorbereid…', research: 'Je onderzoek wordt voorbereid…', opening: 'Je concept wordt geopend…', wait: 'Dit kan even duren. Het resultaat wordt automatisch geopend zodra het klaar is.' },
  ar: { writing: 'جارٍ إعداد مسودتك…', research: 'جارٍ إعداد بحثك…', opening: 'جارٍ فتح مسودتك…', wait: 'قد يستغرق ذلك بعض الوقت. ستُفتح النتيجة تلقائيًا عندما تصبح جاهزة.' },
};

export const generationStatusCopy = (locale: Locale) => copy[locale];
