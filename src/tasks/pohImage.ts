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
import getActivityOfUser from '../lib/util/getActivityOfUser';

const CONSTRUCTION_IMG_DIR = './src/lib/poh/images';
const FOLDERS = [
	'prayer_altar',
	'mounted_cape',
	'mounted_fish',
	'mounted_head',
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

export default class PoHImage extends Task {
	public imageCache: Map<number, Image> = new Map();
	public bgImage!: Image;
	async init() {
		this.bgImage = await canvasImageFromBuffer(bg);
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

	generateCanvas(): [Canvas, CanvasRenderingContext2D] {
		const canvas = createCanvas(this.bgImage.width, this.bgImage.height);

		const ctx = canvas.getContext('2d');
		ctx.imageSmoothingEnabled = false;

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(this.bgImage, 0, 0, this.bgImage.width, this.bgImage.height);

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
		const [canvas, ctx] = this.generateCanvas();
		for (const [key, objects] of objectEntries(Placeholders)) {
			const [placeholder, coordArr] = objects;
			for (const obj of coordArr) {
				const [x, y] = obj;
				const id = poh[key] ?? placeholder;
				const image = this.imageCache.get(id);
				if (!image) throw new Error(`Missing image: ${id}.`);
				const { width, height } = image;
				if (!showSpaces && id === placeholder) continue;
				ctx.drawImage(image, x - width / 2, y - height, width, height);
			}
		}
		const activity = getActivityOfUser(this.client, poh.userID);
		if (!activity) {
			const image = this.imageCache.get(11)!;
			const [x, y] = this.randMinionCoords();
			ctx.drawImage(image, x - image.width, y - image.height, image.width, image.height);
		}
		return new MessageAttachment(canvas.toBuffer('image/png'));
	}
}
