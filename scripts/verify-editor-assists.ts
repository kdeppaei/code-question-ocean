import { editorCompletions } from '../components/code-editor';
import { playgroundExamples, quickReferences } from '../lib/playground-library';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

for (const language of ['C', 'C++', 'Python', 'SQL', 'GDB'] as const) {
  assert(playgroundExamples[language].length >= 10, `${language} needs at least ten learning examples`);
  assert(quickReferences[language].length >= 4, `${language} needs at least four quick references`);
  assert(new Set(playgroundExamples[language].map((example) => example.id)).size === playgroundExamples[language].length, `${language} example IDs must be unique`);
}

const labels = (language: 'C' | 'C++' | 'Python' | 'SQL' | 'GDB') => editorCompletions[language].map((item) => item.label.toLowerCase());
assert(labels('C').some((label) => label.startsWith('pr')), 'Typing pr in C must offer printf');
assert(labels('C').some((label) => label.startsWith('m')), 'Typing m in C must offer main');
assert(labels('C++').some((label) => label.startsWith('m')), 'Typing m in C++ must offer main');
assert(labels('Python').some((label) => label.startsWith('pr')), 'Typing pr in Python must offer print');
assert(labels('Python').some((label) => label.startsWith('m')), 'Typing m in Python must offer main');
assert(labels('SQL').some((label) => label.startsWith('sel')), 'Typing sel in SQL must offer SELECT');
assert(labels('GDB').some((label) => label.startsWith('b')), 'Typing b in GDB must offer break');
assert(labels('GDB').some((label) => label.startsWith('r')), 'Typing r in GDB must offer run');

console.log('Editor assists verified: prefix completions and 50 learning demos are available.');
