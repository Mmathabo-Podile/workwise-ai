import { useState, type ReactNode } from "react";
import { AlertTriangle, Check, Copy, Lightbulb, Loader2, ShieldCheck } from "lucide-react";
import { runAI } from "@/lib/ai.functions";
import type { ToolKey } from "@/lib/prompts";

export type Msg = { role: "user" | "assistant"; content: string };

export async function callAI(tool: ToolKey, messages: Msg[]): Promise<string> {
  const res = await runAI({ data: { tool, messages } });
  if (!res.ok) throw new Error(res.error);
  return res.text;
}

export const DISCLAIMER =
  "AI-generated content may contain errors. Verify important information before use. Do not enter confidential or sensitive workplace information.";

export function Disclaimer() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm text-foreground">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
      <p>{DISCLAIMER}</p>
    </div>
  );
}

export function ReviewBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
      <ShieldCheck className="h-3.5 w-3.5" /> AI-generated — review before use
    </span>
  );
}

export function PageHeader({ icon, title, desc }: { icon: ReactNode; title: string; desc: string }) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</div>
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border bg-card p-5 shadow-card ${className}`}>{children}</div>;
}

export function Examples({ items, onPick }: { items: string[]; onPick: (s: string) => void }) {
  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Lightbulb className="h-3.5 w-3.5" /> Try an example
      </p>
      <div className="flex flex-col gap-2">
        {items.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onPick(t)}
            className="rounded-lg border bg-background px-3 py-2 text-left text-sm transition hover:border-primary hover:bg-primary/5"
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Btn({
  children,
  variant = "primary",
  loading,
  className = "",
  ...p
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" | "ghost"; loading?: boolean }) {
  const v = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
    outline: "border bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
  }[variant];
  return (
    <button
      {...p}
      disabled={p.disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50 ${v} ${className}`}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <Btn
      variant="outline"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
    >
      {done ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {done ? "Copied" : "Copy"}
    </Btn>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      {hint && <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

export const inputCls =
  "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20";

export function ErrorBox({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{msg}</div>;
}
