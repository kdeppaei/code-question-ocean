import { env } from 'cloudflare:workers';
import { generatedJudgeDefinitions } from '@/lib/generated-judge-definitions';
import { uniqueJudgeDefinitions } from '@/lib/unique-judge-definitions';
import { uniqueJudgeDefinitionsV2 } from '@/lib/unique-judge-definitions-v2';
import { uniqueJudgeDefinitionsV3 } from '@/lib/unique-judge-definitions-v3';
import { getRequestIdentity } from '@/lib/auth';
import { ensureProgressSchema } from '@/lib/db';
import { createMultiFileArchive, validateSourceFiles, type SourceFile } from '@/lib/judge-project';
import { judgeConfigSchema, problemSchema } from '@/lib/problem-schema';
import { consumeRequestLimit } from '@/lib/rate-limit';
import { problems, type Language } from '@/app/content';

export const dynamic = 'force-dynamic';

type JudgeCase = { input: string; expected: string; label?: string; hidden?: boolean };
type JudgeDefinition = {
  languageId: number;
  cases: JudgeCase[];
  wrap: (source: string, input: string) => { source: string; stdin: string };
  language?: Language;
  custom?: boolean;
};

const cPrelude = '#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n#include <ctype.h>\n';
const cppPrelude = '#include <bits/stdc++.h>\nusing namespace std;\n';

