import { canonicalPublicPages } from '../../services/routing.ts';
import { publicWorkflows, workflows } from '../../services/workflow.mjs';
export const dynamic='force-static';
export function GET() {
  const names=(released:boolean)=>Object.entries(workflows).filter(([key])=>publicWorkflows.includes(key)===released).map(([,workflow])=>workflow.title).join(', ');
  return new Response(`# ailettergen

> AI-assisted business letters, professional emails, university applications and university research.

## Availability

Currently public: ${names(true)}. ${names(false) ? `${names(false)} are in development and are not generally available.` : ''} Pricing describes planned packages; consult the pricing page for current availability.

## Public documentation

${canonicalPublicPages().map(({locale,page,url})=>`- [${locale.toUpperCase()} — ${page==='/'?'Home':page.slice(1).replaceAll('/',' · ').replaceAll('-',' ')}](${url})`).join('\n')}

## Data and limitations

Signed-in writing requests and responses are stored in private account history. Private dashboards, API endpoints and personal conversations are not public documentation. Generated drafts require human review; no interview or admission outcome is guaranteed. See the privacy policy and terms linked above.
`,{headers:{'Content-Type':'text/plain; charset=utf-8'}});
}
