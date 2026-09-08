import { problems, type Language } from '../app/content';
import { generatedJudgeDefinitions, generatedJudgeProblemIds } from '../lib/generated-judge-definitions';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

assert(problems.length === 200, `Expected 200 problems, received ${problems.length}`);
assert(new Set(problems.map((problem) => problem.id)).size === problems.length, 'Problem IDs must be unique');

const languages: Language[] = ['C', 'C++', 'Python', 'SQL', 'GDB'];
for (const language of languages) {
  const count = problems.filter((problem) => problem.language === language).length;
  assert(count === 40, `${language} must have 40 problems, received ${count}`);
}

for (const problem of problems) {
  assert(problem.solution.trim().length > 0, `Problem ${problem.id} is missing a reference solution`);
  assert(problem.explanation.trim().length > 0, `Problem ${problem.id} is missing an explanation`);
}

const executableProblems = problems.filter((problem) => problem.language !== 'GDB');
const judgedIds = new Set([...Array.from({ length: 16 }, (_, index) => index + 1), ...generatedJudgeProblemIds]);
const missingJudge = executableProblems.filter((problem) => !judgedIds.has(problem.id));
assert(missingJudge.length === 0, `Executable problems without a sandbox judge: ${missingJudge.map((problem) => problem.id).join(', ')}`);
assert(generatedJudgeProblemIds.length === 144, `Expected 144 generated judge definitions, received ${generatedJudgeProblemIds.length}`);

for (const [id, definition] of Object.entries(generatedJudgeDefinitions)) {
  assert(definition.cases.length > 0, `Judge definition ${id} has no hidden cases`);
  assert(definition.cases.every((test) => test.expected.length > 0), `Judge definition ${id} has an empty expectation`);
  const wrapped = definition.wrap('/* candidate solution */', definition.cases[0].input);
  assert(wrapped.source.includes('candidate solution'), `Judge definition ${id} did not include the candidate source`);
}

console.log(`Coverage verified: ${problems.length} problems, ${executableProblems.length} sandboxed, ${problems.length - executableProblems.length} guided GDB drills.`);
