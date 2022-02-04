import { watch } from 'chokidar';
import { debounce } from 'e';
import { Piece, Stopwatch, Task, TaskStore } from 'klasa';
import { basename, extname, join, sep } from 'path';

import { mahojiClient } from '..';

const nodeModules = `${sep}node_modules${sep}`;

export default class extends Task {
	private _running = false;

	public constructor(store: TaskStore, file: string[], directory: string) {
		super(store, file, directory);
		this.enabled = !this.client.production;
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	async run() {}

	async reloadPiece(name: string, _path: string, piece?: Piece) {
		const timer = new Stopwatch();

		for (const module of Object.keys(require.cache)) {
			if (!module.includes(nodeModules) && extname(module) !== '.node') {
				if (module.includes('OldSchoolBotClient')) continue;
				if (module.includes(`dist${sep}index`)) continue;
				delete require.cache[module];
			}
		}

		let log = '';
		const reload = this.client.commands.get('reload');
		if (!reload) return;
		if (piece) {
			// @ts-expect-error Running command with fake message object
			await reload.run({ channel: { send: () => null } }, [piece]);
			log = `Reloaded it in ${timer}`;
		} else {
			// @ts-expect-error Running command with fake message object
			await reload.everything({ channel: { send: () => null } });
			log = `Reloaded everything in ${timer}.`;
		}

		timer.stop();
		this.client.emit('log', `${name} was updated. ${log}`);
		return null;
	}

	async init() {
		if (this.client._fileChangeWatcher) return;
		this.client._fileChangeWatcher = watch(join(process.cwd(), 'dist/**/*.js'), {
			persistent: true,
			ignoreInitial: true
		});

		const reloadStore = async (_path: string) => {
			await mahojiClient.commands.load();
			const store = _path.split(sep).find(dir => this.client.pieceStores.has(dir));

			const name = basename(_path);

			if (!store) {
				if (this._running) return;
				this._running = true;
				await this.reloadPiece(name, _path);
				this._running = false;
				return;
			}

			const piece = this.client.pieceStores.get(store).get(name.replace(extname(name), ''));

			await this.reloadPiece(name, _path, piece);
			await mahojiClient.loadStores();
		};

		for (const event of ['add', 'change', 'unlink']) {
			if (this.client._fileChangeWatcher) {
				this.client._fileChangeWatcher.on(event, debounce(reloadStore, 1000));
			}
		}
	}
}
