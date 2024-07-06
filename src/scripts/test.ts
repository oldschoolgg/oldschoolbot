import fs from 'node:fs';
import path from 'node:path';
import fg from 'fast-glob';

function isGitConflictBlock(lines: string[], start: number, end: number): boolean {
	const conflictBlock = lines.slice(start, end + 1);
	return conflictBlock.every(
		line =>
			line.trim().length === 0 ||
			line.startsWith('import') ||
			line.startsWith('<<<<<<<') ||
			line.startsWith('=======') ||
			line.startsWith('>>>>>>>')
	);
}

function resolveGitConflict(content: string): string {
	const lines = content.split('\n');
	const resolvedLines: string[] = [];
	let i = 0;

	while (i < lines.length) {
		if (lines[i] === '<<<<<<< HEAD') {
			const conflictStart = i;
			const conflictEnd = lines.indexOf('>>>>>>> master', conflictStart);

			if (conflictEnd !== -1 && isGitConflictBlock(lines, conflictStart, conflictEnd)) {
				i = conflictEnd + 1; // Skip the conflict block
			} else {
				resolvedLines.push(lines[i]);
				i++;
			}
		} else {
			resolvedLines.push(lines[i]);
			i++;
		}
	}

	return resolvedLines.join('\n');
}

function processFile(filePath: string, dryRun: boolean): void {
	const content = fs.readFileSync(filePath, 'utf8');

	if (content.includes('<<<<<<< HEAD') && content.includes('>>>>>>> master')) {
		const resolvedContent = resolveGitConflict(content);
		if (content !== resolvedContent) {
			if (dryRun) {
				console.log(`Conflict detected in: ${filePath}`);
			} else {
				fs.writeFileSync(filePath, resolvedContent, 'utf8');
				console.log(`Resolved conflict in: ${filePath}`);
			}
		}
	}
}

async function processDirectory(directoryPath: string, dryRun: boolean): Promise<void> {
	const files = await fg(['**/*.ts'], { cwd: directoryPath, onlyFiles: true });

	for (const file of files) {
		const fullPath = path.join(directoryPath, file);
		processFile(fullPath, dryRun);
	}
}

const rootDir = process.argv[2] || '.';
const dryRun = process.argv.includes('--dry-run');
processDirectory(rootDir, dryRun);
