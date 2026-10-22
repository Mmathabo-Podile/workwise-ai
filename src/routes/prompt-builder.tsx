import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Wand2, Wrench } from "lucide-react";
import { Btn, Card, CopyBtn, Disclaimer, ErrorBox, Examples, Field, PageHeader, ReviewBadge, callAI, inputCls } from "@/components/app/shared";
import { setSession } from "@/lib/session";

export const Route = createFileRoute("/prompt-builder")({
  head: () => ({
    meta: [
      { title: "CFREI Prompt Builder — AI Workplace Assistant" },
      { name: "description", content: "Build structured prompts with Context, Format, Role, Examples and Instructions." },
      { property: "og:title", content: "CFREI Prompt Builder" },
      { property: "og:description", content: "Build structured prompts with Context, Format, Role, Examples and Instructions." },
    ],
  }),
  component: PromptBuilder,
});

type F = { context: string; format: string; role: string; examples: string; instructions: string };
const FIELDS: { key: keyof F; label: string; hint: string; ph: string }[] = [
  { key: "context", label: "C — Context", hint: "Background the AI needs: situation, audience, goal.", ph: "e.g. I lead a 6-person marketing team launching a product in 3 weeks." },
  { key: "format", label: "F — Format", hint: "How the answer should look: length, structure, style.", ph: "e.g. A bulleted checklist under 200 words." },
  { key: "role", label: "R — Role", hint: "Who the AI should act as.", ph: "e.g. An experienced project manager." },
  { key: "examples", label: "E — Examples", hint: "Samples of what good output looks like (optional).", ph: "e.g. '☐ Confirm launch date with sales — Owner: Lerato'" },
  { key: "instructions", label: "I — Instructions", hint: "The specific task to perform.", ph: "e.g. Create a launch-readiness checklist grouped by week." },
];
const EXAMPLES: { name: string; f: F }[] = [
  { name: "Weekly status update for leadership", f: { context: "Software team, sprint 14 finished, 2 features shipped, 1 delayed by API issue", format: "Short email, 3 sections: Wins, Risks, Next steps", role: "Senior engineering manager", examples: "Wins: Shipped SSO login (2 days early)", instructions: "Write a weekly status update for the leadership team" } },
  { name: "Meeting agenda for a project kickoff", f: { context: "Kickoff for a website redesign with design, dev and marketing; 60 minutes", format: "Timed agenda table with owners", role: "Experienced facilitator", examples: "10:00–10:10 | Introductions | PM", instructions: "Draft a kickoff meeting agenda" } },
  { name: "Customer complaint response guidance", f: { context: "Customer received a late delivery twice this month and is upset", format: "Numbered steps plus a sample reply", role: "Customer experience lead", examples: "", instructions: "Explain how to respond and draft an empathetic reply" } },
];
const EMPTY: F = { context: "", format: "", role: "", examples: "", instructions: "" };

function combine(f: F) {
  return [
    f.role && `Role: Act as ${f.role}.`,
    f.context && `Context: ${f.context}`,
    f.instructions && `Instructions: ${f.instructions}`,
    f.format && `Format: ${f.format}`,
    f.examples && `Examples: ${f.examples}`,
  ].filter(Boolean).join("\n\n");
}

function PromptBuilder() {
  const nav = useNavigate();
  const [f, setF] = useState<F>(EMPTY);
  const combined = useMemo(() => combine(f), [f]);
  const [original, setOriginal] = useState<string | null>(null);
  const [enhanced, setEnhanced] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [edited, setEdited] = useState<string | null>(null);
  const preview = edited ?? combined;

  async function enhance() {
    if (!preview.trim()) return setErr("Fill in at least one field first.");
    setLoading(true); setErr(null);
    try {
      const out = await callAI("prompt", [{ role: "user", content: `Enhance this prompt:\n\n${preview}` }]);
      setOriginal(preview); setEnhanced(out);
    } catch (e) { setErr((e as Error).message); } finally { setLoading(false); }
  }

  function sendTo(tool: "email" | "research" | "chat", text: string) {
    setSession({ promptHandoff: { tool, text } });
    nav({ to: tool === "email" ? "/email" : tool === "research" ? "/research" : "/chat" });
  }

  const SendRow = ({ text }: { text: string }) => (
    <div className="flex flex-wrap gap-2">
      <CopyBtn text={text} />
      {(["chat", "research", "email"] as const).map((t) => (
        <Btn key={t} variant="outline" onClick={() => sendTo(t, text)}>Use in {t === "chat" ? "Chatbot" : t === "research" ? "Research" : "Email"} <ArrowRight className="h-4 w-4" /></Btn>
      ))}
    </div>
  );

  return (
    <div>
      <PageHeader icon={<Wrench className="h-5 w-5" />} title="CFREI Prompt Builder" desc="Optional: structure your request with Context, Format, Role, Examples and Instructions for better AI results." />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Card className="space-y-4">
            {FIELDS.map((x) => (
              <Field key={x.key} label={x.label} hint={x.hint}>
                <textarea rows={2} className={inputCls} placeholder={x.ph} value={f[x.key]} onChange={(e) => { setF({ ...f, [x.key]: e.target.value }); setEdited(null); }} />
              </Field>
            ))}
          </Card>
          <Card><Examples items={EXAMPLES.map((e) => e.name)} onPick={(n) => { setF(EXAMPLES.find((e) => e.name === n)!.f); setEdited(null); }} /></Card>
        </div>
        <div className="space-y-4">
          <Card className="space-y-3">
            <h2 className="font-display font-semibold">Structured prompt preview <span className="text-xs font-normal text-muted-foreground">(editable)</span></h2>
            <textarea rows={10} className={`${inputCls} font-mono text-[13px]`} value={preview} onChange={(e) => setEdited(e.target.value)} placeholder="Your combined prompt appears here as you type." />
            <Btn className="w-full" onClick={enhance} loading={loading}>{!loading && <Wand2 className="h-4 w-4" />} {loading ? "Enhancing…" : "Enhance with AI"}</Btn>
            <ErrorBox msg={err} />
            {preview.trim() && <SendRow text={preview} />}
          </Card>
          <Disclaimer />
        </div>
      </div>
      {original !== null && (
        <Card className="mt-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="font-display font-semibold">Original vs enhanced</h2><ReviewBadge /></div>
          <div className="grid gap-4 md:grid-cols-2">
            <div><p className="mb-1 text-xs font-medium text-muted-foreground">Original</p><pre className="min-h-48 whitespace-pre-wrap rounded-lg border bg-muted/50 p-3 text-xs">{original}</pre></div>
            <div><p className="mb-1 text-xs font-medium text-primary">Enhanced (editable)</p><textarea rows={12} className={`${inputCls} font-mono text-xs`} value={enhanced} onChange={(e) => setEnhanced(e.target.value)} /></div>
          </div>
          <div className="mt-3"><SendRow text={enhanced} /></div>
        </Card>
      )}
    </div>
  );
}
