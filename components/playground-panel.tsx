'use client';

import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { BookMarked, CheckCircle2, Copy, Download, FileCode2, Loader2, Play, Plus, RotateCcw, TerminalSquare, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { playgroundExamples, quickReferences, type PlaygroundExample, type PlaygroundLanguage } from '@/lib/playground-library';

const CodeEditor = lazy(() => import('@/components/code-editor').then((module) => ({ default: module.CodeEditor })));
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
  const [copiedSource, setCopiedSource] = useState(false);
  const [selectedExampleId, setSelectedExampleId] = useState(playgroundExamples.C[0].id);
  const examples = playgroundExamples[language];
  const selectedExample = useMemo(() => examples.find((example) => example.id === selectedExampleId) || examples[0], [examples, selectedExampleId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = localStorage.getItem('codedive-playground-C');
      if (saved) setSource(saved);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => localStorage.setItem(`codedive-playground-${language}`, source), 450);
    return () => window.clearTimeout(timer);
  }, [language, source]);

  const changeLanguage = (next: PlaygroundLanguage) => {
    localStorage.setItem(`codedive-playground-${language}`, source);
    setLanguage(next);
    setSource(localStorage.getItem(`codedive-playground-${next}`) || playgroundTemplates[next]);
    setSelectedExampleId(playgroundExamples[next][0].id);
    setResult(null);
    setError('');
  };

  const loadExample = (example: PlaygroundExample) => {
    setSource(example.source);
    setStdin(example.stdin);
    setSelectedExampleId(example.id);
    setResult(null);
    setError('');
  };

  const reset = () => {
    setSource(playgroundTemplates[language]);
    setStdin('');
    setResult(null);
    setError('');
  };

  const insertSnippet = (snippet: string) => {
    setSource((current) => `${current.trimEnd()}\n\n${snippet}`);
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

  const copySource = async () => {
    await navigator.clipboard.writeText(source);
    setCopiedSource(true);
    window.setTimeout(() => setCopiedSource(false), 1200);
  };

  const downloadSource = () => {
    const extension = language === 'C' ? 'c' : language === 'C++' ? 'cpp' : language === 'Python' ? 'py' : 'sql';
    const url = URL.createObjectURL(new Blob([source], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `codedive-example.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><TerminalSquare className="size-5" /></span>
          <div><h2 className="font-black">自由程式實驗室</h2><p className="text-sm text-muted-foreground">常用寫法、規範速查、stdin 與沙箱執行都集中在這裡。</p></div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm font-bold" htmlFor="playground-language">語言</label>
          <select id="playground-language" value={language} onChange={(event) => changeLanguage(event.target.value as PlaygroundLanguage)} className="h-10 rounded-lg border bg-background px-3 text-sm">
            {(['C', 'C++', 'Python', 'SQL'] as PlaygroundLanguage[]).map((item) => <option key={item}>{item}</option>)}
          </select>
          <Button variant="outline" className="gap-2" onClick={reset}><RotateCcw className="size-4" />重設</Button>
        </div>
      </div>
      <div className="grid gap-3 border-b bg-secondary/30 p-4 xl:grid-cols-[minmax(260px,.8fr)_minmax(360px,1.2fr)_auto] xl:items-end">
        <label className="grid gap-1.5 text-sm font-bold" htmlFor="playground-example">常用用例
          <select id="playground-example" value={selectedExample.id} onChange={(event) => { const example = examples.find((item) => item.id === event.target.value); if (example) loadExample(example); }} className="h-10 rounded-lg border bg-background px-3 font-normal">
            {examples.map((example) => <option key={example.id} value={example.id}>{example.category} · {example.title}</option>)}
          </select>
        </label>
        <div className="min-w-0"><p className="text-sm font-bold">{selectedExample.title}</p><p className="mt-1 truncate text-sm text-muted-foreground">{selectedExample.summary}</p><div className="mt-2 flex flex-wrap gap-1.5">{selectedExample.concepts.map((concept) => <Badge key={concept} variant="outline" className="bg-background text-xs">{concept}</Badge>)}</div></div>
        <div className="flex flex-wrap gap-2"><Button className="gap-2" onClick={() => loadExample(selectedExample)}><FileCode2 className="size-4" />載入完整用例</Button><Button variant="outline" size="icon" aria-label="複製程式碼" title={copiedSource ? '已複製' : '複製程式碼'} onClick={() => void copySource()}><Copy className="size-4" /></Button><Button variant="outline" size="icon" aria-label="下載程式碼" title="下載程式碼" onClick={downloadSource}><Download className="size-4" /></Button></div>
      </div>
      <div className="grid min-h-[560px] lg:grid-cols-[1.3fr_.7fr]">
        <div className="flex min-w-0 flex-col border-b bg-[#0d1321] lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between border-b border-white/10 bg-[#111827] px-4 py-3 text-slate-100"><strong className="text-sm">main.{language === 'C' ? 'c' : language === 'C++' ? 'cpp' : language === 'Python' ? 'py' : 'sql'}</strong><Badge className="border-white/10 bg-white/10 text-slate-200">{language}</Badge></div>
          <Suspense fallback={<div className="grid min-h-[390px] place-items-center text-sm text-slate-400"><Loader2 className="size-5 animate-spin" /></div>}>
            <CodeEditor value={source} language={language} onChange={(value) => { setSource(value); setResult(null); setError(''); }} onRun={() => void run()} onSubmit={() => void run()} onSave={() => localStorage.setItem(`codedive-playground-${language}`, source)} />
          </Suspense>
          <div className="flex justify-end border-t border-white/10 bg-[#0a101c] p-3"><Button className="gap-2 bg-emerald-600 hover:bg-emerald-700" disabled={running} onClick={() => void run()}>{running ? <Loader2 className="animate-spin" /> : <Play />}執行程式</Button></div>
        </div>
        <div className="grid min-h-[420px] grid-rows-[auto_auto_1fr]">
          <section className="border-b p-4" aria-labelledby="quick-reference-title"><div className="flex items-center justify-between gap-2"><h3 id="quick-reference-title" className="flex items-center gap-2 text-sm font-black"><BookMarked className="size-4 text-primary" />常用寫法與規範速查</h3><span className="text-xs text-muted-foreground">輸入前綴後點選提示</span></div><div className="mt-3 grid gap-2 sm:grid-cols-2">{quickReferences[language].map((reference) => <button key={reference.title} onClick={() => insertSnippet(reference.snippet)} className="group rounded-lg border bg-background p-3 text-left transition hover:border-primary/40 hover:bg-primary/5"><span className="flex items-center justify-between gap-2"><strong className="text-sm group-hover:text-primary">{reference.title}</strong><kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-primary">{reference.prefix}</kbd></span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{reference.note}</span><span className="mt-2 flex items-center gap-1 text-xs font-bold text-primary"><Plus className="size-3" />插入編輯器</span></button>)}</div></section>
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
