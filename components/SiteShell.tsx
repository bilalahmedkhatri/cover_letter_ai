'use client';
import { useSelectedLayoutSegment } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import CookieConsentBanner from './CookieConsentBanner';
import BackToTopButton from './BackToTopButton';
export default function SiteShell({children}:{children:React.ReactNode}) {
  const dashboard = useSelectedLayoutSegment() === 'dashboard';
  return <div className="min-h-screen bg-background text-text-primary">{!dashboard && <Header/>}{children}{!dashboard && <Footer/>}<CookieConsentBanner/>{!dashboard && <BackToTopButton/>}</div>;
}
