import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, Send } from "lucide-react";
import { Btn, Card, Disclaimer, ErrorBox, Examples, Field, PageHeader, callAI, inputCls } from "@/components/app/shared";
import { OutputPanel, type Version } from "@/components/app/OutputPanel";
import { getSession, setSession } from "@/lib/session";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — AI Workplace Assistant" },
      { name: "description", content: "Generate personalised professional emails with subject lines in your chosen tone." },
      { property: "og:title", content: "Smart Email Generator" },
      { property: "og:description", content: "Generate personalised professional emails with subject lines in your chosen tone." },
    ],
  }),
  component: EmailPage,
});

const TONES = ["Formal", "Friendly", "Persuasive"] as const;
const EXAMPLES = [
  { purpose: "Request a deadline extension on the Q3 report", recipient: "My manager, Sarah", details: "Data from finance arrived 4 days late; need until next Wednesday; draft 70% done", tone: "Formal" },
  { purpose: "Welcome a new team member", recipient: "Thabo, joining the design team", details: "Starts Monday 9am, onboarding lunch on Tuesday, buddy is Lisa", tone: "Friendly" },
  { purpose: "Pitch a 4-week pilot of a new scheduling tool", recipient: "Operations Director", details: "Could save ~5 hrs/week per team lead; low cost; want approval by month end", tone: "Persuasive" },
] as const;

function EmailPage() {
  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState("");
  const [details, setDetails] = useState("");
  const [tone, setTone] = useState<string>("Formal");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);

  useEffect(() => {
    const s = getSession();
    if (s.emailHandoff) {
      setPurpose("Share key findings from my research");
      setDetails(s.emailHandoff);
      setSession({ emailHandoff: null });
    }
    if (s.promptHandoff?.tool === "email") {
      setDetails(s.promptHandoff.text);
      setSession({ promptHandoff: null });
    }
  }, []);

  const context = `Purpose: ${purpose}\nRecipient: ${recipient}\nKey details: ${details}\nTone: ${tone}`;

  async function generate() {
    if (!purpose.trim() && !details.trim()) return setErr("Please describe the email purpose or key details.");
    setLoading(true);
    setErr(null);
    try {
      const text = await callAI("email", [{ role: "user", content: `Write an email.\n${context}` }]);
      setVersions((v) => [...v, { label: v.length ? "Regenerated" : "Original", text, at: Date.now() }]);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader icon={<Mail className="h-5 w-5" />} title="Smart Email Generator" desc="Describe your email and pick a tone — get a polished draft with subject line." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className="space-y-4">
          <Card className="space-y-4">
            <Field label="Purpose"><input className={inputCls} value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Follow up after a client meeting" /></Field>
            <Field label="Recipient"><input className={inputCls} value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="e.g. Client, John at Acme" /></Field>
            <Field label="Key details"><textarea rows={5} className={inputCls} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Points, dates, numbers to include" /></Field>
            <div>
              <span className="text-sm font-medium">Tone</span>
              <div className="mt-1.5 grid grid-cols-3 gap-2">
                {TONES.map((t) => (
                  <button key={t} type="button" onClick={() => setTone(t)} className={`rounded-lg border px-3 py-2 text-sm transition ${tone === t ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary"}`}>{t}</button>
                ))}
              </div>
            </div>
            <Btn className="w-full" onClick={generate} loading={loading}>{!loading && <Send className="h-4 w-4" />} {loading ? "Writing…" : "Generate email"}</Btn>
            <ErrorBox msg={err} />
          </Card>
          <Card>
            <Examples items={EXAMPLES.map((e) => e.purpose)} onPick={(p) => { const e = EXAMPLES.find((x) => x.purpose === p)!; setPurpose(e.purpose); setRecipient(e.recipient); setDetails(e.details); setTone(e.tone); }} />
          </Card>
          <Disclaimer />
        </div>
        <div>
          {versions.length ? (
            <OutputPanel versions={versions} setVersions={setVersions} context={context} onRegenerate={generate} regenerating={loading} />
          ) : (
            <Card className="flex min-h-64 items-center justify-center text-center text-sm text-muted-foreground">
              {loading ? "Drafting your email…" : "Your generated email will appear here."}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
