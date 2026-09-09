import type { Language } from '@/app/content';

export type PlaygroundLanguage = Extract<Language, 'C' | 'C++' | 'Python' | 'SQL'>;

export type PlaygroundExample = {
  id: string;
  title: string;
  category: string;
  summary: string;
  source: string;
  stdin: string;
  concepts: string[];
};

export type QuickReference = {
  title: string;
  prefix: string;
  note: string;
  snippet: string;
};

export const playgroundExamples: Record<PlaygroundLanguage, PlaygroundExample[]> = {
  C: [
    { id: 'c-io', title: '輸入與格式化輸出', category: '語法基礎', summary: '用 scanf 讀取兩個整數，再用 printf 輸出結果。', stdin: '12 30', concepts: ['scanf', 'printf', 'main'], source: '#include <stdio.h>\n\nint main(void) {\n    int a, b;\n    scanf("%d %d", &a, &b);\n    printf("sum = %d\\n", a + b);\n    return 0;\n}' },
    { id: 'c-array', title: '陣列走訪與最大值', category: '資料結構', summary: '固定容量陣列搭配長度，逐項更新最大值。', stdin: '5\n-3 8 2 11 4', concepts: ['array', 'for', '邊界'], source: '#include <stdio.h>\n\nint main(void) {\n    int n, values[1000];\n    scanf("%d", &n);\n    for (int i = 0; i < n; i++) scanf("%d", &values[i]);\n    int best = values[0];\n    for (int i = 1; i < n; i++)\n        if (values[i] > best) best = values[i];\n    printf("%d\\n", best);\n    return 0;\n}' },
    { id: 'c-pointer', title: '指標交換', category: '指標', summary: '以位址傳遞，讓函式修改呼叫端變數。', stdin: '7 19', concepts: ['pointer', '&', '*'], source: '#include <stdio.h>\n\nvoid swap_values(int *a, int *b) {\n    int temp = *a;\n    *a = *b;\n    *b = temp;\n}\n\nint main(void) {\n    int a, b;\n    scanf("%d %d", &a, &b);\n    swap_values(&a, &b);\n    printf("%d %d\\n", a, b);\n    return 0;\n}' },
    { id: 'c-dynamic', title: '動態陣列', category: '記憶體', summary: '依輸入長度配置陣列，使用完畢後釋放。', stdin: '4\n3 1 4 1', concepts: ['malloc', 'free', 'sizeof'], source: '#include <stdio.h>\n#include <stdlib.h>\n\nint main(void) {\n    int n;\n    scanf("%d", &n);\n    int *values = malloc((size_t)n * sizeof(int));\n    if (values == NULL) return 1;\n    long long total = 0;\n    for (int i = 0; i < n; i++) {\n        scanf("%d", &values[i]);\n        total += values[i];\n    }\n    printf("%lld\\n", total);\n    free(values);\n    return 0;\n}' },
    { id: 'c-struct', title: '結構與排序', category: '資料結構', summary: '用 struct 表達紀錄，並以 qsort 排序。', stdin: '', concepts: ['struct', 'qsort', '比較函式'], source: '#include <stdio.h>\n#include <stdlib.h>\n\ntypedef struct {\n    const char *name;\n    int score;\n} Student;\n\nint by_score_desc(const void *left, const void *right) {\n    const Student *a = left, *b = right;\n    return (b->score > a->score) - (b->score < a->score);\n}\n\nint main(void) {\n    Student students[] = {{"Ada", 91}, {"Linus", 87}, {"Grace", 95}};\n    qsort(students, 3, sizeof(Student), by_score_desc);\n    for (int i = 0; i < 3; i++) printf("%s %d\\n", students[i].name, students[i].score);\n    return 0;\n}' },
  ],
  'C++': [
    { id: 'cpp-io', title: '輸入與輸出', category: '語法基礎', summary: '使用 iostream 與快速輸入設定。', stdin: '12 30', concepts: ['cin', 'cout', 'main'], source: '#include <iostream>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    int a, b;\n    cin >> a >> b;\n    cout << "sum = " << a + b << \'\\n\';\n}' },
    { id: 'cpp-vector', title: 'vector 排序去重', category: '資料結構', summary: 'sort、unique 與 erase 的常見組合。', stdin: '7\n3 1 3 2 5 2 1', concepts: ['vector', 'sort', 'unique'], source: '#include <algorithm>\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> values(n);\n    for (int &value : values) cin >> value;\n    sort(values.begin(), values.end());\n    values.erase(unique(values.begin(), values.end()), values.end());\n    for (int value : values) cout << value << \' \';\n}' },
    { id: 'cpp-map', title: 'unordered_map 頻率統計', category: '雜湊表', summary: '線性時間統計每個單字的出現次數。', stdin: '6\nc cpp c sql cpp c', concepts: ['unordered_map', 'range for', 'pair'], source: '#include <iostream>\n#include <string>\n#include <unordered_map>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    unordered_map<string, int> counts;\n    while (n--) {\n        string word;\n        cin >> word;\n        counts[word]++;\n    }\n    for (const auto &[word, count] : counts) cout << word << ": " << count << \'\\n\';\n}' },
    { id: 'cpp-bfs', title: 'queue 廣度優先搜尋', category: '圖論', summary: '用 queue 逐層搜尋無權圖的最短距離。', stdin: '', concepts: ['queue', 'graph', 'distance'], source: '#include <iostream>\n#include <queue>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<vector<int>> graph{{1, 2}, {0, 3}, {0, 3}, {1, 2}};\n    vector<int> distance(graph.size(), -1);\n    queue<int> pending;\n    distance[0] = 0;\n    pending.push(0);\n    while (!pending.empty()) {\n        int node = pending.front(); pending.pop();\n        for (int next : graph[node]) if (distance[next] == -1) {\n            distance[next] = distance[node] + 1;\n            pending.push(next);\n        }\n    }\n    for (int d : distance) cout << d << \' \';\n}' },
    { id: 'cpp-heap', title: 'priority_queue 前 K 大', category: '資料結構', summary: '用最小堆保留目前最大的 k 個值。', stdin: '6 3\n9 1 7 3 8 2', concepts: ['priority_queue', 'greater', 'top'], source: '#include <functional>\n#include <iostream>\n#include <queue>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n, k, value;\n    cin >> n >> k;\n    priority_queue<int, vector<int>, greater<int>> best;\n    while (n--) {\n        cin >> value;\n        best.push(value);\n        if ((int)best.size() > k) best.pop();\n    }\n    cout << best.top() << \'\\n\';\n}' },
  ],
  Python: [
    { id: 'py-io', title: '輸入拆解與格式化', category: '語法基礎', summary: '拆解一行輸入並使用 f-string。', stdin: 'Ada 95', concepts: ['split', 'f-string', 'main'], source: 'def main():\n    name, score = input().split()\n    print(f"{name}: {int(score):03d}")\n\nif __name__ == "__main__":\n    main()' },
    { id: 'py-list', title: '串列推導式', category: '資料結構', summary: '同時完成篩選與轉換。', stdin: '', concepts: ['list comprehension', 'enumerate', 'sum'], source: 'values = [-3, 4, 0, 7, -2, 5]\npositive_squares = [value ** 2 for value in values if value > 0]\nprint(positive_squares)\nprint(sum(positive_squares))' },
    { id: 'py-counter', title: 'Counter 頻率統計', category: 'collections', summary: '統計單字並取得最常見項目。', stdin: 'c python c sql python c', concepts: ['Counter', 'most_common', 'split'], source: 'from collections import Counter\n\nwords = input().split()\ncounts = Counter(words)\nfor word, count in counts.most_common():\n    print(word, count)' },
    { id: 'py-bfs', title: 'deque 廣度優先搜尋', category: '圖論', summary: '使用 deque 做 O(1) 的佇列頭取出。', stdin: '', concepts: ['deque', 'BFS', 'set'], source: 'from collections import deque\n\ngraph = {0: [1, 2], 1: [3], 2: [3], 3: []}\npending = deque([(0, 0)])\nseen = {0}\nwhile pending:\n    node, distance = pending.popleft()\n    print(node, distance)\n    for next_node in graph[node]:\n        if next_node not in seen:\n            seen.add(next_node)\n            pending.append((next_node, distance + 1))' },
    { id: 'py-heap', title: 'heapq 工作佇列', category: '資料結構', summary: '依優先度處理工作，數字越小越先取出。', stdin: '', concepts: ['heapq', 'tuple', 'heappop'], source: 'import heapq\n\ntasks = [(3, "report"), (1, "fix"), (2, "test")]\nheapq.heapify(tasks)\nwhile tasks:\n    priority, name = heapq.heappop(tasks)\n    print(priority, name)' },
  ],
  SQL: [
    { id: 'sql-filter', title: '篩選與排序', category: '查詢基礎', summary: '建立測試表後練習 WHERE 與 ORDER BY。', stdin: '', concepts: ['CREATE TABLE', 'WHERE', 'ORDER BY'], source: "CREATE TABLE users(id INTEGER, name TEXT, active INTEGER);\nINSERT INTO users VALUES (1, 'Ada', 1), (2, 'Grace', 0), (3, 'Linus', 1);\n\nSELECT id, name\nFROM users\nWHERE active = 1\nORDER BY id;" },
    { id: 'sql-group', title: '群組彙總', category: '資料分析', summary: '用 GROUP BY 與 HAVING 篩選群組。', stdin: '', concepts: ['GROUP BY', 'SUM', 'HAVING'], source: "CREATE TABLE orders(team TEXT, amount INTEGER);\nINSERT INTO orders VALUES ('A', 80), ('A', 40), ('B', 50);\n\nSELECT team, SUM(amount) AS total\nFROM orders\nGROUP BY team\nHAVING SUM(amount) >= 100\nORDER BY team;" },
    { id: 'sql-join', title: 'LEFT JOIN 保留左表', category: '資料表關聯', summary: '沒有訂單的客戶也會保留。', stdin: '', concepts: ['LEFT JOIN', 'COALESCE', 'GROUP BY'], source: "CREATE TABLE customers(id INTEGER, name TEXT);\nCREATE TABLE orders(customer_id INTEGER, amount INTEGER);\nINSERT INTO customers VALUES (1, 'Ada'), (2, 'Linus');\nINSERT INTO orders VALUES (1, 120), (1, 30);\n\nSELECT c.id, c.name, COALESCE(SUM(o.amount), 0) AS total\nFROM customers AS c\nLEFT JOIN orders AS o ON o.customer_id = c.id\nGROUP BY c.id, c.name\nORDER BY c.id;" },
    { id: 'sql-window', title: '窗口函式排名', category: '進階查詢', summary: '保留明細列，同時計算每組排名。', stdin: '', concepts: ['DENSE_RANK', 'PARTITION BY', 'CTE'], source: "CREATE TABLE scores(team TEXT, name TEXT, score INTEGER);\nINSERT INTO scores VALUES ('A', 'Ada', 95), ('A', 'Grace', 88), ('B', 'Linus', 91);\n\nWITH ranked AS (\n  SELECT *, DENSE_RANK() OVER (PARTITION BY team ORDER BY score DESC) AS rank_no\n  FROM scores\n)\nSELECT team, name, score, rank_no\nFROM ranked\nORDER BY team, rank_no;" },
    { id: 'sql-recursive', title: '遞迴 CTE 組織樹', category: '進階查詢', summary: '由根節點向下走訪階層資料。', stdin: '', concepts: ['WITH RECURSIVE', 'UNION ALL', 'depth'], source: "CREATE TABLE employees(id INTEGER, manager_id INTEGER);\nINSERT INTO employees VALUES (1, NULL), (2, 1), (3, 1), (4, 2);\n\nWITH RECURSIVE org(id, depth) AS (\n  SELECT id, 0 FROM employees WHERE id = 1\n  UNION ALL\n  SELECT e.id, org.depth + 1\n  FROM employees AS e\n  JOIN org ON e.manager_id = org.id\n)\nSELECT id, depth FROM org ORDER BY depth, id;" },
  ],
};

