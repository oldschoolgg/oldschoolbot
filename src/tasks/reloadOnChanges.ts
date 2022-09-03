import { watch } from 'chokidar';
import { debounce } from 'e';
import { Task, TaskStore } from 'klasa';
import { extname, join, sep } from 'path';

import { mahojiClient } from '..';

const nodeModules = `${sep}node_modules${sep}`;

export default class extends Task {
	public constructor(store: TaskStore, file: string[], directory: string) {
		super(store, file, directory);
		this.enabled = !globalClient.production;
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	async run() {}

	async init() {
		if (globalClient._fileChangeWatcher) return;
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
			await mahojiClient.commands.load();
		};

		for (const event of ['add', 'change', 'unlink']) {
			if (globalClient._fileChangeWatcher) {
				globalClient._fileChangeWatcher.on(event, debounce(reloadStore, 1000));
			}
		}
	}
}
