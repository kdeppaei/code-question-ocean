'use client';

import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Braces,
  Bug,
  ChartNoAxesColumnIncreasing,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Cloud,
  CloudOff,
  Clock3,
  Code2,
  Database,
  Eye,
  EyeOff,
  FileCode2,
  Flame,
  House,
  Lightbulb,
  ListChecks,
  Loader2,
  Map,
  Moon,
  Plus,
  Play,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Star,
  Sun,
  TerminalSquare,
  TestTube2,
  Trophy,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { AdminPanel, LeaderboardPanel, type SessionInfo } from '@/components/platform-panels';
import { CoachPanel } from '@/components/coach-panel';
import {
  languageMeta,
  lessons,
  problems,
  type Difficulty,
  type Language,
  type Lesson,
  type Problem,
} from './content';
import { algorithmTracks } from './drills';

const CodeEditor = lazy(() => import('@/components/code-editor').then((module) => ({ default: module.CodeEditor })));

type View = 'home' | 'problems' | 'workspace' | 'learn' | 'algorithms' | 'progress' | 'favorites' | 'leaderboard' | 'admin';
type CodeFile = { id: string; name: string; content: string };
type PlatformProblem = Problem & { judgeReady?: boolean };
type RunResult = {
  label: string;
  input: string;
  output: string;
  passed: boolean;
  actual?: string;
  error?: string;
  status?: string;
  time?: string | null;
  memory?: number | null;
};
type SyncState = 'loading' | 'synced' | 'saving' | 'local' | 'error';
type HistoryItem = { id: number; passed: boolean; at: string };
type LearningState = {
  solved: number[];
  attempted: number[];
  wrong: number[];
  favorites: number[];
  submissions: number;
  successful: number;
  history: HistoryItem[];
  today: string;
  todayCount: number;
};

const emptyLearningState: LearningState = {
  solved: [], attempted: [], wrong: [], favorites: [], submissions: 0,
  successful: 0, history: [], today: '', todayCount: 0,
};

const languageIcons: Record<Language, typeof Braces> = {
  C: Braces,
  'C++': Code2,
  Python: TerminalSquare,
  SQL: Database,
  GDB: Bug,
};

const navItems: { view: View; label: string; icon: typeof House }[] = [
  { view: 'home', label: '學習總覽', icon: House },
  { view: 'problems', label: '題庫', icon: ListChecks },
  { view: 'learn', label: '教學路徑', icon: BookOpen },
  { view: 'algorithms', label: '演算法路線', icon: Map },
  { view: 'progress', label: '學習分析', icon: ChartNoAxesColumnIncreasing },
  { view: 'leaderboard', label: '排行榜', icon: Trophy },
  { view: 'favorites', label: '收藏題目', icon: Star },
];

const difficultyClass: Record<Difficulty, string> = {
  簡單: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300',
  中等: 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300',
  困難: 'text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300',
};

const dateKey = () => new Date().toISOString().slice(0, 10);

function normalizeCode(value: string) {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

function nextUnique(list: number[], value: number) {
  return list.includes(value) ? list : [...list, value];
}

const fileExtensions: Record<Language, string> = { C: 'c', 'C++': 'cpp', Python: 'py', SQL: 'sql', GDB: 'gdb' };

function initialFiles(problem: Problem): CodeFile[] {
  return [{ id: 'main', name: `solution.${fileExtensions[problem.language]}`, content: problem.starter }];
}

function parseDraft(problem: Problem, value: string | null): CodeFile[] {
  if (!value) return initialFiles(problem);
  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed) && parsed.every((file) => typeof file?.id === 'string' && typeof file?.name === 'string' && typeof file?.content === 'string')) {
      return parsed as CodeFile[];
    }
  } catch {
    // Older drafts were stored as plain source code.
  }
  return [{ ...initialFiles(problem)[0], content: value }];
}

function mergeLearningState(local: LearningState, remote: LearningState): LearningState {
  const mergeIds = (first: number[], second: number[]) => Array.from(new Set([...first, ...second]));
  const history = [...local.history, ...remote.history]
    .filter((item, index, items) => items.findIndex((candidate) => candidate.id === item.id && candidate.at === item.at && candidate.passed === item.passed) === index)
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 20);
  const today = dateKey();
  return {
    solved: mergeIds(local.solved, remote.solved),
    attempted: mergeIds(local.attempted, remote.attempted),
    wrong: mergeIds(local.wrong, remote.wrong).filter((id) => !local.solved.includes(id) && !remote.solved.includes(id)),
    favorites: mergeIds(local.favorites, remote.favorites),
    submissions: Math.max(local.submissions, remote.submissions),
    successful: Math.max(local.successful, remote.successful),
    history,
    today,
    todayCount: Math.max(local.today === today ? local.todayCount : 0, remote.today === today ? remote.todayCount : 0),
  };
}

function PageTitle({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <div>
      <p className="text-xs font-black tracking-[.14em] text-primary">{eyebrow}</p>
      <h1 className="mt-1 text-2xl font-black tracking-tight md:text-3xl">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
    </div>
  );
}

