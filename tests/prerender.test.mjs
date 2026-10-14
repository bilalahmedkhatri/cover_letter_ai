import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {join} from 'node:path';
test('every App Router page provides loading and error boundaries',()=>{
 function walk(dir){for(const file of readdirSync(dir,{withFileTypes:true}))if(file.isDirectory())walk(join(dir,file.name));
 if(existsSync(join(dir,'page.tsx')))for(const name of ['loading.tsx','error.tsx'])assert.ok(existsSync(join(dir,name)),`${dir}/${name}`);}
 walk('app');
});
test('dashboard is guarded at both its layout and individual page layer',()=>{
 assert.match(readFileSync('app/[locale]/dashboard/layout.tsx','utf8'),/requireUser/);
 assert.match(readFileSync('components/dashboard/DashboardSection.tsx','utf8'),/requireUser/);
 assert.match(readFileSync('lib/auth/access.ts','utf8'),/redirect.*login/);
});
test('Vercel uses Next server routes instead of static SPA rewrites',()=>{
 const config=JSON.parse(readFileSync('vercel.json','utf8'));assert.equal(config.framework,'nextjs');assert.equal(config.outputDirectory,undefined);assert.equal(config.rewrites,undefined);
});
