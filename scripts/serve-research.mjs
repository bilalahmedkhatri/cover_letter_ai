// Local-only preview of research artifacts; rejects traversal and does not serve project secrets.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../research/',import.meta.url));
http.createServer(async(req,res)=>{
  try{
    const requested=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
    const target=path.resolve(root,'.'+requested);
    if(!target.startsWith(root)||!['.html','.png','.md','.csv','.json'].includes(path.extname(target))) {res.writeHead(404);res.end();return;}
    const body=await fs.readFile(target);
    const types={'.html':'text/html; charset=utf-8','.png':'image/png','.md':'text/plain; charset=utf-8','.csv':'text/csv; charset=utf-8','.json':'application/json'};
    res.writeHead(200,{'Content-Type':types[path.extname(target)],'Cache-Control':'no-store'});res.end(body);
  }catch{res.writeHead(404);res.end();}
}).listen(4175,'127.0.0.1',()=>console.log('Research preview: http://127.0.0.1:4175/cost-calculator.html'));
