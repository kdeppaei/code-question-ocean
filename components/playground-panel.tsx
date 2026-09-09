'use client';

import { Suspense, lazy, useState } from 'react';
import { CheckCircle2, Copy, Loader2, Play, RotateCcw, TerminalSquare, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { Language } from '@/app/content';

const CodeEditor = lazy(() => import('@/components/code-editor').then((module) => ({ default: module.CodeEditor })));
export type PlaygroundLanguage = Extract<Language, 'C' | 'C++' | 'Python' | 'SQL'>;

export const playgroundTemplates: Record<PlaygroundLanguage, string> = {
  C: '#include <stdio.h>\n\nint main(void) {\n    printf("Hello, CodeDive!\\n");\n    return 0;\n}',
  'C++': '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, CodeDive!" << \'\\n\';\n    return 0;\n}',
  Python: 'name = input().strip() or "CodeDive"\nprint(f"Hello, {name}!")',
  SQL: "CREATE TABLE scores(name TEXT, score INTEGER);\nINSERT INTO scores VALUES ('C', 90), ('C++', 95);\n\nSELECT name, score\nFROM scores\nORDER BY score DESC;",
};

type PlaygroundResult = { status: string; stdout: string; error: string; time: string | null; memory: number | null; engine: string };

export function PlaygroundPanel() {
  const [language, setLanguage] = useState<PlaygroundLanguage>('C');
  const [source, setSource] = useState(playgroundTemplates.C);
  const [stdin, setStdin] = useState('');
  const [result, setResult] = useState<PlaygroundResult | null>(null);
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const changeLanguage = (next: PlaygroundLanguage) => {
    setLanguage(next);
    setSource(playgroundTemplates[next]);
    setResult(null);
    setError('');
  };

  const run = async () => {
    setRunning(true);
    setError('');
    setResult(null);
    try {
      const response = await fetch('/api/playground', {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ language, source, stdin }),
      });
      const payload = await response.json() as PlaygroundResult & { error?: string };
      if (!response.ok) throw new Error(payload.error || '程式暫時無法執行。');
      setResult(payload);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '程式暫時無法執行。');
    } finally {
      setRunning(false);
    }
  };

  const copyOutput = async () => {
    if (!result?.stdout) return;
    await navigator.clipboard.writeText(result.stdout);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><TerminalSquare className="size-5" /></span>
          <div><h2 className="font-black">自由程式實驗室</h2><p className="text-xs text-muted-foreground">寫完整程式、加入 stdin，立即查看編譯與輸出。</p></div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm font-bold" htmlFor="playground-language">語言</label>
          <select id="playground-language" value={language} onChange={(event) => changeLanguage(event.target.value as PlaygroundLanguage)} className="h-10 rounded-lg border bg-background px-3 text-sm">
            {(['C', 'C++', 'Python', 'SQL'] as PlaygroundLanguage[]).map((item) => <option key={item}>{item}</option>)}
          </select>
          <Button variant="outline" className="gap-2" onClick={() => changeLanguage(language)}><RotateCcw className="size-4" />重設範例</Button>
        </div>
      </div>
      <div className="grid min-h-[560px] lg:grid-cols-[1.3fr_.7fr]">
        <div className="flex min-w-0 flex-col border-b bg-[#0d1321] lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between border-b border-white/10 bg-[#111827] px-4 py-3 text-slate-100"><strong className="text-sm">main.{language === 'C' ? 'c' : language === 'C++' ? 'cpp' : language === 'Python' ? 'py' : 'sql'}</strong><Badge className="border-white/10 bg-white/10 text-slate-200">{language}</Badge></div>
          <Suspense fallback={<div className="grid min-h-[390px] place-items-center text-sm text-slate-400"><Loader2 className="size-5 animate-spin" /></div>}>
            <CodeEditor value={source} language={language} onChange={(value) => { setSource(value); setResult(null); setError(''); }} onRun={() => void run()} onSubmit={() => void run()} onSave={() => localStorage.setItem(`codedive-playground-${language}`, source)} />
          </Suspense>
          <div className="flex justify-end border-t border-white/10 bg-[#0a101c] p-3"><Button className="gap-2 bg-emerald-600 hover:bg-emerald-700" disabled={running} onClick={() => void run()}>{running ? <Loader2 className="animate-spin" /> : <Play />}執行程式</Button></div>
        </div>
        <div className="grid min-h-[420px] grid-rows-[auto_1fr]">
          <div className="border-b p-4"><label className="mb-2 block text-sm font-black" htmlFor="playground-stdin">標準輸入 stdin</label><Textarea id="playground-stdin" value={stdin} onChange={(event) => setStdin(event.target.value)} className="min-h-28 font-mono text-sm" maxLength={10000} placeholder={language === 'Python' ? '例如：Ada' : '需要輸入時填在這裡；可留空'} /></div>
          <div className="flex min-h-0 flex-col bg-slate-950 text-slate-100">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3"><strong className="text-sm">輸出</strong>{result && <span className="text-xs text-slate-400">{result.engine} · {result.time || '—'}s</span>}</div>
            <div className="min-h-56 flex-1 p-4 font-mono text-sm leading-6">
              {running ? <span className="flex items-center gap-2 text-slate-400"><Loader2 className="size-4 animate-spin" />正在編譯與執行…</span> : error ? <div className="flex gap-2 text-rose-300"><XCircle className="mt-0.5 size-4 shrink-0" /><span>{error}</span></div> : result ? <div><div className={`mb-3 flex items-center gap-2 text-xs font-bold ${result.status === 'Accepted' ? 'text-emerald-400' : 'text-amber-300'}`}>{result.status === 'Accepted' ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}{result.status}</div><pre className="whitespace-pre-wrap break-words">{result.error || result.stdout || '（程式沒有輸出）'}</pre></div> : <span className="text-slate-500">按「執行程式」後，結果會顯示在這裡。</span>}
            </div>
            <div className="flex justify-end border-t border-white/10 p-3"><Button variant="outline" size="sm" className="gap-2 border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white" disabled={!result?.stdout} onClick={() => void copyOutput()}><Copy className="size-3.5" />{copied ? '已複製' : '複製輸出'}</Button></div>
          </div>
        </div>
      </div>
    </section>
  );
}
