import * as fs from 'fs';
import { KlasaUser, Task, TaskStore, util } from 'klasa';
import fetch from 'node-fetch';
import { Bank, Items } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';
import { toKMB } from 'oldschooljs/dist/util/util';
import * as path from 'path';
import { Canvas, CanvasRenderingContext2D, FontLibrary, Image, loadImage } from 'skia-canvas/lib';

import { bankImageCache, BitField, PerkTier } from '../lib/constants';
import { allCLItems } from '../lib/data/Collections';
import { filterableTypes } from '../lib/data/filterables';
import backgroundImages from '../lib/minions/data/bankBackgrounds';
import { BankBackground, FlagMap, Flags } from '../lib/minions/types';
import { getUserSettings } from '../lib/settings/settings';
import { UserSettings } from '../lib/settings/types/UserSettings';
import { BankSortMethod, BankSortMethods, sorts } from '../lib/sorts';
import {
	addArrayOfNumbers,
	cleanString,
	formatItemStackQuantity,
	generateHexColorForCashStack,
	sha256Hash
} from '../lib/util';
import { drawImageWithOutline, fillTextXTimesInCtx } from '../lib/util/canvasUtil';
import getUsersPerkTier from '../lib/util/getUsersPerkTier';
import itemID from '../lib/util/itemID';
import { logError } from '../lib/util/logError';

FontLibrary.use({
	OSRSFont: './src/lib/resources/osrs-font.ttf',
	OSRSFontCompact: './src/lib/resources/osrs-font-compact.otf',
	'RuneScape Bold 12': './src/lib/resources/osrs-font-bold.ttf',
	'Smallest Pixel-7': './src/lib/resources/small-pixel.ttf',
	'RuneScape Quill 8': './src/lib/resources/osrs-font-quill-8.ttf'
});

export type BankImageResult =
	| {
			cachedURL: null;
			image: Buffer;
			cacheKey: string;
			isTransparent: boolean;
	  }
	| {
			cachedURL: string;
			image: null;
			cacheKey: string;
			isTransparent: boolean;
	  };

const CACHE_DIR = './icon_cache';

const itemSize = 32;
const distanceFromTop = 32;
const distanceFromSide = 16;

const { floor, ceil } = Math;

interface IBgSprite {
	border: Canvas;
	borderCorner: Canvas;
	borderTitle: Canvas;
	repeatableBg: Canvas;
}

