export type Language = 'C' | 'C++' | 'Python' | 'SQL' | 'GDB';
export type Difficulty = '簡單' | '中等' | '困難';

export type TestCheck = {
  label: string;
  input: string;
  output: string;
  tokens: string[];
};

export type Problem = {
  id: number;
  slug: string;
  title: string;
  language: Language;
  difficulty: Difficulty;
  topic: string;
  acceptance: number;
  description: string;
  task: string;
  constraints: string[];
  examples: { input: string; output: string; note?: string }[];
  starter: string;
  solution: string;
  explanation: string;
  hints: string[];
  checks: TestCheck[];
};

export type Lesson = {
  id: string;
  language: Language;
  title: string;
  description: string;
  minutes: number;
  level: '入門' | '核心' | '進階';
  body: string[];
  code: string;
  takeaway: string;
  relatedProblem: number;
};

export const languageMeta: Record<Language, { short: string; description: string; color: string; soft: string }> = {
  C: { short: 'C', description: '記憶體、指標與系統基礎', color: '#2563eb', soft: '#eff6ff' },
  'C++': { short: 'C++', description: 'STL、物件導向與演算法', color: '#7c3aed', soft: '#f5f3ff' },
  Python: { short: 'Py', description: '清楚語法與資料處理', color: '#d97706', soft: '#fffbeb' },
  SQL: { short: 'SQL', description: '查詢、彙總與資料模型', color: '#059669', soft: '#ecfdf5' },
  GDB: { short: 'GDB', description: '中斷點、堆疊與除錯流程', color: '#e11d48', soft: '#fff1f2' },
};

