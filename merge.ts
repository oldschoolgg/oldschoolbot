import { execSync, spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';

const ls = spawn('git', ['--no-pager', 'diff', '--name-only', '--diff-filter=U', '*.ts']);

let res = '';
ls.stdout.on('data', data => {
	res += data;
});

ls.stderr.on('data', data => {
	console.error(`stderr: ${data}`);
});

ls.on('close', _code => {
	const conflicted = res.trim().split('\n').filter(Boolean);

	console.log(conflicted);

	for (const file of conflicted) {
		const content = readFileSync(file, 'utf8');
		const conflicts = content.split(/(?=^<<<<<<<)/m);

		let onlyImports = true;
		for (const block of conflicts) {
			if (!block.includes('<<<<<<<')) continue;

			const ours = block.split('=======')[0]!.replace(/^<<<<<<<.*\n/, '');
			const theirs = block.split('=======')[1]!.replace(/>>>>>>>.*\n/s, '');

			const both = [ours, theirs].join('\n');
			if (!/^(?:\s*import[\s\S]*?;\s*)+$/m.test(both.trim())) {
				onlyImports = false;
				break;
			}
		}

		if (onlyImports) {
			try {
				execSync(`git checkout --theirs -- "${file}"`);
			} catch (_err) {}
			console.log(`Accepted theirs for imports-only conflict: ${file}`);
		} else {
			console.log(`Left unresolved: ${file}`);
		}
	}
});

ls.on('error', code => {
	console.log(`child error exited with code ${code}`);
});
