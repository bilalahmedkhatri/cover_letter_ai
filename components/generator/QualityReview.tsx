'use client';
import type { CoverLetterQuality } from '@/contexts/GenerationContext';

const labels={structure:'Template checks',factuality:'Claims',grammar:'Grammar',language:'Language'};
const states={passed:'Local checks passed',needs_review:'Needs attention',ai_no_issues_reported:'AI found no issues',not_checked:'Not checked'};
const warnings={
  review_unavailable:'AI review was unavailable. Check the facts, grammar and language yourself.',
  repair_unavailable:'The revision could not be completed. The original draft is shown.',
  revised_text_not_reviewed:'The revised wording has not had a second AI review. Verify it before sending.',
  context_limit:'Review or revision exceeded the request-size limit. No source text was truncated.',
};
export default function QualityReview({review,changed=false}:{review?:CoverLetterQuality;changed?:boolean}) {
  if(!review)return <p className="text-sm text-text-secondary">This saved draft has no writing review. Verify its facts and wording before sending.</p>;
  if(changed)return <p role="status" className="text-sm text-text-secondary">You edited this draft after its writing review. Your changes have not been checked.</p>;
  return <section aria-label="Writing review" className="space-y-3 text-sm">
    <h2 className="font-semibold">Writing review</h2>
    <p className="text-text-secondary">AI feedback can miss mistakes. Claims are compared with your supplied text, not independently verified.</p>
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">{Object.entries(review.checks).map(([key,value])=><div key={key}><dt className="text-text-secondary">{labels[key as keyof typeof labels]}</dt><dd>{states[value]}</dd></div>)}</dl>
    {review.repair.applied && <p>One automatic revision was applied.</p>}
    {review.warnings.map(code=><p key={code} role="status" className="text-text-secondary">{warnings[code]}</p>)}
    {review.issues.length>0 && <ul aria-label="Issues to review" className="space-y-3">{review.issues.map((issue,index)=><li key={index} className="space-y-1">
      <p><mark className="break-words bg-amber-100 px-1 text-amber-950 dark:bg-amber-950 dark:text-amber-100">{issue.quote}</mark></p>
      <p>{issue.message}</p>{issue.suggestion && <p className="text-text-secondary">{issue.suggestion}</p>}
    </li>)}</ul>}
    {review.previousIssues.length>0 && <details><summary className="cursor-pointer">Issues found before revision</summary><ul className="mt-2 space-y-2">{review.previousIssues.map((issue,index)=><li key={index}><q className="break-words">{issue.quote}</q> — {issue.message}</li>)}</ul><p className="mt-2 text-text-secondary">These refer to the earlier wording. They are not proof that every issue was fixed.</p></details>}
  </section>;
}
