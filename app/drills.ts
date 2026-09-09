import type { Difficulty, Language, Problem } from './content';

type Blueprint = {
  language: Language;
  track: string;
  topic: string;
  title: string;
  description: string;
  task: string;
  starter: string;
  solution: string;
  explanation: string;
  example: { input: string; output: string };
  tokens: string[];
};

export const algorithmTracks = [
  { id: 'arrays', title: '陣列與字串', description: '走訪、前綴和、矩陣與字串處理', topics: ['陣列', '前綴和', '矩陣', '字串'], color: '#2563eb' },
  { id: 'search', title: '排序與搜尋', description: '排序、二分搜尋與答案空間', topics: ['二分搜尋', '排序', 'Heap'], color: '#7c3aed' },
  { id: 'hash', title: '雜湊與集合', description: '計數、存在性與快速對應', topics: ['雜湊表', 'dict', 'Counter'], color: '#d97706' },
  { id: 'window', title: '雙指標與滑動窗口', description: '用線性掃描處理連續區間', topics: ['雙指標', '滑動窗口'], color: '#0891b2' },
  { id: 'structures', title: '基礎資料結構', description: '鏈結串列、堆疊、佇列與優先佇列', topics: ['鏈結串列', 'stack', 'priority_queue', 'heapq'], color: '#0d9488' },
  { id: 'graphs', title: '樹與圖論', description: 'BFS、DFS、連通元件與最短路徑', topics: ['BFS', 'DFS', '圖論'], color: '#059669' },
  { id: 'dp', title: '動態規劃', description: '狀態定義、轉移與空間最佳化', topics: ['動態規劃'], color: '#e11d48' },
  { id: 'database', title: '資料庫查詢', description: 'JOIN、彙總、窗口函式與 CTE', topics: ['WHERE', 'JOIN', 'GROUP BY', '窗口函式', 'CTE', '反連接'], color: '#16a34a' },
  { id: 'systems', title: '系統與記憶體', description: '位元運算、記憶體檢查與執行緒', topics: ['位元運算', '記憶體', '執行緒'], color: '#ea580c' },
  { id: 'debugging', title: '除錯實戰', description: '中斷點、觀察點、堆疊與 core dump', topics: ['中斷點', 'watchpoint', '呼叫堆疊', 'core dump'], color: '#dc2626' },
];