export const problems: Problem[] = [
  {
    id: 1, slug: 'c-array-sum', title: '陣列總和', language: 'C', difficulty: '簡單', topic: '陣列', acceptance: 82,
    description: '給定一個整數陣列與長度 n，回傳所有元素的總和。請使用迴圈完成，不可假設陣列長度固定。',
    task: '完成 sum_array 函式；當 n 為 0 時回傳 0。',
    constraints: ['0 ≤ n ≤ 10,000', '每個元素介於 -10,000 到 10,000', '結果可放入 int'],
    examples: [{ input: '[3, 1, 4, 1, 5], n = 5', output: '14' }, { input: '[], n = 0', output: '0' }],
    starter: String.raw`int sum_array(const int *nums, int n) {
    // 在此完成
    return 0;
}`,
    solution: String.raw`int sum_array(const int *nums, int n) {
    int total = 0;
    for (int i = 0; i < n; i++) {
        total += nums[i];
    }
    return total;
}`,
    explanation: '用累加器 total 由 0 開始走訪陣列一次。時間複雜度 O(n)，額外空間 O(1)。const 表示函式不會修改輸入陣列。',
    hints: ['先建立值為 0 的累加器。', '指標參數仍可用 nums[i] 讀取。'],
    checks: [
      { label: '一般陣列', input: '[3,1,4,1,5]', output: '14', tokens: ['for', 'nums[i]', 'total'] },
      { label: '空陣列', input: '[], n=0', output: '0', tokens: ['return total'] },
      { label: '包含負數', input: '[-2,5,-1]', output: '2', tokens: ['+='] },
    ],
  },
  {
    id: 2, slug: 'c-swap-pointers', title: '用指標交換兩數', language: 'C', difficulty: '簡單', topic: '指標', acceptance: 76,
    description: '實作 swap，透過指標交換兩個整數變數的內容。', task: '不得回傳新陣列，也不得只交換指標本身。',
    constraints: ['a 與 b 都是有效的 int 指標', '只能使用常數額外空間'],
    examples: [{ input: 'a = 7, b = 11', output: 'a = 11, b = 7' }],
    starter: String.raw`void swap(int *a, int *b) {
    // 在此完成
}`,
    solution: String.raw`void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}`,
    explanation: '解參照運算子 * 取得指標指向的值。先保存 *a，否則第一次指定後會遺失原值。',
    hints: ['需要一個暫存變數。', '交換的是 *a 與 *b，不是 a 與 b。'],
    checks: [
      { label: '正整數', input: '7, 11', output: '11, 7', tokens: ['int temp', '*a', '*b'] },
      { label: '負數', input: '-3, 8', output: '8, -3', tokens: ['*a = *b'] },
      { label: '相同值', input: '4, 4', output: '4, 4', tokens: ['*b = temp'] },
    ],
  },
  {
    id: 3, slug: 'c-string-vowels', title: '計算母音數量', language: 'C', difficulty: '中等', topic: '字串', acceptance: 64,
    description: '給定以 null 結尾的字串，計算英文字母 a、e、i、o、u 的數量，大小寫都要計入。', task: '完成 count_vowels，走訪到字串結尾。',
    constraints: ['字串長度不超過 100,000', '輸入保證為有效字串'],
    examples: [{ input: '"CodeDive"', output: '4' }, { input: '"rhythm"', output: '0' }],
    starter: String.raw`int count_vowels(const char *text) {
    // 在此完成
    return 0;
}`,
    solution: String.raw`int count_vowels(const char *text) {
    int count = 0;
    for (int i = 0; text[i] != '\0'; i++) {
        char c = text[i];
        if (c=='a'||c=='e'||c=='i'||c=='o'||c=='u'||
            c=='A'||c=='E'||c=='I'||c=='O'||c=='U') count++;
    }
    return count;
}`,
    explanation: 'C 字串以 \\0 標記結尾，所以不需要另外傳長度。每個字元只檢查一次。',
    hints: ['迴圈條件可檢查 text[i] 是否為 \\0。', '別漏掉大寫母音。'],
    checks: [
      { label: '混合大小寫', input: 'CodeDive', output: '4', tokens: ["text[i] != '\\0'", 'count++'] },
      { label: '沒有母音', input: 'rhythm', output: '0', tokens: ["c=='a'", "c=='A'"] },
      { label: '空字串', input: '""', output: '0', tokens: ['return count'] },
    ],
  },
  {
    id: 4, slug: 'c-reverse-buffer', title: '原地反轉字元陣列', language: 'C', difficulty: '中等', topic: '雙指標', acceptance: 59,
    description: '將長度為 n 的字元陣列原地反轉，不能配置另一個同等大小的陣列。', task: '使用左右索引向中央移動。',
    constraints: ['0 ≤ n ≤ 100,000', '額外空間必須為 O(1)'],
    examples: [{ input: "['c','o','d','e']", output: "['e','d','o','c']" }],
    starter: String.raw`void reverse(char *s, int n) {
    // 在此完成
}`,
    solution: String.raw`void reverse(char *s, int n) {
    int left = 0, right = n - 1;
    while (left < right) {
        char temp = s[left];
        s[left++] = s[right];
        s[right--] = temp;
    }
}`,
    explanation: '左右兩端每次交換後同時靠近，總共交換 n/2 次。時間 O(n)，空間 O(1)。',
    hints: ['右索引從 n - 1 開始。', '當 left >= right 時停止。'],
    checks: [
      { label: '偶數長度', input: 'code', output: 'edoc', tokens: ['left', 'right', 'while'] },
      { label: '奇數長度', input: 'debug', output: 'gubed', tokens: ['s[left]', 's[right]'] },
      { label: '單一字元', input: 'x', output: 'x', tokens: ['left < right'] },
    ],
  },
  {
    id: 5, slug: 'cpp-unique-sorted', title: '移除排序陣列重複值', language: 'C++', difficulty: '簡單', topic: 'vector', acceptance: 78,
    description: '給定已排序的 vector<int>，原地移除重複元素並回傳新的長度。', task: '使用雙指標保留每個不同的值。',
    constraints: ['0 ≤ nums.size() ≤ 100,000', 'nums 已由小到大排序'],
    examples: [{ input: '[1,1,2,2,3]', output: '3，前 3 個元素為 [1,2,3]' }],
    starter: String.raw`int removeDuplicates(vector<int>& nums) {
    // 在此完成
    return 0;
}`,
    solution: String.raw`int removeDuplicates(vector<int>& nums) {
    if (nums.empty()) return 0;
    int write = 1;
    for (int read = 1; read < nums.size(); read++) {
        if (nums[read] != nums[read - 1]) nums[write++] = nums[read];
    }
    return write;
}`,
    explanation: 'read 掃描全部元素，write 指向下一個要寫入的位置。排序性讓相同元素必定相鄰。',
    hints: ['空陣列要先處理。', '比較目前值與前一個值即可。'],
    checks: [
      { label: '含重複值', input: '[1,1,2,2,3]', output: '3', tokens: ['nums.empty()', 'write', 'read'] },
      { label: '全不重複', input: '[1,2,3]', output: '3', tokens: ['nums[read] != nums[read - 1]'] },
      { label: '空陣列', input: '[]', output: '0', tokens: ['return 0'] },
    ],
  },
  {
    id: 6, slug: 'cpp-frequency', title: '最高頻單字', language: 'C++', difficulty: '中等', topic: 'unordered_map', acceptance: 61,
    description: '給定字串陣列，回傳出現次數最多的單字；若同次數，回傳字典序較小者。', task: '使用雜湊表計數，再找出最佳答案。',
    constraints: ['1 ≤ words.size() ≤ 50,000', '每個單字只含小寫英文字母'],
    examples: [{ input: '["c","cpp","c","sql","cpp","c"]', output: '"c"' }],
    starter: String.raw`string mostFrequent(const vector<string>& words) {
    // 在此完成
    return "";
}`,
    solution: String.raw`string mostFrequent(const vector<string>& words) {
    unordered_map<string, int> freq;
    for (const auto& word : words) freq[word]++;
    string best;
    for (const auto& [word, count] : freq)
        if (best.empty() || count > freq[best] ||
            (count == freq[best] && word < best)) best = word;
    return best;
}`,
    explanation: 'unordered_map 平均 O(1) 更新次數；第二次走訪所有不同單字並處理同分規則。',
    hints: ['先完成所有計數，再比較最大值。', '同分時用 word < best。'],
    checks: [
      { label: '一般資料', input: 'c,cpp,c,sql,cpp,c', output: 'c', tokens: ['unordered_map', 'freq[word]++'] },
      { label: '同分字典序', input: 'b,a', output: 'a', tokens: ['word < best'] },
      { label: '單一元素', input: 'python', output: 'python', tokens: ['return best'] },
    ],
  },
  {
    id: 7, slug: 'cpp-two-sum', title: '兩數之和索引', language: 'C++', difficulty: '中等', topic: '雜湊表', acceptance: 57,
    description: '給定整數陣列 nums 與 target，回傳兩個相加等於 target 的元素索引。保證恰有一組答案。', task: '目標時間複雜度 O(n)。',
    constraints: ['2 ≤ nums.size() ≤ 100,000', '不可重複使用同一個元素'],
    examples: [{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' }],
    starter: String.raw`vector<int> twoSum(vector<int>& nums, int target) {
    // 在此完成
    return {};
}`,
    solution: String.raw`vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> seen;
    for (int i = 0; i < nums.size(); i++) {
        int need = target - nums[i];
        if (seen.count(need)) return {seen[need], i};
        seen[nums[i]] = i;
    }
    return {};
}`,
    explanation: '每次先尋找差值 need 是否出現過，再把目前值放入 seen，可避免使用同一索引兩次。',
    hints: ['需要尋找的是 target - nums[i]。', '查找完成後再記錄目前元素。'],
    checks: [
      { label: '標準案例', input: '[2,7,11,15], 9', output: '[0,1]', tokens: ['unordered_map', 'target - nums[i]'] },
      { label: '含負數', input: '[-3,4,3,90], 0', output: '[0,2]', tokens: ['seen.count'] },
      { label: '相同數值', input: '[3,3], 6', output: '[0,1]', tokens: ['seen[nums[i]] = i'] },
    ],
  },
  {
    id: 8, slug: 'cpp-brackets', title: '有效括號序列', language: 'C++', difficulty: '困難', topic: 'stack', acceptance: 46,
    description: '判斷只包含 ()[]{} 的字串是否為有效括號序列。每個右括號都必須和最近尚未配對的左括號相符。', task: '請使用堆疊。',
    constraints: ['0 ≤ s.length() ≤ 100,000'], examples: [{ input: '"([]){}"', output: 'true' }, { input: '"([)]"', output: 'false' }],
    starter: String.raw`bool isValid(const string& s) {
    // 在此完成
    return false;
}`,
    solution: String.raw`bool isValid(const string& s) {
    stack<char> st;
    unordered_map<char,char> pair{{')','('},{']','['},{'}','{'}};
    for (char c : s) {
        if (!pair.count(c)) st.push(c);
        else {
            if (st.empty() || st.top() != pair[c]) return false;
            st.pop();
        }
    }
    return st.empty();
}`,
    explanation: '堆疊保存尚未配對的左括號。遇到右括號時只需檢查頂端，因為括號必須巢狀閉合。',
    hints: ['右括號出現時，空堆疊一定無效。', '最後堆疊也必須為空。'],
    checks: [
      { label: '巢狀括號', input: '([]){}', output: 'true', tokens: ['stack<char>', 'st.top()'] },
      { label: '錯誤順序', input: '([)]', output: 'false', tokens: ['return false'] },
      { label: '未閉合', input: '((', output: 'false', tokens: ['return st.empty()'] },
    ],
  },
  {
    id: 9, slug: 'python-clean-words', title: '正規化單字清單', language: 'Python', difficulty: '簡單', topic: '串列推導', acceptance: 84,
    description: '接收一組可能含前後空白與大小寫差異的字串，回傳去除空白、轉小寫且排除空字串的新清單。', task: '保留原本順序。',
    constraints: ['0 ≤ len(words) ≤ 100,000', '輸入元素皆為 str'], examples: [{ input: '[" Python ", "", " SQL"]', output: '["python", "sql"]' }],
    starter: String.raw`def clean_words(words):
    # 在此完成
    return []`,
    solution: String.raw`def clean_words(words):
    return [word.strip().lower() for word in words if word.strip()]`,
    explanation: '串列推導同時完成過濾與轉換；條件中的 strip() 排除只含空白的字串。',
    hints: ['str.strip() 可移除前後空白。', '把 if 條件放在串列推導最後。'],
    checks: [
      { label: '混合資料', input: '[" Python ",""," SQL"]', output: '["python","sql"]', tokens: ['strip()', 'lower()'] },
      { label: '全空白', input: '[" ", ""]', output: '[]', tokens: ['if word.strip()'] },
      { label: '保留順序', input: '["B","a"]', output: '["b","a"]', tokens: ['for word in words'] },
    ],
  },
  {
    id: 10, slug: 'python-group-anagrams', title: '字母異位詞分組', language: 'Python', difficulty: '中等', topic: 'dict', acceptance: 67,
    description: '將由小寫字母組成的單字依字母組成分組，例如 eat、tea、ate 屬於同一組。', task: '回傳 list[list[str]]，組別順序不限。',
    constraints: ['1 ≤ len(words) ≤ 10,000', '每個單字長度不超過 100'], examples: [{ input: '["eat","tea","tan","ate"]', output: '[["eat","tea","ate"],["tan"]]' }],
    starter: String.raw`def group_anagrams(words):
    # 在此完成
    return []`,
    solution: String.raw`def group_anagrams(words):
    groups = {}
    for word in words:
        key = tuple(sorted(word))
        groups.setdefault(key, []).append(word)
    return list(groups.values())`,
    explanation: '異位詞排序後會得到同一個 tuple，可作為字典鍵。最後取出所有群組。',
    hints: ['list 不能當 dict 的 key，但 tuple 可以。', 'setdefault 可簡化首次建立清單。'],
    checks: [
      { label: '一般分組', input: 'eat,tea,tan,ate', output: '2 groups', tokens: ['sorted(word)', 'groups'] },
      { label: '單字一個', input: 'abc', output: '[[abc]]', tokens: ['append(word)'] },
      { label: '空字串', input: '["",""]', output: '[["",""]]', tokens: ['list(groups.values())'] },
    ],
  },
  {
    id: 11, slug: 'python-longest-streak', title: '最長連續整數', language: 'Python', difficulty: '中等', topic: 'set', acceptance: 55,
    description: '給定未排序整數清單，找出最長連續整數序列的長度。', task: '請設計平均 O(n) 的解法。',
    constraints: ['0 ≤ len(nums) ≤ 100,000'], examples: [{ input: '[100,4,200,1,3,2]', output: '4（序列 1,2,3,4）' }],
    starter: String.raw`def longest_streak(nums):
    # 在此完成
    return 0`,
    solution: String.raw`def longest_streak(nums):
    values = set(nums)
    best = 0
    for value in values:
        if value - 1 not in values:
            end = value
            while end in values:
                end += 1
            best = max(best, end - value)
    return best`,
    explanation: '只從沒有前驅的數字開始延伸，因此每段連續序列只會被完整掃描一次。',
    hints: ['先用 set 取得 O(1) 平均查找。', '若 value - 1 存在，就不要從 value 開始。'],
    checks: [
      { label: '標準案例', input: '[100,4,200,1,3,2]', output: '4', tokens: ['set(nums)', 'value - 1 not in values'] },
      { label: '含重複值', input: '[1,2,2,3]', output: '3', tokens: ['while end in values'] },
      { label: '空清單', input: '[]', output: '0', tokens: ['best = 0'] },
    ],
  },
  {
    id: 12, slug: 'python-merge-intervals', title: '合併重疊區間', language: 'Python', difficulty: '困難', topic: '排序', acceptance: 49,
    description: '給定多個 [start, end] 區間，合併所有重疊區間並依起點排序回傳。', task: '例如 [1,3] 與 [2,6] 應合併為 [1,6]。',
    constraints: ['0 ≤ len(intervals) ≤ 20,000', 'start ≤ end'], examples: [{ input: '[[1,3],[2,6],[8,10],[9,12]]', output: '[[1,6],[8,12]]' }],
    starter: String.raw`def merge_intervals(intervals):
    # 在此完成
    return []`,
    solution: String.raw`def merge_intervals(intervals):
    merged = []
    for start, end in sorted(intervals):
        if not merged or start > merged[-1][1]:
            merged.append([start, end])
        else:
            merged[-1][1] = max(merged[-1][1], end)
    return merged`,
    explanation: '先依起點排序。若新區間與最後結果不重疊就加入，否則更新最後區間的終點。',
    hints: ['排序是讓一次掃描可行的關鍵。', '只需要和 merged 的最後一段比較。'],
    checks: [
      { label: '兩組重疊', input: '[[1,3],[2,6],[8,10],[9,12]]', output: '[[1,6],[8,12]]', tokens: ['sorted(intervals)', 'merged[-1][1]'] },
      { label: '完全分離', input: '[[1,2],[4,5]]', output: 'same', tokens: ['merged.append'] },
      { label: '空清單', input: '[]', output: '[]', tokens: ['return merged'] },
    ],
  },
  {
    id: 13, slug: 'sql-active-customers', title: '找出活躍客戶', language: 'SQL', difficulty: '簡單', topic: 'WHERE', acceptance: 88,
    description: 'customers 表包含 id、name、status、last_login。請找出狀態為 active 的客戶，依 last_login 由新到舊排列。', task: '只輸出 id、name、last_login。',
    constraints: ['資料表名稱為 customers', 'status 為字串欄位'], examples: [{ input: '3 筆客戶，其中 2 筆 active', output: '2 列，最近登入者在前' }],
    starter: String.raw`SELECT
  -- 選擇欄位
FROM customers;`,
    solution: String.raw`SELECT id, name, last_login
FROM customers
WHERE status = 'active'
ORDER BY last_login DESC;`,
    explanation: 'WHERE 在排序前篩選資料，ORDER BY ... DESC 讓較新的日期排在前面。',
    hints: ['條件值 active 需要單引號。', '由新到舊使用 DESC。'],
    checks: [
      { label: '欄位正確', input: 'customers', output: 'id,name,last_login', tokens: ['select id, name, last_login'] },
      { label: '只取 active', input: 'status mixed', output: 'active only', tokens: ["where status = 'active'"] },
      { label: '新到舊', input: 'dates', output: 'descending', tokens: ['order by last_login desc'] },
    ],
  },
  {
    id: 14, slug: 'sql-monthly-revenue', title: '每月營收彙總', language: 'SQL', difficulty: '中等', topic: 'GROUP BY', acceptance: 66,
    description: 'orders 表有 created_at、amount、status。計算 2026 年每個月份已付款訂單的總營收。', task: '輸出 month 與 revenue，依月份排序。',
    constraints: ['使用 SQLite 語法', '付款狀態為 paid'], examples: [{ input: '1 月訂單 100、250；2 月 80', output: '2026-01 | 350；2026-02 | 80' }],
    starter: String.raw`SELECT
  -- 月份與營收
FROM orders
WHERE status = 'paid';`,
    solution: String.raw`SELECT strftime('%Y-%m', created_at) AS month,
       SUM(amount) AS revenue
FROM orders
WHERE status = 'paid'
  AND created_at >= '2026-01-01'
  AND created_at < '2027-01-01'
GROUP BY month
ORDER BY month;`,
    explanation: 'strftime 擷取年月；使用半開日期區間可涵蓋整年，也不受時間部分影響。',
    hints: ['SQLite 可用 strftime 取得年月。', '彙總欄位用 SUM，並 GROUP BY month。'],
    checks: [
      { label: '擷取月份', input: 'created_at', output: 'YYYY-MM', tokens: ["strftime('%y-%m', created_at)"] },
      { label: '彙總金額', input: 'amount', output: 'sum', tokens: ['sum(amount)', 'group by month'] },
      { label: '限制年度', input: '2026', output: '2026 only', tokens: ["created_at >= '2026-01-01'", "created_at < '2027-01-01'"] },
    ],
  },
  {
    id: 15, slug: 'sql-second-salary', title: '第二高薪資', language: 'SQL', difficulty: '中等', topic: '子查詢', acceptance: 54,
    description: 'employees 表包含 salary。請回傳第二高的「不同薪資」；若不存在則回傳 NULL。', task: '輸出欄位名稱為 second_highest_salary。',
    constraints: ['可能有多人同薪', '需忽略 NULL salary'], examples: [{ input: '[100,200,200,300]', output: '200' }],
    starter: String.raw`SELECT
  -- 第二高薪資
FROM employees;`,
    solution: String.raw`SELECT MAX(salary) AS second_highest_salary
FROM employees
WHERE salary < (SELECT MAX(salary) FROM employees);`,
    explanation: '子查詢先得到最高薪；外層只看低於最高薪的資料，再取 MAX，天然處理重複值與不存在時的 NULL。',
    hints: ['先找出最高薪資。', '外層要找「小於最高薪」中的最大值。'],
    checks: [
      { label: '處理重複薪資', input: '100,200,200,300', output: '200', tokens: ['max(salary)', 'salary <'] },
      { label: '正確欄位名', input: 'alias', output: 'second_highest_salary', tokens: ['as second_highest_salary'] },
      { label: '只有一種薪資', input: '100,100', output: 'NULL', tokens: ['select max(salary) from employees'] },
    ],
  },
  {
    id: 16, slug: 'sql-completion-rate', title: '課程完成率', language: 'SQL', difficulty: '困難', topic: '條件彙總', acceptance: 43,
    description: 'enrollments 表包含 course_id、user_id、completed_at。計算每門課的註冊人數與完成率百分比。', task: '完成率四捨五入到小數點後 1 位，依 course_id 排序。',
    constraints: ['completed_at 為 NULL 代表未完成', '每位使用者每門課只有一筆'], examples: [{ input: '課程 1：4 人註冊、3 人完成', output: 'course_id=1, total=4, rate=75.0' }],
    starter: String.raw`SELECT course_id,
  -- total_students,
  -- completion_rate
FROM enrollments;`,
    solution: String.raw`SELECT course_id,
       COUNT(*) AS total_students,
       ROUND(100.0 * SUM(CASE WHEN completed_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 1) AS completion_rate
FROM enrollments
GROUP BY course_id
ORDER BY course_id;`,
    explanation: 'CASE 將完成狀態轉成 1/0 後加總；100.0 強制浮點除法，最後 ROUND 到 1 位。',
    hints: ['completed_at IS NOT NULL 代表完成。', '使用 100.0，避免整數除法。'],
    checks: [
      { label: '註冊人數', input: 'rows', output: 'COUNT(*)', tokens: ['count(*) as total_students'] },
      { label: '條件彙總', input: 'completed_at', output: '1 or 0', tokens: ['case when completed_at is not null'] },
      { label: '小數完成率', input: '3 / 4', output: '75.0', tokens: ['100.0', 'round(', 'group by course_id'] },
    ],
  },
  {
    id: 17, slug: 'gdb-break-main', title: '停在 main 的第一行', language: 'GDB', difficulty: '簡單', topic: '中斷點', acceptance: 91,
    description: '你剛以 -g 編譯程式並進入 GDB。請寫出指令：在 main 設定中斷點，接著啟動程式。', task: '每行輸入一個 GDB 指令。',
    constraints: ['程式不需要命令列參數'], examples: [{ input: '已載入 ./app', output: '程式停在 main' }],
    starter: String.raw`# 在此輸入 GDB 指令
`,
    solution: String.raw`break main
run`,
    explanation: 'break main 在函式進入點建立中斷點；run 重新啟動 inferior，命中後停下。可縮寫為 b main 與 r。',
    hints: ['設定中斷點的完整指令是 break。', '啟動程式使用 run。'],
    checks: [
      { label: '設定中斷點', input: 'main', output: 'Breakpoint created', tokens: ['break main'] },
      { label: '啟動程式', input: 'no args', output: 'Stopped at main', tokens: ['run'] },
      { label: '順序正確', input: 'commands', output: 'break then run', tokens: ['break', 'run'] },
    ],
  },
  {
    id: 18, slug: 'gdb-watch-count', title: '追蹤變數何時改變', language: 'GDB', difficulty: '簡單', topic: 'watchpoint', acceptance: 83,
    description: '程式中的全域變數 count 被意外修改。請在 GDB 中建立硬體觀察點，並讓程式繼續執行到它改變。', task: '輸入兩行指令。',
    constraints: ['count 在目前作用域可見'], examples: [{ input: 'count = 0', output: 'count 改變時自動暫停' }],
    starter: String.raw`# 在此輸入 GDB 指令
`,
    solution: String.raw`watch count
continue`,
    explanation: 'watch 監控運算式的值；continue 讓程式繼續，值一改變就由 GDB 暫停並顯示新舊值。',
    hints: ['不是只印出 count，而是監看它。', '從目前暫停點繼續使用 continue。'],
    checks: [
      { label: '建立觀察點', input: 'count', output: 'Hardware watchpoint', tokens: ['watch count'] },
      { label: '繼續執行', input: 'paused', output: 'continue', tokens: ['continue'] },
      { label: '沒有單步浪費', input: 'many lines', output: 'stops on change', tokens: ['watch', 'continue'] },
    ],
  },
  {
    id: 19, slug: 'gdb-backtrace-frame', title: '定位崩潰呼叫者', language: 'GDB', difficulty: '中等', topic: '呼叫堆疊', acceptance: 69,
    description: '程式收到 SIGSEGV，現在停在函式 parse_token。請列出呼叫堆疊，切換到上一層呼叫者，再顯示區域變數。', task: '使用完整指令，各占一行。',
    constraints: ['目前 frame 為 0', '呼叫者位於 frame 1'], examples: [{ input: 'SIGSEGV at parse_token', output: '查看 frame 1 的 locals' }],
    starter: String.raw`# 1. 顯示堆疊
# 2. 切換 frame
# 3. 顯示區域變數`,
    solution: String.raw`backtrace
frame 1
info locals`,
    explanation: 'backtrace 顯示整條呼叫鏈；frame 1 選擇直接呼叫者；info locals 列出該 frame 的區域變數。',
    hints: ['堆疊追蹤使用 backtrace。', '顯示區域變數使用 info locals。'],
    checks: [
      { label: '列出堆疊', input: 'crash', output: 'frames', tokens: ['backtrace'] },
      { label: '切換呼叫者', input: 'frame 0', output: 'frame 1', tokens: ['frame 1'] },
      { label: '查看區域變數', input: 'frame 1', output: 'locals', tokens: ['info locals'] },
    ],
  },
  {
    id: 20, slug: 'gdb-conditional-break', title: '只在錯誤索引暫停', language: 'GDB', difficulty: '困難', topic: '條件中斷點', acceptance: 51,
    description: '迴圈執行 10,000 次，問題只在 i 等於 7421 時出現。請在 process.c 第 88 行建立條件中斷點，然後啟動程式。', task: '避免手動 continue 數千次。',
    constraints: ['變數 i 在第 88 行可見'], examples: [{ input: 'process.c:88', output: '只在 i == 7421 時暫停' }],
    starter: String.raw`# 在此輸入 GDB 指令
`,
    solution: String.raw`break process.c:88 if i == 7421
run`,
    explanation: '把 if 條件直接接在 break 後，GDB 只會在條件為真時停下。這比反覆 continue 更可靠。',
    hints: ['break 支援尾端 if 條件。', '位置格式是 檔名:行號。'],
    checks: [
      { label: '位置正確', input: 'process.c line 88', output: 'breakpoint', tokens: ['break process.c:88'] },
      { label: '條件正確', input: 'i', output: '7421', tokens: ['if i == 7421'] },
      { label: '啟動程式', input: 'loaded', output: 'running', tokens: ['run'] },
    ],
  },
];

export const lessons: Lesson[] = [
  { id: 'c-memory', language: 'C', title: '記憶體與指標', description: '從位址、解參照到安全交換兩個值。', minutes: 8, level: '核心', body: ['每個變數都存放在記憶體中的某個位置，而指標保存的是該位置的位址。& 取得位址，* 則從位址讀取或寫入值。', '指標的型別描述它指向的資料。int *p 表示 p 指向 int；在不知道生命週期或有效範圍時，不應任意解參照。', '函式若要修改呼叫端的變數，可以接收指標。這也是 C 語言中常見的「輸出參數」設計。'], code: String.raw`int score = 90;
int *p = &score;
*p += 5; // score 現在是 95`, takeaway: '先確認指標有效，再解參照；& 取址、* 取值。', relatedProblem: 2 },
  { id: 'c-arrays', language: 'C', title: '陣列與字串走訪', description: '掌握索引、長度和 null 結尾字串。', minutes: 7, level: '入門', body: ['C 陣列本身不記錄長度，函式通常要另外接收 n。逐項處理時，標準迴圈範圍是 0 到 n - 1。', '字串是以 \\0 結尾的 char 陣列，所以可在不知道長度的情況下走訪，但必須保證結尾標記存在。', '唯讀輸入可加上 const，讓編譯器協助阻止意外修改。'], code: String.raw`for (int i = 0; text[i] != '\0'; i++) {
    putchar(text[i]);
}`, takeaway: '一般陣列靠 n，C 字串靠 \\0 判斷終點。', relatedProblem: 3 },
  { id: 'c-complexity', language: 'C', title: '雙指標與原地操作', description: '用常數空間處理陣列兩端。', minutes: 9, level: '進階', body: ['雙指標不一定是 C 專屬技巧，但在手動管理記憶體時尤其實用。left 與 right 可從陣列兩端靠近。', '原地演算法直接修改輸入，能省下額外陣列，但也表示呼叫者資料會改變，介面必須清楚說明。', '反轉 n 個元素只需 n/2 次交換，時間仍是 O(n)。'], code: String.raw`while (left < right) {
    swap(&items[left], &items[right]);
    left++; right--;
}`, takeaway: '雙指標將空間降為 O(1)，同時維持線性時間。', relatedProblem: 4 },
  { id: 'cpp-vector', language: 'C++', title: 'vector 與範圍迴圈', description: '安全管理動態陣列與元素走訪。', minutes: 7, level: '入門', body: ['vector 會管理連續記憶體與容量，通常比裸陣列更適合作為應用程式容器。size() 回傳元素數量，empty() 快速判斷是否為空。', '傳入唯讀 vector 時使用 const vector<T>&，可避免複製並禁止修改。', '需要索引時用傳統迴圈；只讀元素時可用範圍 for。'], code: String.raw`for (const auto& word : words) {
    cout << word << '\n';
}`, takeaway: '用參考避免複製，用 const 表達不修改。', relatedProblem: 5 },
  { id: 'cpp-hash', language: 'C++', title: 'unordered_map 查找', description: '把重複搜尋降到平均 O(1)。', minutes: 10, level: '核心', body: ['unordered_map 以雜湊方式保存 key-value，平均插入與查找為 O(1)。它適合計數、快取與「是否看過」問題。', 'operator[] 在 key 不存在時會建立預設值；只想查找時可用 count 或 find。', '演算法題常把「找另一個值」改寫為「查表」，將 O(n²) 降為 O(n)。'], code: String.raw`unordered_map<int, int> seen;
if (seen.count(need)) return seen[need];`, takeaway: '先明確 key 代表什麼，再決定何時查找、何時寫入。', relatedProblem: 7 },
  { id: 'cpp-stack', language: 'C++', title: 'stack 與最近狀態', description: '處理巢狀結構和後進先出流程。', minutes: 9, level: '進階', body: ['stack 只允許從頂端加入與移除，符合後進先出。解析括號、還原操作與深度優先搜尋都常用到它。', '呼叫 top() 或 pop() 前必須先確認 !empty()，否則行為未定義。', '有效括號的核心是：右括號只能匹配最近仍未配對的左括號。'], code: String.raw`if (st.empty() || st.top() != expected) {
    return false;
}
st.pop();`, takeaway: '堆疊適合只關心「最近一個尚未完成狀態」的問題。', relatedProblem: 8 },
  { id: 'py-comprehension', language: 'Python', title: '串列推導式', description: '用一行清楚表達轉換與過濾。', minutes: 5, level: '入門', body: ['串列推導把「對每個元素做轉換」與可選的過濾條件放在同一個表達式。', '若邏輯有多層條件或副作用，普通 for 迴圈通常更易讀。簡潔不是越短越好，而是意圖更直接。', '字串方法通常回傳新字串；strip 與 lower 不會修改原值。'], code: String.raw`clean = [name.strip().lower()
         for name in names
         if name.strip()]`, takeaway: '讓推導式維持一個轉換與一個簡單條件。', relatedProblem: 9 },
  { id: 'py-dict-set', language: 'Python', title: 'dict 與 set 思考法', description: '用雜湊結構建立快速查找。', minutes: 9, level: '核心', body: ['dict 儲存 key 到 value 的對應；set 只儲存不重複的 key。兩者平均查找都很快。', '可雜湊的 key 必須不可變，因此 list 不能作為 key，但 tuple 可以。', '當題目反覆問「是否存在」或「出現幾次」，先考慮 set 或 dict。'], code: String.raw`groups = {}
groups.setdefault(key, []).append(value)`, takeaway: 'set 回答存在性，dict 保存與 key 關聯的資訊。', relatedProblem: 10 },
  { id: 'py-sorting', language: 'Python', title: '排序後一次掃描', description: '用排序把關係變得相鄰。', minutes: 11, level: '進階', body: ['許多看似需要兩兩比較的問題，在排序後只需檢查相鄰或最後一個結果。', 'sorted 回傳新清單；list.sort() 則原地修改。選擇時要留意輸入是否允許被改動。', '合併區間先依起點排序，後續只需和目前已合併的最後一段比較。'], code: String.raw`for start, end in sorted(intervals):
    if start > merged[-1][1]:
        merged.append([start, end])`, takeaway: '排序成本 O(n log n)，常能換來簡潔可靠的線性掃描。', relatedProblem: 12 },
  { id: 'sql-select', language: 'SQL', title: 'SELECT、WHERE、ORDER BY', description: '建立一條可讀、可預測的查詢。', minutes: 6, level: '入門', body: ['SELECT 決定輸出欄位，FROM 指定來源，WHERE 篩選列，ORDER BY 決定顯示順序。', 'SQL 的書寫順序與概念執行順序不同，但固定排版能讓查詢更容易檢查。', '正式查詢避免 SELECT *，明列欄位可減少不必要資料並穩定輸出契約。'], code: String.raw`SELECT id, name
FROM customers
WHERE status = 'active'
ORDER BY name;`, takeaway: '先確定輸出欄位，再逐步加入篩選與排序。', relatedProblem: 13 },
  { id: 'sql-group', language: 'SQL', title: 'GROUP BY 與彙總', description: '把明細資料轉成可分析的指標。', minutes: 9, level: '核心', body: ['COUNT、SUM、AVG、MIN、MAX 都是彙總函式。GROUP BY 定義每個結果列代表哪一組。', 'SELECT 中未彙總的欄位通常必須出現在 GROUP BY，否則結果可能不合法或不穩定。', 'WHERE 在分組前過濾列；HAVING 在分組後過濾群組。'], code: String.raw`SELECT course_id, COUNT(*) AS total
FROM enrollments
GROUP BY course_id
HAVING COUNT(*) >= 10;`, takeaway: '先用一句話定義「每一列代表什麼」，再寫 GROUP BY。', relatedProblem: 14 },
  { id: 'sql-conditional', language: 'SQL', title: 'CASE 條件彙總', description: '在同一查詢中計算比例與分類。', minutes: 10, level: '進階', body: ['CASE 可以把條件轉為值。搭配 SUM，可計算符合條件的列數。', '比率計算要避免整數除法；使用 100.0 或 CAST 轉為浮點數。', 'NULL 不是一般值，應使用 IS NULL 或 IS NOT NULL 判斷。'], code: String.raw`SUM(CASE WHEN completed_at IS NOT NULL
         THEN 1 ELSE 0 END)`, takeaway: 'CASE 將商業條件轉成可彙總的數值。', relatedProblem: 16 },
  { id: 'gdb-breakpoints', language: 'GDB', title: '中斷點與程式控制', description: '精準停在想觀察的程式位置。', minutes: 6, level: '入門', body: ['break 可接受函式名稱或 檔名:行號。run 啟動程式，continue 從目前位置繼續。', 'next 執行下一行但略過函式內部，step 則會進入函式。除錯前先決定你需要哪種粒度。', '以 -g 編譯才能讓 GDB 對應原始碼與變數資訊。'], code: String.raw`gcc -g app.c -o app
gdb ./app
(gdb) break main
(gdb) run`, takeaway: 'break 選位置，run/continue 控制流程，next/step 控制粒度。', relatedProblem: 17 },
  { id: 'gdb-stack', language: 'GDB', title: '讀懂呼叫堆疊', description: '從崩潰點一路追到問題來源。', minutes: 8, level: '核心', body: ['程式崩潰時，backtrace 是第一個值得執行的指令。frame 0 是目前位置，數字越大越接近早期呼叫者。', '切換 frame 後，可用 info locals 與 print expr 檢查當時的資料。', '不要只修崩潰的那一行；往上一層找出是哪個無效輸入被傳進來。'], code: String.raw`(gdb) backtrace
(gdb) frame 1
(gdb) info locals
(gdb) print request`, takeaway: '堆疊告訴你怎麼走到錯誤；frame 讓你重建每一層情境。', relatedProblem: 19 },
  { id: 'gdb-watch', language: 'GDB', title: '觀察點與條件中斷', description: '讓 GDB 自動等到關鍵狀態發生。', minutes: 10, level: '進階', body: ['watch expr 在運算式值改變時暫停，適合追蹤「是誰改壞資料」。', '條件中斷點把 if 條件附加在 break 指令後，能略過大量無關迭代。', '這兩種工具都比手動單步數千次更可靠，也讓除錯假設可重複驗證。'], code: String.raw`(gdb) watch count
(gdb) break worker.c:42 if id == 17
(gdb) continue`, takeaway: '把問題狀態寫成條件，讓除錯器替你等待。', relatedProblem: 20 },
];
