import 'server-only';
import type { Locale } from '../types';

export const landingResearchSources = [
  { name: 'hh.ru', href: 'https://hh.ru/article/32013' },
  { name: 'Indeed', href: 'https://www.indeed.com/career-advice/resumes-cover-letters/cover-letter-dos-and-donts' },
  { name: 'SEEK', href: 'https://au.seek.com/career-advice/article/how-to-write-a-cover-letter-using-ai' },
] as const;

type Research = {
  title: string; paragraphs: string[]; platformTitle: string;
  tips: [string, string][]; sourceLabel: string; sourceNote: string;
  guidesLink: string; compareLink: string; blogLink: string;
  faqs: [string, string][];
};

const copy: Record<Locale, Research> = {
  en: {
    title: 'Turn the job description into a letter with evidence.',
    paragraphs: [
      'Start with the employer’s priorities, not a list of adjectives about yourself. Read the responsibilities and choose one or two requirements you can support with real experience. For each requirement, note the situation, what you personally did and what changed. A course project, volunteering task or customer conversation can provide useful evidence when it genuinely relates to the role.',
      'Use your cover letter to explain the connection that a resume cannot show on its own. Instead of repeating every job title, describe why one achievement matters to this employer. If you mention a result, keep its scale accurate: helping a team is different from leading it. Add numbers only when you can verify them, and leave out company facts that you have not checked.',
      'Give the generator those details alongside the vacancy and your preferred tone. Treat its response as a working draft. Replace generic praise with your reason for applying, check the opening and closing, and read the letter aloud. Keep sentences you would comfortably say in an interview. The final version should explain your fit without inventing qualifications or promising outcomes.',
    ],
    platformTitle: 'Applying through hh.ru, Indeed or another job board?',
    tips: [
      ['Follow the employer’s instructions', 'Check whether the vacancy requests a cover letter, a text response or an attachment. Use the requested format and length. Instructions on the specific vacancy take priority over a general template, including where and how you submit your application.'],
      ['Prepare the relevant details', 'Bring the job title, employer name, important responsibilities and an example from your background into your brief. If a job link is private, expired or unreadable, copy the relevant requirements yourself. Do not assume the tool can access every job-board page or submit an application for you.'],
      ['Review before you submit', 'Check the company name, role, recipient and any remaining placeholders. After pasting or uploading the letter, inspect its spacing and complete the required application fields. Send through the employer’s application channel; AILetterGen helps prepare wording and does not represent these job platforms.'],
    ],
    sourceLabel: 'Further reading', sourceNote: 'Independent editorial guidance informed by these career resources; no affiliation or endorsement is implied.',
    guidesLink: 'Explore writing guides', compareLink: 'Compare writing tools', blogLink: 'Read application advice',
    faqs: [
      ['How do I personalize an AI-generated cover letter?', 'Replace general claims with a relevant example and a genuine reason for choosing the employer. Check every factual detail against your own background. Edit the tone and read the draft aloud so the finished letter sounds like you, rather than sending the first response unchanged.'],
      ['What can I write if I have little work experience?', 'Use relevant coursework, projects, volunteering or responsibilities outside paid employment. Explain your contribution and what it demonstrates. Be clear about the setting and avoid describing a class exercise as professional employment. A specific, honest example is more useful than an unsupported claim of expertise.'],
      ['How long should my cover letter be?', 'Follow the employer’s word limit or application-field instructions first. When no length is specified, aim for a concise letter that fits comfortably on one page. Keep the introduction, evidence and closing focused; remove repetition instead of adding text just to fill the page.'],
      ['Can I use the draft for a job-board application?', 'Yes, after reviewing it and checking the vacancy’s requirements. Copy the text into the requested field or use an accepted document format where appropriate. Check the final preview before submitting. Generating a letter here does not submit an application to hh.ru, Indeed, SEEK or an employer.'],
    ],
  },
  es: {
    title: 'Convierte la oferta de empleo en una carta con evidencias.',
    paragraphs: [
      'Empieza por las prioridades de la empresa, no por una lista de adjetivos sobre ti. Lee las responsabilidades y elige uno o dos requisitos que puedas respaldar con experiencia real. Para cada uno, apunta la situación, tu contribución personal y el resultado. Un proyecto académico, una tarea de voluntariado o una conversación con un cliente pueden servir si están relacionados con el puesto.',
      'Utiliza la carta para explicar una conexión que el currículum no muestra por sí solo. En lugar de repetir todos tus cargos, explica por qué un logro es relevante para esa empresa. Describe su alcance con precisión: colaborar con un equipo no equivale a dirigirlo. Incluye cifras solo cuando puedas verificarlas y omite los datos de la empresa que no hayas comprobado.',
      'Proporciona esos detalles al generador junto con la oferta y el tono que prefieres. Considera la respuesta un borrador de trabajo. Sustituye los elogios genéricos por tu motivo para presentar la candidatura, revisa la apertura y el cierre y lee la carta en voz alta. Conserva las frases que usarías en una entrevista, sin inventar cualificaciones ni prometer resultados.',
    ],
    platformTitle: '¿Presentas tu candidatura en hh.ru, Indeed u otro portal?',
    tips: [
      ['Sigue las instrucciones de la empresa', 'Comprueba si la oferta pide una carta, una respuesta en texto o un archivo adjunto. Respeta el formato y la extensión solicitados. Las instrucciones de esa oferta tienen prioridad sobre cualquier plantilla general, también respecto al canal de envío.'],
      ['Prepara los datos pertinentes', 'Incluye el puesto, la empresa, las responsabilidades principales y un ejemplo de tu experiencia. Si el enlace es privado, ha caducado o no se puede leer, copia los requisitos importantes. No supongas que la herramienta puede acceder a todos los portales ni enviar candidaturas por ti.'],
      ['Revisa antes de enviar', 'Comprueba la empresa, el puesto, el destinatario y los campos pendientes. Después de pegar el texto o subir el archivo, revisa los espacios y completa los campos obligatorios. Utiliza el canal de la empresa: AILetterGen ayuda a redactar y no representa a estos portales.'],
    ],
    sourceLabel: 'Lecturas recomendadas', sourceNote: 'Orientación editorial independiente basada en estos recursos profesionales; no implica afiliación ni respaldo.',
    guidesLink: 'Explorar las guías de redacción', compareLink: 'Comparar herramientas de escritura', blogLink: 'Leer consejos para candidaturas',
    faqs: [
      ['¿Cómo personalizo una carta generada con IA?', 'Sustituye las afirmaciones generales por un ejemplo relevante y un motivo auténtico para elegir la empresa. Contrasta cada dato con tu experiencia. Ajusta el tono y lee el borrador en voz alta para que la carta suene como tú; no envíes la primera respuesta sin revisarla.'],
      ['¿Qué puedo escribir si tengo poca experiencia laboral?', 'Usa estudios, proyectos, voluntariado o responsabilidades fuera del empleo remunerado. Explica tu contribución y lo que demuestra. Aclara el contexto y no presentes un ejercicio académico como un empleo profesional. Un ejemplo concreto y sincero es más útil que afirmar una experiencia que no puedes demostrar.'],
      ['¿Qué extensión debe tener mi carta?', 'Respeta primero el límite de palabras o las instrucciones del formulario. Si no se indica una extensión, procura que sea concisa y que quepa en una página. Centra la introducción, las evidencias y el cierre; elimina repeticiones en lugar de añadir texto para llenar espacio.'],
      ['¿Puedo usar el borrador en un portal de empleo?', 'Sí, después de revisarlo y comprobar los requisitos de la oferta. Copia el texto en el campo indicado o utiliza un formato de archivo aceptado. Revisa la vista previa antes de enviar. Generar la carta aquí no envía una candidatura a hh.ru, Indeed, SEEK ni a ninguna empresa.'],
    ],
  },
  fr: {
    title: 'Transformez l’offre d’emploi en une lettre étayée.',
    paragraphs: [
      'Partez des priorités de l’employeur, plutôt que d’une liste de qualités personnelles. Lisez les missions et choisissez une ou deux exigences que votre expérience réelle permet d’illustrer. Pour chacune, notez la situation, votre contribution et le résultat. Un projet d’études, une mission bénévole ou un échange avec un client peuvent servir de preuve s’ils sont pertinents pour le poste.',
      'La lettre doit expliquer un lien que le CV ne montre pas à lui seul. Au lieu de répéter tous vos intitulés de poste, expliquez pourquoi une réalisation compte pour cet employeur. Respectez son ampleur : aider une équipe ne signifie pas la diriger. Ajoutez des chiffres seulement s’ils sont vérifiables et écartez les informations sur l’entreprise que vous n’avez pas contrôlées.',
      'Transmettez ces éléments au générateur avec l’offre et le ton souhaité. Considérez la réponse comme un brouillon. Remplacez les compliments génériques par votre motivation réelle, vérifiez l’introduction et la conclusion, puis lisez la lettre à voix haute. Gardez des phrases que vous pourriez prononcer en entretien, sans inventer de qualifications ni promettre de résultats.',
    ],
    platformTitle: 'Vous postulez sur hh.ru, Indeed ou un autre site d’emploi ?',
    tips: [
      ['Suivez les consignes de l’employeur', 'Vérifiez si l’offre demande une lettre, une réponse dans un champ ou une pièce jointe. Respectez le format et la longueur demandés. Les consignes de cette offre priment sur un modèle général, y compris pour le canal de candidature.'],
      ['Préparez les informations utiles', 'Indiquez le poste, l’employeur, les missions principales et un exemple de votre parcours. Si le lien est privé, expiré ou illisible, copiez les exigences pertinentes. Ne supposez pas que l’outil peut consulter toutes les annonces ou déposer une candidature à votre place.'],
      ['Vérifiez avant l’envoi', 'Contrôlez l’entreprise, le poste, le destinataire et les champs incomplets. Après avoir collé le texte ou ajouté le fichier, vérifiez la mise en page et les champs obligatoires. Envoyez via le canal de l’employeur : AILetterGen aide à rédiger et ne représente pas ces plateformes.'],
    ],
    sourceLabel: 'Pour approfondir', sourceNote: 'Conseils éditoriaux indépendants fondés sur ces ressources professionnelles ; aucune affiliation ni recommandation commerciale n’est implicite.',
    guidesLink: 'Explorer les guides de rédaction', compareLink: 'Comparer les outils de rédaction', blogLink: 'Lire les conseils de candidature',
    faqs: [
      ['Comment personnaliser une lettre produite par l’IA ?', 'Remplacez les affirmations générales par un exemple pertinent et une raison sincère de choisir l’employeur. Vérifiez chaque fait dans votre parcours. Ajustez le ton et lisez le brouillon à voix haute pour obtenir une lettre qui vous ressemble, sans envoyer la première réponse telle quelle.'],
      ['Que dire si j’ai peu d’expérience professionnelle ?', 'Utilisez des cours, projets, missions bénévoles ou responsabilités hors emploi salarié. Expliquez votre contribution et ce qu’elle démontre. Précisez le contexte et ne présentez pas un exercice scolaire comme une expérience professionnelle. Un exemple précis et honnête vaut mieux qu’une expertise non étayée.'],
      ['Quelle longueur donner à ma lettre ?', 'Respectez d’abord la limite de mots ou les consignes du formulaire. Sans indication, privilégiez une lettre concise tenant aisément sur une page. Concentrez l’introduction, les preuves et la conclusion ; supprimez les répétitions au lieu d’ajouter du texte pour remplir la page.'],
      ['Puis-je utiliser le brouillon sur un site d’emploi ?', 'Oui, après relecture et vérification des exigences de l’offre. Collez le texte dans le champ demandé ou utilisez un format de fichier accepté. Vérifiez l’aperçu avant l’envoi. Créer une lettre ici ne dépose pas de candidature sur hh.ru, Indeed, SEEK ou auprès d’un employeur.'],
    ],
  },
  nl: {
    title: 'Maak van de vacature een brief met concrete onderbouwing.',
    paragraphs: [
      'Begin bij de prioriteiten van de werkgever, niet bij een lijst eigenschappen van jezelf. Lees de verantwoordelijkheden en kies één of twee eisen die je met echte ervaring kunt onderbouwen. Noteer per eis de situatie, jouw eigen bijdrage en het resultaat. Een studieproject, vrijwilligerswerk of klantgesprek kan bruikbaar zijn als het echt aansluit bij de functie.',
      'Gebruik de brief om een verband uit te leggen dat je cv op zichzelf niet laat zien. Herhaal niet al je functietitels, maar beschrijf waarom een prestatie voor deze werkgever relevant is. Houd de omvang eerlijk: een team ondersteunen is iets anders dan het leiden. Voeg alleen controleerbare cijfers toe en laat onbevestigde informatie over het bedrijf weg.',
      'Geef de generator deze details, samen met de vacature en de gewenste toon. Behandel het antwoord als een werkversie. Vervang algemene complimenten door jouw reden om te solliciteren, controleer opening en afsluiting en lees de brief hardop. Bewaar zinnen die je ook in een gesprek zou gebruiken. Verzin geen kwalificaties en beloof geen resultaten.',
    ],
    platformTitle: 'Solliciteer je via hh.ru, Indeed of een andere vacaturesite?',
    tips: [
      ['Volg de instructies van de werkgever', 'Controleer of de vacature om een brief, een tekstveld of een bijlage vraagt. Gebruik het gevraagde formaat en de juiste lengte. De specifieke vacature-instructies gaan voor op een algemene template, ook voor de manier waarop je solliciteert.'],
      ['Verzamel relevante gegevens', 'Neem de functie, werkgever, belangrijkste taken en een voorbeeld uit je ervaring op in je briefinstructies. Is een link privé, verlopen of onleesbaar, kopieer dan zelf de relevante eisen. Ga er niet van uit dat de tool elke vacature kan openen of namens jou kan solliciteren.'],
      ['Controleer vóór verzending', 'Controleer bedrijfsnaam, functie, ontvanger en open invulvelden. Bekijk na het plakken of uploaden de opmaak en vul verplichte velden in. Verstuur via het sollicitatiekanaal van de werkgever. AILetterGen helpt met formuleren en vertegenwoordigt deze platforms niet.'],
    ],
    sourceLabel: 'Verder lezen', sourceNote: 'Onafhankelijke redactionele tips op basis van deze carrièrebronnen; er wordt geen samenwerking of aanbeveling gesuggereerd.',
    guidesLink: 'Bekijk de schrijfgidsen', compareLink: 'Vergelijk schrijftools', blogLink: 'Lees sollicitatieadvies',
    faqs: [
      ['Hoe maak ik een AI-sollicitatiebrief persoonlijk?', 'Vervang algemene beweringen door een relevant voorbeeld en een oprechte reden om voor de werkgever te kiezen. Controleer alle feiten aan de hand van je eigen achtergrond. Pas de toon aan en lees hardop zodat de brief bij jou past; verstuur de eerste versie niet ongewijzigd.'],
      ['Wat schrijf ik als ik weinig werkervaring heb?', 'Gebruik relevante vakken, projecten, vrijwilligerswerk of verantwoordelijkheden buiten betaald werk. Leg uit wat jij deed en wat dat aantoont. Maak de context duidelijk en presenteer een studieopdracht niet als professioneel werk. Een concreet en eerlijk voorbeeld is nuttiger dan een onbewezen claim van expertise.'],
      ['Hoe lang moet mijn sollicitatiebrief zijn?', 'Volg eerst de woordlimiet of instructies van het sollicitatieformulier. Is er geen lengte genoemd, schrijf dan een beknopte brief die gemakkelijk op één pagina past. Houd opening, onderbouwing en afsluiting gericht. Schrap herhaling in plaats van extra tekst toe te voegen om ruimte te vullen.'],
      ['Kan ik het concept gebruiken op een vacaturesite?', 'Ja, nadat je het hebt gecontroleerd en aan de vacature-eisen hebt getoetst. Plak de tekst in het gevraagde veld of gebruik een toegestaan bestandsformaat. Controleer de voorvertoning vóór verzending. Een brief hier maken verstuurt geen sollicitatie naar hh.ru, Indeed, SEEK of een werkgever.'],
    ],
  },
  pt: {
    title: 'Transforme a descrição da vaga em uma carta com evidências.',
    paragraphs: [
      'Comece pelas prioridades do empregador, não por uma lista de adjetivos sobre você. Leia as responsabilidades e escolha um ou dois requisitos que possa sustentar com experiência real. Para cada um, registre a situação, sua contribuição pessoal e o resultado. Um projeto acadêmico, uma tarefa voluntária ou uma conversa com um cliente podem ajudar quando realmente se relacionam com a vaga.',
      'Use a carta para explicar uma conexão que o currículo sozinho não mostra. Em vez de repetir todos os cargos, descreva por que uma conquista importa para aquele empregador. Preserve a dimensão real da contribuição: ajudar uma equipe é diferente de liderá-la. Acrescente números apenas quando puder verificá-los e deixe de fora informações sobre a empresa que não conferiu.',
      'Forneça esses detalhes ao gerador com a vaga e o tom desejado. Trate a resposta como um rascunho de trabalho. Troque elogios genéricos pelo seu motivo para se candidatar, confira a abertura e o encerramento e leia a carta em voz alta. Mantenha frases que usaria em uma entrevista, sem inventar qualificações ou prometer resultados.',
    ],
    platformTitle: 'Vai se candidatar pelo hh.ru, Indeed ou outro portal?',
    tips: [
      ['Siga as instruções do empregador', 'Confira se a vaga pede uma carta, uma resposta em texto ou um anexo. Respeite o formato e a extensão solicitados. As instruções daquela vaga têm prioridade sobre um modelo genérico, inclusive sobre o canal e a forma de envio.'],
      ['Prepare as informações relevantes', 'Inclua o cargo, a empresa, as principais responsabilidades e um exemplo da sua experiência. Se o link for privado, tiver expirado ou não puder ser lido, copie os requisitos importantes. Não suponha que a ferramenta consegue acessar todos os portais ou enviar candidaturas por você.'],
      ['Revise antes de enviar', 'Confira a empresa, o cargo, o destinatário e os campos incompletos. Depois de colar o texto ou enviar o arquivo, verifique o espaçamento e preencha os campos obrigatórios. Use o canal do empregador: o AILetterGen ajuda a redigir e não representa essas plataformas.'],
    ],
    sourceLabel: 'Leituras complementares', sourceNote: 'Orientação editorial independente baseada nestes recursos de carreira; não implica afiliação ou endosso.',
    guidesLink: 'Explorar os guias de escrita', compareLink: 'Comparar ferramentas de escrita', blogLink: 'Ler dicas para candidaturas',
    faqs: [
      ['Como personalizar uma carta gerada por IA?', 'Substitua afirmações genéricas por um exemplo relevante e um motivo verdadeiro para escolher o empregador. Confira cada fato com sua experiência. Ajuste o tom e leia o rascunho em voz alta para que a carta soe como você, em vez de enviar a primeira resposta sem alterações.'],
      ['O que escrever se tenho pouca experiência profissional?', 'Use disciplinas, projetos, voluntariado ou responsabilidades fora de empregos remunerados. Explique sua contribuição e o que ela demonstra. Esclareça o contexto e não apresente um exercício acadêmico como emprego profissional. Um exemplo específico e honesto é mais útil do que afirmar uma especialização sem comprovação.'],
      ['Qual deve ser o tamanho da carta?', 'Siga primeiro o limite de palavras ou as instruções do formulário. Quando não houver indicação, procure escrever uma carta concisa que caiba confortavelmente em uma página. Mantenha abertura, evidências e encerramento focados; elimine repetições em vez de acrescentar texto apenas para preencher espaço.'],
      ['Posso usar o rascunho em um portal de vagas?', 'Sim, depois de revisá-lo e conferir os requisitos da vaga. Cole o texto no campo solicitado ou use um formato de documento aceito. Confira a prévia antes de enviar. Gerar a carta aqui não envia uma candidatura ao hh.ru, Indeed, SEEK ou a qualquer empregador.'],
    ],
  },
  ru: {
    title: 'Превратите требования вакансии в письмо с конкретными примерами.',
    paragraphs: [
      'Начните с задач работодателя, а не со списка своих положительных качеств. Прочитайте обязанности и выберите одно или два требования, которые можете подтвердить реальным опытом. Для каждого запишите ситуацию, собственные действия и результат. Учебный проект, волонтёрская задача или разговор с клиентом подойдут, если они действительно связаны с будущей работой. Не нужно перечислять всё, чем вы когда-либо занимались: важнее показать понятную связь с конкретной вакансией.',
      'Используйте письмо, чтобы объяснить то, чего не видно из одного резюме. Вместо повторения всех должностей расскажите, почему определённый пример полезен этому работодателю. Сохраняйте реальный масштаб своего вклада: помогать команде и руководить ею — разные вещи. Добавляйте цифры только тогда, когда можете их подтвердить. Не приписывайте компании ценности, проекты или достижения, о которых не читали в надёжном источнике.',
      'Передайте эти сведения генератору вместе с описанием вакансии и желаемым тоном. Рассматривайте ответ как рабочий черновик. Замените общие похвалы конкретной причиной отклика, проверьте начало и завершение, затем прочитайте письмо вслух. Оставьте формулировки, которые могли бы спокойно произнести на собеседовании. Хорошая версия объясняет соответствие работе, не выдумывает квалификацию и не обещает результат трудоустройства.',
    ],
    platformTitle: 'Откликаетесь через hh.ru, Indeed или другую площадку?',
    tips: [
      ['Следуйте инструкции работодателя', 'Уточните, требуется ли сопроводительное письмо, ответ в текстовом поле или отдельный файл. Соблюдайте запрошенные формат и объём. Условия конкретной вакансии важнее общего шаблона, в том числе в вопросах способа и места отправки. Перед откликом убедитесь, что объявление ещё актуально.'],
      ['Подготовьте нужные сведения', 'Добавьте в исходные данные название должности, работодателя, основные обязанности и пример своего опыта. Если ссылка закрыта, устарела или не читается, самостоятельно скопируйте важные требования. Не рассчитывайте, что инструмент сможет открыть любую страницу с вакансией или подать заявку вместо вас. Проверьте, что вставленный текст относится именно к выбранной позиции.'],
      ['Проверьте перед отправкой', 'Перечитайте название компании, должность, обращение и незаполненные поля. После вставки текста или загрузки документа проверьте абзацы и заполните обязательные поля заявки. Отправляйте отклик через указанный работодателем канал. AILetterGen помогает сформулировать письмо и не представляет перечисленные платформы; сам факт генерации не означает отправку работодателю.'],
    ],
    sourceLabel: 'Дополнительные материалы', sourceNote: 'Независимые редакционные советы на основе карьерных материалов. Упоминание источников не означает партнёрства или одобрения сервиса.',
    guidesLink: 'Открыть руководства по письмам', compareLink: 'Сравнить инструменты', blogLink: 'Читать советы по откликам',
    faqs: [
      ['Как персонализировать письмо, созданное ИИ?', 'Замените общие утверждения подходящим примером и искренней причиной выбора работодателя. Сверьте каждый факт со своим опытом. Отредактируйте тон и прочитайте черновик вслух, чтобы итоговое письмо звучало естественно для вас. Не отправляйте первый ответ без проверки: даже грамотно написанный текст может содержать неточности или лишние предположения.'],
      ['Что написать, если опыта работы мало?', 'Используйте подходящие учебные задания, проекты, волонтёрство или обязанности вне оплачиваемой работы. Объясните свой вклад и то, какие навыки он показывает. Чётко обозначьте контекст: учебный проект не нужно представлять как работу в компании. Конкретный честный пример полезнее неподтверждённого заявления об экспертности, особенно если вы сможете подробно обсудить его на встрече.'],
      ['Какой длины должно быть сопроводительное письмо?', 'Сначала соблюдайте ограничение работодателя по словам или условия текстового поля. Если объём не указан, ориентируйтесь на краткое письмо, которое удобно помещается на одной странице. Сосредоточьтесь на вступлении, подтверждении опыта и завершении. Уберите повторы вместо того, чтобы добавлять текст ради заполнения страницы, и проверьте удобство чтения перед отправкой.'],
      ['Можно ли использовать черновик для отклика на сайте вакансий?', 'Да, после проверки текста и требований объявления. Вставьте письмо в нужное поле или используйте разрешённый формат документа. Проверьте предварительный просмотр и выбранного получателя перед отправкой. Создание письма здесь не отправляет отклик на hh.ru, Indeed, SEEK или работодателю: этот шаг вы выполняете самостоятельно в соответствующем канале.'],
    ],
  },
  ar: {
    title: 'حوّل متطلبات الوظيفة إلى خطاب تدعمه أمثلة حقيقية.',
    paragraphs: [
      'ابدأ بأولويات صاحب العمل، لا بقائمة من الصفات التي تمدح بها نفسك. اقرأ المسؤوليات واختر متطلبًا أو اثنين تستطيع دعمهما بخبرة فعلية. دوّن لكل متطلب الموقف الذي واجهته، وما فعلته أنت تحديدًا، وما النتيجة التي تحققت. يمكن لمشروع دراسي أو مهمة تطوعية أو محادثة مع عميل أن تقدم دليلًا مفيدًا عندما تكون مرتبطة بالعمل المطلوب. لا تحتاج إلى ذكر كل نشاط قمت به، بل إلى اختيار ما يساعد القارئ على فهم ملاءمتك للوظيفة.',
      'استخدم خطاب التقديم لشرح العلاقة التي لا توضحها السيرة الذاتية وحدها. بدلًا من تكرار أسماء الوظائف السابقة، اشرح لماذا يهم إنجاز معين هذا صاحب العمل. حافظ على الحجم الحقيقي لمساهمتك؛ فمساعدة الفريق تختلف عن قيادته. أضف الأرقام فقط عندما تستطيع التحقق منها، وتجنب المعلومات عن الشركة التي لم تتأكد منها. إذا لم تكن تعرف اسم المستلم أو تفاصيل المشروع، فلا تطلب من الأداة اختلاقها لإكمال النص.',
      'قدّم هذه التفاصيل إلى الأداة مع وصف الوظيفة والنبرة التي تفضلها، ثم تعامل مع الإجابة باعتبارها مسودة قابلة للتحسين. استبدل المديح العام بسببك الحقيقي للتقديم، وراجع المقدمة والخاتمة، واقرأ الخطاب بصوت مسموع. احتفظ بالعبارات التي يمكنك قولها بثقة في مقابلة. يجب أن تشرح النسخة النهائية علاقتك بمتطلبات العمل دون اختلاق مؤهلات أو تقديم وعود بنتائج التوظيف. أنت صاحب القرار بشأن المعلومات التي ترسلها.',
    ],
    platformTitle: 'هل تتقدم عبر hh.ru أو Indeed أو منصة وظائف أخرى؟',
    tips: [
      ['اتبع تعليمات صاحب العمل', 'تحقق مما إذا كان الإعلان يطلب خطابًا أو إجابة في حقل نصي أو ملفًا مرفقًا. التزم بالتنسيق والطول المطلوبين. تعليمات الوظيفة المحددة تتقدم على أي قالب عام، بما فيها مكان إرسال الطلب وطريقته. راجع أيضًا أن الإعلان ما زال متاحًا قبل تجهيز النسخة النهائية.'],
      ['جهّز التفاصيل المناسبة', 'أضف المسمى الوظيفي واسم الشركة والمسؤوليات المهمة ومثالًا من خبرتك إلى تعليماتك. إذا كان الرابط خاصًا أو منتهيًا أو غير قابل للقراءة، انسخ المتطلبات ذات الصلة بنفسك. لا تفترض أن الأداة تستطيع فتح كل صفحة وظائف أو تقديم الطلب نيابة عنك. تحقق من أن المعلومات المنسوخة تخص الوظيفة التي اخترتها فعلًا.'],
      ['راجع قبل الإرسال', 'تحقق من اسم الشركة والوظيفة والمستلم وأي حقول غير مكتملة. بعد لصق الخطاب أو رفع الملف، راجع المسافات والفقرات وأكمل الحقول الإلزامية. أرسل عبر القناة التي حددها صاحب العمل. تساعدك AILetterGen على إعداد الصياغة ولا تمثل هذه المنصات؛ إنشاء المسودة هنا لا يعني وصول طلبك إلى جهة التوظيف.'],
    ],
    sourceLabel: 'قراءات إضافية', sourceNote: 'إرشادات تحريرية مستقلة مستندة إلى هذه المصادر المهنية؛ لا تعني الإشارة إليها وجود شراكة أو تأييد للخدمة.',
    guidesLink: 'استكشف أدلة الكتابة', compareLink: 'قارن أدوات الكتابة', blogLink: 'اقرأ نصائح التقديم',
    faqs: [
      ['كيف أخصص خطاب تقديم أنشأه الذكاء الاصطناعي؟', 'استبدل العبارات العامة بمثال مناسب وسبب صادق لاختيار صاحب العمل. طابق كل معلومة مع خبرتك الفعلية، وعدّل النبرة واقرأ المسودة بصوت مسموع حتى تعبر عنك. لا ترسل الإجابة الأولى دون مراجعة؛ فقد تبدو الصياغة جيدة مع احتوائها على تفاصيل غير دقيقة أو افتراضات لم تقدمها أنت.'],
      ['ماذا أكتب إذا كانت خبرتي المهنية محدودة؟', 'استخدم المقررات والمشروعات والتطوع أو المسؤوليات خارج العمل المدفوع متى كانت مرتبطة بالوظيفة. اشرح مساهمتك وما تثبته من مهارات. وضّح السياق ولا تعرض تمرينًا دراسيًا باعتباره وظيفة مهنية. مثال محدد وصادق أنفع من ادعاء خبرة لا تستطيع إثباتها، خصوصًا عندما تُسأل عن التفاصيل في المقابلة.'],
      ['ما الطول المناسب لخطاب التقديم؟', 'اتبع أولًا حد الكلمات أو تعليمات نموذج التقديم. إذا لم يُحدد طول معين، استهدف خطابًا مختصرًا يسهل وضعه في صفحة واحدة. اجعل المقدمة والأمثلة والخاتمة مركزة، واحذف التكرار بدل إضافة كلمات لملء الصفحة. راجع التنسيق النهائي حتى تكون القراءة سهلة على المستلم في القناة المستخدمة.'],
      ['هل يمكنني استخدام المسودة في منصة وظائف؟', 'نعم، بعد مراجعتها والتحقق من متطلبات الإعلان. انسخ النص إلى الحقل المطلوب أو استخدم تنسيق مستند مقبولًا عند الحاجة. افحص المعاينة قبل الإرسال وتأكد من اختيار الوظيفة الصحيحة. إنشاء الخطاب هنا لا يرسل طلبًا إلى hh.ru أو Indeed أو SEEK أو صاحب العمل؛ تنفذ خطوة التقديم بنفسك.'],
    ],
  },
};

export const landingResearch = (locale: Locale) => ({ ...copy[locale], sources: landingResearchSources });