const i = itemID;
const forcedShortNameMap = new Map<number, string>([
	[i('Guam seed'), 'guam'],
	[i('Marrentill seed'), 'marren'],
	[i('Tarromin seed'), 'tarro'],
	[i('Harralander seed'), 'harra'],
	[i('Ranarr seed'), 'ranarr'],
	[i('Toadflax seed'), 'toad'],
	[i('Irit seed'), 'irit'],
	[i('Avantoe seed'), 'avan'],
	[i('Kwuarm seed'), 'kwuarm'],
	[i('Snapdragon seed'), 'snap'],
	[i('Cadantine seed'), 'cadan'],
	[i('Lantadyme seed'), 'lanta'],
	[i('Dwarf weed seed'), 'dwarf'],
	[i('Torstol seed'), 'torstol'],
	[i('Redberry seed'), 'redberry'],
	[i('Cadavaberry seed'), 'cadava'],
	[i('Dwellberry seed'), 'dwell'],
	[i('Jangerberry seed'), 'janger'],
	[i('Whiteberry seed'), 'white'],
	[i('Poison ivy seed'), 'ivy'],
	[i('Grape seed'), 'grape'],
	[i('Mushroom spore'), 'mushroom'],
	[i('Belladonna seed'), 'bella'],
	[i('Seaweed spore'), 'seaweed'],
	[i('Hespori seed'), 'hespori'],
	[i('Kronos seed'), 'kronos'],
	[i('Iasor seed'), 'iasor'],
	[i('Attas seed'), 'attas'],
	[i('Cactus seed'), 'cactus'],
	[i('Potato cactus seed'), 'pcact'],
	[i('Acorn'), 'oak'],
	[i('willow seed'), 'willow'],
	[i('Maple seed'), 'maple'],
	[i('Yew seed'), 'yew'],
	[i('Magic seed'), 'magic'],
	[i('Redwood tree seed'), 'red'],
	[i('Teak seed'), 'teak'],
	[i('Mahogany seed'), 'mahog'],
	[i('Crystal acorn'), 'crystal'],
	[i('Celastrus seed'), 'celas'],
	[i('Spirit seed'), 'spirit'],
	[i('Calquat tree seed'), 'calquat'],
	[i('Apple tree seed'), 'apple'],
	[i('Banana tree seed'), 'banana'],
	[i('Orange tree seed'), 'orange'],
	[i('Curry tree seed'), 'curry'],
	[i('Pineapple seed'), 'pinea'],
	[i('Papaya tree seed'), 'papaya'],
	[i('Palm tree seed'), 'palm'],
	[i('Dragonfruit tree seed'), 'dragon'],
	[i('Potato seed'), 'potato'],
	[i('Onion seed'), 'onion'],
	[i('Cabbage seed'), 'cabbage'],
	[i('Tomato seed'), 'tomato'],
	[i('Sweetcorn seed'), 'scorn'],
	[i('Strawberry seed'), 'sberry'],
	[i('Watermelon seed'), 'melon'],
	[i('Snape grass seed'), 'snape'],
	[i('Marigold seed'), 'marigo'],
	[i('Rosemary seed'), 'rosemar'],
	[i('Nasturtium seed'), 'nastur'],
	[i('Woad seed'), 'woad'],
	[i('Limpwurt seed'), 'limpwurt'],
	[i('White lily seed'), 'lily'],
	[i('Barley seed'), 'barley'],
	[i('Hammerstone seed'), 'hammer'],
	[i('Asgarnian seed'), 'asgar'],
	[i('Jute seed'), 'Jute'],
	[i('Yanillian seed'), 'yani'],
	[i('Krandorian seed'), 'krand'],
	[i('Wildblood seed'), 'wild.b'],

	// Herbs
	[i('Guam leaf'), 'guam'],
	[i('Marrentill'), 'marren'],
	[i('Tarromin'), 'tarro'],
	[i('Harralander'), 'harra'],
	[i('Ranarr weed'), 'ranarr'],
	[i('Toadflax'), 'toad'],
	[i('Irit leaf'), 'irit'],
	[i('Avantoe'), 'avan'],
	[i('Kwuarm'), 'kwuarm'],
	[i('Snapdragon'), 'snap'],
	[i('Cadantine'), 'cadan'],
	[i('Lantadyme'), 'lanta'],
	[i('Dwarf weed'), 'dwarf'],
	[i('Torstol'), 'torstol'],

	[i('Grimy guam leaf'), 'guam'],
	[i('Grimy marrentill'), 'marren'],
	[i('Grimy tarromin'), 'tarro'],
	[i('Grimy harralander'), 'harra'],
	[i('Grimy ranarr weed'), 'ranarr'],
	[i('Grimy toadflax'), 'toad'],
	[i('Grimy irit leaf'), 'irit'],
	[i('Grimy avantoe'), 'avan'],
	[i('Grimy kwuarm'), 'kwuarm'],
	[i('Grimy snapdragon'), 'snap'],
	[i('Grimy cadantine'), 'cadan'],
	[i('Grimy lantadyme'), 'lanta'],
	[i('Grimy dwarf weed'), 'dwarf'],
	[i('Grimy torstol'), 'torstol'],

	[i('Compost'), 'compost'],
	[i('Supercompost'), 'super'],
	[i('Ultracompost'), 'ultra'],

	// Clues & Caskets
	[i('Clue scroll (beginner)'), 'beginner'],
	[i('Reward casket (beginner)'), 'beginner'],

	[i('Clue scroll (easy)'), 'easy'],
	[i('Reward casket (easy)'), 'easy'],

	[i('Clue scroll (medium)'), 'medium'],
	[i('Reward casket (medium)'), 'medium'],

	[i('Clue scroll (hard)'), 'hard'],
	[i('Reward casket (hard)'), 'hard'],

	[i('Clue scroll (elite)'), 'elite'],
	[i('Reward casket (elite)'), 'elite'],

	[i('Clue scroll (master)'), 'master'],
	[i('Reward casket (master)'), 'master']
]);

