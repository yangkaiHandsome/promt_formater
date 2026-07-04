// 把 OpenAI / Anthropic 的「LLM 请求日志(JSON dump)」归一化成统一的会话结构，
// 供 PromptTool 以「会话视图」渲染。纯函数、无副作用、任何异常都吞掉返回 null，
// 不识别时让调用方回落到按行的通用格式化。
//
// 支持三种请求体：
//   - OpenAI Responses API   (POST /v1/responses)：instructions + input[] + tools[{type,name,parameters}]
//   - OpenAI Chat Completions(POST /v1/chat/completions)：messages[] + tools[{type,function}]
//   - Anthropic Messages     (POST /v1/messages)：system + messages[] + tools[{name,input_schema}]
//
// 输入既可以是「整条日志」(外层含 request.body)，也可以是「裸请求体」，
// 甚至前面带时间戳/级别前缀的一行——都能抽出第一个可解析的 JSON 对象。

export type ProviderKind = 'openai-responses' | 'openai-chat' | 'anthropic';

export type NormPart =
  | { kind: 'text'; text: string }
  | { kind: 'tool_call'; id?: string; name: string; args: unknown }
  | { kind: 'tool_result'; id?: string; content: unknown; isError?: boolean }
  | { kind: 'other'; label: string; value: unknown };

export interface NormMessage {
  role: string;
  parts: NormPart[];
}

export interface NormTool {
  name: string;
  description?: string;
  schema?: unknown;
}

export interface NormParam {
  key: string;
  value: string;
}

export interface NormalizedRequest {
  provider: string; // 展示用标签，如 "OpenAI · Responses API"
  providerKind: ProviderKind;
  endpoint?: string;
  model?: string;
  params: NormParam[];
  system: string[];
  messages: NormMessage[];
  tools: NormTool[];
  responseFormat?: { name?: string; schema: unknown };
  metadata?: unknown;
}

const PROVIDER_LABEL: Record<ProviderKind, string> = {
  'openai-responses': 'OpenAI · Responses API',
  'openai-chat': 'OpenAI · Chat Completions',
  anthropic: 'Anthropic · Messages API',
};

// 展示哪些顶层采样/控制参数（按此顺序），其余忽略
const PARAM_KEYS = [
  'temperature',
  'top_p',
  'top_k',
  'max_tokens',
  'max_output_tokens',
  'max_completion_tokens',
  'stream',
  'parallel_tool_calls',
  'tool_choice',
  'presence_penalty',
  'frequency_penalty',
  'reasoning_effort',
  'seed',
  'service_tier',
];

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

// 从任意字符串里抽出第一个「括号平衡」的顶层 JSON 对象（跳过前缀日志），解析失败返回 null
function extractJsonObject(raw: string): unknown | null {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    /* 继续尝试子串扫描 */
  }
  const start = trimmed.indexOf('{');
  if (start === -1) return null;
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(trimmed.slice(start, i + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

// 定位真正的请求体 + 拿到 provider / endpoint 提示
function locateBody(root: unknown): {
  body: Record<string, unknown>;
  hint?: string;
  endpoint?: string;
} | null {
  if (!isObj(root)) return null;
  // 整条日志：{..., provider, request:{url, body:{...}}}
  const request = root.request;
  if (isObj(request) && isObj(request.body)) {
    return {
      body: request.body,
      hint: typeof root.provider === 'string' ? root.provider : undefined,
      endpoint: typeof request.url === 'string' ? request.url : undefined,
    };
  }
  // {..., body:{...}}
  if (isObj(root.body) && (Array.isArray(root.body.messages) || 'input' in root.body)) {
    return {
      body: root.body,
      hint: typeof root.provider === 'string' ? root.provider : undefined,
      endpoint: typeof root.url === 'string' ? root.url : undefined,
    };
  }
  // 裸请求体
  if (Array.isArray(root.messages) || 'input' in root) {
    return { body: root, hint: typeof root.provider === 'string' ? root.provider : undefined };
  }
  return null;
}

function detectKind(
  body: Record<string, unknown>,
  hint?: string,
  endpoint?: string,
): ProviderKind | null {
  const url = (endpoint ?? '').toLowerCase();
  const h = (hint ?? '').toLowerCase();

  if (Array.isArray(body.input) || typeof body.input === 'string') return 'openai-responses';
  if (url.includes('/responses')) return 'openai-responses';

  if (Array.isArray(body.messages)) {
    if (h.includes('anthropic') || url.includes('anthropic')) return 'anthropic';
    if ('system' in body) return 'anthropic';
    if (Array.isArray(body.tools) && body.tools.some((t) => isObj(t) && 'input_schema' in t)) {
      return 'anthropic';
    }
    const hasAnthropicBlocks = body.messages.some(
      (m) =>
        isObj(m) &&
        Array.isArray(m.content) &&
        m.content.some((b) => isObj(b) && (b.type === 'tool_use' || b.type === 'tool_result')),
    );
    if (hasAnthropicBlocks) return 'anthropic';
    return 'openai-chat';
  }
  return null;
}

function extractParams(body: Record<string, unknown>): NormParam[] {
  const out: NormParam[] = [];
  for (const key of PARAM_KEYS) {
    const v = body[key];
    if (v === undefined || v === null) continue;
    if (typeof v === 'object') {
      out.push({ key, value: JSON.stringify(v) });
    } else {
      out.push({ key, value: String(v) });
    }
  }
  return out;
}

// 把可能是 string / {type:'text',text} / 数组 的内容压成纯文本
function contentToText(content: unknown): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((b) => {
        if (typeof b === 'string') return b;
        if (isObj(b) && typeof b.text === 'string') return b.text;
        return '';
      })
      .filter(Boolean)
      .join('\n');
  }
  if (isObj(content) && typeof content.text === 'string') return content.text;
  return '';
}

