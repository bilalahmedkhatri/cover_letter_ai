import { z } from 'zod';

export const coverLetterReviewVersion = 'cover-letter-review.v1';
const kind = z.enum(['unsupported_claim','unsupported_number','grammar','language','placeholder','repetition','identity']);
const issue = z.object({kind,quote:z.string().min(1).max(500),message:z.string().min(1).max(600),suggestion:z.string().max(600),sourceIds:z.array(z.enum(['brief','resume','experience','skills'])).max(4)});
export const modelReviewSchema = z.strictObject({
  checks:z.strictObject({factuality:z.boolean(),grammar:z.boolean(),language:z.boolean()}),
  issues:z.array(issue).max(12),
});
const status = z.enum(['needs_review','ai_no_issues_reported','not_checked']);
export const coverLetterQualitySchema = z.object({
  version:z.literal(coverLetterReviewVersion),
  textHash:z.string().regex(/^[a-f0-9]{64}$/),
  checks:z.object({structure:z.enum(['passed','needs_review']),factuality:status,grammar:status,language:status}),
  issues:z.array(issue).max(24),
  previousIssues:z.array(issue).max(24),
  repair:z.object({attempted:z.boolean(),applied:z.boolean()}),
  warnings:z.array(z.enum(['review_unavailable','repair_unavailable','revised_text_not_reviewed','context_limit'])).max(4),
});

export function readCoverLetterQuality(value) {
  const parsed = coverLetterQualitySchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

// Conservative signals only: these do not verify truth or assess grammar.
export function localCoverLetterIssues(draft, prepared) {
  const issues=[];
  const add=(kind,quote,message,suggestion)=>{
    if(issues.length<12 && !issues.some(issue=>issue.kind===kind && issue.quote===quote))issues.push({kind,quote:quote.slice(0,500),message,suggestion,sourceIds:[]});
  };
  const placeholders=/\[(?:your|insert|company|recipient|name|date|position|role|address|email|phone|adresse|courriel|t[ée]l[ée]phone|code postal|ville|nom|nombre|direcci[oó]n|correo|tel[ée]fono|endere[cç]o|telefone|nome|имя|адрес|телефон|дата|ваш|название)[^\]\n]{0,120}\]|\{\{[^}\n]{1,120}\}\}/giu;
  for(const match of draft.matchAll(placeholders))add('placeholder',match[0],'An unfinished template field remains in the draft.','Supply the actual information or remove this field.');
  const sourceText=prepared.sources.map(source=>source.text).join('\n');
  const sourceNumbers=new Set(sourceText.match(/\d+(?:[.,]\d+)?/gu) || []);
  for(const match of draft.matchAll(/(?<![\p{L}\p{N}])\d+(?:[.,]\d+)?\s*(?:%|percent\b|pour cent\b|por ciento\b|por cento\b|процент[\p{L}]*)/giu)){
    const number=match[0].match(/\d+(?:[.,]\d+)?/u)[0];
    if(!sourceNumbers.has(number))add('unsupported_number',match[0],'This numerical result was not found in the supplied text. This is a heuristic warning.','Verify it against your experience or remove it.');
  }
  const seen=new Set();
  for(const paragraph of draft.split(/\n\s*\n/u)){
    const normalized=paragraph.trim().replace(/\s+/gu,' ').toLocaleLowerCase();
    if(normalized.length>40 && seen.has(normalized))add('repetition',paragraph.trim(),'This paragraph is repeated.','Remove the repeated paragraph.');
    seen.add(normalized);
  }
  return issues;
}