const blueprints: Blueprint[] = [
  {
    language: 'C', track: '陣列與字串', topic: '陣列', title: '找出陣列最小值',
    description: '走訪整數陣列並找出最小元素。', task: '完成 min_value；不得先排序陣列。',
    starter: String.raw`int min_value(const int *a, int n) {
    // TODO
    return 0;
}`,
    solution: String.raw`int min_value(const int *a, int n) {
    int best = a[0];
    for (int i = 1; i < n; i++)
        if (a[i] < best) best = a[i];
    return best;
}`,
    explanation: '以第一個元素初始化答案，之後逐項更新，可在 O(n) 時間與 O(1) 空間完成。',
    example: { input: '[8, -2, 5, 1]', output: '-2' }, tokens: ['best = a[0]', 'for', 'a[i] < best'],
  },
  {
    language: 'C', track: '排序與搜尋', topic: '二分搜尋', title: '排序陣列查找',
    description: '在遞增排序陣列中尋找 target 的索引。', task: '完成 binary_search_index，時間複雜度須為 O(log n)。',
    starter: String.raw`int binary_search_index(const int *a, int n, int target) {
    // TODO
    return -1;
}`,
    solution: String.raw`int binary_search_index(const int *a, int n, int target) {
    int left = 0, right = n - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (a[mid] == target) return mid;
        if (a[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
    explanation: '每次排除一半搜尋範圍；中點寫法避免 left + right 溢位。',
    example: { input: '[1,3,6,9], target=6', output: '2' }, tokens: ['while (left <= right)', 'right - left', 'mid + 1'],
  },
  {
    language: 'C', track: '陣列與字串', topic: '前綴和', title: '區間總和',
    description: '先建立前綴和，快速回答多次閉區間 [l,r] 的總和。', task: '完成 build_prefix，prefix[0] 必須是 0。',
    starter: String.raw`void build_prefix(const int *a, long long *prefix, int n) {
    // TODO
}`,
    solution: String.raw`void build_prefix(const int *a, long long *prefix, int n) {
    prefix[0] = 0;
    for (int i = 0; i < n; i++)
        prefix[i + 1] = prefix[i] + a[i];
}
// [l,r] = prefix[r + 1] - prefix[l]`,
    explanation: 'prefix[i] 表示前 i 個元素總和，因此閉區間可用兩個前綴值相減。',
    example: { input: '[2,4,1,3], l=1, r=3', output: '8' }, tokens: ['prefix[0] = 0', 'prefix[i + 1]', 'prefix[i] + a[i]'],
  },
  {
    language: 'C', track: '陣列與字串', topic: '矩陣', title: '矩陣主對角線總和',
    description: '計算 n×n 方陣主對角線元素總和。', task: '矩陣以一維連續記憶體傳入。',
    starter: String.raw`int diagonal_sum(const int *matrix, int n) {
    // TODO
    return 0;
}`,
    solution: String.raw`int diagonal_sum(const int *matrix, int n) {
    int total = 0;
    for (int i = 0; i < n; i++)
        total += matrix[i * n + i];
    return total;
}`,
    explanation: '列 i、欄 i 在線性配置中的索引為 i*n+i，只需走訪 n 個元素。',
    example: { input: '[[1,2],[3,4]]', output: '5' }, tokens: ['i * n + i', 'total +=', 'for'],
  },
  {
    language: 'C', track: '基礎資料結構', topic: '鏈結串列', title: '計算鏈結串列長度',
    description: '從 head 開始計算單向鏈結串列的節點數。', task: '不可修改任何 next 指標。',
    starter: String.raw`int list_length(const Node *head) {
    // TODO
    return 0;
}`,
    solution: String.raw`int list_length(const Node *head) {
    int length = 0;
    for (const Node *cur = head; cur != NULL; cur = cur->next)
        length++;
    return length;
}`,
    explanation: '游標由 head 沿 next 前進，遇到 NULL 結束。空串列自然回傳 0。',
    example: { input: '1 → 7 → 9 → NULL', output: '3' }, tokens: ['cur != null', 'cur = cur->next', 'length++'],
  },
  {
    language: 'C', track: '系統與記憶體', topic: '位元運算', title: '計算二進位 1 的個數',
    description: '計算 unsigned int 的二進位表示中有幾個 1。', task: '使用 n &= n - 1 技巧。',
    starter: String.raw`int popcount(unsigned int n) {
    // TODO
    return 0;
}`,
    solution: String.raw`int popcount(unsigned int n) {
    int count = 0;
    while (n) {
        n &= n - 1;
        count++;
    }
    return count;
}`,
    explanation: 'n & (n-1) 每次清除最低位的 1，迴圈次數等於答案。',
    example: { input: '13（二進位 1101）', output: '3' }, tokens: ['while (n)', 'n &= n - 1', 'count++'],
  },
  {
    language: 'C++', track: '排序與搜尋', topic: '排序', title: '排序後移除重複',
    description: '回傳排序且不重複的新 vector。', task: '使用 STL 完成，保留遞增順序。',
    starter: String.raw`vector<int> sorted_unique(vector<int> nums) {
    // TODO
    return {};
}`,
    solution: String.raw`vector<int> sorted_unique(vector<int> nums) {
    sort(nums.begin(), nums.end());
    nums.erase(unique(nums.begin(), nums.end()), nums.end());
    return nums;
}`,
    explanation: 'sort 讓相同值相鄰；unique 將重複值移到尾端，erase 才真正縮短容器。',
    example: { input: '[3,1,3,2]', output: '[1,2,3]' }, tokens: ['sort(', 'unique(', 'erase('],
  },
  {
    language: 'C++', track: '基礎資料結構', topic: 'priority_queue', title: '第 K 大元素',
    description: '從整數陣列找出第 k 大元素。', task: '使用大小至多 k 的小根堆。',
    starter: String.raw`int kth_largest(const vector<int>& nums, int k) {
    // TODO
    return 0;
}`,
    solution: String.raw`int kth_largest(const vector<int>& nums, int k) {
    priority_queue<int, vector<int>, greater<int>> heap;
    for (int value : nums) {
        heap.push(value);
        if (heap.size() > k) heap.pop();
    }
    return heap.top();
}`,
    explanation: '堆中只保留目前最大的 k 個值，頂端就是其中最小者，也就是全體第 k 大。',
    example: { input: '[3,2,1,5,6,4], k=2', output: '5' }, tokens: ['priority_queue', 'greater<int>', 'heap.size() > k'],
  },
  {
    language: 'C++', track: '樹與圖論', topic: 'BFS', title: '二元樹層數',
    description: '使用廣度優先搜尋計算二元樹最大深度。', task: '每處理完一層就將 depth 加一。',
    starter: String.raw`int maxDepth(TreeNode* root) {
    // TODO
    return 0;
}`,
    solution: String.raw`int maxDepth(TreeNode* root) {
    if (!root) return 0;
    queue<TreeNode*> q;
    q.push(root);
    int depth = 0;
    while (!q.empty()) {
        int size = q.size();
        while (size--) {
            auto node = q.front(); q.pop();
            if (node->left) q.push(node->left);
            if (node->right) q.push(node->right);
        }
        depth++;
    }
    return depth;
}`,
    explanation: '佇列每輪保存同一層的節點；先固定 size，避免新加入的下一層混進本輪。',
    example: { input: '[3,9,20,null,null,15,7]', output: '3' }, tokens: ['queue<', 'int size = q.size()', 'depth++'],
  },
  {
    language: 'C++', track: '樹與圖論', topic: 'DFS', title: '計算連通元件',
    description: '給定無向圖 adjacency list，計算連通元件數。', task: '使用 DFS 並避免重複走訪。',
    starter: String.raw`int components(const vector<vector<int>>& graph) {
    // TODO
    return 0;
}`,
    solution: String.raw`int components(const vector<vector<int>>& graph) {
    vector<bool> seen(graph.size());
    function<void(int)> dfs = [&](int u) {
        seen[u] = true;
        for (int v : graph[u]) if (!seen[v]) dfs(v);
    };
    int count = 0;
    for (int i = 0; i < graph.size(); i++)
        if (!seen[i]) { dfs(i); count++; }
    return count;
}`,
    explanation: '每次從未看過的節點啟動 DFS，就發現一個新的連通元件。',
    example: { input: '0—1，2—3', output: '2' }, tokens: ['vector<bool> seen', 'dfs(v)', 'count++'],
  },
  {
    language: 'C++', track: '動態規劃', topic: '動態規劃', title: '零錢兌換最少枚數',
    description: '以給定硬幣湊出 amount，回傳最少硬幣數；無法湊出回傳 -1。', task: '使用一維動態規劃。',
    starter: String.raw`int coinChange(vector<int>& coins, int amount) {
    // TODO
    return -1;
}`,
    solution: String.raw`int coinChange(vector<int>& coins, int amount) {
    vector<int> dp(amount + 1, amount + 1);
    dp[0] = 0;
    for (int value = 1; value <= amount; value++)
        for (int coin : coins)
            if (coin <= value) dp[value] = min(dp[value], dp[value-coin] + 1);
    return dp[amount] > amount ? -1 : dp[amount];
}`,
    explanation: 'dp[value] 定義湊出 value 的最少枚數，由所有可用 coin 的前一狀態轉移。',
    example: { input: 'coins=[1,2,5], amount=11', output: '3' }, tokens: ['dp[0] = 0', 'dp[value-coin] + 1', '? -1'],
  },
  {
    language: 'C++', track: '雙指標與滑動窗口', topic: '滑動窗口', title: '固定窗口最大總和',
    description: '找出長度恰為 k 的連續子陣列最大總和。', task: '時間複雜度 O(n)。',
    starter: String.raw`long long max_window_sum(const vector<int>& nums, int k) {
    // TODO
    return 0;
}`,
    solution: String.raw`long long max_window_sum(const vector<int>& nums, int k) {
    long long window = accumulate(nums.begin(), nums.begin()+k, 0LL);
    long long best = window;
    for (int i = k; i < nums.size(); i++) {
        window += nums[i] - nums[i-k];
        best = max(best, window);
    }
    return best;
}`,
    explanation: '窗口右移時加入新元素並移除最左元素，每一步只做 O(1) 更新。',
    example: { input: '[2,1,5,1,3,2], k=3', output: '9' }, tokens: ['accumulate', 'nums[i] - nums[i-k]', 'max(best'],
  },
  {
    language: 'Python', track: '雜湊與集合', topic: 'Counter', title: '最高頻元素',
    description: '回傳串列中出現次數最多的元素；同次數取較小值。', task: '使用 collections.Counter。',
    starter: String.raw`def most_common_smallest(nums):
    # TODO
    pass`,
    solution: String.raw`from collections import Counter

def most_common_smallest(nums):
    counts = Counter(nums)
    best_count = max(counts.values())
    return min(value for value, count in counts.items()
               if count == best_count)`,
    explanation: 'Counter 完成頻率統計，再以最大次數過濾並取最小值處理同分規則。',
    example: { input: '[4,2,4,2,3]', output: '2' }, tokens: ['counter(nums)', 'max(counts.values())', 'min('],
  },
  {
    language: 'Python', track: '雙指標與滑動窗口', topic: '滑動窗口', title: '最長無重複子字串',
    description: '找出沒有重複字元的最長連續子字串長度。', task: '使用滑動窗口，時間 O(n)。',
    starter: String.raw`def longest_unique(text):
    # TODO
    return 0`,
    solution: String.raw`def longest_unique(text):
    last = {}
    left = best = 0
    for right, char in enumerate(text):
        if char in last and last[char] >= left:
            left = last[char] + 1
        last[char] = right
        best = max(best, right - left + 1)
    return best`,
    explanation: 'last 記錄字元最近位置；重複出現在窗口內時，left 跳過舊位置。',
    example: { input: '"abcabcbb"', output: '3' }, tokens: ['enumerate(text)', 'left = last[char] + 1', 'right - left + 1'],
  },
  {
    language: 'Python', track: '基礎資料結構', topic: 'heapq', title: '第 K 小元素',
    description: '使用堆積從串列找出第 k 小元素。', task: '不可直接完整排序。',
    starter: String.raw`def kth_smallest(nums, k):
    # TODO
    pass`,
    solution: String.raw`import heapq

def kth_smallest(nums, k):
    heap = list(nums)
    heapq.heapify(heap)
    for _ in range(k - 1):
        heapq.heappop(heap)
    return heapq.heappop(heap)`,
    explanation: 'heapify 為 O(n)，之後彈出 k 次，每次 O(log n)。',
    example: { input: '[7,2,9,1], k=2', output: '2' }, tokens: ['heapq.heapify', 'range(k - 1)', 'heappop'],
  },
  {
    language: 'Python', track: '樹與圖論', topic: 'BFS', title: '網格最短路徑',
    description: '在 0 可走、1 阻擋的網格中，找出左上到右下最少步數。', task: '四方向移動，無路徑回傳 -1。',
    starter: String.raw`def shortest_path(grid):
    # TODO
    return -1`,
    solution: String.raw`from collections import deque

def shortest_path(grid):
    rows, cols = len(grid), len(grid[0])
    queue = deque([(0, 0, 0)])
    seen = {(0, 0)}
    while queue:
        r, c, dist = queue.popleft()
        if (r, c) == (rows-1, cols-1): return dist
        for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)):
            nr, nc = r+dr, c+dc
            if 0 <= nr < rows and 0 <= nc < cols and not grid[nr][nc] and (nr,nc) not in seen:
                seen.add((nr,nc)); queue.append((nr,nc,dist+1))
    return -1`,
    explanation: 'BFS 依距離逐層探索，第一次抵達終點就是最短路徑。seen 要在入隊時標記。',
    example: { input: '[[0,0],[1,0]]', output: '2' }, tokens: ['deque', 'popleft()', 'seen.add'],
  },
  {
    language: 'Python', track: '動態規劃', topic: '動態規劃', title: '爬樓梯方法數',
    description: '每次可走 1 或 2 階，計算走到第 n 階的方法數。', task: '使用 O(1) 額外空間。',
    starter: String.raw`def climb_stairs(n):
    # TODO
    return 0`,
    solution: String.raw`def climb_stairs(n):
    previous, current = 1, 1
    for _ in range(n):
        previous, current = current, previous + current
    return previous`,
    explanation: '狀態只依賴前兩項，因此不需要保留整張 DP 表。',
    example: { input: 'n=5', output: '8' }, tokens: ['previous, current', 'previous + current', 'return previous'],
  },
  {
    language: 'Python', track: '排序與搜尋', topic: '排序', title: '合併重疊區間進階',
    description: '排序後合併所有相交或相接的閉區間。', task: '相接的 [1,2] 與 [2,4] 也要合併。',
    starter: String.raw`def merge_touching(intervals):
    # TODO
    return []`,
    solution: String.raw`def merge_touching(intervals):
    merged = []
    for start, end in sorted(intervals):
        if not merged or start > merged[-1][1]:
            merged.append([start, end])
        else:
            merged[-1][1] = max(merged[-1][1], end)
    return merged`,
    explanation: '排序後只需和最後一段比較；閉區間相接時 start == end，仍進入合併分支。',
    example: { input: '[[1,2],[2,4],[7,8]]', output: '[[1,4],[7,8]]' }, tokens: ['sorted(intervals)', 'start > merged[-1][1]', 'max('],
  },
  {
    language: 'SQL', track: '資料庫查詢', topic: 'WHERE', title: '篩選近期有效紀錄',
    description: '找出仍有效且最近 30 天有更新的紀錄。', task: '輸出 id、title、updated_at 並由新到舊排列。',
    starter: String.raw`SELECT
  -- TODO
FROM records;`,
    solution: String.raw`SELECT id, title, updated_at
FROM records
WHERE active = 1
  AND updated_at >= date('now', '-30 days')
ORDER BY updated_at DESC;`,
    explanation: '先以布林狀態與日期範圍篩選，再排序需要輸出的資料。',
    example: { input: 'records', output: '近 30 天有效紀錄' }, tokens: ['where active = 1', "date('now', '-30 days')", 'order by updated_at desc'],
  },
  {
    language: 'SQL', track: '資料庫查詢', topic: 'JOIN', title: '訂單與客戶連接',
    description: '列出訂單編號、客戶名稱與訂單金額。', task: '即使客戶資料遺失也要保留訂單。',
    starter: String.raw`SELECT
  -- TODO
FROM orders o;`,
    solution: String.raw`SELECT o.id AS order_id, c.name AS customer_name, o.amount
FROM orders o
LEFT JOIN customers c ON c.id = o.customer_id
ORDER BY o.id;`,
    explanation: 'LEFT JOIN 保留左表 orders 的每一列；缺少客戶時名稱為 NULL。',
    example: { input: 'orders + customers', output: '所有訂單' }, tokens: ['left join customers', 'c.id = o.customer_id', 'order by o.id'],
  },
  {
    language: 'SQL', track: '資料庫查詢', topic: 'GROUP BY', title: '分類銷售統計',
    description: '計算每個 category 的商品數與平均價格。', task: '只保留至少 3 個商品的分類。',
    starter: String.raw`SELECT category,
  -- TODO
FROM products;`,
    solution: String.raw`SELECT category,
       COUNT(*) AS product_count,
       ROUND(AVG(price), 2) AS average_price
FROM products
GROUP BY category
HAVING COUNT(*) >= 3
ORDER BY category;`,
    explanation: 'WHERE 篩列、HAVING 篩群組；這裡條件依賴 COUNT，所以使用 HAVING。',
    example: { input: 'products', output: '合格分類統計' }, tokens: ['count(*)', 'avg(price)', 'having count(*) >= 3'],
  },
  {
    language: 'SQL', track: '資料庫查詢', topic: '窗口函式', title: '部門薪資排名',
    description: '在每個部門內依薪資由高到低排名。', task: '相同薪資要得到相同名次且名次不跳號。',
    starter: String.raw`SELECT employee_id, department_id, salary,
  -- TODO
FROM employees;`,
    solution: String.raw`SELECT employee_id, department_id, salary,
       DENSE_RANK() OVER (
         PARTITION BY department_id
         ORDER BY salary DESC
       ) AS salary_rank
FROM employees;`,
    explanation: 'DENSE_RANK 處理同分且不留名次空洞；PARTITION BY 讓每個部門重新排名。',
    example: { input: 'employees', output: '各部門內排名' }, tokens: ['dense_rank()', 'partition by department_id', 'order by salary desc'],
  },
  {
    language: 'SQL', track: '資料庫查詢', topic: 'CTE', title: '遞迴組織層級',
    description: '從主管 id=1 開始列出所有下屬與層級深度。', task: '使用 WITH RECURSIVE。',
    starter: String.raw`WITH RECURSIVE org AS (
  -- TODO
)
SELECT * FROM org;`,
    solution: String.raw`WITH RECURSIVE org(id, manager_id, depth) AS (
  SELECT id, manager_id, 0 FROM employees WHERE id = 1
  UNION ALL
  SELECT e.id, e.manager_id, org.depth + 1
  FROM employees e JOIN org ON e.manager_id = org.id
)
SELECT * FROM org ORDER BY depth, id;`,
    explanation: '錨點查詢建立根節點；遞迴分支反覆連接直接下屬並增加 depth。',
    example: { input: 'employees hierarchy', output: '主管及所有下屬' }, tokens: ['with recursive', 'union all', 'org.depth + 1'],
  },
  {
    language: 'SQL', track: '資料庫查詢', topic: '反連接', title: '找出沒有訂單的客戶',
    description: '列出從未建立任何訂單的客戶。', task: '使用 NOT EXISTS，輸出 id 與 name。',
    starter: String.raw`SELECT c.id, c.name
FROM customers c
WHERE -- TODO;`,
    solution: String.raw`SELECT c.id, c.name
FROM customers c
WHERE NOT EXISTS (
  SELECT 1 FROM orders o WHERE o.customer_id = c.id
)
ORDER BY c.id;`,
    explanation: 'NOT EXISTS 直接表達「不存在相關列」，也不受 NULL 比較陷阱影響。',
    example: { input: 'customers + orders', output: '零訂單客戶' }, tokens: ['not exists', 'o.customer_id = c.id', 'select 1'],
  },
  {
    language: 'GDB', track: '除錯實戰', topic: '中斷點', title: '條件式函式中斷點',
    description: '只在 parse 的參數 length 大於 1024 時暫停。', task: '設定中斷點後繼續執行。',
    starter: '# TODO：輸入 GDB 指令',
    solution: 'break parse if length > 1024\ncontinue',
    explanation: '條件直接附加在 break 後，可讓 GDB 略過不相關呼叫。',
    example: { input: 'parse(buffer, length)', output: 'length > 1024 時暫停' }, tokens: ['break parse if length > 1024', 'continue'],
  },
  {
    language: 'GDB', track: '除錯實戰', topic: 'watchpoint', title: '追蹤記憶體寫入',
    description: '監看 *status_ptr 指向的值何時被修改。', task: '建立觀察點並繼續執行。',
    starter: '# TODO：輸入 GDB 指令',
    solution: 'watch *status_ptr\ncontinue',
    explanation: 'watch 接受運算式；只要解參照後的值改變，程式就會暫停。',
    example: { input: 'status_ptr', output: '顯示新舊值' }, tokens: ['watch *status_ptr', 'continue'],
  },
  {
    language: 'GDB', track: '除錯實戰', topic: '呼叫堆疊', title: '檢查指定堆疊層',
    description: '崩潰後列出堆疊、切到 frame 2 並查看參數。', task: '依順序輸入三個指令。',
    starter: '# 1. 堆疊\n# 2. frame 2\n# 3. 參數',
    solution: 'backtrace\nframe 2\ninfo args',
    explanation: 'backtrace 建立全貌；切換 frame 後，info args 顯示該層收到的參數。',
    example: { input: 'SIGSEGV', output: 'frame 2 arguments' }, tokens: ['backtrace', 'frame 2', 'info args'],
  },
  {
    language: 'GDB', track: '系統與記憶體', topic: '記憶體', title: '以十六進位檢查記憶體',
    description: '從 buffer 位址開始顯示 16 個 byte，使用十六進位格式。', task: '使用 x 指令的數量、格式與單位修飾。',
    starter: '# TODO：輸入 GDB 指令',
    solution: 'x/16xb buffer',
    explanation: 'x/NFU 中 N 是數量、x 是十六進位格式、b 是 byte 單位。',
    example: { input: 'buffer', output: '16 bytes in hex' }, tokens: ['x/16xb buffer'],
  },
  {
    language: 'GDB', track: '系統與記憶體', topic: '執行緒', title: '列出並切換執行緒',
    description: '列出所有執行緒，然後切換到執行緒 3。', task: '使用完整 GDB 指令。',
    starter: '# TODO：輸入 GDB 指令',
    solution: 'info threads\nthread 3',
    explanation: 'info threads 顯示目前與其他執行緒；thread N 切換除錯上下文。',
    example: { input: 'multi-thread process', output: 'thread 3 selected' }, tokens: ['info threads', 'thread 3'],
  },
  {
    language: 'GDB', track: '除錯實戰', topic: 'core dump', title: '載入 core dump',
    description: '使用可執行檔 app 與 core 檔 core.1234 啟動 GDB，再列出堆疊。', task: '寫出 shell 啟動命令與第一個 GDB 指令。',
    starter: '# TODO：輸入啟動命令與 GDB 指令',
    solution: 'gdb ./app core.1234\nbacktrace',
    explanation: '同時指定 executable 與 core，可重建崩潰時的暫存器與記憶體狀態。',
    example: { input: 'app + core.1234', output: 'crash backtrace' }, tokens: ['gdb ./app core.1234', 'backtrace'],
  },
];

