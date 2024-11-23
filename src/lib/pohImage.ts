import * as fs from 'node:fs';
import path from 'node:path';
import type { PlayerOwnedHouse } from '@prisma/client';
import { objectEntries, randInt } from 'e';

import { DUNGEON_FLOOR_Y, GROUND_FLOOR_Y, HOUSE_WIDTH, Placeholders, TOP_FLOOR_Y } from './poh';
import {
	type Canvas,
	type CanvasContext,
	type CanvasImage,
	canvasToBuffer,
	createCanvas,
	loadAndCacheLocalImage,
	loadImage
} from './util/canvasUtil';
import { getActivityOfUser } from './util/minionIsBusy';

const CONSTRUCTION_IMG_DIR = './src/lib/poh/images';
const FOLDERS = [
	'prayer_altar',
	'mounted_cape',
	'mounted_fish',
	'mounted_head',
	'mounted_item',
	'throne',
	'jewellery_box',
	'spellbook_altar',
	'guard',
	'pool',
	'teleport',
	'torch',
	'dungeon_decoration',
	'prison',
	'minion',
	'garden_decoration',
	'amulet'
];

class PoHImage {
	public imageCache: Map<number, CanvasImage> = new Map();
	public bgImages: CanvasImage[] = [];
	initPromise: Promise<void> | null = this.init();
	initFinished = false;

	async init() {
		this.bgImages.push(await loadAndCacheLocalImage('./src/lib/poh/images/bg_1.jpg'));
		this.bgImages.push(await loadAndCacheLocalImage('./src/lib/poh/images/bg_2.jpg'));
		for (const folder of FOLDERS) {
			const currentPath = path.join(CONSTRUCTION_IMG_DIR, folder);
			const filesInDir = await fs.promises.readdir(currentPath);
			for (const fileName of filesInDir) {
				const id = Number.parseInt(path.parse(fileName).name);
				const imageBuffer = await fs.promises.readFile(path.join(currentPath, `${id}.png`));
				const image = await loadImage(imageBuffer);

				this.imageCache.set(id, image);
			}
		}
		this.initFinished = true;
	}

	generateCanvas(bgId: number): [Canvas, CanvasContext] {
		const bgImage = this.bgImages[bgId - 1]!;
		const canvas = createCanvas(bgImage.width, bgImage.height);

		const ctx = canvas.getContext('2d');
		ctx.imageSmoothingEnabled = false;

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(bgImage, 0, 0, bgImage.width, bgImage.height);
		return [canvas, ctx];
	}

	randMinionCoords(): [number, number] {
		if (process.env.TEST) {
			return [100, TOP_FLOOR_Y];
		}
		const roll = randInt(1, 4);
		const x = randInt(1, HOUSE_WIDTH);
		switch (roll) {
			case 1:
				return [x, TOP_FLOOR_Y];
			case 2:
				return [x, GROUND_FLOOR_Y];
			case 3:
				return [x, DUNGEON_FLOOR_Y];
			case 4:
				return [x + randInt(1, HOUSE_WIDTH), GROUND_FLOOR_Y];
			default:
				throw new Error('Unmatched case');
		}
	}

	async run(poh: PlayerOwnedHouse, showSpaces = true) {
		if (!this.initFinished) await this.initPromise;
		const [canvas, ctx] = this.generateCanvas(poh.background_id);
		for (const [key, objects] of objectEntries(Placeholders)) {
			if (!key || !objects) continue;
			const [placeholder, coordArr] = objects;
			for (const obj of coordArr) {
				const [x, y] = obj;
				const id = poh[key] ?? placeholder;
				const isMountedItem = key === 'mounted_item' && id !== 1111;
				if (isMountedItem) {
					const hasCustomItem = id !== 1112;
					const mount = this.imageCache.get(1112)!;
					const { width, height } = mount;
					const mX = x - width / 2;
					const mY = y - height / 2;
					ctx.drawImage(mount, mX, mY, width, height);
					if (hasCustomItem) {
						const image = await bankImageGenerator.getItemImage(id);
						const h = image.height * 0.8;
						const w = image.width * 0.8;
						ctx.drawImage(image, mX + (mount.width - w) / 2, mY + (mount.height - h) / 2, w, h);
					}

					continue;
				}
				const image = this.imageCache.get(id);
				if (!image) throw new Error(`Missing image: ${id}.`);
				const { width, height } = image;
				if (!showSpaces && id === placeholder) continue;
				ctx.drawImage(image, x - width / 2, y - height, width, height);
			}
		}
		const activity = getActivityOfUser(poh.user_id);
		if (!activity) {
			const image = this.imageCache.get(11)!;
			const [x, y] = this.randMinionCoords();
			ctx.drawImage(image, x - image.width, y - image.height, image.width, image.height);
		}
		return canvasToBuffer(canvas);
	}
}

export const pohImageGenerator = new PoHImage();
