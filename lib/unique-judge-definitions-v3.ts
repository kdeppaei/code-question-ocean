import { uniqueDrillProblemsV3, uniqueProgramHiddenCasesV3 } from '@/app/unique-drills-v3';
import type { JudgeDefinition } from './generated-judge-definitions';

const languageIds = { C: 103, 'C++': 105, Python: 109 } as const;

const programDefinitions: Record<number, JudgeDefinition> = Object.fromEntries(
  uniqueDrillProblemsV3
    .filter((item) => item.language === 'C' || item.language === 'C++' || item.language === 'Python')
    .map((item) => {
      const hidden = uniqueProgramHiddenCasesV3[item.id];
      return [item.id, {
        languageId: languageIds[item.language as keyof typeof languageIds],
        cases: [
          ...item.examples.map((example) => ({ input: `${example.input}\n`, expected: example.output })),
          ...(hidden ? [{ input: `${hidden.input}\n`, expected: hidden.output }] : []),
        ],
        wrap: (source: string, input: string) => ({ source, stdin: input }),
      }];
    }),
);

const sqlSetups = {
  A: `
CREATE TABLE users(id INTEGER,name TEXT,region TEXT);
INSERT INTO users VALUES(1,'Ada','US'),(2,'Linus','EU'),(3,'Grace','EU'),(4,'Ken','APAC');
CREATE TABLE orders(id INTEGER,user_id INTEGER,amount INTEGER,status TEXT,ordered_at TEXT);
INSERT INTO orders VALUES(101,1,120,'paid','2026-01-02'),(102,1,80,'pending','2026-02-02'),(103,2,200,'paid','2026-01-10'),(104,3,50,'paid','2026-02-04');
CREATE TABLE employees(id INTEGER,name TEXT,department TEXT,manager_id INTEGER,salary INTEGER);
INSERT INTO employees VALUES(1,'Ada','R&D',NULL,120),(2,'Grace','R&D',1,100),(3,'Linus','OS',NULL,130),(4,'Ken','OS',3,90);
CREATE TABLE events(user_id INTEGER,day TEXT,value INTEGER);
INSERT INTO events VALUES(1,'2026-01-01',5),(1,'2026-01-03',7),(2,'2026-01-02',4),(2,'2026-01-05',9);
CREATE TABLE products(id INTEGER,name TEXT,category TEXT,price REAL);
INSERT INTO products VALUES(10,'IDE','software',30),(11,'Book','media',20),(12,'Debugger','software',50),(13,'Terminal','tool',40);
CREATE TABLE order_items(order_id INTEGER,product_id INTEGER,qty INTEGER);
INSERT INTO order_items VALUES(101,10,2),(101,11,1),(103,12,1),(104,11,3);
`,
  B: `
CREATE TABLE users(id INTEGER,name TEXT,region TEXT);
INSERT INTO users VALUES(1,'Amy','A'),(2,'Bob','B');
CREATE TABLE orders(id INTEGER,user_id INTEGER,amount INTEGER,status TEXT,ordered_at TEXT);
INSERT INTO orders VALUES(201,2,40,'pending','2026-03-01');
CREATE TABLE employees(id INTEGER,name TEXT,department TEXT,manager_id INTEGER,salary INTEGER);
INSERT INTO employees VALUES(1,'Amy','X',NULL,80),(2,'Bob','X',1,90);
CREATE TABLE events(user_id INTEGER,day TEXT,value INTEGER);
INSERT INTO events VALUES(1,'2026-03-01',1),(1,'2026-03-02',1);
CREATE TABLE products(id INTEGER,name TEXT,category TEXT,price REAL);
INSERT INTO products VALUES(20,'Tool','A',10),(21,'Spare','B',30);
CREATE TABLE order_items(order_id INTEGER,product_id INTEGER,qty INTEGER);
INSERT INTO order_items VALUES(201,20,4);
`,
};

const sqlExpected: Array<[string, string]> = [
  ['Ada|-\nGrace|Ada\nLinus|-\nKen|Linus', 'Amy|-\nBob|Amy'],
  ['1|Ada\n2|Linus\n3|Grace', ''],
  ['4|Ken', '1|Amy'],
  ['1|120|80\n2|200|0\n3|50|0\n4|0|0', '1|0|0\n2|0|40'],
  ['101|1|120|\n102|1|80|120\n103|2|200|\n104|3|50|', '201|2|40|'],
  ['1|2026-01-01|2026-01-03\n1|2026-01-03|\n2|2026-01-02|2026-01-05\n2|2026-01-05|', '1|2026-03-01|2026-03-02\n1|2026-03-02|'],
  ['Linus|130|1\nAda|120|2\nGrace|100|3\nKen|90|4', 'Bob|90|1\nAmy|80|2'],
  ['OS|Linus|130|Linus\nOS|Ken|90|Linus\nR&D|Ada|120|Ada\nR&D|Grace|100|Ada', 'X|Bob|90|Bob\nX|Amy|80|Bob'],
  ['1|Ada|120\n3|Linus|130', '2|Bob|90'],
  ['product|10|IDE\nproduct|11|Book\nproduct|12|Debugger\nproduct|13|Terminal\nuser|1|Ada\nuser|2|Linus\nuser|3|Grace\nuser|4|Ken', 'product|20|Tool\nproduct|21|Spare\nuser|1|Amy\nuser|2|Bob'],
  ['101|1|120\n103|2|200\n104|3|50', '201|2|40'],
  ['2026-01|2\n2026-02|2', '2026-03|1'],
  ['3|Grace\n2|Linus', ''],
  ['1|200\n2|200\n3|50\n4|0', '1|0\n2|40'],
  ['1\n2\n3\n4\n5', '1\n2\n3\n4\n5'],
  ['101|120\n102|200\n103|200\n104|50', '201|40'],
  ['35.0', '20.0'],
  ['1|2026-01-01|2026-01-03|2\n2|2026-01-02|2026-01-05|3', ''],
  ['1|2\n2|1\n3|1\n4|0', '1|0\n2|1'],
  ['13|Terminal', '21|Spare'],
];

const sqlDefinitions: Record<number, JudgeDefinition> = Object.fromEntries(
  sqlExpected.map((expected, index) => [761 + index, {
    languageId: 82,
    cases: [{ input: 'A', expected: expected[0] }, { input: 'B', expected: expected[1] }],
    wrap: (source: string, input: string) => ({ source: `${sqlSetups[input as keyof typeof sqlSetups]}\n${source}`, stdin: '' }),
  }]),
);

export const uniqueJudgeDefinitionsV3: Record<number, JudgeDefinition> = { ...programDefinitions, ...sqlDefinitions };
export const uniqueJudgeProblemIdsV3 = Object.keys(uniqueJudgeDefinitionsV3).map(Number);