function pushText(parts: NormPart[], text: string) {
  if (text && text.trim()) parts.push({ kind: 'text', text });
}

// ---- Anthropic ----
function normalizeAnthropic(body: Record<string, unknown>): NormalizedRequest {
  const system: string[] = [];
  const sys = body.system;
  if (typeof sys === 'string') {
    if (sys.trim()) system.push(sys);
  } else if (Array.isArray(sys)) {
    for (const b of sys) {
      const t = typeof b === 'string' ? b : isObj(b) && typeof b.text === 'string' ? b.text : '';
      if (t.trim()) system.push(t);
    }
  }

  const messages: NormMessage[] = [];
  if (Array.isArray(body.messages)) {
    for (const m of body.messages) {
      if (!isObj(m)) continue;
      const role = typeof m.role === 'string' ? m.role : 'user';
      const parts: NormPart[] = [];
      const content = m.content;
      if (typeof content === 'string') {
        pushText(parts, content);
      } else if (Array.isArray(content)) {
        for (const b of content) {
          if (!isObj(b)) continue;
          if (b.type === 'text') pushText(parts, typeof b.text === 'string' ? b.text : '');
          else if (b.type === 'tool_use') {
            parts.push({
              kind: 'tool_call',
              id: typeof b.id === 'string' ? b.id : undefined,
              name: typeof b.name === 'string' ? b.name : 'tool',
              args: b.input,
            });
          } else if (b.type === 'tool_result') {
            parts.push({
              kind: 'tool_result',
              id: typeof b.tool_use_id === 'string' ? b.tool_use_id : undefined,
              content: b.content,
              isError: b.is_error === true,
            });
          } else if (b.type === 'thinking') {
            pushText(parts, typeof b.thinking === 'string' ? b.thinking : '');
          } else if (b.type === 'image') {
            parts.push({ kind: 'other', label: 'image', value: b.source ?? b });
          } else {
            parts.push({ kind: 'other', label: String(b.type ?? 'block'), value: b });
          }
        }
      }
      if (parts.length) messages.push({ role, parts });
    }
  }

  return {
    provider: PROVIDER_LABEL.anthropic,
    providerKind: 'anthropic',
    model: typeof body.model === 'string' ? body.model : undefined,
    params: extractParams(body),
    system,
    messages,
    tools: normalizeTools(body.tools, 'anthropic'),
    metadata: body.metadata,
  };
}

