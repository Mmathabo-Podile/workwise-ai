import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { History, Pencil, RefreshCw, Wand2, Eye } from "lucide-react";
import { Btn, Card, CopyBtn, ErrorBox, ReviewBadge, callAI, inputCls } from "./shared";

export type Version = { label: string; text: string; at: number };

const ACTIONS = [
  { label: "Shorten", instr: "Make it significantly shorter and more concise." },
  { label: "Expand", instr: "Expand it with more useful detail and explanation." },
  { label: "Simplify", instr: "Simplify the language so it is easy for anyone to understand." },
];
const TONES = ["Formal", "Friendly", "Persuasive", "Confident", "Empathetic"];

/** Editable AI output with copy, regenerate, refine and session version history. */
export function OutputPanel({
  versions,
  setVersions,
  context,
  onRegenerate,
  regenerating,
  markdown,
  extraActions,
}: {
  versions: Version[];
  setVersions: (v: Version[]) => void;
  context: string;
  onRegenerate: () => void;
  regenerating: boolean;
  markdown?: boolean;
  extraActions?: (text: string) => React.ReactNode;
}) {
  const latest = versions[versions.length - 1];
  const [text, setText] = useState(latest?.text ?? "");
  const [editing, setEditing] = useState(!markdown);
  const [custom, setCustom] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [compare, setCompare] = useState<number | null>(null);

  useEffect(() => setText(latest?.text ?? ""), [latest]);
  if (!latest) return null;

  async function refine(label: string, instr: string) {
    setBusy(label);
    setErr(null);
    try {
      const out = await callAI("refine", [
        {
          role: "user",
          content: `Original task context:\n${context}\n\nCurrent content:\n${text}\n\nRefinement instruction: ${instr}`,
        },
      ]);
      setVersions([...versions, { label, text: out, at: Date.now() }]);
      setCustom("");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const cmp = compare !== null ? versions[compare] : null;

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="font-display font-semibold">Output</h2>
            <span className="text-xs text-muted-foreground">v{versions.length} · {latest.label}</span>
          </div>
          <ReviewBadge />
        </div>
        {editing ? (
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={16} className={`${inputCls} font-mono text-[13px] leading-relaxed`} />
        ) : (
          <div className="prose prose-sm max-w-none rounded-lg border bg-background p-4 dark:prose-invert">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyBtn text={text} />
          <Btn variant="outline" onClick={onRegenerate} loading={regenerating}>
            {!regenerating && <RefreshCw className="h-4 w-4" />} Regenerate
          </Btn>
          {markdown && (
            <Btn variant="outline" onClick={() => setEditing(!editing)}>
              {editing ? <Eye className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
              {editing ? "Preview" : "Edit"}
            </Btn>
          )}
          {text !== latest.text && (
            <Btn variant="ghost" onClick={() => setVersions([...versions, { label: "Manual edit", text, at: Date.now() }])}>
              Save edit as version
            </Btn>
          )}
          {extraActions?.(text)}
        </div>
      </Card>

      <Card>
        <h3 className="mb-3 flex items-center gap-2 font-display font-semibold">
          <Wand2 className="h-4 w-4 text-primary" /> Refine with AI
        </h3>
        <div className="flex flex-wrap gap-2">
          {ACTIONS.map((a) => (
            <Btn key={a.label} variant="outline" loading={busy === a.label} disabled={!!busy} onClick={() => refine(a.label, a.instr)}>
              {a.label}
            </Btn>
          ))}
          <select
            className={`${inputCls} w-auto`}
            value=""
            disabled={!!busy}
            onChange={(e) => e.target.value && refine(`Tone: ${e.target.value}`, `Change the tone to ${e.target.value.toLowerCase()}.`)}
          >
            <option value="">{busy?.startsWith("Tone") ? "Changing tone…" : "Change tone…"}</option>
            {TONES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (custom.trim()) refine("Custom", custom.trim());
          }}
        >
          <input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Custom instruction, e.g. 'Add a deadline of Friday'" className={inputCls} />
          <Btn type="submit" loading={busy === "Custom"} disabled={!!busy || !custom.trim()}>Apply</Btn>
        </form>
        <div className="mt-3"><ErrorBox msg={err} /></div>
      </Card>

      {versions.length > 1 && (
        <Card>
          <h3 className="mb-3 flex items-center gap-2 font-display font-semibold">
            <History className="h-4 w-4 text-primary" /> Version history <span className="text-xs font-normal text-muted-foreground">(this session)</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {versions.map((v, i) => (
              <button
                key={v.at + i}
                onClick={() => setCompare(compare === i ? null : i)}
                className={`rounded-full border px-3 py-1 text-xs transition ${compare === i ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary"}`}
              >
                v{i + 1} · {v.label}
              </button>
            ))}
          </div>
          {cmp && (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">v{compare! + 1} · {cmp.label}</p>
                <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg border bg-muted/50 p-3 text-xs">{cmp.text}</pre>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Current (v{versions.length})</p>
                <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg border bg-muted/50 p-3 text-xs">{latest.text}</pre>
              </div>
              <Btn variant="outline" className="md:col-span-2" onClick={() => { setVersions([...versions, { label: `Restored v${compare! + 1}`, text: cmp.text, at: Date.now() }]); setCompare(null); }}>
                Restore this version
              </Btn>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
