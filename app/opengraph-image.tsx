import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const alt='ailettergen — business letters, professional emails, university applications and research';
export const size={width:1200,height:630};
export const contentType='image/png';
export default async function Image() {
  const icon=await readFile(join(process.cwd(),'public/icon.svg'));
  return new ImageResponse(<div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',background:'#090f0d',color:'#f4faf6',padding:'54px 64px',fontFamily:'sans-serif',borderBottom:'12px solid #059669'}}>
    <div style={{display:'flex',alignItems:'center',gap:20}}><img src={`data:image/svg+xml;base64,${icon.toString('base64')}`} width={64} height={64}/><span style={{fontSize:40,fontWeight:700}}>ailettergen<span style={{color:'#10b981'}}>.</span></span></div>
    <div style={{display:'flex',marginTop:44,fontSize:62,fontWeight:700,letterSpacing:-2,lineHeight:1.1}}>Your words. Your next opportunity.</div>
    <div style={{display:'flex',flexWrap:'wrap',gap:14,marginTop:38}}>{['Business letters','Professional emails','University applications','University research'].map(label=><div key={label} style={{display:'flex',padding:'14px 22px',border:'1px solid #335047',borderRadius:12,fontSize:26,color:'#bcebd8',background:'#14271f'}}>{label}</div>)}</div>
    <div style={{display:'flex',justifyContent:'space-between',marginTop:'auto',fontSize:21,color:'#9baea4'}}><span>Cover letters available · More tools in development</span><span>ailettergen.com</span></div>
  </div>,size);
}