// ---- OpenAI Responses ----
function normalizeOpenAIResponses(body: Record<string, unknown>): NormalizedRequest {
  const system: string[] = [];
  if (typeof body.instructions === 'string' && body.instructions.trim()) {
    system.push(body.instructions);
  }

  const messages: NormMessage[] = [];
  const input = body.input;

  const pushMsg = (role: string, parts: NormPart[]) => {
    if (parts.length) messages.push({ role, parts });
  };

  if (typeof input === 'string') {
    pushMsg('user', input.trim() ? [{ kind: 'text', text: input }] : []);
  } else if (Array.isArray(input)) {
    for (const item of input) {
      if (!isObj(item)) continue;
      // 顶层的工具调用 / 工具输出项（不包在 message 里）
      if (item.type === 'function_call') {
        pushMsg('assistant', [
          {
            kind: 'tool_call',
            id: typeof item.call_id === 'string' ? item.call_id : undefined,
            name: typeof item.name === 'string' ? item.name : 'tool',
            args: item.arguments,
          },
        ]);
        continue;
      }
      if (item.type === 'function_call_output') {
        pushMsg('tool', [
          {
            kind: 'tool_result',
            id: typeof item.call_id === 'string' ? item.call_id : undefined,
            content: item.output,
          },
        ]);
        continue;
      }
      if (item.type === 'reasoning') {
        pushMsg('assistant', [{ kind: 'other', label: 'reasoning', value: item }]);
        continue;
      }
      // 普通消息项：{role, content:[{type:input_text|output_text|text, text}]}
      const role = typeof item.role === 'string' ? item.role : 'user';
      const parts: NormPart[] = [];
      const content = item.content;
      if (typeof content === 'string') {
        pushText(parts, content);
      } else if (Array.isArray(content)) {
        for (const c of content) {
          if (typeof c === 'string') {
            pushText(parts, c);
          } else if (isObj(c)) {
            if (c.type === 'input_text' || c.type === 'output_text' || c.type === 'text') {
              pushText(parts, typeof c.text === 'string' ? c.text : '');
            } else if (c.type === 'input_image' || c.type === 'output_image') {
              parts.push({ kind: 'other', label: 'image', value: c });
            } else {
              parts.push({ kind: 'other', label: String(c.type ?? 'block'), value: c });
            }
          }
        }
      }
      pushMsg(role, parts);
    }
  }

  let responseFormat: NormalizedRequest['responseFormat'];
  const format = isObj(body.text) ? body.text.format : undefined;
  if (isObj(format) && format.type === 'json_schema') {
    responseFormat = {
      name: typeof format.name === 'string' ? format.name : undefined,
      schema: format.schema,
    };
  }

  return {
    provider: PROVIDER_LABEL['openai-responses'],
    providerKind: 'openai-responses',
    model: typeof body.model === 'string' ? body.model : undefined,
    params: extractParams(body),
    system,
    messages,
    tools: normalizeTools(body.tools, 'openai-responses'),
    responseFormat,
    metadata: body.metadata,
  };
}

// ---- OpenAI Chat Completions ----
function normalizeOpenAIChat(body: Record<string, unknown>): NormalizedRequest {
  const system: string[] = [];
  const messages: NormMessage[] = [];

  if (Array.isArray(body.messages)) {
    for (const m of body.messages) {
      if (!isObj(m)) continue;
      const role = typeof m.role === 'string' ? m.role : 'user';
      if (role === 'system' || role === 'developer') {
        const t = contentToText(m.content);
        if (t.trim()) system.push(t);
        continue;
      }
      const parts: NormPart[] = [];
      if (role === 'tool') {
        parts.push({
          kind: 'tool_result',
          id: typeof m.tool_call_id === 'string' ? m.tool_call_id : undefined,
          content: m.content,
        });
        messages.push({ role, parts });
        continue;
      }
      pushText(parts, contentToText(m.content));
      if (Array.isArray(m.tool_calls)) {
        for (const tc of m.tool_calls) {
          if (!isObj(tc)) continue;
          const fn = isObj(tc.function) ? tc.function : {};
          parts.push({
            kind: 'tool_call',
            id: typeof tc.id === 'string' ? tc.id : undefined,
            name: typeof fn.name === 'string' ? fn.name : 'tool',
            args: fn.arguments,
          });
        }
      }
      if (parts.length) messages.push({ role, parts });
    }
  }

  let responseFormat: NormalizedRequest['responseFormat'];
  const rf = body.response_format;
  if (isObj(rf) && rf.type === 'json_schema' && isObj(rf.json_schema)) {
    responseFormat = {
      name: typeof rf.json_schema.name === 'string' ? rf.json_schema.name : undefined,
      schema: rf.json_schema.schema ?? rf.json_schema,
    };
  }

  return {
    provider: PROVIDER_LABEL['openai-chat'],
    providerKind: 'openai-chat',
    model: typeof body.model === 'string' ? body.model : undefined,
    params: extractParams(body),
    system,
    messages,
    tools: normalizeTools(body.tools, 'openai-chat'),
    responseFormat,
    metadata: body.metadata,
  };
}

