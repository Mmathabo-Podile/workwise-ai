import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowUp, Bot, MessagesSquare, Trash2 } from "lucide-react";
import { Btn, Card, CopyBtn, Disclaimer, ErrorBox, PageHeader, ReviewBadge, callAI, inputCls, type Msg } from "@/components/app/shared";
import { getSession, setSession } from "@/lib/session";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Workplace Chatbot — AI Workplace Assistant" },
      { name: "description", content: "Chat with an AI assistant about workplace questions, problem-solving and productivity." },
      { property: "og:title", content: "AI Workplace Chatbot" },
      { property: "og:description", content: "Chat with an AI assistant about workplace questions, problem-solving and productivity." },
    ],
  }),
  component: ChatPage,
});

const EXAMPLES = [
  "How do I prioritise when everything feels urgent?",
  "How can I give constructive feedback to a colleague who misses deadlines?",
  "Help me plan a focused 8-hour workday with deep work blocks.",
];

let sessionMessages: Msg[] = [];

function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>(sessionMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => { sessionMessages = messages; end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [messages, loading]);
  useEffect(() => {
    const s = getSession();
    if (s.promptHandoff?.tool === "chat") { setInput(s.promptHandoff.text); setSession({ promptHandoff: null }); }
  }, []);

  async function send(text: string, history = messages) {
    if (!text.trim() || loading) return;
    const next = [...history, { role: "user" as const, content: text.trim() }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setErr(null);
    try {
      const reply = await callAI("chat", next);
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function regenerate() {
    const lastUser = messages.map((m) => m.role).lastIndexOf("user");
    if (lastUser < 0) return;
    send(messages[lastUser]!.content, messages.slice(0, lastUser));
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader icon={<MessagesSquare className="h-5 w-5" />} title="AI Workplace Chatbot" desc="Ask anything about work — the assistant remembers this conversation." />
        {messages.length > 0 && <Btn variant="outline" onClick={() => { setMessages([]); setErr(null); }}><Trash2 className="h-4 w-4" /> Clear conversation</Btn>}
      </div>
      <Card className="flex min-h-[60vh] flex-col p-0">
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {messages.length === 0 && (
            <div className="mx-auto max-w-md py-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brand text-primary-foreground"><Bot className="h-6 w-6" /></div>
              <p className="mt-4 font-display font-semibold">How can I help you work smarter today?</p>
              <div className="mt-5 flex flex-col gap-2">
                {EXAMPLES.map((e) => <button key={e} onClick={() => send(e)} className="rounded-lg border bg-background px-3 py-2 text-left text-sm transition hover:border-primary hover:bg-primary/5">{e}</button>)}
              </div>
            </div>
          )}
          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="flex justify-end"><div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground">{m.content}</div></div>
            ) : (
              <div key={i} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Bot className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <div className="prose prose-sm max-w-none dark:prose-invert"><ReactMarkdown>{m.content}</ReactMarkdown></div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <ReviewBadge />
                    <CopyBtn text={m.content} />
                    {i === messages.length - 1 && <Btn variant="ghost" onClick={regenerate} disabled={loading}>Regenerate</Btn>}
                  </div>
                </div>
              </div>
            ),
          )}
          {loading && <div className="flex items-center gap-3 text-sm text-muted-foreground"><Bot className="h-4 w-4 animate-pulse" /> Thinking…</div>}
          <ErrorBox msg={err} />
          <div ref={end} />
        </div>
        <form className="flex items-end gap-2 border-t p-3" onSubmit={(e) => { e.preventDefault(); send(input); }}>
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder="Ask a workplace question… (Shift+Enter for new line)"
            className={`${inputCls} max-h-40 min-h-10 resize-none`}
          />
          <Btn type="submit" aria-label="Send" loading={loading} disabled={!input.trim()} className="h-10 w-10 shrink-0 p-0">{!loading && <ArrowUp className="h-4 w-4" />}</Btn>
        </form>
      </Card>
      <div className="mt-4"><Disclaimer /></div>
    </div>
  );
}
