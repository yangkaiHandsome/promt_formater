// 零依赖的文本对比：行级 LCS 对齐，对「替换行」再做词级高亮。
// 输入正常大小的文本足够快；超大输入有规模保护，避免 O(n·m) 内存爆掉。

export type RowType = 'equal' | 'insert' | 'delete' | 'replace';

export interface DiffRow {
  type: RowType;
  /** 左（原文）行内容与行号；insert 行为 null */
  left: string | null;
  leftNo: number | null;
  /** 右（改文）行内容与行号；delete 行为 null */
  right: string | null;
  rightNo: number | null;
  /** replace 行的词级高亮 HTML（已转义），其它行为 null */
  leftHtml: string | null;
  rightHtml: string | null;
}

export interface DiffStats {
  additions: number;
  deletions: number;
}

export interface DiffOptions {
  ignoreCase: boolean;
  ignoreWhitespace: boolean;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function normalize(line: string, opts: DiffOptions): string {
  let out = line;
  if (opts.ignoreWhitespace) out = out.replace(/\s+/g, ' ').trim();
  if (opts.ignoreCase) out = out.toLowerCase();
  return out;
}

type Op = { type: 'equal' | 'insert' | 'delete'; a?: string; b?: string };

// 对两个 token 数组做 LCS，回溯出编辑序列（equal / delete(左) / insert(右)）。
function lcsOps(a: string[], b: string[], keyA: string[], keyB: string[]): Op[] {
  const n = a.length;
  const m = b.length;

  // 规模保护：超大输入退化为「全删+全增」，避免 DP 表撑爆内存。
  if (n * m > 4_000_000) {
    return [
      ...a.map((x) => ({ type: 'delete' as const, a: x })),
      ...b.map((x) => ({ type: 'insert' as const, b: x })),
    ];
  }

  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = keyA[i] === keyB[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const ops: Op[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (keyA[i] === keyB[j]) {
      ops.push({ type: 'equal', a: a[i], b: b[j] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ type: 'delete', a: a[i] });
      i++;
    } else {
      ops.push({ type: 'insert', b: b[j] });
      j++;
    }
  }
  while (i < n) ops.push({ type: 'delete', a: a[i++] });
  while (j < m) ops.push({ type: 'insert', b: b[j++] });
  return ops;
}

// 把一行按「单词 + 分隔符」切成 token，用于行内词级对比。
function tokenizeWords(line: string): string[] {
  return line.match(/\s+|[^\s]+/g) ?? [];
}

// 对一对被判定为「替换」的行做词级 diff，返回两侧高亮 HTML。
function wordDiff(left: string, right: string, opts: DiffOptions): [string, string] {
  const a = tokenizeWords(left);
  const b = tokenizeWords(right);
  const keyA = a.map((t) => normalize(t, opts));
  const keyB = b.map((t) => normalize(t, opts));
  const ops = lcsOps(a, b, keyA, keyB);

  let leftHtml = '';
  let rightHtml = '';
  for (const op of ops) {
    if (op.type === 'equal') {
      leftHtml += escapeHtml(op.a!);
      rightHtml += escapeHtml(op.b!);
    } else if (op.type === 'delete') {
      leftHtml += `<mark class="diff-word-del">${escapeHtml(op.a!)}</mark>`;
    } else {
      rightHtml += `<mark class="diff-word-add">${escapeHtml(op.b!)}</mark>`;
    }
  }
  return [leftHtml, rightHtml];
}

export function diffLines(
  original: string,
  changed: string,
  opts: DiffOptions,
): { rows: DiffRow[]; stats: DiffStats } {
  const a = original.split('\n');
  const b = changed.split('\n');
  const keyA = a.map((l) => normalize(l, opts));
  const keyB = b.map((l) => normalize(l, opts));
  const ops = lcsOps(a, b, keyA, keyB);

  const rows: DiffRow[] = [];
  let leftNo = 1;
  let rightNo = 1;
  let additions = 0;
  let deletions = 0;

  // 把连续的 delete/insert 配对成 replace 行（同一行左右对照 + 词级高亮），
  // 多出来的单侧仍作纯 delete / insert。
  let pendingDel: string[] = [];
  let pendingIns: string[] = [];

  const flush = () => {
    const pairs = Math.min(pendingDel.length, pendingIns.length);
    for (let k = 0; k < pairs; k++) {
      const [lHtml, rHtml] = wordDiff(pendingDel[k], pendingIns[k], opts);
      rows.push({
        type: 'replace',
        left: pendingDel[k],
        leftNo: leftNo++,
        right: pendingIns[k],
        rightNo: rightNo++,
        leftHtml: lHtml,
        rightHtml: rHtml,
      });
      deletions++;
      additions++;
    }
    for (let k = pairs; k < pendingDel.length; k++) {
      rows.push({
        type: 'delete',
        left: pendingDel[k],
        leftNo: leftNo++,
        right: null,
        rightNo: null,
        leftHtml: null,
        rightHtml: null,
      });
      deletions++;
    }
    for (let k = pairs; k < pendingIns.length; k++) {
      rows.push({
        type: 'insert',
        left: null,
        leftNo: null,
        right: pendingIns[k],
        rightNo: rightNo++,
        leftHtml: null,
        rightHtml: null,
      });
      additions++;
    }
    pendingDel = [];
    pendingIns = [];
  };

  for (const op of ops) {
    if (op.type === 'equal') {
      flush();
      rows.push({
        type: 'equal',
        left: op.a!,
        leftNo: leftNo++,
        right: op.b!,
        rightNo: rightNo++,
        leftHtml: null,
        rightHtml: null,
      });
    } else if (op.type === 'delete') {
      pendingDel.push(op.a!);
    } else {
      pendingIns.push(op.b!);
    }
  }
  flush();

  return { rows, stats: { additions, deletions } };
}
