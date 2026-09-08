'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Database, Loader2, Medal, ShieldCheck, Trophy, Upload, UserRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Problem } from '@/app/content';

export type SessionInfo = {
  authenticated: boolean;
  isAdmin: boolean;
  user: { email: string; name: string } | null;
  signInPath: string;
  signOutPath: string;
};

type Leader = {
  rank: number;
  displayName: string;
  solvedCount: number;
  successful: number;
  submissions: number;
  accuracy: number;
};

export function LeaderboardPanel({ session }: { session: SessionInfo | null }) {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const refresh = async () => {
    try {
      const response = await fetch('/api/leaderboard');
      const payload = await response.json() as { leaders?: Leader[] };
      setLeaders(payload.leaders || []);
    } catch {
      setMessage('排行榜暫時無法載入。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => void refresh());
  }, []);

  useEffect(() => {
    if (!session?.user?.name) return;
    const name = session.user.name.slice(0, 24);
    queueMicrotask(() => setDisplayName(name));
  }, [session]);

  const joinLeaderboard = async () => {
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/leaderboard', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ displayName, isPublic: true }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || '設定失敗。');
      setMessage('已加入公開排行榜，後續解題進度會自動更新。');
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '設定失敗。');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b p-5"><div><h2 className="flex items-center gap-2 font-black"><Trophy className="size-5 text-amber-500" />公開排行榜</h2><p className="mt-1 text-xs text-muted-foreground">依完成題數與成功提交排序，最多顯示前 100 名。</p></div><Badge variant="outline">{leaders.length} 位學習者</Badge></div>
          {loading ? <div className="grid min-h-64 place-items-center"><Loader2 className="size-6 animate-spin text-primary" /></div> : leaders.length ? <div className="divide-y">{leaders.map((leader) => <div key={`${leader.rank}-${leader.displayName}`} className="grid grid-cols-[48px_minmax(0,1fr)_70px_70px] items-center gap-3 px-5 py-4"><span className={`grid size-8 place-items-center rounded-full font-mono text-xs font-black ${leader.rank <= 3 ? 'bg-amber-100 text-amber-700' : 'bg-secondary text-muted-foreground'}`}>{leader.rank <= 3 ? <Medal className="size-4" /> : leader.rank}</span><div className="min-w-0"><strong className="block truncate text-sm">{leader.displayName}</strong><span className="text-[10px] text-muted-foreground">{leader.submissions} 次提交</span></div><div className="text-right"><strong className="font-mono">{leader.solvedCount}</strong><span className="block text-[10px] text-muted-foreground">完成題數</span></div><div className="text-right"><strong className="font-mono">{leader.accuracy}%</strong><span className="block text-[10px] text-muted-foreground">正確率</span></div></div>)}</div> : <div className="p-14 text-center"><Medal className="mx-auto size-9 text-muted-foreground/40" /><strong className="mt-4 block">等待第一位挑戰者</strong><p className="mt-1 text-sm text-muted-foreground">登入並設定名稱即可上榜。</p></div>}
        </div>
        <aside className="rounded-2xl border bg-card p-6 shadow-sm"><span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><UserRound className="size-5" /></span><h2 className="mt-5 text-xl font-black">建立排行榜名稱</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">只公開你設定的顯示名稱、完成題數與正確率，不會公開 Email。</p>{session?.authenticated ? <div className="mt-5 space-y-3"><Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={24} placeholder="顯示名稱" aria-label="排行榜顯示名稱" /><Button className="w-full gap-2" disabled={saving || displayName.trim().length < 2} onClick={joinLeaderboard}>{saving ? <Loader2 className="animate-spin" /> : <Trophy />}加入／更新排行榜</Button><a className="block text-center text-xs font-bold text-muted-foreground hover:text-primary" href={session.signOutPath} target="_top">登出 ChatGPT</a></div> : <a className="mt-5 flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground" href={session?.signInPath || '/signin-with-chatgpt?return_to=/'} target="_top">使用 ChatGPT 登入</a>}{message && <p className="mt-4 rounded-lg bg-secondary p-3 text-xs leading-5">{message}</p>}</aside>
      </section>
    </div>
  );
}

