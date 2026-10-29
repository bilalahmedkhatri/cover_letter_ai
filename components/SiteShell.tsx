'use client';
import { useSelectedLayoutSegment } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import CookieConsentBanner from './CookieConsentBanner';
import BackToTopButton from './BackToTopButton';
export default function SiteShell({children}:{children:React.ReactNode}) {
  const dashboard = useSelectedLayoutSegment() === 'dashboard';
  return <div className={`${dashboard ? 'min-h-screen' : 'flex min-h-dvh flex-col'} bg-background text-text-primary`}>
    {!dashboard && <Header/>}
    {dashboard ? children : <div className="min-w-0 flex-1">{children}</div>}
    {!dashboard && <Footer/>}
    <CookieConsentBanner/>
    {!dashboard && <BackToTopButton/>}
  </div>;
}
