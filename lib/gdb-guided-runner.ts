type GdbProgramResult = {
  stdout?: string | null;
  stderr?: string | null;
  status?: string;
};

const knownCommands = /^(?:b(?:reak)?|tbreak|rbreak|run|r|start|next|n|step|s|finish|until|u|continue|c|print|p|display|undisplay|watch|rwatch|awatch|backtrace|bt|frame|up|down|info\s+(?:locals|args|breakpoints|threads|registers)|x\/[a-z0-9]+|condition|ignore|commands|end|set\s+(?:variable|print|follow-fork-mode|detach-on-fork|scheduler-locking)|show|handle|disassemble|list|ptype|whatis|jump|return|call|thread|delete|disable|enable|clear|catch|record|reverse-step|reverse-next|reverse-continue|layout|source|save\s+breakpoints)(?:\s|$)/i;

export function analyzeGdbScript(script: string) {
  const commands = script
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
  const unknown = commands.filter((command) => !knownCommands.test(command));
  const hasStart = commands.some((command) => /^(?:run|r|start)(?:\s|$)/i.test(command));
  return {
    commands,
    errors: [
      ...(commands.length ? [] : ['請至少輸入一條 GDB 指令。']),
      ...unknown.map((command) => `無法辨識指令：${command}`),
      ...(hasStart ? [] : ['指令稿尚未包含 run 或 start。']),
    ],
  };
}

function explain(command: string, program: GdbProgramResult) {
  const [name, ...rest] = command.split(/\s+/);
  const argument = rest.join(' ') || '（未指定）';
  const lower = name.toLowerCase();
  if (/^(?:b|break|tbreak|rbreak)$/.test(lower)) return `Breakpoint 已設在 ${argument}${lower === 'tbreak' ? '（命中後自動刪除）' : ''}。`;
  if (/^(?:run|r|start)$/.test(lower)) return 'Starting program… 程式會在第一個可命中的中斷點暫停。';
  if (/^(?:next|n)$/.test(lower)) return '執行下一個原始碼列，函式呼叫會整體越過。';
  if (/^(?:step|s)$/.test(lower)) return '執行下一個原始碼列，遇到函式呼叫會進入。';
  if (lower === 'finish') return '繼續到當前函式返回，並顯示返回值。';
  if (/^(?:continue|c)$/.test(lower)) {
    const output = (program.stdout || '').trimEnd();
    const error = (program.stderr || '').trimEnd();
    return `Continuing.${output ? `\nProgram output:\n${output}` : ''}${error ? `\nProgram signal/output:\n${error}` : ''}\nProgram status: ${program.status || 'finished'}`;
  }
  if (/^(?:print|p)$/.test(lower)) return `計算運算式 ${argument}；真實 GDB 會顯示當前暫停點的值。`;
  if (/^(?:watch|rwatch|awatch)$/.test(lower)) return `Hardware watchpoint 監看 ${argument}，該記憶體被改變或讀取時暫停。`;
  if (lower === 'display') return `每次暫停時自動顯示 ${argument}。`;
  if (/^(?:backtrace|bt)$/.test(lower)) return '#0 當前函式\n#1 呼叫者\n#2 main（用 frame 切換堆疊層）';
  if (lower === 'frame' || lower === 'up' || lower === 'down') return `呼叫堆疊導覽：${command}。切換後可用 info locals 檢查該層狀態。`;
  if (lower === 'info') return `顯示 ${argument} 的當前除錯狀態。`;
  if (lower.startsWith('x/')) return `以 ${name.slice(2)} 格式檢視記憶體位址 ${argument}。`;
  if (lower === 'condition') return `為中斷點設定條件：${argument}。`;
  if (lower === 'set') return `變更除錯器設定或目標程式狀態：${argument}。`;
  if (lower === 'handle') return `設定信號處理策略：${argument}。`;
  if (lower === 'disassemble') return `反組譯 ${argument}，用來對照原始碼與機器指令。`;
  return `已解析：${command}。`;
}

export function buildGdbTranscript(script: string, program: GdbProgramResult) {
  const analysis = analyzeGdbScript(script);
  if (analysis.errors.length) return { transcript: '', errors: analysis.errors };
  const transcript = [
    'CodeDive GDB 引導式實驗',
    '目標 C 程式已透過沙箱編譯；以下逐條模擬 GDB 批次指令的作用。',
    '',
    ...analysis.commands.flatMap((command) => [`(gdb) ${command}`, explain(command, program), '']),
  ].join('\n').trimEnd();
  return { transcript, errors: [] as string[] };
}
