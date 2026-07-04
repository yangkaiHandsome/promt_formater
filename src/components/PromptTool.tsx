import { useMemo, useState } from 'react';
import hljs from 'highlight.js/lib/core';
import jsonLang from 'highlight.js/lib/languages/json';
import 'highlight.js/styles/github-dark.css';
import ToolShell, { CopyButton } from './ToolShell';

hljs.registerLanguage('json', jsonLang);

const SAMPLE =
  'system: You are a helpful assistant.\\nAlways answer concisely. user: {"question":"What is 2+2?","lang":"en"} assistant: The answer is 4.';

const ROLES = ['system', 'user', 'assistant', 'human', 'ai', 'tool', 'function', 'developer'];
const ROLE_RE = new RegExp(`\\b(${ROLES.join('|')})\\s*[:：]`, 'gi');

// 每个角色一套配色（左边框 + 徽章）。写成完整字面量，Tailwind 才能扫描到类名。
const ROLE_STYLE: Record<string, { badge: string; border: string }> = {
  system: { badge: 'bg-purple-100 text-purple-700', border: 'border-purple-400' },
  developer: { badge: 'bg-purple-100 text-purple-700', border: 'border-purple-400' },
  user: { badge: 'bg-blue-100 text-blue-700', border: 'border-blue-400' },
  human: { badge: 'bg-blue-100 text-blue-700', border: 'border-blue-400' },
  assistant: { badge: 'bg-green-100 text-green-700', border: 'border-green-500' },
  ai: { badge: 'bg-green-100 text-green-700', border: 'border-green-500' },
  tool: { badge: 'bg-amber-100 text-amber-700', border: 'border-amber-400' },
  function: { badge: 'bg-amber-100 text-amber-700', border: 'border-amber-400' },
};
const DEFAULT_STYLE = { badge: 'bg-slate-100 text-slate-600', border: 'border-slate-300' };

interface Options {
  unescape: boolean;
  prettyJson: boolean;
  splitRoles: boolean;
}

type Block = { type: 'text' | 'json'; value: string };
type Segment = { role: string | null; blocks: Block[] };

function tryPrettyJson(text: string): string {
  const trimmed = text.trim();
  if (!/^[[{]/.test(trimmed)) return text;
  try {
    return JSON.stringify(JSON.parse(trimmed), null, 2);
  } catch {
    return text;
  }
}

// 把一段文本拆成文本块与（美化后的）JSON 块
function splitBlocks(text: string, prettyJson: boolean): Block[] {
  const trimmed = text.trim();
  if (!prettyJson) return trimmed ? [{ type: 'text', value: trimmed }] : [];
  const m = trimmed.match(/([[{][\s\S]*[\]}])/);
  if (!m || m.index === undefined) return trimmed ? [{ type: 'text', value: trimmed }] : [];
  const pretty = tryPrettyJson(m[1]);
  if (pretty === m[1]) return [{ type: 'text', value: trimmed }];
  const before = trimmed.slice(0, m.index).replace(/\s+$/, '');
  const after = trimmed.slice(m.index + m[1].length).replace(/^\s+/, '');
  const blocks: Block[] = [];
  if (before) blocks.push({ type: 'text', value: before });
  blocks.push({ type: 'json', value: pretty });
  if (after) blocks.push({ type: 'text', value: after });
  return blocks;
}

function parsePrompt(raw: string, opts: Options): Segment[] {
  let text = raw;
  if (opts.unescape) {
    text = text
      .replace(/\\r\\n|\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'");
  }

  if (!opts.splitRoles) {
    return [{ role: null, blocks: splitBlocks(text, opts.prettyJson) }];
  }

  // 找出所有角色标记的位置，据此切分
  const markers: { index: number; len: number; role: string }[] = [];
  const re = new RegExp(ROLE_RE);
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    markers.push({ index: m.index, len: m[0].length, role: m[1].toLowerCase() });
  }
  if (markers.length === 0) {
    return [{ role: null, blocks: splitBlocks(text, opts.prettyJson) }];
  }

  const segments: Segment[] = [];
  const preamble = text.slice(0, markers[0].index).trim();
  if (preamble) segments.push({ role: null, blocks: splitBlocks(preamble, opts.prettyJson) });
  for (let i = 0; i < markers.length; i++) {
    const start = markers[i].index + markers[i].len;
    const end = i + 1 < markers.length ? markers[i + 1].index : text.length;
    segments.push({ role: markers[i].role, blocks: splitBlocks(text.slice(start, end), opts.prettyJson) });
  }
  return segments;
}

// 复制用的纯文本版本
function toPlainText(segments: Segment[]): string {
  return segments
    .map((s) => {
      const head = s.role ? `${s.role.toUpperCase()}:\n` : '';
      return head + s.blocks.map((b) => b.value).join('\n');
    })
    .join('\n\n')
    .trim();
}

export default function PromptTool() {
  const [input, setInput] = useState('');
  const [opts, setOpts] = useState<Options>({ unescape: true, prettyJson: true, splitRoles: true });

  const segments = useMemo(() => parsePrompt(input, opts), [input, opts]);
  const plain = useMemo(() => toPlainText(segments), [segments]);

  const toggle = (key: keyof Options, label: string) => (
    <label className="flex items-center gap-1 text-xs font-medium text-slate-600">
      <input
        type="checkbox"
        checked={opts[key]}
        onChange={(e) => setOpts((o) => ({ ...o, [key]: e.target.checked }))}
        className="accent-brand-600"
      />
      {label}
    </label>
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-4 rounded-lg border border-slate-200 bg-white px-4 py-2 shadow-sm">
        {toggle('unescape', 'Unescape \\n')}
        {toggle('prettyJson', 'Pretty JSON')}
        {toggle('splitRoles', 'Split roles')}
      </div>
      <ToolShell
        input={input}
        onInput={setInput}
        inputPlaceholder="Paste a messy prompt (escaped \n, inline JSON, role labels)…"
        leftLabel="Raw prompt"
        rightLabel="Formatted"
        sample={SAMPLE}
        toolbar={<CopyButton getText={() => plain} />}
      >
        {input ? (
          <div className="space-y-3 px-4 py-3">
            {segments.map((seg, i) => {
              const style = seg.role ? ROLE_STYLE[seg.role] ?? DEFAULT_STYLE : DEFAULT_STYLE;
              return (
                <div
                  key={i}
                  className={`rounded-r-md border-l-4 bg-slate-50/60 py-2 pl-3 pr-2 ${style.border}`}
                >
                  {seg.role && (
                    <span
                      className={`mb-1.5 inline-block rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${style.badge}`}
                    >
                      {seg.role}
                    </span>
                  )}
                  <div className="space-y-2">
                    {seg.blocks.map((b, j) =>
                      b.type === 'json' ? (
                        <pre
                          key={j}
                          className="hljs overflow-x-auto rounded-md px-3 py-2 text-xs leading-relaxed"
                        >
                          <code
                            dangerouslySetInnerHTML={{
                              __html: hljs.highlight(b.value, { language: 'json' }).value,
                            }}
                          />
                        </pre>
                      ) : (
                        <p
                          key={j}
                          className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-800"
                        >
                          {b.value}
                        </p>
                      ),
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="px-4 py-3 text-sm text-slate-400">Your cleaned-up prompt appears here.</p>
        )}
      </ToolShell>
    </div>
  );
}
