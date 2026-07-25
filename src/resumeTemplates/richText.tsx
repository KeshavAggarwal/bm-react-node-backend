import React from "react";
import { Link, Text } from "@react-pdf/renderer";

// ── Inline rich-text parser ──────────────────────────────────────────────────
//
// Supported syntax (markers nest freely):

// **text** - bold
// *text* - italic
// __text__ - underline
// ***text*** - bold + italic
// **__text__** - bold + underline
// *__text__* - italic + underline
// ***__text__*** - bold + italic + underline
// [text](url) - hyperlink (display text can contain any of the above)
// example of above:
// [**__text__**](url) - bold + underlined link

export type Segment = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  href?: string;
};

type StyleCtx = Omit<Segment, "text">;

export function parseRich(str: string, ctx: StyleCtx = {}): Segment[] {
  const result: Segment[] = [];
  let i = 0;
  let textStart = 0;

  const flush = (end: number) => {
    if (end > textStart)
      result.push({ text: str.slice(textStart, end), ...ctx });
  };

  while (i < str.length) {
    // Bold + italic shorthand: ***
    if (str.startsWith("***", i)) {
      const close = str.indexOf("***", i + 3);
      if (close !== -1) {
        flush(i);
        result.push(
          ...parseRich(str.slice(i + 3, close), {
            ...ctx,
            bold: true,
            italic: true,
          }),
        );
        i = textStart = close + 3;
        continue;
      }
    }
    // Bold: **
    if (str.startsWith("**", i)) {
      const close = str.indexOf("**", i + 2);
      if (close !== -1) {
        flush(i);
        result.push(
          ...parseRich(str.slice(i + 2, close), { ...ctx, bold: true }),
        );
        i = textStart = close + 2;
        continue;
      }
    }
    // Underline: __
    if (str.startsWith("__", i)) {
      const close = str.indexOf("__", i + 2);
      if (close !== -1) {
        flush(i);
        result.push(
          ...parseRich(str.slice(i + 2, close), { ...ctx, underline: true }),
        );
        i = textStart = close + 2;
        continue;
      }
    }
    // Italic: single * (not part of **)
    if (str[i] === "*" && !str.startsWith("**", i)) {
      const close = str.indexOf("*", i + 1);
      if (close !== -1 && !str.startsWith("**", close)) {
        flush(i);
        result.push(
          ...parseRich(str.slice(i + 1, close), { ...ctx, italic: true }),
        );
        i = textStart = close + 1;
        continue;
      }
    }
    // Link: [display text](url)
    if (str[i] === "[") {
      const textEnd = str.indexOf("]", i + 1);
      if (textEnd !== -1 && str.startsWith("(", textEnd + 1)) {
        const urlEnd = str.indexOf(")", textEnd + 2);
        if (urlEnd !== -1) {
          flush(i);
          result.push(
            ...parseRich(str.slice(i + 1, textEnd), {
              ...ctx,
              href: str.slice(textEnd + 2, urlEnd),
            }),
          );
          i = textStart = urlEnd + 1;
          continue;
        }
      }
    }
    i++;
  }

  flush(i);
  return result;
}

export function RichText({
  children,
  style,
}: {
  children: string;
  style?: any;
}) {
  const segments = parseRich(children);
  return (
    <Text style={style}>
      {segments.map((seg, i) => {
        const s: Record<string, string> = {};
        if (seg.bold) s.fontWeight = "bold";
        if (seg.italic) s.fontStyle = "italic";
        if (seg.underline) s.textDecoration = "underline";
        if (seg.href) {
          return (
            <Link key={i} src={seg.href} style={s}>
              {seg.text}
            </Link>
          );
        }
        return (
          <Text key={i} style={s}>
            {seg.text}
          </Text>
        );
      })}
    </Text>
  );
}
