import { createServerFn } from "@tanstack/react-start";

const MAX_CHARS = 18000;

function decodeEntities(s: string) {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/&#39;|'/g, "'")
    .replace(/&#(\d+);/g, (_, n: string) => {
      const code = Number(n);
      return code > 0 && code < 0x110000 ? String.fromCharCode(code) : " ";
    });
}

export type FetchPageResult =
  | { ok: true; text: string; title: string; truncated: boolean }
  | { ok: false; error: string };

export const fetchPageText = createServerFn({ method: "POST" })
  .inputValidator((d: { url: string }) => ({ url: String(d?.url ?? "").trim() }))
  .handler(async ({ data }): Promise<FetchPageResult> => {
    const raw = data.url;
    if (!raw) return { ok: false, error: "Please enter a web page URL." };
    let parsed: URL;
    try {
      parsed = new URL(raw);
    } catch {
      return { ok: false, error: "Please enter a valid URL, e.g. https://example.com/article" };
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { ok: false, error: "Only http and https URLs are supported." };
    }
    const host = parsed.hostname.toLowerCase();
    const isPrivate =
      host === "localhost" ||
      host.endsWith(".localhost") ||
      host === "::1" ||
      host.endsWith(".internal") ||
      !host.includes(".") ||
      /^(127|10|0)\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^169\.254\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host);
    if (isPrivate) {
      return { ok: false, error: "That address is not reachable from the app. Please use a public web page URL." };
    }

    try {
      const res = await fetch(parsed.toString(), {
        headers: {
          "user-agent": "Mozilla/5.0 (compatible; AIWorkplaceAssistant/1.0)",
          accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8",
        },
        redirect: "follow",
      });
      if (!res.ok) {
        return { ok: false, error: `The page could not be fetched (status ${res.status}). Check the URL and try again.` };
      }
      const ct = res.headers.get("content-type") ?? "";
      if (!/text\/html|application\/xhtml|text\/plain|text\/xml|application\/xml/i.test(ct)) {
        return { ok: false, error: "That URL is not a readable web page. PDFs and binary files are not supported." };
      }
      const html = await res.text();

      const titleMatch = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
      const title = titleMatch && titleMatch[1] ? decodeEntities(titleMatch[1]).replace(/\s+/g, " ").trim().slice(0, 200) : "";

      const bodyMatch = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(html);
      let text = (bodyMatch && bodyMatch[1]) || html;
      text = text
        .replace(/<(script|style|noscript|svg|iframe|nav|footer|header)[\s\S]*?<\/\1>/gi, " ")
        .replace(/<!--[\s\S]*?-->/g, " ")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/(p|div|h[1-6]|li|tr|section|article|blockquote)>/gi, "\n")
        .replace(/<[^>]+>/g, " ");
      const decoded = decodeEntities(text);
      const lines = decoded
        .split(/\r?\n/)
        .map((l) => l.replace(/[ \t]+/g, " ").trim())
        .filter(Boolean);
      const collapsed = lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
      if (!collapsed) {
        return { ok: false, error: "No readable text was found on that page." };
      }
      const truncated = collapsed.length > MAX_CHARS;
      const content = (title ? `Page title: ${title}\n\n` : "") + collapsed.slice(0, MAX_CHARS);
      return { ok: true, text: content, title, truncated };
    } catch (e) {
      console.error("fetchPageText failed:", e);
      return { ok: false, error: "The page could not be reached. Check the URL and try again." };
    }
  });