function normalizeTools(tools: unknown, kind: ProviderKind): NormTool[] {
  if (!Array.isArray(tools)) return [];
  const out: NormTool[] = [];
  for (const t of tools) {
    if (!isObj(t)) continue;
    if (kind === 'anthropic') {
      out.push({
        name: typeof t.name === 'string' ? t.name : 'tool',
        description: typeof t.description === 'string' ? t.description : undefined,
        schema: t.input_schema,
      });
    } else if (kind === 'openai-chat') {
      const fn = isObj(t.function) ? t.function : t;
      out.push({
        name: typeof fn.name === 'string' ? fn.name : 'tool',
        description: typeof fn.description === 'string' ? fn.description : undefined,
        schema: fn.parameters,
      });
    } else {
      // openai-responses：工具是扁平的 {type:'function', name, description, parameters}
      out.push({
        name: typeof t.name === 'string' ? t.name : 'tool',
        description: typeof t.description === 'string' ? t.description : undefined,
        schema: t.parameters,
      });
    }
  }
  return out;
}

export function parseLlmRequest(raw: string): NormalizedRequest | null {
  if (!raw || !raw.trim()) return null;
  const root = extractJsonObject(raw);
  if (root === null) return null;
  const located = locateBody(root);
  if (!located) return null;

  const kind = detectKind(located.body, located.hint, located.endpoint);
  if (!kind) return null;

  let normalized: NormalizedRequest;
  if (kind === 'anthropic') normalized = normalizeAnthropic(located.body);
  else if (kind === 'openai-responses') normalized = normalizeOpenAIResponses(located.body);
  else normalized = normalizeOpenAIChat(located.body);

  normalized.endpoint = located.endpoint;
  // 完全空的结果视为未识别，交回按行格式化
  if (normalized.system.length === 0 && normalized.messages.length === 0) return null;
  return normalized;
}

// 供渲染层使用：把值渲染成 { json } 或 { text }
export function asDisplayValue(value: unknown): { json?: string; text?: string } {
  if (value === undefined || value === null) return { text: '' };
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (/^[[{]/.test(trimmed)) {
      try {
        return { json: JSON.stringify(JSON.parse(trimmed), null, 2) };
      } catch {
        /* 当普通文本 */
      }
    }
    return { text: value };
  }
  try {
    return { json: JSON.stringify(value, null, 2) };
  } catch {
    return { text: String(value) };
  }
}

// 复制用的可读纯文本
export function requestToPlainText(req: NormalizedRequest): string {
  const lines: string[] = [];
  lines.push(`# ${req.provider}${req.model ? ` · ${req.model}` : ''}`);
  if (req.params.length) {
    lines.push(req.params.map((p) => `${p.key}=${p.value}`).join('  '));
  }
  for (const s of req.system) {
    lines.push('', 'SYSTEM:', s);
  }
  for (const m of req.messages) {
    lines.push('', `${m.role.toUpperCase()}:`);
    for (const p of m.parts) {
      if (p.kind === 'text') lines.push(p.text);
      else if (p.kind === 'tool_call') {
        const { json, text } = asDisplayValue(p.args);
        lines.push(`↳ tool_call ${p.name}${p.id ? ` (${p.id})` : ''}`, json ?? text ?? '');
      } else if (p.kind === 'tool_result') {
        const { json, text } = asDisplayValue(p.content);
        lines.push(`↳ tool_result${p.id ? ` (${p.id})` : ''}`, json ?? text ?? '');
      } else {
        lines.push(`↳ ${p.label}`);
      }
    }
  }
  if (req.tools.length) {
    lines.push('', `# Tools (${req.tools.length})`);
    for (const t of req.tools) {
      lines.push(`- ${t.name}${t.description ? `: ${t.description}` : ''}`);
    }
  }
  if (req.responseFormat) {
    lines.push('', `# Response format${req.responseFormat.name ? `: ${req.responseFormat.name}` : ''}`);
  }
  return lines.join('\n').trim();
}
