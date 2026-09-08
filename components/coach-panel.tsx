'use client';

import { BrainCircuit, Lightbulb, Loader2, Route, ShieldCheck, Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { Problem } from '@/app/content';
import type { SessionInfo } from '@/components/platform-panels';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type CoachMode = 'analyze' | 'concept' | 'recommend';

export function CoachPanel({
  problem,
  source,
  fileCount,
  judgeMessage,
  learning,
  session,
}: {
  problem: Problem;
  source: string;
  fileCount: number;
  judgeMessage: string;
  learning: { solved: number; wrong: number; submissions: number; accuracy: number };
  session: SessionInfo | null;
}) {
  const [loading, setLoading] = useState<CoachMode | null>(null);
  const [message, setMessage] = useState('');
  const [engine, setEngine] = useState('');
  const [error, setError] = useState('');

  const ask = async (mode: CoachMode) => {
    setLoading(mode);
    setError('');
    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ problemId: problem.id, mode, source, fileCount, judgeMessage, learning }),
      });
      const payload = await response.json() as { message?: string; engine?: string; error?: string };
      if (!response.ok || !payload.message) throw new Error(payload.error || '智慧助教暫時無法分析。');
      setMessage(payload.message);
      setEngine(payload.engine || 'CodeDive 智慧助教');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '智慧助教暫時無法分析。');
    } finally {
      setLoading(null);
    }
  };

  return (
    <section className="mt-3 overflow-hidden rounded-xl border border-violet-200 bg-card shadow-sm dark:border-violet-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-violet-50/70 px-5 py-4 dark:bg-violet-950/30">
        <div><h2 className="flex items-center gap-2 font-black"><BrainCircuit className="size-5 text-violet-600" />智慧助教</h2><p className="mt-1 text-xs text-muted-foreground">分析錯誤、解釋觀念，並依學習紀錄建議下一步。</p></div>
        <Badge variant="outline" className="gap-1"><ShieldCheck className="size-3" />程式碼不儲存</Badge>
      </div>
      <div className="p-5">
        {session?.authenticated ? <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" disabled={Boolean(loading)} onClick={() => void ask('analyze')}>{loading === 'analyze' ? <Loader2 className="animate-spin" /> : <Sparkles />}分析目前程式</Button>
          <Button variant="outline" className="gap-2" disabled={Boolean(loading)} onClick={() => void ask('concept')}>{loading === 'concept' ? <Loader2 className="animate-spin" /> : <Lightbulb />}解釋核心觀念</Button>
          <Button variant="outline" className="gap-2" disabled={Boolean(loading)} onClick={() => void ask('recommend')}>{loading === 'recommend' ? <Loader2 className="animate-spin" /> : <Route />}推薦下一步</Button>
        </div> : <a className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground" href={session?.signInPath || '/signin-with-chatgpt?return_to=/'} target="_top">登入後使用智慧助教</a>}
        {message && <div className="mt-4 rounded-xl bg-secondary/70 p-4 text-sm leading-7"><div className="mb-2 flex items-center gap-2"><Badge>{engine}</Badge><span className="text-[10px] text-muted-foreground">每 10 分鐘最多 10 次</span></div><p className="whitespace-pre-wrap">{message}</p></div>}
        {error && <p className="mt-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}
      </div>
    </section>
  );
}
