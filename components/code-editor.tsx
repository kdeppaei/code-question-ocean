'use client';

import { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { autocompletion, snippetCompletion, type Completion, type CompletionContext } from '@codemirror/autocomplete';
import { cpp } from '@codemirror/lang-cpp';
import { python } from '@codemirror/lang-python';
import { sql, StandardSQL } from '@codemirror/lang-sql';
import { StreamLanguage } from '@codemirror/language';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import type { Language } from '@/app/content';

const completions: Record<Language, Completion[]> = {
  C: [
    snippetCompletion('int main(void) {\n\t${}\n\treturn 0;\n}', { label: 'main', type: 'keyword', detail: 'm → C 程式入口', boost: 120 }),
    snippetCompletion('printf("${%d\\n}", ${value});', { label: 'printf', type: 'function', detail: 'pr → 格式化輸出', boost: 115 }),
    snippetCompletion('scanf("${%d}", &${value});', { label: 'scanf', type: 'function', detail: 'sc → 讀取輸入', boost: 110 }),
    snippetCompletion('for (int ${i} = 0; ${i} < ${n}; ${i}++) {\n\t${}\n}', { label: 'for', type: 'keyword', detail: 'for 迴圈' }),
    snippetCompletion('while (${condition}) {\n\t${}\n}', { label: 'while', type: 'keyword', detail: 'while 迴圈' }),
    { label: 'malloc', type: 'function', detail: '配置記憶體', apply: 'malloc(sizeof(type) * count)' },
    { label: 'calloc', type: 'function', detail: '配置並清零記憶體', apply: 'calloc(count, sizeof(type))' },
    { label: 'free', type: 'function', detail: '釋放動態記憶體', apply: 'free(pointer);' },
    snippetCompletion('typedef struct {\n\t${}\n} ${Name};', { label: 'struct', type: 'keyword', detail: '結構型別' }),
    { label: 'NULL', type: 'constant', detail: '空指標' },
  ],
  'C++': [
    snippetCompletion('int main() {\n\tios::sync_with_stdio(false);\n\tcin.tie(nullptr);\n\t${}\n}', { label: 'main', type: 'keyword', detail: 'm → C++ 程式入口', boost: 120 }),
    snippetCompletion('cout << ${value} << \'\\n\';', { label: 'cout', type: 'function', detail: 'co → 標準輸出', boost: 110 }),
    snippetCompletion('cin >> ${value};', { label: 'cin', type: 'function', detail: 'ci → 標準輸入', boost: 110 }),
    snippetCompletion('for (const auto& ${value} : ${values}) {\n\t${}\n}', { label: 'for-range', type: 'keyword', detail: '範圍 for' }),
    { label: 'vector', type: 'class', detail: 'STL 動態陣列', apply: 'vector<int> values' },
    { label: 'sort', type: 'function', detail: 'STL 排序', apply: 'sort(values.begin(), values.end());' },
    { label: 'unordered_map', type: 'class', detail: '雜湊表', apply: 'unordered_map<int, int> counts;' },
    { label: 'queue', type: 'class', detail: '先進先出佇列', apply: 'queue<int> pending;' },
    { label: 'stack', type: 'class', detail: '後進先出堆疊', apply: 'stack<int> values;' },
    { label: 'priority_queue', type: 'class', detail: '優先佇列', apply: 'priority_queue<int> heap;' },
  ],
  Python: [
    snippetCompletion('def main():\n\t${}\n\nif __name__ == "__main__":\n\tmain()', { label: 'main', type: 'keyword', detail: 'm → Python 程式入口', boost: 120 }),
    snippetCompletion('print(f"${value = }")', { label: 'print', type: 'function', detail: 'pr → 格式化輸出', boost: 115 }),
    snippetCompletion('for ${value} in ${values}:\n\t${}', { label: 'for', type: 'keyword', detail: 'for 迴圈' }),
    snippetCompletion('[${expression} for ${value} in ${values} if ${condition}]', { label: 'list-comprehension', type: 'keyword', detail: '串列推導式' }),
    snippetCompletion('{${key}: ${value} for ${item} in ${items}}', { label: 'dict-comprehension', type: 'keyword', detail: '字典推導式' }),
    { label: 'enumerate', type: 'function', detail: '同時取得索引和值', apply: 'enumerate(values)' },
    { label: 'collections.Counter', type: 'class', detail: '頻率統計', apply: 'from collections import Counter' },
    { label: 'collections.deque', type: 'class', detail: '雙端佇列', apply: 'from collections import deque' },
    { label: 'heapq', type: 'module', detail: '最小堆積', apply: 'import heapq' },
  ],
  SQL: [
    snippetCompletion('SELECT ${column}\nFROM ${table_name}\nWHERE ${condition};', { label: 'SELECT', type: 'keyword', detail: 'sel → 查詢骨架', boost: 120 }),
    { label: 'LEFT JOIN', type: 'keyword', detail: '保留左表資料', apply: 'LEFT JOIN table_name t ON t.id = source.id' },
    { label: 'GROUP BY', type: 'keyword', detail: '群組彙總', apply: 'GROUP BY column' },
    { label: 'CASE WHEN', type: 'keyword', detail: '條件運算', apply: 'CASE WHEN condition THEN value ELSE other END' },
    { label: 'ROW_NUMBER', type: 'function', detail: '窗口列號', apply: 'ROW_NUMBER() OVER (PARTITION BY column ORDER BY value DESC)' },
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

export const editorCompletions = completions;

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
      return { from: word.from, options: editorCompletions[language], validFor: /^[\w+#.]*$/ };
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
