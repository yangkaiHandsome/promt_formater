import { useMemo, useRef, useState } from 'react';
import hljs from 'highlight.js/lib/core';
import jsonLang from 'highlight.js/lib/languages/json';
import 'highlight.js/styles/github-dark.css';
import ToolShell, { CopyButton } from './ToolShell';

hljs.registerLanguage('json', jsonLang);

const SAMPLE = `{"name":"PromptFormatter Tools","version":2,"free":true,"tools":["prompt","markdown","html","json","diff"],"meta":{"private":true,"nested":{"note":"everything runs in your browser"}},"tags":["seo","utility"]}`;

type Indent = 2 | 4 | 'tab';
type Mode = 'beautify' | 'minify';

interface Result {
  ok: boolean;
  output: string;
  /** 校验通过时的简要统计，用于状态条 */
  info?: string;
  /** 出错时的可读信息 + 定位 */
  error?: { message: string; line?: number; column?: number };
}

// 把 JSON.parse 抛出的 SyntaxError 转成带行列的可读错误。
// V8 的报错形如 "... in JSON at position 42 (line 3 column 5)"，
// 老引擎只有 "at position 42"，此时用 position 反推行列。
function describeError(err: unknown, source: string): Result['error'] {
  const message = err instanceof Error ? err.message : String(err);

  const lineCol = message.match(/line (\d+) column (\d+)/i);
  if (lineCol) {
    return { message, line: Number(lineCol[1]), column: Number(lineCol[2]) };
  }

  const posMatch = message.match(/position (\d+)/i);
  if (posMatch) {
    const pos = Number(posMatch[1]);
    const before = source.slice(0, pos);
    const line = before.split('\n').length;
    const column = pos - before.lastIndexOf('\n');
    return { message, line, column };
  }

  return { message };
}

function highlightJson(value: string): string {
  try {
    return hljs.highlight(value, { language: 'json' }).value;
  } catch {
    return value;
  }
}

export default function JsonTool() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('beautify');
  const [indent, setIndent] = useState<Indent>(2);
  const fileRef = useRef<HTMLInputElement>(null);

  const result = useMemo<Result | null>(() => {
    if (!input.trim()) return null;
    try {
      const value = JSON.parse(input);
      const space = mode === 'minify' ? undefined : indent === 'tab' ? '\t' : indent;
      const output = JSON.stringify(value, null, space);
      const size = new Blob([output]).size;
      const keys = Array.isArray(value)
        ? `${value.length} items`
        : value && typeof value === 'object'
          ? `${Object.keys(value).length} keys`
          : typeof value;
      return {
        ok: true,
        output,
        info: `Valid JSON · ${keys} · ${size.toLocaleString()} bytes`,
      };
    } catch (err) {
      return { ok: false, output: '', error: describeError(err, input) };
    }
  }, [input, mode, indent]);

  const download = () => {
    if (!result?.ok) return;
    const blob = new Blob([result.output], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = mode === 'minify' ? 'data.min.json' : 'data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setInput(typeof reader.result === 'string' ? reader.result : '');
    reader.readAsText(file);
    e.target.value = '';
  };

  const modeBtn = (m: Mode, label: string) => (
    <button
      type="button"
      onClick={() => setMode(m)}
      className={`rounded-md px-2 py-1 text-xs font-medium ${
        mode === m ? 'bg-brand-50 text-brand-600' : 'text-slate-500 hover:bg-slate-100'
      }`}
    >
      {label}
    </button>
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
        accept=".json,.txt,application/json,text/*"
        onChange={onUpload}
        className="hidden"
      />
    </>
  );

  return (
    <div className="space-y-3">
      {/* 选项条：格式化/压缩 + 缩进；再加实时校验状态 */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Mode</span>
        <div className="flex items-center gap-1">
          {modeBtn('beautify', 'Beautify')}
          {modeBtn('minify', 'Minify')}
        </div>
        {mode === 'beautify' && (
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            Indent
            <select
              value={String(indent)}
              onChange={(e) =>
                setIndent(e.target.value === 'tab' ? 'tab' : (Number(e.target.value) as Indent))
              }
              className="rounded-md border border-slate-200 bg-white px-1.5 py-1 text-xs text-slate-700 outline-none focus:border-brand-400"
            >
              <option value="2">2 spaces</option>
              <option value="4">4 spaces</option>
              <option value="tab">Tab</option>
            </select>
          </label>
        )}
        {result && (
          <span
            className={`ml-auto flex items-center gap-1.5 text-xs font-medium ${
              result.ok ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${result.ok ? 'bg-emerald-500' : 'bg-red-500'}`} />
            {result.ok
              ? result.info
              : result.error?.line
                ? `Invalid JSON · line ${result.error.line}, column ${result.error.column}`
                : 'Invalid JSON'}
          </span>
        )}
      </div>

      <ToolShell
        input={input}
        onInput={setInput}
        inputPlaceholder='{ "paste": "your JSON here" }'
        leftLabel="JSON"
        rightLabel={mode === 'minify' ? 'Minified' : 'Formatted'}
        sample={SAMPLE}
        leftActions={uploadButton}
        toolbar={
          <>
            {result?.ok && <CopyButton getText={() => result.output} />}
            <button
              type="button"
              onClick={download}
              disabled={!result?.ok}
              className="rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-40"
            >
              Download
            </button>
          </>
        }
      >
        {!input ? (
          <p className="px-4 py-3 text-sm text-slate-400">Your formatted JSON appears here.</p>
        ) : result?.ok ? (
          <pre className="hljs h-full overflow-auto px-4 py-3 text-xs leading-relaxed">
            <code dangerouslySetInnerHTML={{ __html: highlightJson(result.output) }} />
          </pre>
        ) : (
          <div className="px-4 py-3">
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
              <p className="text-sm font-semibold text-red-700">Invalid JSON</p>
              {result?.error?.line && (
                <p className="mt-0.5 text-xs text-red-600">
                  Error near line {result.error.line}, column {result.error.column}.
                </p>
              )}
              <p className="mt-1.5 break-words font-mono text-xs text-red-500">
                {result?.error?.message}
              </p>
            </div>
          </div>
        )}
      </ToolShell>
    </div>
  );
}
