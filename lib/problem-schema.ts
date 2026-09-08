import { z } from 'zod';

const shortText = (maximum: number) => z.string().trim().min(1).max(maximum);

export const problemSchema = z.object({
  id: z.number().int().min(1000).max(999999),
  slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: shortText(120),
  language: z.enum(['C', 'C++', 'Python', 'SQL', 'GDB']),
  difficulty: z.enum(['簡單', '中等', '困難']),
  topic: shortText(60),
  track: z.string().trim().max(60).optional(),
  acceptance: z.number().min(0).max(100),
  description: shortText(2000),
  task: shortText(1000),
  constraints: z.array(shortText(300)).min(1).max(12),
  examples: z.array(z.object({
    input: shortText(1000),
    output: shortText(1000),
    note: z.string().trim().max(1000).optional(),
  })).min(1).max(8),
  starter: z.string().max(20000),
  solution: shortText(20000),
  explanation: shortText(5000),
  hints: z.array(shortText(500)).min(1).max(10),
  checks: z.array(z.object({
    label: shortText(80),
    input: z.string().max(1000),
    output: z.string().max(1000),
    tokens: z.array(shortText(200)).min(1).max(12),
  })).min(1).max(8),
}).strict();

export const judgeCaseSchema = z.object({
  label: shortText(80),
  input: z.string().max(10000),
  expected: z.string().max(10000),
  hidden: z.boolean().default(false),
}).strict();

export const judgeConfigSchema = z.object({
  kind: z.literal('stdio'),
  cases: z.array(judgeCaseSchema).min(1).max(20),
}).strict();

export const adminProblemSchema = problemSchema.extend({
  judge: judgeConfigSchema.optional(),
}).superRefine((problem, context) => {
  if (problem.language === 'GDB' && problem.judge) {
    context.addIssue({ code: 'custom', path: ['judge'], message: 'GDB 題目只能使用結構判題。' });
  }
  if (problem.judge && !problem.judge.cases.some((test) => !test.hidden)) {
    context.addIssue({ code: 'custom', path: ['judge', 'cases'], message: '至少需要一個公開測試。' });
  }
});

export const problemImportSchema = z.object({
  problems: z.array(adminProblemSchema).min(1).max(100),
}).strict();

export type ImportedProblem = z.infer<typeof problemSchema>;
export type JudgeConfig = z.infer<typeof judgeConfigSchema>;
