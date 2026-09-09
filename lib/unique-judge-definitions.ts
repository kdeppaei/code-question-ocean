import { uniqueDrillProblems } from '@/app/unique-drills';
import type { JudgeDefinition } from './generated-judge-definitions';

const languageIds = { C: 103, 'C++': 105, Python: 109 } as const;

const programDefinitions: Record<number, JudgeDefinition> = Object.fromEntries(
  uniqueDrillProblems
    .filter((problem) => problem.language === 'C' || problem.language === 'C++' || problem.language === 'Python')
    .map((problem) => [
      problem.id,
      {
        languageId: languageIds[problem.language as keyof typeof languageIds],
        cases: problem.examples.map((example) => ({ input: `${example.input}\n`, expected: example.output })),
        wrap: (source: string, input: string) => ({ source, stdin: input }),
      },
    ]),
);

type SqlSpec = { setup: string; expected: string };

const sqlSpecs: Record<number, SqlSpec> = {
  561: {
    setup: "CREATE TABLE users(id INTEGER,name TEXT,active INTEGER); INSERT INTO users VALUES(1,'Ada',1),(2,'Grace',0),(3,'Linus',1);",
    expected: '1|Ada\n3|Linus',
  },
  562: {
    setup: "CREATE TABLE orders(created_at TEXT,amount INTEGER); INSERT INTO orders VALUES('2026-01-02',100),('2026-01-20',250),('2026-02-01',80);",
    expected: '2026-01|350\n2026-02|80',
  },
  563: {
    setup: "CREATE TABLE customers(id INTEGER,name TEXT); CREATE TABLE orders(customer_id INTEGER,amount INTEGER); INSERT INTO customers VALUES(1,'Ada'),(2,'Linus'); INSERT INTO orders VALUES(1,100),(1,50);",
    expected: '1|Ada|150\n2|Linus|0',
  },
  564: {
    setup: "CREATE TABLE customers(id INTEGER,name TEXT); CREATE TABLE orders(customer_id INTEGER,status TEXT); INSERT INTO customers VALUES(1,'Ada'),(2,'Linus'),(3,'Grace'); INSERT INTO orders VALUES(1,'paid'),(1,'pending'),(2,'pending');",
    expected: '2|Linus',
  },
  565: {
    setup: 'CREATE TABLE employees(salary INTEGER); INSERT INTO employees VALUES(100),(200),(200),(300);',
    expected: '200',
  },
  566: {
    setup: 'CREATE TABLE employees(employee_id INTEGER,department_id INTEGER,salary INTEGER); INSERT INTO employees VALUES(1,10,100),(2,10,90),(3,10,90),(4,10,80),(5,10,70),(6,20,120),(7,20,110);',
    expected: '1|10|100\n2|10|90\n3|10|90\n4|10|80\n6|20|120\n7|20|110',
  },
  567: {
    setup: "CREATE TABLE transactions(account_id INTEGER,occurred_at TEXT,amount INTEGER); INSERT INTO transactions VALUES(1,'2026-01-01',100),(1,'2026-01-02',-30),(2,'2026-01-01',50);",
    expected: '1|2026-01-01|100|100\n1|2026-01-02|-30|70\n2|2026-01-01|50|50',
  },
  568: {
    setup: "CREATE TABLE logins(user_id INTEGER,login_date TEXT); INSERT INTO logins VALUES(1,'2026-01-01'),(1,'2026-01-02'),(2,'2026-01-01'),(3,'2026-02-10'),(3,'2026-02-11');",
    expected: '1\n3',
  },
  569: {
    setup: "CREATE TABLE users(email TEXT); INSERT INTO users VALUES('a@example.com'),('a@example.com'),('b@example.com'),(NULL),(NULL);",
    expected: 'a@example.com',
  },
  570: {
    setup: "CREATE TABLE status_history(user_id INTEGER,status TEXT,changed_at TEXT); INSERT INTO status_history VALUES(1,'new','2026-01-01'),(1,'active','2026-01-03'),(2,'paused','2026-01-02');",
    expected: '1|active|2026-01-03\n2|paused|2026-01-02',
  },
  571: {
    setup: 'CREATE TABLE sessions(purchased INTEGER); INSERT INTO sessions VALUES(1),(0),(1),(0);',
    expected: '4|50.0',
  },
  572: {
    setup: "CREATE TABLE activity(user_id INTEGER,active_month TEXT); INSERT INTO activity VALUES(1,'2026-01-01'),(1,'2026-02-01'),(2,'2026-01-01'),(3,'2026-02-01'),(3,'2026-03-01');",
    expected: '2',
  },
  573: {
    setup: 'CREATE TABLE employees(id INTEGER,manager_id INTEGER); INSERT INTO employees VALUES(1,NULL),(2,1),(3,1),(4,2),(9,NULL);',
    expected: '1|0\n2|1\n3|1\n4|2',
  },
  574: {
    setup: "CREATE TABLE products(category TEXT,name TEXT,price REAL); INSERT INTO products VALUES('A','Basic',10),('A','Pro',30),('B','Solo',5);",
    expected: 'Pro|30.0',
  },
  575: {
    setup: "CREATE TABLE events(user_id INTEGER,occurred_at TEXT); INSERT INTO events VALUES(1,'09:00'),(1,'10:00'),(2,'08:30');",
    expected: '1|09:00|\n1|10:00|09:00\n2|08:30|',
  },
  576: {
    setup: "CREATE TABLE tickets(team TEXT,status TEXT); INSERT INTO tickets VALUES('A','open'),('A','open'),('A','closed'),('B','closed'),('B','closed');",
    expected: 'A|2|1\nB|0|2',
  },
  577: {
    setup: "CREATE TABLE products(id INTEGER,name TEXT); CREATE TABLE movements(product_id INTEGER,quantity INTEGER); INSERT INTO products VALUES(1,'Keyboard'),(2,'Mouse'); INSERT INTO movements VALUES(1,10),(1,-3);",
    expected: '1|Keyboard|7\n2|Mouse|0',
  },
  578: {
    setup: "CREATE TABLE orders(customer_id INTEGER,created_at TEXT); INSERT INTO orders VALUES(1,'2026-01-05'),(1,'2026-01-02'),(2,'2026-02-01');",
    expected: '1|2026-01-02\n2|2026-02-01',
  },
  579: {
    setup: "CREATE TABLE users(id INTEGER,created_at TEXT); INSERT INTO users VALUES(1,'2026-01-01'),(2,'2026-01-20'),(3,'2026-02-02');",
    expected: '2026-01|2\n2026-02|1',
  },
  580: {
    setup: 'CREATE TABLE sequence_values(value INTEGER); INSERT INTO sequence_values VALUES(1),(2),(4),(5),(6),(8);',
    expected: '3\n7',
  },
};

const sqlDefinitions: Record<number, JudgeDefinition> = Object.fromEntries(
  Object.entries(sqlSpecs).map(([id, spec]) => [
    Number(id),
    {
      languageId: 82,
      cases: [{ input: '', expected: spec.expected }],
      wrap: (source: string) => ({ source: `${spec.setup}\n${source}`, stdin: '' }),
    },
  ]),
);

export const uniqueJudgeDefinitions: Record<number, JudgeDefinition> = {
  ...programDefinitions,
  ...sqlDefinitions,
};

export const uniqueJudgeProblemIds = Object.keys(uniqueJudgeDefinitions).map(Number);
