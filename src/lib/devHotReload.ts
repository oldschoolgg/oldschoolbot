import { watch } from 'chokidar';
import { debounce } from 'e';
import { extname, join, sep } from 'path';

import { production } from '../config';

if (!production && !process.env.TEST && 5 > 100) {
	const nodeModules = `${sep}node_modules${sep}`;
	globalClient._fileChangeWatcher = watch(join(process.cwd(), 'dist/**/*.js'), {
		persistent: true,
		ignoreInitial: true
	});

	const reloadStore = async () => {
		for (const module of Object.keys(require.cache)) {
			if (!module.includes(nodeModules) && extname(module) !== '.node') {
				if (module.includes('OldSchoolBotClient')) continue;
				if (module.includes(`dist${sep}index`)) continue;
				delete require.cache[module];
			}
		}
		await globalClient.mahojiClient.commands.load();
	};

	for (const event of ['add', 'change', 'unlink']) {
		if (globalClient._fileChangeWatcher) {
			globalClient._fileChangeWatcher.on(event, debounce(reloadStore, 1000));
		}
	}
}
