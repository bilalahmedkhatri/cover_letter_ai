import test from 'node:test';
import assert from 'node:assert/strict';
import { readResume } from '../services/resume.ts';
import { utils, write } from 'xlsx';

test('text and CSV contents retain facts and Unicode',async()=>{
 for(const name of ['notes.txt','details.csv']){
  const file=new File(['Имя,Alex\nAchievement,Led a project'],name);
  assert.match(await readResume(file),/Имя,Alex/);
 }
});
test('Excel readers extract named sheets from XLSX and XLS',async()=>{
 const book=utils.book_new();utils.book_append_sheet(book,utils.aoa_to_sheet([['Name','Achievement'],['Alex','Led a project']]),'Evidence');
 for(const bookType of ['xlsx','xls']){
  const file=new File([write(book,{type:'array',bookType})],`evidence.${bookType}`);
  const text=await readResume(file);assert.match(text,/Evidence/);assert.match(text,/Alex/);assert.match(text,/Led a project/);
 }
});
test('unsupported, empty, oversized and long documents fail explicitly',async()=>{
 for(const file of [new File(['binary'],'app.exe'),new File(['  '],'empty.txt'),new File(['x'.repeat(12001)],'long.txt'),new File([new Uint8Array(5*1024*1024+1)],'big.txt')])await assert.rejects(()=>readResume(file));
});
test('wide spreadsheets are rejected rather than silently dropping columns',async()=>{
 const book=utils.book_new();utils.book_append_sheet(book,utils.aoa_to_sheet([Array.from({length:41},(_,i)=>`Column ${i}`)]),'Wide');
 await assert.rejects(()=>readResume(new File([write(book,{type:'array',bookType:'xlsx'})],'wide.xlsx')),/40 columns/);
});
