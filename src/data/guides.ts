export const GUIDES = [
  {
    href: '/guides/format-openai-prompt-logs/',
    title: 'How to Format OpenAI Prompt Logs for Debugging',
    description:
      'Separate roles, unescape content, inspect tool calls and pretty-print JSON without uploading sensitive logs.',
  },
  {
    href: '/guides/how-to-fix-invalid-json/',
    title: 'How to Fix Invalid JSON',
    description:
      'Find common JSON mistakes such as trailing commas, bad quotes, unescaped line breaks and mismatched brackets.',
  },
  {
    href: '/guides/preview-markdown-before-github/',
    title: 'Preview Markdown Before GitHub',
    description:
      'Check README structure, code fences, tables, links and images before you commit or publish docs.',
  },
  {
    href: '/guides/debug-llm-request-payload/',
    title: 'How to Debug an LLM Request Payload',
    description:
      'Trace message order, hidden instructions, tool arguments and serialization mistakes in OpenAI- and Claude-style request logs.',
  },
  {
    href: '/guides/redact-secrets-from-prompt-logs/',
    title: 'How to Redact Secrets From Prompt Logs',
    description:
      'A practical checklist for removing API keys, personal data and internal identifiers before sharing an LLM debugging trace.',
  },
] as const;
