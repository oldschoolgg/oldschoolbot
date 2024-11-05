import { existsSync } from 'node:fs';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { cleanString, formatItemStackQuantity, generateHexColorForCashStack } from '@oldschoolgg/toolkit/util';
import { AttachmentBuilder } from 'discord.js';
import { chunk, randInt, sumArr } from 'e';
import fetch from 'node-fetch';
import { Bank, type Item, resolveItems, toKMB } from 'oldschooljs';

import { UserError } from '@oldschoolgg/toolkit/structures';
import { BOT_TYPE, BitField, ItemIconPacks, PerkTier, toaPurpleItems } from '../lib/constants';
import { allCLItems } from '../lib/data/Collections';
import { filterableTypes } from '../lib/data/filterables';
import backgroundImages from '../lib/minions/data/bankBackgrounds';
import type { BankBackground, FlagMap, Flags } from '../lib/minions/types';
import type { BankSortMethod } from '../lib/sorts';
import { BankSortMethods, sorts } from '../lib/sorts';
import type { ItemBank } from '../lib/types';
import {
	type Canvas,
	type CanvasContext,
	CanvasImage,
	canvasToBuffer,
	createCanvas,
	drawImageWithOutline,
	fillTextXTimesInCtx,
	getClippedRegionImage,
	loadImage,
	registerFont
} from '../lib/util/canvasUtil';
import itemID from '../lib/util/itemID';
import { logError } from '../lib/util/logError';
import { XPLamps } from '../mahoji/lib/abstracted_commands/lampCommand';
import { TOBUniques } from './data/tob';
import { marketPriceOfBank, marketPriceOrBotPrice } from './marketPrices';

const fonts = {
	OSRSFont: './src/lib/resources/osrs-font.ttf',
	OSRSFontCompact: './src/lib/resources/osrs-font-compact.otf',
	'RuneScape Bold 12': './src/lib/resources/osrs-font-bold.ttf',
	'Smallest Pixel-7': './src/lib/resources/small-pixel.ttf',
	'RuneScape Quill 8': './src/lib/resources/osrs-font-quill-8.ttf'
} as const;

for (const [key, val] of Object.entries(fonts)) {
	registerFont(key, val);
}

interface BankImageResult {
	image: Buffer;
	isTransparent: boolean;
}

const CACHE_DIR = './icon_cache';

const itemSize = 32;
const distanceFromTop = 32;
const distanceFromSide = 16;

const sourceGiftItemIDs = [26_298, 26_300, 26_302, 26_308, 26_316, 26_318, 26_320, 26_322, 26_324];
const giftItemIDList: number[] = [];
for (let i = 0; i < 100; i++) {
	giftItemIDList.push(...sourceGiftItemIDs);
}

const { floor, ceil } = Math;

type BGSpriteName = 'dark' | 'default' | 'transparent';
export interface IBgSprite {
	name: BGSpriteName;
	border: CanvasImage;
	borderCorner: CanvasImage;
	borderTitle: CanvasImage;
	repeatableBg: CanvasImage;
	tabBorderInactive: CanvasImage;
	tabBorderActive: CanvasImage;
	oddListColor: string;
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
	[i('Reward casket (master)'), 'master'],

	// Unf pots
	[i('Avantoe potion (unf)'), 'avan'],
	[i('Cadantine potion (unf)'), 'cadan'],
	[i('Dwarf weed potion (unf)'), 'dwarf'],
	[i('Guam potion (unf)'), 'guam'],
	[i('Harralander potion (unf)'), 'harra'],
	[i('Irit potion (unf)'), 'irit'],
	[i('Kwuarm potion (unf)'), 'kwuarm'],
	[i('Lantadyme potion (unf)'), 'lanta'],
	[i('Marrentill potion (unf)'), 'marren'],
	[i('Ranarr potion (unf)'), 'ranarr'],
	[i('Snapdragon potion (unf)'), 'snap'],
	[i('Tarromin potion (unf)'), 'tarro'],
	[i('Toadflax potion (unf)'), 'toad'],
	[i('Torstol potion (unf)'), 'torstol'],

