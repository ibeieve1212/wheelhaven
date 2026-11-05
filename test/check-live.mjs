import assert from 'node:assert/strict';
import { parseTelemetry } from '../dist/game.mjs';
const base='https://api.squeekchain.com/v1/';
const [statusResponse,economyResponse]=await Promise.all(['status','economy/state'].map(p=>fetch(base+p,{signal:AbortSignal.timeout(15000),headers:{Origin:'http://127.0.0.1:4317'}})));
for(const response of [statusResponse,economyResponse]){assert.equal(response.status,200);assert.equal(response.headers.get('access-control-allow-origin'),'*');}
const [status,economy]=await Promise.all([statusResponse.json(),economyResponse.json()]);
const sample=parseTelemetry(status,economy);
assert.equal(sample.ok,true,JSON.stringify(sample));
assert.equal(sample.settledRound,economy.mining.processedThroughRound);
console.log(JSON.stringify({ok:true,installation:status.installationId,work:sample.work,settledRound:sample.settledRound,running:sample.running,receivedAt:sample.receivedAt},null,2));

