import { useMemo, useRef, useState } from 'react';
import hljs from 'highlight.js/lib/core';
import jsonLang from 'highlight.js/lib/languages/json';
import typescript from 'highlight.js/lib/languages/typescript';
import javascript from 'highlight.js/lib/languages/javascript';
import bash from 'highlight.js/lib/languages/bash';
import xml from 'highlight.js/lib/languages/xml';
import plaintext from 'highlight.js/lib/languages/plaintext';
import 'highlight.js/styles/github-dark.css';
import ToolShell, { CopyButton } from './ToolShell';
import {
  parseLlmRequest,
  asDisplayValue,
  requestToPlainText,
  type NormalizedRequest,
  type NormMessage,
  type NormPart,
} from '../lib/llmRequest';

// 注册多语言，让 code fence 能按语言高亮（typescript/javascript 自带 ts/js 别名，bash 带 sh/shell，xml 带 html）
hljs.registerLanguage('json', jsonLang);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('plaintext', plaintext);

const LANG_ALIAS: Record<string, string> = {
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  console: 'bash',
  html: 'xml',
  xml: 'xml',
  json: 'json',
  typescript: 'typescript',
  javascript: 'javascript',
  bash: 'bash',
};

function highlightCode(value: string, lang: string): string {
  const normalized = LANG_ALIAS[lang.toLowerCase()] ?? 'plaintext';
  const language = hljs.getLanguage(normalized) ? normalized : 'plaintext';
  try {
    return hljs.highlight(value, { language }).value;
  } catch {
    return hljs.highlight(value, { language: 'plaintext' }).value;
  }
}

// 结构化会话视图的示例：一段 Anthropic Messages 请求日志（含 system / 多轮 / tool_use / tool_result / tools）
const REQUEST_SAMPLE = `{"ts":"2026-07-04T14:32:16.019+08:00","level":"debug","provider":"anthropic","event":"llm.request","request":{"method":"POST","url":"https://api.anthropic.com/v1/messages","body":{"model":"claude-sonnet-4-5","max_tokens":4096,"temperature":0.2,"stream":true,"system":[{"type":"text","text":"You are an engineering agent running inside a local repository. Complete the user's task end to end. Prefer existing patterns. Final answer must summarize changed files and verification."}],"messages":[{"role":"user","content":[{"type":"text","text":"The invoice export endpoint is timing out for large accounts. Find the cause and patch it without changing the public response shape."}]},{"role":"assistant","content":[{"type":"text","text":"I will inspect the export path, CSV writer, and tests before changing the smallest risky area."},{"type":"tool_use","id":"toolu_01B8xT4Qm3nS7d9","name":"shell_exec","input":{"cmd":"rg -n \\"invoice|csv|export\\" src tests","workdir":"/Users/demo/workspace/billing-service"}}]},{"role":"user","content":[{"type":"tool_result","tool_use_id":"toolu_01B8xT4Qm3nS7d9","content":"src/jobs/invoiceExport.ts:18:export async function runInvoiceExport(accountId)\\nsrc/lib/csvWriter.ts:7:export function writeCsv(rows)"}]},{"role":"user","content":[{"type":"text","text":"Also watch memory. The process sometimes reaches 2GB before it dies."}]}],"tools":[{"name":"shell_exec","description":"Run a shell command in the workspace and return stdout and stderr.","input_schema":{"type":"object","properties":{"cmd":{"type":"string"},"workdir":{"type":"string"}},"required":["cmd","workdir"]}},{"name":"apply_patch","description":"Apply a source patch to files in the workspace.","input_schema":{"type":"object","properties":{"patch":{"type":"string"}},"required":["patch"]}}],"metadata":{"branch":"fix/invoice-export-timeout","agent":"repo-engineer"}}}}`;

const ROLES = ['system', 'user', 'assistant', 'human', 'ai', 'tool', 'function', 'developer'];
const ROLE_RE = new RegExp(`(^|\\n)\\s*(${ROLES.join('|')})\\s*[:：]`, 'gi');

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