	// Logs
	[i('Logs'), 'Logs'],
	[i('Oak logs'), 'Oak'],
	[i('Willow logs'), 'Willow'],
	[i('Teak logs'), 'Teak'],
	[i('Arctic pine logs'), 'ArctPine'],
	[i('Maple logs'), 'Maple'],
	[i('Mahogany logs'), 'Mahog'],
	[i('Yew logs'), 'Yew'],
	[i('Magic logs'), 'Magic'],
	[i('Redwood logs'), 'Redwood'],
	...XPLamps.map(lamp => [lamp.itemID, toKMB(lamp.amount)] as const),

	// Uncharged
	[i('Holy sanguinesti staff (uncharged)'), 'Unch.'],
	[i('Sanguinesti staff (uncharged)'), 'Unch.'],
	[i('Scythe of vitur (uncharged)'), 'Unch.'],
	[i('Holy scythe of vitur (uncharged)'), 'Unch.'],
	[i('Sanguine scythe of vitur (uncharged)'), 'Unch.'],
	[i('Venator bow (uncharged)'), 'Unch.'],

	// Ore Packs
	[27_019, 'GF Pack'],
	[27_693, 'VM Pack']
]);

function drawTitle(ctx: CanvasContext, title: string, canvas: Canvas) {
	// Draw Bank Title
	ctx.font = '16px RuneScape Bold 12';
	const titleWidthPx = ctx.measureText(title);
	const titleX = Math.floor(floor(canvas.width / 2) - titleWidthPx.width / 2);

	ctx.fillStyle = '#000000';
	fillTextXTimesInCtx(ctx, title, titleX + 1, 22);

	ctx.fillStyle = '#ff981f';
	fillTextXTimesInCtx(ctx, title, titleX, 21);
}

export const bankFlags = [
	'show_price',
	'show_market_price',
	'show_alch',
	'show_id',
	'show_names',
	'show_weights',
	'show_all',
	'wide'
] as const;
export type BankFlag = (typeof bankFlags)[number];

export class BankImageTask {
	public itemIconsList: Set<number>;
	public itemIconImagesCache: Map<number, CanvasImage>;
	public backgroundImages: BankBackground[] = [];
	public alternateImages: { id: number; bgId: number; image: CanvasImage }[] = [];

	public _bgSpriteData: CanvasImage = new CanvasImage();
	public bgSpriteList: Record<string, IBgSprite> = {};
	public treeImage!: CanvasImage;
	public ready!: Promise<void>;
	public spriteSheetImage!: CanvasImage;
	public spriteSheetData!: Record<string, [number, number, number, number]>;

	public constructor() {
		// This tells us simply whether the file exists or not on disk.
		this.itemIconsList = new Set();

		// If this file does exist, it might be cached in this, or need to be read from fs.
		this.itemIconImagesCache = new Map();

		this.ready = this.init();
	}

