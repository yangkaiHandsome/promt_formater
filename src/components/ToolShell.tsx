import { type ReactNode, useState } from 'react';

interface ToolShellProps {
  input: string;
  onInput: (value: string) => void;
  inputPlaceholder?: string;
  leftLabel?: string;
  rightLabel?: string;
  /** 右栏工具栏按钮（复制/下载/格式化等，各工具自定义） */
  toolbar?: ReactNode;
  /** 右栏输出内容 */
  children: ReactNode;
  /** 点击「Load sample」填入的示例文本 */
  sample?: string;
  /** 左栏头部额外操作（如上传文件），排在 Load sample 之前 */
  leftActions?: ReactNode;
}

/** 复用的双栏骨架：左输入 / 右输出，含清空、字数统计、示例加载 */
export default function ToolShell({
  input,
  onInput,
  inputPlaceholder = 'Paste your text here…',
  leftLabel = 'Input',
  rightLabel = 'Output',
  toolbar,
  children,
  sample,
  leftActions,
}: ToolShellProps) {
  const chars = input.length;
  const words = input.trim() ? input.trim().split(/\s+/).length : 0;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* 左：输入 */}
      <section className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/[0.02] transition-shadow focus-within:shadow-md">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-2.5">
          <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <span className="h-2 w-2 rounded-full bg-brand-500" />
            {leftLabel}
          </span>
          <div className="flex items-center gap-2">
            {leftActions}
            {sample && (
              <button
                type="button"
                onClick={() => onInput(sample)}
                className="rounded-md px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50"
              >
                Load sample
              </button>
            )}
            <button
              type="button"
              onClick={() => onInput('')}
              className="rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
            >
              Clear
            </button>
          </div>
        </div>
        <textarea
          value={input}
          onChange={(e) => onInput(e.target.value)}
          placeholder={inputPlaceholder}
          spellCheck={false}
          className="min-h-[32rem] flex-1 resize-y bg-transparent px-4 py-3 font-mono text-sm leading-relaxed text-slate-800 outline-none lg:min-h-[40rem]"
        />
        <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-1.5 text-right text-xs text-slate-400">
          {words} words · {chars} chars
        </div>
      </section>

      {/* 右：输出 */}
      <section className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/[0.02]">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-2.5">
          <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {rightLabel}
          </span>
          <div className="flex items-center gap-2">{toolbar}</div>
        </div>
        <div className="min-h-[32rem] flex-1 overflow-auto lg:min-h-[40rem]">
          {!input && sample ? (
            <div className="flex h-full min-h-[32rem] flex-col items-center justify-center px-6 text-center lg:min-h-[40rem]">
              <p className="text-sm font-medium text-slate-500">Nothing to show yet</p>
              <p className="mt-1 max-w-xs text-sm text-slate-400">
                Paste your text on the left, or load an example to see how it works.
              </p>
              <button
                type="button"
                onClick={() => onInput(sample)}
                className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
              >
                Load a sample
              </button>
            </div>
          ) : (
            children
          )}
        </div>
      </section>
    </div>
  );
}

/** 通用「复制」按钮，2 秒内反馈已复制 */
export function CopyButton({ getText }: { getText: () => string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(getText());
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          /* clipboard 不可用时静默失败 */
        }
      }}
      className="rounded-md px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}