const coreDefinitions: Record<number, JudgeDefinition> = {
  1: {
    languageId: 103,
    cases: [{ input: '5\n3 1 4 1 5\n', expected: '14' }, { input: '0\n', expected: '0' }, { input: '3\n-2 5 -1\n', expected: '2' }],
    wrap: (source, input) => ({ source: `${cPrelude}${source}\nint main(void){int n;if(scanf("%d",&n)!=1)return 0;int *a=calloc(n?n:1,sizeof(int));for(int i=0;i<n;i++)scanf("%d",&a[i]);printf("%d",sum_array(a,n));free(a);return 0;}`, stdin: input }),
  },
  2: {
    languageId: 103,
    cases: [{ input: '7 11\n', expected: '11 7' }, { input: '-3 8\n', expected: '8 -3' }, { input: '4 4\n', expected: '4 4' }],
    wrap: (source, input) => ({ source: `${cPrelude}${source}\nint main(void){int a,b;scanf("%d%d",&a,&b);swap(&a,&b);printf("%d %d",a,b);return 0;}`, stdin: input }),
  },
  3: {
    languageId: 103,
    cases: [{ input: 'CodeDive\n', expected: '4' }, { input: 'rhythm\n', expected: '0' }, { input: '\n', expected: '0' }],
    wrap: (source, input) => ({ source: `${cPrelude}${source}\nint main(void){char text[100005]={0};fgets(text,sizeof(text),stdin);printf("%d",count_vowels(text));return 0;}`, stdin: input }),
  },
  4: {
    languageId: 103,
    cases: [{ input: '4\ncode\n', expected: 'edoc' }, { input: '5\ndebug\n', expected: 'gubed' }, { input: '1\nx\n', expected: 'x' }],
    wrap: (source, input) => ({ source: `${cPrelude}${source}\nint main(void){int n;char s[100005]={0};scanf("%d",&n);scanf("%100000s",s);reverse(s,n);printf("%.*s",n,s);return 0;}`, stdin: input }),
  },
  5: {
    languageId: 105,
    cases: [{ input: '5\n1 1 2 2 3\n', expected: '3\n1 2 3' }, { input: '3\n1 2 3\n', expected: '3\n1 2 3' }, { input: '0\n', expected: '0' }],
    wrap: (source, input) => ({ source: `${cppPrelude}${source}\nint main(){int n;cin>>n;vector<int>a(n);for(int&x:a)cin>>x;int k=removeDuplicates(a);cout<<k;if(k){cout<<"\\n";for(int i=0;i<k;i++){if(i)cout<<' ';cout<<a[i];}}}`, stdin: input }),
  },
  6: {
    languageId: 105,
    cases: [{ input: '6\nc cpp c sql cpp c\n', expected: 'c' }, { input: '2\nb a\n', expected: 'a' }, { input: '1\npython\n', expected: 'python' }],
    wrap: (source, input) => ({ source: `${cppPrelude}${source}\nint main(){int n;cin>>n;vector<string>w(n);for(auto&x:w)cin>>x;cout<<mostFrequent(w);}`, stdin: input }),
  },
  7: {
    languageId: 105,
    cases: [{ input: '4 9\n2 7 11 15\n', expected: '0 1' }, { input: '4 0\n-3 4 3 90\n', expected: '0 2' }, { input: '2 6\n3 3\n', expected: '0 1' }],
    wrap: (source, input) => ({ source: `${cppPrelude}${source}\nint main(){int n,t;cin>>n>>t;vector<int>a(n);for(int&x:a)cin>>x;auto r=twoSum(a,t);cout<<r[0]<<' '<<r[1];}`, stdin: input }),
  },
  8: {
    languageId: 105,
    cases: [{ input: '([]){}\n', expected: 'true' }, { input: '([)]\n', expected: 'false' }, { input: '((\n', expected: 'false' }],
    wrap: (source, input) => ({ source: `${cppPrelude}${source}\nint main(){string s;cin>>s;cout<<(isValid(s)?"true":"false");}`, stdin: input }),
  },
  9: {
    languageId: 109,
    cases: [{ input: '[" Python ", "", " SQL"]\n', expected: '["python","sql"]' }, { input: '[" ", ""]\n', expected: '[]' }, { input: '["B", "a"]\n', expected: '["b","a"]' }],
    wrap: (source, input) => ({ source: `import json\n${source}\nprint(json.dumps(clean_words(json.loads(input())), separators=(',', ':')))`, stdin: input }),
  },
  10: {
    languageId: 109,
    cases: [{ input: '["eat","tea","tan","ate"]\n', expected: 'ate,eat,tea|tan' }, { input: '["abc"]\n', expected: 'abc' }, { input: '["",""]\n', expected: ',' }],
    wrap: (source, input) => ({ source: `import json\n${source}\ngroups = group_anagrams(json.loads(input()))\nprint('|'.join(sorted(','.join(sorted(group)) for group in groups)))`, stdin: input }),
  },
  11: {
    languageId: 109,
    cases: [{ input: '[100,4,200,1,3,2]\n', expected: '4' }, { input: '[1,2,2,3]\n', expected: '3' }, { input: '[]\n', expected: '0' }],
    wrap: (source, input) => ({ source: `import json\n${source}\nprint(longest_streak(json.loads(input())))`, stdin: input }),
  },
  12: {
    languageId: 109,
    cases: [{ input: '[[1,3],[2,6],[8,10],[9,12]]\n', expected: '[[1,6],[8,12]]' }, { input: '[[1,2],[4,5]]\n', expected: '[[1,2],[4,5]]' }, { input: '[]\n', expected: '[]' }],
    wrap: (source, input) => ({ source: `import json\n${source}\nprint(json.dumps(merge_intervals(json.loads(input())), separators=(',', ':')))`, stdin: input }),
  },
  13: {
    languageId: 82,
    cases: [{ input: '', expected: '3|Ada|2026-09-07\n1|Linus|2026-09-05' }],
    wrap: (source) => ({ source: `CREATE TABLE customers(id INTEGER,name TEXT,status TEXT,last_login TEXT);\nINSERT INTO customers VALUES(1,'Linus','active','2026-09-05'),(2,'Grace','paused','2026-09-06'),(3,'Ada','active','2026-09-07');\n${source}`, stdin: '' }),
  },
  14: {
    languageId: 82,
    cases: [{ input: '', expected: '2026-01|350\n2026-02|80' }],
    wrap: (source) => ({ source: `CREATE TABLE orders(created_at TEXT,amount INTEGER,status TEXT);\nINSERT INTO orders VALUES('2026-01-03',100,'paid'),('2026-01-20',250,'paid'),('2026-02-01',80,'paid'),('2026-02-04',999,'cancelled');\n${source}`, stdin: '' }),
  },
  15: {
    languageId: 82,
    cases: [{ input: '', expected: '200' }],
    wrap: (source) => ({ source: `CREATE TABLE employees(salary INTEGER);\nINSERT INTO employees VALUES(100),(200),(200),(300);\n${source}`, stdin: '' }),
  },
  16: {
    languageId: 82,
    cases: [{ input: '', expected: '1|4|75.0\n2|2|50.0' }],
    wrap: (source) => ({ source: `CREATE TABLE enrollments(course_id INTEGER,user_id INTEGER,completed_at TEXT);\nINSERT INTO enrollments VALUES(1,1,'2026-01-01'),(1,2,'2026-01-02'),(1,3,'2026-01-03'),(1,4,NULL),(2,1,'2026-01-01'),(2,2,NULL);\n${source}`, stdin: '' }),
  },
};

