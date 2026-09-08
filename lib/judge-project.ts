import JSZip from 'jszip';
import type { Language } from '@/app/content';

export type SourceFile = { id: string; name: string; content: string };

const allowedExtensions: Partial<Record<Language, Set<string>>> = {
  C: new Set(['c', 'h']),
  'C++': new Set(['cpp', 'cc', 'cxx', 'h', 'hpp']),
  Python: new Set(['py']),
  SQL: new Set(['sql']),
};

export function validateSourceFiles(value: unknown): { files?: SourceFile[]; error?: string } {
  if (value === undefined) return {};
  if (!Array.isArray(value) || value.length < 1 || value.length > 10) return { error: '檔案數量必須介於 1–10 個。' };
  const files: SourceFile[] = [];
  const names = new Set<string>();
  let total = 0;
  for (const candidate of value) {
    if (!candidate || typeof candidate !== 'object') return { error: '檔案資料格式錯誤。' };
    const file = candidate as Record<string, unknown>;
    if (typeof file.id !== 'string' || typeof file.name !== 'string' || typeof file.content !== 'string') return { error: '檔案資料格式錯誤。' };
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(file.name) || ['compile', 'run'].includes(file.name.toLowerCase()) || file.name.startsWith('__codedive_')) {
      return { error: `檔名「${file.name}」無效或為保留名稱。` };
    }
    const normalizedName = file.name.toLowerCase();
    if (names.has(normalizedName)) return { error: `檔名「${file.name}」重複。` };
    names.add(normalizedName);
    total += file.content.length;
    files.push({ id: file.id.slice(0, 80), name: file.name, content: file.content });
  }
  if (total > 60_000) return { error: '全部檔案合計不可超過 60,000 字元。' };
  return { files };
}

export async function createMultiFileArchive(language: Language, wrappedMain: string, files: SourceFile[]) {
  const allowed = allowedExtensions[language];
  if (!allowed) throw new Error('這個專項不支援多檔沙箱執行。');
  const main = files.find((file) => file.id === 'main') || files[0];
  const helpers = files.filter((file) => file !== main);
  for (const file of helpers) {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    if (!allowed.has(extension)) throw new Error(`「${file.name}」不是 ${language} 支援的檔案類型。`);
  }

  const zip = new JSZip();
  const addText = (name: string, content: string, executable = false) => zip.file(name, content, {
    unixPermissions: executable ? 0o755 : 0o644,
  });

  let mainName = '__codedive_main.txt';
  let compile = '';
  let run = '';
  if (language === 'C') {
    mainName = '__codedive_main.c';
    const sources = [mainName, ...helpers.filter((file) => file.name.toLowerCase().endsWith('.c')).map((file) => file.name)];
    compile = `#!/bin/bash\nset -eu\ngcc -std=c17 -O2 -pipe ${sources.join(' ')} -lm -o program\n`;
    run = '#!/bin/bash\nset -eu\n./program\n';
  } else if (language === 'C++') {
    mainName = '__codedive_main.cpp';
    const sources = [mainName, ...helpers.filter((file) => /\.(?:cpp|cc|cxx)$/i.test(file.name)).map((file) => file.name)];
    compile = `#!/bin/bash\nset -eu\ng++ -std=c++17 -O2 -pipe ${sources.join(' ')} -o program\n`;
    run = '#!/bin/bash\nset -eu\n./program\n';
  } else if (language === 'Python') {
    mainName = '__codedive_main.py';
    compile = `#!/bin/bash\nset -eu\npython3 -m py_compile ${[mainName, ...helpers.map((file) => file.name)].join(' ')}\n`;
    run = `#!/bin/bash\nset -eu\npython3 ${mainName}\n`;
  } else if (language === 'SQL') {
    mainName = '__codedive_main.sql';
    const sqlFiles = [mainName, ...helpers.map((file) => file.name)];
    run = `#!/bin/bash\nset -eu\ncat ${sqlFiles.join(' ')} | sqlite3\n`;
  }

  addText(mainName, wrappedMain);
  for (const file of helpers) addText(file.name, file.content);
  if (compile) addText('compile', compile, true);
  addText('run', run, true);
  return zip.generateAsync({ type: 'base64', compression: 'DEFLATE', platform: 'UNIX' });
}
