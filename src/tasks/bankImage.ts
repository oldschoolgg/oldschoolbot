/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { Canvas, createCanvas, Image, registerFont } from 'canvas';
import * as fs from 'fs';
import { KlasaUser, Task, TaskStore, util } from 'klasa';
import fetch from 'node-fetch';
import { Util } from 'oldschooljs';
import { toKMB } from 'oldschooljs/dist/util/util';
import * as path from 'path';

import { bankImageCache, Events } from '../lib/constants';
import { allCollectionLogItems } from '../lib/data/collectionLog';
import { filterableTypes } from '../lib/data/filterables';
import backgroundImages from '../lib/minions/data/bankBackgrounds';
import { BankBackground } from '../lib/minions/types';
import { getUserSettings } from '../lib/settings/settings';
import { UserSettings } from '../lib/settings/types/UserSettings';
import { ItemBank } from '../lib/types';
import {
	addArrayOfNumbers,
	formatItemStackQuantity,
	generateHexColorForCashStack,
	itemNameFromID,
	restoreCtx,
	roll,
	saveCtx,
	sha256Hash,
	stringMatches
} from '../lib/util';
import { canvasImageFromBuffer } from '../lib/util/canvasImageFromBuffer';
import createTupleOfItemsFromBank from '../lib/util/createTupleOfItemsFromBank';
import { fillTextXTimesInCtx } from '../lib/util/fillTextXTimesInCtx';
import filterByCategory from '../lib/util/filterByCategory';
import filterItemTupleByQuery from '../lib/util/filterItemTupleByQuery';

registerFont('./src/lib/resources/osrs-font.ttf', { family: 'Regular' });
registerFont('./src/lib/resources/osrs-font-compact.otf', { family: 'Regular' });
registerFont('./src/lib/resources/osrs-font-bold.ttf', { family: 'Regular' });

const bankImageFile = fs.readFileSync('./src/lib/resources/images/bank_backgrounds/1.jpg');
const bankRepeaterFile = fs.readFileSync('./src/lib/resources/images/bank_backgrounds/r1.jpg');

const coxPurpleBg = fs.readFileSync('./src/lib/resources/images/bank_backgrounds/14_purple.jpg');

