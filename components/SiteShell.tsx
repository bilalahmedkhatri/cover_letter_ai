'use client';
import Header from './Header';
import Footer from './Footer';
import CookieConsentBanner from './CookieConsentBanner';
import BackToTopButton from './BackToTopButton';
export default function SiteShell({children}:{children:React.ReactNode}) {
  return <div className="min-h-screen bg-background text-text-primary"><Header/>{children}<Footer/><CookieConsentBanner/><BackToTopButton/></div>;
}
