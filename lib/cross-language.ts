import type { Language, Problem } from '@/app/content';

export type CrossLanguageSolution = {
  targetLanguage: Extract<Language, 'C' | 'C++'>;
  code: string;
  differences: string[];
};

type Conversion = {
  sourceLanguage: Extract<Language, 'C' | 'C++'>;
  marker: string;
  result: CrossLanguageSolution;
};

const cToCppNotes = ['陣列指標改用 const vector<int>&，長度可由 size() 取得。', '核心迴圈與時間複雜度保持不變。'];
const cppToCNotes = ['STL 容器改成指標加長度參數，記憶體生命週期由呼叫端管理。', 'C 沒有方法與泛型容器，需要明確傳入容量或輸出參數。'];

const conversions: Conversion[] = [
  {
    sourceLanguage: 'C', marker: 'sum_array(',
    result: { targetLanguage: 'C++', differences: cToCppNotes, code: String.raw`int sum_array(const std::vector<int>& nums) {
    int total = 0;
    for (int value : nums) total += value;
    return total;
}` },
  },
  {
    sourceLanguage: 'C', marker: 'void swap(',
    result: { targetLanguage: 'C++', differences: ['C++ 可用參考直接修改呼叫端變數，不必顯式解參照。', '實務上也可直接使用 std::swap。'], code: String.raw`void swap_values(int& a, int& b) {
    int temp = a;
    a = b;
    b = temp;
}` },
  },
  {
    sourceLanguage: 'C', marker: 'count_vowels(',
    result: { targetLanguage: 'C++', differences: ['以 const std::string& 取代以 \\0 結尾的 char 指標。', '範圍 for 直接逐字走訪。'], code: String.raw`int count_vowels(const std::string& text) {
    int count = 0;
    for (char c : text) {
        if (std::string("aeiouAEIOU").find(c) != std::string::npos) count++;
    }
    return count;
}` },
  },
  {
    sourceLanguage: 'C', marker: 'void reverse(',
    result: { targetLanguage: 'C++', differences: ['std::string 自帶長度並負責記憶體管理。', '仍保留雙指標交換，方便比較兩種語法。'], code: String.raw`void reverse_text(std::string& text) {
    int left = 0;
    int right = static_cast<int>(text.size()) - 1;
    while (left < right) std::swap(text[left++], text[right--]);
}` },
  },
  {
    sourceLanguage: 'C', marker: 'min_value(',
    result: { targetLanguage: 'C++', differences: cToCppNotes, code: String.raw`int min_value(const std::vector<int>& values) {
    int best = values.front();
    for (int value : values) best = std::min(best, value);
    return best;
}` },
  },
  {
    sourceLanguage: 'C', marker: 'binary_search_index(',
    result: { targetLanguage: 'C++', differences: cToCppNotes, code: String.raw`int binary_search_index(const std::vector<int>& values, int target) {
    int left = 0, right = static_cast<int>(values.size()) - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (values[mid] == target) return mid;
        if (values[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}` },
  },
  {
    sourceLanguage: 'C', marker: 'build_prefix(',
    result: { targetLanguage: 'C++', differences: ['C++ 直接回傳 vector<long long>，不需由呼叫端準備輸出陣列。', 'vector 會自動管理配置與釋放。'], code: String.raw`std::vector<long long> build_prefix(const std::vector<int>& values) {
    std::vector<long long> prefix(values.size() + 1, 0);
    for (std::size_t i = 0; i < values.size(); i++)
        prefix[i + 1] = prefix[i] + values[i];
    return prefix;
}` },
  },
  {
    sourceLanguage: 'C', marker: 'diagonal_sum(',
    result: { targetLanguage: 'C++', differences: ['以二維 vector 表達矩陣，不需手動計算 i*n+i。', '容器仍以 const 參考傳入以避免複製。'], code: String.raw`int diagonal_sum(const std::vector<std::vector<int>>& matrix) {
    int total = 0;
    for (std::size_t i = 0; i < matrix.size(); i++) total += matrix[i][i];
    return total;
}` },
  },
  {
    sourceLanguage: 'C', marker: 'list_length(',
    result: { targetLanguage: 'C++', differences: ['節點走訪語法相近；C++ 使用 nullptr 取代 NULL。', 'const 指標同樣表示不修改串列節點。'], code: String.raw`int list_length(const Node* head) {
    int length = 0;
    for (const Node* current = head; current != nullptr; current = current->next) length++;
    return length;
}` },
  },
  {
    sourceLanguage: 'C', marker: 'popcount(',
    result: { targetLanguage: 'C++', differences: ['位元技巧在 C 與 C++ 完全相同。', 'C++20 亦可使用 <bit> 中的 std::popcount。'], code: String.raw`int popcount(unsigned int value) {
    int count = 0;
    while (value) {
        value &= value - 1;
        count++;
    }
    return count;
}` },
  },
  {
    sourceLanguage: 'C++', marker: 'removeDuplicates(',
    result: { targetLanguage: 'C', differences: cppToCNotes, code: String.raw`int remove_duplicates(int *nums, int n) {
    if (n == 0) return 0;
    int write = 1;
    for (int read = 1; read < n; read++)
        if (nums[read] != nums[read - 1]) nums[write++] = nums[read];
    return write;
}` },
  },
  {
    sourceLanguage: 'C++', marker: 'mostFrequent(',
    result: { targetLanguage: 'C', differences: ['C 標準函式庫沒有 unordered_map；此教學版先排序字串指標再連續計數。', '回傳的字串仍由輸入資料持有，不另外配置。'], code: String.raw`const char *most_frequent(char **words, int n) {
    qsort(words, n, sizeof(char *), compare_strings);
    const char *best = words[0];
    int best_count = 1, count = 1;
    for (int i = 1; i <= n; i++) {
        if (i < n && strcmp(words[i], words[i - 1]) == 0) count++;
        else {
            if (count > best_count) { best = words[i - 1]; best_count = count; }
            count = 1;
        }
    }
    return best;
}` },
  },
  {
    sourceLanguage: 'C++', marker: 'twoSum(',
    result: { targetLanguage: 'C', differences: ['以兩個輸出指標回傳索引，取代 vector<int> 回傳值。', '這個直觀 C 版本使用雙迴圈，適合先比較介面；大型資料可再實作雜湊表。'], code: String.raw`int two_sum(const int *nums, int n, int target, int *first, int *second) {
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (nums[i] + nums[j] == target) {
                *first = i; *second = j;
                return 1;
            }
        }
    }
    return 0;
}` },
  },
  {
    sourceLanguage: 'C++', marker: 'isValid(',
    result: { targetLanguage: 'C', differences: ['std::stack 改為自行配置的 char 陣列與 top 索引。', 'C 字串以 \\0 判斷結尾。'], code: String.raw`int is_valid(const char *text) {
    int n = (int)strlen(text), top = 0;
    char *stack = malloc((size_t)n);
    for (int i = 0; i < n; i++) {
        char c = text[i];
        if (c == '(' || c == '[' || c == '{') stack[top++] = c;
        else {
            char expected = c == ')' ? '(' : c == ']' ? '[' : '{';
            if (top == 0 || stack[--top] != expected) { free(stack); return 0; }
        }
    }
    free(stack);
    return top == 0;
}` },
  },
  {
    sourceLanguage: 'C++', marker: 'sorted_unique(',
    result: { targetLanguage: 'C', differences: ['sort/unique/erase 改為 qsort 加一次覆寫掃描。', '函式回傳新的有效長度，資料仍放在原陣列前段。'], code: String.raw`int sorted_unique(int *nums, int n) {
    qsort(nums, n, sizeof(int), compare_ints);
    int write = 0;
    for (int read = 0; read < n; read++)
        if (write == 0 || nums[read] != nums[write - 1]) nums[write++] = nums[read];
    return write;
}` },
  },
  {
    sourceLanguage: 'C++', marker: 'kth_largest(',
    result: { targetLanguage: 'C', differences: ['priority_queue 改成排序後取索引，程式較短但時間複雜度變為 O(n log n)。', '若要保留 O(n log k)，需再實作容量為 k 的最小堆。'], code: String.raw`int kth_largest(int *nums, int n, int k) {
    qsort(nums, n, sizeof(int), compare_ints);
    return nums[n - k];
}` },
  },
  {
    sourceLanguage: 'C++', marker: 'maxDepth(',
    result: { targetLanguage: 'C', differences: ['TreeNode 類別改為 struct TreeNode。', '用遞迴示範 C 的函式寫法，避免額外實作 queue。'], code: String.raw`int max_depth(const struct TreeNode *root) {
    if (root == NULL) return 0;
    int left = max_depth(root->left);
    int right = max_depth(root->right);
    return 1 + (left > right ? left : right);
}` },
  },
  {
    sourceLanguage: 'C++', marker: 'components(',
    result: { targetLanguage: 'C', differences: ['vector<vector<int>> 改成扁平化的 n×n 鄰接矩陣。', 'seen 由呼叫端或 calloc 配置並在結束時釋放。'], code: String.raw`void dfs(int node, int n, const int *graph, int *seen) {
    seen[node] = 1;
    for (int next = 0; next < n; next++)
        if (graph[node * n + next] && !seen[next]) dfs(next, n, graph, seen);
}

int components(int n, const int *graph) {
    int *seen = calloc((size_t)n, sizeof(int));
    int count = 0;
    for (int node = 0; node < n; node++)
        if (!seen[node]) { dfs(node, n, graph, seen); count++; }
    free(seen);
    return count;
}` },
  },
  {
    sourceLanguage: 'C++', marker: 'coinChange(',
    result: { targetLanguage: 'C', differences: ['vector<int> DP 表改用 malloc 配置並明確 free。', 'std::min 改為一般條件比較。'], code: String.raw`int coin_change(const int *coins, int n, int amount) {
    int *dp = malloc((size_t)(amount + 1) * sizeof(int));
    for (int value = 0; value <= amount; value++) dp[value] = amount + 1;
    dp[0] = 0;
    for (int value = 1; value <= amount; value++)
        for (int i = 0; i < n; i++)
            if (coins[i] <= value && dp[value - coins[i]] + 1 < dp[value])
                dp[value] = dp[value - coins[i]] + 1;
    int answer = dp[amount] > amount ? -1 : dp[amount];
    free(dp);
    return answer;
}` },
  },
  {
    sourceLanguage: 'C++', marker: 'max_window_sum(',
    result: { targetLanguage: 'C', differences: ['vector 與 accumulate 改為指標、長度與明確迴圈。', '滑動窗口的 O(n) 核心完全相同。'], code: String.raw`long long max_window_sum(const int *nums, int n, int k) {
    long long window = 0;
    for (int i = 0; i < k; i++) window += nums[i];
    long long best = window;
    for (int i = k; i < n; i++) {
        window += nums[i] - nums[i - k];
        if (window > best) best = window;
    }
    return best;
}` },
  },
];

export function getCrossLanguageSolution(
  problem: Pick<Problem, 'language' | 'solution'>,
  pairedProblem?: Pick<Problem, 'language' | 'solution'>,
): CrossLanguageSolution | null {
  if (problem.language !== 'C' && problem.language !== 'C++') return null;
  if (pairedProblem && pairedProblem.language !== problem.language && (pairedProblem.language === 'C' || pairedProblem.language === 'C++')) {
    return {
      targetLanguage: pairedProblem.language,
      code: pairedProblem.solution,
      differences: problem.language === 'C'
        ? ['相同演算法改用 C++ 標準容器或演算法，減少手動記憶體管理。', '對照輸入、迴圈與輸出位置，觀察語法差異而不是死背翻譯。']
        : ['相同演算法改用 C 的陣列、指標與函式介面。', 'C 版本會明確配置與釋放需要的記憶體。'],
    };
  }
  return conversions.find((conversion) => conversion.sourceLanguage === problem.language && problem.solution.includes(conversion.marker))?.result || null;
}
