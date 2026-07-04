import { useMemo, useState } from 'react';
import ToolShell, { CopyButton } from './ToolShell';

const SAMPLE =
  'system: You are a helpful assistant.\\nAlways answer concisely. user: {"question":"What is 2+2?","lang":"en"} assistant: 4';

const ROLES = ['system', 'user', 'assistant', 'human', 'ai', 'tool', 'function', 'developer'];
const ROLE_RE = new RegExp(`\\b(${ROLES.join('|')})\\s*[:：]`, 'gi');

/** 尝试把一段疑似 JSON 的文本美化，失败则原样返回 */
function tryPrettyJson(text: string): string {
  const trimmed = text.trim();
  if (!/^[[{]/.test(trimmed)) return text;
  try {
    return JSON.stringify(JSON.parse(trimmed), null, 2);
  } catch {
    return text;
  }
}

interface Options {
  unescape: boolean;
  prettyJson: boolean;
  splitRoles: boolean;
}

function formatPrompt(raw: string, opts: Options): string {
  let text = raw;

  // 1. 还原转义字符：把字面量 \n \t \" 变成真实字符
  if (opts.unescape) {
    text = text
      .replace(/\\r\\n|\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'");
  }

  // 2. 按角色标记换行分段：在 "role:" 前插入空行
  if (opts.splitRoles) {
    text = text.replace(ROLE_RE, (m) => `\n\n${m.trim().toUpperCase()}`);
  }

  // 3. 逐行处理，统一空白 + 美化内嵌 JSON
  const lines = text.split('\n').map((line) => {
    const t = line.replace(/[ \t]+$/g, ''); // 去行尾空白
    if (opts.prettyJson) {
      const jsonMatch = t.match(/([[{][\s\S]*[\]}])/);
      if (jsonMatch) {
        const pretty = tryPrettyJson(jsonMatch[1]);
        if (pretty !== jsonMatch[1]) {
          return t.replace(jsonMatch[1], '\n' + pretty);
        }
      }
    }
    return t;
  });

  // 4. 折叠 3 个以上连续空行为最多 2 行
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

export default function PromptTool() {
  const [input, setInput] = useState('');
  const [opts, setOpts] = useState<Options>({
    unescape: true,
    prettyJson: true,
    splitRoles: true,
  });

  const output = useMemo(() => formatPrompt(input, opts), [input, opts]);

  const toggle = (key: keyof Options) => (
    <label className="flex items-center gap-1 text-xs font-medium text-slate-600">
      <input
        type="checkbox"
        checked={opts[key]}
        onChange={(e) => setOpts((o) => ({ ...o, [key]: e.target.checked }))}
        className="accent-brand-600"
      />
      {key === 'unescape' ? 'Unescape \\n' : key === 'prettyJson' ? 'Pretty JSON' : 'Split roles'}
    </label>
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-4 rounded-lg border border-slate-200 bg-white px-4 py-2 shadow-sm">
        {toggle('unescape')}
        {toggle('prettyJson')}
        {toggle('splitRoles')}
      </div>
      <ToolShell
        input={input}
        onInput={setInput}
        inputPlaceholder="Paste a messy prompt (escaped \n, inline JSON, role labels)…"
        leftLabel="Raw prompt"
        rightLabel="Formatted"
        sample={SAMPLE}
        toolbar={<CopyButton getText={() => output} />}
      >
        {input ? (
          <pre className="h-full overflow-auto whitespace-pre-wrap px-4 py-3 font-mono text-sm text-slate-800">
            {output}
          </pre>
        ) : (
          <p className="px-4 py-3 text-sm text-slate-400">Your cleaned-up prompt appears here.</p>
        )}
      </ToolShell>
    </div>
  );
}
