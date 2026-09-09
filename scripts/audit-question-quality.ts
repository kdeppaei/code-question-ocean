import { problems } from '../app/content';

const normalize = (value: string) => value.toLowerCase().replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').replace(/\s+/g, ' ').trim();

function duplicates(label: string, select: (problem: (typeof problems)[number]) => string) {
  const groups = new Map<string, number[]>();
  for (const problem of problems) {
    const fingerprint = normalize(select(problem));
    groups.set(fingerprint, [...(groups.get(fingerprint) || []), problem.id]);
  }
  const repeated = [...groups.values()].filter((ids) => ids.length > 1);
  if (repeated.length) throw new Error(`${label} duplicates: ${repeated.map((ids) => ids.join('/')).join(', ')}`);
}

duplicates('solution', (problem) => problem.solution);
duplicates('prompt', (problem) => `${problem.description}|${problem.task}|${problem.examples.map((example) => `${example.input}>${example.output}`).join('|')}`);

const paired = problems.filter((problem) => problem.pairedProblemId);
for (const problem of paired) {
  const counterpart = problems.find((candidate) => candidate.id === problem.pairedProblemId);
  if (!counterpart || counterpart.pairedProblemId !== problem.id) throw new Error(`Broken C/C++ pair at problem ${problem.id}`);
  if (counterpart.language === problem.language) throw new Error(`Pair ${problem.id}/${counterpart.id} uses the same language`);
}

console.log(`Question quality audited: ${problems.length} unique prompts, ${problems.length} unique solutions, ${paired.length / 2} verified C/C++ pairs.`);
