import type { Locale } from '../types';

type CompareCopy = {
  compareTitle: string; compareIntro: string; compareHeading: string;
  product: string; price: string; focus: string; source: string;
  ownFocus: string; reziFocus: string; tealFocus: string;
  ownPeriod: string; reziPeriod: string; tealPeriod: string;
  checked: string; fair: string; choiceTitle: string; choice: string;
  featuresTitle: string; start: string;
};

// Product names, prices and the original research date are preserved in translation.
export const compareTranslations: Partial<Record<Locale, CompareCopy>> = {
  es: {
    compareTitle: 'Compara el precio y el trabajo que necesitas hacer.',
    compareIntro: 'El precio previsto de Starter es de $10 por 30 días, inferior a los precios indicados de Rezi Pro y Teal+ para un período comparable. Las herramientas y los límites de uso son distintos: el precio no lo explica todo.',
    compareHeading: 'Un plan centrado en la redacción, desde $10.',
    product: 'Producto / plan', price: 'Precio publicado (USD)', focus: 'Qué estás eligiendo', source: 'Precios oficiales',
    ownFocus: 'Redacción de cartas y correos. Máximo de Starter: 30 cartas estándar O 8 prémium O 5 investigaciones universitarias, con una cuota compartida. Los planes de pago están en preparación.',
    reziFocus: 'Suite de currículums y candidaturas con cartas de presentación, herramientas para el currículum y una revisión mensual por un experto.',
    tealFocus: 'Espacio de búsqueda de empleo con seguimiento de candidaturas, análisis de currículums y cartas de presentación con IA.',
    ownPeriod: ' / 30 días · previsto', reziPeriod: ' / mes', tealPeriod: ' / 30 días',
    checked: 'Fuentes oficiales consultadas el 12 de octubre de 2026. Precios publicados en USD; los impuestos, el cambio de divisa y las promociones pueden variar. Los precios de la competencia pueden cambiar.',
    fair: 'Rezi y Teal también ofrecen opciones gratuitas. La facturación a más largo plazo y las promociones pueden reducir el precio efectivo. Nuestros planes Plus ($20) y Pro ($28) también están por debajo de estos planes concretos de $29, pero no afirmamos ser la herramienta más barata ni ofrecer un uso ilimitado equivalente.',
    choiceTitle: '¿Qué opción encaja con tu candidatura?',
    choice: 'Elige un espacio centrado en la escritura si necesitas redactar y mejorar una carta o un correo. Considera una suite profesional más amplia si también necesitas crear un currículum, hacer seguimiento de candidaturas o recibir revisiones de expertos. Compara las funciones que realmente usarás, además del precio.',
    featuresTitle: 'Explora las funciones de redacción', start: 'Abrir el espacio de redacción',
  },
  fr: {
    compareTitle: 'Comparez le prix et le travail à accomplir.',
    compareIntro: 'Le prix prévu de Starter est de $10 pour 30 jours, inférieur aux prix indiqués de Rezi Pro et Teal+ sur une période comparable. Les outils et les limites d’utilisation diffèrent : le prix ne suffit pas pour choisir.',
    compareHeading: 'Un forfait consacré à la rédaction, à partir de $10.',
    product: 'Produit / forfait', price: 'Prix affiché (USD)', focus: 'Ce que vous choisissez', source: 'Tarifs officiels',
    ownFocus: 'Rédaction de lettres et d’e-mails. Maximum Starter : 30 lettres standard OU 8 lettres premium OU 5 recherches universitaires, sur un quota partagé. Les offres payantes sont en préparation.',
    reziFocus: 'Suite de CV et de candidatures comprenant lettres de motivation, outils pour le CV et une révision mensuelle du CV par un expert.',
    tealFocus: 'Espace de recherche d’emploi comprenant suivi des candidatures, analyse de CV et lettres de motivation avec l’IA.',
    ownPeriod: ' / 30 jours · prévu', reziPeriod: ' / mois', tealPeriod: ' / 30 jours',
    checked: 'Sources officielles consultées le 12 octobre 2026. Prix publiés en USD ; taxes, conversion de devise et promotions peuvent varier. Les tarifs concurrents peuvent changer.',
    fair: 'Rezi et Teal proposent aussi des options gratuites. Les périodes de facturation plus longues ou les promotions peuvent réduire le prix effectif. Nos offres Plus ($20) et Pro ($28) sont également inférieures à ces offres précises à $29, sans prétendre être l’outil le moins cher ni proposer un usage illimité équivalent.',
    choiceTitle: 'Quelle approche convient à votre candidature ?',
    choice: 'Choisissez un espace de rédaction ciblé pour rédiger et améliorer une lettre ou un e-mail. Envisagez une suite professionnelle plus large si vous avez aussi besoin de créer un CV, suivre vos candidatures ou faire réviser votre CV par un expert. Comparez les fonctions que vous utiliserez réellement, au-delà du prix affiché.',
    featuresTitle: 'Découvrir les fonctions de rédaction', start: 'Ouvrir l’espace de rédaction',
  },
  nl: {
    compareTitle: 'Vergelijk de prijs én het werk dat je wilt doen.',
    compareIntro: 'De geplande Starter-prijs is $10 voor 30 dagen, lager dan de vermelde prijzen van Rezi Pro en Teal+ over een vergelijkbare periode. De tools en gebruikslimieten verschillen, dus de prijs vertelt niet het hele verhaal.',
    compareHeading: 'Een gericht schrijfplan, vanaf $10.',
    product: 'Product / abonnement', price: 'Vermelde prijs (USD)', focus: 'Waarvoor je kiest', source: 'Officiële prijzen',
    ownFocus: 'Brieven en e-mails opstellen. Starter-maximum: 30 standaardbrieven OF 8 premiumbrieven OF 5 universiteitsonderzoeken uit een gedeeld tegoed. Betaalde abonnementen worden voorbereid.',
    reziFocus: 'Een pakket voor cv’s en sollicitaties, met sollicitatiebrieven, cv-tools en een maandelijkse cv-beoordeling door een expert.',
    tealFocus: 'Een werkruimte voor cv’s en werk zoeken, met sollicitatiebeheer, cv-analyse en AI-sollicitatiebrieven.',
    ownPeriod: ' / 30 dagen · gepland', reziPeriod: ' / maand', tealPeriod: ' / 30 dagen',
    checked: 'Officiële bronnen gecontroleerd op 12 oktober 2026. Gepubliceerde prijzen in USD; belastingen, wisselkoersen en acties kunnen verschillen. Prijzen van concurrenten kunnen wijzigen.',
    fair: 'Rezi en Teal hebben ook gratis opties. Langere factureringsperioden en acties kunnen de effectieve prijs verlagen. Onze Plus ($20) en Pro ($28) liggen ook onder deze specifieke abonnementen van $29, maar we beweren niet de goedkoopste tool te zijn of gelijkwaardig onbeperkt gebruik te bieden.',
    choiceTitle: 'Welke aanpak past bij je sollicitatie?',
    choice: 'Kies een gerichte schrijfwerkruimte als je vooral een brief of e-mail wilt opstellen en verbeteren. Overweeg een breder carrièrepakket als je ook een cv-maker, sollicitatiebeheer of deskundige cv-beoordeling nodig hebt. Vergelijk de functies die je echt gebruikt, naast de prijs.',
    featuresTitle: 'Bekijk de schrijffuncties', start: 'Open de schrijfwerkruimte',
  },
  pt: {
    compareTitle: 'Compare o preço e o trabalho que você precisa fazer.',
    compareIntro: 'O preço previsto do Starter é de $10 por 30 dias, abaixo dos preços indicados do Rezi Pro e Teal+ para um período comparável. As ferramentas e os limites de uso são diferentes: o preço não conta toda a história.',
    compareHeading: 'Um plano focado na escrita, a partir de $10.',
    product: 'Produto / plano', price: 'Preço publicado (USD)', focus: 'O que você está escolhendo', source: 'Preços oficiais',
    ownFocus: 'Redação de cartas e e-mails. Máximo do Starter: 30 cartas padrão OU 8 premium OU 5 pesquisas universitárias de uma franquia compartilhada. Os planos pagos estão em preparação.',
    reziFocus: 'Conjunto de ferramentas para currículos e candidaturas, com cartas de apresentação e uma revisão mensal do currículo por um especialista.',
    tealFocus: 'Espaço para currículos e busca de emprego, com acompanhamento de candidaturas, análise de currículos e cartas de apresentação com IA.',
    ownPeriod: ' / 30 dias · previsto', reziPeriod: ' / mês', tealPeriod: ' / 30 dias',
    checked: 'Fontes oficiais consultadas em 12 de outubro de 2026. Preços publicados em USD; impostos, conversão de moeda e promoções podem variar. Os preços dos concorrentes podem mudar.',
    fair: 'Rezi e Teal também oferecem opções gratuitas. Períodos de cobrança mais longos e promoções podem reduzir o preço efetivo. Nossos planos Plus ($20) e Pro ($28) também ficam abaixo desses planos específicos de $29, mas não afirmamos ser a ferramenta mais barata nem oferecer uso ilimitado equivalente.',
    choiceTitle: 'Qual abordagem combina com sua candidatura?',
    choice: 'Escolha um espaço focado na escrita se sua tarefa principal é redigir e melhorar uma carta ou um e-mail. Considere um conjunto mais amplo de ferramentas de carreira se também precisar criar um currículo, acompanhar candidaturas ou receber avaliações de especialistas. Compare os recursos que realmente usará, além do preço.',
    featuresTitle: 'Conheça os recursos de escrita', start: 'Abrir o espaço de escrita',
  },
  ar: {
    compareTitle: 'قارن السعر والعمل الذي تحتاج إلى إنجازه.',
    compareIntro: 'السعر المخطط لخطة Starter هو $10 لكل 30 يومًا، وهو أقل من الأسعار المذكورة لخدمتي Rezi Pro وTeal+ لفترة مماثلة. تختلف الأدوات وحدود الاستخدام، لذلك لا يكفي السعر وحده للمقارنة.',
    compareHeading: 'خطة متخصصة في الكتابة، بدءًا من $10.',
    product: 'المنتج / الخطة', price: 'السعر المعلن (USD)', focus: 'ما الذي تختاره', source: 'الأسعار الرسمية',
    ownFocus: 'صياغة الخطابات ورسائل البريد. الحد الأقصى لخطة Starter: 30 خطابًا قياسيًا أو 8 خطابات مميزة أو 5 أبحاث جامعية من حصة مشتركة. الخطط المدفوعة قيد الإعداد.',
    reziFocus: 'مجموعة أدوات للسيرة الذاتية والتقديم للوظائف، تتضمن خطابات التقديم وأدوات السيرة الذاتية ومراجعة شهرية للسيرة الذاتية من خبير.',
    tealFocus: 'مساحة للسيرة الذاتية والبحث عن عمل، تتضمن تتبع طلبات التوظيف وتحليل السيرة الذاتية وخطابات التقديم بالذكاء الاصطناعي.',
    ownPeriod: ' / 30 يومًا · مخطط', reziPeriod: ' / شهر', tealPeriod: ' / 30 يومًا',
    checked: 'تمت مراجعة المصادر الرسمية في 12 أكتوبر 2026. الأسعار المنشورة بالدولار الأمريكي؛ قد تختلف الضرائب وتحويل العملات والعروض الترويجية. وقد تتغير أسعار المنافسين.',
    fair: 'تقدم Rezi وTeal خيارات مجانية أيضًا. قد تقل التكلفة الفعلية مع فترات الفوترة الأطول أو العروض. خطتا Plus ($20) وPro ($28) لدينا أقل أيضًا من هاتين الخطتين المحددتين بسعر $29، لكننا لا ندّعي أننا الأداة الأرخص أو أننا نقدم استخدامًا غير محدود مماثلًا.',
    choiceTitle: 'أي نهج يناسب طلبك؟',
    choice: 'اختر مساحة كتابة متخصصة إذا كان هدفك الأساسي صياغة خطاب أو بريد وتحسينه. وفكّر في مجموعة أدوات مهنية أوسع إذا كنت تحتاج أيضًا إلى إنشاء سيرة ذاتية أو تتبع الطلبات أو مراجعات الخبراء. قارن المزايا التي ستستخدمها فعلًا، إلى جانب السعر.',
    featuresTitle: 'استكشف مزايا الكتابة', start: 'افتح مساحة الكتابة',
  },
};