// 日志级别配色
const LEVEL_STYLE: Record<string, { tag: string; dot: string }> = {
  error: { tag: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  fatal: { tag: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  warn: { tag: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  warning: { tag: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  info: { tag: 'bg-sky-100 text-sky-700', dot: 'bg-sky-500' },
  notice: { tag: 'bg-sky-100 text-sky-700', dot: 'bg-sky-500' },
  debug: { tag: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
  trace: { tag: 'bg-violet-100 text-violet-700', dot: 'bg-violet-400' },
};
const DEFAULT_LEVEL = { tag: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' };

// 时间戳 + [LEVEL] + 正文（时间戳可选）
const LOG_RE =
  /^\s*(?:(\d{4}-\d{2}-\d{2}[ T][\d:.,]+)\s+)?\[(INFO|DEBUG|WARN|WARNING|ERROR|TRACE|FATAL|NOTICE)\]\s*(.*)$/i;
// 代码围栏 ```lang ... ```
const FENCE_RE = /```([a-zA-Z0-9_+-]*)\r?\n?([\s\S]*?)```/g;

interface Options {
  unescape: boolean;
  prettyJson: boolean;
  splitRoles: boolean;
}

type Block =
  | { type: 'text'; value: string }
  | { type: 'json'; value: string }
  | { type: 'code'; lang: string; value: string }
  | { type: 'log'; time: string | null; level: string; body: string; json?: string };
type Segment = { role: string | null; blocks: Block[] };

function tryPrettyJson(text: string): string | null {
  const trimmed = text.trim();
  if (!/^[[{]/.test(trimmed)) return null;
  try {
    return JSON.stringify(JSON.parse(trimmed), null, 2);
  } catch {
    return null;
  }
}

// 从一段文本里抽出一个能解析的 JSON 子串，返回 [前置文本, 美化JSON, 后置文本]
function extractJson(text: string): [string, string, string] | null {
  const m = text.match(/([[{][\s\S]*[\]}])/);
  if (!m || m.index === undefined) return null;
  const pretty = tryPrettyJson(m[1]);
  if (pretty === null) return null;
  return [
    text.slice(0, m.index).replace(/\s+$/, ''),
    pretty,
    text.slice(m.index + m[1].length).replace(/^\s+/, ''),
  ];
}

// 把「非代码围栏」的文本按行解析成 文本 / 日志 / JSON 块
function parseTextChunk(text: string, prettyJson: boolean): Block[] {
  const blocks: Block[] = [];
  let buffer: string[] = [];

  const flush = () => {
    const chunk = buffer.join('\n').replace(/^\n+|\n+$/g, '');
    buffer = [];
    if (!chunk.trim()) return;
    if (prettyJson) {
      const ex = extractJson(chunk);
      if (ex) {
        const [before, json, after] = ex;
        if (before.trim()) blocks.push({ type: 'text', value: before });
        blocks.push({ type: 'json', value: json });
        if (after.trim()) blocks.push({ type: 'text', value: after });
        return;
      }
    }
    blocks.push({ type: 'text', value: chunk });
  };

  for (const line of text.split('\n')) {
    const m = line.match(LOG_RE);
    if (m) {
      flush();
      let body = m[3];
      let json: string | undefined;
      if (prettyJson) {
        const ex = extractJson(body);
        if (ex) {
          const [before, pretty, after] = ex;
          json = pretty;
          body = [before, after].filter((s) => s.trim()).join(' ');
        }
      }
      blocks.push({ type: 'log', time: m[1] ?? null, level: m[2].toLowerCase(), body, json });
    } else {
      buffer.push(line);
    }
  }
  flush();
  return blocks;
}

// 一段文本 → 块数组：先切出代码围栏，围栏之间的文本再走行解析
function splitBlocks(text: string, prettyJson: boolean): Block[] {
  const blocks: Block[] = [];
  let last = 0;
  FENCE_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = FENCE_RE.exec(text))) {
    if (m.index > last) blocks.push(...parseTextChunk(text.slice(last, m.index), prettyJson));
    const code = m[2].replace(/\n+$/, '');
    if (code.trim()) blocks.push({ type: 'code', lang: m[1] || 'plaintext', value: code });
    last = m.index + m[0].length;
  }
  if (last < text.length) blocks.push(...parseTextChunk(text.slice(last), prettyJson));
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

  // 找出所有「行首」角色标记的位置，据此切分（避免命中日志正文里的 key=value）
  const markers: { index: number; len: number; role: string }[] = [];
  const re = new RegExp(ROLE_RE);
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const lead = m[1].length; // 前导的换行/空白
    markers.push({ index: m.index + lead, len: m[0].length - lead, role: m[2].toLowerCase() });
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
      const body = s.blocks
        .map((b) => {
          if (b.type === 'log') {
            const time = b.time ? `${b.time} ` : '';
            const json = b.json ? `\n${b.json}` : '';
            return `${time}[${b.level.toUpperCase()}] ${b.body}${json}`;
          }
          if (b.type === 'code') return '```' + b.lang + '\n' + b.value + '\n```';
          return b.value;
        })
        .join('\n');
      return head + body;
    })
    .join('\n\n')
    .trim();
}

function JsonPre({ value }: { value: string }) {
  return (
    <pre className="hljs overflow-x-auto rounded-md px-3 py-2 text-xs leading-relaxed">
      <code dangerouslySetInnerHTML={{ __html: highlightCode(value, 'json') }} />
    </pre>
  );
}

function BlockView({ block }: { block: Block }) {
  if (block.type === 'json') return <JsonPre value={block.value} />;

  if (block.type === 'code') {
    return (
      <div className="overflow-hidden rounded-md">
        <div className="flex items-center justify-between bg-slate-800 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          <span>{block.lang}</span>
        </div>
        <pre className="hljs overflow-x-auto rounded-none px-3 py-2 text-xs leading-relaxed">
          <code dangerouslySetInnerHTML={{ __html: highlightCode(block.value, block.lang) }} />
        </pre>
      </div>
    );
  }

  if (block.type === 'log') {
    const style = LEVEL_STYLE[block.level] ?? DEFAULT_LEVEL;
    return (
      <div className="space-y-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          {block.time && (
            <span className="shrink-0 font-mono text-[11px] tabular-nums text-slate-400">
              {block.time}
            </span>
          )}
          <span
            className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style.tag}`}
          >
            {block.level}
          </span>
          <span className="min-w-0 break-words font-mono text-xs leading-relaxed text-slate-700">
            {block.body}
          </span>
        </div>
        {block.json && <JsonPre value={block.json} />}
      </div>
    );
  }

  return (
    <p className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-slate-800">
      {block.value}
    </p>
  );
}

// ===== 结构化会话视图（LLM 请求日志） =====

// 把值渲染成高亮 JSON 或纯文本
function ValueView({ value }: { value: unknown }) {
  const { json, text } = asDisplayValue(value);
  if (json !== undefined) return <JsonPre value={json} />;
  return (
    <p className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-slate-700">
      {text}
    </p>
  );
}

function PartView({ part }: { part: NormPart }) {
  if (part.kind === 'text') {
    return (
      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-800">
        {part.text}
      </p>
    );
  }
  if (part.kind === 'tool_call') {
    return (
      <div className="overflow-hidden rounded-md border border-amber-200 bg-amber-50/50">
        <div className="flex flex-wrap items-center gap-2 border-b border-amber-200 px-3 py-1.5 text-[11px]">
          <span className="rounded bg-amber-100 px-1.5 py-0.5 font-bold uppercase tracking-wide text-amber-700">
            tool_call
          </span>
          <span className="font-mono font-semibold text-amber-800">{part.name}</span>
          {part.id && <span className="font-mono text-[10px] text-amber-500">{part.id}</span>}
        </div>
        <div className="px-2 py-1.5">
          <ValueView value={part.args} />
        </div>
      </div>
    );
  }
  if (part.kind === 'tool_result') {
    return (
      <div className="overflow-hidden rounded-md border border-teal-200 bg-teal-50/50">
        <div className="flex flex-wrap items-center gap-2 border-b border-teal-200 px-3 py-1.5 text-[11px]">
          <span className="rounded bg-teal-100 px-1.5 py-0.5 font-bold uppercase tracking-wide text-teal-700">
            tool_result
          </span>
          {part.isError && (
            <span className="rounded bg-red-100 px-1.5 py-0.5 font-bold uppercase text-red-700">
              error
            </span>
          )}
          {part.id && <span className="font-mono text-[10px] text-teal-500">{part.id}</span>}
        </div>
        <div className="px-2 py-1.5">
          <ValueView value={part.content} />
        </div>
      </div>
    );
  }
  // other
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5">
      <span className="mb-1 inline-block rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
        {part.label}
      </span>
      <ValueView value={part.value} />
    </div>
  );
}

function MessageView({ msg }: { msg: NormMessage }) {
  const style = ROLE_STYLE[msg.role] ?? DEFAULT_STYLE;
  return (
    <div className={`rounded-r-md border-l-4 bg-slate-50/60 py-2 pl-3 pr-2 ${style.border}`}>
      <span
        className={`mb-1.5 inline-block rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${style.badge}`}
      >
        {msg.role}
      </span>
      <div className="space-y-2">
        {msg.parts.map((p, j) => (
          <PartView key={j} part={p} />
        ))}
      </div>
    </div>
  );
}

// 可折叠区块（工具定义 / 元数据）
function Collapsible({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold text-slate-600 hover:bg-slate-50"
      >
        <span>{title}</span>
        <span className="text-slate-400">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="border-t border-slate-100 px-3 py-2">{children}</div>}
    </div>
  );
}

function RequestView({ req }: { req: NormalizedRequest }) {
  return (
    <div className="space-y-3 px-4 py-3">
      {/* 概览：provider / model / 参数 */}
      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700">
            {req.provider}
          </span>
          {req.model && (
            <span className="font-mono text-xs font-semibold text-slate-700">{req.model}</span>
          )}
        </div>
        {req.params.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {req.params.map((p) => (
              <span
                key={p.key}
                className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600"
              >
                {p.key}=<span className="font-semibold text-slate-800">{p.value}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* System */}
      {req.system.map((s, i) => (
        <div
          key={i}
          className="rounded-r-md border-l-4 border-purple-400 bg-purple-50/40 py-2 pl-3 pr-2"
        >
          <span className="mb-1.5 inline-block rounded bg-purple-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-purple-700">
            system
          </span>
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-800">
            {s}
          </p>
        </div>
      ))}

      {/* 会话 */}
      {req.messages.map((m, i) => (
        <MessageView key={i} msg={m} />
      ))}

      {/* 结构化输出 schema */}
      {req.responseFormat && (
        <Collapsible title={`Response format${req.responseFormat.name ? ` · ${req.responseFormat.name}` : ''}`}>
          <ValueView value={req.responseFormat.schema} />
        </Collapsible>
      )}

      {/* 工具定义 */}
      {req.tools.length > 0 && (
        <Collapsible title={`Tools · ${req.tools.length}`}>
          <div className="space-y-2">
            {req.tools.map((t, i) => (
              <div key={i} className="rounded-md border border-slate-200 bg-slate-50/60 px-2 py-1.5">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-800">{t.name}</span>
                  {t.description && (
                    <span className="text-[11px] text-slate-500">{t.description}</span>
                  )}
                </div>
                {t.schema !== undefined && (
                  <div className="mt-1.5">
                    <ValueView value={t.schema} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Collapsible>
      )}

      {/* 元数据 */}
      {req.metadata !== undefined && req.metadata !== null && (
        <Collapsible title="Metadata">
          <ValueView value={req.metadata} />
        </Collapsible>
      )}
    </div>
  );
}

export default function PromptTool() {
  const [input, setInput] = useState('');
  const [opts, setOpts] = useState<Options>({ unescape: true, prettyJson: true, splitRoles: true });
  const fileRef = useRef<HTMLInputElement>(null);

  // 先尝试当作 LLM 请求日志(JSON)解析；识别成功走会话视图，否则回落按行格式化
  const request = useMemo(() => parseLlmRequest(input), [input]);
  const segments = useMemo(() => (request ? [] : parsePrompt(input, opts)), [request, input, opts]);
  const plain = useMemo(
    () => (request ? requestToPlainText(request) : toPlainText(segments)),
    [request, segments],
  );

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setInput(typeof reader.result === 'string' ? reader.result : '');
    reader.readAsText(file);
    e.target.value = ''; // 允许重复上传同一文件
  };

  const toggle = (key: keyof Options, label: string) => (
    <label className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-slate-600">
      <input
        type="checkbox"
        checked={opts[key]}
        onChange={(e) => setOpts((o) => ({ ...o, [key]: e.target.checked }))}
        className="accent-brand-600"
      />
      {label}
    </label>
  );

  const uploadButton = (
    <>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="rounded-md px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50"
      >
        Upload file
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".txt,.json,.jsonl,.log,text/*,application/json"
        onChange={onUpload}
        className="hidden"
      />
    </>
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Options</span>
        {request ? (
          <span className="text-xs text-slate-500">
            Detected <span className="font-semibold text-brand-600">{request.provider}</span> request
            — rendering as a conversation.
          </span>
        ) : (
          <>
            {toggle('unescape', 'Unescape \\n')}
            {toggle('prettyJson', 'Pretty JSON')}
            {toggle('splitRoles', 'Split roles')}
          </>
        )}
      </div>
      <ToolShell
        input={input}
        onInput={setInput}
        inputPlaceholder="Paste an LLM request dump (OpenAI / Anthropic JSON), or a messy prompt / terminal log — or use Upload file…"
        leftLabel="Raw prompt / request log"
        rightLabel="Formatted"
        sample={REQUEST_SAMPLE}
        leftActions={uploadButton}
        toolbar={<CopyButton getText={() => plain} />}
      >
        {!input ? (
          <p className="px-4 py-3 text-sm text-slate-400">Your cleaned-up prompt appears here.</p>
        ) : request ? (
          <RequestView req={request} />
        ) : (
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
                    {seg.blocks.map((b, j) => (
                      <BlockView key={j} block={b} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ToolShell>
    </div>
  );
}
