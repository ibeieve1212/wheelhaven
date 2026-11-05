import test from 'node:test';
import assert from 'node:assert/strict';
import { createGarden, plantSeed, waterPlant, harvest, harvestAll, buyImprovement, expandPlot, advancePractice, parseTelemetry, applyTelemetry, restoreGarden, canRescue, ready } from '../dist/game.mjs';

const NOW = Date.parse('2026-11-05T08:00:00Z');
function fixtures(work='100', epoch='wheel-a', seconds=0) {
  const date=new Date(NOW+seconds*1000).toISOString();
  return {
    status:{schemaVersion:1,installationId:'sepolia-installation',measurement:{freshness:'online',provenance:'hardware',receivedAt:date,observedAt:date,staleAfterSeconds:120,counterEpoch:epoch,cumulativeWorkUnits:work,rpmMilli:500,coreStatus:'RUNNING'}},
    economy:{schemaVersion:3,status:'available',installationId:'sepolia-installation',chain:{chainId:'11155111',safeThroughBlock:'1000'},capabilities:{core:{currentRound:'20'}},mining:{processedThroughRound:'19'},release:{id:'test-release'}},
  };
}
function sample(work='100', epoch='wheel-a', seconds=0) {
  const x=fixtures(work,epoch,seconds);
  return parseTelemetry(x.status,x.economy,NOW+seconds*1000);
}

test('a new garden has four usable plots and cannot spend dew twice on an occupied plot',()=>{
  const g=createGarden('practice');
  assert.equal(g.plots.filter(p=>p.unlocked).length,4);
  assert.equal(plantSeed(g,0,'broccoli').ok,true);
  assert.equal(g.dew,7);
  assert.equal(plantSeed(g,0,'carrot').ok,false);
  assert.equal(g.dew,7);
  assert.equal(plantSeed(g,2,'carrot').ok,false);
  assert.equal(plantSeed(g,1,'sunflower').reason,'seedLocked');
});

test('live plants receive no historical work at initial connection, including enormous counters',()=>{
  const g=createGarden('live'); plantSeed(g,0,'carrot');
  applyTelemetry(g,sample('999999999999999999999999999'));
  assert.equal(g.plots[0].plant.grown,0);
  applyTelemetry(g,sample('999999999999999999999999999','wheel-a',1));
  assert.equal(g.plots[0].plant.grown,0);
});

test('new accepted work grows all crops and caps progress safely for bigint jumps',()=>{
  const g=createGarden('live'); applyTelemetry(g,sample('100'));
  plantSeed(g,0,'carrot');plantSeed(g,1,'broccoli');
  applyTelemetry(g,sample('103','wheel-a',1));
  assert.equal(g.plots[0].plant.grown,3);assert.equal(g.plots[1].plant.grown,3);
  applyTelemetry(g,sample('999999999999999999999999999','wheel-a',2));
  assert.equal(g.plots[0].plant.grown,6);assert.equal(g.plots[1].plant.grown,14);
});

test('duplicate and out-of-order sensor samples cannot create extra work',()=>{
  const g=createGarden('live'); applyTelemetry(g,sample('100'));
  plantSeed(g,0,'broccoli');applyTelemetry(g,sample('105','wheel-a',5));
  applyTelemetry(g,sample('105','wheel-a',5));assert.equal(g.plots[0].plant.grown,5);
  assert.equal(applyTelemetry(g,sample('102','wheel-a',2)).reason,'outOfOrder');
  assert.equal(g.anchor.work,'105');
  applyTelemetry(g,sample('107','wheel-a',7));assert.equal(g.plots[0].plant.grown,7);
});

test('falling counters and new installations preserve growth without awarding their jumps',()=>{
  const g=createGarden('live');applyTelemetry(g,sample('100'));
  plantSeed(g,0,'broccoli');applyTelemetry(g,sample('103','wheel-a',1));
  applyTelemetry(g,sample('1','wheel-a',2));assert.equal(g.plots[0].plant.grown,3);
  applyTelemetry(g,sample('3','wheel-a',3));assert.equal(g.plots[0].plant.grown,5);
  applyTelemetry(g,sample('5000','wheel-b',4));assert.equal(g.plots[0].plant.grown,5);
  applyTelemetry(g,sample('5001','wheel-b',5));assert.equal(g.plots[0].plant.grown,6);
});

test('stale, future, untrusted and malformed telemetry cannot grow a garden',()=>{
  const g=createGarden('live');applyTelemetry(g,sample());plantSeed(g,0,'carrot');
  const before=JSON.stringify(g);
  for(const mutate of [
    s=>s.measurement.receivedAt='2026-11-05T07:57:59Z',
    s=>s.measurement.observedAt='2026-11-05T07:57:59Z',
    s=>s.measurement.receivedAt='2026-11-05T08:02:00Z',
    s=>s.measurement.provenance='simulated',
    s=>s.measurement.cumulativeWorkUnits='1e8',
    s=>s.measurement.cumulativeWorkUnits='-1',
    s=>s.measurement.freshness='offline',
  ]){const x=fixtures('200');mutate(x.status);const invalid=parseTelemetry(x.status,x.economy,NOW);assert.equal(invalid.ok,false);assert.equal(applyTelemetry(g,invalid).ok,false);}
  assert.equal(JSON.stringify(g),before);
});

