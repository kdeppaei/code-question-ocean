import { uniqueDrillProblems } from '../app/unique-drills';
import { uniqueJudgeDefinitions } from '../lib/unique-judge-definitions';

const endpoint = (process.env.JUDGE0_API_URL || 'https://ce.judge0.com').replace(/\/$/, '');
const executable = uniqueDrillProblems.filter((problem) => problem.language !== 'GDB');
const failures: string[] = [];
let cursor = 0;

const normalize = (value: string | null | undefined) => (value || '').replace(/\r/g, '').trim().replace(/[ \t]+$/gm, '');

async function worker() {
  while (cursor < executable.length) {
    const problem = executable[cursor++];
    const definition = uniqueJudgeDefinitions[problem.id];
    const test = definition.cases[0];
    const wrapped = definition.wrap(problem.solution, test.input);
    try {
      const response = await fetch(`${endpoint}/submissions?base64_encoded=false&wait=true`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({
          language_id: definition.languageId,
          source_code: wrapped.source,
          stdin: wrapped.stdin,
          expected_output: test.expected,
          cpu_time_limit: 4,
          wall_time_limit: 8,
          memory_limit: 256000,
          enable_network: false,
        }),
      });
      const result = await response.json() as {
        stdout?: string | null;
        stderr?: string | null;
        compile_output?: string | null;
        message?: string | null;
        status?: { description?: string };
      };
      if (!response.ok || normalize(result.stdout) !== normalize(test.expected)) {
        failures.push(`${problem.id} ${problem.title}: ${result.status?.description || response.status}; expected=${JSON.stringify(test.expected)} actual=${JSON.stringify(result.stdout)} error=${JSON.stringify(result.compile_output || result.stderr || result.message)}`);
      }
    } catch (error) {
      failures.push(`${problem.id} ${problem.title}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

await Promise.all(Array.from({ length: 4 }, () => worker()));
if (failures.length) throw new Error(`Reference solution failures (${failures.length}):\n${failures.join('\n')}`);
console.log(`Reference solutions verified in Judge0: ${executable.length} newly added executable problems.`);