export default class BankImageTask extends Task {
	public itemIconsList: Set<number>;
	public itemIconImagesCache: Map<number, Image>;
	public backgroundImages: BankBackground[] = [];

	public _bgSpriteData: Image = new Image();
	public bgSpriteList: Record<string, IBgSprite> = {};

	public constructor(store: TaskStore, file: string[], directory: string) {
		super(store, file, directory, {});

		// This tells us simply whether the file exists or not on disk.
		this.itemIconsList = new Set();

		// If this file does exist, it might be cached in this, or need to be read from fs.
		this.itemIconImagesCache = new Map();
	}

	async init() {
		// Init bank sprites
		const basePath = './src/lib/resources/images/bank_backgrounds/spritesheet/';
		await fs.readdir(basePath, async (err, files) => {
			if (err) throw 'Could not load sprite files';
			for (const file of files) {
				const bgName = file.split('\\').pop()!.split('/').pop()!.split('.').shift()!;
				this._bgSpriteData = await loadImage(fs.readFileSync(basePath + file));
				this.bgSpriteList[bgName] = {
					border: this.getClippedRegion(this._bgSpriteData, 0, 0, 18, 6),
					borderCorner: this.getClippedRegion(this._bgSpriteData, 19, 0, 6, 6),
					borderTitle: this.getClippedRegion(this._bgSpriteData, 26, 0, 18, 6),
					repeatableBg: this.getClippedRegion(this._bgSpriteData, 93, 0, 96, 65)
				};
			}
		});

		await this.run();
	}

	async run() {
		await this.cacheFiles();

		this.backgroundImages = await Promise.all(
			backgroundImages.map(async img => {
				const ext = img.transparent ? 'png' : 'jpg';
				const bgPath = `./src/lib/resources/images/bank_backgrounds/${img.id}.${ext}`;
				const purplePath = img.hasPurple
					? `./src/lib/resources/images/bank_backgrounds/${img.id}_purple.${ext}`
					: null;
				return {
					...img,
					image: fs.existsSync(bgPath) ? await loadImage(fs.readFileSync(bgPath)) : null,
					purpleImage: purplePath
						? fs.existsSync(purplePath)
							? await loadImage(fs.readFileSync(purplePath))
							: null
						: null
				};
			})
		);
	}

	// Split sprite into smaller images by coors and size
	getClippedRegion(image: Image | Canvas, x: number, y: number, width: number, height: number) {
		const canvas = new Canvas(width, height);
		const ctx = canvas.getContext('2d');
		if (image instanceof Canvas) {
			ctx.drawCanvas(image, x, y, width, height, 0, 0, width, height);
		} else {
			ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
		}
		return canvas;
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
		const cachedImage = this.itemIconImagesCache.get(itemID);
		if (cachedImage) return cachedImage;

		const isOnDisk = this.itemIconsList.has(itemID);
		if (!isOnDisk) {
			await this.fetchAndCacheImage(itemID);
			return this.getItemImage(itemID);
		}

		if (!cachedImage) {
			const imageBuffer = await fs.promises.readFile(path.join(CACHE_DIR, `${itemID}.png`));
			try {
				const image = await loadImage(imageBuffer);
				this.itemIconImagesCache.set(itemID, image);
				return image;
			} catch (err) {
				logError(`Failed to load item icon with id: ${itemID}`);
				return this.getItemImage(1);
			}
		}

		return cachedImage;
	}

