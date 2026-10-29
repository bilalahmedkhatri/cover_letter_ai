import 'server-only';
import type { Locale } from '../types';

type Guide = { title: string; intro: string; contents: string; reference: string; link: string; sections: [string, string][] };
const guides: Record<Locale, Guide> = {
  en: { title: 'Compare cost, scope and workflow', intro: 'Check the terms as well as the headline price.', contents: 'In this guide', reference: 'Comparison guide', link: 'Explore writing features', sections: [
    ['Billing and renewal', 'Check the billing period, renewal terms, taxes, cancellation rules and current provider prices before paying. A monthly subscription and a 30-day package may work differently.'],
    ['Shared allowances', 'Starter maximums are alternatives drawn from one shared allowance, not separate quotas available together. Paid plans are still being prepared.'],
    ['Review your draft', 'Compare the editing, export and career tools you need. Check every generated name, date and claim. No tool guarantees an interview or admission.'],
  ] },
  ru: { title: 'Сравните стоимость, возможности и рабочий процесс', intro: 'Проверьте условия, а не только указанную цену.', contents: 'В этом руководстве', reference: 'Руководство по сравнению', link: 'Изучить возможности написания', sections: [
    ['Оплата и продление', 'Перед оплатой проверьте период, продление, налоги, правила отмены и актуальную цену поставщика. Месячная подписка и пакет на 30 дней могут работать по-разному.'],
    ['Общие лимиты', 'Максимумы Starter — альтернативы в рамках общего лимита, а не отдельные квоты, доступные одновременно. Платные планы ещё готовятся.'],
    ['Проверка черновика', 'Сравните нужные вам инструменты редактирования, экспорта и поиска работы. Проверяйте имена, даты и утверждения. Ни один инструмент не гарантирует собеседование или поступление.'],
  ] },
  es: { title: 'Compara coste, alcance y forma de trabajar', intro: 'Revisa las condiciones además del precio anunciado.', contents: 'En esta guía', reference: 'Guía de comparación', link: 'Explorar las funciones de redacción', sections: [
    ['Facturación y renovación', 'Antes de pagar, revisa el período de facturación, la renovación, los impuestos, la cancelación y el precio actual del proveedor. Una suscripción mensual y un paquete de 30 días pueden funcionar de forma distinta.'],
    ['Cuotas compartidas', 'Los máximos de Starter son alternativas dentro de una cuota compartida, no cuotas independientes disponibles juntas. Los planes de pago siguen en preparación.'],
    ['Revisa tu borrador', 'Compara las herramientas de edición, exportación y búsqueda de empleo que necesitas. Verifica cada nombre, fecha y afirmación. Ninguna herramienta garantiza una entrevista o una admisión.'],
  ] },
  fr: { title: 'Comparez coût, fonctionnalités et méthode de travail', intro: 'Vérifiez les conditions au-delà du prix affiché.', contents: 'Dans ce guide', reference: 'Guide de comparaison', link: 'Explorer les fonctions de rédaction', sections: [
    ['Facturation et renouvellement', 'Avant de payer, vérifiez la période de facturation, le renouvellement, les taxes, les règles d’annulation et le prix actuel du fournisseur. Un abonnement mensuel et un forfait de 30 jours peuvent fonctionner différemment.'],
    ['Quotas partagés', 'Les maximums Starter sont des alternatives dans un quota partagé, pas des quotas distincts disponibles ensemble. Les offres payantes sont encore en préparation.'],
    ['Relisez votre brouillon', 'Comparez les outils d’édition, d’export et de recherche d’emploi nécessaires. Vérifiez chaque nom, date et affirmation. Aucun outil ne garantit un entretien ou une admission.'],
  ] },
  nl: { title: 'Vergelijk kosten, mogelijkheden en werkwijze', intro: 'Controleer de voorwaarden naast de vermelde prijs.', contents: 'In deze gids', reference: 'Vergelijkingsgids', link: 'Bekijk de schrijffuncties', sections: [
    ['Facturering en verlenging', 'Controleer vóór betaling de factureringsperiode, verlenging, belastingen, opzeggingsregels en actuele prijs van de aanbieder. Een maandabonnement en een pakket van 30 dagen kunnen anders werken.'],
    ['Gedeelde limieten', 'De Starter-maxima zijn alternatieven uit één gedeeld tegoed, geen aparte quota die tegelijk beschikbaar zijn. Betaalde abonnementen worden nog voorbereid.'],
    ['Controleer je concept', 'Vergelijk de bewerkings-, export- en carrièretools die je nodig hebt. Controleer elke naam, datum en bewering. Geen tool garandeert een gesprek of toelating.'],
  ] },
  pt: { title: 'Compare custo, recursos e forma de trabalhar', intro: 'Confira as condições além do preço anunciado.', contents: 'Neste guia', reference: 'Guia de comparação', link: 'Explorar os recursos de escrita', sections: [
    ['Cobrança e renovação', 'Antes de pagar, confira o período de cobrança, a renovação, os impostos, as regras de cancelamento e o preço atual do fornecedor. Uma assinatura mensal e um pacote de 30 dias podem funcionar de forma diferente.'],
    ['Franquias compartilhadas', 'Os máximos do Starter são alternativas de uma franquia compartilhada, não cotas separadas disponíveis juntas. Os planos pagos ainda estão em preparação.'],
    ['Revise seu rascunho', 'Compare as ferramentas de edição, exportação e carreira necessárias. Confira cada nome, data e afirmação. Nenhuma ferramenta garante entrevista ou admissão.'],
  ] },
  ar: { title: 'قارن التكلفة والمزايا وطريقة العمل', intro: 'راجع الشروط إلى جانب السعر المعلن.', contents: 'في هذا الدليل', reference: 'دليل المقارنة', link: 'استكشف مزايا الكتابة', sections: [
    ['الفوترة والتجديد', 'تحقق قبل الدفع من فترة الفوترة والتجديد والضرائب وسياسة الإلغاء وسعر المزود الحالي. قد تختلف طريقة عمل الاشتراك الشهري عن باقة 30 يومًا.'],
    ['الحصص المشتركة', 'الحدود القصوى لخطة Starter بدائل ضمن حصة مشتركة واحدة، وليست حصصًا منفصلة متاحة معًا. الخطط المدفوعة لا تزال قيد الإعداد.'],
    ['راجع مسودتك', 'قارن أدوات التحرير والتصدير والبحث عن عمل التي تحتاجها. تحقق من كل اسم وتاريخ وادعاء. لا تضمن أي أداة مقابلة عمل أو قبولًا جامعيًا.'],
  ] },
};

export function compareGuide(locale: Locale) {
  const selected = guides[locale];
  return { ...selected, sections: selected.sections.map(([title, text], index) => ({
    id: `comparison-${index + 1}`, title, paragraphs: [text], link: '/features',
  })) };
}
