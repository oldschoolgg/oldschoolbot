import { KlasaUser, Task, TaskStore, util } from 'klasa';
import * as fs from 'fs';
import * as path from 'path';
import { createCanvas, Image, registerFont } from 'canvas';
import fetch from 'node-fetch';
import { toKMB } from 'oldschooljs/dist/util/util';
import { Util } from 'oldschooljs';

import {
	addArrayOfNumbers,
	canvasImageFromBuffer,
	formatItemStackQuantity,
	generateHexColorForCashStack,
	itemNameFromID,
	restoreCtx,
	saveCtx,
	stringMatches
} from '../lib/util';
import { Bank } from '../lib/types';
import createTupleOfItemsFromBank from '../lib/util/createTupleOfItemsFromBank';
import filterItemTupleByQuery from '../lib/util/filterItemTupleByQuery';
import filterByCategory from '../lib/util/filterByCategory';
import { fillTextXTimesInCtx } from '../lib/util/fillTextXTimesInCtx';
import { Events } from '../lib/constants';
import backgroundImages from '../lib/minions/data/bankBackgrounds';
import { BankBackground } from '../lib/minions/types';
import { filterableTypes } from '../lib/filterables';
import { UserSettings } from '../lib/settings/types/UserSettings';
import { allCollectionLogItems } from '../lib/collectionLog';

registerFont('./resources/osrs-font.ttf', { family: 'Regular' });
registerFont('./resources/osrs-font-compact.otf', { family: 'Regular' });
registerFont('./resources/osrs-font-bold.ttf', { family: 'Regular' });

const bankImageFile = fs.readFileSync('./resources/images/bank.png');
const bankRepeaterFile = fs.readFileSync('./resources/images/repeating.png');

const CACHE_DIR = './icon_cache';
const spacer = 12;
const itemSize = 32;
const distanceFromTop = 32;
const distanceFromSide = 16;

export default class BankImageTask extends Task {
	public itemIconsList: Set<number>;
	public itemIconImagesCache: Map<number, Image>;
	public backgroundImages: BankBackground[] = [];

	public repeatingImage: Image | null = null;

