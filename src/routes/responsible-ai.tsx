import { createFileRoute } from "@tanstack/react-router";
import { Eye, Lock, Scale, ShieldCheck, TriangleAlert } from "lucide-react";
import { Card, Disclaimer, PageHeader } from "@/components/app/shared";

export const Route = createFileRoute("/responsible-ai")({
  head: () => ({
    meta: [
      { title: "Responsible AI — AI Workplace Assistant" },
      { name: "description", content: "How to use AI responsibly: hallucinations, bias, privacy and human oversight." },
      { property: "og:title", content: "Responsible AI" },
      { property: "og:description", content: "How to use AI responsibly: hallucinations, bias, privacy and human oversight." },
    ],
  }),
  component: Page,
});

const ITEMS = [
  { icon: TriangleAlert, title: "Hallucinations", text: "AI can produce confident-sounding statements that are wrong or made up, including facts, figures and sources. Check anything important against a trusted source." },
  { icon: Scale, title: "Bias", text: "AI learns from human-written data and can reflect stereotypes or one-sided views. Review outputs for fairness, especially in hiring, feedback or customer communication." },
  { icon: Lock, title: "Privacy", text: "Do not enter confidential, personal or sensitive workplace information. This app keeps data only in your browser session, but inputs are sent to an AI model to generate responses." },
  { icon: Eye, title: "Human oversight", text: "You are responsible for what you send or act on. Treat AI output as a first draft: read it, edit it and decide whether it is right for your situation." },
];

function Page() {
  return (
    <div className="space-y-6">
      <PageHeader icon={<ShieldCheck className="h-5 w-5" />} title="Responsible AI" desc="Use AI as a helpful assistant — not a final authority." />
      <Disclaimer />
      <div className="grid gap-4 md:grid-cols-2">
        {ITEMS.map((i) => (
          <Card key={i.title}>
            <i.icon className="h-5 w-5 text-primary" />
            <h2 className="mt-3 font-display font-semibold">{i.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{i.text}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
