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
}: ToolShellProps) {
  const chars = input.length;
  const words = input.trim() ? input.trim().split(/\s+/).length : 0;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* 左：输入 */}
      <section className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2">
          <span className="text-sm font-semibold text-slate-700">{leftLabel}</span>
          <div className="flex items-center gap-2">
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
          className="min-h-[24rem] flex-1 resize-y bg-transparent px-4 py-3 font-mono text-sm text-slate-800 outline-none"
        />
        <div className="border-t border-slate-100 px-4 py-1.5 text-right text-xs text-slate-400">
          {words} words · {chars} chars
        </div>
      </section>

      {/* 右：输出 */}
      <section className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2">
          <span className="text-sm font-semibold text-slate-700">{rightLabel}</span>
          <div className="flex items-center gap-2">{toolbar}</div>
        </div>
        <div className="min-h-[24rem] flex-1 overflow-auto">{children}</div>
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