	async fetchAndCacheImage(itemID: number) {
		const imageBuffer = await fetch(`https://chisel.weirdgloop.org/static/img/osrs-sprite/${itemID}.png`).then(
			result => result.buffer()
		);

		await fs.promises.writeFile(path.join(CACHE_DIR, `${itemID}.png`), imageBuffer);

		const image = await loadImage(imageBuffer);

		this.itemIconsList.add(itemID);
		this.itemIconImagesCache.set(itemID, image);
	}

	drawBorder(ctx: CanvasRenderingContext2D, sprite: IBgSprite, titleLine = true) {
		// Top border
		ctx.save();
		ctx.fillStyle = ctx.createPattern(sprite.border, 'repeat-x')!;
		ctx.translate(0, 0);
		ctx.scale(1, 1);
		ctx.fillRect(0, 0, ctx.canvas.width, sprite.border.height);
		ctx.restore();
		// Bottom border
		ctx.save();
		ctx.fillStyle = ctx.createPattern(sprite.border, 'repeat-x')!;
		ctx.translate(0, ctx.canvas.height);
		ctx.scale(1, -1);
		ctx.fillRect(0, 0, ctx.canvas.width, sprite.border.height);
		ctx.restore();
		// Right border
		ctx.save();
		ctx.fillStyle = ctx.createPattern(sprite.border, 'repeat-x')!;
		ctx.rotate((Math.PI / 180) * 90);
		ctx.translate(0, -ctx.canvas.width);
		ctx.fillRect(0, 0, ctx.canvas.height, sprite.border.height);
		ctx.restore();
		// Left border
		ctx.save();
		ctx.fillStyle = ctx.createPattern(sprite.border, 'repeat-x')!;
		ctx.rotate((Math.PI / 180) * 90);
		ctx.scale(1, -1);
		ctx.fillRect(0, 0, ctx.canvas.height, sprite.border.height);
		ctx.restore();
		// Corners
		// Top left
		ctx.save();
		ctx.scale(1, 1);
		ctx.drawImage(sprite.borderCorner, 0, 0);
		ctx.restore();
		// Top right
		ctx.save();
		ctx.translate(ctx.canvas.width, 0);
		ctx.scale(-1, 1);
		ctx.drawImage(sprite.borderCorner, 0, 0);
		ctx.restore();
		// Bottom right
		ctx.save();
		ctx.translate(ctx.canvas.width, ctx.canvas.height);
		ctx.scale(-1, -1);
		ctx.drawImage(sprite.borderCorner, 0, 0);
		ctx.restore();
		// Bottom left
		ctx.save();
		ctx.translate(0, ctx.canvas.height);
		ctx.scale(1, -1);
		ctx.drawImage(sprite.borderCorner, 0, 0);
		ctx.restore();
		// Title border
		if (titleLine) {
			ctx.save();
			ctx.fillStyle = ctx.createPattern(sprite.borderTitle, 'repeat-x')!;
			ctx.translate(sprite.border.height - 1, 27);
			ctx.fillRect(0, 0, ctx.canvas.width - sprite.border.height * 2 + 2, sprite.borderTitle.height);
			ctx.restore();
		}
	}

	getBgAndSprite(bankBgId: number = 1) {
		const background = this.backgroundImages.find(i => i.id === bankBgId)!;
		const hasBgSprite = Boolean(this.bgSpriteList[background.name]);
		const bgSprite = hasBgSprite ? this.bgSpriteList[background.name] : this.bgSpriteList['Default'];
		return {
			uniqueSprite: hasBgSprite,
			sprite: bgSprite,
			background
		};
	}

