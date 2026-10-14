"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  GraduationCap,
  Mail,
  FolderOpen,
  Settings,
  CreditCard,
  MessageSquare,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useLocale } from "@/contexts/LocaleContext";
const links = [
  ["", "Overview", LayoutDashboard],
  ["/cover-letter", "Cover letter", FileText],
  ["/university", "University application", GraduationCap],
  ["/email", "Professional email", Mail],
  ["/drafts", "Saved drafts", FolderOpen],
  ["/billing", "Plan & usage", CreditCard],
  ["/settings", "Profile & settings", Settings],
  ["/feedback", "Share feedback", MessageSquare],
] as const;
function DashboardNavigation() {
  const { locale } = useLocale();
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  return (
    <Sidebar collapsible="offcanvas" className="dashboard-sidebar">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Writing workspace</SidebarGroupLabel>
          <SidebarMenu>
            {links.map(([suffix, title, Icon]) => {
              const url = `/${locale}/dashboard${suffix}`;
              return (
                <SidebarMenuItem key={url}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === url}
                    tooltip={title}
                  >
                    <Link href={url} onClick={() => setOpenMobile(false)}>
                      <Icon />
                      <span>{title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider className="min-h-[calc(100svh-5rem)]">
      <DashboardNavigation />
      <SidebarInset>
        <div className="flex h-14 items-center gap-3 border-b px-6">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5" />
          <span className="text-sm text-text-secondary">
            Your next opportunity starts here.
          </span>
        </div>
        <main className="min-w-0 flex-1 p-5 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
