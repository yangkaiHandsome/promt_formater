# 上线与增长检查清单（LAUNCH CHECKLIST）

代码侧的 SEO / 结构化数据 / 内链 / 社交卡 / 性能已就绪。下面这些**只能你手动完成**（涉及外部账号、域名、审核），按顺序做完即可开始拿海外自然流量。

## 1. 部署到 Cloudflare Pages
- [ ] 把仓库连到 Cloudflare Pages
- [ ] 构建命令 `npm run build`，输出目录 `dist`，框架预设 **Astro**
- [ ] 绑定正式域名 `promptformatter.top`（Cloudflare DNS + Pages 自定义域名，自动 HTTPS）

## 2. 填真实占位符（`src/config.ts` 与 `astro.config.mjs`）
- [ ] `SITE.contactEmail` → 真实可收信邮箱（About/Privacy/Contact 都引用它，AdSense 审核会看）
- [ ] `SITE.googleSiteVerification` → 见第 3 步拿到的验证码（只填 content 值，不含标签）
- [ ] 上线后确认 `astro.config.mjs` 的 `site` 和 `public/robots.txt` 的 Sitemap 域名都是正式域名（当前已是 promptformatter.top）

## 3. Google Search Console（**决定能否被收录，最关键**）
- [ ] 打开 https://search.google.com/search-console → 添加资源（用「网址前缀」`https://promptformatter.top`）
- [ ] 选「HTML 标记」验证方式，复制 `content` 值填进 `SITE.googleSiteVerification`，重新部署后点验证
- [ ] 验证通过后 → 「站点地图」提交 `sitemap-index.xml`
- [ ] 用「网址检查」对首页和 2~3 个重点落地页手动「请求编入索引」，加速首次收录

## 4. Bing Webmaster Tools（额外 5~10% 流量，几乎零成本）
- [ ] https://www.bing.com/webmasters → 可直接从 Google Search Console 导入
- [ ] 提交同一个 `sitemap-index.xml`

## 5. Google AdSense（变现，需站点有真实流量与内容后再申请）
- [ ] 用真实邮箱申请 AdSense，拿到 `ca-pub-XXXXXXXXXXXXXXXX`
- [ ] 填 `SITE.adsenseClient`，并把 `SITE.adsenseEnabled` 改成 `true`（脚本、广告位、preconnect 会自动出现，无需改页面）
- [ ] 注意：AdSense 要求站点有实质内容与信任页——About/Privacy/Contact 已具备，落地页正文也够厚

## 6. 站外分发 / 首批外链（加速排名，越早越好）
- [ ] 相关 subreddit 分享具体工具（如 r/webdev 发 HTML/Markdown 工具，配合各自的 reddit-markdown / html-playground 落地页）
- [ ] 发一篇 Dev.to / Hashnode 教程，自然带链回工具
- [ ] 提交 Product Hunt
- [ ] 提交到 GitHub 上相关 awesome 列表（awesome-devtools 等）

---

## 已完成的代码侧优化（供参考，无需操作）
- 全站 `<head>`：og:image（专属 1200×630 品牌卡 `public/og-card.png`）、twitter 大图、robots、og:locale、theme-color、apple-touch-icon、Search Console 验证位（config 驱动）
- 结构化数据：全站 Organization + WebSite；每个工具页 SoftwareApplication + FAQPage + **BreadcrumbList**（落地页含可见面包屑）
- 内链：首页新增「Popular formatters」直链全部长尾落地页；各簇内互链已就位，无孤岛
- 长尾落地页：35 页（新增 3 个 HTML + 3 个 Markdown 意图页，文案独一无二、由真实工具胜任，非门页）
- 性能：系统字体无阻塞；AdSense 域名 preconnect（开启广告时生效）

## 部署后建议人工过一遍
- `npm run dev` 打开 HTML 工具，粘贴含 `<script>` / `onerror` 的 HTML，确认**不执行**（DOMPurify + sandbox iframe 双保险，本次未改动该逻辑）
- 用社交调试器预览分享卡：https://www.opengraph.xyz/ 输入线上 URL 看 og-card 是否正确
