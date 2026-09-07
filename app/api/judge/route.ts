import { env } from 'cloudflare:workers';

export const dynamic = 'force-dynamic';

type JudgeCase = { input: string; expected: string };
type JudgeDefinition = {
  languageId: number;
  cases: JudgeCase[];
  wrap: (source: string, input: string) => { source: string; stdin: string };
};

const cPrelude = '#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n#include <ctype.h>\n';
const cppPrelude = '#include <bits/stdc++.h>\nusing namespace std;\n';

const definitions: Record<number, JudgeDefinition> = {
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

function normalizeOutput(value: string | null | undefined) {
  return (value || '').replace(/\r/g, '').trim().replace(/[ \t]+$/gm, '');
}

function requestAllowed(request: Request) {
  const hostname = new URL(request.url).hostname;
  return Boolean(request.headers.get('oai-authenticated-user-id')) || hostname === 'localhost' || hostname === '127.0.0.1';
}

export async function POST(request: Request) {
  if (!requestAllowed(request)) return Response.json({ error: '請先登入後使用安全判題。' }, { status: 401 });
  if (Number(request.headers.get('content-length') || 0) > 30_000) return Response.json({ error: '程式碼過長。' }, { status: 413 });

  let body: { problemId?: number; source?: string; mode?: 'run' | 'submit' };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: '資料格式錯誤。' }, { status: 400 });
  }

  const definition = definitions[Number(body.problemId)];
  const source = typeof body.source === 'string' ? body.source : '';
  if (!definition) return Response.json({ error: '這一題使用教學版結構判題。' }, { status: 422 });
  if (!source.trim() || source.length > 20_000) return Response.json({ error: '請輸入有效且不超過 20,000 字元的程式碼。' }, { status: 400 });

  const cases = body.mode === 'run' ? definition.cases.slice(0, Math.min(2, definition.cases.length)) : definition.cases;
  const runtime = env as unknown as Record<string, string | undefined>;
  const endpoint = (runtime.JUDGE0_API_URL || 'https://ce.judge0.com').replace(/\/$/, '');

  try {
    const results = [];
    for (let index = 0; index < cases.length; index++) {
      const test = cases[index];
      const wrapped = definition.wrap(source, test.input);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12_000);
      const response = await fetch(`${endpoint}/submissions?base64_encoded=false&wait=true`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({
          language_id: definition.languageId,
          source_code: wrapped.source,
          stdin: wrapped.stdin,
          cpu_time_limit: 3,
          wall_time_limit: 6,
          memory_limit: 256000,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!response.ok) throw new Error(`Judge service returned ${response.status}`);
      const result = await response.json() as {
        stdout?: string | null; stderr?: string | null; compile_output?: string | null;
        time?: string | null; memory?: number | null; status?: { description?: string };
      };
      const actual = normalizeOutput(result.stdout);
      const expected = normalizeOutput(test.expected);
      results.push({
        label: `測試 ${index + 1}`,
        input: test.input.trim() || '內建資料表',
        output: expected,
        actual,
        passed: result.status?.description === 'Accepted' && actual === expected,
        status: result.status?.description || 'Unknown',
        error: normalizeOutput(result.compile_output || result.stderr),
        time: result.time || null,
        memory: result.memory || null,
      });
    }
    return Response.json({ results, engine: 'Judge0 CE sandbox' });
  } catch (error) {
    const message = error instanceof Error && error.name === 'AbortError'
      ? '判題服務逾時，請稍後重試。'
      : '判題服務暫時無法使用，已保留你的程式碼。';
    return Response.json({ error: message }, { status: 503 });
  }
}
