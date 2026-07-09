// 全站共享常量。上线时把 adsenseClient 换成真实的 AdSense publisher id
// （形如 ca-pub-XXXXXXXXXXXXXXXX），并在 config 里开关 adsenseEnabled。
export const SITE = {
  name: 'PromptFormatter Tools',
  tagline: 'Free online formatters for prompts, Markdown, HTML, JSON and text diffs',
  domain: 'https://promptformatter.top',
  // 面向用户的联系邮箱（About/Contact 页与 AdSense 审核要求）。
  // 上线前换成真实可收信地址（域名邮箱或转发到你的 Gmail）。
  contactEmail: 'support@promptformatter.top',
  // 全站默认社交分享卡（og:image / twitter:image）。相对路径，BaseLayout 转成绝对 URL。
  // 专门的 1200×630 品牌卡（public/og-card.png，由 sharp 从品牌 SVG 生成）。
  ogImage: '/og-card.png',
  // Google Search Console 的 HTML 标签验证码（<meta name="google-site-verification">
  // 的 content 值，只填码本身，不含标签）。留空则不渲染验证标签。
  // 拿到站点后：Search Console → 添加资源 → HTML 标记 → 复制 content 填这里。
  googleSiteVerification: '',
  // AdSense 审核通过、拿到 publisher id 后填这里并把 enabled 改成 true
  adsenseClient: 'ca-pub-0000000000000000',
  adsenseEnabled: false,
} as const;

export type ToolKey = 'prompt' | 'markdown' | 'html' | 'json' | 'diff';

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
  json: {
    key: 'json',
    title: 'JSON Formatter & Validator',
    blurb: 'Beautify, minify and validate JSON with instant error locations and syntax highlighting.',
    icon: 'json',
    href: '/json',
  },
  diff: {
    key: 'diff',
    title: 'Text Diff Checker',
    blurb: 'Compare two texts side by side and highlight every added, removed and changed line.',
    icon: 'diff',
    href: '/diff',
  },
};
