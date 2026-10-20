'use client';
import { useDashboardCopy } from '@/hooks/use-dashboard-copy';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { UserRound, ChevronsUpDown, LogOut, Settings, CreditCard, Moon, Sun, History } from 'lucide-react';
import ChatHistory from './ChatHistory';
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import Brand from '@/components/Brand';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/contexts/LocaleContext';
import { useAccount } from '@/contexts/AccountContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSignOut } from '@/hooks/use-sign-out';
import { useFormState } from '@/contexts/FormStateContext';
import { dashboardNavigation } from '@/services/dashboardNavigation';

export default function DashboardSidebar() {
  const d = useDashboardCopy();
  const { locale } = useLocale();
  const { user } = useAccount();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const { setUserData } = useFormState();
  const { setOpenMobile, isMobile, state, openMobile } = useSidebar();
  const collapsed = !isMobile && state === 'collapsed';
  const signOut = useSignOut();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function logout() {
    setBusy(true); setError('');
    try { await signOut(); }
    catch (e) { setError(e instanceof Error ? e.message : d('Unable to sign out.')); }
    finally { setBusy(false); }
  }
  const itemClass = 'flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-none focus:bg-card-secondary data-[disabled]:pointer-events-none data-[disabled]:opacity-50';
  const navigation = (iconsOnly = false) => dashboardNavigation.filter(item => ['overview'].includes(item.view)).map(({ suffix, title, Icon }) => {
    const url = `/${locale}/dashboard${suffix}`;
    return <SidebarMenuItem key={url}><SidebarMenuButton asChild isActive={pathname === url || (Boolean(suffix) && pathname.startsWith(url + '/'))} tooltip={d(title)}><Link href={url} aria-label={d(title)} onClick={event => { event.preventDefault(); setUserData(previous => ({ ...previous, opportunityDescription: '', opportunityUrl: '', universityUrl: '', courseName: '' })); setOpenMobile(false); router.push(`/${locale}/dashboard?new=${crypto.randomUUID()}`); }}><Icon />{!iconsOnly && <span>{d(title)}</span>}</Link></SidebarMenuButton></SidebarMenuItem>;
  });
  return <>
    {isMobile && !openMobile && <aside aria-label={d('Workspace navigation')} className="fixed inset-y-0 start-0 z-30 flex w-12 flex-col items-center gap-2 border-e bg-sidebar py-2">
      <Link href={`/${locale}`} aria-label="ailettergen home"><Brand compact /></Link><SidebarTrigger />
      <div className="min-h-0 w-full flex-1 overflow-y-auto px-2 sidebar-scroll"><SidebarMenu>{navigation(true)}</SidebarMenu></div>
      <Button variant="ghost" size="icon" aria-label={d('Open chat history')} onClick={() => setOpenMobile(true)}><History className="size-5" /></Button>
      <Button variant="ghost" size="icon" aria-label={d('Open account options')} onClick={() => setOpenMobile(true)}><UserRound className="size-5" /></Button>
    </aside>}
    <Sidebar collapsible="icon" side={locale === 'ar' ? 'right' : 'left'}>
      <SidebarHeader className="border-b p-2"><div className={collapsed ? 'flex flex-col items-center gap-2' : 'flex items-center justify-between gap-2'}><Link href={`/${locale}`} aria-label="ailettergen home"><Brand compact={collapsed} /></Link><SidebarTrigger /></div></SidebarHeader>
      <SidebarContent className="sidebar-scroll pt-3.5"><SidebarGroup><SidebarMenu>
        {navigation()}
      </SidebarMenu></SidebarGroup><ChatHistory collapsed={collapsed} /></SidebarContent>
      <SidebarFooter className="border-t">
        {error && <p role="alert" className="px-2 text-xs text-destructive">{error}</p>}
        <SidebarMenu><SidebarMenuItem><DropdownMenu.Root dir={locale === 'ar' ? 'rtl' : 'ltr'}>
          <DropdownMenu.Trigger asChild><SidebarMenuButton size="lg" aria-label={d('Account menu')} disabled={busy}>
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500"><UserRound className="size-5" /></span>
            {!collapsed && <><span className="grid min-w-0 flex-1 text-start"><span className="truncate font-semibold">{user?.name || d('Your account')}</span><span className="truncate text-xs text-text-secondary">{user?.email || d('Loading account…')}</span></span><ChevronsUpDown className="size-4 shrink-0" /></>}
          </SidebarMenuButton></DropdownMenu.Trigger>
          <DropdownMenu.Portal><DropdownMenu.Content side={isMobile ? 'top' : locale === 'ar' ? 'left' : 'right'} align="end" sideOffset={8} className="z-50 min-w-56 rounded-xl border border-border bg-card p-1.5 text-text-primary shadow-lg">
            <DropdownMenu.Item asChild className={itemClass}><Link href={`/${locale}/dashboard/settings`} onClick={() => setOpenMobile(false)}><Settings size={16} />{d('Profile & settings')}</Link></DropdownMenu.Item>
            <DropdownMenu.Item asChild className={itemClass}><Link href={`/${locale}/dashboard/billing`} onClick={() => setOpenMobile(false)}><CreditCard size={16} />{d('Plan & usage')}</Link></DropdownMenu.Item>
            <DropdownMenu.Item className={itemClass} onSelect={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}{theme === 'dark' ? d('Light theme') : d('Dark theme')}</DropdownMenu.Item>
            <DropdownMenu.Separator className="my-1 h-px bg-border" />
            <DropdownMenu.Item className={itemClass} disabled={busy} onSelect={() => { void logout(); }}><LogOut size={16} />{busy ? d('Signing out…') : d('Log out')}</DropdownMenu.Item>
          </DropdownMenu.Content></DropdownMenu.Portal>
        </DropdownMenu.Root></SidebarMenuItem></SidebarMenu>
      </SidebarFooter>
    </Sidebar></>;
}
