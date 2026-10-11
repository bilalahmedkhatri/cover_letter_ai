export const billingPlans = Object.freeze({
  starter: Object.freeze({ id: 'starter', name: 'Starter', price: 10, credits: 120, standardLetters: 30, premiumLetters: 8, universityResearch: 5, standardCost: 4, premiumCost: 15, researchCost: 24 }),
  plus: Object.freeze({ id: 'plus', name: 'Plus', price: 20, credits: 630, standardLetters: 70, premiumLetters: 18, universityResearch: 10, standardCost: 9, premiumCost: 35, researchCost: 63 }),
  pro: Object.freeze({ id: 'pro', name: 'Pro', price: 28, credits: 2100, standardLetters: 100, premiumLetters: 28, universityResearch: 15, standardCost: 21, premiumCost: 75, researchCost: 140 }),
});
export const billingPeriodDays = 30;

// Internal units are plan-specific: budget / operation cost gives exact maxima.
// Each purchase retains its own weights; units are not provider tokens or money.
export const billingLimits = plan => ({
  standardLetters: plan.standardLetters,
  premiumLetters: plan.premiumLetters,
  universityResearch: plan.universityResearch,
});

