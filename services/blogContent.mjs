// Reuse the existing editorial reference content and its section structure.
import { blogSlugs } from './blogRoutes.mjs';
export const blogPosts = [
  {
    slug: blogSlugs.coverLetter, category: 'Job applications',
    title: 'How to write a cover letter that connects your experience to the job',
    intro: 'Prepare a clear brief, choose relevant evidence and shape a focused cover letter. This guide walks through structure, career changes and the final checks before sending.',
    ids: ['brief', 'evidence', 'job', 'structure', 'beginner', 'career', 'tone', 'prompts', 'editing', 'exports', 'checklist'],
    action: '/dashboard',
  },
  {
    slug: blogSlugs.university, category: 'University applications',
    title: 'How to prepare a university motivation letter with a clear direction',
    intro: 'Connect your academic preparation to the programme you want to join. Gather verified programme details, explain your motivation and review the application requirements.',
    ids: ['brief', 'evidence', 'motivation', 'programme', 'research', 'structure', 'languages', 'tone', 'prompts', 'editing', 'checklist'],
    action: '/dashboard/university',
  },
  {
    slug: blogSlugs.email, category: 'Business correspondence',
    title: 'How to write a professional business email with a clear next step',
    intro: 'Write introductions, inquiries and follow-ups that make the purpose easy to understand. Decide on the recipient, tone and requested action, then edit the draft before sending.',
    ids: ['email', 'brief', 'evidence', 'languages', 'tone', 'prompts', 'editing', 'exports', 'checklist'],
    action: '/dashboard/email',
  },
];

export const blogCopy = {
  en: { label: 'Blog', title: 'Practical notes for your next letter.', intro: 'Writing guides for job applications, university admissions and professional correspondence.', read: 'Read article', write: 'Start a draft', related: 'More writing guides', notice: '' },
  ru: { label: 'Блог', title: 'Практические советы для вашего следующего письма.', intro: 'Руководства по сопроводительным письмам, поступлению в университет и деловой переписке.', read: 'Читать статью', write: 'Создать черновик', related: 'Другие руководства', notice: 'Статьи пока доступны на английском языке.' },
  es: { label: 'Blog', title: 'Consejos prácticos para tu próxima carta.', intro: 'Guías para solicitudes de empleo, admisión universitaria y correspondencia profesional.', read: 'Leer artículo', write: 'Crear un borrador', related: 'Más guías de escritura', notice: 'Los artículos están disponibles actualmente en inglés.' },
  fr: { label: 'Blog', title: 'Des conseils pratiques pour votre prochaine lettre.', intro: 'Guides pour les candidatures professionnelles, universitaires et les e-mails.', read: 'Lire l’article', write: 'Créer un brouillon', related: 'Autres guides de rédaction', notice: 'Les articles sont actuellement disponibles en anglais.' },
  nl: { label: 'Blog', title: 'Praktische tips voor je volgende brief.', intro: 'Schrijfgidsen voor sollicitaties, universitaire toelating en zakelijke correspondentie.', read: 'Lees artikel', write: 'Maak een concept', related: 'Meer schrijfgidsen', notice: 'De artikelen zijn momenteel beschikbaar in het Engels.' },
  pt: { label: 'Blog', title: 'Dicas práticas para sua próxima carta.', intro: 'Guias para candidaturas a empregos, universidades e correspondência profissional.', read: 'Ler artigo', write: 'Criar um rascunho', related: 'Mais guias de escrita', notice: 'Os artigos estão disponíveis atualmente em inglês.' },
  ar: { label: 'المدونة', title: 'نصائح عملية لرسالتك القادمة.', intro: 'أدلة لطلبات التوظيف والقبول الجامعي والمراسلات المهنية.', read: 'اقرأ المقال', write: 'ابدأ مسودة', related: 'المزيد من أدلة الكتابة', notice: 'المقالات متاحة حاليًا باللغة الإنجليزية.' },
};
export const findBlogPost = slug => blogPosts.find(post => post.slug === slug);
