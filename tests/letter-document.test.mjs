import test from 'node:test';
import assert from 'node:assert/strict';
import {textDocument} from '../services/letterDocument.ts';
test('contact lines stay compact while blank lines separate body paragraphs',()=>{
 const doc=textDocument('Alex\r\nEmail@example.com\r\n\r\nDear team,\n\nFirst paragraph.\n\n\nSecond paragraph.\n\nSincerely,\nAlex');
 assert.equal(doc.content.length,5);
 assert.deepEqual(doc.content[0].content,[{type:'text',text:'Alex'},{type:'hardBreak'},{type:'text',text:'Email@example.com'}]);
 assert.deepEqual(doc.content[4].content,[{type:'text',text:'Sincerely,',marks:[{type:'bold'}]},{type:'hardBreak'},{type:'text',text:'Alex',marks:[{type:'bold'}]}]);
 assert.deepEqual(textDocument('').content,[{type:'paragraph',attrs:{textAlign:'justify',lineHeight:'1.2'}}]);
 assert.ok(doc.content.every(p=>p.attrs.textAlign==='justify' && p.attrs.lineHeight==='1.2'));
 assert.deepEqual(doc.content[1].content[0].marks,[{type:'bold'}]);
 assert.equal(doc.content[2].content[0].marks,undefined);
});
test('French greeting and separate signature default bold without bolding body paragraphs',()=>{
 const doc=textDocument('Madame, Monsieur,\n\nJe vous adresse ma candidature.\n\nAlex Example');
 assert.deepEqual(doc.content[0].content[0].marks,[{type:'bold'}]);
 assert.deepEqual(doc.content[2].content[0].marks,[{type:'bold'}]);
 assert.equal(doc.content[1].content[0].marks,undefined);
});
