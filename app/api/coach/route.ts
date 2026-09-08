import { env } from 'cloudflare:workers';
import { z } from 'zod';
import { problems, type Problem } from '@/app/content';
import { getRequestIdentity, sameOrigin } from '@/lib/auth';
import { ensureProgressSchema } from '@/lib/db';
import { problemSchema } from '@/lib/problem-schema';
import { consumeRequestLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const requestSchema = z.object({
  problemId: z.number().int().positive().max(999999),
  mode: z.enum(['analyze', 'concept', 'recommend']),
  source: z.string().max(60000),
  judgeMessage: z.string().max(5000).default(''),
  fileCount: z.number().int().min(1).max(10).default(1),
  learning: z.object({
    solved: z.number().int().min(0).max(100000),
    wrong: z.number().int().min(0).max(100000),
    submissions: z.number().int().min(0).max(1000000),
    accuracy: z.number().min(0).max(100),
  }).strict(),
}).strict();

async function findProblem(id: number): Promise<Problem | null> {
  const builtIn = problems.find((problem) => problem.id === id);
  if (builtIn) return builtIn;
  const db = await ensureProgressSchema();
  const row = await db.prepare('SELECT data_json FROM custom_problems WHERE id = ? AND active = 1').bind(id).first<{ data_json: string }>();
  if (!row) return null;
  try {
    return problemSchema.parse(JSON.parse(row.data_json));
  } catch {
    return null;
  }
}

function localCoach(problem: Problem, data: z.infer<typeof requestSchema>) {
  if (data.mode === 'concept') {
    return `${problem.explanation}\n\n先自己重述題目的輸入、輸出與限制，再從「${problem.hints[0]}」開始驗證最小範例。`;
  }
  if (data.mode === 'recommend') {
    const pace = data.learning.solved === 0 ? '先完成一題簡單題建立節奏' : data.learning.accuracy < 60 ? '先重做錯題並只改一個假設' : '嘗試同路線的下一題並比較時間複雜度';
    return `你目前完成 ${data.learning.solved} 題、正確率 ${Math.round(data.learning.accuracy)}%。建議：${pace}。這一題可先檢查「${problem.hints[0]}」，完成後再練 ${problem.track || problem.topic}。`;
  }

  const message = data.judgeMessage.toLowerCase();
  let diagnosis = '目前沒有足夠的執行錯誤資訊，先用最小範例逐步檢查輸入、核心運算與輸出。';
  if (/compile|syntax|expected|undeclared|not declared/.test(message)) diagnosis = '這比較像編譯或語法問題：先定位第一個錯誤行，後面的錯誤常是連鎖結果。';
  else if (/time|timeout|limit/.test(message)) diagnosis = '這比較像逾時：檢查巢狀迴圈、重複計算，以及是否能用雜湊或排序降低複雜度。';
  else if (/runtime|segmentation|index|memory/.test(message)) diagnosis = '這比較像執行期錯誤：優先檢查索引範圍、空資料與指標生命週期。';
  else if (/wrong|未通過|output/.test(message)) diagnosis = '程式能執行但輸出不符：逐欄比對型別、空白、邊界值與題目要求的順序。';
  return `${diagnosis}\n\n針對本題，下一個可驗證步驟是：${problem.hints[0]}${data.fileCount > 1 ? ` 目前共有 ${data.fileCount} 個檔案，也要確認宣告與定義能正確連結。` : ''}`;
}

function outputText(payload: { output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }> }) {
  if (payload.output_text) return payload.output_text;
  return payload.output?.flatMap((item) => item.content || []).find((item) => item.type === 'output_text')?.text || '';
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: '來源不符合。' }, { status: 403 });
  const identity = getRequestIdentity(request);
  if (!identity) return Response.json({ error: '請先使用 ChatGPT 登入。' }, { status: 401 });
  if (Number(request.headers.get('content-length') || 0) > 80_000) return Response.json({ error: '分析內容過長。' }, { status: 413 });
  const limited = await consumeRequestLimit(request, identity.userId, 'coach', 10, 10 * 60_000);
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: '分析資料格式錯誤。' }, { status: 400 });
  const problem = await findProblem(parsed.data.problemId);
  if (!problem) return Response.json({ error: '找不到題目。' }, { status: 404 });

  const runtime = env as unknown as Record<string, string | undefined>;
  const apiKey = runtime.OPENAI_API_KEY?.trim();
  if (!apiKey) return Response.json({ message: localCoach(problem, parsed.data), engine: 'CodeDive 智慧分析', stored: false });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: runtime.OPENAI_MODEL || 'gpt-5.4-mini',
        store: false,
        max_output_tokens: 600,
        instructions: '你是 CodeDive 的繁體中文程式助教。提供具體、可驗證的下一步，不要洩漏隱藏測試。除非使用者已開啟參考解答，否則不要直接給完整答案程式碼。',
        input: JSON.stringify({
          action: parsed.data.mode,
          problem: { title: problem.title, language: problem.language, topic: problem.topic, description: problem.description, task: problem.task, constraints: problem.constraints, hint: problem.hints[0] },
          source: parsed.data.source,
          judgeMessage: parsed.data.judgeMessage,
          fileCount: parsed.data.fileCount,
          learning: parsed.data.learning,
        }),
      }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`OpenAI returned ${response.status}`);
    const payload = await response.json() as { output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
    const message = outputText(payload).trim();
    if (!message) throw new Error('Empty response');
    return Response.json({ message, engine: 'OpenAI 智慧助教', stored: false });
  } catch {
    return Response.json({ message: localCoach(problem, parsed.data), engine: 'CodeDive 智慧分析（備援）', stored: false });
  } finally {
    clearTimeout(timeout);
  }
}
