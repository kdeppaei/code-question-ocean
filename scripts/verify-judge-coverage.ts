import { problems, type Language } from '../app/content';
import { generatedJudgeDefinitions, generatedJudgeProblemIds } from '../lib/generated-judge-definitions';
import { uniqueJudgeDefinitions, uniqueJudgeProblemIds } from '../lib/unique-judge-definitions';
import { uniqueJudgeDefinitionsV2, uniqueJudgeProblemIdsV2 } from '../lib/unique-judge-definitions-v2';
import { uniqueJudgeDefinitionsV3, uniqueJudgeProblemIdsV3 } from '../lib/unique-judge-definitions-v3';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const normalized = (value: string) => value.toLowerCase().replace(/\s+/g, '').trim();
const duplicateGroups = (values: Array<[number, string]>) => {
  const groups = new Map<string, number[]>();
  for (const [id, value] of values) groups.set(value, [...(groups.get(value) || []), id]);
  return [...groups.values()].filter((ids) => ids.length > 1);
};

assert(problems.length === 350, `Expected 350 reviewed problems, received ${problems.length}`);
assert(new Set(problems.map((problem) => problem.id)).size === problems.length, 'Problem IDs must be unique');
assert(new Set(problems.map((problem) => problem.slug)).size === problems.length, 'Problem slugs must be unique');
assert(new Set(problems.map((problem) => problem.title)).size === problems.length, 'Problem titles must be unique');

const duplicateSolutions = duplicateGroups(problems.map((problem) => [problem.id, normalized(problem.solution)]));
assert(duplicateSolutions.length === 0, `Reference solutions must be substantively unique: ${JSON.stringify(duplicateSolutions)}`);

const duplicatePrompts = duplicateGroups(problems.map((problem) => [
  problem.id,
  normalized(`${problem.description}|${problem.task}|${problem.examples.map((example) => `${example.input}>${example.output}`).join('|')}`),
]));
assert(duplicatePrompts.length === 0, `Problem prompts and examples must be unique: ${JSON.stringify(duplicatePrompts)}`);

const languages: Language[] = ['C', 'C++', 'Python', 'SQL', 'GDB'];
for (const language of languages) {
  const count = problems.filter((problem) => problem.language === language).length;
  assert(count === 70, `${language} must have 70 reviewed problems, received ${count}`);
}

for (const problem of problems) {
  assert(problem.solution.trim().length > 0, `Problem ${problem.id} is missing a reference solution`);
  assert(problem.explanation.trim().length > 0, `Problem ${problem.id} is missing an explanation`);
  assert(problem.hints.length > 0, `Problem ${problem.id} is missing hints`);
}

const executableProblems = problems.filter((problem) => problem.language !== 'GDB');
const judgedIds = new Set([
  ...Array.from({ length: 16 }, (_, index) => index + 1),
  ...generatedJudgeProblemIds,
  ...uniqueJudgeProblemIds,
  ...uniqueJudgeProblemIdsV2,
  ...uniqueJudgeProblemIdsV3,
]);
const missingJudge = executableProblems.filter((problem) => !judgedIds.has(problem.id));
assert(missingJudge.length === 0, `Executable problems without a sandbox judge: ${missingJudge.map((problem) => problem.id).join(', ')}`);
assert(generatedJudgeProblemIds.length === 24, `Expected 24 canonical generated judge definitions, received ${generatedJudgeProblemIds.length}`);
assert(uniqueJudgeProblemIds.length === 80, `Expected 80 new judge definitions, received ${uniqueJudgeProblemIds.length}`);
assert(uniqueJudgeProblemIdsV2.length === 80, `Expected 80 second-batch judge definitions, received ${uniqueJudgeProblemIdsV2.length}`);
assert(uniqueJudgeProblemIdsV3.length === 80, `Expected 80 third-batch judge definitions, received ${uniqueJudgeProblemIdsV3.length}`);

for (const [id, definition] of Object.entries({ ...generatedJudgeDefinitions, ...uniqueJudgeDefinitions, ...uniqueJudgeDefinitionsV2, ...uniqueJudgeDefinitionsV3 })) {
  assert(definition.cases.length > 0, `Judge definition ${id} has no test cases`);
  assert(definition.cases.every((test) => typeof test.expected === 'string'), `Judge definition ${id} has an invalid expectation`);
  const wrapped = definition.wrap('/* candidate solution */', definition.cases[0].input);
  assert(wrapped.source.includes('candidate solution'), `Judge definition ${id} did not include the candidate source`);
}

console.log(`Coverage verified: ${problems.length} distinct problems, ${executableProblems.length} sandboxed, ${problems.length - executableProblems.length} guided GDB drills.`);