	public constructor(store: TaskStore, file: string[], directory: string) {
		super(store, file, directory, {});

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
		this.backgroundImages = await Promise.all(
			backgroundImages.map(async img => ({
				...img,
				image: await canvasImageFromBuffer(
					fs.readFileSync(`./resources/images/bank_backgrounds/${img.id}.jpg`)
				)
			}))
		);
		this.repeatingImage = await canvasImageFromBuffer(
			fs.readFileSync('./resources/images/repeating.png')
		);
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

	async generateBankImage(
		itemLoot: Bank,
		title = '',
		showValue = true,
		flags: { [key: string]: string | number } = {},
		user?: KlasaUser
	): Promise<Buffer> {
		const bankBackgroundID =
			user?.settings.get(UserSettings.BankBackground) ?? flags.background ?? 1;
		const currentCL = user?.settings.get(UserSettings.CollectionLogBank);

		const canvas = createCanvas(488, 331);
		const ctx = canvas.getContext('2d');
		ctx.font = '16px OSRSFontCompact';
		ctx.imageSmoothingEnabled = false;

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		const bgImage = this.backgroundImages.find(bg => bg.id === bankBackgroundID)!;
		ctx.drawImage(bgImage!.image, 0, 0, bgImage.image!.width, bgImage.image!.height);

		let items = await createTupleOfItemsFromBank(this.client, itemLoot);

		const totalValue = addArrayOfNumbers(items.map(i => i[2]));

		// Filtering
		const searchQuery = flags.search || flags.s;
		if (searchQuery && typeof searchQuery === 'string') {
			items = filterItemTupleByQuery(searchQuery, items);
		}

		// Filter by preset
		for (const flag of Object.keys(flags)) {
			if (
				filterableTypes.some(type => type.aliases.some(alias => stringMatches(alias, flag)))
			) {
				items = filterByCategory(flag, items);
			}
		}

		// Sorting
		items = items.sort((a, b) => b[2] - a[2]);

		// Paging
		const { page } = flags;
		if (typeof page === 'number') {
			const chunked = util.chunk(items, 56);
			const pageLoot = chunked[page];
			if (!pageLoot) throw 'You have no items on this page.';
			items = pageLoot;
		}

		// Draw Bank Title

		ctx.textAlign = 'center';
		ctx.font = '16px RuneScape Bold 12';

		if (showValue) {
			title += ` (Value: ${toKMB(totalValue)})`;
		}

		ctx.fillStyle = '#000000';
		fillTextXTimesInCtx(ctx, title, canvas.width / 2 + 1, 21 + 1);

		ctx.fillStyle = '#ff981f';
		fillTextXTimesInCtx(ctx, title, canvas.width / 2, 21);

		// Draw Items
		ctx.textAlign = 'start';
		ctx.fillStyle = '#494034';
		ctx.font = '16px OSRSFontCompact';

		const chunkedLoot = util.chunk(items, 8);

		for (let i = 0; i < chunkedLoot.length; i++) {
			if (i > 6) {
				const state = saveCtx(ctx);
				const temp = ctx.getImageData(0, 0, canvas.width, canvas.height - 10);
				canvas.height += itemSize + (i === chunkedLoot.length ? 0 : spacer);

				const ptrn = ctx.createPattern(this.repeatingImage, 'repeat');
				ctx.fillStyle = ptrn;
				ctx.fillRect(0, 0, canvas.width, canvas.height);

				ctx.putImageData(temp, 0, 0);
				restoreCtx(ctx, state);
			}

			for (let x = 0; x < chunkedLoot[i].length; x++) {
				const [id, quantity, value] = chunkedLoot[i][x];
				if (quantity < 1) continue;

				const item = await this.getItemImage(id);

				if (!item) {
					this.client.emit(Events.Warn, `Item with ID[${id}] has no item image.`);
					continue;
				}

				const xLoc = Math.floor(spacer + x * ((canvas.width - 40) / 8) + distanceFromSide);
				const yLoc = Math.floor(itemSize * (i * 1.22) + spacer + distanceFromTop);

				ctx.drawImage(
					item,
					xLoc + (32 - item.width) / 2,
					yLoc + (32 - item.height) / 2,
					item.width,
					item.height
				);

				const isNewCLItem =
					flags.showNewCL &&
					currentCL &&
					!currentCL[id] &&
					allCollectionLogItems.includes(id);

				const quantityColor = isNewCLItem
					? '#ac7fff'
					: generateHexColorForCashStack(quantity);
				const formattedQuantity = formatItemStackQuantity(quantity);

				ctx.fillStyle = '#000000';
				fillTextXTimesInCtx(
					ctx,
					formattedQuantity,
					xLoc + distanceFromSide - 18 + 1,
					yLoc + distanceFromTop - 24 + 1
				);

				ctx.fillStyle = quantityColor;
				fillTextXTimesInCtx(
					ctx,
					formattedQuantity,
					xLoc + distanceFromSide - 18,
					yLoc + distanceFromTop - 24
				);

				if (flags.names) {
					ctx.fillStyle = 'white';
					fillTextXTimesInCtx(
						ctx,
						`${itemNameFromID(id)!
							.replace('Grimy', 'Grmy')
							.slice(0, 7)}..`,
						xLoc + distanceFromSide - 18,
						yLoc + distanceFromTop
					);
				}

				if (flags.showvalue || flags.sv) {
					const formattedValue = Util.toKMB(value);

					ctx.fillStyle = 'black';
					fillTextXTimesInCtx(
						ctx,
						formattedValue,
						xLoc + distanceFromSide - 31 * 0.5,
						yLoc + distanceFromTop - 1
					);

					ctx.fillStyle = generateHexColorForCashStack(value);
					fillTextXTimesInCtx(
						ctx,
						formattedValue,
						xLoc + distanceFromSide - 15,
						yLoc + distanceFromTop
					);
				}
			}
		}

		return canvas.toBuffer();
	}

	async generateCollectionLogImage(collectionLog: Bank, title = '', type: any): Promise<Buffer> {
		const canvas = createCanvas(488, 331);
		const ctx = canvas.getContext('2d');
		ctx.font = '16px OSRSFontCompact';
		ctx.imageSmoothingEnabled = false;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const backgroundImage = await canvasImageFromBuffer(bankImageFile);

		ctx.drawImage(backgroundImage, 0, 0, backgroundImage.width, backgroundImage.height);

		ctx.textAlign = 'center';
		ctx.font = '16px RuneScape Bold 12';

		for (let i = 0; i < 3; i++) {
			ctx.fillStyle = '#000000';
			ctx.fillText(title, canvas.width / 2 + 1, 21 + 1);
		}
		for (let i = 0; i < 3; i++) {
			ctx.fillStyle = '#ff981f';
			ctx.fillText(title, canvas.width / 2, 21);
		}

		// Draw Items

		ctx.textAlign = 'start';
		ctx.fillStyle = '#494034';

		ctx.font = '16px OSRSFontCompact';

		const drawItem = async (
			itemID: number,
			x: number,
			y: number,
			hasItem: boolean,
			quantity: number,
			completed: boolean
		) => {
			const item = await this.getItemImage(itemID);
			if (!item) return;

			x += (32 - item.width) / 2;
			y += (32 - item.height) / 2;

			if (!hasItem) {
				ctx.save();
				ctx.globalAlpha = 0.25;
			}

			/* Draw Quantity */
			const quantityColor = generateHexColorForCashStack(quantity);
			const formattedQuantity = formatItemStackQuantity(quantity);

			ctx.drawImage(item, x, y, item.width, item.height);

			if (hasItem) {
				ctx.fillStyle = '#000000';
				for (let t = 0; t < 5; t++) {
					ctx.fillText(
						formattedQuantity,
						x + distanceFromSide - 18 + 1,
						y + distanceFromTop - 24 + 1
					);
				}

				ctx.fillStyle = completed ? '#55fa6c' : quantityColor;
				for (let t = 0; t < 5; t++) {
					ctx.fillText(
						formattedQuantity,
						x + distanceFromSide - 18,
						y + distanceFromTop - 24
					);
				}
			}

			/* End Draw Quantity */
			if (!hasItem) ctx.restore();
		};
		const repeaterImage = await canvasImageFromBuffer(bankRepeaterFile);
		let row = 0;

		for (const items of Object.values(type.items) as number[][]) {
			let column = 0;

			if (row > 6) {
				const state = saveCtx(ctx);
				const temp = ctx.getImageData(0, 0, canvas.width, canvas.height - 10);
				canvas.height += itemSize + spacer;

				const ptrn = ctx.createPattern(repeaterImage, 'repeat');
				ctx.fillStyle = ptrn;
				ctx.fillRect(0, 0, canvas.width, canvas.height);

				ctx.putImageData(temp, 0, 0);
				restoreCtx(ctx, state);
			}

			const flatItems = items.flat(Infinity);
			const completedThisSection = items.every(itemID => Boolean(collectionLog[itemID]));

			for (const itemID of flatItems) {
				const xLoc = Math.floor(
					column * 0.7 * ((canvas.width - 40) / 8) + distanceFromSide
				);
				const yLoc = Math.floor(itemSize * (row * 1.22) + spacer + distanceFromTop);

				await drawItem(
					itemID,
					xLoc,
					yLoc,
					Boolean(collectionLog[itemID]),
					collectionLog[itemID] || 0,
					completedThisSection
				);

				column++;
			}
			row++;
		}

		return canvas.toBuffer();
	}
}
