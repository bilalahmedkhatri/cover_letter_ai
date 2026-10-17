// Single newlines belong to a block (for example contact details); blank lines separate paragraphs.
export function textDocument(text: string) {
  const blocks=text.replace(/\r\n?/g, '\n').trim().split(/\n[\t ]*\n+/);
  const salutation=/^(?:Dear\b|Madam\b|Madame\b|Monsieur\b|Sir\b|To whom it may concern\b|Estimad[oa]s?\b|Cher\b|Chère\b|Geachte\b|Prezad[oa]\b|Уважаем|السيد|السيدة)/iu;
  const closing=/^(?:Sincerely|Regards|Best regards|Kind regards|Yours (?:sincerely|faithfully|truly)|Cordialement|Bien cordialement|Atentamente|Saludos cordiales|Met vriendelijke groet|Atenciosamente|С уважением|مع التحية|وتفضلوا)/iu;
  const signatureStart=blocks.findIndex((block,index)=>index>=blocks.length-2 && block.split('\n').length<=5 && closing.test(block.trim()));
  const name=/^[\p{Lu}][\p{L}\p{M}'’.-]*(?:[ \t]+[\p{Lu}][\p{L}\p{M}'’.-]*){0,5}$/u;
  return { type: 'doc', content: blocks.map((block,blockIndex)=>({
    type: 'paragraph',
    attrs: {textAlign:'justify',lineHeight:'1.2'},
    ...(block ? {content:block.split('\n').flatMap((line,index)=>[
      ...(index ? [{type:'hardBreak'}] : []), ...(line ? [{type:'text',text:line,
        ...((salutation.test(line.trim()) && line.length<=140) || (signatureStart>=0 && blockIndex>=signatureStart) || (blocks.length>1 && blockIndex===blocks.length-1 && name.test(block.trim())) ? {marks:[{type:'bold'}]} : {}),
      }] : []),
    ])} : {}),
  })) };
}
