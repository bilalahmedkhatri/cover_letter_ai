"use client";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { AccountProvider } from "@/contexts/AccountContext";
import { FormStateProvider } from "@/contexts/FormStateContext";
import { GenerationProvider } from "@/contexts/GenerationContext";
import { TooltipProvider } from "@/components/ui/tooltip";
export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <AccountProvider>
          <FormStateProvider>
            <GenerationProvider>
              <TooltipProvider>{children}</TooltipProvider>
            </GenerationProvider>
          </FormStateProvider>
        </AccountProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