const sampleImport = JSON.stringify({
  problems: [{
    id: 1000,
    slug: 'python-custom-sum',
    title: '自訂：串列總和',
    language: 'Python',
    difficulty: '簡單',
    topic: '陣列',
    track: '陣列與字串',
    acceptance: 80,
    description: '回傳整數串列的總和。',
    task: '完成 custom_sum 函式。',
    constraints: ['串列長度不超過 1000'],
    examples: [{ input: '[1,2,3]', output: '6' }],
    starter: 'def custom_sum(nums):\n    # TODO\n    return 0',
    solution: 'def custom_sum(nums):\n    return sum(nums)',
    explanation: '可直接使用 sum，或以迴圈累加。',
    hints: ['先建立累加器。'],
    checks: [{ label: '核心解法', input: '[1,2,3]', output: '6', tokens: ['sum('] }],
  }],
}, null, 2);

export function AdminPanel({ problems, onChanged }: { problems: Problem[]; onChanged: () => Promise<void> }) {
  const [payload, setPayload] = useState(sampleImport);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const importProblems = async () => {
    setBusy(true);
    setMessage('');
    try {
      const parsed = JSON.parse(payload) as unknown;
      const response = await fetch('/api/problems', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(parsed) });
      const result = await response.json() as { imported?: number; error?: string };
      if (!response.ok) throw new Error(result.error || '匯入失敗。');
      setMessage(`成功匯入或更新 ${result.imported} 題。`);
      await onChanged();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'JSON 格式錯誤。');
    } finally {
      setBusy(false);
    }
  };

  const deactivate = async (id: number) => {
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/problems', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ids: [id], active: false }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || '停用失敗。');
      setMessage(`題目 #${id} 已停用。`);
      await onChanged();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '停用失敗。');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
      <section className="rounded-2xl border bg-card shadow-sm"><div className="border-b p-5"><h2 className="flex items-center gap-2 font-black"><Upload className="size-5 text-primary" />批次匯入 JSON</h2><p className="mt-1 text-xs text-muted-foreground">一次最多 100 題；相同 ID 會更新，管理題 ID 必須從 1000 開始。</p></div><div className="p-5"><Textarea value={payload} onChange={(event) => setPayload(event.target.value)} spellCheck={false} className="min-h-[480px] font-mono text-xs leading-5" aria-label="題目匯入 JSON" /><div className="mt-4 flex items-center justify-between gap-3"><span className="text-xs text-muted-foreground">伺服器會完整驗證欄位與長度。</span><Button className="gap-2" disabled={busy} onClick={importProblems}>{busy ? <Loader2 className="animate-spin" /> : <Database />}驗證並匯入</Button></div>{message && <p className="mt-4 rounded-lg bg-secondary p-3 text-sm">{message}</p>}</div></section>
      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm"><div className="flex items-center justify-between border-b p-5"><div><h2 className="flex items-center gap-2 font-black"><ShieldCheck className="size-5 text-emerald-600" />管理題庫</h2><p className="mt-1 text-xs text-muted-foreground">目前 {problems.length} 題由後台管理。</p></div><Badge variant="outline">管理員</Badge></div>{problems.length ? <div className="max-h-[620px] divide-y overflow-y-auto">{problems.map((problem) => <div key={problem.id} className="flex items-center gap-3 p-4"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary font-mono text-[10px]">{problem.id}</span><span className="min-w-0 flex-1"><strong className="block truncate text-sm">{problem.title}</strong><span className="text-[10px] text-muted-foreground">{problem.language} · {problem.difficulty}</span></span><Button variant="outline" size="sm" disabled={busy} onClick={() => deactivate(problem.id)}>停用</Button></div>)}</div> : <div className="p-12 text-center"><CheckCircle2 className="mx-auto size-8 text-muted-foreground/40" /><strong className="mt-3 block">尚無管理題目</strong><p className="mt-1 text-sm text-muted-foreground">可直接修改左側範例並匯入第一題。</p></div>}</section>
    </div>
  );
}