test('season metadata comes from matching settled Sepolia data, not an active future round',()=>{
  const x=fixtures();assert.equal(parseTelemetry(x.status,x.economy,NOW).round,'19');
  x.economy.installationId='another-deployment';assert.equal(parseTelemetry(x.status,x.economy,NOW).round,null);
  const g=createGarden('live');plantSeed(g,0,'carrot');assert.equal(g.plots[0].plant.bonus,0);
});

test('practice progress and live progress never cross modes',()=>{
  const live=createGarden('live'),practice=createGarden('practice');
  plantSeed(live,0,'carrot');plantSeed(practice,0,'carrot');
  assert.equal(advancePractice(live).ok,false);assert.equal(applyTelemetry(practice,sample()).ok,false);
  advancePractice(practice,10);assert.equal(ready(practice.plots[0].plant),true);assert.equal(live.plots[0].plant.grown,0);
  assert.equal(practice.practiceWork,'10');
});

test('watering a nearly mature plant makes it ready and produces a valid portable save',()=>{
  const g=createGarden('practice');plantSeed(g,0,'broccoli');advancePractice(g,12);
  assert.equal(ready(g.plots[0].plant),false);assert.equal(waterPlant(g,0).ok,true);
  assert.equal(ready(g.plots[0].plant),true);
  assert.deepEqual(restoreGarden(JSON.stringify(g),'practice'),g);
  const dew=g.dew;assert.equal(waterPlant(g,0).ok,false);assert.equal(g.dew,dew);
});

test('harvesting is one-time, returns the planted seasonal bonus, and upgrades add yield',()=>{
  const g=createGarden('practice');plantSeed(g,0,'carrot');advancePractice(g,6);
  const result=harvest(g,0);assert.equal(result.gain,7);assert.equal(g.harvests,1);
  assert.equal(harvest(g,0).ok,false);assert.equal(g.harvests,1);
  g.improvements.mill=true;plantSeed(g,0,'carrot');advancePractice(g,6);assert.equal(harvest(g,0).gain,8);
});

test('building and plot expansion enforce resource and progression requirements',()=>{
  const g=createGarden('practice');assert.equal(buyImprovement(g,'beacon').reason,'buildFirst');
  assert.equal(buyImprovement(g,'mill').reason,'moreHarvests');
  assert.equal(expandPlot(g,2).ok,true);assert.equal(g.dew,0);
  assert.equal(expandPlot(g,5).reason,'notEnoughDew');
  assert.equal(g.plots[5].unlocked,false);
});

test('an emergency seed prevents a resource soft lock and cannot be claimed alongside active crops',()=>{
  const g=createGarden('practice');expandPlot(g,2);assert.equal(canRescue(g),true);
  assert.equal(plantSeed(g,0,'carrot',true).ok,true);assert.equal(canRescue(g),false);
  assert.equal(plantSeed(g,1,'carrot',true).ok,false);
  advancePractice(g,10);harvest(g,0);assert.ok(g.dew>=3);assert.equal(canRescue(g),false);
});

test('portable save validation rejects malformed or dangerous fields without trusting extra keys',()=>{
  const g=createGarden('practice');plantSeed(g,0,'carrot');
  assert.deepEqual(restoreGarden(JSON.stringify(g),'practice'),g);
  for(const mutate of [
    x=>x.dew=-1,x=>x.dew=Infinity,x=>x.plots.pop(),x=>x.version=99,
    x=>x.plots[0].plant.work=0,x=>x.plots[0].plant.grown=5000,
    x=>x.plots[0].plant.type='<script>',x=>x.improvements.beacon=true,
  ]){const bad=structuredClone(g);mutate(bad);assert.throws(()=>restoreGarden(bad,'practice'));}
  assert.throws(()=>restoreGarden(g,'live'));
  const extra=JSON.parse(JSON.stringify(g));extra.untrusted='<script>';assert.equal('untrusted' in restoreGarden(extra,'practice'),false);
});

test('a complete practice game can restore the beacon through the ordinary resource loop',()=>{
  const g=createGarden('practice');let turns=0;
  while(!g.improvements.beacon && turns++<150){
    for(const key of ['mill','library','beacon']){
      if(g.dew >= ({mill:22,library:30,beacon:82}[key]))buyImprovement(g,key);
    }
    for(let i=0;i<9;i++)if(g.plots[i].unlocked&&!g.plots[i].plant){
      if(g.dew>=2)plantSeed(g,i,'carrot');else if(canRescue(g))plantSeed(g,i,'carrot',true);
    }
    advancePractice(g,10);harvestAll(g);assert.ok(g.dew>=0);
  }
  assert.equal(g.improvements.beacon,true);assert.equal(g.improvements.library,true);assert.equal(g.improvements.mill,true);
  assert.ok(turns<60);assert.ok(g.harvests>=12);assert.ok(BigInt(g.practiceWork)<600n);
  assert.equal(createGarden('live').harvests,0);
});

test('food-theme migration preserves progress, resources and planted crops from the first preview',()=>{
  const original=createGarden('practice');
  plantSeed(original,0,'carrot');plantSeed(original,1,'broccoli');advancePractice(original,3);
  const old=structuredClone(original);old.version=1;
  old.plots[0].plant.type='clover';old.plots[1].plant.type='sunflower';
  old.journal=old.journal.map(e=>({...e,detail:e.detail==='carrot'?'clover':e.detail==='broccoli'?'sunflower':e.detail}));
  assert.deepEqual(restoreGarden(old,'practice'),original);
});

