import fs from 'node:fs/promises';
import { calculate, defaults, plans, operationCosts } from '../research/cost-model.mjs';
const engine = (await fs.readFile(new URL('../research/cost-model.mjs', import.meta.url), 'utf8')).replaceAll('export ', '');
const groups = [
  ['Customers and plans', ['users','starterShare','plusShare','starterPrice','plusPrice','proPrice','starterCredits','plusCredits','proCredits','proBonus','utilization','newFreeTrialsPerPaid','trialCredits']],
  ['AI / research estimates', ['lunaLetterCredits','opusLetterCredits','researchCredits','letterInput','letterVisibleOutput','letterReasoning','researchInput','researchVisibleOutput','researchReasoning','researchSearches','searchPrice','retryRate','lunaLetterReserve','opusLetterReserve','researchReserve','letterParsingInfra','researchParsingInfra']],
  ['Payment deductions (checkout tax excluded)', ['paymentPercent','paymentFixed','refundRate','payoutFxRate','disputeReserveRate']],
  ['Monthly operations', ['hosting','database','email','domain','monitoring','infraOverage','accounting','otherFixed','supportPerPaid','replacementCac','churn','ownerHours','ownerHourlyRate','setupCost','amortizationMonths','bufferRate','incomeTaxReserve']],
];
const percent = ['starterShare','plusShare','proBonus','utilization','retryRate','paymentPercent','refundRate','payoutFxRate','disputeReserveRate','churn','bufferRate','incomeTaxReserve'];
const template = await fs.readFile(new URL('../research/subscription-template.html',import.meta.url),'utf8');
await fs.writeFile(new URL('../research/cost-calculator.html', import.meta.url), template.replace('/* ENGINE */',engine).replace('/* CONFIG */',`const groups=${JSON.stringify(groups)};const percent=${JSON.stringify(percent)};`));
const scenarios = [100,500,1000].map(users=>({expected:calculate({users}),fullQuota:calculate({users},true)}));
await fs.writeFile(new URL('../research/cost-scenarios.json', import.meta.url),JSON.stringify({date:'2026-10-11',status:'planning estimates, not measured bills',defaults,plans:plans(),operations:operationCosts(),scenarios},null,2));
const csv = ['paying_users,scenario,gross_revenue,total_cost_before_income_tax,owner_labor_included,profit_before_tax,profit_after_tax_reserve,break_even_paying_users'];
for (const s of scenarios) for (const k of ['expected','fullQuota']) { const x=s[k];csv.push([x.users,k,x.revenue.toFixed(2),(x.revenue-x.beforeTax).toFixed(2),x.ownerLabor.toFixed(2),x.beforeTax.toFixed(2),x.afterTaxReserve.toFixed(2),x.breakEven].join(',')); }
await fs.writeFile(new URL('../research/cost-scenarios.csv', import.meta.url),csv.join('\n')+'\n');
console.log(csv.join('\n'));
