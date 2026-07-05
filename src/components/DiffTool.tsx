import { useEffect, useMemo, useState } from 'react';
import { diffLines, type DiffRow, type DiffOptions } from '../lib/diff';

const SAMPLE_A = `The quick brown fox
jumps over the lazy dog.
Line three stays the same.
This line will be removed.
Shared closing line.`;

const SAMPLE_B = `The quick red fox
jumps over the lazy dog.
Line three stays the same.
A brand new line appears here.
Shared closing line.`;

type ViewMode = 'split' | 'unified';

// 把两侧文本编码进 URL hash，做「可分享链接」——内容仍留在浏览器，只有用户主动分享时才发出。
function encodeState(a: string, b: string): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify([a, b]))));
}
function decodeState(hash: string): [string, string] | null {
  try {
    const [a, b] = JSON.parse(decodeURIComponent(escape(atob(hash))));
    if (typeof a === 'string' && typeof b === 'string') return [a, b];
  } catch {
    /* 无效 hash 忽略 */
  }
  return null;
}

export default function DiffTool() {
  const [original, setOriginal] = useState('');
  const [changed, setChanged] = useState('');
  const [view, setView] = useState<ViewMode>('split');
  const [opts, setOpts] = useState<DiffOptions>({ ignoreCase: false, ignoreWhitespace: false });
  const [copied, setCopied] = useState(false);

  // 首次加载：若 URL hash 带有分享内容则回填
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.location.hash.replace(/^#d=/, '');
    if (raw && window.location.hash.startsWith('#d=')) {
      const decoded = decodeState(raw);
      if (decoded) {
        setOriginal(decoded[0]);
        setChanged(decoded[1]);
      }
    }
  }, []);

  const { rows, stats } = useMemo(
    () => diffLines(original, changed, opts),
    [original, changed, opts],
  );

  const hasInput = original.length > 0 || changed.length > 0;
  const identical = hasInput && stats.additions === 0 && stats.deletions === 0;

  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}#d=${encodeState(original, changed)}`;
    try {
      await navigator.clipboard.writeText(url);
      window.history.replaceState(null, '', url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard 不可用时静默失败 */
    }
  };

  const loadSample = () => {
    setOriginal(SAMPLE_A);
    setChanged(SAMPLE_B);
  };

  const clearAll = () => {
    setOriginal('');
    setChanged('');
  };

  const viewBtn = (v: ViewMode, label: string) => (
    <button
      type="button"
      onClick={() => setView(v)}
      className={`rounded-md px-2 py-1 text-xs font-medium ${
        view === v ? 'bg-brand-50 text-brand-600' : 'text-slate-500 hover:bg-slate-100'
      }`}
    >
      {label}
    </button>
  );

  const toggle = (key: keyof DiffOptions, label: string) => (
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

  return (
    <div className="space-y-3">
      {/* 选项条 */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">View</span>
        <div className="flex items-center gap-1">
          {viewBtn('split', 'Split')}
          {viewBtn('unified', 'Unified')}
        </div>
        {toggle('ignoreCase', 'Ignore case')}
        {toggle('ignoreWhitespace', 'Ignore whitespace')}
        <div className="ml-auto flex items-center gap-3">
          {hasInput && (
            <span className="flex items-center gap-2 text-xs font-medium">
              <span className="text-emerald-600">+{stats.additions}</span>
              <span className="text-red-600">−{stats.deletions}</span>
            </span>
          )}
          <button
            type="button"
            onClick={share}
            disabled={!hasInput}
            className="rounded-md px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50 disabled:opacity-40"
          >
            {copied ? 'Link copied!' : 'Copy shareable link'}
          </button>
        </div>
      </div>

      {/* 两个输入框 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <InputPane label="Original" value={original} onChange={setOriginal} dot="bg-red-400" />
        <div className="relative">
          <InputPane label="Changed" value={changed} onChange={setChanged} dot="bg-emerald-400" />
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={loadSample}
              className="rounded-md px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50"
            >
              Load sample
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
            >
              Clear both
            </button>
          </div>
        </div>
      </div>

      {/* 对比结果 */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-2.5">
          <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <span className="h-2 w-2 rounded-full bg-brand-500" />
            Differences
          </span>
        </div>
        {!hasInput ? (
          <p className="px-4 py-6 text-sm text-slate-400">
            Paste text into both panels above — or load the sample — to see the differences.
          </p>
        ) : identical ? (
          <p className="px-4 py-6 text-sm font-medium text-emerald-600">
            The two texts are identical{opts.ignoreCase || opts.ignoreWhitespace ? ' (with the selected options applied)' : ''}.
          </p>
        ) : view === 'split' ? (
          <SplitView rows={rows} />
        ) : (
          <UnifiedView rows={rows} />
        )}
      </section>
    </div>
  );
}

function InputPane({
  label,
  value,
  onChange,
  dot,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  dot: string;
}) {
  return (
    <section className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/[0.02] transition-shadow focus-within:shadow-md">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-4 py-2.5 text-sm font-semibold text-slate-700">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        {label}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Paste the ${label.toLowerCase()} text here…`}
        spellCheck={false}
        className="min-h-[16rem] flex-1 resize-y bg-transparent px-4 py-3 font-mono text-sm leading-relaxed text-slate-800 outline-none"
      />
    </section>
  );
}

const ROW_BG: Record<DiffRow['type'], string> = {
  equal: '',
  insert: 'bg-emerald-50',
  delete: 'bg-red-50',
  replace: '',
};

function LineNo({ n }: { n: number | null }) {
  return (
    <td className="select-none border-r border-slate-100 px-2 text-right align-top text-[11px] tabular-nums text-slate-400">
      {n ?? ''}
    </td>
  );
}

function Cell({
  content,
  html,
  tint,
}: {
  content: string | null;
  html: string | null;
  tint: string;
}) {
  return (
    <td className={`whitespace-pre-wrap break-words px-3 align-top font-mono text-xs leading-relaxed ${tint}`}>
      {content === null ? (
        ''
      ) : html ? (
        <span dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        content
      )}
    </td>
  );
}

function SplitView({ rows }: { rows: DiffRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed border-collapse">
        <colgroup>
          <col style={{ width: '3rem' }} />
          <col style={{ width: 'calc(50% - 3rem)' }} />
          <col style={{ width: '3rem' }} />
          <col style={{ width: 'calc(50% - 3rem)' }} />
        </colgroup>
        <tbody>
          {rows.map((r, i) => {
            const leftTint = r.type === 'delete' || r.type === 'replace' ? 'bg-red-50' : '';
            const rightTint = r.type === 'insert' || r.type === 'replace' ? 'bg-emerald-50' : '';
            return (
              <tr key={i}>
                <LineNo n={r.leftNo} />
                <Cell content={r.left} html={r.leftHtml} tint={leftTint} />
                <LineNo n={r.rightNo} />
                <Cell content={r.right} html={r.rightHtml} tint={rightTint} />
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function UnifiedView({ rows }: { rows: DiffRow[] }) {
  // 把行序列展开成统一视图：replace → 一行删 + 一行增。
  const lines: { sign: '+' | '-' | ' '; text: string; html: string | null }[] = [];
  for (const r of rows) {
    if (r.type === 'equal') {
      lines.push({ sign: ' ', text: r.left ?? '', html: null });
    } else if (r.type === 'delete') {
      lines.push({ sign: '-', text: r.left ?? '', html: null });
    } else if (r.type === 'insert') {
      lines.push({ sign: '+', text: r.right ?? '', html: null });
    } else {
      lines.push({ sign: '-', text: r.left ?? '', html: r.leftHtml });
      lines.push({ sign: '+', text: r.right ?? '', html: r.rightHtml });
    }
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <tbody>
          {lines.map((l, i) => (
            <tr key={i} className={l.sign === '+' ? 'bg-emerald-50' : l.sign === '-' ? 'bg-red-50' : ''}>
              <td className="select-none border-r border-slate-100 px-2 text-center align-top font-mono text-xs text-slate-400">
                {l.sign === ' ' ? '' : l.sign}
              </td>
              <td className="whitespace-pre-wrap break-words px-3 align-top font-mono text-xs leading-relaxed text-slate-800">
                {l.html ? <span dangerouslySetInnerHTML={{ __html: l.html }} /> : l.text}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
