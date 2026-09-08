export type JudgeCase = { input: string; expected: string };

export type JudgeDefinition = {
  languageId: number;
  cases: JudgeCase[];
  wrap: (source: string, input: string) => { source: string; stdin: string };
};

const cPrelude = '#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n#include <ctype.h>\n';
const cppPrelude = '#include <bits/stdc++.h>\nusing namespace std;\n';

const blueprintDefinitions: JudgeDefinition[] = [
  {
    languageId: 103,
    cases: [
      { input: '4\n8 -2 5 1\n', expected: '-2' },
      { input: '1\n42\n', expected: '42' },
      { input: '5\n9 9 -10 4 0\n', expected: '-10' },
    ],
    wrap: (source, input) => ({ source: `${cPrelude}${source}\nint main(void){int n;scanf("%d",&n);int *a=calloc(n?n:1,sizeof(int));for(int i=0;i<n;i++)scanf("%d",&a[i]);printf("%d",min_value(a,n));free(a);}`, stdin: input }),
  },
  {
    languageId: 103,
    cases: [
      { input: '4 6\n1 3 6 9\n', expected: '2' },
      { input: '5 8\n-4 0 2 7 11\n', expected: '-1' },
      { input: '3 -5\n-5 1 9\n', expected: '0' },
    ],
    wrap: (source, input) => ({ source: `${cPrelude}${source}\nint main(void){int n,target;scanf("%d%d",&n,&target);int *a=calloc(n?n:1,sizeof(int));for(int i=0;i<n;i++)scanf("%d",&a[i]);printf("%d",binary_search_index(a,n,target));free(a);}`, stdin: input }),
  },
  {
    languageId: 103,
    cases: [
      { input: '4 1 3\n2 4 1 3\n', expected: '8' },
      { input: '5 0 4\n-2 5 -1 7 3\n', expected: '12' },
      { input: '1 0 0\n99\n', expected: '99' },
    ],
    wrap: (source, input) => ({ source: `${cPrelude}${source}\nint main(void){int n,l,r;scanf("%d%d%d",&n,&l,&r);int *a=calloc(n?n:1,sizeof(int));long long *p=calloc(n+1,sizeof(long long));for(int i=0;i<n;i++)scanf("%d",&a[i]);build_prefix(a,p,n);printf("%lld",p[r+1]-p[l]);free(a);free(p);}`, stdin: input }),
  },
  {
    languageId: 103,
    cases: [
      { input: '2\n1 2 3 4\n', expected: '5' },
      { input: '3\n2 0 1 4 -5 6 7 8 9\n', expected: '6' },
      { input: '1\n-7\n', expected: '-7' },
    ],
    wrap: (source, input) => ({ source: `${cPrelude}${source}\nint main(void){int n;scanf("%d",&n);int *a=calloc(n*n,sizeof(int));for(int i=0;i<n*n;i++)scanf("%d",&a[i]);printf("%d",diagonal_sum(a,n));free(a);}`, stdin: input }),
  },
  {
    languageId: 103,
    cases: [
      { input: '3\n1 7 9\n', expected: '3' },
      { input: '0\n', expected: '0' },
      { input: '5\n4 4 4 4 4\n', expected: '5' },
    ],
    wrap: (source, input) => ({ source: `${cPrelude}typedef struct Node { int value; struct Node *next; } Node;\n${source}\nint main(void){int n;scanf("%d",&n);Node *nodes=calloc(n?n:1,sizeof(Node));for(int i=0;i<n;i++){scanf("%d",&nodes[i].value);nodes[i].next=i+1<n?&nodes[i+1]:NULL;}printf("%d",list_length(n?nodes:NULL));free(nodes);}`, stdin: input }),
  },
  {
    languageId: 103,
    cases: [
      { input: '13\n', expected: '3' },
      { input: '0\n', expected: '0' },
      { input: '4294967295\n', expected: '32' },
    ],
    wrap: (source, input) => ({ source: `${cPrelude}${source}\nint main(void){unsigned int n;scanf("%u",&n);printf("%d",popcount(n));}`, stdin: input }),
  },
  {
    languageId: 105,
    cases: [
      { input: '4\n3 1 3 2\n', expected: '1 2 3' },
      { input: '5\n-1 -1 2 0 2\n', expected: '-1 0 2' },
      { input: '1\n7\n', expected: '7' },
    ],
    wrap: (source, input) => ({ source: `${cppPrelude}${source}\nint main(){int n;cin>>n;vector<int>a(n);for(int&x:a)cin>>x;auto r=sorted_unique(a);for(int i=0;i<(int)r.size();i++){if(i)cout<<' ';cout<<r[i];}}`, stdin: input }),
  },
  {
    languageId: 105,
    cases: [
      { input: '6 2\n3 2 1 5 6 4\n', expected: '5' },
      { input: '5 4\n7 -1 9 3 2\n', expected: '2' },
      { input: '3 1\n-2 -8 -4\n', expected: '-2' },
    ],
    wrap: (source, input) => ({ source: `${cppPrelude}${source}\nint main(){int n,k;cin>>n>>k;vector<int>a(n);for(int&x:a)cin>>x;cout<<kth_largest(a,k);}`, stdin: input }),
  },
  {
    languageId: 105,
    cases: [
      { input: '7\n3 9 20 null null 15 7\n', expected: '3' },
      { input: '0\n', expected: '0' },
      { input: '7\n1 null 2 null null null 3\n', expected: '3' },
    ],
    wrap: (source, input) => ({ source: `${cppPrelude}struct TreeNode{int val;TreeNode*left;TreeNode*right;TreeNode(int v):val(v),left(nullptr),right(nullptr){}};\n${source}\nint main(){int n;cin>>n;if(!n){cout<<maxDepth(nullptr);return 0;}vector<string>v(n);for(auto&s:v)cin>>s;vector<TreeNode*>nodes(n,nullptr);for(int i=0;i<n;i++)if(v[i]!="null")nodes[i]=new TreeNode(stoi(v[i]));for(int i=0;i<n;i++)if(nodes[i]){if(2*i+1<n)nodes[i]->left=nodes[2*i+1];if(2*i+2<n)nodes[i]->right=nodes[2*i+2];}cout<<maxDepth(nodes[0]);for(auto*p:nodes)delete p;}`, stdin: input }),
  },
  {
    languageId: 105,
    cases: [
      { input: '4 2\n0 1\n2 3\n', expected: '2' },
      { input: '5 4\n0 1\n1 2\n2 0\n3 4\n', expected: '2' },
      { input: '3 0\n', expected: '3' },
    ],
    wrap: (source, input) => ({ source: `${cppPrelude}${source}\nint main(){int n,m;cin>>n>>m;vector<vector<int>>g(n);while(m--){int u,v;cin>>u>>v;g[u].push_back(v);g[v].push_back(u);}cout<<components(g);}`, stdin: input }),
  },
  {
    languageId: 105,
    cases: [
      { input: '3 11\n1 2 5\n', expected: '3' },
      { input: '1 3\n2\n', expected: '-1' },
      { input: '2 0\n2 3\n', expected: '0' },
    ],
    wrap: (source, input) => ({ source: `${cppPrelude}${source}\nint main(){int n,amount;cin>>n>>amount;vector<int>coins(n);for(int&x:coins)cin>>x;cout<<coinChange(coins,amount);}`, stdin: input }),
  },
  {
    languageId: 105,
    cases: [
      { input: '6 3\n2 1 5 1 3 2\n', expected: '9' },
      { input: '4 2\n-5 -2 -3 -4\n', expected: '-5' },
      { input: '3 3\n8 1 6\n', expected: '15' },
    ],
    wrap: (source, input) => ({ source: `${cppPrelude}${source}\nint main(){int n,k;cin>>n>>k;vector<int>a(n);for(int&x:a)cin>>x;cout<<max_window_sum(a,k);}`, stdin: input }),
  },
  {
    languageId: 109,
    cases: [
      { input: '[4,2,4,2,3]\n', expected: '2' },
      { input: '[-1,-1,3,3]\n', expected: '-1' },
      { input: '[9]\n', expected: '9' },
    ],
    wrap: (source, input) => ({ source: `import json\n${source}\nprint(most_common_smallest(json.loads(input())))`, stdin: input }),
  },
  {
    languageId: 109,
    cases: [
      { input: 'abcabcbb\n', expected: '3' },
      { input: 'bbbbb\n', expected: '1' },
      { input: '\n', expected: '0' },
    ],
    wrap: (source, input) => ({ source: `${source}\nprint(longest_unique(input()))`, stdin: input }),
  },
  {
    languageId: 109,
    cases: [
      { input: '[[7,2,9,1],2]\n', expected: '2' },
      { input: '[[-5,-2,-9],1]\n', expected: '-9' },
      { input: '[[3,3,4],3]\n', expected: '4' },
    ],
    wrap: (source, input) => ({ source: `import json\n${source}\nnums,k=json.loads(input())\nprint(kth_smallest(nums,k))`, stdin: input }),
  },
  {
    languageId: 109,
    cases: [
      { input: '[[0,0],[1,0]]\n', expected: '2' },
      { input: '[[0,1],[1,0]]\n', expected: '-1' },
      { input: '[[0]]\n', expected: '0' },
    ],
    wrap: (source, input) => ({ source: `import json\n${source}\nprint(shortest_path(json.loads(input())))`, stdin: input }),
  },
  {
    languageId: 109,
    cases: [
      { input: '5\n', expected: '8' },
      { input: '0\n', expected: '1' },
      { input: '10\n', expected: '89' },
    ],
    wrap: (source, input) => ({ source: `${source}\nprint(climb_stairs(int(input())))`, stdin: input }),
  },
  {
    languageId: 109,
    cases: [
      { input: '[[1,2],[2,4],[7,8]]\n', expected: '[[1,4],[7,8]]' },
      { input: '[[5,7],[1,3],[2,6]]\n', expected: '[[1,7]]' },
      { input: '[]\n', expected: '[]' },
    ],
    wrap: (source, input) => ({ source: `import json\n${source}\nprint(json.dumps(merge_touching(json.loads(input())),separators=(',',':')))`, stdin: input }),
  },
  {
    languageId: 82,
    cases: [{ input: '', expected: '3|Roadmap|9999-09-08\n1|Compiler|9999-09-01' }],
    wrap: (source) => ({ source: `CREATE TABLE records(id INTEGER,title TEXT,updated_at TEXT,active INTEGER);\nINSERT INTO records VALUES(1,'Compiler','9999-09-01',1),(2,'Archived','9999-09-07',0),(3,'Roadmap','9999-09-08',1),(4,'Legacy','2000-01-01',1);\n${source}`, stdin: '' }),
  },
  {
    languageId: 82,
    cases: [{ input: '', expected: '10|Ada|120\n11||75\n12|Linus|240' }],
    wrap: (source) => ({ source: `CREATE TABLE customers(id INTEGER,name TEXT);\nCREATE TABLE orders(id INTEGER,customer_id INTEGER,amount INTEGER);\nINSERT INTO customers VALUES(1,'Ada'),(2,'Linus');\nINSERT INTO orders VALUES(10,1,120),(11,99,75),(12,2,240);\n${source}`, stdin: '' }),
  },
  {
    languageId: 82,
    cases: [{ input: '', expected: 'A|3|20.0\nC|4|3.0' }],
    wrap: (source) => ({ source: `CREATE TABLE products(category TEXT,price REAL);\nINSERT INTO products VALUES('A',10),('A',20),('A',30),('B',5),('B',15),('C',1),('C',2),('C',4),('C',5);\n${source}`, stdin: '' }),
  },
  {
    languageId: 82,
    cases: [{ input: '', expected: '1|10|90000|1\n2|10|90000|1\n3|10|70000|2\n4|20|80000|1' }],
    wrap: (source) => ({ source: `CREATE TABLE employees(employee_id INTEGER,department_id INTEGER,salary INTEGER);\nINSERT INTO employees VALUES(1,10,90000),(2,10,90000),(3,10,70000),(4,20,80000);\n${source}`, stdin: '' }),
  },
  {
    languageId: 82,
    cases: [{ input: '', expected: '1||0\n2|1|1\n3|1|1\n4|2|2\n5|4|3' }],
    wrap: (source) => ({ source: `CREATE TABLE employees(id INTEGER,manager_id INTEGER);\nINSERT INTO employees VALUES(1,NULL),(2,1),(3,1),(4,2),(5,4),(9,NULL);\n${source}`, stdin: '' }),
  },
  {
    languageId: 82,
    cases: [{ input: '', expected: '2|Grace\n4|Barbara' }],
    wrap: (source) => ({ source: `CREATE TABLE customers(id INTEGER,name TEXT);\nCREATE TABLE orders(id INTEGER,customer_id INTEGER);\nINSERT INTO customers VALUES(1,'Ada'),(2,'Grace'),(3,'Linus'),(4,'Barbara');\nINSERT INTO orders VALUES(10,1),(11,3),(12,NULL);\n${source}`, stdin: '' }),
  },
];

export const generatedJudgeDefinitions: Record<number, JudgeDefinition> = Object.fromEntries(
  blueprintDefinitions.flatMap((definition, blueprintIndex) =>
    Array.from({ length: 6 }, (_, variantIndex) => [21 + blueprintIndex * 6 + variantIndex, definition]),
  ),
);

export const generatedJudgeProblemIds = Object.keys(generatedJudgeDefinitions).map(Number);