export const quickReferences: Record<PlaygroundLanguage, QuickReference[]> = {
  C: [
    { title: 'main 程式入口', prefix: 'm', note: '回傳 int，成功結束回傳 0。', snippet: 'int main(void) {\n    \n    return 0;\n}' },
    { title: 'printf 格式化', prefix: 'pr', note: '%d 整數、%lld 長整數、%s 字串。', snippet: 'printf("%d\\n", value);' },
    { title: '讀取整數', prefix: 'sc', note: 'scanf 要傳入變數位址。', snippet: 'scanf("%d", &value);' },
    { title: '配置與釋放', prefix: 'mal', note: '檢查 NULL，最後一定 free。', snippet: 'int *values = malloc((size_t)n * sizeof(int));\nif (values == NULL) return 1;\n\nfree(values);' },
  ],
  'C++': [
    { title: 'main 程式入口', prefix: 'm', note: '常搭配快速輸入設定。', snippet: 'int main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    \n}' },
    { title: 'vector 動態陣列', prefix: 'vec', note: '自動管理記憶體並提供 size。', snippet: 'vector<int> values(n);' },
    { title: '排序', prefix: 'so', note: '半開區間 [begin, end)。', snippet: 'sort(values.begin(), values.end());' },
    { title: '雜湊計數', prefix: 'um', note: '平均 O(1) 查找與更新。', snippet: 'unordered_map<string, int> counts;\ncounts[key]++;' },
  ],
  Python: [
    { title: 'main 慣用法', prefix: 'm', note: '匯入模組時不會自動執行。', snippet: 'def main():\n    pass\n\nif __name__ == "__main__":\n    main()' },
    { title: '格式化輸出', prefix: 'pr', note: 'f-string 可直接嵌入運算式。', snippet: 'print(f"value = {value}")' },
    { title: '索引和值', prefix: 'enu', note: 'enumerate 避免手動維護索引。', snippet: 'for index, value in enumerate(values):\n    print(index, value)' },
    { title: '頻率統計', prefix: 'cou', note: 'Counter 是 dict 的子類別。', snippet: 'from collections import Counter\ncounts = Counter(values)' },
  ],
  SQL: [
    { title: 'SELECT 查詢', prefix: 'sel', note: '先明確列欄位，再指定資料來源。', snippet: 'SELECT column_name\nFROM table_name;' },
    { title: 'LEFT JOIN', prefix: 'lef', note: '保留左表沒有配對的資料。', snippet: 'LEFT JOIN detail AS d ON d.owner_id = source.id' },
    { title: '群組彙總', prefix: 'gro', note: '非彙總欄位應列在 GROUP BY。', snippet: 'GROUP BY category\nHAVING COUNT(*) > 1' },
    { title: '窗口排名', prefix: 'den', note: 'DENSE_RANK 同分同名次且不跳號。', snippet: 'DENSE_RANK() OVER (PARTITION BY category ORDER BY score DESC)' },
  ],
};