const definitions: Record<number, JudgeDefinition> = {
  ...coreDefinitions,
  ...generatedJudgeDefinitions,
  ...uniqueJudgeDefinitions,
  ...uniqueJudgeDefinitionsV2,
  ...uniqueJudgeDefinitionsV3,
};

const languageIds: Partial<Record<Language, number>> = { C: 103, 'C++': 105, Python: 109, SQL: 82 };

async function resolveDefinition(problemId: number): Promise<JudgeDefinition | null> {
  if (definitions[problemId]) return { ...definitions[problemId], language: problems.find((problem) => problem.id === problemId)?.language };
  if (problemId < 1000) return null;
  const db = await ensureProgressSchema();
  const row = await db.prepare('SELECT data_json, judge_json FROM custom_problems WHERE id = ? AND active = 1')
    .bind(problemId)
    .first<{ data_json: string; judge_json: string | null }>();
  if (!row?.judge_json) return null;
  try {
    const problem = problemSchema.parse(JSON.parse(row.data_json));
    const judge = judgeConfigSchema.parse(JSON.parse(row.judge_json));
    const languageId = languageIds[problem.language];
    if (!languageId) return null;
    return {
      languageId,
      language: problem.language,
      custom: true,
      cases: judge.cases,
      wrap: (source, input) => ({ source, stdin: input }),
    };
  } catch {
    return null;
  }
}

function normalizeOutput(value: string | null | undefined) {
  return (value || '').replace(/\r/g, '').trim().replace(/[ \t]+$/gm, '');
}

type JudgeResult = {
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  time?: string | null;
  memory?: number | null;
  status?: { description?: string };
};

