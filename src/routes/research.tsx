import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Link2, Mail, Search, Sparkle } from "lucide-react";
import { Btn, Card, Disclaimer, ErrorBox, Examples, Field, PageHeader, callAI, inputCls } from "@/components/app/shared";
import { OutputPanel, type Version } from "@/components/app/OutputPanel";
import { fetchPageText } from "@/lib/fetch-page.functions";
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

type Mode = "text" | "url";

function ResearchPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<Mode>("text");
  const [q, setQ] = useState("");
  const [url, setUrl] = useState("");
  const [focus, setFocus] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [lastContext, setLastContext] = useState("");

  useEffect(() => {
    const s = getSession();
    if (s.promptHandoff?.tool === "research") {
      setQ(s.promptHandoff.text);
      setSession({ promptHandoff: null });
    }
  }, []);

  async function generate() {
    if (loading) return;
    let messages;
    let contextLabel: string;
    if (mode === "url") {
      if (!url.trim()) return setErr("Please enter a web page URL.");
      setErr(null);
      let page: Awaited<ReturnType<typeof fetchPageText>>;
      try {
        page = await fetchPageText({ data: { url } });
      } catch {
        return setErr("The page could not be reached. Check the URL and try again.");
      }
      if (!page.ok) return setErr(page.error);
      const focusLine = focus.trim() ? ` Focus on: ${focus.trim()}.` : "";
      messages = [
        {
          role: "user" as const,
          content: `Analyse the content of the web page below and produce your structured analysis.${focusLine}\n\nWeb page content:\n"""\n${page.text}\n"""`,
        },
      ];
      contextLabel = `Research of web page: ${url.trim()}${focus.trim() ? ` — focus: ${focus.trim()}` : ""}`;
    } else {
      if (!q.trim()) return setErr("Please enter a question, topic or article text.");
      setErr(null);
      messages = [{ role: "user" as const, content: q }];
      contextLabel = `Research request: ${q.slice(0, 3000)}`;
    }
    setLoading(true);
    try {
      const text = await callAI("research", messages);
      setVersions((v) => [...v, { label: v.length ? "Regenerated" : "Original", text, at: Date.now() }]);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const modeBtn = (m: Mode, label: string) => (
    <button
      key={m}
      type="button"
      onClick={() => { setMode(m); setErr(null); }}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${mode === m ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}
    >
      {m === "url" && <Link2 className="h-4 w-4" />}
      {label}
    </button>
  );

  return (
    <div>
      <PageHeader icon={<Search className="h-5 w-5" />} title="AI Research Assistant" desc="Ask a question, name a topic, paste an article or analyse a web page URL to get a structured analysis." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className="space-y-4">
          <Card className="space-y-4">
            <div className="flex gap-1 rounded-xl border bg-muted/40 p-1">
              {modeBtn("text", "Topic or text")}
              {modeBtn("url", "Web page URL")}
            </div>
            {mode === "text" ? (
              <Field label="Question, topic or article text" hint="Pasted text is analysed directly; no external sources are looked up.">
                <textarea rows={9} className={inputCls} value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. What drives employee engagement in remote teams?" />
              </Field>
            ) : (
              <>
                <Field label="Web page URL" hint="The page is read from its public URL; only the readable text is analysed.">
                  <input className={inputCls} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/article" inputMode="url" />
                </Field>
                <Field label="What should the analysis focus on? (optional)" hint="Leave blank for a general summary of the page.">
                  <textarea rows={4} className={inputCls} value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="e.g. Summarise the proposed policy changes and what they mean for small teams" />
                </Field>
              </>
            )}
            <Btn className="w-full" onClick={generate} loading={loading}>{!loading && <Sparkle className="h-4 w-4" />} {loading ? "Analysing…" : mode === "url" ? "Analyse page" : "Analyse"}</Btn>
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
              context={contextLabel}
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
              {loading ? (mode === "url" ? "Reading the page and structuring insights…" : "Researching and structuring insights…") : "Your summary, insights and recommendations will appear here."}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