const variants: { name: string; focus: string; difficulty: Difficulty; acceptance: number }[] = [
  { name: '基礎版', focus: '先完成核心流程，驗證一般輸入。', difficulty: '簡單', acceptance: 78 },
  { name: '邊界版', focus: '特別處理空值、極小資料或邊界條件。', difficulty: '簡單', acceptance: 72 },
  { name: '負值版', focus: '加入負數、重複值或 NULL 等容易忽略的資料。', difficulty: '中等', acceptance: 64 },
  { name: '效能版', focus: '在大量資料下維持題目要求的時間與空間複雜度。', difficulty: '中等', acceptance: 57 },
  { name: '除錯版', focus: '辨認常見錯誤，讓實作在隱藏案例下保持正確。', difficulty: '困難', acceptance: 49 },
  { name: '綜合版', focus: '整合核心技巧、邊界處理與可讀性完成最終挑戰。', difficulty: '困難', acceptance: 42 },
];

const expansionVariants: { name: string; focus: string; requirement: string; difficulty: Difficulty; acceptance: number }[] = [
  { name: '資料驗證版', focus: '先辨認輸入前提，再讓核心流程在合法資料上穩定運作。', requirement: '請在解法旁註明依賴的輸入前提。', difficulty: '簡單', acceptance: 76 },
  { name: '測試驅動版', focus: '從最小案例、典型案例與反例推導實作。', requirement: '完成前請自行列出至少三種測試情境。', difficulty: '簡單', acceptance: 73 },
  { name: '極限輸入版', focus: '處理最小值、最大值與空集合附近的邊界。', requirement: '不得以固定大小或特定範例作為假設。', difficulty: '中等', acceptance: 66 },
  { name: '記憶體版', focus: '在維持正確性的同時控制配置、複製與暫存資料。', requirement: '說明額外空間複雜度與資料生命週期。', difficulty: '中等', acceptance: 62 },
  { name: '可讀性版', focus: '以清楚命名和單一職責整理相同演算法。', requirement: '禁止以難以理解的單行技巧取代核心步驟。', difficulty: '中等', acceptance: 60 },
  { name: '常見陷阱版', focus: '主動避開索引越界、空值、重複資料或 NULL 語意錯誤。', requirement: '在解答說明中指出最可能發生的錯誤。', difficulty: '中等', acceptance: 56 },
  { name: '面試版', focus: '先說明策略與複雜度，再完成可直接討論的實作。', requirement: '解法必須能以兩分鐘清楚說明。', difficulty: '困難', acceptance: 50 },
  { name: '生產版', focus: '把輸入契約、錯誤邊界與維護性一起納入設計。', requirement: '避免隱含狀態，並保留可測試的函式介面。', difficulty: '困難', acceptance: 47 },
  { name: '壓力測試版', focus: '在大規模資料與最壞排列下維持要求的複雜度。', requirement: '輸入規模可達 1,000,000，禁止不必要的巢狀掃描。', difficulty: '困難', acceptance: 43 },
  { name: '大師版', focus: '同時滿足正確性、效能、邊界與可讀性。', requirement: '提交前逐項檢查時間、空間與所有邊界條件。', difficulty: '困難', acceptance: 38 },
];

