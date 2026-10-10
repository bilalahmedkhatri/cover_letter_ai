// Current planning: $10/$20/$28; Pro has 10% extra credits. Not deployed quotas.
export const models={'GPT-6 Luna':{input:.10,output:.50},'Claude Opus 5.5':{input:4,output:20}};
export const defaults={
 users:100,starterShare:.6,plusShare:.3,starterPrice:10,plusPrice:20,proPrice:28,
 starterCredits:100,plusCredits:200,proCredits:280,proBonus:.10,
 lunaLetterCredits:1,opusLetterCredits:4,researchCredits:20,
 letterInput:6000,letterVisibleOutput:1000,letterReasoning:1000,
 researchInput:30000,researchVisibleOutput:6000,researchReasoning:4000,
 researchSearches:3,searchPrice:.01,retryRate:.15,
 lunaLetterReserve:.015,opusLetterReserve:.10,researchReserve:.45,
 letterParsingInfra:.005,researchParsingInfra:.01,utilization:.4,
 newFreeTrialsPerPaid:5,trialCredits:2,paymentPercent:.05,paymentFixed:.5,
 refundRate:.02,payoutFxRate:.01,disputeReserveRate:.005,
 hosting:20,database:25,email:20,domain:1.5,monitoring:5,infraOverage:10,accounting:20,otherFixed:0,
 supportPerPaid:.25,replacementCac:5,churn:.1,ownerHours:20,ownerHourlyRate:10,
 setupCost:0,amortizationMonths:12,bufferRate:.15,incomeTaxReserve:.1
};
export function operationCosts(input={}){
 const a={...defaults,...input};
 const tokens=(m,i,o)=>(i*m.input+o*m.output)/1e6;
 const lo=a.letterVisibleOutput+a.letterReasoning,ro=a.researchVisibleOutput+a.researchReasoning;
 const lunaToken=tokens(models['GPT-6 Luna'],a.letterInput,lo);
 const opusToken=tokens(models['Claude Opus 5.5'],a.letterInput,lo);
 const researchToken=tokens(models['Claude Opus 5.5'],a.researchInput,ro);
 const luna=Math.max(a.lunaLetterReserve,lunaToken*(1+a.retryRate)+a.letterParsingInfra);
 const opus=Math.max(a.opusLetterReserve,opusToken*(1+a.retryRate)+a.letterParsingInfra);
 const research=Math.max(a.researchReserve,(researchToken+a.researchSearches*a.searchPrice)*(1+a.retryRate)+a.researchParsingInfra);
 return {lunaToken,opusToken,researchToken,luna,opus,research,
 perCredit:Math.max(luna/a.lunaLetterCredits,opus/a.opusLetterCredits,research/a.researchCredits)};
}
export function plans(input={}){
 const a={...defaults,...input};
 return [['Starter',a.starterPrice,a.starterCredits],['Plus',a.plusPrice,a.plusCredits],['Pro',a.proPrice,Math.floor(a.proCredits*(1+a.proBonus)+1e-9)]].map(([name,price,credits])=>{
 const lunaLetters=Math.floor(credits/a.lunaLetterCredits),opusLetters=Math.floor(credits/a.opusLetterCredits),researches=Math.floor(credits/a.researchCredits);
 const lt=a.letterInput+a.letterVisibleOutput+a.letterReasoning,rt=a.researchInput+a.researchVisibleOutput+a.researchReasoning;
 return {name,price,credits,lunaLetters,opusLetters,researches,lunaTokens:lunaLetters*lt,opusTokens:opusLetters*lt,researchTokens:researches*rt};
 });
}
export function calculate(input={},fullQuota=false){
 const a={...defaults,...input};
 if(a.starterShare+a.plusShare>1+1e-9)throw new Error('Starter + Plus shares must not exceed 100%; remaining share is Pro.');
 if([a.lunaLetterCredits,a.opusLetterCredits,a.researchCredits].some(x=>x<=0))throw new Error('Operation credit costs must be positive.');
 const p=plans(a),op=operationCosts(a),proShare=Math.max(0,1-a.starterShare-a.plusShare);
 const weightedPrice=a.starterShare*p[0].price+a.plusShare*p[1].price+proShare*p[2].price;
 const weightedQuota=a.starterShare*p[0].credits+a.plusShare*p[1].credits+proShare*p[2].credits;
 const paidCredits=a.users*weightedQuota*(fullQuota?1:a.utilization),freeCredits=a.users*a.newFreeTrialsPerPaid*a.trialCredits;
 // Conservative worst-cost operation mix per credit; trials are Luna-only.
 const ai=paidCredits*op.perCredit+freeCredits*op.luna/a.lunaLetterCredits;
 const revenue=a.users*weightedPrice,payments=revenue*a.paymentPercent+a.users*a.paymentFixed;
 const refunds=revenue*a.refundRate,payoutFx=revenue*a.payoutFxRate,disputes=revenue*a.disputeReserveRate;
 const support=a.users*a.supportPerPaid,marketing=a.users*a.churn*a.replacementCac;
 const fixed=a.hosting+a.database+a.email+a.domain+a.monitoring+a.infraOverage+a.accounting+a.otherFixed;
 const ownerLabor=a.ownerHours*a.ownerHourlyRate,setupAmortization=a.amortizationMonths>0?a.setupCost/a.amortizationMonths:a.setupCost;
 const contingency=(fixed+ai)*a.bufferRate,variable=payments+refunds+payoutFx+disputes+ai+support+marketing;
 const cashOperatingSurplus=revenue-variable-fixed-contingency,beforeTax=cashOperatingSurplus-ownerLabor-setupAmortization;
 const taxReserve=Math.max(0,beforeTax)*a.incomeTaxReserve,afterTaxReserve=beforeTax-taxReserve;
 const perUser=weightedPrice*(a.paymentPercent+a.refundRate+a.payoutFxRate+a.disputeReserveRate)+a.paymentFixed+a.supportPerPaid+a.churn*a.replacementCac+
 (weightedQuota*(fullQuota?1:a.utilization)*op.perCredit+a.newFreeTrialsPerPaid*a.trialCredits*op.luna/a.lunaLetterCredits)*(1+a.bufferRate);
 const contribution=weightedPrice-perUser;
 return {users:a.users,fullQuota,weightedPrice,weightedQuota,paidCredits,freeCredits,unitCost:op.perCredit,revenue,payments,refunds,payoutFx,disputes,ai,support,marketing,fixed,ownerLabor,setupAmortization,contingency,variable,cashOperatingSurplus,beforeTax,taxReserve,afterTaxReserve,margin:revenue>0?afterTaxReserve/revenue:0,
 breakEven:contribution>0?Math.ceil((fixed*(1+a.bufferRate)+ownerLabor+setupAmortization)/contribution):null};
}
