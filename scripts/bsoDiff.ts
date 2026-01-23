import { execSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const OUT = 'diffs';
const BASE = 'master';
const HEAD = 'bso';
const EXCLUDE = ':(exclude)src/lib/bso/**';

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const cmdList = ['git', 'diff', '--name-only', `${BASE}..${HEAD}`, '--', '.', EXCLUDE].join(' ');

const files = execSync(cmdList, { encoding: 'utf8' })
	.split('\n')
	.map(s => s.trim())
	.filter(Boolean);

for (const file of files) {
	if (file.includes('scripts')) continue;
	if (file.includes('.env')) continue;
	if (file.includes('.bso.test.ts')) continue;
	if (file.includes('snapshots')) continue;
	if (file.includes('tests/integration/bso')) continue;
	if (file.includes('tests/unit/bso')) continue;

	const outPath = `${OUT}/${file}.diff`;
	mkdirSync(dirname(outPath), { recursive: true });

	const diff = execSync(`git diff ${BASE}..${HEAD} -- "${file}"`, { encoding: 'utf8' });

	writeFileSync(outPath, diff);
}