	async drawItems(
		ctx: CanvasRenderingContext2D,
		compact: boolean,
		spacer: number,
		itemsPerRow: number,
		itemWidthSize: number,
		items: [Item, number][],
		flags: FlagMap,
		currentCL: Bank | undefined
	) {
		// Draw Items
		ctx.textAlign = 'start';
		ctx.fillStyle = '#494034';
		const font = compact ? '14px OSRSFontCompact' : '16px OSRSFontCompact';

		let xLoc = 0;
		let yLoc = compact ? 5 : 0;
		for (let i = 0; i < items.length; i++) {
			if (i % itemsPerRow === 0) yLoc += floor((itemSize + spacer / 2) * (compact ? 0.9 : 1.08));
			// For some reason, it starts drawing at -2 so we compensate that
			// Adds the border width
			// Adds distance from side
			// 36 + 21 is the itemLength + the space between each item
			xLoc = 2 + 6 + (compact ? 9 : 20) + (i % itemsPerRow) * itemWidthSize;
			let [item, quantity] = items[i];
			const itemImage = await this.getItemImage(item.id);
			console.log(itemImage);
			const itemHeight = compact ? itemImage.height / 1 : itemImage.height;
			const itemWidth = compact ? itemImage.width / 1 : itemImage.width;
			const isNewCLItem =
				flags.has('showNewCL') && currentCL && !currentCL.has(item.id) && allCLItems.includes(item.id);
			// ctx.globalAlpha = 1;
			if (isNewCLItem) {
				drawImageWithOutline(
					ctx,
					itemImage,
					floor(xLoc + (itemSize - itemWidth) / 2) + 2,
					floor(yLoc + (itemSize - itemHeight) / 2),
					itemWidth,
					itemHeight,
					'#ac7fff',
					1
				);
			} else {
				ctx.drawImage(
					itemImage,
					floor(xLoc + (itemSize - itemWidth) / 2) + 2,
					floor(yLoc + (itemSize - itemHeight) / 2),
					itemWidth,
					itemHeight
				);
			}

			// Do not draw the item qty if there is 0 of that item in the bank
			if (quantity) {
				if (ctx.font !== font) ctx.font = font;
				// Check if new cl item
				const quantityColor = isNewCLItem ? '#ac7fff' : generateHexColorForCashStack(quantity);
				const formattedQuantity = formatItemStackQuantity(quantity);
				// Draw qty shadow
				ctx.fillStyle = '#000000';
				fillTextXTimesInCtx(ctx, formattedQuantity, xLoc + distanceFromSide - 17, yLoc + distanceFromTop - 23);
				// Draw qty
				ctx.fillStyle = quantityColor;
				fillTextXTimesInCtx(ctx, formattedQuantity, xLoc + distanceFromSide - 18, yLoc + distanceFromTop - 24);
			}

			let bottomItemText: string | number | null = null;

			if (flags.has('sv')) {
				bottomItemText = item.price * quantity;
			} else if (flags.has('av')) {
				bottomItemText = (item.highalch ?? 0) * quantity;
			} else if (flags.has('id')) {
				bottomItemText = item.id.toString();
			} else if (flags.has('names')) {
				bottomItemText = item.name;
			}

			const forcedShortName = forcedShortNameMap.get(item.id);
			if (forcedShortName && !bottomItemText) {
				ctx.font = '10px Smallest Pixel-7';
				bottomItemText = forcedShortName?.toUpperCase();
			}

			if (bottomItemText) {
				let text =
					typeof bottomItemText === 'number' ? toKMB(bottomItemText) : bottomItemText.toString().slice(0, 8);
				ctx.fillStyle = 'black';
				fillTextXTimesInCtx(ctx, text, floor(xLoc), yLoc + distanceFromTop);
				ctx.fillStyle =
					typeof bottomItemText === 'string' ? 'white' : generateHexColorForCashStack(bottomItemText);
				fillTextXTimesInCtx(ctx, text, floor(xLoc - 1), yLoc + distanceFromTop - 1);
			}
		}
	}

