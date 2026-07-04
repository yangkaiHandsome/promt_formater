import { useEffect, useMemo, useState } from 'react';
import DOMPurify from 'dompurify';
import ToolShell, { CopyButton } from './ToolShell';

const SAMPLE = `<div class="card">
<h1>Hello HTML</h1>
<p>Rendered safely in a <strong>sandboxed</strong> iframe.</p>
<a href="https://example.com">A link</a>
</div>`;

type View = 'preview' | 'formatted';

export default function HtmlTool() {
  const [input, setInput] = useState('');
  const [view, setView] = useState<View>('preview');
  const [formatted, setFormatted] = useState('');
  const [formatting, setFormatting] = useState(false);

  // 安全关键：先用 DOMPurify 剥离脚本/事件属性，再放进 sandbox iframe（无 allow-scripts）双保险
  const safeHtml = useMemo(
    () =>
      DOMPurify.sanitize(input, {
        USE_PROFILES: { html: true, svg: true },
        FORBID_TAGS: ['script', 'style'],
      }),
    [input],
  );

  // 切到 Formatted 视图时按需动态加载 prettier（体积大，不进首屏）
  useEffect(() => {
    if (view !== 'formatted' || !input) return;
    let cancelled = false;
    setFormatting(true);
    (async () => {
      try {
        const prettier = await import('prettier/standalone');
        const htmlPlugin = await import('prettier/plugins/html');
        const out = await prettier.format(input, {
          parser: 'html',
          plugins: [htmlPlugin.default],
          printWidth: 100,
        });
        if (!cancelled) setFormatted(out);
      } catch {
        if (!cancelled) setFormatted(input);
      } finally {
        if (!cancelled) setFormatting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [view, input]);

  const tabBtn = (v: View, label: string) => (
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

  return (
    <ToolShell
      input={input}
      onInput={setInput}
      inputPlaceholder="<p>Paste your HTML here…</p>"
      leftLabel="HTML"
      rightLabel={view === 'preview' ? 'Rendered' : 'Formatted'}
      sample={SAMPLE}
      toolbar={
        <>
          {tabBtn('preview', 'Preview')}
          {tabBtn('formatted', 'Format')}
          {view === 'formatted' && <CopyButton getText={() => formatted} />}
        </>
      }
    >
      {!input ? (
        <p className="px-4 py-3 text-sm text-slate-400">Your rendered HTML appears here.</p>
      ) : view === 'preview' ? (
        <iframe
          title="HTML preview"
          sandbox=""
          className="h-full min-h-[24rem] w-full"
          srcDoc={safeHtml}
        />
      ) : (
        <pre className="h-full overflow-auto bg-slate-900 px-4 py-3 font-mono text-xs text-slate-100">
          {formatting ? 'Formatting…' : formatted}
        </pre>
      )}
    </ToolShell>
  );
}
