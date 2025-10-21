import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { loadImage } from 'skia-canvas';

import { CanvasSpritesheet } from '@/lib/canvas/CanvasSpritesheet.js';
import { ItemIconPacks } from '@/lib/canvas/iconPacks.js';
import { BOT_TYPE } from '@/lib/constants.js';

class CanvasModuleSingleton {
	private didInit = false;

	public Spritesheet!: {
		OSRSItems: CanvasSpritesheet;
		BSOItems: CanvasSpritesheet;
	};

	constructor() {
		this.init();
	}

	async init() {
		if (this.didInit) return;

		this.Spritesheet = {
			OSRSItems: await CanvasSpritesheet.create(
				'./src/lib/resources/spritesheets/items-spritesheet.json',
				'./src/lib/resources/spritesheets/items-spritesheet.png'
			),
			BSOItems: await CanvasSpritesheet.create(
				'./src/lib/resources/spritesheets/bso-items-spritesheet.json',
				'./src/lib/resources/spritesheets/bso-items-spritesheet.png'
			)
		};

		// Init/load icon pack icons
		for (const pack of Object.values(ItemIconPacks)) {
			const directories = BOT_TYPE === 'OSB' ? ['osb'] : ['osb', 'bso'];

			for (const dir of directories) {
				const filesInThisDir = await readdir(`./src/lib/resources/images/icon_packs/${pack.id}_${dir}`);
				for (const fileName of filesInThisDir) {
					const themedItemID = Number.parseInt(path.parse(fileName).name);
					const image = await loadImage(
						await readFile(`./src/lib/resources/images/icon_packs/${pack.id}_${dir}/${fileName}`)
					);
					pack.icons.set(themedItemID, image);
				}
			}
		}

		this.didInit = true;
	}
}

export const CanvasModule = new CanvasModuleSingleton();
