import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);
interface Author {
	gitIDs: string[];
	displayName: string;
}
const authors: Author[] = [{ gitIDs: ['GC'], displayName: 'Magnaboy' }];
const authorsMap = new Map<string, Author>();

for (const author of authors) {
	for (const gitID of author.gitIDs) {
		authorsMap.set(gitID, author);
	}
}

export async function getAuthors(filePath: string) {
	if (filePath.endsWith('404.md')) return [];
	const command = `git log --pretty=format:"%an" "${filePath}"`;
	const result = await execAsync(command, { encoding: 'utf-8' });
	const authors = result.stdout
		.split('\n')
		.filter((v, i, a) => a.indexOf(v) === i)
		.map(author => authorsMap.get(author)?.displayName ?? author);
	if (authors.length === 1 && authors[0] === 'Magnaboy') return [];
	return authors;
}