export type BankImageResult =
	| {
			cachedURL: null;
			image: Buffer;
			cacheKey: string;
	  }
	| {
			cachedURL: string;
			image: null;
			cacheKey: string;
	  };

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

	public borderCorner: Image | null = null;
	public borderHorizontal: Image | null = null;
	public borderVertical: Image | null = null;

	public imageHamstare: Image | null = null;
	public imageHamstare2: Image | null = null;
	public constructor(store: TaskStore, file: string[], directory: string) {
		super(store, file, directory, {});

		// This tells us simply whether the file exists or not on disk.
		this.itemIconsList = new Set();

		// If this file does exist, it might be cached in this, or need to be read from fs.
		this.itemIconImagesCache = new Map();
	}

	async init() {
		await this.run();
	}

	async run() {
		await this.cacheFiles();

		this.repeatingImage = await canvasImageFromBuffer(bankRepeaterFile);

		this.backgroundImages = await Promise.all(
			backgroundImages.map(async img => ({
				...img,
				image: await canvasImageFromBuffer(
					fs.readFileSync(`./src/lib/resources/images/bank_backgrounds/${img.id}.jpg`)
				),
				repeatImage: fs.existsSync(
					`./src/lib/resources/images/bank_backgrounds/r${img.id}.jpg`
				)
					? await canvasImageFromBuffer(
							fs.readFileSync(
								`./src/lib/resources/images/bank_backgrounds/r${img.id}.jpg`
							)
					  )
					: null
			}))
		);

		this.borderCorner = await canvasImageFromBuffer(
			fs.readFileSync('./src/lib/resources/images/bank_border_c.png')
		);
		this.borderHorizontal = await canvasImageFromBuffer(
			fs.readFileSync('./src/lib/resources/images/bank_border_h.png')
		);
		this.borderVertical = await canvasImageFromBuffer(
			fs.readFileSync('./src/lib/resources/images/bank_border_v.png')
		);
		this.imageHamstare = await canvasImageFromBuffer(
			fs.readFileSync('./src/lib/resources/images/hamstare.png')
		);

		this.imageHamstare2 = await canvasImageFromBuffer(
			fs.readFileSync('./src/lib/resources/images/hamstare2.png')
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

	async getItemImage(itemID: number, quantity: number): Promise<Image> {
		const isOnDisk = this.itemIconsList.has(itemID);
		const cachedImage = this.itemIconImagesCache.get(itemID);

		if (!isOnDisk) {
			await this.fetchAndCacheImage(itemID);
			return this.getItemImage(itemID, quantity);
		}

		if (!cachedImage) {
			const imageBuffer = await fs.promises.readFile(path.join(CACHE_DIR, `${itemID}.png`));
			try {
				const image = await canvasImageFromBuffer(imageBuffer);
				this.itemIconImagesCache.set(itemID, image);
				return this.getItemImage(itemID, quantity);
			} catch (err) {
				console.error(`Failed to load item icon with id: ${itemID}`);
				return this.getItemImage(1, 1);
			}
		}

		return cachedImage;
	}

	async fetchAndCacheImage(itemID: number) {
		const imageBuffer = await fetch(
			`https://chisel.weirdgloop.org/static/img/osrs-sprite/${itemID}.png`
		).then(result => result.buffer());

		await fs.promises.writeFile(path.join(CACHE_DIR, `${itemID}.png`), imageBuffer);

		const image = await canvasImageFromBuffer(imageBuffer);

		this.itemIconsList.add(itemID);
		this.itemIconImagesCache.set(itemID, image);
	}

	drawBorder(canvas: Canvas, titleLine = true) {
		const ctx = canvas.getContext('2d');
		// Draw top border
		ctx.fillStyle = ctx.createPattern(this.borderHorizontal, 'repeat-x');
		ctx.fillRect(0, 0, canvas.width, this.borderHorizontal!.height);

		// Draw bottom border
		ctx.save();
		ctx.fillStyle = ctx.createPattern(this.borderHorizontal, 'repeat-x');
		ctx.translate(0, canvas.height);
		ctx.scale(1, -1);
		ctx.fillRect(0, 0, canvas.width, this.borderHorizontal!.height);
		ctx.restore();

		// Draw title line
		if (titleLine) {
			ctx.save();
			ctx.fillStyle = ctx.createPattern(this.borderHorizontal, 'repeat-x');
			ctx.translate(this.borderVertical!.width, 27);
			ctx.fillRect(0, 0, canvas.width, this.borderHorizontal!.height);
			ctx.restore();
		}

		// Draw left border
		ctx.save();
		ctx.fillStyle = ctx.createPattern(this.borderVertical, 'repeat-y');
		ctx.translate(0, this.borderVertical!.width);
		ctx.fillRect(0, 0, this.borderVertical!.width, canvas.height);
		ctx.restore();

		// Draw right border
		ctx.fillStyle = ctx.createPattern(this.borderVertical, 'repeat-y');
		ctx.save();
		ctx.translate(canvas.width, 0);
		ctx.scale(-1, 1);
		ctx.fillRect(0, 0, this.borderVertical!.width, canvas.height);
		ctx.restore();

		// Draw corner borders
		// Top left
		ctx.save();
		ctx.translate(0, 0);
		ctx.scale(1, 1);
		ctx.drawImage(this.borderCorner, 0, 0);
		ctx.restore();

		// Top right
		ctx.save();
		ctx.translate(canvas.width, 0);
		ctx.scale(-1, 1);
		ctx.drawImage(this.borderCorner, 0, 0);
		ctx.restore();

		// Bottom right
		ctx.save();
		ctx.translate(canvas.width, canvas.height);
		ctx.scale(-1, -1);
		ctx.drawImage(this.borderCorner, 0, 0);
		ctx.restore();

		// Bottom left
		ctx.save();
		ctx.translate(0, canvas.height);
		ctx.scale(1, -1);
		ctx.drawImage(this.borderCorner, 0, 0);
		ctx.restore();
	}

	addsHamstare(canvas: Canvas, wide = false) {
		const ctx = canvas.getContext('2d');
		ctx.save();
		ctx.globalAlpha = 0.15;
		const ham = (roll(100) ? this.imageHamstare2 : this.imageHamstare)!;
		ctx.translate(
			wide ? this.borderVertical?.width! : canvas.width / 2 - ham.width! / 2,
			canvas.height - ham.height! - this.borderHorizontal?.height!
		);
		ctx.drawImage(
			ham,
			0,
			0,
			wide ? canvas.width - this.borderVertical?.width! * 2 : ham.width!,
			ham.height!
		);
		ctx.restore();
	}

	async generateBankImage(
		itemLoot: ItemBank,
		title = '',
		showValue = true,
		flags: { [key: string]: string | number } = {},
		user?: KlasaUser | string,
		collectionLog?: ItemBank
	): Promise<BankImageResult> {
		const settings =
			typeof user === 'undefined'
				? null
				: typeof user === 'string'
				? await getUserSettings(user)
				: user.settings;

		const bankBackgroundID =
			settings?.get(UserSettings.BankBackground) ?? flags.background ?? 1;
		const currentCL = collectionLog ?? settings?.get(UserSettings.CollectionLogBank);

		let items = await createTupleOfItemsFromBank(this.client, itemLoot);

		let partial = false;
		let partialValue = 0;
		const totalValue = addArrayOfNumbers(items.map(i => i[2]));
		// Filtering
		const searchQuery = flags.search || flags.s;
		if (searchQuery && typeof searchQuery === 'string') {
			partial = true;
			items = filterItemTupleByQuery(searchQuery, items);
		}

		// Filter by preset
		for (const flag of Object.keys(flags)) {
			if (
				filterableTypes.some(type => type.aliases.some(alias => stringMatches(alias, flag)))
			) {
				partial = true;
				items = filterByCategory(flag, items);
			}
		}

		// Remove items that have 0 qty
		items = items.filter(i => i[1] > 0);

		// Sorting by value
		items = items.sort((a, b) => b[2] - a[2]);

		// Sorting by favorites
		if (settings) {
			const favorites = settings.get(UserSettings.FavoriteItems);
			if (favorites.length > 0) {
				// Sort favorite items to the front
				items = items.sort((a, b) => {
					const aFav = favorites.includes(a[0]);
					const bFav = favorites.includes(b[0]);
					if (aFav && bFav) return 0;
					if (aFav) return -1;
					return 1;
				});
			}
		}

		if (partial) {
			partialValue = addArrayOfNumbers(items.map(i => i[2]));
		}

		// Get page flag to show the current page, full and showNewCL to avoid showing page n of y
		const { page, noBorder, wide } = flags;
		if (Number(page) >= 0) {
			title += ` - Page ${(Number(page) ? Number(page) : 0) + 1} of ${
				util.chunk(items, 56).length
			}`;
		}

		// Paging
		if (typeof page === 'number' && !flags.full) {
			const chunked = util.chunk(items, 56);
			const pageLoot = chunked[page];
			if (!pageLoot) throw 'You have no items on this page.';
			items = pageLoot;
		}

		let width = wide
			? 5 + this.borderVertical!.width + 20 + Math.ceil(Math.sqrt(items.length)) * (36 + 21)
			: 488;
		if (width < 488) width = 488;
		const itemsPerRow = Math.floor((width - this.borderVertical!.width * 2) / (36 + 21));
		const canvasHeight =
			Math.floor(
				Math.floor(
					Math.ceil(items.length / itemsPerRow) *
						Math.floor((itemSize + spacer / 2) * 1.08)
				) +
					itemSize * 1.5
			) - 2;
		let bgImage = this.backgroundImages.find(bg => bg.id === bankBackgroundID)!;
		const isPurple: boolean =
			bankBackgroundID === 14 &&
			flags.showNewCL !== undefined &&
			currentCL !== undefined &&
			Object.keys(itemLoot).some(
				i => !currentCL[i] && allCollectionLogItems.includes(parseInt(i))
			);

		if (isPurple) {
			bgImage = { ...bgImage, image: await canvasImageFromBuffer(coxPurpleBg) };
		}

		const cacheKey = [
			title,
			typeof user === 'string' ? user : user?.id ?? 'nouser',
			showValue,
			bankBackgroundID,
			searchQuery,
			items.length,
			partial,
			page,
			isPurple,
			totalValue,
			canvasHeight,
			Object.entries(flags).toString(),
			sha256Hash(items.map(i => i[0]).join(''))
		].join('-');

		let cached = bankImageCache.get(cacheKey);
		if (cached) {
			return {
				cachedURL: cached,
				image: null,
				cacheKey
			};
		}

		const canvas = createCanvas(width, canvasHeight <= 331 ? 331 : canvasHeight);

		const ctx = canvas.getContext('2d');
		ctx.font = '16px OSRSFontCompact';
		ctx.imageSmoothingEnabled = false;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		ctx.fillStyle = ctx.createPattern(bgImage.repeatImage ?? this.repeatingImage, 'repeat');
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		const isTransparent = bankBackgroundID === 12;

		if (bankBackgroundID !== 12) {
			ctx.fillStyle = ctx.createPattern(bgImage.repeatImage ?? this.repeatingImage, 'repeat');
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(
				bgImage!.image,
				0,
				0,
				wide ? canvas.width : bgImage.image!.width!,
				wide ? canvas.height : bgImage.image!.height!
			);
		}

		// Skips border if noBorder is set
		if (noBorder !== 1 && !isTransparent) {
			this.drawBorder(canvas, bgImage.name === 'Default');
		}

		// Adds hamstare
		if (bgImage.name === 'Default' && !isTransparent) {
			this.addsHamstare(canvas, Boolean(wide));
		}

		if (showValue) {
			title += ` (Value: ${partial ? `${toKMB(partialValue)} of ` : ''}${toKMB(totalValue)})`;
		}

		// Draw Bank Title
		ctx.textAlign = 'center';
		ctx.font = '16px RuneScape Bold 12';

		ctx.fillStyle = '#000000';
		fillTextXTimesInCtx(ctx, title, Math.floor(canvas.width / 2) + 1, 22);

		ctx.fillStyle = '#ff981f';
		fillTextXTimesInCtx(ctx, title, Math.floor(canvas.width / 2), 21);

		// Draw Items
		ctx.textAlign = 'start';
		ctx.fillStyle = '#494034';
		ctx.font = '16px OSRSFontCompact';

		let xLoc = 0;
		let yLoc = 0;
		for (let i = 0; i < items.length; i++) {
			if (i % itemsPerRow === 0) yLoc += Math.floor((itemSize + spacer / 2) * 1.08);
			// For some reason, it starts drawing at -2 so we compensate that
			// Adds the border width
			// Adds distance from side
			// 36 + 21 is the itemLength + the space between each item
			xLoc = 2 + this.borderVertical!.width + 20 + (i % itemsPerRow) * (36 + 21);
			const [id, quantity, value] = items[i];
			const item = await this.getItemImage(id, quantity).catch(() => {
				console.error(`Failed to load item image for item with id: ${id}`);
			});
			if (!item) {
				this.client.emit(Events.Warn, `Item with ID[${id}] has no item image.`);
				continue;
			}

			ctx.drawImage(
				item,
				Math.floor(xLoc + (itemSize - item.width) / 2) + 2,
				Math.floor(yLoc + (itemSize - item.height) / 2),
				item.width,
				item.height
			);

			// Check if new cl item
			const isNewCLItem =
				flags.showNewCL &&
				currentCL &&
				!currentCL[id] &&
				allCollectionLogItems.includes(id);
			const quantityColor = isNewCLItem ? '#ac7fff' : generateHexColorForCashStack(quantity);
			const formattedQuantity = formatItemStackQuantity(quantity);

			// Draw qty shadow
			ctx.fillStyle = '#000000';
			fillTextXTimesInCtx(
				ctx,
				formattedQuantity,
				xLoc + distanceFromSide - 17,
				yLoc + distanceFromTop - 23
			);

			// Draw qty
			ctx.fillStyle = quantityColor;
			fillTextXTimesInCtx(
				ctx,
				formattedQuantity,
				xLoc + distanceFromSide - 18,
				yLoc + distanceFromTop - 24
			);

			// Check for names flag and draw its shadow and name
			if (flags.names) {
				const __name = `${itemNameFromID(id)!.replace('Grimy', 'Grmy').slice(0, 7)}..`;
				ctx.fillStyle = 'black';
				fillTextXTimesInCtx(
					ctx,
					__name,
					Math.floor(xLoc + (itemSize - item.width) / 2),
					yLoc + distanceFromTop
				);
				ctx.fillStyle = 'white';
				fillTextXTimesInCtx(
					ctx,
					__name,
					Math.floor(xLoc + (itemSize - item.width) / 2) - 1,
					yLoc + distanceFromTop - 1
				);
			}

			// Check for sv flag and draw its shadow and value
			if ((flags.showvalue || flags.sv) && !flags.names) {
				const formattedValue = Util.toKMB(value);
				ctx.fillStyle = 'black';
				fillTextXTimesInCtx(
					ctx,
					formattedValue,
					Math.floor(xLoc + (itemSize - item.width) / 2),
					yLoc + distanceFromTop
				);
				ctx.fillStyle = generateHexColorForCashStack(value);
				fillTextXTimesInCtx(
					ctx,
					formattedValue,
					Math.floor(xLoc + (itemSize - item.width) / 2) - 1,
					yLoc + distanceFromTop - 1
				);
			}
		}

		const image =
			items.length > 2000
				? canvas.toBuffer('image/jpeg', { quality: 0.75 })
				: canvas.toBuffer('image/png');

		return {
			image,
			cacheKey,
			cachedURL: null
		};
	}

	async generateCollectionLogImage(
		collectionLog: ItemBank,
		title = '',
		type: any
	): Promise<Buffer> {
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
			const item = await this.getItemImage(itemID, 100_000);
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

				ctx.fillStyle = ctx.createPattern(repeaterImage, 'repeat');
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
		// Draw border
		this.drawBorder(canvas);
		this.addsHamstare(canvas);

		return canvas.toBuffer();
	}
}
