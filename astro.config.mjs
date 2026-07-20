// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

import cloudflare from "@astrojs/cloudflare";

// 面向海外用户的公开站点地址。上线到 Cloudflare Pages 后改成正式域名，
// sitemap / canonical / OG 都依赖它生成绝对 URL。
export default defineConfig({
  site: 'https://promptformatter.top',
  output: 'static',
  integrations: [react(), tailwind(), sitemap()],
  adapter: cloudflare()
});