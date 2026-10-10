import test from 'node:test';
import assert from 'node:assert/strict';
import { calculate, plans, operationCosts } from '../research/cost-model.mjs';
test('complete costs reconcile and full-quota usage increases expense',()=>{
  const e=calculate(),w=calculate({},true);
  assert.ok(Math.abs(e.revenue-1480)<1e-8);
  assert.ok(Math.abs(e.paidCredits-6032)<1e-8);
  assert.equal(e.freeCredits,1000);
  assert.ok(Math.abs(e.unitCost-.025)<1e-10);
  assert.ok(Math.abs(e.revenue-e.variable-e.fixed-e.contingency-e.ownerLabor-e.beforeTax)<1e-9);
  assert.ok(w.ai>e.ai && w.afterTaxReserve<e.afterTaxReserve);
});
test('break-even includes labor and free users; zero users and losing prices stay finite',()=>{
  for(const full of [false,true]){
    const b=calculate({},full).breakEven;
    assert.ok(calculate({users:b},full).beforeTax>=0);
    assert.ok(calculate({users:b-1},full).beforeTax<0);
  }
  assert.ok(Number.isFinite(calculate({users:0}).beforeTax));
  assert.equal(calculate({starterPrice:.1,plusPrice:.1,proPrice:.1}).breakEven,null);
});
test('expensive models and additional fees are not hidden by the action floor',()=>{
  assert.ok(operationCosts({researchReasoning:30000}).perCredit>operationCosts().perCredit);
  assert.ok(calculate({paymentPercent:.07,payoutFxRate:.03}).beforeTax<calculate().beforeTax);
  assert.ok(Math.abs(calculate({setupCost:1200,amortizationMonths:12}).beforeTax - (calculate().beforeTax-100)) < 1e-9);
});
test('Pro bonus and model/research limits share one wallet',()=>{
  const p=plans();
  assert.deepEqual(p.map(x=>x.credits),[100,200,308]);
  assert.deepEqual(p.map(x=>x.lunaLetters),[100,200,308]);
  assert.deepEqual(p.map(x=>x.opusLetters),[25,50,77]);
  assert.deepEqual(p.map(x=>x.researches),[5,10,15]);
  assert.deepEqual(p.map(x=>x.lunaTokens),[800000,1600000,2464000]);
  assert.equal(108+30*4+4*20,308);
  assert.equal(operationCosts().lunaToken,.0016);
  assert.equal(operationCosts().opusToken,.064);
  assert.equal(operationCosts().researchToken,.32);
  assert.throws(()=>calculate({starterShare:.8,plusShare:.5}));
});
