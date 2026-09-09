import { uniqueDrillProblemsV2 } from '@/app/unique-drills-v2';
import type { JudgeDefinition } from './generated-judge-definitions';

const languageIds = { C: 103, 'C++': 105, Python: 109 } as const;

const programDefinitions: Record<number, JudgeDefinition> = Object.fromEntries(
  uniqueDrillProblemsV2
    .filter((item) => item.language === 'C' || item.language === 'C++' || item.language === 'Python')
    .map((item) => [item.id, {
      languageId: languageIds[item.language as keyof typeof languageIds],
      cases: item.examples.map((example) => ({ input: `${example.input}\n`, expected: example.output })),
      wrap: (source: string, input: string) => ({ source, stdin: input }),
    }]),
);

const sqlCases: Record<number, { setup: string; expected: string }> = {
  661: { setup: "CREATE TABLE projects(id INTEGER,name TEXT); CREATE TABLE tasks(id INTEGER,project_id INTEGER,done INTEGER); INSERT INTO projects VALUES(1,'Compiler'),(2,'Docs'); INSERT INTO tasks VALUES(1,1,0),(2,1,0),(3,1,1);", expected: '1|Compiler|2\n2|Docs|0' },
  662: { setup: "CREATE TABLE metrics(day TEXT,value REAL); INSERT INTO metrics VALUES('2026-01-01',10),('2026-01-02',20),('2026-01-03',30),('2026-01-04',40);", expected: '2026-01-01|10.0\n2026-01-02|15.0\n2026-01-03|20.0\n2026-01-04|30.0' },
  663: { setup: "CREATE TABLE prices(id INTEGER,product_id INTEGER,price REAL,effective_at TEXT); INSERT INTO prices VALUES(1,1,10,'2026-01-01'),(2,1,12,'2026-02-01'),(3,2,8,'2026-01-15');", expected: '1|12.0|2026-02-01\n2|8.0|2026-01-15' },
  664: { setup: "CREATE TABLE accounts(id INTEGER,username TEXT); INSERT INTO accounts VALUES(1,'Ada'),(2,'Linus'),(3,'ADA');", expected: '1|3' },
  665: { setup: 'CREATE TABLE orders(order_no INTEGER); INSERT INTO orders VALUES(100),(101),(102),(104),(105),(106),(108);', expected: '103\n107' },
  666: { setup: "CREATE TABLE products(id INTEGER,name TEXT); CREATE TABLE sales(id INTEGER,product_id INTEGER); INSERT INTO products VALUES(1,'Keyboard'),(2,'Mouse'); INSERT INTO sales VALUES(10,1);", expected: '2|Mouse' },
  667: { setup: "CREATE TABLE employees(id INTEGER,name TEXT,team TEXT,salary INTEGER); INSERT INTO employees VALUES(1,'Grace','A',10),(2,'Ada','A',30),(3,'Dennis','B',20),(4,'Linus','B',50);", expected: '2|Ada|A|30\n4|Linus|B|50' },
  668: { setup: 'CREATE TABLE movements(product_id INTEGER,seq INTEGER,quantity INTEGER); INSERT INTO movements VALUES(1,1,10),(1,2,-3),(2,1,5);', expected: '1|1|10|10\n1|2|-3|7\n2|1|5|5' },
  669: { setup: "CREATE TABLE sales(category TEXT,amount INTEGER); INSERT INTO sales VALUES('A',30),('A',70),('B',50);", expected: 'A|30|30.0\nA|70|70.0\nB|50|100.0' },
  670: { setup: "CREATE TABLE events(user_id INTEGER,occurred_at TEXT); INSERT INTO events VALUES(1,'09:00'),(1,'11:00'),(1,'10:00'),(2,'08:30');", expected: '1|09:00|11:00\n2|08:30|08:30' },
  671: { setup: "CREATE TABLE categories(id INTEGER,parent_id INTEGER,name TEXT); INSERT INTO categories VALUES(1,NULL,'Root'),(2,1,'Books'),(3,2,'C');", expected: '1|Root\n2|Root/Books\n3|Root/Books/C' },
  672: { setup: "CREATE TABLE attendance(user_id INTEGER,day TEXT); INSERT INTO attendance VALUES(1,'2026-01-01'),(1,'2026-01-02'),(1,'2026-01-03'),(2,'2026-02-01');", expected: '1|2026-01-01\n1|2026-01-02' },
  673: { setup: 'CREATE TABLE orders(amount INTEGER); INSERT INTO orders VALUES(10),(60),(90),(120);', expected: 'large|1\nmedium|2\nsmall|1' },
  674: { setup: "CREATE TABLE revenue(team TEXT,quarter INTEGER,amount INTEGER); INSERT INTO revenue VALUES('A',1,10),('A',2,20),('A',4,5),('B',1,7);", expected: 'A|10|20|0|5\nB|7|0|0|0' },
  675: { setup: "CREATE TABLE customers(id INTEGER,name TEXT); CREATE TABLE products(id INTEGER); CREATE TABLE purchases(customer_id INTEGER,product_id INTEGER); INSERT INTO customers VALUES(1,'Ada'),(2,'Linus'); INSERT INTO products VALUES(10),(20); INSERT INTO purchases VALUES(1,10),(1,20),(2,10);", expected: '1|Ada' },
  676: { setup: "CREATE TABLE employees(id INTEGER,department TEXT,salary INTEGER); INSERT INTO employees VALUES(1,'A',100),(2,'A',90),(3,'B',80),(5,'B',70);", expected: '2|A|90\n5|B|70' },
  677: { setup: "CREATE TABLE sessions(id INTEGER,started_at TEXT,ended_at TEXT); INSERT INTO sessions VALUES(1,'2026-01-01 09:00','2026-01-01 09:30'),(2,'2026-01-01 10:00','2026-01-01 11:30');", expected: '1|30\n2|90' },
  678: { setup: "CREATE TABLE events(day TEXT); INSERT INTO events VALUES('2026-01-01'),('2026-01-03'),('2026-01-05');", expected: '2026-01-02\n2026-01-04' },
  679: { setup: "CREATE TABLE users(id INTEGER,email TEXT); INSERT INTO users VALUES(1,'A@Test.com'),(2,'a@test.com'),(3,'b@test.com'),(4,NULL);", expected: '1|A@Test.com\n3|b@test.com' },
  680: { setup: "CREATE TABLE orders(month TEXT,amount INTEGER); INSERT INTO orders VALUES('2026-01',60),('2026-01',40),('2026-02',140),('2026-03',90);", expected: '2026-01|100|\n2026-02|140|40\n2026-03|90|-50' },
};

const sqlDefinitions: Record<number, JudgeDefinition> = Object.fromEntries(
  Object.entries(sqlCases).map(([id, value]) => [Number(id), {
    languageId: 82,
    cases: [{ input: '', expected: value.expected }],
    wrap: (source: string) => ({ source: `${value.setup}\n${source}`, stdin: '' }),
  }]),
);

export const uniqueJudgeDefinitionsV2: Record<number, JudgeDefinition> = { ...programDefinitions, ...sqlDefinitions };
export const uniqueJudgeProblemIdsV2 = Object.keys(uniqueJudgeDefinitionsV2).map(Number);
