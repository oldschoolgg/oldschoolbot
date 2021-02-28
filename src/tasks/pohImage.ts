import { Canvas, CanvasRenderingContext2D, createCanvas, Image } from 'canvas';
import { MessageAttachment } from 'discord.js';
import { objectEntries, randInt } from 'e';
import * as fs from 'fs';
import { Task } from 'klasa';
import path from 'path';

import {
	DUNGEON_FLOOR_Y,
	GROUND_FLOOR_Y,
	HOUSE_WIDTH,
	Placeholders,
	TOP_FLOOR_Y
} from '../lib/poh';
import { PoHTable } from '../lib/typeorm/PoHTable.entity';
import { canvasImageFromBuffer } from '../lib/util/canvasImageFromBuffer';

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
	'minion'
];

const bg = fs.readFileSync('./src/lib/poh/images/bg_1.jpg');
const bg2 = fs.readFileSync('./src/lib/poh/images/bg_2.jpg');

export default class PoHImage extends Task {
	public imageCache: Map<number, Image> = new Map();
	public bgImages: Image[] = [];
	async init() {
		this.bgImages.push(await canvasImageFromBuffer(bg));
		this.bgImages.push(await canvasImageFromBuffer(bg2));
		for (const folder of FOLDERS) {
			const currentPath = path.join(CONSTRUCTION_IMG_DIR, folder);
			const filesInDir = await fs.promises.readdir(currentPath);
			for (const fileName of filesInDir) {
				const id = parseInt(path.parse(fileName).name);
				const imageBuffer = await fs.promises.readFile(path.join(currentPath, `${id}.png`));
				const image = await canvasImageFromBuffer(imageBuffer);

				this.imageCache.set(id, image);
			}
		}
	}

	generateCanvas(bgId: number): [Canvas, CanvasRenderingContext2D] {
		const bgImage = this.bgImages[bgId - 1]!;
		const canvas = createCanvas(bgImage.width, bgImage.height);

		const ctx = canvas.getContext('2d');
		ctx.imageSmoothingEnabled = false;

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(bgImage, 0, 0, bgImage.width, bgImage.height);

		return [canvas, ctx];
	}

	randMinionCoords(): [number, number] {
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

	async run(poh: PoHTable, showSpaces = true) {
		const [canvas, ctx] = this.generateCanvas(poh.backgroundID);
		for (const [key, objects] of objectEntries(Placeholders)) {
			const [placeholder, coordArr] = objects;
			for (const obj of coordArr) {
				const [x, y] = obj;
				let id = poh[key] ?? placeholder;
				const isMountedItem = key === 'mountedItem' && id !== 1111;
				if (isMountedItem) {
					const hasCustomItem = id !== 1112;
					const mount = this.imageCache.get(1112)!;
					const { width, height } = mount;
					const mX = x - width / 2;
					const mY = y - height / 2;
					ctx.drawImage(mount, mX, mY, width, height);
					if (hasCustomItem) {
						const image = await this.client.tasks.get('bankImage')!.getItemImage(id, 1);
						const h = image.height * 0.8;
						const w = image.width * 0.8;
						ctx.drawImage(
							image,
							mX + (mount.width - w) / 2,
							mY + (mount.height - h) / 2,
							w,
							h
						);
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
		const activity = this.client.getActivityOfUser(poh.userID);
		if (!activity) {
			const image = this.imageCache.get(11)!;
			const [x, y] = this.randMinionCoords();
			ctx.drawImage(image, x - image.width, y - image.height, image.width, image.height);
		}
		return new MessageAttachment(canvas.toBuffer('image/png'));
	}
}
