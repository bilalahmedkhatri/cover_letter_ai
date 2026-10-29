import type { Locale } from '../types';

type WritingGuide = { kind: string; title: string; audience: string; steps: string[]; example: string; prompt: string };
type GuidesCopy = { guidesTitle: string; guidesIntro: string; guides: WritingGuide[]; useOutline: string; outlineNote: string; beforeSend: string; checks: string[]; start: string };

export const guidesTranslations: Partial<Record<Locale, GuidesCopy>> = {
  es: {
    guidesTitle: 'Haz que tu próximo borrador sea concreto.',
    guidesIntro: 'Usa estas estructuras prácticas para preparar tus datos. Un ejemplo claro de tu propia experiencia es más útil que una larga lista de cualidades generales.',
    guides: [{ kind: 'job', title: 'Carta de presentación laboral', audience: 'Relaciona un logro relevante con el puesto.',
      steps: ['Inicio: indica el puesto y explica por qué te interesa el trabajo.', 'Evidencia: describe un proyecto real, tu aportación y el resultado.', 'Encaje: relaciona ese ejemplo con un requisito de la oferta.', 'Cierre: ofrece conversar y comprueba el nombre del destinatario.'],
      example: 'En lugar de «Soy una persona trabajadora y sé trabajar en equipo», explica lo que hiciste: «Coordiné el relevo semanal de soporte para que el equipo entrante tuviera una lista clara de los casos pendientes». Usa un ejemplo propio y añade cifras solo si puedes verificarlas.',
      prompt: 'Redacta una carta de presentación centrada en el puesto descrito. Relaciona mi experiencia real con uno o dos requisitos de la oferta. No inventes empresas, logros ni cifras. Usa un lenguaje directo y termina con una invitación cortés a conversar sobre el puesto.' }],
    useOutline: 'Usar esta estructura', outlineNote: 'Añade instrucciones de redacción al generador. Tus datos personales no cambian.',
    beforeSend: 'Antes de enviar', checks: ['Sustituye cada campo pendiente por un dato real.', 'Contrasta nombres, fechas, cualificaciones y afirmaciones con tus fuentes.', 'Respeta el límite de palabras y los requisitos del destinatario.', 'Léelo en voz alta y elimina las expresiones que no usarías.'], start: 'Abrir el espacio de redacción',
  },
  fr: {
    guidesTitle: 'Rendez votre prochain brouillon plus précis.',
    guidesIntro: 'Utilisez ces plans pratiques pour préparer vos informations. Un exemple clair tiré de votre expérience est plus utile qu’une longue liste de qualités générales.',
    guides: [{ kind: 'job', title: 'Lettre de motivation pour un emploi', audience: 'Reliez une réalisation pertinente au poste.',
      steps: ['Introduction : nommez le poste et expliquez votre intérêt pour ce travail.', 'Preuve : décrivez un projet réel, votre contribution et le résultat.', 'Adéquation : reliez cet exemple à une exigence de l’offre.', 'Conclusion : proposez un échange et vérifiez le nom du destinataire.'],
      example: 'Au lieu de « Je travaille dur et j’ai l’esprit d’équipe », expliquez votre action : « J’ai coordonné la passation hebdomadaire du support pour que l’équipe suivante dispose d’une liste claire des dossiers non résolus. » Utilisez votre propre exemple et ajoutez des chiffres uniquement s’ils sont vérifiables.',
      prompt: 'Rédige une lettre de motivation ciblée pour le poste décrit. Relie mon expérience réelle à une ou deux exigences de l’offre. N’invente ni employeurs, ni réalisations, ni chiffres. Utilise un langage direct et termine par une invitation polie à discuter du poste.' }],
    useOutline: 'Utiliser ce plan', outlineNote: 'Ajoute des consignes au générateur sans modifier vos informations personnelles.',
    beforeSend: 'Avant l’envoi', checks: ['Remplacez chaque champ à compléter par une information réelle.', 'Vérifiez noms, dates, qualifications et affirmations à partir de vos sources.', 'Respectez la limite de mots et les exigences du destinataire.', 'Lisez à voix haute et supprimez les expressions que vous n’utiliseriez pas.'], start: 'Ouvrir l’espace de rédaction',
  },
  nl: {
    guidesTitle: 'Maak je volgende concept concreet.',
    guidesIntro: 'Gebruik deze praktische opzet om je gegevens voor te bereiden. Een duidelijk voorbeeld uit je eigen ervaring is nuttiger dan een lange lijst algemene sterke punten.',
    guides: [{ kind: 'job', title: 'Sollicitatiebrief', audience: 'Koppel een relevante prestatie aan de functie.',
      steps: ['Opening: noem de functie en leg uit waarom het werk je aanspreekt.', 'Bewijs: beschrijf een echt project, jouw bijdrage en het resultaat.', 'Aansluiting: koppel dat voorbeeld aan een eis uit de vacature.', 'Afsluiting: stel een gesprek voor en controleer de naam van de ontvanger.'],
      example: 'Schrijf niet alleen « Ik werk hard en ben een teamspeler », maar beschrijf wat je deed: « Ik coördineerde de wekelijkse overdracht van de klantenservice, zodat de volgende ploeg een duidelijke lijst met openstaande zaken had. » Gebruik je eigen voorbeeld en voeg alleen controleerbare cijfers toe.',
      prompt: 'Schrijf een gerichte sollicitatiebrief voor de beschreven functie. Koppel mijn werkelijke ervaring aan één of twee functie-eisen. Verzin geen werkgevers, prestaties of cijfers. Schrijf direct en sluit af met een beleefde uitnodiging om de functie te bespreken.' }],
    useOutline: 'Gebruik deze opzet', outlineNote: 'Voegt schrijfinstructies toe aan de generator. Je persoonlijke gegevens blijven ongewijzigd.',
    beforeSend: 'Voordat je verstuurt', checks: ['Vervang elk invulveld door echte informatie.', 'Controleer namen, datums, kwalificaties en beweringen aan de hand van je bronnen.', 'Volg de woordlimiet en documenteisen van de ontvanger.', 'Lees hardop en verwijder formuleringen die je zelf nooit zou gebruiken.'], start: 'Open de schrijfwerkruimte',
  },
  pt: {
    guidesTitle: 'Torne seu próximo rascunho específico.',
    guidesIntro: 'Use estas estruturas práticas para preparar suas informações. Um exemplo claro da sua experiência é mais útil do que uma longa lista de qualidades genéricas.',
    guides: [{ kind: 'job', title: 'Carta de apresentação para emprego', audience: 'Relacione uma conquista relevante à vaga.',
      steps: ['Abertura: indique a vaga e explique por que o trabalho interessa a você.', 'Evidência: descreva um projeto real, sua contribuição e o resultado.', 'Adequação: relacione esse exemplo a um requisito da vaga.', 'Encerramento: proponha uma conversa e confira o nome do destinatário.'],
      example: 'Em vez de « Sou dedicado e sei trabalhar em equipe », explique sua ação: « Coordenei a passagem semanal de informações do suporte para que a equipe seguinte tivesse uma lista clara dos casos pendentes. » Use um exemplo próprio e acrescente números apenas se puder verificá-los.',
      prompt: 'Escreva uma carta de apresentação focada na vaga descrita. Relacione minha experiência real a um ou dois requisitos da vaga. Não invente empregadores, conquistas ou números. Use linguagem direta e termine com um convite educado para conversar sobre a vaga.' }],
    useOutline: 'Usar esta estrutura', outlineNote: 'Adiciona instruções de escrita ao gerador. Seus dados pessoais permanecem iguais.',
    beforeSend: 'Antes de enviar', checks: ['Substitua cada campo pendente por uma informação real.', 'Confira nomes, datas, qualificações e afirmações com suas fontes.', 'Respeite o limite de palavras e os requisitos do destinatário.', 'Leia em voz alta e retire expressões que você nunca usaria.'], start: 'Abrir o espaço de escrita',
  },
  ar: {
    guidesTitle: 'اجعل مسودتك التالية أكثر تحديدًا.',
    guidesIntro: 'استخدم هذه الخطط العملية لإعداد معلوماتك. مثال واضح من تجربتك أكثر فائدة من قائمة طويلة من الصفات العامة.',
    guides: [{ kind: 'job', title: 'خطاب التقديم لوظيفة', audience: 'اربط إنجازًا مناسبًا بمتطلبات الوظيفة.',
      steps: ['المقدمة: اذكر الوظيفة واشرح سبب اهتمامك بهذا العمل.', 'الدليل: صف مشروعًا حقيقيًا ومساهمتك فيه والنتيجة.', 'الملاءمة: اربط المثال بأحد متطلبات الإعلان.', 'الخاتمة: اقترح إجراء محادثة وتحقق من اسم المستلم.'],
      example: 'بدلًا من «أنا مجتهد وأجيد العمل الجماعي»، اشرح ما فعلته: «نسّقت تسليم مهام الدعم أسبوعيًا ليحصل الفريق التالي على قائمة واضحة بالحالات غير المحلولة». استخدم مثالًا من تجربتك ولا تضف أرقامًا إلا إذا استطعت التحقق منها.',
      prompt: 'اكتب خطاب تقديم محددًا للوظيفة الموصوفة. اربط خبرتي الفعلية بمتطلب أو اثنين من متطلبات الوظيفة. لا تختلق جهات عمل أو إنجازات أو أرقامًا. استخدم لغة مباشرة واختم بدعوة مهذبة لمناقشة الوظيفة.' }],
    useOutline: 'استخدم هذه الخطة', outlineNote: 'تُضاف تعليمات الكتابة إلى الأداة دون تغيير بياناتك الشخصية.',
    beforeSend: 'قبل الإرسال', checks: ['استبدل كل حقل غير مكتمل بمعلومة حقيقية.', 'طابق الأسماء والتواريخ والمؤهلات والادعاءات مع مصادرك.', 'التزم بحد الكلمات ومتطلبات المستلم للمستند.', 'اقرأ النص بصوت عالٍ واحذف العبارات التي لا تستخدمها عادةً.'], start: 'افتح مساحة الكتابة',
  },
};