	async generateBankImage(
		_bank: Bank,
		title = '',
		showValue = true,
		_flags: Flags = {},
		user?: KlasaUser,
		collectionLog?: Bank
	): Promise<BankImageResult> {
		const bank = _bank.clone();
		const flags = new Map(Object.entries(_flags));
		let compact = flags.has('compact');
		const spacer = compact ? 2 : 12;

		const settings =
			typeof user === 'undefined' ? null : typeof user === 'string' ? await getUserSettings(user) : user.settings;

		const bankBackgroundID = Number(settings?.get(UserSettings.BankBackground) ?? flags.get('background') ?? 1);
		const rawCL = settings?.get(UserSettings.CollectionLogBank);
		const currentCL: Bank | undefined = collectionLog ?? (rawCL === undefined ? undefined : new Bank(rawCL));
		let partial = false;

		// Filtering
		const searchQuery = flags.get('search') as string | undefined;
		const filterInput = flags.get('filter');
		const filter = flags.get('search')
			? filterableTypes.find(type => type.aliases.some(alias => filterInput === alias)) ?? null
			: null;
		if (filter || searchQuery) {
			partial = true;
			bank.filter(item => {
				if (searchQuery) return cleanString(item.name).includes(cleanString(searchQuery));
				return filter!.items(user!).includes(item.id);
			}, true);
		}

		let items = bank.items();

		// Sorting
		const favorites = settings?.get(UserSettings.FavoriteItems);
		const weightings = settings?.get(UserSettings.BankSortWeightings);

		const perkTier = user ? getUsersPerkTier(user) : 0;
		const defaultSort: BankSortMethod =
			perkTier < PerkTier.Two ? 'value' : settings?.get(UserSettings.BankSortMethod) ?? 'value';
		const sortInput = flags.get('sort');
		const sort = sortInput ? BankSortMethods.find(s => s === sortInput) ?? defaultSort : defaultSort;

		items.sort(sorts[sort]);

		if (favorites) {
			items.sort((a, b) => {
				const aFav = favorites.includes(a[0].id);
				const bFav = favorites.includes(b[0].id);
				if (aFav && bFav) return sorts[sort](a, b);
				if (bFav) return 1;
				if (aFav) return -1;
				return 0;
			});
		}

		if (perkTier >= PerkTier.Two && weightings && Object.keys(weightings).length > 0) {
			items.sort((a, b) => {
				const aWeight = weightings[a[0].id];
				const bWeight = weightings[b[0].id];
				if (aWeight === undefined && bWeight === undefined) return 0;
				if (bWeight && aWeight) return bWeight - aWeight;
				if (bWeight) return 1;
				if (aWeight) return -1;
				return 0;
			});
		}

		const totalValue = addArrayOfNumbers(items.map(([i, q]) => i.price * q));

		const chunkSize = compact ? 140 : 56;
		const chunked = util.chunk(items, chunkSize);

		// Get page flag to show the current page, full and showNewCL to avoid showing page n of y
		const page = flags.get('page');
		const noBorder = flags.get('noBorder');
		const wide = flags.get('wide');
		if (Number(page) >= 0) {
			title += ` - Page ${(Number(page) ? Number(page) : 0) + 1} of ${chunked.length}`;
		}

		// Paging
		if (typeof page === 'number' && !flags.has('full')) {
			let pageLoot = chunked[page];
			let asItem = Items.get(page + 1);
			if (asItem && !pageLoot) {
				const amount = bank.amount(asItem.id);
				if (!amount) {
					throw `You have no ${asItem.name}.`;
				}
				pageLoot = [[asItem, amount]];
			}

			if (!pageLoot) throw 'You have no items on this page.';
			items = pageLoot;
		}

		if (items.length > 500 && !flags.has('nc')) compact = true;

		const itemWidthSize = compact ? 12 + 21 : 36 + 21;

		let width = wide ? 5 + 6 + 20 + ceil(Math.sqrt(items.length)) * itemWidthSize : 488;
		if (width < 488) width = 488;
		const itemsPerRow = floor((width - 6 * 2) / itemWidthSize);
		const canvasHeight =
			floor(
				floor(ceil(items.length / itemsPerRow) * floor((itemSize + spacer / 2) * (compact ? 0.9 : 1.08))) +
					itemSize * 1.5
			) - 2;

		let {
			sprite: bgSprite,
			uniqueSprite: hasBgSprite,
			background: bgImage
		} = this.getBgAndSprite(bankBackgroundID);

		const isTransparent = Boolean(bgImage.transparent);

		const isPurple: boolean =
			flags.get('showNewCL') !== undefined &&
			currentCL !== undefined &&
			bank.items().some(([item]) => !currentCL.has(item.id) && allCLItems.includes(item.id));

		let actualBackground = isPurple && bgImage.hasPurple ? bgImage.purpleImage! : bgImage.image!;

		const hexColor = user?.settings.get(UserSettings.BankBackgroundHex);

		const useSmallBank = user
			? hasBgSprite
				? true
				: user.settings.get(UserSettings.BitField).includes(BitField.AlwaysSmallBank)
			: true;

		const cacheKey = [
			title,
			user?.id ?? 'nouser',
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
			sha256Hash(items.map(i => `${i[0].id}-${i[1]}`).join('')),
			hexColor ?? 'no-hex',
			useSmallBank ? 'smallbank' : 'no-smallbank',
			sort,
			Math.random() * 190
		].join('-');

		let cached = bankImageCache.get(cacheKey);
		if (cached && !flags.has('nocache')) {
			return {
				cachedURL: cached,
				image: null,
				cacheKey,
				isTransparent
			};
		}

		const canvas = new Canvas(width, useSmallBank ? canvasHeight : Math.max(331, canvasHeight));

		let resizeBg = -1;
		if (!wide && !useSmallBank && !isTransparent && actualBackground && canvasHeight > 331) {
			resizeBg = Math.min(1440, canvasHeight) / actualBackground.height;
		}

		const ctx = canvas.getContext('2d');
		ctx.font = '16px OSRSFontCompact';
		ctx.imageSmoothingEnabled = false;

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		this.drawItems(ctx, compact, spacer, itemsPerRow, itemWidthSize, items, flags, currentCL);

		// const h = canvas.height;
		// const w = canvas.width;
		// let quad: QuadOrRect = [
		// 	w * 0.33,
		// 	h / 2, // upper left
		// 	w * 0.66,
		// 	h / 2, // upper right
		// 	w,
		// 	h * 0.9, // bottom right
		// 	0,
		// 	h * 0.9 // bottom left
		// ];

		// let matrix = ctx.createProjection(quad, [w / 2, h / 2]); // use default basis
		// ctx.setTransform(matrix);

		if (!isTransparent) {
			ctx.fillStyle = ctx.createPattern(bgSprite.repeatableBg, 'repeat')!;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		}

		if (hexColor && isTransparent) {
			ctx.fillStyle = hexColor;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		}

		if (!hasBgSprite) {
			ctx.drawImage(
				actualBackground,
				resizeBg === -1 ? 0 : (canvas.width - actualBackground.width! * resizeBg) / 2,
				0,
				wide ? canvas.width : actualBackground.width! * (resizeBg === -1 ? 1 : resizeBg),
				wide ? canvas.height : actualBackground.height! * (resizeBg === -1 ? 1 : resizeBg)
			);
		}

		if (showValue) {
			title += ` (Value: ${toKMB(totalValue)})`;
		}

		// Draw Bank Title
		ctx.font = '16px RuneScape Bold 12';
		const titleWidthPx = ctx.measureText(title);
		let titleX = Math.floor(floor(canvas.width / 2) - titleWidthPx.width / 2);

		ctx.fillStyle = '#000000';
		fillTextXTimesInCtx(ctx, title, titleX + 1, 22);

		ctx.fillStyle = '#ff981f';
		fillTextXTimesInCtx(ctx, title, titleX, 21);

		// Skips border if noBorder is set
		if (!isTransparent && noBorder !== 1) {
			this.drawBorder(ctx, bgSprite, bgImage.name === 'Default');
		}
		ctx.drawImage(await this.getItemImage(0), 10, 10);
		const image = await canvas.toBuffer('png');

		return {
			image,
			cacheKey,
			cachedURL: null,
			isTransparent
		};
	}
}
