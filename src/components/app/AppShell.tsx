import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpenCheck, LayoutDashboard, Mail, Menu, MessagesSquare, Moon, Search, ShieldCheck, Sun, Wrench, X, Briefcase } from "lucide-react";
import { DISCLAIMER } from "./shared";

export const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/email", label: "Email Generator", icon: Mail },
  { to: "/research", label: "Research Assistant", icon: Search },
  { to: "/chat", label: "Workplace Chatbot", icon: MessagesSquare },
  { to: "/prompt-builder", label: "Prompt Builder", icon: Wrench },
  { to: "/responsible-ai", label: "Responsible AI", icon: ShieldCheck },
] as const;

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const d = localStorage.getItem("theme") === "dark" || (!localStorage.getItem("theme") && matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(d);
    document.documentElement.classList.toggle("dark", d);
  }, []);
  const toggle = () => {
    const d = !dark;
    setDark(d);
    document.documentElement.classList.toggle("dark", d);
    localStorage.setItem("theme", d ? "dark" : "light");
  };
  return (
    <button onClick={toggle} aria-label="Toggle light/dark mode" className="flex h-9 w-9 items-center justify-center rounded-lg border bg-background transition hover:bg-accent">
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.map((n) => {
        const active = path === n.to;
        return (
          <Link
            key={n.to}
            to={n.to}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}
          >
            <n.icon className="h-4 w-4" /> {n.label}
          </Link>
        );
      })}
    </nav>
  );

  const brand = (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground"><Briefcase className="h-4 w-4" /></span>
      <span className="font-display text-sm font-semibold leading-tight">AI Workplace<br /><span className="text-muted-foreground font-normal">Productivity Assistant</span></span>
    </Link>
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 border-r bg-sidebar p-4 lg:flex">
        {brand}
        {nav}
        <p className="mt-auto rounded-lg bg-sidebar-accent p-3 text-xs text-muted-foreground">{DISCLAIMER}</p>
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col gap-6 border-r bg-sidebar p-4">
            <div className="flex items-center justify-between">{brand}<button aria-label="Close menu" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button></div>
            {nav}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur md:px-8">
          <button className="lg:hidden" aria-label="Open menu" onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></button>
          <span className="flex items-center gap-2 text-sm text-muted-foreground"><BookOpenCheck className="h-4 w-4" /> {NAV.find((n) => n.to === path)?.label ?? ""}</span>
          <div className="ml-auto"><ThemeToggle /></div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
