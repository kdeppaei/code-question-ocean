import { playgroundExamples, type PlaygroundLanguage } from '../lib/playground-library';

const endpoint = (process.env.JUDGE0_API_URL || 'https://ce.judge0.com').replace(/\/$/, '');
const languageIds: Record<PlaygroundLanguage, number> = {
  C: 103,
  'C++': 105,
  Python: 109,
  SQL: 82,
};
const examples = Object.entries(playgroundExamples).flatMap(([language, items]) =>
  items.map((example) => ({ ...example, language: language as PlaygroundLanguage })),
);
const failures: string[] = [];
let cursor = 0;

async function worker() {
  while (cursor < examples.length) {
    const example = examples[cursor++];
    try {
      const response = await fetch(`${endpoint}/submissions?base64_encoded=false&wait=true`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({
          language_id: languageIds[example.language],
          source_code: example.source,
          stdin: example.stdin,
          cpu_time_limit: 4,
          wall_time_limit: 8,
          memory_limit: 256000,
          enable_network: false,
        }),
      });
      const result = (await response.json()) as {
        stdout?: string | null;
        stderr?: string | null;
        compile_output?: string | null;
        message?: string | null;
        status?: { description?: string };
      };
      if (!response.ok || result.status?.description !== 'Accepted') {
        failures.push(
          `${example.language} ${example.title}: ${result.status?.description || response.status}; ${result.compile_output || result.stderr || result.message || 'unknown error'}`,
        );
      }
    } catch (error) {
      failures.push(`${example.language} ${example.title}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

await Promise.all(Array.from({ length: 4 }, () => worker()));
if (failures.length) throw new Error(`Playground example failures (${failures.length}):\n${failures.join('\n')}`);
console.log(`Playground examples verified in Judge0: ${examples.length} runnable examples.`);
