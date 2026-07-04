# CLAUDE.md

本文件供后续 AI Agent 维护本项目时自动加载。请先读完再动手。

## 这是什么

面向**海外/全球用户**的在线**格式转换工具站**，纯静态、纯前端、无后端，部署在 **Cloudflare Pages**。
当前三个工具：**AI Prompt 格式化**、**Markdown 格式化/预览**、**HTML 渲染/美化**。

## 最重要的约束（决定一切决策）

> **终极商业目标是靠 Google AdSense 广告变现，因此一切优先考虑 SEO 自然流量。**

- 流量分工：**Markdown / HTML 是引流发动机**（搜索量大），**Prompt 是差异化蓝海**（竞争小、蹭 AI 趋势）。
- 增长策略：围绕长尾关键词**批量生成静态落地页**（见 `src/pages/*.astro`），复用同一工具组件、只换文案与 SEO meta。
- 全站英文（拿海外搜索流量和更高 AdSense 单价的前提）。**新增/修改面向用户的文案一律用英文。**
- **产品内 Prompt 工具排第一位**（首页卡片、导航顺序）——这是用户明确要求，改动排序时务必保持。

## 技术栈

- **Astro `^5`**（静态站，SEO 强）+ **React 岛**（`@astrojs/react`）+ **Tailwind**（`@astrojs/tailwind`）+ `@astrojs/sitemap`
- `output: 'static'`（见 `astro.config.mjs`）
- 纯前端库（全部浏览器端运行）：`markdown-it`、`prettier`（standalone，按需动态 import）、`dompurify`、`highlight.js`

## 常用命令

```bash
npm install
npm run dev       # 本地开发 http://localhost:4321
npm run build     # 产出到 dist/（Cloudflare Pages 用）
npm run preview   # 预览构建产物
```

> 注意：本机 `curl` 走 SOCKS 代理且 astro 只监听 IPv6，验证页面用 `node -e "fetch('http://localhost:4321/...')"` 而非 curl。

## 目录结构

```
src/
  config.ts               # ★ 全站配置中心：站名、域名、AdSense 开关、TOOLS 列表(顺序=展示顺序)
  layouts/
    BaseLayout.astro      # <head> SEO(title/desc/canonical/OG)、AdSense 脚本位、页头页脚导航
    ToolPage.astro        # 工具页通用壳：h1+intro+工具 slot+AdSlot+SEO正文(content slot)
  components/
    ToolShell.tsx         # 复用的左输入/右输出双栏骨架 + CopyButton（三工具共用）
    PromptTool.tsx        # Prompt：解析成角色段(彩色徽章)+ highlight.js 高亮内嵌 JSON
    MarkdownTool.tsx      # markdown-it 渲染 + DOMPurify 净化
    HtmlTool.tsx          # ★ 安全渲染：DOMPurify + <iframe sandbox=""> + prettier 格式化
    AdSlot.astro          # 广告位（受 config.adsenseEnabled 控制，关闭时不渲染任何东西）
    ToolIcon.astro        # 品牌与三工具的内联 SVG 图标
  pages/
    index.astro           # 首页三卡片(顺序来自 TOOLS)
    prompt/markdown/html.astro          # 三个主工具页
    prompt-formatter/markdown-to-html/html-viewer.astro  # 长尾关键词 SEO 落地页
  styles/global.css       # Tailwind 入口 + .md-preview 排版样式
public/
  robots.txt              # 含 sitemap 地址（上线改域名）
  favicon.svg
```

## 关键约束与坑（务必遵守）

1. **XSS 安全不可弱化**：`HtmlTool` 渲染用户 HTML 必须 `DOMPurify` 净化 **且** 放进 `<iframe sandbox="">`（空 sandbox=禁用脚本）。`MarkdownTool` 用 `markdown-it({html:false})` + DOMPurify。任何改动都要保住这套双保险。
2. **工具组件必须 `client:only="react"`**：它们依赖 `window`（DOMPurify/highlight.js），SSR 会报错。页面里引用工具组件时不要用 `client:load`。
3. **广告位默认隐藏**：`config.ts` 里 `adsenseEnabled: false` 时 `AdSlot` 完全不渲染（用户要求上线前不显示）。启用广告只需在 `config.ts` 填真实 `adsenseClient`（`ca-pub-...`）并把 `adsenseEnabled` 改 `true`——脚本和广告位会自动出现，无需改页面。
4. **Prompt 工具排第一**：由 `config.ts` 中 `TOOLS` 对象的键顺序决定（prompt→markdown→html），同时手动同步了 `BaseLayout` 的页头/页脚导航顺序。

## 上线前必改的占位符

- `src/config.ts`：`SITE.domain`（真实域名）、`SITE.adsenseClient`、`SITE.adsenseEnabled`
- `astro.config.mjs`：`site`（真实域名，影响 sitemap/canonical/OG 绝对 URL）
- `public/robots.txt`：`Sitemap:` 域名
- AdSense 审核要求站点有真实内容 → 落地页正文（FAQ/说明）不能太空。**上线前建议补：隐私政策页、About 页**（AdSense 常规要求）。

## 常见维护任务怎么做

- **加一个 SEO 落地页**：在 `src/pages/` 新建 `xxx.astro`，用 `ToolPage` 布局，复用现有某个工具组件（`client:only="react"`），写针对该关键词的 `title/description/h1/intro` 和 `content` slot 正文。sitemap 会自动收录。
- **加一个新工具**：在 `config.ts` 的 `TOOLS` 加一项（决定首页卡片+导航），写 `components/XxxTool.tsx`（复用 `ToolShell`），建 `pages/xxx.astro`，`ToolIcon.astro` 加图标，`BaseLayout` 导航加链接。
- **改工具展示顺序**：调 `config.ts` `TOOLS` 键顺序，并同步 `BaseLayout` 页头/页脚导航。

## 部署（Cloudflare Pages）

连接 Git 仓库，构建命令 `npm run build`，输出目录 `dist`，框架预设选 Astro。纯静态、全球 CDN、零服务器成本。

## 维护记录

- 三个工具 MVP 已完成并通过构建验证。Prompt 已置顶、广告位已隐藏、Prompt 输出已做角色分块+JSON 语法高亮。
- 未做实时浏览器点击测试（Claude Chrome 扩展未连接时）——改动交互后建议 `npm run dev` 人工过一遍，重点验 HTML 工具粘贴 `<script>`/`onerror` 不执行。
