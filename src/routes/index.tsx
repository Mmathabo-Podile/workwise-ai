import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { NAV } from "@/components/app/AppShell";
import { Card, Disclaimer } from "@/components/app/shared";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Workplace Productivity Assistant" },
      { name: "description", content: "Write emails, research topics, chat about work and build better prompts with AI." },
      { property: "og:title", content: "AI Workplace Productivity Assistant" },
      { property: "og:description", content: "Write emails, research topics, chat about work and build better prompts with AI." },
    ],
  }),
  component: Index,
});

const DESC: Record<string, string> = {
  "/email": "Draft personalised emails with subject lines in Formal, Friendly or Persuasive tone.",
  "/research": "Get structured summaries, key insights and recommendations — with honest uncertainty.",
  "/chat": "Ask workplace questions, solve problems and get productivity advice in conversation.",
  "/prompt-builder": "Build stronger prompts using the CFREI framework and compare original vs enhanced.",
  "/responsible-ai": "Understand hallucinations, bias, privacy and why human oversight matters.",
};

function Index() {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-brand p-8 text-primary-foreground md:p-10">
        <p className="text-sm font-medium opacity-90">Welcome back 👋</p>
        <h1 className="mt-2 max-w-2xl font-display text-3xl font-semibold tracking-tight md:text-4xl">Get your workplace tasks done faster with AI.</h1>
        <p className="mt-3 max-w-xl text-sm opacity-90">Pick a tool below. Everything stays in this browser session — nothing is saved once you close the tab.</p>
        <Link to="/email" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:opacity-90">
          Start with an email <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
      <Disclaimer />
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {NAV.filter((n) => n.to !== "/").map((n) => (
          <Link key={n.to} to={n.to} className="group">
            <Card className="h-full transition group-hover:-translate-y-0.5 group-hover:border-primary">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><n.icon className="h-5 w-5" /></div>
              <h2 className="mt-4 font-display font-semibold">{n.label}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{DESC[n.to]}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">Open <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" /></span>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