const originalGeneratedProblems: Problem[] = blueprints.flatMap((blueprint, blueprintIndex) =>
  variants.map((variant, variantIndex) => {
    const id = 21 + blueprintIndex * variants.length + variantIndex;
    return {
      id,
      slug: `drill-${id}`,
      title: `${blueprint.title}・${variant.name}`,
      language: blueprint.language,
      difficulty: variant.difficulty,
      topic: blueprint.topic,
      track: blueprint.track,
      acceptance: Math.max(31, variant.acceptance - (blueprintIndex % 5)),
      description: `${blueprint.description}${variant.focus}`,
      task: blueprint.task,
      constraints: [
        variantIndex >= 3 ? '輸入規模可達 100,000，需留意複雜度' : '先以題目範例驗證核心流程',
        variantIndex === 1 ? '必須明確處理最小或空資料邊界' : '不可使用未在解答中說明的全域狀態',
        '答案應保持可讀並符合指定介面',
      ],
      examples: [blueprint.example],
      starter: blueprint.starter,
      solution: blueprint.solution,
      explanation: `${blueprint.explanation} 本題重點：${variant.focus}`,
      hints: ['先用一句話定義每個變數或資料結構的角色。', blueprint.explanation],
      checks: [
        { label: '核心結構', input: blueprint.example.input, output: blueprint.example.output, tokens: blueprint.tokens.slice(0, 1) },
        { label: '關鍵步驟', input: variant.name, output: '通過', tokens: blueprint.tokens.slice(0, 2) },
        { label: '完整解法', input: '隱藏案例', output: '通過', tokens: blueprint.tokens },
      ],
    } satisfies Problem;
  }),
);