export default function Home() {
  const [view, setView] = useState<View>('home');
  const [selectedProblem, setSelectedProblem] = useState<PlatformProblem>(problems[0]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [files, setFiles] = useState<CodeFile[]>(initialFiles(problems[0]));
  const [activeFileId, setActiveFileId] = useState('main');
  const [results, setResults] = useState<RunResult[]>([]);
  const [resultMode, setResultMode] = useState<'idle' | 'run' | 'submit' | 'custom'>('idle');
  const [search, setSearch] = useState('');
  const [languageFilter, setLanguageFilter] = useState<'全部' | Language>('全部');
  const [difficultyFilter, setDifficultyFilter] = useState<'全部' | Difficulty>('全部');
  const [trackFilter, setTrackFilter] = useState('全部');
  const [problemPage, setProblemPage] = useState(1);
  const [learning, setLearning] = useState<LearningState>(emptyLearningState);
  const [hydrated, setHydrated] = useState(false);
  const [dark, setDark] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [judgeLoading, setJudgeLoading] = useState(false);
  const [judgeError, setJudgeError] = useState('');
  const [syncState, setSyncState] = useState<SyncState>('loading');
  const [syncEmail, setSyncEmail] = useState('');
  const [cloudReady, setCloudReady] = useState(false);
  const [editorNotice, setEditorNotice] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [customProblems, setCustomProblems] = useState<PlatformProblem[]>([]);
  const [judgeHealth, setJudgeHealth] = useState<{ online: boolean; engine: string; fallback: boolean } | null>(null);

  const activeFile = files.find((file) => file.id === activeFileId) || files[0];
  const code = activeFile?.content || '';
  const setCode = (value: string) => setFiles((current) => current.map((file) => file.id === activeFileId ? { ...file, content: value } : file));
  const submissionSource = files.map((file) => file.content).join('\n\n');
  const allProblems = useMemo(() => [...problems, ...customProblems].sort((a, b) => a.id - b.id), [customProblems]);
  const visibleNavItems = useMemo(() => session?.isAdmin
    ? [...navItems, { view: 'admin' as View, label: '題庫管理', icon: ShieldCheck }]
    : navItems, [session?.isAdmin]);

  const refreshCustomProblems = async () => {
    const response = await fetch('/api/problems', { headers: { accept: 'application/json' } });
    if (!response.ok) throw new Error('管理題庫暫時無法載入。');
    const payload = await response.json() as { problems?: PlatformProblem[] };
    setCustomProblems(payload.problems || []);
  };

  useEffect(() => {
    let active = true;
    let localState = emptyLearningState;
    try {
      const saved = localStorage.getItem('codedive-learning-v1');
      const theme = localStorage.getItem('codedive-theme');
      if (saved) localState = { ...emptyLearningState, ...JSON.parse(saved) };
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    } catch {
      // Corrupt local state falls back to an empty learning profile.
    }
    queueMicrotask(() => {
      if (!active) return;
      setLearning(localState);
      setDark(localStorage.getItem('codedive-theme') === 'dark');
      setHydrated(true);
    });

    fetch('/api/progress', { headers: { accept: 'application/json' } })
      .then(async (response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json() as Promise<{ state: LearningState | null; user?: { email?: string | null } }>;
      })
      .then((payload) => {
        if (!active) return;
        const remote = payload.state ? { ...emptyLearningState, ...payload.state } : emptyLearningState;
        setLearning(mergeLearningState(localState, remote));
        setSyncEmail(payload.user?.email || '');
        setCloudReady(true);
        setSyncState('synced');
      })
      .catch(() => {
        if (active) setSyncState('local');
      });

    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    fetch('/api/judge/health', { headers: { accept: 'application/json' } })
      .then((response) => response.json() as Promise<{ online: boolean; engine: string; fallback: boolean }>)
      .then((payload) => { if (active) setJudgeHealth(payload); })
      .catch(() => { if (active) setJudgeHealth({ online: false, engine: '判題服務離線', fallback: false }); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch('/api/session', { headers: { accept: 'application/json' } }).then((response) => response.json() as Promise<SessionInfo>),
      fetch('/api/problems', { headers: { accept: 'application/json' } }).then((response) => response.json() as Promise<{ problems?: PlatformProblem[] }>),
    ]).then(([sessionPayload, problemPayload]) => {
      if (!active) return;
      setSession(sessionPayload);
      setCustomProblems(problemPayload.problems || []);
    }).catch(() => {
      // The static problem library remains fully usable if optional platform APIs fail.
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('codedive-learning-v1', JSON.stringify(learning));
    if (!cloudReady) return;
    const timeout = window.setTimeout(() => {
      setSyncState('saving');
      fetch('/api/progress', {
        method: 'PUT',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ state: learning }),
      })
        .then(async (response) => {
          if (!response.ok) throw new Error(String(response.status));
          return response.json() as Promise<{ user?: { email?: string | null } }>;
        })
        .then((payload) => {
          setSyncEmail((current) => payload.user?.email || current);
          setSyncState('synced');
        })
        .catch(() => setSyncState('error'));
    }, 650);
    return () => window.clearTimeout(timeout);
  }, [learning, hydrated, cloudReady]);

  const todayCount = learning.today === dateKey() ? learning.todayCount : 0;
  const accuracy = learning.submissions ? Math.round((learning.successful / learning.submissions) * 100) : 0;
  const displayDate = hydrated
    ? new Intl.DateTimeFormat('zh-TW', { month: 'long', day: 'numeric', weekday: 'short' }).format(new Date())
    : '今日學習';

  const filteredProblems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return allProblems.filter((problem) => {
      const matchesQuery = !query || `${problem.title} ${problem.topic} ${problem.language}`.toLowerCase().includes(query);
      const matchesLanguage = languageFilter === '全部' || problem.language === languageFilter;
      const matchesDifficulty = difficultyFilter === '全部' || problem.difficulty === difficultyFilter;
      const track = algorithmTracks.find((item) => item.title === trackFilter);
      const matchesTrack = trackFilter === '全部' || problem.track === trackFilter || Boolean(track?.topics.includes(problem.topic));
      return matchesQuery && matchesLanguage && matchesDifficulty && matchesTrack;
    });
  }, [allProblems, search, languageFilter, difficultyFilter, trackFilter]);

  const pageSize = 25;
  const problemPageCount = Math.max(1, Math.ceil(filteredProblems.length / pageSize));
  const visibleProblems = filteredProblems.slice((problemPage - 1) * pageSize, problemPage * pageSize);

  const openProblem = (problem: PlatformProblem) => {
    setSelectedProblem(problem);
    const savedDraft = localStorage.getItem(`codedive-draft-${problem.id}`);
    const nextFiles = parseDraft(problem, savedDraft);
    setFiles(nextFiles);
    setActiveFileId(nextFiles[0].id);
    setResults([]);
    setResultMode('idle');
    setShowSolution(false);
    setJudgeError('');
    setEditorNotice(savedDraft ? '已載入上次儲存的草稿' : '');
    setView('workspace');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickStart = () => {
    const unsolved = allProblems.filter((problem) => !learning.solved.includes(problem.id));
    const pool = unsolved.length ? unsolved : allProblems;
    openProblem(pool[Math.floor(Math.random() * pool.length)]);
  };

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('codedive-theme', next ? 'dark' : 'light');
  };

  const toggleFavorite = (id: number) => {
    setLearning((current) => ({
      ...current,
      favorites: current.favorites.includes(id)
        ? current.favorites.filter((item) => item !== id)
        : [...current.favorites, id],
    }));
  };

  const saveDraft = () => {
    localStorage.setItem(`codedive-draft-${selectedProblem.id}`, JSON.stringify(files));
    setEditorNotice('草稿已儲存在這台裝置');
  };

  const addFile = () => {
    const nextNumber = files.length + 1;
    const id = `${Date.now()}-${nextNumber}`;
    setFiles((current) => [...current, { id, name: `helper${nextNumber}.${fileExtensions[selectedProblem.language]}`, content: '' }]);
    setActiveFileId(id);
    setEditorNotice('已新增檔案；支援 Judge0 多檔專案執行');
  };

  const renameFile = (id: string, name: string) => {
    setFiles((current) => current.map((file) => file.id === id ? { ...file, name: name.slice(0, 64) } : file));
    setResults([]);
    setResultMode('idle');
  };

  const moveFile = (id: string, direction: -1 | 1) => {
    setFiles((current) => {
      const index = current.findIndex((file) => file.id === id);
      const destination = index + direction;
      if (index < 0 || destination < 0 || destination >= current.length) return current;
      const next = [...current];
      [next[index], next[destination]] = [next[destination], next[index]];
      return next;
    });
    setEditorNotice('已更新檔案順序');
  };

  const removeFile = (id: string) => {
    if (files.length <= 1) return;
    const next = files.filter((file) => file.id !== id);
    setFiles(next);
    if (activeFileId === id) setActiveFileId(next[0].id);
    setResults([]);
    setResultMode('idle');
  };

  const recordSubmission = (passed: boolean) => {
    const id = selectedProblem.id;
    setLearning((current) => {
      const isToday = current.today === dateKey();
      return {
        ...current,
        attempted: nextUnique(current.attempted, id),
        solved: passed ? nextUnique(current.solved, id) : current.solved,
        wrong: passed ? current.wrong.filter((item) => item !== id) : nextUnique(current.wrong, id),
        submissions: current.submissions + 1,
        successful: current.successful + (passed ? 1 : 0),
        history: [{ id, passed, at: new Date().toISOString() }, ...current.history].slice(0, 20),
        today: dateKey(),
        todayCount: (isToday ? current.todayCount : 0) + (passed && !current.solved.includes(id) ? 1 : 0),
      };
    });
  };

  const evaluate = async (mode: 'run' | 'submit' | 'custom') => {
    setJudgeError('');
    setJudgeLoading(true);
    const usesSandbox = selectedProblem.language !== 'GDB' && (selectedProblem.id < 1000 || selectedProblem.judgeReady);
    if (usesSandbox) {
      try {
        const response = await fetch('/api/judge', {
          method: 'POST',
          headers: { 'content-type': 'application/json', accept: 'application/json' },
          body: JSON.stringify({ problemId: selectedProblem.id, source: submissionSource, files, mode, customInput: mode === 'custom' ? customInput : undefined }),
        });
        const payload = await response.json() as { results?: RunResult[]; error?: string };
        if (!response.ok || !payload.results) throw new Error(payload.error || '安全判題服務暫時無法使用。');
        const passed = payload.results.every((item) => item.passed);
        setResults(payload.results);
        setResultMode(mode);
        if (mode === 'submit') recordSubmission(passed);
      } catch (error) {
        setJudgeError(error instanceof Error ? error.message : '安全判題服務暫時無法使用。');
      } finally {
        setJudgeLoading(false);
      }
      return;
    }

    if (mode === 'custom') {
      setJudgeError('自訂輸入目前支援內建安全沙箱題；這題請使用範例測試。');
      setJudgeLoading(false);
      return;
    }
    const normalized = normalizeCode(submissionSource);
    const checks = mode === 'run' ? selectedProblem.checks.slice(0, 2) : selectedProblem.checks;
    const evaluated = checks.map((check) => ({
      label: check.label,
      input: check.input,
      output: check.output,
      passed: check.tokens.every((token) => normalized.includes(normalizeCode(token))),
    }));
    const passed = evaluated.every((item) => item.passed);
    setResults(evaluated);
    setResultMode(mode);
    if (mode === 'submit') recordSubmission(passed);
    setJudgeLoading(false);
  };

  const changeView = (next: View) => {
    setView(next);
    if (next !== 'learn') setSelectedLesson(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a href="#main-content" className="fixed left-3 top-3 z-50 -translate-y-24 rounded-lg bg-primary px-4 py-2 font-bold text-primary-foreground focus:translate-y-0">跳到主要內容</a>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r bg-sidebar px-3 py-4 lg:flex lg:flex-col">
        <button onClick={() => changeView('home')} className="flex items-center gap-3 rounded-xl px-2 py-2 text-left">
          <span className="grid size-10 place-items-center rounded-xl bg-primary font-mono text-sm font-black text-primary-foreground">{'</>'}</span>
          <span><span className="block text-[10px] font-black tracking-[.18em] text-primary">CODEDIVE</span><strong className="block text-base">程式題海</strong></span>
        </button>
        <nav className="mt-7 grid gap-1" aria-label="主要導覽">
          {visibleNavItems.map(({ view: itemView, label, icon: Icon }) => (
            <Button key={itemView} variant="ghost" onClick={() => changeView(itemView)} className={`h-11 justify-start gap-3 px-3 ${view === itemView || (view === 'workspace' && itemView === 'problems') ? 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary' : 'text-muted-foreground'}`}>
              <Icon className="size-[18px]" />{label}
              {itemView === 'favorites' && learning.favorites.length > 0 && <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 text-[10px]">{learning.favorites.length}</span>}
            </Button>
          ))}
        </nav>

        <div className="mt-7 px-3">
          <div className="mb-2 flex items-center justify-between text-xs"><span className="font-bold">每日目標</span><span className="font-mono text-primary">{Math.min(todayCount, 10)} / 10</span></div>
          <Progress value={Math.min(todayCount * 10, 100)} className="[&_[data-slot=progress-track]]:h-1.5" />
        </div>
        <div className="mt-auto rounded-xl border bg-primary/5 p-4 text-xs leading-5 text-muted-foreground">
          <strong className="mb-1 flex items-center gap-2 text-foreground">
            {syncState === 'saving' || syncState === 'loading' ? <Loader2 className="size-4 animate-spin text-primary" /> : syncState === 'synced' ? <Cloud className="size-4 text-emerald-600" /> : <CloudOff className="size-4 text-amber-600" />}
            {syncState === 'synced' ? '跨裝置雲端同步' : syncState === 'saving' ? '正在同步進度' : '本機學習紀錄'}
          </strong>
          {syncState === 'synced' ? (syncEmail || '進度已安全儲存至帳號') : syncState === 'error' ? '雲端暫時無法連線，進度仍保留在本機。' : '答題、錯題與收藏會先自動留在這台裝置。'}
        </div>
      </aside>

      <main className="min-h-screen pb-20 lg:pb-0 lg:pl-60" id="main-content" tabIndex={-1}>
        <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[1480px] items-center justify-between gap-4 px-4 md:px-7">
            <div className="flex min-w-0 items-center gap-3 lg:hidden">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary font-mono text-xs font-black text-primary-foreground">{'</>'}</span>
              <div className="min-w-0"><strong className="block truncate">CodeDive 程式題海</strong><span className="block text-[10px] text-muted-foreground">LEARN · CODE · PRACTICE</span></div>
            </div>
            <div className="hidden min-w-0 lg:block">
              <p className="text-[11px] font-bold text-primary">{displayDate}</p>
              <strong className="block truncate text-lg">{view === 'workspace' ? `${selectedProblem.id}. ${selectedProblem.title}` : visibleNavItems.find((item) => item.view === view)?.label || '程式題海'}</strong>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden items-center gap-1.5 text-xs text-muted-foreground md:flex">
                {syncState === 'synced' ? <Cloud className="size-4 text-emerald-600" /> : syncState === 'saving' || syncState === 'loading' ? <Loader2 className="size-4 animate-spin" /> : <CloudOff className="size-4 text-amber-600" />}
                {syncState === 'synced' ? '已同步' : syncState === 'saving' ? '同步中' : '本機模式'}
              </span>
              <Button variant="outline" className="hidden h-9 gap-2 sm:flex" onClick={quickStart}><Play className="size-4" />隨機一題</Button>
              {session && !session.authenticated && <a className="hidden h-9 items-center rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground sm:flex" href={session.signInPath} target="_top">登入同步</a>}
              {session?.authenticated && <button className="hidden max-w-36 truncate text-xs font-bold text-muted-foreground hover:text-primary md:block" onClick={() => changeView('leaderboard')} title={session.user?.email}>{session.user?.name || '我的帳號'}</button>}
              <Button aria-label="切換深色模式" variant="outline" size="icon-lg" onClick={toggleTheme}>{dark ? <Sun /> : <Moon />}</Button>
            </div>
          </div>
        </header>

        {view === 'home' && (
          <div className="mx-auto max-w-[1380px] space-y-7 p-4 md:p-7">
            <section className="relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm md:p-8">
              <div className="absolute -right-16 -top-20 size-64 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
              <div className="relative grid gap-8 xl:grid-cols-[1.35fr_.65fr] xl:items-end">
                <div>
                  <Badge className="mb-4 bg-primary/10 text-primary"><Flame className="mr-1 size-3" />今日學習工作台</Badge>
                  <h1 className="max-w-3xl text-3xl font-black leading-[1.13] tracking-[-.04em] md:text-5xl">學懂觀念，寫出程式，<br className="hidden sm:block" />用題目驗證自己。</h1>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">以 LeetCode 式解題流程為核心，串起 C、C++、Python、SQL 與 GDB 的繁體中文教學。每題都有提示、範例、結構檢查與詳解。</p>
                  <div className="mt-6 flex flex-wrap gap-2"><Button className="h-11 gap-2 px-5" onClick={() => changeView('problems')}><ListChecks />開始選題</Button><Button className="h-11 gap-2 px-5" variant="outline" onClick={() => changeView('algorithms')}><Map />演算法路線</Button><Button className="h-11 gap-2 px-5" variant="outline" onClick={() => changeView('learn')}><BookOpen />先看教學</Button></div>
                </div>
                <div className="rounded-2xl border bg-secondary/60 p-5">
                  <div className="flex items-center justify-between"><div><p className="text-xs font-bold text-muted-foreground">TODAY</p><strong className="mt-1 block text-lg">每日 10 題</strong></div><span className="font-mono text-2xl font-black text-primary">{Math.min(todayCount, 10)}<small className="text-sm text-muted-foreground"> / 10</small></span></div>
                  <Progress value={Math.min(todayCount * 10, 100)} className="mt-5 [&_[data-slot=progress-track]]:h-2" />
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">{todayCount ? '今天已經開始累積，繼續保持節奏。' : '完成第一題，建立今天的學習紀錄。'}</p>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                ['題庫總量', `${allProblems.length}`, '五個專項'],
                ['已解決', `${learning.solved.length}`, `完成 ${Math.round((learning.solved.length / allProblems.length) * 100)}%`],
                ['提交正確率', `${accuracy}%`, `${learning.submissions} 次提交`],
                ['待複習', `${learning.wrong.length}`, '來自未通過題目'],
              ].map(([label, value, foot]) => <article key={label} className="rounded-xl border bg-card p-4 shadow-sm md:p-5"><span className="text-xs font-bold text-muted-foreground">{label}</span><strong className="mt-2 block font-mono text-2xl font-black md:text-3xl">{value}</strong><span className="mt-1 block text-[11px] text-muted-foreground">{foot}</span></article>)}
            </section>

            <section>
              <div className="mb-4 flex items-end justify-between"><div><h2 className="text-xl font-black">五條專項路線</h2><p className="mt-1 text-sm text-muted-foreground">每條路線都有教學章節與漸進題目。</p></div><Button variant="ghost" className="hidden text-primary sm:flex" onClick={() => changeView('problems')}>全部題目 <ChevronRight /></Button></div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
                {(Object.keys(languageMeta) as Language[]).map((language) => {
                  const meta = languageMeta[language];
                  const Icon = languageIcons[language];
                  const total = allProblems.filter((problem) => problem.language === language).length;
                  const solved = allProblems.filter((problem) => problem.language === language && learning.solved.includes(problem.id)).length;
                  return <button key={language} onClick={() => { setLanguageFilter(language); setProblemPage(1); changeView('problems'); }} className="group rounded-2xl border bg-card p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md md:p-5"><span className="mb-5 grid size-11 place-items-center rounded-xl" style={{ background: meta.soft, color: meta.color }}><Icon className="size-5" /></span><div className="flex items-center justify-between"><strong className="text-lg">{language}</strong><span className="font-mono text-[10px] text-muted-foreground">{solved}/{total}</span></div><p className="mt-1 min-h-10 text-xs leading-5 text-muted-foreground">{meta.description}</p><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full transition-all" style={{ width: `${total ? solved / total * 100 : 0}%`, background: meta.color }} /></div></button>;
                })}
              </div>
            </section>

            <section className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
              <div className="rounded-2xl border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b p-5"><div><h2 className="font-black">建議下一題</h2><p className="mt-1 text-xs text-muted-foreground">依尚未完成的題目推薦</p></div><Button variant="ghost" size="sm" onClick={() => changeView('problems')}>瀏覽題庫</Button></div>
                <div className="divide-y">{allProblems.filter((p) => !learning.solved.includes(p.id)).slice(0, 4).map((problem) => <ProblemRow key={problem.id} problem={problem} learning={learning} onOpen={openProblem} />)}</div>
              </div>
              <aside className="rounded-2xl border bg-[#edf6ff] p-6 text-[#17365d] shadow-sm dark:bg-blue-950/40 dark:text-blue-100">
                <div className="flex items-center gap-2 text-xs font-black tracking-[.12em] text-primary"><BookOpen className="size-4" />LEARN → PRACTICE</div>
                <h2 className="mt-4 text-2xl font-black">今天先弄懂<br />「指標與記憶體」</h2>
                <p className="mt-3 text-sm leading-6 text-[#546d88] dark:text-blue-200/70">8 分鐘短篇教學，接著用 C 指標交換題立即驗證。</p>
                <pre className="my-5 overflow-hidden rounded-xl bg-white/80 p-4 font-mono text-xs leading-6 text-slate-700 dark:bg-slate-950/70 dark:text-slate-200"><code>{'int *p = &score;\n*p += 5;'}</code></pre>
                <Button variant="outline" className="w-full justify-between border-primary/20 bg-white text-primary dark:bg-slate-950" onClick={() => { setSelectedLesson(lessons[0]); changeView('learn'); }}>開啟教學 <ChevronRight /></Button>
              </aside>
            </section>
          </div>
        )}

        {view === 'problems' && (
          <div className="mx-auto max-w-[1380px] space-y-6 p-4 md:p-7">
            <PageTitle eyebrow="PROBLEM SET" title="選一題，開始解題" copy={`${allProblems.length} 題依語言、難度與演算法路線整理；每題都能直接顯示解答。`} />
            {trackFilter !== '全部' && <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3"><div><span className="text-xs font-black text-primary">目前路線</span><strong className="ml-2 text-sm">{trackFilter}</strong></div><Button variant="ghost" size="sm" onClick={() => { setTrackFilter('全部'); setProblemPage(1); }}>清除路線篩選</Button></div>}
            <div className="grid gap-3 rounded-2xl border bg-card p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_auto_auto]">
              <div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => { setSearch(event.target.value); setProblemPage(1); }} placeholder="搜尋題目或主題…" className="h-10 pl-9" aria-label="搜尋題目" /></div>
              <select value={languageFilter} onChange={(event) => { setLanguageFilter(event.target.value as '全部' | Language); setProblemPage(1); }} className="h-10 rounded-lg border bg-background px-3 text-sm" aria-label="語言篩選"><option>全部</option>{Object.keys(languageMeta).map((language) => <option key={language}>{language}</option>)}</select>
              <select value={difficultyFilter} onChange={(event) => { setDifficultyFilter(event.target.value as '全部' | Difficulty); setProblemPage(1); }} className="h-10 rounded-lg border bg-background px-3 text-sm" aria-label="難度篩選"><option>全部</option><option>簡單</option><option>中等</option><option>困難</option></select>
            </div>
            <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
              <div className="hidden grid-cols-[60px_minmax(280px,1fr)_120px_120px_110px] gap-3 border-b bg-secondary/50 px-5 py-3 text-xs font-bold text-muted-foreground md:grid"><span>狀態</span><span>題目</span><span>專項</span><span>難度</span><span>通過率</span></div>
              <div className="divide-y">{filteredProblems.length ? visibleProblems.map((problem) => <ProblemRow key={problem.id} problem={problem} learning={learning} onOpen={openProblem} detailed />) : <div className="p-12 text-center"><Search className="mx-auto size-8 text-muted-foreground/50" /><strong className="mt-3 block">找不到符合的題目</strong><p className="mt-1 text-sm text-muted-foreground">請調整搜尋文字或篩選條件。</p></div>}</div>
              {filteredProblems.length > 0 && <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-secondary/20 px-4 py-3"><span className="text-xs text-muted-foreground">共 {filteredProblems.length} 題 · 第 {problemPage} / {problemPageCount} 頁</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={problemPage === 1} onClick={() => setProblemPage((page) => Math.max(1, page - 1))}>上一頁</Button><Button variant="outline" size="sm" disabled={problemPage === problemPageCount} onClick={() => setProblemPage((page) => Math.min(problemPageCount, page + 1))}>下一頁</Button></div></div>}
            </div>
          </div>
        )}

        {view === 'workspace' && (
          <div className="mx-auto max-w-[1600px] p-3 md:p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-card p-2 shadow-sm">
              <Button variant="ghost" className="gap-2" onClick={() => changeView('problems')}><ArrowLeft />返回題庫</Button>
              <div className="flex items-center gap-1"><Button variant="ghost" size="icon" aria-label="收藏題目" onClick={() => toggleFavorite(selectedProblem.id)}><Star className={learning.favorites.includes(selectedProblem.id) ? 'fill-amber-400 text-amber-500' : ''} /></Button><Button variant="ghost" size="sm" onClick={() => { const index = allProblems.findIndex((problem) => problem.id === selectedProblem.id); openProblem(allProblems[(index + 1) % allProblems.length]); }}>下一題 <ChevronRight /></Button></div>
            </div>
            <div className="grid min-h-[calc(100vh-145px)] gap-3 xl:grid-cols-[.88fr_1.12fr]">
              <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                <div className="border-b px-5 py-4"><div className="flex flex-wrap items-center gap-2"><Badge variant="outline">{selectedProblem.language}</Badge><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${difficultyClass[selectedProblem.difficulty]}`}>{selectedProblem.difficulty}</span><span className="text-xs text-muted-foreground">{selectedProblem.topic}</span></div><h1 className="mt-4 text-2xl font-black tracking-tight">{selectedProblem.id}. {selectedProblem.title}</h1><div className="mt-3 flex gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1"><CheckCircle2 className="size-3.5" />通過率 {selectedProblem.acceptance}%</span><span className="flex items-center gap-1"><Star className="size-3.5" />{learning.favorites.includes(selectedProblem.id) ? '已收藏' : '可收藏'}</span></div></div>
                <div className="space-y-6 p-5 text-sm leading-7 md:p-6">
                  <div><h2 className="mb-2 font-black">題目描述</h2><p className="text-muted-foreground">{selectedProblem.description}</p><p className="mt-3">{selectedProblem.task}</p></div>
                  <div className="space-y-3">{selectedProblem.examples.map((example, index) => <div key={index}><h3 className="mb-2 text-xs font-black">範例 {index + 1}</h3><div className="rounded-xl bg-secondary/70 p-4 font-mono text-xs leading-6"><div><span className="text-muted-foreground">輸入：</span>{example.input}</div><div><span className="text-muted-foreground">輸出：</span>{example.output}</div>{example.note && <div className="mt-1 text-muted-foreground">說明：{example.note}</div>}</div></div>)}</div>
                  <div><h2 className="mb-2 font-black">限制</h2><ul className="list-inside list-disc space-y-1 text-muted-foreground">{selectedProblem.constraints.map((item) => <li key={item}>{item}</li>)}</ul></div>
                  <details className="rounded-xl border bg-secondary/30 p-4"><summary className="flex cursor-pointer list-none items-center gap-2 font-bold text-primary"><Lightbulb className="size-4" />需要提示？</summary><ol className="mt-3 list-inside list-decimal space-y-2 text-muted-foreground">{selectedProblem.hints.map((hint) => <li key={hint}>{hint}</li>)}</ol></details>
                </div>
              </section>

              <section className="flex min-h-[680px] flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b bg-[#111827] px-4 py-3 text-slate-100"><div className="flex items-center gap-2"><Code2 className="size-4 text-blue-400" /><strong className="text-sm">智慧解答編輯器</strong>{editorNotice && <span className="hidden text-[10px] text-emerald-400 sm:inline">✓ {editorNotice}</span>}</div><div className="flex items-center gap-2"><Badge className="hidden border-white/10 bg-white/10 text-slate-300 sm:inline-flex">自動完成</Badge><Badge className="border-white/10 bg-white/10 text-slate-200">{selectedProblem.language}</Badge></div></div>
                <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-700 bg-[#0d1321] px-2 pt-2 text-slate-300">
                  {files.map((file, index) => <div key={file.id} className={`flex shrink-0 items-center rounded-t-lg border border-b-0 ${file.id === activeFileId ? 'border-slate-600 bg-[#111827] text-white' : 'border-transparent bg-slate-900/50'}`}><FileCode2 className="ml-2 size-3.5 shrink-0" /><input value={file.name} maxLength={64} aria-label={`檔名 ${index + 1}`} onFocus={() => setActiveFileId(file.id)} onChange={(event) => renameFile(file.id, event.target.value)} className="w-28 bg-transparent px-1 py-2 font-mono text-[11px] outline-none" /><button className="rounded p-1 text-slate-500 hover:bg-white/10 hover:text-white disabled:opacity-25" aria-label={`將 ${file.name} 向左移`} disabled={index === 0} onClick={() => moveFile(file.id, -1)}><ArrowLeft className="size-3" /></button><button className="rounded p-1 text-slate-500 hover:bg-white/10 hover:text-white disabled:opacity-25" aria-label={`將 ${file.name} 向右移`} disabled={index === files.length - 1} onClick={() => moveFile(file.id, 1)}><ArrowRight className="size-3" /></button>{files.length > 1 && <button className="mr-1 rounded p-1 text-slate-500 hover:bg-white/10 hover:text-white" aria-label={`刪除 ${file.name}`} onClick={() => removeFile(file.id)}>×</button>}</div>)}
                  <button className="mb-1 grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white" aria-label="新增檔案" onClick={addFile}><Plus className="size-4" /></button>
                  {files.length > 1 && <span className="mb-1 shrink-0 rounded-full bg-violet-500/15 px-2 py-1 text-[9px] font-bold text-violet-300">MULTI-FILE</span>}
                </div>
                <Suspense fallback={<div className="grid min-h-[390px] flex-1 place-items-center bg-[#0d1321] text-sm text-slate-400"><span className="flex items-center gap-2"><Loader2 className="size-4 animate-spin" />載入智慧編輯器…</span></div>}><CodeEditor value={code} language={selectedProblem.language} onChange={(value) => { setCode(value); setResultMode('idle'); setResults([]); setJudgeError(''); setEditorNotice(''); }} onRun={() => void evaluate('run')} onSubmit={() => void evaluate('submit')} onSave={saveDraft} /></Suspense>
                <details className="border-t bg-secondary/20 px-4 py-3">
                  <summary className="cursor-pointer text-xs font-bold text-primary">自訂測試輸入</summary>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row"><Textarea value={customInput} onChange={(event) => setCustomInput(event.target.value)} className="min-h-20 flex-1 font-mono text-xs" maxLength={10000} placeholder="輸入傳給題目測試包裝器的 stdin…" aria-label="自訂測試輸入" /><Button variant="outline" className="gap-2 self-end" disabled={judgeLoading || selectedProblem.language === 'GDB' || (selectedProblem.id >= 1000 && !selectedProblem.judgeReady)} onClick={() => void evaluate('custom')}><Play />執行自訂測試</Button></div>
                  {(selectedProblem.language === 'GDB' || (selectedProblem.id >= 1000 && !selectedProblem.judgeReady)) && <p className="mt-2 text-[11px] text-muted-foreground">這題採結構判題，請使用內建範例測試。</p>}
                </details>
                <div className="border-t">
                  <div className="flex items-center justify-between border-b px-4 py-3"><strong className="flex items-center gap-2 text-sm"><TestTube2 className="size-4 text-primary" />測試結果</strong><span className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className={`size-1.5 rounded-full ${selectedProblem.language === 'GDB' || (selectedProblem.id >= 1000 && !selectedProblem.judgeReady) ? 'bg-slate-400' : judgeHealth?.online ? 'bg-emerald-500' : 'bg-amber-500'}`} />{selectedProblem.language !== 'GDB' && (selectedProblem.id < 1000 || selectedProblem.judgeReady) ? `${files.length > 1 ? '多檔專案 · ' : ''}${judgeHealth?.engine || '檢查沙箱中'}` : '引導式結構判題'}</span></div>
                  <div className="min-h-36 p-4">
                    {judgeLoading ? <div className="grid min-h-28 place-items-center text-center"><div><Loader2 className="mx-auto size-6 animate-spin text-primary" /><p className="mt-2 text-sm text-muted-foreground">正在安全沙箱編譯並執行測試…</p></div></div> : judgeError ? <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300"><strong className="flex items-center gap-2"><XCircle className="size-4" />判題未完成</strong><p className="mt-2">{judgeError}</p></div> : resultMode === 'idle' ? <div className="grid min-h-28 place-items-center text-center"><div><TerminalSquare className="mx-auto size-6 text-muted-foreground/50" /><p className="mt-2 text-sm text-muted-foreground">按「執行測試」檢查兩個範例，或提交全部測試。</p></div></div> : <div><div className={`mb-3 flex items-center gap-2 font-bold ${results.every((result) => result.passed) ? 'text-emerald-600' : 'text-rose-600'}`}>{results.every((result) => result.passed) ? <CheckCircle2 className="size-5" /> : <XCircle className="size-5" />}{results.every((result) => result.passed) ? (resultMode === 'submit' ? '全部通過，提交成功！' : resultMode === 'custom' ? '自訂測試執行完成' : '範例測試通過') : '還有測試未通過'}</div><div className="grid gap-2 sm:grid-cols-3">{results.map((result) => <div key={result.label} className={`rounded-lg border p-3 text-xs ${result.passed ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30' : 'border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30'}`}><div className="flex items-center gap-1 font-bold">{result.passed ? <Check className="size-3.5 text-emerald-600" /> : <XCircle className="size-3.5 text-rose-600" />}{result.label}</div><p className="mt-1 truncate text-muted-foreground">輸入：{result.input}</p><p className="truncate text-muted-foreground">預期：{result.output}</p>{result.actual !== undefined && <p className="truncate text-muted-foreground">實際：{result.actual || '（無輸出）'}</p>}{result.error && <p className="mt-2 line-clamp-3 text-rose-600">{result.error}</p>}</div>)}</div></div>}
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t bg-secondary/30 p-3"><div className="flex flex-wrap gap-2"><Button variant="ghost" className="gap-2 text-muted-foreground" onClick={() => { const resetFiles = initialFiles(selectedProblem); setFiles(resetFiles); setActiveFileId(resetFiles[0].id); setResults([]); setResultMode('idle'); setJudgeError(''); }}><RotateCcw />重設</Button><Button variant="outline" className="gap-2" onClick={() => setShowSolution((visible) => !visible)}>{showSolution ? <EyeOff /> : <Eye />}{showSolution ? '隱藏解答' : '顯示解答'}</Button></div><div className="flex gap-2"><Button variant="outline" className="gap-2" disabled={judgeLoading} onClick={() => void evaluate('run')}>{judgeLoading ? <Loader2 className="animate-spin" /> : <Play />}執行測試</Button><Button className="gap-2 bg-emerald-600 hover:bg-emerald-700" disabled={judgeLoading} onClick={() => void evaluate('submit')}>{judgeLoading ? <Loader2 className="animate-spin" /> : <Send />}提交解答</Button></div></div>
              </section>
            </div>

            <CoachPanel
              problem={selectedProblem}
              source={submissionSource}
              fileCount={files.length}
              judgeMessage={[judgeError, ...results.map((result) => result.error || result.status || '')].filter(Boolean).join('\n')}
              learning={{ solved: learning.solved.length, wrong: learning.wrong.length, submissions: learning.submissions, accuracy }}
              session={session}
            />
            {showSolution && <section className="mt-3 rounded-xl border border-primary/20 bg-card p-6 shadow-sm" aria-live="polite"><div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Eye className="size-5" /></span><div className="min-w-0 flex-1"><p className="text-xs font-black tracking-[.12em] text-primary">REFERENCE SOLUTION</p><h2 className="mt-1 text-xl font-black">參考解答與思路</h2><p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">{selectedProblem.explanation}</p><pre className="mt-4 overflow-x-auto rounded-xl bg-[#111827] p-5 font-mono text-xs leading-6 text-slate-100"><code>{selectedProblem.solution}</code></pre></div></div></section>}
            {resultMode === 'submit' && results.every((result) => result.passed) && <section className="mt-3 rounded-xl border bg-emerald-50 p-5 text-emerald-800 shadow-sm dark:bg-emerald-950/30 dark:text-emerald-200"><div className="flex items-center gap-3"><Trophy className="size-5" /><div><strong>提交成功，這題已記入學習進度。</strong><p className="mt-1 text-xs opacity-80">可以前往下一題，或用上方按鈕比較參考解答。</p></div></div></section>}
          </div>
        )}

        {view === 'learn' && (
          <div className="mx-auto max-w-[1380px] p-4 md:p-7">
            {selectedLesson ? <LessonArticle lesson={selectedLesson} onBack={() => setSelectedLesson(null)} onPractice={(id) => openProblem(allProblems.find((problem) => problem.id === id) || allProblems[0])} /> : <>
              <PageTitle eyebrow="LEARNING PATHS" title="短篇教學，讀完立刻練" copy="內容採小章節設計，像 W3Schools 一樣容易查閱；每章都連到一題可動手驗證的練習。" />
              <div className="mt-7 space-y-8">{(Object.keys(languageMeta) as Language[]).map((language) => { const meta = languageMeta[language]; const Icon = languageIcons[language]; return <section key={language}><div className="mb-3 flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl" style={{ background: meta.soft, color: meta.color }}><Icon className="size-5" /></span><div><h2 className="text-lg font-black">{language} 學習路徑</h2><p className="text-xs text-muted-foreground">{meta.description}</p></div></div><div className="grid gap-3 md:grid-cols-3">{lessons.filter((lesson) => lesson.language === language).map((lesson, index) => <button key={lesson.id} onClick={() => setSelectedLesson(lesson)} className="group rounded-2xl border bg-card p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"><div className="flex items-center justify-between"><span className="font-mono text-xs font-black text-primary">{String(index + 1).padStart(2, '0')}</span><span className="rounded-full bg-secondary px-2 py-1 text-[10px] font-bold text-muted-foreground">{lesson.level} · {lesson.minutes} 分鐘</span></div><h3 className="mt-5 text-lg font-black group-hover:text-primary">{lesson.title}</h3><p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">{lesson.description}</p><span className="mt-5 flex items-center gap-1 text-xs font-bold text-primary">開始閱讀 <ChevronRight className="size-3" /></span></button>)}</div></section>; })}</div>
            </>}
          </div>
        )}

        {view === 'algorithms' && (
          <div className="mx-auto max-w-[1380px] space-y-7 p-4 md:p-7">
            <PageTitle eyebrow="ALGORITHM ROADMAP" title="從基礎資料結構，一路練到實戰" copy="依主題安排練習順序。先讀懂觀念，再進入對應題組反覆演練。" />
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {algorithmTracks.map((track, index) => {
                const trackProblems = allProblems.filter((problem) => problem.track === track.title || track.topics.includes(problem.topic));
                const solved = trackProblems.filter((problem) => learning.solved.includes(problem.id)).length;
                const percent = trackProblems.length ? Math.round((solved / trackProblems.length) * 100) : 0;
                return <button key={track.id} onClick={() => { setTrackFilter(track.title); setSearch(''); setLanguageFilter('全部'); setDifficultyFilter('全部'); setProblemPage(1); changeView('problems'); }} className="group rounded-2xl border bg-card p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md md:p-6"><div className="flex items-start justify-between"><span className="grid size-11 place-items-center rounded-xl font-mono text-sm font-black text-white" style={{ background: track.color }}>{String(index + 1).padStart(2, '0')}</span><Badge variant="outline">{trackProblems.length} 題</Badge></div><h2 className="mt-5 text-xl font-black group-hover:text-primary">{track.title}</h2><p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">{track.description}</p><div className="mt-5 flex items-center justify-between text-xs"><span className="text-muted-foreground">完成 {solved} / {trackProblems.length}</span><strong style={{ color: track.color }}>{percent}%</strong></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full transition-all" style={{ width: `${percent}%`, background: track.color }} /></div><span className="mt-5 flex items-center gap-1 text-xs font-bold text-primary">開啟題組 <ChevronRight className="size-3" /></span></button>;
              })}
            </section>
            <section className="rounded-2xl border bg-card p-5 shadow-sm md:p-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="font-black">建議順序</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">陣列與字串 → 排序與搜尋 → 雜湊與集合 → 雙指標 → 資料結構 → 樹與圖論 → 動態規劃；SQL、系統與除錯可平行進行。</p></div><Button className="shrink-0 gap-2" onClick={() => { setTrackFilter('陣列與字串'); setProblemPage(1); changeView('problems'); }}><Play />從第一站開始</Button></div></section>
          </div>
        )}

        {view === 'progress' && (
          <div className="mx-auto max-w-[1180px] space-y-7 p-4 md:p-7">
            <PageTitle eyebrow="LEARNING ANALYTICS" title="看見進步，也看見下一步" copy="已解題目、提交結果與收藏會保存於本機，登入狀態下也會同步到其他裝置。" />
            <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[
              { label: '已解題', value: learning.solved.length, icon: CheckCircle2, color: 'text-emerald-600' },
              { label: '總提交', value: learning.submissions, icon: Send, color: 'text-blue-600' },
              { label: '正確率', value: `${accuracy}%`, icon: Trophy, color: 'text-amber-600' },
              { label: '收藏', value: learning.favorites.length, icon: Star, color: 'text-violet-600' },
            ].map(({ label, value, icon: Icon, color }) => <article key={label} className="rounded-2xl border bg-card p-5 shadow-sm"><Icon className={`size-5 ${color}`} /><span className="mt-5 block text-xs font-bold text-muted-foreground">{label}</span><strong className="mt-1 block font-mono text-3xl font-black">{value}</strong></article>)}</section>
            <section className="grid gap-5 lg:grid-cols-[1fr_.8fr]">
              <article className="rounded-2xl border bg-card p-5 shadow-sm md:p-6"><h2 className="font-black">各專項完成度</h2><div className="mt-6 space-y-5">{(Object.keys(languageMeta) as Language[]).map((language) => { const meta = languageMeta[language]; const total = allProblems.filter((problem) => problem.language === language).length; const solved = allProblems.filter((problem) => problem.language === language && learning.solved.includes(problem.id)).length; return <div key={language}><div className="mb-2 flex items-center justify-between text-sm"><strong>{language}</strong><span className="font-mono text-xs text-muted-foreground">{solved} / {total}</span></div><div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full" style={{ width: `${total ? solved / total * 100 : 0}%`, background: meta.color }} /></div></div>; })}</div></article>
              <article className="rounded-2xl border bg-card shadow-sm"><div className="border-b p-5"><h2 className="font-black">最近提交</h2></div>{learning.history.length ? <div className="divide-y">{learning.history.slice(0, 7).map((item, index) => { const problem = allProblems.find((p) => p.id === item.id); if (!problem) return null; return <button key={`${item.at}-${index}`} onClick={() => openProblem(problem)} className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-secondary/50"><span className={`grid size-7 place-items-center rounded-full ${item.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{item.passed ? <Check className="size-4" /> : <XCircle className="size-4" />}</span><span className="min-w-0 flex-1"><strong className="block truncate text-sm">{problem.id}. {problem.title}</strong><span className="text-[10px] text-muted-foreground">{new Intl.DateTimeFormat('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(item.at))}</span></span><ChevronRight className="size-4 text-muted-foreground" /></button>; })}</div> : <div className="p-10 text-center text-sm text-muted-foreground">提交解答後，紀錄會出現在這裡。</div>}</article>
            </section>
          </div>
        )}

        {view === 'favorites' && (
          <div className="mx-auto max-w-[1180px] space-y-6 p-4 md:p-7">
            <PageTitle eyebrow="SAVED PROBLEMS" title="收藏題目" copy="把想重做或稍後研究的題目集中在這裡。" />
            <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">{learning.favorites.length ? <div className="divide-y">{allProblems.filter((problem) => learning.favorites.includes(problem.id)).map((problem) => <ProblemRow key={problem.id} problem={problem} learning={learning} onOpen={openProblem} detailed />)}</div> : <div className="p-16 text-center"><Star className="mx-auto size-9 text-muted-foreground/40" /><strong className="mt-4 block">還沒有收藏題目</strong><p className="mt-1 text-sm text-muted-foreground">在解題頁按星號，就能把題目收進這裡。</p><Button className="mt-5" onClick={() => changeView('problems')}>前往題庫</Button></div>}</div>
          </div>
        )}

        {view === 'leaderboard' && (
          <div className="mx-auto max-w-[1180px] space-y-6 p-4 md:p-7"><PageTitle eyebrow="COMMUNITY" title="程式題海排行榜" copy="公開顯示自願加入者的完成題數與正確率；Email 永不公開。" /><LeaderboardPanel session={session} /></div>
        )}

        {view === 'admin' && session?.isAdmin && (
          <div className="mx-auto max-w-[1380px] space-y-6 p-4 md:p-7"><PageTitle eyebrow="ADMIN" title="題庫管理後台" copy="以 JSON 批次驗證、匯入、更新或停用自訂題目。" /><AdminPanel problems={customProblems} onChanged={refreshCustomProblems} /></div>
        )}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex overflow-x-auto border-t bg-card/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden" aria-label="行動版導覽">
        {visibleNavItems.map(({ view: itemView, label, icon: Icon }) => <button key={itemView} onClick={() => changeView(itemView)} className={`flex min-h-16 min-w-[72px] flex-1 flex-col items-center justify-center gap-1 text-[10px] font-bold ${view === itemView || (view === 'workspace' && itemView === 'problems') ? 'text-primary' : 'text-muted-foreground'}`}><Icon className="size-5" />{label}</button>)}
      </nav>
    </div>
  );
}

function ProblemRow({ problem, learning, onOpen, detailed = false }: { problem: Problem; learning: LearningState; onOpen: (problem: Problem) => void; detailed?: boolean }) {
  const solved = learning.solved.includes(problem.id);
  const wrong = learning.wrong.includes(problem.id);
  const Icon = languageIcons[problem.language];
  if (!detailed) {
    return <button onClick={() => onOpen(problem)} className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-secondary/50 md:px-5"><span className={`grid size-8 shrink-0 place-items-center rounded-lg ${solved ? 'bg-emerald-100 text-emerald-700' : wrong ? 'bg-rose-100 text-rose-700' : 'bg-secondary text-muted-foreground'}`}>{solved ? <Check className="size-4" /> : wrong ? <RotateCcw className="size-4" /> : <Circle className="size-3" />}</span><span className="min-w-0 flex-1"><strong className="block truncate text-sm">{problem.id}. {problem.title}</strong><span className="mt-1 block text-xs text-muted-foreground">{problem.language} · {problem.topic}</span></span><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${difficultyClass[problem.difficulty]}`}>{problem.difficulty}</span><ChevronRight className="size-4 text-muted-foreground" /></button>;
  }
  return <button onClick={() => onOpen(problem)} className="grid w-full grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 text-left transition hover:bg-secondary/50 md:grid-cols-[60px_minmax(280px,1fr)_120px_120px_110px] md:px-5"><span className="flex items-center gap-1">{solved ? <CheckCircle2 className="size-5 text-emerald-600" /> : wrong ? <RotateCcw className="size-5 text-rose-500" /> : <Circle className="size-4 text-muted-foreground/50" />}</span><span className="min-w-0"><strong className="block truncate text-sm">{problem.id}. {problem.title}</strong><span className="mt-1 block text-xs text-muted-foreground md:hidden">{problem.language} · {problem.topic}</span></span><ChevronRight className="size-4 text-muted-foreground md:hidden" /><span className="hidden items-center gap-2 text-xs md:flex"><Icon className="size-4 text-primary" />{problem.language}</span><span className="hidden md:block"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${difficultyClass[problem.difficulty]}`}>{problem.difficulty}</span></span><span className="hidden font-mono text-xs text-muted-foreground md:block">{problem.acceptance}%</span></button>;
}

function LessonArticle({ lesson, onBack, onPractice }: { lesson: Lesson; onBack: () => void; onPractice: (id: number) => void }) {
  const meta = languageMeta[lesson.language];
  const Icon = languageIcons[lesson.language];
  return <div className="mx-auto max-w-5xl"><Button variant="ghost" className="mb-5 gap-2" onClick={onBack}><ArrowLeft />回到教學路徑</Button><article className="overflow-hidden rounded-2xl border bg-card shadow-sm"><header className="border-b p-6 md:p-9"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl" style={{ background: meta.soft, color: meta.color }}><Icon className="size-5" /></span><div><p className="text-xs font-black tracking-[.12em] text-primary">{lesson.language} · {lesson.level}</p><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Clock3 className="size-3" />約 {lesson.minutes} 分鐘</p></div></div><h1 className="mt-7 text-3xl font-black tracking-tight md:text-4xl">{lesson.title}</h1><p className="mt-3 text-base leading-7 text-muted-foreground">{lesson.description}</p></header><div className="grid gap-8 p-6 md:grid-cols-[minmax(0,1fr)_280px] md:p-9"><div className="space-y-5">{lesson.body.map((paragraph, index) => <section key={paragraph}><h2 className="mb-2 text-sm font-black text-primary">{String(index + 1).padStart(2, '0')}</h2><p className="leading-8 text-muted-foreground">{paragraph}</p></section>)}<pre className="overflow-x-auto rounded-xl bg-[#111827] p-5 font-mono text-sm leading-7 text-slate-100"><code>{lesson.code}</code></pre><div className="rounded-xl border-l-4 border-primary bg-primary/5 p-5"><strong className="flex items-center gap-2"><Lightbulb className="size-4 text-primary" />本章記住這件事</strong><p className="mt-2 text-sm leading-6 text-muted-foreground">{lesson.takeaway}</p></div></div><aside><div className="sticky top-24 rounded-xl border bg-secondary/50 p-5"><p className="text-xs font-black tracking-[.12em] text-primary">READY TO PRACTICE?</p><h2 className="mt-2 text-lg font-black">讀完就動手驗證</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">開啟相關題目，使用提示與測試案例完成一次實作。</p><Button className="mt-5 w-full justify-between" onClick={() => onPractice(lesson.relatedProblem)}>開始相關練習 <ChevronRight /></Button></div></aside></div></article></div>;
}
