"use client";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import DashboardSidebar from "./DashboardSidebar";
import DashboardAccount from "./DashboardAccount";

export default function DashboardShell({ children, workflows }: { children: React.ReactNode; workflows: string[] }) {
  return <SidebarProvider><DashboardSidebar/><SidebarInset className="dashboard-workspace ms-12 min-w-0 p-4 sm:p-6 md:ms-0"><DashboardAccount workflows={workflows}>{children}</DashboardAccount></SidebarInset></SidebarProvider>;
}
