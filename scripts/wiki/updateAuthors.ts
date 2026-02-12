import '../base.js';

import { exec as execNonPromise } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { promisify } from 'node:util';
import { uniqueArr } from '@oldschoolgg/toolkit';

import { authorsMap } from './authors.js';

const rawExecAsync = promisify(execNonPromise);

export async function updateAuthors() {
	const { stdout } = await rawExecAsync(`git log --pretty=format:"%an%x09" --name-only -- docs/src/content`);

	const finalMap: Record<string, string[]> = {};
	const lines = stdout.split('\n');

	let currentAuthor = '';
	for (const line of lines.map(l => l.replace(/\s/g, ''))) {
		if (line.length === 0) continue;
		if (!line.startsWith('docs/src/content/')) {
			currentAuthor = line.trim().toLowerCase();
			if (currentAuthor === 'gc') currentAuthor = 'magnaboy';
		} else {
			const file = line.trim();
			if (!finalMap[file]) finalMap[file] = [];
			finalMap[file].push(currentAuthor);
		}
	}

	for (const file in finalMap) {
		const authors = finalMap[file].map(a => authorsMap.get(a)?.displayName ?? a).filter(Boolean);
		if (authors.length === 0) continue;
		const uniqueAuthors = uniqueArr(authors);
		if (uniqueAuthors.length === 1 && uniqueAuthors[0].toLowerCase() === 'magnaboy') {
			delete finalMap[file];
		} else {
			const relPath = file.replace('docs/src/content/docs/', '');
			finalMap[relPath] = uniqueAuthors;
			if (relPath !== file) delete finalMap[file];
		}
	}

	writeFileSync('data/authors.json', JSON.stringify(finalMap, null, 4));
}
