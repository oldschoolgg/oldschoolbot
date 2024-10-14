import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { uniqueArr } from 'e';

const execAsync = promisify(exec);
interface Author {
	gitIDs: string[];
	displayName: string;
	avatar?: string;
}
const authors: Author[] = [
	{ gitIDs: ['gc'], displayName: 'Magnaboy', avatar: 'gc.gif' },
	{ gitIDs: ['nwjgit'], displayName: 'Jonesey', avatar: 'nwjgit.jpg' },
	{ gitIDs: ['Arodab'], displayName: 'Arodab' },
	{ gitIDs: ['DaughtersOfNyx'], displayName: 'Keres', avatar: 'DaughtersOfNyx.webp' },
	{ gitIDs: ['TastyPumPum'], displayName: 'TastyPumPum', avatar: 'tasty.webp' },
	{ gitIDs: ['00justas'], displayName: '00justas' }
];
export const authorsMap = new Map<string, Author>();

for (const author of authors) {
	authorsMap.set(author.displayName.toLowerCase(), author);
	for (const gitID of author.gitIDs) {
		authorsMap.set(gitID, author);
	}
}

export async function getAuthors(filePath: string) {
	if (filePath.endsWith('404.md')) return [];
	const command = `git log --pretty=format:"%an" "${filePath}"`;
	const result = await execAsync(command, { encoding: 'utf-8' });
	const authors = uniqueArr(
		result.stdout
			.split('\n')
			.filter((v, i, a) => a.indexOf(v) === i)
			.map(name => name.toLowerCase())
			.map(author => authorsMap.get(author)?.displayName ?? author)
			.filter(Boolean)
	);
	if (authors.length === 1 && authors[0] === 'Magnaboy') return [];
	return authors;
}