export const expandedGeneratedProblems: Problem[] = blueprints.flatMap((blueprint, blueprintIndex) =>
  expansionVariants.map((variant, variantIndex) => {
    const id = 201 + blueprintIndex * expansionVariants.length + variantIndex;
    return {
      id,
      slug: `challenge-${id}`,
      title: `${blueprint.title}・${variant.name}`,
      language: blueprint.language,
      difficulty: variant.difficulty,
      topic: blueprint.topic,
      track: blueprint.track,
      acceptance: Math.max(27, variant.acceptance - (blueprintIndex % 6)),
      description: `${blueprint.description}${variant.focus}`,
      task: `${blueprint.task} ${variant.requirement}`,
      constraints: [
        variant.requirement,
        variantIndex >= 6 ? '必須先分析複雜度，再選擇資料結構或查詢策略' : '至少驗證一個一般案例與一個邊界案例',
        '答案須符合指定介面，且不得依賴未說明的全域狀態',
      ],
      examples: [blueprint.example],
      starter: blueprint.starter,
      solution: blueprint.solution,
      explanation: `${blueprint.explanation} 本題訓練：${variant.focus}`,
      hints: ['先寫下輸入、輸出與邊界，再開始實作。', blueprint.explanation],
      checks: [
        { label: '核心案例', input: blueprint.example.input, output: blueprint.example.output, tokens: blueprint.tokens.slice(0, 1) },
        { label: variant.name, input: variant.focus, output: '通過', tokens: blueprint.tokens.slice(0, 2) },
        { label: '完整與邊界案例', input: '隱藏案例', output: '通過', tokens: blueprint.tokens },
      ],
    } satisfies Problem;
  }),
);

// Only expose the first, canonical version of every blueprint. Older releases
// repeated each blueprint under labels such as "基礎版" and "邊界版" without
// changing the actual task or solution. Keeping one canonical problem makes the
// visible count honest while legacy IDs are migrated in app/page.tsx.
export const generatedProblems: Problem[] = originalGeneratedProblems.filter((_, index) => index % variants.length === 0);
