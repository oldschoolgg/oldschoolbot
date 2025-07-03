import { exec as execNonPromise } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { promisify } from 'node:util';
import { uniqueArr } from 'e';

import { authorsMap } from './authors.js';

const rawExecAsync = promisify(execNonPromise);

export async function updateAuthors(folderPath = 'docs/src/content') {
	const { stdout: filesStdout } = await rawExecAsync(`git ls-files "${folderPath}"`);
	const files = filesStdout.split('\n').filter(Boolean);

	const finalMap: Record<string, string[]> = {};

	for (const file of files) {
		const { stdout: logStdout } = await rawExecAsync(`git log --follow --pretty=format:"%an" -- "${file}"`);
		const authors = logStdout
			.split('\n')
			.map(a => a.trim().toLowerCase())
			.filter(Boolean)
			.map(a => authorsMap.get(a)?.displayName ?? a);

		const uniqueAuthors = uniqueArr(authors);
		if (uniqueAuthors.length === 1 && uniqueAuthors[0].toLowerCase() === 'magnaboy') continue;
		const relPath = file.replace('docs/src/content/docs/', '');
		finalMap[relPath] = uniqueAuthors;
	}

	writeFileSync('data/authors.json', JSON.stringify(finalMap, null, 4));
}
