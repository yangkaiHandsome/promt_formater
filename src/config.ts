// 全站共享常量。上线时把 adsenseClient 换成真实的 AdSense publisher id
// （形如 ca-pub-XXXXXXXXXXXXXXXX），并在 config 里开关 adsenseEnabled。
export const SITE = {
  name: 'FormatTools',
  tagline: 'Free online formatters — Markdown, HTML & AI Prompts',
  domain: 'https://promptformatter.top',
  // AdSense 审核通过、拿到 publisher id 后填这里并把 enabled 改成 true
  adsenseClient: 'ca-pub-0000000000000000',
  adsenseEnabled: false,
} as const;

export type ToolKey = 'prompt' | 'markdown' | 'html';

// 顺序即首页卡片与导航的展示顺序 —— Prompt 放第一位（核心差异化功能）
export const TOOLS: Record<
  ToolKey,
  { key: ToolKey; title: string; blurb: string; icon: ToolKey; href: string }
> = {
  prompt: {
    key: 'prompt',
    title: 'AI Prompt Formatter',
    blurb: 'Clean up messy debugging prompts — tidy roles, indentation and embedded JSON.',
    icon: 'prompt',
    href: '/prompt',
  },
  markdown: {
    key: 'markdown',
    title: 'Markdown Formatter',
    blurb: 'Paste Markdown and see a clean, live HTML preview. Copy the HTML or download the .md.',
    icon: 'markdown',
    href: '/markdown',
  },
  html: {
    key: 'html',
    title: 'HTML Viewer & Formatter',
    blurb: 'Paste HTML to render it safely in a sandbox, or beautify messy markup instantly.',
    icon: 'html',
    href: '/html',
  },
};
