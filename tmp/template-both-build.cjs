const fs=require('node:fs');
let source=fs.readFileSync('tmp/template-ui-build.cjs','utf8').replaceAll('tmp/template-ui','tmp/template-both');
source=source.replace("exports.useLocale=()=>({locale:window.testLocale||'en',t:()=>''})", "const React=require('react');exports.useLocale=()=>{const[locale,setLocale]=React.useState(window.testLocale||'en');React.useEffect(()=>{const update=()=>setLocale(window.testLocale);window.addEventListener('test-locale',update);return()=>window.removeEventListener('test-locale',update)},[]);return{locale,t:()=>''}};");
new Function('require',source)(require);
