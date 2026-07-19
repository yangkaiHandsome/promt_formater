// ★ 数据驱动的长尾 SEO 落地页配置中心。
// 每一项 = 一个静态页（由 src/pages/[slug].astro 的 getStaticPaths 批量产出）。
// 增长玩法：围绕搜索意图变体加词，复用同一工具组件（group），只换文案与 SEO meta。
//
// 铁律（务必遵守，否则会被 Google 判为门页/doorway 惩罚）：
//   1. group 必须映射到一个「真的能干这活」的工具组件（prompt/markdown/html）。
//   2. h1 / intro / sections / faq 每页都要独一无二，禁止模板换词式重复。
//   3. faq 的 answer 文案必须与页面可见正文一致（FAQPage 结构化数据的硬要求）。
//
// slug 不能与 src/pages/ 下已有的 .astro 文件同名（会造成路由冲突）。

export type ToolGroup = 'prompt' | 'markdown' | 'html' | 'json' | 'diff';

export interface Landing {
  slug: string;
  group: ToolGroup;
  title: string;
  description: string;
  h1: string;
  intro: string;
  /** 正文分节（H2 + HTML 片段，内容可信、可含 <code>/<a>/<ul>） */
  sections: { h2: string; html: string }[];
  faq: { q: string; a: string }[];
}

