import { Task, util, KlasaClient, TaskStore } from 'klasa';
import * as fs from 'fs';
import * as path from 'path';
import { CanvasRenderingContext2D, createCanvas, Image, registerFont, Canvas } from 'canvas';
import fetch from 'node-fetch';

import {
	generateHexColorForCashStack,
	canvasImageFromBuffer,
	formatItemStackQuantity
} from '../lib/util';
import { Bank } from '../lib/types';

registerFont('./resources/osrs-font.ttf', { family: 'Regular' });
registerFont('./resources/osrs-font-compact.otf', { family: 'Regular' });

const bankImageFile = fs.readFileSync('./resources/images/bank.png');

const CACHE_DIR = './icon_cache';

export default class BankImageTask extends Task {
	private canvas: Canvas;
	private ctx: CanvasRenderingContext2D;
	public itemIconsList: Set<number>;
	public itemIconImagesCache: Map<number, Image>;

	public constructor(client: KlasaClient, store: TaskStore, file: string[], directory: string) {
		super(client, store, file, directory, {});
		this.canvas = createCanvas(488, 331);
		this.ctx = this.canvas.getContext('2d');
		this.ctx.font = '16px OSRSFontCompact';
		this.ctx.imageSmoothingEnabled = false;

		// This tells us simply whether the file exists or not on disk.
		this.itemIconsList = new Set();

		// If this file does exist, it might be cached in this, or need to be read from fs.
		this.itemIconImagesCache = new Map();
	}

	async init() {
		this.run();
	}

	async run() {
		this.cacheFiles();
	}

	async cacheFiles() {
		// Ensure that the icon_cache dir exists.
		fs.promises.mkdir(CACHE_DIR).catch(() => null);

		// Get a list of all files (images) in the dir.
		const filesInDir = await fs.promises.readdir(CACHE_DIR);

		// For each one, set a cache value that it exists.
		for (const fileName of filesInDir) {
			this.itemIconsList.add(parseInt(path.parse(fileName).name));
		}
	}

	async getItemImage(itemID: number): Promise<Image> {
		const isOnDisk = this.itemIconsList.has(itemID);
		const cachedImage = this.itemIconImagesCache.get(itemID);

		if (!isOnDisk) {
			await this.fetchAndCacheImage(itemID);
			return this.getItemImage(itemID);
		}

		if (!cachedImage) {
			const imageBuffer = await fs.promises.readFile(path.join(CACHE_DIR, `${itemID}.png`));
			const image = await canvasImageFromBuffer(imageBuffer);

			this.itemIconImagesCache.set(itemID, image);
			return this.getItemImage(itemID);
		}

		return cachedImage;
	}

	async fetchAndCacheImage(itemID: number) {
		const imageBuffer = await fetch(
			`https://static.runelite.net/cache/item/icon/${itemID}.png`
		).then(result => result.buffer());

		fs.promises.writeFile(path.join(CACHE_DIR, `${itemID}.png`), imageBuffer);

		const image = await canvasImageFromBuffer(imageBuffer);

		this.itemIconsList.add(itemID);
		this.itemIconImagesCache.set(itemID, image);
	}

	async generateBankImage(itemLoot: Bank): Promise<Buffer> {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.fillStyle = '#494034';

		const backgroundImage = await canvasImageFromBuffer(bankImageFile);

		this.ctx.drawImage(backgroundImage, 0, 0, backgroundImage.width, backgroundImage.height);

		let loot = [];

		for (const [id, lootQuantity] of Object.entries(itemLoot)) {
			loot.push({
				id: parseInt(id),
				quantity: lootQuantity
			});
		}

		loot = loot.filter(item => item.quantity > 0);
		if (loot.length === 0) throw 'No loot!';

		const chunkedLoot = util.chunk(loot, 8);
		const spacer = 12;
		const itemSize = 32;
		const distanceFromTop = 32;
		const distanceFromSide = 16;

		for (let i = 0; i < chunkedLoot.length; i++) {
			for (let x = 0; x < chunkedLoot[i].length; x++) {
				const { id, quantity } = chunkedLoot[i][x];
				const item = await this.getItemImage(id);
				if (!item) continue;

				const xLoc = Math.floor(
					spacer + x * ((this.canvas.width - 40) / 8) + distanceFromSide
				);
				const yLoc = Math.floor(itemSize * (i * 1.1) + spacer + distanceFromTop);

				this.ctx.drawImage(
					item,
					xLoc + (32 - item.width) / 2,
					yLoc + (32 - item.height) / 2,
					item.width,
					item.height
				);

				const quantityColor = generateHexColorForCashStack(quantity);
				const formattedQuantity = formatItemStackQuantity(quantity);

				this.ctx.fillStyle = '#000000';
				for (let t = 0; t < 5; t++) {
					this.ctx.fillText(
						formattedQuantity,
						xLoc + distanceFromSide - 18 + 1,
						yLoc + distanceFromTop - 24 + 1
					);
				}

				this.ctx.fillStyle = quantityColor;
				for (let t = 0; t < 5; t++) {
					this.ctx.fillText(
						formattedQuantity,
						xLoc + distanceFromSide - 18,
						yLoc + distanceFromTop - 24
					);
				}
			}
		}

		return this.canvas.toBuffer();
	}
}
