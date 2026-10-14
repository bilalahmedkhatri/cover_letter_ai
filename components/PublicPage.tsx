'use client';
import dynamic from 'next/dynamic';
import type {Page} from '@/services/routing';
import PageArticle from './PageArticle';
const Landing=dynamic(()=>import('./LandingPage'));
const Pricing=dynamic(()=>import('./PricingPage'));
const About=dynamic(()=>import('./AboutUs'));
const Privacy=dynamic(()=>import('./PrivacyPolicy'));
const Terms=dynamic(()=>import('./TermsOfService'));
const Resources=dynamic(()=>import('./ResourcePages'));
const Login=dynamic(()=>import('./LoginPage'));
export default function PublicPage({page}:{page:Page}) {
  const content=page==='/'?<Landing/>:page==='/pricing'?<Pricing/>:page==='/about'?<About/>:page==='/privacy'?<Privacy/>:page==='/terms'?<Terms/>:page==='/login'?<Login/>:<Resources page={page as '/features'|'/guides'|'/compare'}/>;
  return <main className="mx-auto max-w-screen-xl px-5 py-12 sm:px-8 lg:px-10">{content}<PageArticle page={page}/></main>;
}
