import { existsSync, rmSync } from 'node:fs';

import { getSystemInfo } from '../lib/systemInfo';
import { execAsync, runTimedLoggedFn } from './scriptUtil';

async function yarnRefreshLockfile() {
	await execAsync('yarn --refresh-lockfile --check-cache');
}

async function deleteFoldersAndFiles() {
	const paths = ['dist', 'cache.json', 'logs', 'coverage'];
	for (const p of paths) {
		if (existsSync(p)) {
			console.log(`   Deleting ${p}`);
			rmSync(p, { recursive: true, force: true });
		}
	}
}

async function main() {
	const info = await getSystemInfo();
	console.log(info.singleStr);
	await runTimedLoggedFn('Delete Folders and Files', deleteFoldersAndFiles);
	await runTimedLoggedFn('Yarn Refresh Lockfile', yarnRefreshLockfile);
	console.log(`\n\nDone. Try to run "yarn build" now. If you are still having issues:
        
- Delete the node_modules folder
- Kill all node.js processes in task manager
- Reboot your computer
- Ask for help in discord, showing your error/issue.`);
}

main();
