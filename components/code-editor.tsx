'use client';

import { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { autocompletion, type Completion, type CompletionContext } from '@codemirror/autocomplete';
import { cpp } from '@codemirror/lang-cpp';
import { python } from '@codemirror/lang-python';
import { sql, StandardSQL } from '@codemirror/lang-sql';
import { StreamLanguage } from '@codemirror/language';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import type { Language } from '@/app/content';

const completions: Record<Language, Completion[]> = {
  C: [
    { label: 'for', type: 'keyword', detail: 'for 迴圈', apply: 'for (int i = 0; i < n; i++) {\n    \n}' },
    { label: 'while', type: 'keyword', detail: 'while 迴圈', apply: 'while (condition) {\n    \n}' },
    { label: 'printf', type: 'function', detail: '格式化輸出', apply: 'printf("%d\\n", value);' },
    { label: 'malloc', type: 'function', detail: '配置記憶體', apply: 'malloc(sizeof(type) * count)' },
    { label: 'NULL', type: 'constant', detail: '空指標' },
  ],
  'C++': [
    { label: 'for-range', type: 'keyword', detail: '範圍 for', apply: 'for (const auto& value : values) {\n    \n}' },
    { label: 'vector', type: 'class', detail: 'STL 動態陣列', apply: 'vector<int> values' },
    { label: 'sort', type: 'function', detail: 'STL 排序', apply: 'sort(values.begin(), values.end());' },
    { label: 'unordered_map', type: 'class', detail: '雜湊表', apply: 'unordered_map<int, int> counts;' },
    { label: 'priority_queue', type: 'class', detail: '優先佇列', apply: 'priority_queue<int> heap;' },
  ],
  Python: [
    { label: 'for', type: 'keyword', detail: 'for 迴圈', apply: 'for value in values:\n    pass' },
    { label: 'enumerate', type: 'function', detail: '同時取得索引和值', apply: 'enumerate(values)' },
    { label: 'collections.Counter', type: 'class', detail: '頻率統計', apply: 'from collections import Counter' },
    { label: 'collections.deque', type: 'class', detail: '雙端佇列', apply: 'from collections import deque' },
    { label: 'heapq', type: 'module', detail: '最小堆積', apply: 'import heapq' },
  ],
  SQL: [
    { label: 'SELECT', type: 'keyword', detail: '查詢欄位', apply: 'SELECT column\nFROM table_name' },
    { label: 'LEFT JOIN', type: 'keyword', detail: '保留左表資料', apply: 'LEFT JOIN table_name t ON t.id = source.id' },
    { label: 'GROUP BY', type: 'keyword', detail: '群組彙總', apply: 'GROUP BY column' },
    { label: 'DENSE_RANK', type: 'function', detail: '窗口排名', apply: 'DENSE_RANK() OVER (PARTITION BY column ORDER BY value DESC)' },
    { label: 'WITH RECURSIVE', type: 'keyword', detail: '遞迴 CTE', apply: 'WITH RECURSIVE cte AS (\n  SELECT 1\n)' },
  ],
  GDB: [
    { label: 'break', type: 'keyword', detail: '設定中斷點', apply: 'break function_name' },
    { label: 'backtrace', type: 'keyword', detail: '列出呼叫堆疊' },
    { label: 'watch', type: 'keyword', detail: '監看運算式', apply: 'watch expression' },
    { label: 'info locals', type: 'keyword', detail: '顯示區域變數' },
    { label: 'continue', type: 'keyword', detail: '繼續執行' },
  ],
};

const gdbLanguage = StreamLanguage.define({
  token(stream) {
    if (stream.match(/#.*/)) return 'comment';
    if (stream.match(/\b(?:break|b|continue|c|next|n|step|s|finish|run|watch|print|display|backtrace|bt|frame|thread|info|x)\b/)) return 'keyword';
    if (stream.match(/\b\d+\b/)) return 'number';
    if (stream.match(/"(?:[^"\\]|\\.)*"/)) return 'string';
    stream.next();
    return null;
  },
});

function languageExtension(language: Language) {
  if (language === 'C' || language === 'C++') return cpp();
  if (language === 'Python') return python();
  if (language === 'SQL') return sql({ dialect: StandardSQL });
  return gdbLanguage;
}

export function CodeEditor({
  value,
  language,
  onChange,
  onRun,
  onSubmit,
  onSave,
}: {
  value: string;
  language: Language;
  onChange: (value: string) => void;
  onRun: () => void;
  onSubmit: () => void;
  onSave: () => void;
}) {
  const extensions = useMemo(() => {
    const completionSource = (context: CompletionContext) => {
      const word = context.matchBefore(/[\w+#.]+/);
      if (!word || (word.from === word.to && !context.explicit)) return null;
      return { from: word.from, options: completions[language] };
    };
    return [
      languageExtension(language),
      autocompletion({ override: [completionSource], activateOnTyping: true }),
      EditorView.lineWrapping,
    ];
  }, [language]);

  return (
    <div
      className="flex min-h-[390px] flex-1 flex-col bg-[#0d1321]"
      onKeyDownCapture={(event) => {
        if (!(event.ctrlKey || event.metaKey)) return;
        if (event.key === 'Enter') {
          event.preventDefault();
          if (event.shiftKey) onSubmit();
          else onRun();
        }
        if (event.key.toLowerCase() === 's') {
          event.preventDefault();
          onSave();
        }
      }}
    >
      <CodeMirror
        aria-label={`${language} 程式碼編輯器`}
        value={value}
        height="100%"
        minHeight="390px"
        theme={oneDark}
        extensions={extensions}
        onChange={onChange}
        basicSetup={{
          autocompletion: false,
          bracketMatching: true,
          closeBrackets: true,
          foldGutter: true,
          highlightActiveLine: true,
          highlightActiveLineGutter: true,
          lineNumbers: true,
        }}
        className="min-h-[390px] flex-1 text-[13px] [&_.cm-editor]:h-full [&_.cm-editor]:outline-none [&_.cm-scroller]:font-mono [&_.cm-scroller]:leading-6"
      />
      <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-white/5 bg-[#0a101c] px-4 py-2 text-[10px] text-slate-500">
        <span><kbd>Ctrl</kbd> + <kbd>Space</kbd> 自動完成</span>
        <span><kbd>Ctrl</kbd> + <kbd>Enter</kbd> 執行</span>
        <span><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Enter</kbd> 提交</span>
        <span><kbd>Ctrl</kbd> + <kbd>S</kbd> 儲存</span>
      </div>
    </div>
  );
}