export const LANDINGS: Landing[] = [
  // ---------------- Markdown 意图簇（复用 MarkdownTool：md → 实时 HTML 预览） ----------------
  {
    slug: 'markdown-preview',
    group: 'markdown',
    title: 'Markdown Preview Online — Live Rendered Preview',
    description:
      'Preview Markdown online in real time. Paste your .md and see the rendered result instantly — headings, tables, code blocks and links. Free and private.',
    h1: 'Markdown Preview Online',
    intro:
      'Paste Markdown and watch it render live as you type. A fast, no-install way to check how your README, notes or docs will look before you publish them.',
    sections: [
      {
        h2: 'See your Markdown exactly as it will render',
        html: '<p>Writing Markdown blind is easy to get wrong — a missing blank line before a list, a broken table pipe, an unclosed code fence. This live preview renders every keystroke so you catch formatting mistakes immediately instead of after you push.</p>',
      },
      {
        h2: 'What gets rendered',
        html: '<ul><li>Headings, bold, italic and blockquotes</li><li>Ordered and unordered lists, including nesting</li><li>Tables, fenced code blocks and inline code</li><li>Links and images with automatic linkification</li></ul>',
      },
    ],
    faq: [
      {
        q: 'Is the preview accurate to GitHub?',
        a: 'It renders standard CommonMark-style Markdown, which matches how most platforms including GitHub display headings, lists, tables and code.',
      },
      {
        q: 'Does my text leave my browser?',
        a: 'No. The preview is generated locally in your browser, so nothing you paste is uploaded or stored.',
      },
    ],
  },
  {
    slug: 'markdown-editor-online',
    group: 'markdown',
    title: 'Markdown Editor Online — Free, No Sign-Up',
    description:
      'A free online Markdown editor with live preview. Write on the left, see rendered HTML on the right, then copy the HTML or download your .md. No account needed.',
    h1: 'Free Online Markdown Editor',
    intro:
      'Write Markdown on the left and see the formatted result on the right in real time. Copy the generated HTML when you are done, or download the raw .md file — no sign-up, nothing installed.',
    sections: [
      {
        h2: 'Write and preview side by side',
        html: '<p>A split-pane editor keeps your source and the rendered output in view at the same time, so you can format a README, a blog draft or release notes without switching tools or guessing at the result.</p>',
      },
      {
        h2: 'Export when you are ready',
        html: '<p>Click <strong>Copy</strong> to grab clean HTML for a CMS or email, or <strong>Download .md</strong> to save the raw Markdown. Everything runs client-side, so your draft never touches a server.</p>',
      },
    ],
    faq: [
      {
        q: 'Do I need an account?',
        a: 'No. The editor is completely free and requires no sign-up or installation.',
      },
      {
        q: 'Can I export the result as HTML?',
        a: 'Yes. Use the Copy button to export the rendered HTML, or download the raw .md file.',
      },
    ],
  },
  {
    slug: 'md-to-html',
    group: 'markdown',
    title: 'MD to HTML — Convert Markdown to HTML Online',
    description:
      'Convert MD to HTML online for free. Paste your Markdown and instantly get clean, copy-ready HTML. Runs entirely in your browser, no upload.',
    h1: 'MD to HTML Converter',
    intro:
      'Turn a Markdown (.md) file into clean HTML in one step. Paste your Markdown and copy the generated HTML — ready to drop into a web page, CMS or email template.',
    sections: [
      {
        h2: 'From .md to production-ready HTML',
        html: '<p>Markdown is great for writing, but publishing usually needs HTML. This converter renders your Markdown to semantic HTML — proper heading tags, lists, tables and code blocks — that you can paste straight into your site.</p>',
      },
      {
        h2: 'Clean, predictable output',
        html: '<p>The generated markup is minimal and standards-based, without editor cruft or inline styles, so it slots into your own CSS cleanly.</p>',
      },
    ],
    faq: [
      {
        q: 'What does MD to HTML mean?',
        a: 'MD is the file extension for Markdown. Converting MD to HTML transforms Markdown syntax into the HTML tags a browser renders.',
      },
      {
        q: 'Is the conversion done on a server?',
        a: 'No. The conversion runs entirely in your browser, so your content stays private.',
      },
    ],
  },
  {
    slug: 'github-markdown-preview',
    group: 'markdown',
    title: 'GitHub Markdown Preview — Check Your README Online',
    description:
      'Preview GitHub-flavored Markdown online before you commit. Paste your README.md and see how headings, tables, task lists and code blocks will render.',
    h1: 'GitHub Markdown Preview',
    intro:
      'Check how your README or issue will look on GitHub before you commit. Paste your Markdown and get an instant rendered preview — no need to push just to fix a broken table.',
    sections: [
      {
        h2: 'Stop pushing just to preview',
        html: '<p>Editing a README and committing repeatedly only to see how it renders is a waste of time. Paste it here first, fix the formatting, and push once it looks right.</p>',
      },
      {
        h2: 'Handles the syntax READMEs rely on',
        html: '<ul><li>Tables and alignment</li><li>Fenced code blocks with language hints</li><li>Nested lists and blockquotes</li><li>Links, images and badges</li></ul>',
      },
    ],
    faq: [
      {
        q: 'Does it match GitHub exactly?',
        a: 'It renders the standard Markdown features READMEs use — headings, tables, code blocks and lists — the same way GitHub displays them.',
      },
      {
        q: 'Can I preview an issue or comment?',
        a: 'Yes. Any GitHub-flavored Markdown, including issues and pull request comments, can be pasted in for a preview.',
      },
    ],
  },
  {
    slug: 'markdown-viewer',
    group: 'markdown',
    title: 'Markdown Viewer — Open and Read .md Files Online',
    description:
      'A free online Markdown viewer. Paste the contents of a .md file to read it as clean, formatted text instead of raw symbols. Private, in-browser.',
    h1: 'Online Markdown Viewer',
    intro:
      'Reading raw Markdown full of #, * and | symbols is painful. Paste the contents of any .md file here to view it as clean, formatted text you can actually read.',
    sections: [
      {
        h2: 'Read Markdown, not symbols',
        html: '<p>Documentation, notes and changelogs are often shared as raw Markdown. This viewer renders that source into formatted text with real headings, lists and tables so you can read it comfortably.</p>',
      },
      {
        h2: 'No app required',
        html: '<p>There is nothing to install and no file to upload — paste the text and read. It works on any device with a browser.</p>',
      },
    ],
    faq: [
      {
        q: 'Can I view a .md file without an app?',
        a: 'Yes. Just paste the file contents into the viewer and it renders the formatted result in your browser.',
      },
      {
        q: 'Is my file uploaded?',
        a: 'No. Rendering happens locally in your browser; nothing is sent anywhere.',
      },
    ],
  },

  {
    slug: 'markdown-cheat-sheet',
    group: 'markdown',
    title: 'Markdown Cheat Sheet — Syntax Reference with Live Preview',
    description:
      'A quick Markdown cheat sheet covering headings, lists, links, images, tables and code — with a live editor so you can try each example and see it render.',
    h1: 'Markdown Cheat Sheet',
    intro:
      'Every common piece of Markdown syntax in one place, from headings to tables to fenced code. Paste any example into the editor above to see exactly how it renders.',
    sections: [
      {
        h2: 'Text and headings',
        html: '<p>Use <code>#</code> through <code>######</code> for headings (H1–H6). Wrap text in <code>**double asterisks**</code> for <strong>bold</strong>, <code>*single asterisks*</code> for <em>italic</em>, and <code>~~tildes~~</code> for strikethrough. A <code>&gt;</code> at the start of a line makes a blockquote.</p>',
      },
      {
        h2: 'Lists, links and images',
        html: '<ul><li>Unordered lists: start lines with <code>-</code> or <code>*</code></li><li>Ordered lists: start lines with <code>1.</code>, <code>2.</code> and so on</li><li>Links: <code>[label](https://example.com)</code></li><li>Images: <code>![alt text](image.png)</code></li></ul>',
      },
      {
        h2: 'Code and tables',
        html: '<p>Wrap inline code in <code>`backticks`</code>. For a block, fence it with three backticks and an optional language such as <code>```js</code>. Build a table with pipes and a divider row:</p><pre><code>| Name | Role |\n| ---- | ---- |\n| Ada  | Dev  |</code></pre>',
      },
    ],
    faq: [
      {
        q: 'What is Markdown used for?',
        a: 'Markdown is a lightweight syntax for formatting plain text — READMEs, documentation, notes, forum posts and chat messages all commonly use it.',
      },
      {
        q: 'Can I try the examples from this cheat sheet?',
        a: 'Yes. Paste any snippet into the editor above and it renders live, so you can see exactly how each piece of syntax behaves.',
      },
    ],
  },
  {
    slug: 'reddit-markdown',
    group: 'markdown',
    title: 'Reddit Markdown Preview — Format Reddit Comments Online',
    description:
      'Preview Reddit markdown before you post. Paste your comment and see how the bold, italics, lists, links and quotes will render. Free and private.',
    h1: 'Reddit Markdown Preview',
    intro:
      'Reddit comments and posts are formatted with Markdown. Paste your draft here to see how the bold, italics, lists, links and quotes will look before you hit reply, so nothing renders the way you did not expect.',
    sections: [
      {
        h2: 'Format your comment with confidence',
        html: '<p>Nothing undercuts a good Reddit reply like broken formatting — a list that ran together, a link that did not resolve, an accidental wall of italics. Preview the rendered result first so your comment reads exactly as you intend.</p>',
      },
      {
        h2: 'The formatting Reddit supports',
        html: '<ul><li><strong>Bold</strong> with <code>**text**</code> and <em>italics</em> with <code>*text*</code></li><li>Quotes with a leading <code>&gt;</code></li><li>Bulleted and numbered lists</li><li>Inline <code>code</code> and links</li></ul>',
      },
    ],
    faq: [
      {
        q: 'Does Reddit use Markdown?',
        a: 'Yes. Reddit comments and posts are formatted with Markdown, including bold, italics, lists, quotes, links and code.',
      },
      {
        q: 'Will the preview match Reddit exactly?',
        a: 'It renders the standard Markdown formatting Reddit supports — bold, italics, lists, quotes, links and code — so you can check your formatting before posting.',
      },
    ],
  },
  {
    slug: 'obsidian-markdown-preview',
    group: 'markdown',
    title: 'Obsidian Markdown Preview — Render Your Notes Online',
    description:
      'Preview Obsidian-style Markdown online. Paste a note to see headings, lists, tables and code render cleanly — no vault or app required.',
    h1: 'Obsidian Markdown Preview',
    intro:
      'Obsidian stores your notes as plain Markdown files. Paste the contents of a note here to render it as clean, formatted text when you are away from your vault or just want a quick look without opening the app.',
    sections: [
      {
        h2: 'Read a note without opening your vault',
        html: '<p>Because Obsidian notes are ordinary <code>.md</code> files, you can read any of them anywhere. Paste the text to see headings, lists, tables and quotes rendered — handy on a device where Obsidian is not installed.</p>',
      },
      {
        h2: 'Markdown features it renders',
        html: '<ul><li>Headings, bold, italics and blockquotes</li><li>Bulleted, numbered and nested lists</li><li>Tables and fenced code blocks</li><li>Links and images</li></ul>',
      },
    ],
    faq: [
      {
        q: 'Are Obsidian notes just Markdown?',
        a: 'Yes. Obsidian stores notes as standard Markdown files, so their contents render like any other Markdown.',
      },
      {
        q: 'Does this render wikilinks or plugin syntax?',
        a: 'It renders standard Markdown — headings, lists, tables, code and links. App-specific extensions such as wikilinks or plugin syntax are not processed.',
      },
    ],
  },

  // ---------------- HTML 意图簇（复用 HtmlTool：安全渲染 + 美化） ----------------
  {
    slug: 'html-formatter',
    group: 'html',
    title: 'HTML Formatter Online — Format & Indent HTML Free',
    description:
      'Format HTML online for free. Paste messy or minified markup and get clean, properly indented HTML instantly. Runs in your browser, nothing uploaded.',
    h1: 'HTML Formatter',
    intro:
      'Paste messy, minified or copy-pasted HTML and get back clean, properly indented markup you can actually read. Switch to the Format tab to beautify in one click.',
    sections: [
      {
        h2: 'Turn tangled markup into readable HTML',
        html: '<p>HTML copied from view-source, a build output or a CMS is often one long minified line. The formatter re-indents your tags, wraps long lines and lays out nesting so the structure is obvious at a glance.</p>',
      },
      {
        h2: 'Preview and format in one place',
        html: '<p>Use the <strong>Preview</strong> tab to render the HTML safely, then <strong>Format</strong> to clean it up. Rendering happens in a sandboxed iframe with scripts disabled, so pasted markup can never run against your browser.</p>',
      },
    ],
    faq: [
      {
        q: 'Can it format minified HTML?',
        a: 'Yes. Paste minified or single-line HTML and the Format tab re-indents and wraps it into readable markup.',
      },
      {
        q: 'Is it safe to paste any HTML?',
        a: 'Yes. HTML is sanitized and rendered inside a sandboxed iframe with scripts disabled, so nothing malicious can execute.',
      },
    ],
  },
  {
    slug: 'html-beautifier',
    group: 'html',
    title: 'HTML Beautifier — Clean Up Messy HTML Online',
    description:
      'Beautify HTML online free. Paste ugly, inconsistent markup and get clean, consistently indented HTML. In-browser, private, no sign-up.',
    h1: 'HTML Beautifier',
    intro:
      'Inconsistent indentation, mixed spacing and cramped tags make HTML hard to work with. Paste it here and the beautifier returns tidy, consistently formatted markup.',
    sections: [
      {
        h2: 'Consistent formatting, every time',
        html: '<p>Whether the markup came from a teammate, a template or a hand-edited file, the beautifier normalizes indentation and spacing so everything follows the same clean style.</p>',
      },
      {
        h2: 'Great before committing or reviewing',
        html: '<p>Beautifying HTML before a commit keeps diffs small and reviews readable. Paste, format, and copy the result back into your editor.</p>',
      },
    ],
    faq: [
      {
        q: 'What is the difference between beautify and minify?',
        a: 'Beautifying adds indentation and line breaks to make HTML readable; minifying strips them to make files smaller. This tool beautifies.',
      },
      {
        q: 'Does it change my markup?',
        a: 'It only changes whitespace and indentation for readability — the tags and content stay the same.',
      },
    ],
  },
  {
    slug: 'html-previewer',
    group: 'html',
    title: 'HTML Previewer — Render HTML Code Online Safely',
    description:
      'Preview HTML code online. Paste your markup and see it rendered instantly in a safe sandbox. Free HTML previewer that runs in your browser.',
    h1: 'HTML Previewer',
    intro:
      'Paste an HTML snippet and see it rendered instantly, without creating a file or spinning up a server. Rendering happens in a sandboxed iframe, so it is completely safe.',
    sections: [
      {
        h2: 'Instant rendering, no setup',
        html: '<p>Testing a snippet normally means saving a file and opening it in a browser. Here you just paste and see the result — ideal for checking a component, an email block or a copied layout.</p>',
      },
      {
        h2: 'Safe by design',
        html: '<p>Your HTML is sanitized and rendered inside a sandboxed iframe with scripts disabled, so even markup with embedded scripts or event handlers cannot run.</p>',
      },
    ],
    faq: [
      {
        q: 'Will scripts in my HTML execute?',
        a: 'No. Scripts and event handlers are stripped and the sandbox blocks execution by design.',
      },
      {
        q: 'Do I need to save a file?',
        a: 'No. Paste the HTML and it renders immediately — there is nothing to save or upload.',
      },
    ],
  },
  {
    slug: 'unminify-html',
    group: 'html',
    title: 'Unminify HTML — Expand Minified HTML Online',
    description:
      'Unminify HTML online free. Paste minified, single-line HTML and expand it into clean, indented, readable markup. Private, in-browser tool.',
    h1: 'Unminify HTML',
    intro:
      'Minified HTML is a single dense line built for machines, not people. Paste it here to expand it back into clean, indented markup you can read and debug.',
    sections: [
      {
        h2: 'Make production HTML readable again',
        html: '<p>Production pages ship minified to save bytes. When you need to inspect or debug that markup, unminifying restores the line breaks and indentation so you can follow the structure.</p>',
      },
      {
        h2: 'From one line to clean nesting',
        html: '<p>The tool re-indents nested elements and wraps long lines, turning an unreadable blob into properly laid-out HTML in one step.</p>',
      },
    ],
    faq: [
      {
        q: 'What does unminify mean?',
        a: 'Unminifying reverses minification by adding back the whitespace, line breaks and indentation that were removed to shrink the file.',
      },
      {
        q: 'Does it recover original formatting?',
        a: 'It produces clean, consistently indented markup. Comments and original spacing removed during minification cannot be recovered, but the structure becomes fully readable.',
      },
    ],
  },
  {
    slug: 'html-prettifier',
    group: 'html',
    title: 'HTML Prettifier — Pretty-Print HTML Code Online',
    description:
      'Pretty-print HTML online for free. Paste raw markup and get neatly formatted, indented HTML. Fast, private HTML prettifier in your browser.',
    h1: 'HTML Prettifier',
    intro:
      'Pretty-print raw or generated HTML into neatly indented, easy-to-scan markup. Paste your code, hit Format, and copy the tidy result.',
    sections: [
      {
        h2: 'Prettify generated markup',
        html: '<p>HTML produced by frameworks, exporters or WYSIWYG editors is often correct but ugly. Prettifying gives it consistent indentation and line breaks so it is pleasant to read and maintain.</p>',
      },
      {
        h2: 'Copy the clean version back',
        html: '<p>Once formatted, copy the prettified HTML straight into your project. The whole process runs locally in your browser.</p>',
      },
    ],
    faq: [
      {
        q: 'Is prettify the same as beautify?',
        a: 'Yes. Both mean adding indentation and line breaks so HTML is easier for humans to read.',
      },
      {
        q: 'Can I use it on large files?',
        a: 'Yes. Paste the markup and it formats in your browser; larger inputs simply take a moment longer.',
      },
    ],
  },

  {
    slug: 'html-editor-online',
    group: 'html',
    title: 'Online HTML Editor — Edit, Preview & Format HTML',
    description:
      'A free online HTML editor. Type or paste HTML, see it render live in a safe sandbox, then format the markup in one click. No install, no sign-up.',
    h1: 'Online HTML Editor',
    intro:
      'Edit HTML in your browser with an instant, safe preview. Paste or write markup, switch to Preview to see it render, and hit Format to tidy the indentation — no editor to install and no account to create.',
    sections: [
      {
        h2: 'Edit and see the result immediately',
        html: '<p>A good HTML editor closes the gap between typing a tag and seeing what it does. Make a change, flip to the Preview tab, and the rendered output updates — so you can shape a layout, a card or a snippet without saving files or refreshing a browser.</p>',
      },
      {
        h2: 'Format as you go',
        html: '<p>Editing quickly leaves markup messy. The <strong>Format</strong> tab re-indents your HTML into clean, consistent structure whenever you want it, which keeps long documents readable while you work. Preview rendering runs in a sandboxed iframe with scripts disabled, so pasted code is always safe.</p>',
      },
    ],
    faq: [
      {
        q: 'Is this HTML editor free?',
        a: 'Yes. It is completely free, needs no sign-up, and runs entirely in your browser.',
      },
      {
        q: 'Can I preview my HTML while editing?',
        a: 'Yes. Switch to the Preview tab to render your markup safely in a sandboxed iframe, then keep editing.',
      },
    ],
  },
  {
    slug: 'html-playground',
    group: 'html',
    title: 'HTML Playground — Test HTML Snippets Online',
    description:
      'A free HTML playground. Paste a snippet and see it render instantly in a safe sandbox — perfect for testing a component or layout without setting up a project.',
    h1: 'HTML Playground',
    intro:
      'Try out HTML without a project, a build step or a local file. Paste a snippet into the playground and see it render immediately in a sandboxed frame — ideal for testing an idea, a component or a copied block of markup.',
    sections: [
      {
        h2: 'Prototype without the setup',
        html: '<p>Spinning up a project just to test one piece of HTML is overkill. Drop your markup in the playground and it renders on the spot, so you can check how a hero section, a table or a form looks in seconds.</p>',
      },
      {
        h2: 'Experiment safely',
        html: '<p>Because rendering happens inside a sandboxed iframe with scripts disabled, you can paste markup from anywhere — a tutorial, an email, a page you are inspecting — and experiment freely without anything executing against your browser.</p>',
      },
    ],
    faq: [
      {
        q: 'What is an HTML playground?',
        a: 'It is a space where you paste HTML and immediately see it rendered, without creating files or configuring a project.',
      },
      {
        q: 'Do scripts run in the playground?',
        a: 'No. Scripts and event handlers are stripped and the sandbox blocks execution, so testing is always safe.',
      },
    ],
  },
  {
    slug: 'email-html-preview',
    group: 'html',
    title: 'HTML Email Preview — Test Email Markup Online',
    description:
      'Preview HTML email markup online. Paste the source of an email template and see how it renders, safely in your browser. Free, private, no upload.',
    h1: 'HTML Email Preview',
    intro:
      'Building an HTML email means table-heavy, inline-styled markup that is hard to picture from source alone. Paste your email HTML here to see it rendered instantly and safely, so you can check the layout before you send.',
    sections: [
      {
        h2: 'See your email template render',
        html: '<p>Email HTML is its own dialect — nested tables, inline styles, fixed widths. Reading it as raw markup tells you little about the result. This previewer renders the template so you can confirm the structure, spacing and content look right.</p>',
      },
      {
        h2: 'Check it before you send',
        html: '<p>Catch a broken table, a stray column or a missing image before the campaign goes out. Paste, preview, fix, repeat — all in your browser, with the markup rendered in a sandboxed iframe so nothing executes.</p>',
      },
    ],
    faq: [
      {
        q: 'Can I preview an HTML email without sending it?',
        a: 'Yes. Paste the email HTML and it renders in your browser, so you can check the layout without sending a test message.',
      },
      {
        q: 'Is my email content uploaded anywhere?',
        a: 'No. Rendering happens locally in a sandboxed iframe; nothing you paste is uploaded or stored.',
      },
    ],
  },

  // ---------------- Prompt 意图簇（复用 PromptTool，扩展现有 prompt 主题簇） ----------------
  {
    slug: 'chatgpt-prompt-formatter',
    group: 'prompt',
    title: 'ChatGPT Prompt Formatter — Read OpenAI Prompts Clearly',
    description:
      'Format ChatGPT prompts online. Paste an escaped OpenAI messages payload from your logs and get a clean, role-by-role conversation. Free and private.',
    h1: 'ChatGPT Prompt Formatter',
    intro:
      'Debugging a ChatGPT call and staring at one giant escaped line? Paste it here to unescape the text, pretty-print inline JSON, and split the system, user and assistant turns into readable blocks.',
    sections: [
      {
        h2: 'Built for the way ChatGPT logs look',
        html: '<p>OpenAI’s Chat Completions API sends a <code>messages</code> array of role/content objects. In your logs that becomes a single escaped line. This formatter understands the shape and lays each role out on its own block so you can see exactly what was sent.</p>',
      },
      {
        h2: 'Roles it recognizes',
        html: '<ul><li><strong>system</strong> — your instructions to the model</li><li><strong>user</strong> — the end-user turn</li><li><strong>assistant</strong> — the model reply</li><li><strong>tool</strong> / function calls — with arguments pretty-printed</li></ul>',
      },
    ],
    faq: [
      {
        q: 'Does it work with the OpenAI messages format?',
        a: 'Yes. It parses the system/user/assistant messages array and pretty-prints any inline JSON, including tool and function arguments.',
      },
      {
        q: 'Is my prompt sent to a server?',
        a: 'No. Formatting runs entirely in your browser, so your ChatGPT prompts stay private.',
      },
    ],
  },
  {
    slug: 'system-prompt-formatter',
    group: 'prompt',
    title: 'System Prompt Formatter — Read & Clean System Prompts',
    description:
      'Format a system prompt online. Unescape newlines, pretty-print embedded JSON and see your system instructions laid out cleanly. Free, in-browser.',
    h1: 'System Prompt Formatter',
    intro:
      'A long system prompt pulled from logs or code is often escaped and crammed onto one line. Paste it here to restore real line breaks and read your instructions the way the model sees them.',
    sections: [
      {
        h2: 'See the instructions the model actually gets',
        html: '<p>System prompts define how your assistant behaves, so being able to read them clearly matters. This tool unescapes <code>\\n</code>, restores indentation and formats any embedded JSON or examples inside the prompt.</p>',
      },
      {
        h2: 'Handy while iterating',
        html: '<p>When you are tuning behavior, paste each version here to compare structure and spot accidental duplication or broken formatting before you ship it.</p>',
      },
    ],
    faq: [
      {
        q: 'What is a system prompt?',
        a: 'A system prompt is the instruction block that sets an AI assistant’s role, rules and tone before the conversation begins.',
      },
      {
        q: 'Does it store my system prompt?',
        a: 'No. Everything is processed locally in your browser and nothing is saved or uploaded.',
      },
    ],
  },
  {
    slug: 'llm-prompt-formatter',
    group: 'prompt',
    title: 'LLM Prompt Formatter — Clean Up Any Model Prompt',
    description:
      'Format prompts for any LLM. Paste a messy, escaped prompt from OpenAI, Claude, Gemini or your own logs and get a clean, readable conversation. Free.',
    h1: 'LLM Prompt Formatter',
    intro:
      'Works with prompts from any large language model. Paste an escaped, single-line prompt from your logs and get back a clean, role-separated conversation with pretty-printed JSON.',
    sections: [
      {
        h2: 'Model-agnostic by design',
        html: '<p>Whether the prompt came from OpenAI, Anthropic, Google or your own application, the formatter recognizes common role labels and message shapes and lays the conversation out consistently.</p>',
      },
      {
        h2: 'What it cleans up',
        html: '<ul><li>Unescapes literal <code>\\n</code>, <code>\\t</code> and quotes</li><li>Pretty-prints inline JSON payloads and tool arguments</li><li>Separates system, user, assistant and tool turns</li></ul>',
      },
    ],
    faq: [
      {
        q: 'Which models does it support?',
        a: 'Any LLM that uses role-based messages, including OpenAI, Claude and Gemini, plus custom formats copied from your own logs.',
      },
      {
        q: 'Is it free and private?',
        a: 'Yes. It is completely free and runs entirely in your browser, so prompts are never uploaded.',
      },
    ],
  },
  {
    slug: 'ai-prompt-message-formatter',
    group: 'prompt',
    title: 'AI Prompt Message Formatter — Read Role-Based Prompts',
    description:
      'Format AI prompt message arrays online. Paste system, user, assistant and tool messages from logs to see each role separated and readable. Private, in-browser.',
    h1: 'AI Prompt Message Formatter',
    intro:
      'Role-based prompt payloads are hard to audit when they are escaped into a log line. Paste the message array here to separate system, user, assistant and tool turns into readable blocks.',
    sections: [
      {
        h2: 'Untangle role-based prompt payloads',
        html: '<p>Modern AI apps often send prompts as arrays of messages rather than one plain string. In logs, that structure can become dense and escaped. This formatter restores line breaks, separates each role, and makes the actual conversation easier to inspect.</p>',
      },
      {
        h2: 'Useful for debugging prompt behavior',
        html: '<p>When a model ignores an instruction or uses the wrong context, the first question is what prompt it actually received. Formatting the message payload helps you spot missing system instructions, repeated user turns, malformed tool arguments and noisy context.</p>',
      },
    ],
    faq: [
      {
        q: 'What is an AI prompt message array?',
        a: 'It is a structured prompt format where each turn has a role such as system, user, assistant or tool, instead of being sent as one unstructured text block.',
      },
      {
        q: 'Can it format tool call arguments inside a prompt?',
        a: 'Yes. The formatter pretty-prints inline JSON, which makes tool call arguments and structured examples easier to read.',
      },
    ],
  },

  // ---------------- JSON 意图簇（复用 JsonTool：格式化 / 校验 / 压缩） ----------------
  {
    slug: 'json-validator',
    group: 'json',
    title: 'JSON Validator Online — Check & Fix JSON Errors',
    description:
      'Validate JSON online for free. Paste your JSON and instantly see whether it is valid, with the exact line and column of any syntax error. Private, in-browser.',
    h1: 'JSON Validator',
    intro:
      'Paste JSON and find out immediately whether it is valid. When it is not, the validator points to the exact line and column where parsing failed, so you can fix a stray comma or missing bracket in seconds.',
    sections: [
      {
        h2: 'Catch the error, not just the fact that there is one',
        html: '<p>A generic “invalid JSON” message is useless when you are staring at a thousand lines. This validator parses your input and reports the precise line and column of the first problem, along with the underlying error, so you know exactly where to look.</p>',
      },
      {
        h2: 'Common mistakes it flags',
        html: '<ul><li>Trailing commas after the last item</li><li>Missing or mismatched brackets and braces</li><li>Single quotes instead of double quotes</li><li>Unquoted keys and unescaped control characters</li></ul>',
      },
    ],
    faq: [
      {
        q: 'How do I know where my JSON is broken?',
        a: 'When JSON fails to parse, the validator reports the error message along with the line and column where the problem was detected, so you can jump straight to it.',
      },
      {
        q: 'Is my data sent to a server?',
        a: 'No. Validation runs entirely in your browser, so nothing you paste is uploaded or stored.',
      },
    ],
  },
  {
    slug: 'json-beautifier',
    group: 'json',
    title: 'JSON Beautifier — Format & Indent JSON Online',
    description:
      'Beautify JSON online for free. Paste minified or messy JSON and get clean, indented, syntax-highlighted output. Choose 2 spaces, 4 spaces or tabs. In-browser.',
    h1: 'JSON Beautifier',
    intro:
      'Turn cramped, single-line or inconsistently indented JSON into clean, readable structure. Paste your JSON and get beautifully indented, syntax-highlighted output you can copy or download.',
    sections: [
      {
        h2: 'Readable structure at a glance',
        html: '<p>JSON pulled from an API response or a log line is often one dense string. Beautifying re-indents every nested object and array so the hierarchy is obvious, with colors that separate keys, strings, numbers and booleans.</p>',
      },
      {
        h2: 'Your indentation, your choice',
        html: '<p>Pick 2 spaces, 4 spaces or tabs to match your project style. The formatted result updates instantly and can be copied straight back into your editor.</p>',
      },
    ],
    faq: [
      {
        q: 'Can I choose the indentation size?',
        a: 'Yes. Switch between 2 spaces, 4 spaces or tabs, and the beautified output updates instantly.',
      },
      {
        q: 'Does beautifying change my data?',
        a: 'No. It only adds whitespace and line breaks for readability — the keys, values and structure stay exactly the same.',
      },
    ],
  },
  {
    slug: 'json-minifier',
    group: 'json',
    title: 'JSON Minifier — Compress JSON Online Free',
    description:
      'Minify JSON online for free. Paste formatted JSON and strip all whitespace into a single compact line to shrink payloads. Fast, private, in-browser.',
    h1: 'JSON Minifier',
    intro:
      'Compress JSON by removing every unnecessary space and line break. Paste your formatted JSON and get a single compact line that is smaller to store and faster to send over the wire.',
    sections: [
      {
        h2: 'Smaller payloads, same data',
        html: '<p>Whitespace makes JSON readable but adds bytes. Minifying collapses your JSON into one line with no indentation, which reduces file size and request payloads without changing a single value.</p>',
      },
      {
        h2: 'Validate while you compress',
        html: '<p>The minifier parses your input first, so if the JSON is invalid you will see the error and its location instead of a broken one-liner. Copy or download the compact result when it checks out.</p>',
      },
    ],
    faq: [
      {
        q: 'Does minifying JSON lose any data?',
        a: 'No. Minifying only removes whitespace and line breaks; every key and value is preserved exactly.',
      },
      {
        q: 'What if my JSON is invalid?',
        a: 'The tool parses your JSON before minifying, so invalid input is flagged with its error location rather than producing a broken result.',
      },
    ],
  },
  {
    slug: 'json-viewer',
    group: 'json',
    title: 'JSON Viewer Online — Read & Explore JSON',
    description:
      'A free online JSON viewer. Paste raw or minified JSON to read it as clean, indented, color-highlighted text instead of a wall of characters. Private, in-browser.',
    h1: 'Online JSON Viewer',
    intro:
      'Reading raw JSON — especially a minified API response — is painful. Paste it here to view it as clean, indented, syntax-highlighted text you can actually scan and understand.',
    sections: [
      {
        h2: 'Make an API response readable',
        html: '<p>Responses copied from a browser network tab or a curl command often arrive as one long line. The viewer expands and highlights them so you can trace nested objects and arrays without counting brackets by hand.</p>',
      },
      {
        h2: 'Nothing to install',
        html: '<p>There is no extension to add and no file to upload — paste the JSON and read it. It works on any device with a browser, and your data never leaves it.</p>',
      },
    ],
    faq: [
      {
        q: 'Can I view minified JSON?',
        a: 'Yes. Paste minified or single-line JSON and the viewer expands it into clean, indented, highlighted text.',
      },
      {
        q: 'Is my JSON uploaded?',
        a: 'No. Rendering happens locally in your browser; nothing you paste is sent anywhere.',
      },
    ],
  },
  {
    slug: 'json-pretty-print',
    group: 'json',
    title: 'JSON Pretty Print — Format JSON Nicely Online',
    description:
      'Pretty print JSON online for free. Paste raw JSON and get neatly indented, color-highlighted output with your choice of spacing. Fast and private, in your browser.',
    h1: 'JSON Pretty Print',
    intro:
      'Pretty-print raw or generated JSON into neatly indented, easy-to-scan output. Paste your JSON, choose your spacing, and copy the tidy, highlighted result.',
    sections: [
      {
        h2: 'From raw string to tidy JSON',
        html: '<p>JSON generated by code, exported from a tool or copied from a log is usually correct but hard to read. Pretty-printing gives it consistent indentation and clear syntax colors so it is pleasant to review and debug.</p>',
      },
      {
        h2: 'Copy the clean version back',
        html: '<p>Once printed, copy the formatted JSON straight into your project, or download it as a <code>.json</code> file. The whole process runs locally in your browser.</p>',
      },
    ],
    faq: [
      {
        q: 'Is pretty print the same as beautify?',
        a: 'Yes. Both mean adding indentation and line breaks so JSON is easier for humans to read.',
      },
      {
        q: 'Can I control the spacing?',
        a: 'Yes. Choose 2 spaces, 4 spaces or tabs, and the pretty-printed output updates instantly.',
      },
    ],
  },
  {
    slug: 'json-parser-online',
    group: 'json',
    title: 'JSON Parser Online — Parse & Format JSON Safely',
    description:
      'Parse JSON online for free. Paste a JSON string or API response to validate it, format it with indentation and see exact syntax errors. Private, in-browser.',
    h1: 'JSON Parser Online',
    intro:
      'Paste a JSON payload and parse it instantly in your browser. Valid JSON becomes clean, indented output; invalid JSON shows the line, column and parser message so you know where it failed.',
    sections: [
      {
        h2: 'Parse before you trust a payload',
        html: '<p>JSON copied from an API response, config file or log can look right while hiding a small syntax problem. Parsing it first confirms the data is valid and turns the result into readable, highlighted JSON for review.</p>',
      },
      {
        h2: 'Clear errors for broken JSON',
        html: '<p>When parsing fails, the tool reports the browser parser error and points to the detected line and column. That makes it faster to find issues like a trailing comma, a missing quote, an extra brace or an unescaped newline.</p>',
      },
    ],
    faq: [
      {
        q: 'What does a JSON parser do?',
        a: 'A JSON parser checks whether text is valid JSON and converts it into a structured value. This tool also formats valid JSON so it is easier to read.',
      },
      {
        q: 'Will this parse JSON on a server?',
        a: 'No. The JSON is parsed locally in your browser, so the payload is not uploaded or stored.',
      },
    ],
  },
  {
    slug: 'json-syntax-checker',
    group: 'json',
    title: 'JSON Syntax Checker — Find JSON Errors Online',
    description:
      'Check JSON syntax online and find errors fast. Paste JSON to catch missing quotes, trailing commas, bad brackets and other parse issues with line and column details.',
    h1: 'JSON Syntax Checker',
    intro:
      'Use this JSON syntax checker when a config file, API body or webhook payload will not parse. It flags invalid JSON with a focused error message and location, then formats the result once it is valid.',
    sections: [
      {
        h2: 'Designed for quick syntax checks',
        html: '<p>JSON is strict: keys need double quotes, commas cannot trail after the last item, and brackets must match exactly. A syntax checker catches those small mistakes before they break a request, deployment or import job.</p>',
      },
      {
        h2: 'Validate, then clean up the result',
        html: '<p>After the syntax is valid, switch indentation between 2 spaces, 4 spaces or tabs, or minify the same JSON for a compact payload. The validation and formatting happen in the same browser-only tool.</p>',
      },
    ],
    faq: [
      {
        q: 'Can it find the exact JSON syntax error?',
        a: 'It reports the parser message and, when available, the line and column where the JSON parser detected the problem.',
      },
      {
        q: 'What JSON mistakes does it catch?',
        a: 'It catches standard JSON syntax errors such as trailing commas, single-quoted strings, unquoted keys, mismatched brackets and unescaped control characters.',
      },
    ],
  },
  {
    slug: 'json-file-viewer',
    group: 'json',
    title: 'JSON File Viewer — Open & Format .json Files Online',
    description:
      'View JSON files online without installing an app. Upload or paste a .json file to validate, format, syntax-highlight and download clean JSON. Private, in-browser.',
    h1: 'JSON File Viewer',
    intro:
      'Open a .json file in your browser and turn it into readable, syntax-highlighted output. Upload the file or paste its contents, then format, validate, copy or download the cleaned JSON.',
    sections: [
      {
        h2: 'Read a JSON file without an editor',
        html: '<p>Many systems export settings, backups and API examples as <code>.json</code> files. This viewer expands nested objects and arrays with indentation so you can inspect the data without installing a dedicated JSON editor.</p>',
      },
      {
        h2: 'Local file handling',
        html: '<p>The file is read by your browser and processed on the page. You can choose a spacing style, minify the content, or download the formatted result as a new <code>.json</code> file when you are done.</p>',
      },
    ],
    faq: [
      {
        q: 'Can I upload a .json file?',
        a: 'Yes. Use the upload button to load a .json or text file into the viewer, then format or minify it.',
      },
      {
        q: 'Is the uploaded JSON file sent anywhere?',
        a: 'No. The file is read and processed locally in your browser; it is not uploaded to a server.',
      },
    ],
  },

  // ---------------- Diff 意图簇（复用 DiffTool：两段文本对比） ----------------
  {
    slug: 'text-compare',
    group: 'diff',
    title: 'Text Compare — Find the Difference Between Two Texts',
    description:
      'Compare two blocks of text online for free. Paste both versions to see added, removed and changed lines highlighted instantly, with word-level detail. In-browser.',
    h1: 'Text Compare Tool',
    intro:
      'Paste two versions of any text and instantly see what changed between them. Added and removed lines are color-coded, and modified lines show exactly which words differ.',
    sections: [
      {
        h2: 'Spot every change at a glance',
        html: '<p>Comparing two versions by eye is slow and error-prone. This tool aligns the texts line by line and highlights the differences, so a moved sentence, a deleted clause or a single changed number is immediately obvious.</p>',
      },
      {
        h2: 'Down to the word',
        html: '<p>When a line is edited rather than added or removed, the specific words that changed are marked inside the line — so you see the substance of the edit, not just that the line is different.</p>',
      },
    ],
    faq: [
      {
        q: 'Can I compare two paragraphs of text?',
        a: 'Yes. Paste each version into a panel and the tool highlights added, removed and changed lines, with the changed words marked inside modified lines.',
      },
      {
        q: 'Is my text kept private?',
        a: 'Yes. The comparison runs entirely in your browser and nothing is uploaded unless you deliberately create a shareable link.',
      },
    ],
  },
  {
    slug: 'diff-checker',
    group: 'diff',
    title: 'Diff Checker Online — Compare Text & Code Differences',
    description:
      'A free online diff checker. Paste an original and a modified version to compare differences line by line, with split and unified views. Runs in your browser.',
    h1: 'Online Diff Checker',
    intro:
      'Check the difference between two texts or code snippets in seconds. Paste the original and the modified version to get a clear, color-coded diff with both split and unified views.',
    sections: [
      {
        h2: 'Two ways to read a diff',
        html: '<p>Use the <strong>Split</strong> view to see the old and new versions side by side, or the <strong>Unified</strong> view to read the changes inline the way a code review or <code>git diff</code> presents them. Switch anytime without re-pasting.</p>',
      },
      {
        h2: 'Made for reviewing changes',
        html: '<p>Whether you are checking an edit to a config file, a contract clause or a block of code, the diff checker makes the exact change unmistakable so nothing slips through review.</p>',
      },
    ],
    faq: [
      {
        q: 'What is the difference between split and unified view?',
        a: 'Split view shows the two versions side by side in separate columns; unified view lists the changes inline with + and − markers, like a git diff.',
      },
      {
        q: 'Can I use it to compare code?',
        a: 'Yes. It compares any plain text line by line, including source code, and highlights the changed lines and words.',
      },
    ],
  },
  {
    slug: 'compare-two-files',
    group: 'diff',
    title: 'Compare Two Files Online — Highlight Text Differences',
    description:
      'Compare two files online by pasting their contents. See added, removed and modified lines highlighted side by side. Free, private, no upload required.',
    h1: 'Compare Two Files',
    intro:
      'Paste the contents of two files to compare them line by line. Differences are highlighted so you can quickly see what was added, deleted or changed between the two versions.',
    sections: [
      {
        h2: 'No upload, just paste',
        html: '<p>You do not need to upload anything or install a desktop diff app. Copy the text of each file into a panel and the comparison appears instantly, right in your browser.</p>',
      },
      {
        h2: 'Ignore noise, focus on real changes',
        html: '<p>Toggle <strong>Ignore whitespace</strong> and <strong>Ignore case</strong> to filter out formatting-only differences, so you see the changes that actually matter rather than reindented lines.</p>',
      },
    ],
    faq: [
      {
        q: 'Do I upload the files?',
        a: 'No. You paste the contents of each file, and the comparison runs locally in your browser — nothing is uploaded.',
      },
      {
        q: 'Can I ignore whitespace-only differences?',
        a: 'Yes. Turn on Ignore whitespace to skip differences that are only about spacing or indentation.',
      },
    ],
  },
  {
    slug: 'compare-text-online',
    group: 'diff',
    title: 'Compare Text Online — Free Side-by-Side Text Comparison',
    description:
      'Compare text online free with a side-by-side view. Paste two versions and highlight every difference, including changed words. No sign-up, in your browser.',
    h1: 'Compare Text Online',
    intro:
      'A fast, free way to compare text online. Paste two versions side by side and see every addition, deletion and edit highlighted, with the changed words marked inside each modified line.',
    sections: [
      {
        h2: 'Side-by-side clarity',
        html: '<p>The side-by-side layout keeps the original and the revision aligned, so you can track exactly how the text evolved without scrolling back and forth or losing your place.</p>',
      },
      {
        h2: 'Free and private',
        html: '<p>There is no account and no upload. Your text is compared in the browser, and it only leaves your device if you choose to copy a shareable link.</p>',
      },
    ],
    faq: [
      {
        q: 'Is it really free?',
        a: 'Yes. Comparing text is completely free, with no sign-up and no limits, and it runs entirely in your browser.',
      },
      {
        q: 'Does it highlight changed words within a line?',
        a: 'Yes. Modified lines show the exact words that were added or removed, not just that the line changed.',
      },
    ],
  },
  {
    slug: 'json-diff',
    group: 'diff',
    title: 'JSON Diff — Compare Two JSON Files or Objects Online',
    description:
      'Compare two JSON snippets online. Paste both versions to see added, removed and changed lines highlighted. Format your JSON first for the clearest diff. In-browser.',
    h1: 'JSON Diff',
    intro:
      'Compare two JSON documents side by side and see exactly which fields and values changed. For the clearest results, beautify each version first so the diff aligns key by key.',
    sections: [
      {
        h2: 'See what changed between two JSON versions',
        html: '<p>API responses and config files change subtly — a flipped boolean, a renamed key, an added array item. Pasting both versions here highlights those changes line by line so you can pinpoint them without reading every field.</p>',
      },
      {
        h2: 'Tip: beautify before you diff',
        html: '<p>Minified JSON diffs poorly because everything sits on one line. Run each side through the <a href="/json-beautifier">JSON beautifier</a> first so every key is on its own line, then paste the formatted versions here for a clean, readable diff.</p>',
      },
    ],
    faq: [
      {
        q: 'How do I compare two JSON objects?',
        a: 'Paste each JSON version into a panel. For the clearest diff, beautify both first so each key sits on its own line and changes align neatly.',
      },
      {
        q: 'Does it understand JSON structure?',
        a: 'It compares the text line by line rather than parsing the object tree, so formatting each side first gives the most accurate, readable result.',
      },
    ],
  },
  {
    slug: 'side-by-side-diff',
    group: 'diff',
    title: 'Side-by-Side Diff — Compare Two Texts Visually',
    description:
      'Compare two texts in a side-by-side diff view. Paste the original and changed version to highlight added, removed and edited lines with word-level changes.',
    h1: 'Side-by-Side Diff',
    intro:
      'Paste an original version and a changed version to see them aligned side by side. Added, removed and modified lines are highlighted so you can review changes without losing your place.',
    sections: [
      {
        h2: 'Keep both versions in view',
        html: '<p>A side-by-side diff is ideal when context matters. The original stays on the left, the changed text stays on the right, and matching lines remain aligned so edits are easy to scan in order.</p>',
      },
      {
        h2: 'Switch views when needed',
        html: '<p>Use the split view for visual comparison, then switch to unified view if you want a compact review-style diff. Ignore whitespace or case when formatting noise is getting in the way.</p>',
      },
    ],
    faq: [
      {
        q: 'What is a side-by-side diff?',
        a: 'A side-by-side diff places the original text and changed text in two aligned columns so additions, deletions and edits can be reviewed visually.',
      },
      {
        q: 'Can I ignore whitespace in the side-by-side diff?',
        a: 'Yes. Turn on Ignore whitespace to reduce spacing-only changes and focus on edits that change the text itself.',
      },
    ],
  },
  {
    slug: 'code-diff-online',
    group: 'diff',
    title: 'Code Diff Online — Compare Code Snippets Free',
    description:
      'Compare code snippets online with a free diff tool. Paste two versions to highlight added, removed and changed lines, with split and unified views.',
    h1: 'Code Diff Online',
    intro:
      'Compare two versions of a code snippet without opening Git or an IDE. Paste the old code and the new code to see changed lines and edited words highlighted clearly.',
    sections: [
      {
        h2: 'Review small code changes fast',
        html: '<p>For a quick snippet, config block or generated file, a full repository diff can be more setup than you need. This code diff tool compares plain text line by line, which works well for JavaScript, JSON, HTML, CSS, YAML and other code-like formats.</p>',
      },
      {
        h2: 'Useful before committing or sharing',
        html: '<p>Paste a before-and-after version to verify that only the intended lines changed. The unified view reads like a lightweight code review, while split view keeps both versions aligned for careful inspection.</p>',
      },
    ],
    faq: [
      {
        q: 'Does this code diff tool require a Git repository?',
        a: 'No. It compares whatever code or plain text you paste into the two panels, so no repository or command line is required.',
      },
      {
        q: 'Which programming languages can it compare?',
        a: 'It compares plain text, so it works with any language or code-like file where line-by-line differences are useful.',
      },
    ],
  },
  {
    slug: 'whitespace-diff-checker',
    group: 'diff',
    title: 'Whitespace Diff Checker — Ignore Spacing Differences',
    description:
      'Compare two texts while ignoring whitespace differences. Paste both versions to focus on meaningful edits instead of indentation, spacing or wrapping changes.',
    h1: 'Whitespace Diff Checker',
    intro:
      'When formatting changes bury the real edit, turn on Ignore whitespace and compare again. The diff focuses on meaningful text changes instead of indentation, extra spaces or line-level spacing noise.',
    sections: [
      {
        h2: 'Filter out formatting-only noise',
        html: '<p>Reformatting a file can make every line look changed even when the content barely moved. Ignoring whitespace helps you review the substance of the edit without being distracted by indentation or spacing differences.</p>',
      },
      {
        h2: 'Pair it with case-insensitive comparison',
        html: '<p>If capitalization is also irrelevant for your review, enable Ignore case too. The comparison updates immediately, so you can decide whether a difference is meaningful for the text you are checking.</p>',
      },
    ],
    faq: [
      {
        q: 'Can I compare text while ignoring whitespace?',
        a: 'Yes. Enable Ignore whitespace to reduce differences caused only by spacing and indentation.',
      },
      {
        q: 'Does ignoring whitespace change my original text?',
        a: 'No. It only changes how differences are detected and displayed; the text you pasted remains unchanged.',
      },
    ],
  },
];

/** 同组（同工具）的其它落地页，用于页内互链（排除自己）。 */
export function relatedLandings(slug: string, group: ToolGroup): Landing[] {
  return LANDINGS.filter((l) => l.group === group && l.slug !== slug);
}

/** 每个 group 对应的主工具页，用于内链回主页面。 */
export const GROUP_HOME: Record<ToolGroup, { href: string; label: string }> = {
  prompt: { href: '/prompt/', label: 'AI Prompt Formatter' },
  markdown: { href: '/markdown/', label: 'Markdown Formatter' },
  html: { href: '/html/', label: 'HTML Viewer & Formatter' },
  json: { href: '/json/', label: 'JSON Formatter & Validator' },
  diff: { href: '/diff/', label: 'Text Diff Checker' },
};
