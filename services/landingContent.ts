import type { Locale } from '../types';

type Content = { title: string; intro: string; cases: [string, string][]; toolsTitle: string; tools: [string, string][]; prepareTitle: string; prepareIntro: string; checklist: string[]; reviewTitle: string; review: string };
const content: Record<Locale, Content> = {
  en: {
    title: 'The right words for the opportunity in front of you.',
    intro: 'A useful letter connects what you have done with what the reader needs to know. Start with your real experience, add the details of the opportunity, and shape the draft into something you would actually send.',
    cases: [
      ['A cover letter that has a reason to exist', 'Introduce yourself to a hiring team, connect relevant experience to the role and explain why the opportunity interests you. Include a concrete achievement or project so your letter adds context to your resume.'],
      ['An application that explains your direction', 'For university admissions, describe your academic background, interests and goals. Add the program and university details to explain why this course is the next step for you. Verify admission requirements on the official website.'],
      ['An email with a clear next step', 'Draft a professional introduction, inquiry or follow-up. Set the purpose, recipient and tone so the message gets to the point and makes the requested action easy to understand.'],
    ],
    toolsTitle: 'Build the draft around your details.',
    tools: [
      ['Bring your background', 'Enter your experience, skills and achievements. Use specific facts instead of generic claims about being passionate or hardworking.'],
      ['Choose tone and length', 'Match the style to your reader: a concise professional email, a formal application or a more personal introduction.'],
      ['Keep control of the final wording', 'Edit the draft, remove anything that does not sound like you and copy or export the version you want to keep. Drafts stay in this browser; save important work separately.'],
    ],
    prepareTitle: 'A little context makes a better first draft.',
    prepareIntro: 'You do not need a perfect brief. These details give the generator a useful starting point:',
    checklist: ['The role, program or reason for your email', 'Two or three relevant experiences or achievements', 'Who will read the letter and what you want them to do', 'The language, tone and approximate length you prefer'],
    reviewTitle: 'Your experience. Your final decision.',
    review: 'AI can help organize a draft, but it cannot confirm your achievements or guarantee an interview or admission. Check names, dates, requirements and every factual claim. Read the letter aloud and make sure it represents you before sending it.',
  },
  ru: {
    title: 'Подходящие слова для вашей следующей возможности.',
    intro: 'Хорошее письмо связывает ваш опыт с тем, что важно читателю. Начните с реальных фактов, добавьте детали вакансии или программы и превратите черновик в письмо, которое вы готовы отправить.',
    cases: [
      ['Сопроводительное письмо с конкретным смыслом', 'Представьтесь работодателю, свяжите свой опыт с вакансией и объясните интерес к работе. Конкретный проект или достижение дополнит резюме, а не повторит его.'],
      ['Заявка, которая объясняет ваши цели', 'Для поступления расскажите об образовании, интересах и планах. Укажите университет и программу, чтобы объяснить свой выбор. Проверяйте требования на официальном сайте.'],
      ['Деловое письмо с понятным следующим шагом', 'Подготовьте знакомство, запрос или повторное обращение. Укажите адресата, цель и тон, чтобы сообщение было ясным и содержало понятную просьбу.'],
    ],
    toolsTitle: 'Черновик на основе ваших данных.',
    tools: [
      ['Добавьте свой опыт', 'Укажите навыки, проекты и достижения. Конкретные факты полезнее общих слов о трудолюбии и мотивации.'],
      ['Выберите тон и длину', 'Подберите стиль под читателя: короткий деловой запрос, формальная заявка или личное представление.'],
      ['Сохраните контроль над текстом', 'Отредактируйте черновик, уберите чуждые вам формулировки и скопируйте или экспортируйте результат. Черновики остаются в этом браузере; важные тексты сохраняйте отдельно.'],
    ],
    prepareTitle: 'Немного контекста улучшает первый черновик.',
    prepareIntro: 'Идеальное описание не требуется. Для начала полезно подготовить:',
    checklist: ['Вакансию, программу или цель письма', 'Два-три подходящих проекта или достижения', 'Адресата и желаемое действие', 'Предпочтительный язык, тон и длину'],
    reviewTitle: 'Ваш опыт. Ваше окончательное решение.',
    review: 'ИИ помогает составить черновик, но не подтверждает достижения и не гарантирует собеседование или поступление. Проверьте имена, даты, требования и факты. Прочитайте письмо вслух и убедитесь, что оно представляет именно вас.',
  },
  es: {
    title: 'Las palabras adecuadas para tu próxima oportunidad.', intro: 'Conecta tu experiencia real con lo que necesita saber el lector. Añade los detalles de la oportunidad y revisa el borrador antes de enviarlo.',
    cases: [['Una presentación con contexto', 'Relaciona tus proyectos y logros con el puesto. Explica tu interés y complementa tu currículum con ejemplos concretos.'], ['Una solicitud con dirección', 'Describe tus estudios, intereses y objetivos. Añade el programa y verifica los requisitos en la web oficial.'], ['Un correo con un siguiente paso', 'Prepara una presentación, consulta o seguimiento. Define el destinatario, el propósito y la acción que esperas.']],
    toolsTitle: 'Un borrador basado en tus datos.', tools: [['Añade tu experiencia', 'Incluye habilidades, proyectos y logros concretos.'], ['Elige tono y longitud', 'Adapta el estilo al destinatario y al objetivo.'], ['Controla el texto final', 'Edita, copia o exporta tu borrador. Guarda aparte los textos importantes; los borradores permanecen en este navegador.']],
    prepareTitle: 'Un poco de contexto mejora el borrador.', prepareIntro: 'Prepara estos datos para empezar:', checklist: ['El puesto, programa o propósito', 'Dos o tres experiencias relevantes', 'El destinatario y la acción deseada', 'El idioma, tono y longitud'], reviewTitle: 'Tu experiencia. Tu decisión final.', review: 'Revisa nombres, fechas, requisitos y afirmaciones. La IA ayuda a redactar, pero no garantiza entrevistas ni admisiones. Personaliza el texto antes de enviarlo.',
  },
  fr: {
    title: 'Les bons mots pour votre prochaine opportunité.', intro: 'Reliez votre expérience réelle aux attentes du lecteur. Ajoutez les détails de l’opportunité et révisez le brouillon avant de l’envoyer.',
    cases: [['Une lettre avec du contexte', 'Reliez vos projets et réalisations au poste. Expliquez votre intérêt et complétez votre CV avec des exemples concrets.'], ['Une candidature qui explique votre choix', 'Présentez votre parcours, vos intérêts et vos objectifs. Ajoutez le programme et vérifiez les exigences sur le site officiel.'], ['Un e-mail avec une suite claire', 'Préparez une présentation, une demande ou une relance. Précisez le destinataire, le but et l’action attendue.']],
    toolsTitle: 'Un brouillon fondé sur vos informations.', tools: [['Ajoutez votre parcours', 'Indiquez des compétences, projets et réalisations précis.'], ['Choisissez le ton et la longueur', 'Adaptez le style au destinataire et à votre objectif.'], ['Gardez la main sur le texte', 'Modifiez, copiez ou exportez votre brouillon. Les brouillons restent dans ce navigateur ; conservez les textes importants séparément.']],
    prepareTitle: 'Un peu de contexte améliore le brouillon.', prepareIntro: 'Préparez ces informations pour commencer :', checklist: ['Le poste, le programme ou le but', 'Deux ou trois expériences pertinentes', 'Le destinataire et l’action souhaitée', 'La langue, le ton et la longueur'], reviewTitle: 'Votre expérience. Votre décision finale.', review: 'Vérifiez les noms, dates, exigences et affirmations. L’IA aide à rédiger, sans garantir entretien ni admission. Personnalisez le texte avant de l’envoyer.',
  },
  nl: {
    title: 'De juiste woorden voor je volgende kans.', intro: 'Verbind je echte ervaring met wat de lezer wil weten. Voeg de details van de kans toe en controleer het concept voor je het verstuurt.',
    cases: [['Een sollicitatiebrief met context', 'Verbind je projecten en resultaten met de functie. Leg je interesse uit en vul je cv aan met concrete voorbeelden.'], ['Een toelatingsbrief met richting', 'Beschrijf je opleiding, interesses en doelen. Voeg de opleiding toe en controleer de eisen op de officiële website.'], ['Een e-mail met een duidelijke vervolgstap', 'Schrijf een introductie, vraag of vervolgbericht. Geef de ontvanger, het doel en de gewenste actie aan.']],
    toolsTitle: 'Een concept op basis van jouw gegevens.', tools: [['Voeg je ervaring toe', 'Noem concrete vaardigheden, projecten en resultaten.'], ['Kies toon en lengte', 'Stem de stijl af op de ontvanger en je doel.'], ['Houd controle over de tekst', 'Bewerk, kopieer of exporteer je concept. Concepten blijven in deze browser; bewaar belangrijke teksten apart.']],
    prepareTitle: 'Een beetje context verbetert je concept.', prepareIntro: 'Verzamel deze gegevens om te beginnen:', checklist: ['De functie, opleiding of het doel', 'Twee of drie relevante ervaringen', 'De ontvanger en gewenste actie', 'De taal, toon en lengte'], reviewTitle: 'Jouw ervaring. Jouw beslissing.', review: 'Controleer namen, datums, eisen en feiten. AI helpt bij schrijven, maar garandeert geen gesprek of toelating. Maak de tekst persoonlijk voordat je hem verstuurt.',
  },
  pt: {
    title: 'As palavras certas para sua próxima oportunidade.', intro: 'Relacione sua experiência real com o que o leitor precisa saber. Adicione os detalhes da oportunidade e revise o rascunho antes de enviar.',
    cases: [['Uma carta com contexto', 'Relacione seus projetos e resultados com a vaga. Explique seu interesse e complemente o currículo com exemplos concretos.'], ['Uma candidatura com direção', 'Descreva seus estudos, interesses e objetivos. Adicione o programa e verifique os requisitos no site oficial.'], ['Um e-mail com o próximo passo', 'Prepare uma apresentação, consulta ou acompanhamento. Defina o destinatário, a finalidade e a ação esperada.']],
    toolsTitle: 'Um rascunho baseado nos seus dados.', tools: [['Adicione sua experiência', 'Inclua habilidades, projetos e resultados concretos.'], ['Escolha tom e tamanho', 'Adapte o estilo ao destinatário e ao objetivo.'], ['Controle o texto final', 'Edite, copie ou exporte o rascunho. Os rascunhos ficam neste navegador; guarde textos importantes separadamente.']],
    prepareTitle: 'Um pouco de contexto melhora o rascunho.', prepareIntro: 'Prepare estes dados para começar:', checklist: ['A vaga, programa ou finalidade', 'Duas ou três experiências relevantes', 'O destinatário e a ação desejada', 'O idioma, tom e tamanho'], reviewTitle: 'Sua experiência. Sua decisão final.', review: 'Confira nomes, datas, requisitos e informações. A IA ajuda a escrever, mas não garante entrevistas ou admissão. Personalize o texto antes de enviar.',
  },
  ar: {
    title: 'الكلمات المناسبة لفرصتك القادمة.', intro: 'اربط خبرتك الحقيقية بما يحتاج القارئ إلى معرفته. أضف تفاصيل الفرصة ثم راجع المسودة قبل إرسالها.',
    cases: [['خطاب تقديم له سياق واضح', 'اربط مشاريعك وإنجازاتك بالوظيفة. اشرح اهتمامك وأضف أمثلة محددة تكمل سيرتك الذاتية.'], ['طلب قبول يوضح اتجاهك', 'صف دراستك واهتماماتك وأهدافك. أضف البرنامج وتحقق من المتطلبات على الموقع الرسمي.'], ['بريد بخطوة تالية واضحة', 'اكتب مقدمة أو استفسارًا أو متابعة. حدد المستلم والهدف والإجراء الذي تنتظره.']],
    toolsTitle: 'مسودة مبنية على معلوماتك.', tools: [['أضف خبرتك', 'اذكر مهارات ومشاريع وإنجازات محددة.'], ['اختر الأسلوب والطول', 'ناسب الأسلوب مع المستلم وهدف الرسالة.'], ['تحكم في النص النهائي', 'عدّل المسودة وانسخها أو صدّرها. تبقى المسودات في هذا المتصفح؛ احتفظ بالنصوص المهمة منفصلة.']],
    prepareTitle: 'قليل من السياق يحسّن المسودة.', prepareIntro: 'جهّز هذه التفاصيل للبدء:', checklist: ['الوظيفة أو البرنامج أو هدف الرسالة', 'تجربتان أو ثلاث تجارب ذات صلة', 'المستلم والإجراء المطلوب', 'اللغة والأسلوب والطول'], reviewTitle: 'خبرتك. قرارك النهائي.', review: 'راجع الأسماء والتواريخ والمتطلبات والمعلومات. يساعد الذكاء الاصطناعي في الصياغة ولا يضمن مقابلة أو قبولًا. عدّل النص ليعبّر عنك قبل إرساله.',
  },
};
export const landingContent = (locale: Locale) => content[locale];
