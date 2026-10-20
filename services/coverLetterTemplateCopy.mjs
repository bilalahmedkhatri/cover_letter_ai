const copies = {
  English: {
    intro:'Start with a template. Replace the brackets with your own facts, and remove anything that does not apply.',
    tip:'Add your resume or a job URL using +. Job requirements are context, not proof of your experience.',
    replace:'Replace your current brief?', warning:'The template will replace your text. Attached files, URLs and your output language will stay selected.', cancel:'Keep my text', use:'Use template',
    start:'Write a tailored cover letter using only the facts below.', end:'Keep a professional tone. Do not invent experience or contact details. Omit any information I have not provided.',
    fields:['Target role: [job title]','Company: [company name]','Job requirements: [paste requirements separately from your own experience]','My name: [your name]','Why this role and company: [your specific reasons]','Recipient: [name, if known; otherwise use a neutral greeting]','Signature: [your name]','Contact details: [optional; remove if not needed]'],
    templates:[
      ['First job','Projects, studies and transferable skills.','Education or training: [qualification and relevant coursework]\nProjects, internships or volunteering: [what you actually did]\nRelevant skills: [skills you can demonstrate]'],
      ['Experienced role','Relevant work and specific achievements.','Relevant experience: [role, responsibilities and time in the role]\nAchievements: [specific examples; include numbers only if accurate]\nRelevant skills: [skills that match the role]'],
      ['Career change','Connect your experience to a new direction.','Previous field: [your previous work]\nReason for changing careers: [your real motivation]\nTransferable skills: [examples relevant to this role]\nRelevant training or projects: [completed work, if any]'],
    ],
  },
  Russian: {
    intro:'Начните с шаблона. Замените текст в скобках своими данными и удалите всё, что к вам не относится.',
    tip:'Добавьте резюме или ссылку на вакансию через +. Требования вакансии — это контекст, а не подтверждение вашего опыта.',
    replace:'Заменить текущий текст?', warning:'Шаблон заменит ваш текст. Прикреплённые файлы, ссылки и выбранный язык сохранятся.', cancel:'Оставить мой текст', use:'Использовать шаблон',
    start:'Напиши сопроводительное письмо для этой вакансии, используя только факты ниже.', end:'Сохраняй профессиональный тон. Не придумывай опыт или контактные данные. Не указывай сведения, которых я не предоставил.',
    fields:['Должность: [название должности]','Компания: [название компании]','Требования вакансии: [вставьте требования отдельно от своего опыта]','Моё имя: [ваше имя]','Почему эта должность и компания: [конкретные причины]','Получатель: [имя, если известно; иначе используй нейтральное обращение]','Подпись: [ваше имя]','Контактные данные: [необязательно; удалите, если не нужны]'],
    templates:[
      ['Первая работа','Учёба, проекты и применимые навыки.','Образование или обучение: [квалификация и профильные курсы]\nПроекты, стажировки или волонтёрство: [что вы действительно делали]\nНавыки: [навыки, которые вы можете подтвердить]'],
      ['С опытом работы','Релевантный опыт и конкретные достижения.','Релевантный опыт: [должность, обязанности и период работы]\nДостижения: [конкретные примеры; только достоверные цифры]\nНавыки: [навыки, соответствующие вакансии]'],
      ['Смена профессии','Свяжите свой опыт с новым направлением.','Предыдущая сфера: [ваша прежняя работа]\nПричина смены профессии: [ваша реальная мотивация]\nПереносимые навыки: [примеры, подходящие для новой роли]\nОбучение или проекты: [завершённая работа, если есть]'],
    ],
  },
  Portuguese: {
    intro:'Comece com um modelo. Substitua os trechos entre colchetes por informações reais e remova o que não se aplica.',
    tip:'Adicione seu currículo ou o link da vaga usando +. Os requisitos da vaga são contexto, não comprovação da sua experiência.',
    replace:'Substituir seu texto atual?', warning:'O modelo substituirá seu texto. Os arquivos anexados, links e idioma selecionado serão mantidos.', cancel:'Manter meu texto', use:'Usar modelo',
    start:'Escreva uma carta de apresentação para esta vaga usando apenas os fatos abaixo.', end:'Mantenha um tom profissional. Não invente experiência ou dados de contato. Omita informações que não forneci.',
    fields:['Cargo desejado: [nome do cargo]','Empresa: [nome da empresa]','Requisitos da vaga: [cole os requisitos separadamente da sua experiência]','Meu nome: [seu nome]','Por que esta vaga e empresa: [motivos específicos]','Destinatário: [nome, se conhecido; caso contrário, use uma saudação neutra]','Assinatura: [seu nome]','Dados de contato: [opcional; remova se não forem necessários]'],
    templates:[
      ['Primeiro emprego','Formação, projetos e habilidades transferíveis.','Formação ou treinamento: [qualificação e disciplinas relevantes]\nProjetos, estágios ou voluntariado: [o que você realmente fez]\nHabilidades: [habilidades que você pode demonstrar]'],
      ['Com experiência','Experiência relevante e conquistas concretas.','Experiência relevante: [cargo, responsabilidades e período]\nConquistas: [exemplos específicos; inclua apenas números corretos]\nHabilidades: [habilidades relacionadas à vaga]'],
      ['Mudança de carreira','Conecte sua experiência a uma nova área.','Área anterior: [seu trabalho anterior]\nMotivo da mudança: [sua motivação real]\nHabilidades transferíveis: [exemplos relevantes para o novo cargo]\nFormação ou projetos: [trabalhos concluídos, se houver]'],
    ],
  },
  Spanish: {
    intro:'Empieza con una plantilla. Sustituye los corchetes por tus datos reales y elimina lo que no corresponda.',
    tip:'Añade tu currículum o el enlace de la oferta con +. Los requisitos son contexto, no pruebas de tu experiencia.',
    replace:'¿Sustituir tu texto actual?', warning:'La plantilla sustituirá tu texto. Se conservarán los archivos adjuntos, los enlaces y el idioma seleccionado.', cancel:'Conservar mi texto', use:'Usar plantilla',
    start:'Escribe una carta de presentación adaptada a esta oferta usando solo los datos siguientes.', end:'Mantén un tono profesional. No inventes experiencia ni datos de contacto. Omite la información que no he proporcionado.',
    fields:['Puesto deseado: [nombre del puesto]','Empresa: [nombre de la empresa]','Requisitos de la oferta: [pega los requisitos por separado de tu experiencia]','Mi nombre: [tu nombre]','Por qué este puesto y esta empresa: [motivos concretos]','Destinatario: [nombre, si lo conoces; si no, usa un saludo neutro]','Firma: [tu nombre]','Datos de contacto: [opcional; elimina esta línea si no es necesaria]'],
    templates:[
      ['Primer empleo','Estudios, proyectos y habilidades transferibles.','Formación: [titulación y asignaturas relevantes]\nProyectos, prácticas o voluntariado: [lo que hiciste realmente]\nHabilidades: [habilidades que puedes demostrar]'],
      ['Con experiencia','Experiencia relevante y logros concretos.','Experiencia relevante: [puesto, responsabilidades y duración]\nLogros: [ejemplos concretos; solo cifras comprobables]\nHabilidades: [habilidades que encajan con el puesto]'],
      ['Cambio de carrera','Conecta tu experiencia con una nueva dirección.','Área anterior: [tu trabajo anterior]\nMotivo del cambio: [tu motivación real]\nHabilidades transferibles: [ejemplos relevantes para el nuevo puesto]\nFormación o proyectos: [trabajos terminados, si los hay]'],
    ],
  },
  French: {
    intro:'Commencez par un modèle. Remplacez les crochets par vos informations réelles et supprimez ce qui ne vous concerne pas.',
    tip:'Ajoutez votre CV ou le lien de l’offre avec +. Les exigences du poste constituent un contexte, pas une preuve de votre expérience.',
    replace:'Remplacer votre texte actuel ?', warning:'Le modèle remplacera votre texte. Les pièces jointes, les liens et la langue choisie seront conservés.', cancel:'Conserver mon texte', use:'Utiliser ce modèle',
    start:'Rédige une lettre de motivation adaptée à cette offre en utilisant uniquement les faits ci-dessous.', end:'Garde un ton professionnel. N’invente ni expérience ni coordonnées. Omets les informations que je n’ai pas fournies.',
    fields:['Poste visé : [intitulé du poste]','Entreprise : [nom de l’entreprise]','Exigences du poste : [collez les exigences séparément de votre expérience]','Mon nom : [votre nom]','Pourquoi ce poste et cette entreprise : [raisons précises]','Destinataire : [nom, si connu ; sinon, utilise une formule neutre]','Signature : [votre nom]','Coordonnées : [facultatif ; supprimez cette ligne si inutile]'],
    templates:[
      ['Premier emploi','Études, projets et compétences transférables.','Formation : [diplôme et enseignements pertinents]\nProjets, stages ou bénévolat : [ce que vous avez réellement fait]\nCompétences : [compétences que vous pouvez démontrer]'],
      ['Profil expérimenté','Expérience pertinente et réalisations concrètes.','Expérience pertinente : [poste, responsabilités et durée]\nRéalisations : [exemples précis ; uniquement des chiffres exacts]\nCompétences : [compétences adaptées au poste]'],
      ['Reconversion','Reliez votre expérience à une nouvelle voie.','Domaine précédent : [votre travail précédent]\nRaison de la reconversion : [votre motivation réelle]\nCompétences transférables : [exemples pertinents pour ce poste]\nFormation ou projets : [travaux terminés, le cas échéant]'],
    ],
  },
};

export function coverLetterTemplateCopy(locale, outputLanguage) {
  const language=Object.hasOwn(copies,outputLanguage) ? outputLanguage : {en:'English',ru:'Russian',pt:'Portuguese',es:'Spanish',fr:'French'}[locale];
  const copy=copies[language] || copies.English;
  return {...copy,templates:copy.templates.map(([title,hint,background])=>({title,hint,prompt:[copy.start,'',...copy.fields.slice(0,4),background,...copy.fields.slice(4),'',copy.end].join('\n')}))};
}
