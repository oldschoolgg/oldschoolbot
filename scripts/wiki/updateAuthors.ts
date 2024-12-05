import { exec as execNonPromise } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { promisify } from 'node:util';
import { uniqueArr } from 'e';

import { authorsMap } from './authors.js';

const rawExecAsync = promisify(execNonPromise);

export async function updateAuthors(folderPath = 'docs/src/content') {
	const command = `git log --pretty=format:"%an" --name-only -- "${folderPath}"`;
	const result = await rawExecAsync(command);

	const fileAuthorMap = new Map<string, Set<string>>();

	const lines = result.stdout.split('\n');
	let currentAuthor = '';
	for (const line of lines) {
		if (line.trim() === '') continue;
		if (!line.includes('/')) {
			currentAuthor = line.toLowerCase();
		} else {
			const filePath = [folderPath, line.trim()].join('/').replace('docs/src/content/docs/src/content/docs/', '');
			const authors = fileAuthorMap.get(filePath) ?? new Set();
			authors.add(authorsMap.get(currentAuthor)?.displayName ?? currentAuthor);
			fileAuthorMap.set(filePath, authors);
		}
	}

	const finalMap: Record<string, string[]> = {};
	for (const [file, authors] of Array.from(fileAuthorMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))) {
		const uniqueAuthors = uniqueArr([...authors].filter(Boolean));
		if (uniqueAuthors.length === 1 && uniqueAuthors[0].toLowerCase() === 'magnaboy') continue;
		finalMap[file] = uniqueAuthors;
	}

	writeFileSync('data/authors.json', JSON.stringify(finalMap, null, 4));
}
