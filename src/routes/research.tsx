import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, Search, Sparkle } from "lucide-react";
import { Btn, Card, Disclaimer, ErrorBox, Examples, Field, PageHeader, callAI, inputCls } from "@/components/app/shared";
import { OutputPanel, type Version } from "@/components/app/OutputPanel";
import { getSession, setSession } from "@/lib/session";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — AI Workplace Assistant" },
      { name: "description", content: "Structured summaries, key insights and actionable recommendations with clear uncertainty." },
      { property: "og:title", content: "AI Research Assistant" },
      { property: "og:description", content: "Structured summaries, key insights and actionable recommendations with clear uncertainty." },
    ],
  }),
  component: ResearchPage,
});

const EXAMPLES = [
  "What are effective strategies for running productive hybrid team meetings?",
  "Summarise the pros and cons of a 4-day work week for a 50-person company.",
  "How can a small business start using AI responsibly in customer service?",
];

function ResearchPage() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);

  useEffect(() => {
    const s = getSession();
    if (s.promptHandoff?.tool === "research") {
      setQ(s.promptHandoff.text);
      setSession({ promptHandoff: null });
    }
  }, []);

  async function generate() {
    if (!q.trim()) return setErr("Please enter a question, topic or article text.");
    setLoading(true);
    setErr(null);
    try {
      const text = await callAI("research", [{ role: "user", content: q }]);
      setVersions((v) => [...v, { label: v.length ? "Regenerated" : "Original", text, at: Date.now() }]);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader icon={<Search className="h-5 w-5" />} title="AI Research Assistant" desc="Ask a question, name a topic or paste an article to get a structured analysis." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className="space-y-4">
          <Card className="space-y-4">
            <Field label="Question, topic or article text" hint="Pasted text is analysed directly; no external sources are looked up.">
              <textarea rows={9} className={inputCls} value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. What drives employee engagement in remote teams?" />
            </Field>
            <Btn className="w-full" onClick={generate} loading={loading}>{!loading && <Sparkle className="h-4 w-4" />} {loading ? "Analysing…" : "Analyse"}</Btn>
            <ErrorBox msg={err} />
          </Card>
          <Card><Examples items={EXAMPLES} onPick={setQ} /></Card>
          <Disclaimer />
        </div>
        <div>
          {versions.length ? (
            <OutputPanel
              markdown
              versions={versions}
              setVersions={setVersions}
              context={`Research request: ${q.slice(0, 3000)}`}
              onRegenerate={generate}
              regenerating={loading}
              extraActions={(text) => (
                <Btn onClick={() => { setSession({ emailHandoff: text }); nav({ to: "/email" }); }}>
                  <Mail className="h-4 w-4" /> Send to Email Generator
                </Btn>
              )}
            />
          ) : (
            <Card className="flex min-h-64 items-center justify-center text-center text-sm text-muted-foreground">
              {loading ? "Researching and structuring insights…" : "Your summary, insights and recommendations will appear here."}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
