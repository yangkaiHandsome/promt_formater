import { useMemo, useState } from 'react';
import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';
import ToolShell, { CopyButton } from './ToolShell';

const md = new MarkdownIt({
  html: false, // 不信任原始 HTML，交给 DOMPurify 兜底
  linkify: true,
  typographer: true,
  breaks: true,
});

const SAMPLE = `# Hello Markdown

A **formatter** that renders your notes in real time.

- Live HTML preview
- Copy the generated HTML
- Download the raw .md

> Paste anything and watch it render.

\`\`\`js
console.log("code blocks work too");
\`\`\`

| Feature | Status |
| ------- | ------ |
| Tables  | ✅     |
`;

export default function MarkdownTool() {
  const [input, setInput] = useState('');

  // 渲染后再用 DOMPurify 净化，防止 linkify 之类注入
  const html = useMemo(() => DOMPurify.sanitize(md.render(input)), [input]);

  const download = () => {
    const blob = new Blob([input], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolShell
      input={input}
      onInput={setInput}
      inputPlaceholder="# Paste your Markdown here…"
      leftLabel="Markdown"
      rightLabel="Preview"
      sample={SAMPLE}
      toolbar={
        <>
          <CopyButton getText={() => html} />
          <button
            type="button"
            onClick={download}
            disabled={!input}
            className="rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-40"
          >
            Download .md
          </button>
        </>
      }
    >
      {input ? (
        <div className="md-preview px-4 py-3" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <p className="px-4 py-3 text-sm text-slate-400">Your rendered Markdown appears here.</p>
      )}
    </ToolShell>
  );
}