	async init() {
		const colors: Record<BGSpriteName, string> = {
			default: '#655741',
			dark: '#393939',
			transparent: 'rgba(0,0,0,0)'
		};
		// Init bank sprites
		const basePath = './src/lib/resources/images/bank_backgrounds/spritesheet/';
		const files = await fs.readdir(basePath);
		for (const file of files) {
			const bgName: BGSpriteName = file.split('\\').pop()?.split('/').pop()?.split('.').shift()! as BGSpriteName;
			const d = await loadImage(await fs.readFile(basePath + file));
			this._bgSpriteData = d;
			this.bgSpriteList[bgName] = {
				name: bgName,
				border: await getClippedRegionImage(d, 0, 0, 18, 6),
				borderCorner: await getClippedRegionImage(d, 19, 0, 6, 6),
				borderTitle: await getClippedRegionImage(d, 26, 0, 18, 6),
				tabBorderInactive: await getClippedRegionImage(d, 0, 7, 75, 20),
				tabBorderActive: await getClippedRegionImage(d, 0, 45, 75, 20),
				repeatableBg: await getClippedRegionImage(d, 93, 0, 96, 65),
				oddListColor: colors[bgName]
			};
		}

		this.spriteSheetImage = await loadImage(await fs.readFile('./src/lib/resources/images/spritesheet.png'));
		this.spriteSheetData = JSON.parse(
			await fs.readFile('./src/lib/resources/images/spritesheet.json', { encoding: 'utf-8' })
		);
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

				if (img.alternateImages) {
					const images = await Promise.all(
						img.alternateImages.map(async bgId => ({
							id: bgId.id,
							bgId: img.id,
							image: await loadImage(
								await fs.readFile(
									`./src/lib/resources/images/bank_backgrounds/${img.id}_${bgId.id}.${ext}`
								)
							)
						}))
					);
					this.alternateImages.push(...images);
				}

				return {
					...img,
					image: existsSync(bgPath) ? await loadImage(await fs.readFile(bgPath)) : null,
					purpleImage: purplePath
						? existsSync(purplePath)
							? await loadImage(await fs.readFile(purplePath))
							: null
						: null
				};
			})
		);
	}

	async cacheFiles() {
		// Ensure that the icon_cache dir exists.
		await fs.mkdir(CACHE_DIR).catch(() => null);

		// Get a list of all files (images) in the dir.
		const filesInDir = await fs.readdir(CACHE_DIR);

		// For each one, set a cache value that it exists.
		for (const fileName of filesInDir) {
			this.itemIconsList.add(Number.parseInt(path.parse(fileName).name));
		}

		for (const pack of ItemIconPacks) {
			const directories = BOT_TYPE === 'OSB' ? ['osb'] : ['osb', 'bso'];

			for (const dir of directories) {
				const filesInThisDir = await fs.readdir(`./src/lib/resources/images/icon_packs/${pack.id}_${dir}`);
				for (const fileName of filesInThisDir) {
					const themedItemID = Number.parseInt(path.parse(fileName).name);
					const image = await loadImage(
						await fs.readFile(`./src/lib/resources/images/icon_packs/${pack.id}_${dir}/${fileName}`)
					);
					pack.icons.set(themedItemID, image);
				}
			}
		}
	}

	async getItemImage(itemID: number, user?: MUser): Promise<CanvasImage> {
		if (user && user.user.icon_pack_id !== null) {
			for (const pack of ItemIconPacks) {
				if (pack.id === user.user.icon_pack_id) {
					return pack.icons.get(itemID) ?? this.getItemImage(itemID, undefined);
				}
			}
		}

		const cachedImage = this.itemIconImagesCache.get(itemID);
		if (cachedImage) return cachedImage;

		const isOnDisk = this.itemIconsList.has(itemID);
		if (!isOnDisk) {
			await this.fetchAndCacheImage(itemID);
			return this.getItemImage(itemID, user);
		}

		const imageBuffer = await fs.readFile(path.join(CACHE_DIR, `${itemID}.png`));
		try {
			const image = await loadImage(imageBuffer);
			this.itemIconImagesCache.set(itemID, image);
			return image;
		} catch (err) {
			logError(`Failed to load item icon with id: ${itemID}`);
			return this.getItemImage(1);
		}
	}

	async drawItemIDSprite({
		itemID,
		ctx,
		x,
		y,
		outline
	}: {
		itemID: number;
		ctx: CanvasContext;
		x: number;
		y: number;
		outline?: { outlineColor: string; alpha: number };
	}) {
		const data = this.spriteSheetData[itemID];
		const drawOptions = {
			image: this.spriteSheetImage,
			sourceX: -1,
			sourceY: -1,
			sourceWidth: -1,
			sourceHeight: -1,
			destX: -1,
			destY: -1
		};

		if (!data) {
			const image = await this.getItemImage(itemID);
			drawOptions.sourceWidth = image.width;
			drawOptions.sourceHeight = image.height;
			drawOptions.sourceX = 0;
			drawOptions.sourceY = 0;
			drawOptions.image = image;
		} else {
			const [sX, sY, width, height] = data;
			drawOptions.sourceX = sX;
			drawOptions.sourceY = sY;
			drawOptions.sourceWidth = width;
			drawOptions.sourceHeight = height;
		}

		drawOptions.destX = Math.floor(x + (itemSize - drawOptions.sourceWidth) / 2) + 2;
		drawOptions.destY = Math.floor(y + (itemSize - drawOptions.sourceHeight) / 2);

		const args = [
			drawOptions.image,
			drawOptions.sourceX,
			drawOptions.sourceY,
			drawOptions.sourceWidth,
			drawOptions.sourceHeight,
			drawOptions.destX,
			drawOptions.destY,
			drawOptions.sourceWidth,
			drawOptions.sourceHeight
		] as const;

		if (outline) {
			drawImageWithOutline(ctx, ...args);
		} else {
			ctx.drawImage(...args);
		}
	}

	async fetchAndCacheImage(itemID: number) {
		const imageBuffer = await fetch(`https://chisel.weirdgloop.org/static/img/osrs-sprite/${itemID}.png`).then(
			result => result.buffer()
		);

		await fs.writeFile(path.join(CACHE_DIR, `${itemID}.png`), imageBuffer);

		const image = await loadImage(imageBuffer);

		this.itemIconsList.add(itemID);
		this.itemIconImagesCache.set(itemID, image);
	}

	drawBorder(ctx: CanvasContext, sprite: IBgSprite, titleLine = true) {
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

	getBgAndSprite(bankBgId = 1, user?: MUser) {
		const background = this.backgroundImages.find(i => i.id === bankBgId)!;

		const currentContract = user?.farmingContract();
		const isFarmingContractReadyToHarvest = Boolean(
			currentContract?.contract.hasContract &&
				currentContract.matchingPlantedCrop &&
				currentContract.matchingPlantedCrop.ready
		);

		let backgroundImage = background.image!;
		if (bankBgId === 29 && isFarmingContractReadyToHarvest) {
			backgroundImage = this.alternateImages.find(i => i.bgId === 29)!.image;
		}
		if (bankBgId === 30 && isFarmingContractReadyToHarvest) {
			backgroundImage = this.alternateImages.find(i => i.bgId === 30)!.image;
		}

		const hasBgSprite = Boolean(this.bgSpriteList[background.name.toLowerCase()]);
		const bgSprite = hasBgSprite ? this.bgSpriteList[background.name.toLowerCase()] : this.bgSpriteList.default;

		return {
			uniqueSprite: hasBgSprite,
			sprite: bgSprite,
			background,
			backgroundImage
		};
	}

	async drawItems(
		ctx: CanvasContext,
		compact: boolean,
		spacer: number,
		itemsPerRow: number,
		itemWidthSize: number,
		items: [Item, number][],
		flags: FlagMap,
		currentCL: Bank | undefined,
		mahojiFlags: BankFlag[] | undefined,
		weightings: Readonly<ItemBank> | undefined,
		verticalSpacer = 0,
		_user?: MUser
	) {
		// Draw Items
		ctx.textAlign = 'start';
		ctx.fillStyle = '#494034';
		const font = compact ? '14px OSRSFontCompact' : '16px OSRSFontCompact';

		let xLoc = 0;
		let yLoc = compact ? 5 : 0;
		for (let i = 0; i < items.length; i++) {
			if (i % itemsPerRow === 0) yLoc += floor((itemSize + spacer / 2) * (compact ? 0.9 : 1.08)) + verticalSpacer;
			// For some reason, it starts drawing at -2 so we compensate that
			// Adds the border width
			// Adds distance from side
			// 36 + 21 is the itemLength + the space between each item
			xLoc = 2 + 6 + (compact ? 9 : 20) + (i % itemsPerRow) * itemWidthSize;
			const [item, quantity] = items[i];

			const isNewCLItem =
				flags.has('showNewCL') && currentCL && !currentCL.has(item.id) && allCLItems.includes(item.id);

			await this.drawItemIDSprite({
				itemID: item.id,
				ctx,
				x: xLoc,
				y: yLoc,
				outline: isNewCLItem ? { outlineColor: '#ac7fff', alpha: 1 } : undefined
			});

			// Do not draw the item qty if there is 0 of that item in the bank
			if (quantity !== 0) {
				ctx.font = font;
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

			if (flags.has('sv') || mahojiFlags?.includes('show_price')) {
				bottomItemText = item.price * quantity;
			} else if (flags.has('av') || mahojiFlags?.includes('show_alch')) {
				bottomItemText = (item.highalch ?? 0) * quantity;
			} else if (flags.has('id') || mahojiFlags?.includes('show_id')) {
				bottomItemText = item.id.toString();
			} else if (flags.has('names') || mahojiFlags?.includes('show_names')) {
				bottomItemText = item.name;
			} else if (mahojiFlags?.includes('show_weights') && weightings && weightings[item.id]) {
				bottomItemText = weightings[item.id];
			} else if (mahojiFlags?.includes('show_market_price')) {
				bottomItemText = marketPriceOrBotPrice(item.id) * quantity;
			}

			const forcedShortName = forcedShortNameMap.get(item.id);
			if (forcedShortName && !bottomItemText) {
				ctx.font = '10px Smallest Pixel-7';
				bottomItemText = forcedShortName.toUpperCase();
			}

			if (bottomItemText) {
				const text =
					typeof bottomItemText === 'number' ? toKMB(bottomItemText) : bottomItemText.toString().slice(0, 8);
				ctx.fillStyle = 'black';
				fillTextXTimesInCtx(ctx, text, floor(xLoc), yLoc + distanceFromTop);
				ctx.fillStyle =
					typeof bottomItemText === 'string' ? 'white' : generateHexColorForCashStack(bottomItemText);
				fillTextXTimesInCtx(ctx, text, floor(xLoc - 1), yLoc + distanceFromTop - 1);
			}
		}
	}

	async generateBankImage(opts: {
		bank: Bank;
		title?: string;
		showValue?: boolean;
		flags?: Flags;
		user?: MUser;
		collectionLog?: Bank;
		mahojiFlags?: BankFlag[];
	}): Promise<BankImageResult> {
		let { user, collectionLog, title = '', showValue = true } = opts;
		const bank = opts.bank.clone();
		const flags = new Map(Object.entries(opts.flags ?? {}));
		let compact = flags.has('compact');
		const spacer = compact ? 2 : 12;

		const bankBackgroundID = Number(user?.user.bankBackground ?? flags.get('background') ?? 1);
		const rawCL = user?.cl;
		const currentCL: Bank | undefined = collectionLog ?? (rawCL === undefined ? undefined : new Bank(rawCL));

		// Filtering
		const searchQuery = flags.get('search') as string | undefined;
		const filterInput = flags.get('filter');
		const filter = flags.get('search')
			? (filterableTypes.find(type => type.aliases.some(alias => filterInput === alias)) ?? null)
			: null;
		if (filter || searchQuery) {
			for (const [item] of bank.items()) {
				if (
					filter?.items(user!).includes(item.id) ||
					(searchQuery && cleanString(item.name).includes(cleanString(searchQuery)))
				) {
					bank.set(item.id, 0);
				}
			}
		}

		let items = bank.items();

		// Sorting
		const favorites = user?.user.favoriteItems;
		const weightings = user?.user.bank_sort_weightings as ItemBank;
		const perkTier = user ? user.perkTier() : 0;
		const defaultSort: BankSortMethod = perkTier < PerkTier.Two ? 'value' : (user?.bankSortMethod ?? 'value');
		const sortInput = flags.get('sort');
		const sort = sortInput ? (BankSortMethods.find(s => s === sortInput) ?? defaultSort) : defaultSort;

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

		const totalValue = sumArr(items.map(([i, q]) => i.price * q));

		const chunkSize = compact ? 140 : 56;
		const chunked = chunk(items, chunkSize);

		// Get page flag to show the current page, full and showNewCL to avoid showing page n of y
		const page = flags.get('page');
		const noBorder = flags.get('noBorder');
		const wide = flags.get('wide') || opts.mahojiFlags?.includes('wide');
		if (Number(page) >= 0) {
			title += ` - Page ${(Number(page) ? Number(page) : 0) + 1} of ${chunked.length}`;
		}

		const isShowingFullBankImage = wide || flags.has('full') || opts.mahojiFlags?.includes('show_all');

		// Paging
		if (typeof page === 'number' && !isShowingFullBankImage) {
			const pageLoot = chunked[page];
			if (!pageLoot) throw new UserError('You have no items on this page.');
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

		const {
			sprite: bgSprite,
			uniqueSprite: hasBgSprite,
			background: bgImage,
			backgroundImage
		} = this.getBgAndSprite(bankBackgroundID, user);

		const isTransparent = Boolean(bgImage.transparent);

		const isPurple: boolean =
			flags.get('showNewCL') !== undefined &&
			currentCL !== undefined &&
			bank.items().some(([item]) => !currentCL.has(item.id) && allCLItems.includes(item.id));

		const actualBackground = isPurple && bgImage.hasPurple ? bgImage.purpleImage! : backgroundImage;

		const hexColor = user?.user.bank_bg_hex;

		const useSmallBank = user ? (hasBgSprite ? true : user.bitfield.includes(BitField.AlwaysSmallBank)) : true;

		const canvas = createCanvas(width, useSmallBank ? canvasHeight : Math.max(331, canvasHeight));

		let resizeBg = -1;
		if (!wide && !useSmallBank && !isTransparent && actualBackground && canvasHeight > 331) {
			resizeBg = Math.min(1440, canvasHeight) / actualBackground.height;
		}

		const ctx = canvas.getContext('2d');
		ctx.font = '16px OSRSFontCompact';
		ctx.imageSmoothingEnabled = false;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

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
			title += ` (V: ${toKMB(totalValue)} / MV: ${toKMB(marketPriceOfBank(bank))}) `;
		}

		drawTitle(ctx, title, canvas);

		// Skips border if noBorder is set
		if (!isTransparent && noBorder !== 1) {
			this.drawBorder(ctx, bgSprite, bgImage.name === 'Default');
		}

		await this.drawItems(
			ctx,
			compact,
			spacer,
			itemsPerRow,
			itemWidthSize,
			items,
			flags,
			currentCL,
			opts.mahojiFlags,
			weightings,
			undefined,
			user
		);

		const image = await canvasToBuffer(canvas);

		return {
			image,
			isTransparent
		};
	}
}

const chestLootTypes = [
	{
		title: 'Tombs of Amascut',
		chestImage: loadImage('./src/lib/resources/images/toaChest.png'),
		chestImagePurple: loadImage('./src/lib/resources/images/toaChestPurple.png'),
		width: 240,
		height: 220,
		purpleItems: toaPurpleItems,
		position: (canvas: Canvas, image: CanvasImage) => [
			canvas.width - image.width + 25,
			44 + canvas.height / 4 - image.height / 2
		],
		itemRect: [21, 50, 120, 160]
	},
	{
		title: 'Theatre of Blood',
		chestImage: loadImage('./src/lib/resources/images/tobChest.png'),
		chestImagePurple: loadImage('./src/lib/resources/images/tobChestPurple.png'),
		width: 260,
		height: 180,
		purpleItems: TOBUniques,
		position: (canvas: Canvas, image: CanvasImage) => [
			canvas.width - image.width,
			55 + canvas.height / 4 - image.height / 2
		],
		itemRect: [21, 50, 120, 160]
	},
	{
		title: 'Chambers of Xerician',
		chestImage: loadImage('./src/lib/resources/images/cox.png'),
		chestImagePurple: loadImage('./src/lib/resources/images/cox.png'),
		width: 260,
		height: 180,
		purpleItems: resolveItems([
			'Metamorphic dust',
			'Twisted ancestral colour kit',
			"Xeric's guard",
			"Xeric's warrior",
			"Xeric's sentinel",
			"Xeric's general",
			"Xeric's champion",
			'Olmlet',
			'Twisted bow',
			'Elder maul',
			'Kodai insignia',
			'Dragon claws',
			'Ancestral hat',
			'Ancestral robe top',
			'Ancestral robe bottom',
			"Dinh's bulwark",
			'Dexterous prayer scroll',
			'Arcane prayer scroll',
			'Dragon hunter crossbow',
			'Twisted buckler'
		]),
		position: () => [12, 44],
		itemRect: [135, 45, 120, 120]
	}
] as const;

interface CustomText {
	x: number;
	y: number;
	text: string;
}
export async function drawChestLootImage(options: {
	entries: { previousCL: Bank; user: MUser; loot: Bank; customTexts: CustomText[] }[];
	type: (typeof chestLootTypes)[number]['title'];
}) {
	const type = chestLootTypes.find(t => t.title === options.type);
	if (!type) throw new Error(`Invalid chest type: ${options.type}`);

	const canvases: Canvas[] = [];

	let anyoneGotPurple = false;

	for (const { previousCL, loot, user, customTexts } of options.entries) {
		const canvas = createCanvas(type.width, type.height);
		const ctx = canvas.getContext('2d');

		const { sprite } = bankImageGenerator.getBgAndSprite();

		ctx.imageSmoothingEnabled = false;
		ctx.fillStyle = ctx.createPattern(sprite.repeatableBg, 'repeat')!;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		const isPurple: boolean = loot.items().some(([item]) => type.purpleItems.includes(item.id));
		if (isPurple) anyoneGotPurple = true;
		const image = isPurple ? await type.chestImagePurple : await type.chestImage;
		const [x, y] = type.position(canvas, image);
		ctx.drawImage(image, x, y);
		drawTitle(ctx, `${user.rawUsername} (${toKMB(loot.value())})`, canvas);
		ctx.font = '16px OSRSFontCompact';
		bankImageGenerator.drawBorder(ctx, sprite, true);

		const xOffset = 10;
		const yOffset = 45;
		const [iX, iY, iW, iH] = type.itemRect;
		const itemCanvas = createCanvas(iW + xOffset, iH + yOffset);

		await bankImageGenerator.drawItems(
			itemCanvas.getContext('2d'),
			false,
			5,
			2,
			55,
			loot.items(),
			new Map().set('showNewCL', true),
			previousCL,
			undefined,
			undefined,
			5,
			user
		);

		ctx.drawImage(itemCanvas, iX - xOffset, iY - yOffset);

		ctx.fillStyle = '#FFFF00';
		ctx.font = '16px OSRSFontCompact';
		for (const text of customTexts) {
			fillTextXTimesInCtx(ctx, text.text, text.x, text.y);
		}
		canvases.push(canvas);
	}

	const fileName = `${anyoneGotPurple ? 'SPOILER_' : ''}toaloot-${randInt(1, 1000)}.png`;

	if (canvases.length === 1) {
		return new AttachmentBuilder(await canvasToBuffer(canvases[0]), {
			name: fileName
		});
	}
	const spaceBetweenImages = 15;
	const combinedCanvas = createCanvas(
		canvases[0].width * canvases.length + spaceBetweenImages * canvases.length,
		canvases[0].height
	);
	const combinedCtx = combinedCanvas.getContext('2d');
	for (const c of canvases) {
		const index = canvases.indexOf(c);
		combinedCtx.drawImage(c, index * c.width + spaceBetweenImages * index, 0);
	}
	return new AttachmentBuilder(await canvasToBuffer(combinedCanvas), {
		name: fileName
	});
}

declare global {
	var bankImageGenerator: BankImageTask;
}

export const bankImageTask = new BankImageTask();
global.bankImageGenerator = bankImageTask;