async function submitToJudge(
  endpoints: string[],
  definition: JudgeDefinition,
  source: string,
  input: string,
  headers: Record<string, string>,
  language: Language | undefined,
  files: SourceFile[] | undefined,
) {
  const wrapped = definition.wrap(source, input);
  const useMultiFile = Boolean(language && files && files.length > 1 && language !== 'GDB');
  const additionalFiles = useMultiFile ? await createMultiFileArchive(language!, wrapped.source, files!) : undefined;
  let lastError: unknown;
  for (const endpoint of endpoints) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);
    try {
      const response = await fetch(`${endpoint}/submissions?base64_encoded=false&wait=true`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json', ...headers },
        body: JSON.stringify({
          language_id: useMultiFile ? 89 : definition.languageId,
          ...(useMultiFile ? { additional_files: additionalFiles } : { source_code: wrapped.source }),
          stdin: wrapped.stdin,
          cpu_time_limit: 3,
          wall_time_limit: 6,
          memory_limit: 256000,
          enable_network: false,
        }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`Judge service returned ${response.status}`);
      return { result: await response.json() as JudgeResult, endpoint };
    } catch (error) {
      lastError = error;
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Judge service unavailable');
}

export async function POST(request: Request) {
  const identity = getRequestIdentity(request);
  if (!identity) return Response.json({ error: '請先登入後使用安全判題。' }, { status: 401 });
  if (Number(request.headers.get('content-length') || 0) > 100_000) return Response.json({ error: '程式碼或檔案內容過長。' }, { status: 413 });

  const limited = await consumeRequestLimit(request, identity.userId, 'judge', 20, 60_000);
  if (limited) return limited;

  let body: { problemId?: number; source?: string; files?: unknown; mode?: 'run' | 'submit' | 'custom'; customInput?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: '資料格式錯誤。' }, { status: 400 });
  }

  const problemId = Number(body.problemId);
  if (!Number.isInteger(problemId) || problemId < 1 || !['run', 'submit', 'custom'].includes(body.mode || '')) {
    return Response.json({ error: '判題模式或題目編號錯誤。' }, { status: 400 });
  }
  const definition = await resolveDefinition(problemId);
  const fileValidation = validateSourceFiles(body.files);
  if (fileValidation.error) return Response.json({ error: fileValidation.error }, { status: 400 });
  const files = fileValidation.files;
  const mainFile = files?.find((file) => file.id === 'main') || files?.[0];
  const source = mainFile?.content ?? (typeof body.source === 'string' ? body.source : '');
  if (!definition) return Response.json({ error: '這一題使用教學版結構判題。' }, { status: 422 });
  if (!source.trim() || source.length > 60_000) return Response.json({ error: '請輸入有效且不超過 60,000 字元的程式碼。' }, { status: 400 });
  if (body.mode === 'custom' && (typeof body.customInput !== 'string' || body.customInput.length > 10_000)) {
    return Response.json({ error: '自訂輸入不可超過 10,000 字元。' }, { status: 400 });
  }

  const cases = body.mode === 'custom'
    ? [{ input: body.customInput || '', expected: '' }]
    : body.mode === 'run'
      ? definition.cases.filter((test) => !test.hidden).slice(0, Math.min(2, definition.cases.length))
      : definition.cases;
  if (cases.length === 0) return Response.json({ error: '這一題沒有可執行的測試。' }, { status: 422 });
  const runtime = env as unknown as Record<string, string | undefined>;
  const primary = (runtime.JUDGE0_API_URL || 'https://ce.judge0.com').replace(/\/$/, '');
  const fallback = runtime.JUDGE0_FALLBACK_API_URL?.replace(/\/$/, '');
  const endpoints = Array.from(new Set([primary, fallback].filter((value): value is string => Boolean(value))));
  const authHeader = runtime.JUDGE0_AUTH_HEADER?.trim();
  const authToken = runtime.JUDGE0_AUTH_TOKEN?.trim();
  const judgeHeaders = authHeader && authToken ? { [authHeader]: authToken } : {};

  try {
    const results = [];
    let activeEndpoint = primary;
    for (let index = 0; index < cases.length; index++) {
      const test = cases[index];
      const submission = await submitToJudge(endpoints, definition, source, test.input, judgeHeaders, definition.language, files);
      const result = submission.result;
      activeEndpoint = submission.endpoint;
      const actual = normalizeOutput(result.stdout);
      const expected = normalizeOutput(test.expected);
      results.push({
        label: body.mode === 'custom' ? '自訂測試' : body.mode === 'submit' && test.hidden ? `隱藏測試 ${index + 1}` : test.label || `測試 ${index + 1}`,
        input: body.mode === 'submit' ? '隱藏測試' : test.input.trim() || '內建資料表',
        output: body.mode === 'custom' ? '不比對預期輸出' : body.mode === 'submit' ? '隱藏' : expected,
        actual: body.mode === 'submit' ? undefined : actual,
        passed: result.status?.description === 'Accepted' && (body.mode === 'custom' || actual === expected),
        status: result.status?.description || 'Unknown',
        error: normalizeOutput(result.compile_output || result.stderr),
        time: result.time || null,
        memory: result.memory || null,
      });
    }
    return Response.json({ results, engine: activeEndpoint === primary && runtime.JUDGE0_API_URL ? 'CodeDive Judge0' : 'Judge0 CE sandbox' });
  } catch (error) {
    const message = error instanceof Error && error.name === 'AbortError'
      ? '判題服務逾時，請稍後重試。'
      : '判題服務暫時無法使用，已保留你的程式碼。';
    return Response.json({ error: message }, { status: 503 });
  }
}
