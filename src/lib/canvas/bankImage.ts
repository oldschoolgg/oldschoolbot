import { existsSync } from 'node:fs';
import * as fs from 'node:fs/promises';
import { generateHexColorForCashStack } from '@oldschoolgg/toolkit/runescape';
import { cleanString } from '@oldschoolgg/toolkit/string-util';
import { UserError } from '@oldschoolgg/toolkit/structures';
import { chunk, sumArr } from 'e';
import { Bank, type Item, type ItemBank, itemID, toKMB } from 'oldschooljs';
import { loadImage } from 'skia-canvas';

import { XPLamps } from '../../mahoji/lib/abstracted_commands/lampCommand.js';
import { BitField, PerkTier } from '../constants.js';
import { allCLItems } from '../data/Collections.js';
import { filterableTypes } from '../data/filterables.js';
import { marketPriceOfBank, marketPriceOrBotPrice } from '../marketPrices.js';
import backgroundImages, { type BankBackground } from '../minions/data/bankBackgrounds.js';
import type { FlagMap, Flags } from '../minions/types.js';
import { type BankSortMethod, BankSortMethods, sorts } from '../sorts.js';
import { OSRSCanvas } from './OSRSCanvas.js';
import { type BGSpriteName, type BaseCanvasArgs, CanvasImage, type IBgSprite, getClippedRegion } from './canvasUtil.js';

interface BankImageResult {
	image: Buffer;
	isTransparent: boolean;
}

const itemSize = 32;
const distanceFromTop = 32;

const { floor, ceil } = Math;

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
	[i('Huasca seed'), 'huas'],
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
	[i('Huasca'), 'huas'],
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
	[i('Grimy huasca'), 'huas'],
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
	[i('Huasca potion (unf)'), 'huas'],
	[i('Lantadyme potion (unf)'), 'lanta'],
	[i('Marrentill potion (unf)'), 'marren'],
	[i('Ranarr potion (unf)'), 'ranarr'],
	[i('Snapdragon potion (unf)'), 'snap'],
	[i('Tarromin potion (unf)'), 'tarro'],
	[i('Toadflax potion (unf)'), 'toad'],
	[i('Torstol potion (unf)'), 'torstol'],
	[i('Huasca potion (unf)'), 'huasca'],

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

class BankImageTask {
	public backgroundImages: BankBackground[] = [];
	public alternateImages: { id: number; bgId: number; image: CanvasImage }[] = [];

	public _bgSpriteData: CanvasImage = new CanvasImage();
	public bgSpriteList: Record<string, IBgSprite> = {};
	public treeImage!: CanvasImage;
	public ready!: Promise<void>;

	public constructor() {
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
				border: getClippedRegion(d, 0, 0, 18, 6),
				borderCorner: getClippedRegion(d, 19, 0, 6, 6),
				borderTitle: getClippedRegion(d, 26, 0, 18, 6),
				tabBorderInactive: getClippedRegion(d, 0, 7, 75, 20),
				tabBorderActive: getClippedRegion(d, 0, 45, 75, 20),
				repeatableBg: getClippedRegion(d, 93, 0, 96, 65),
				oddListColor: colors[bgName]
			};
		}
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

	getBgAndSprite({ bankBackgroundId, farmingContract }: BaseCanvasArgs = {}) {
		const background = this.backgroundImages.find(i => i.id === bankBackgroundId) ?? this.backgroundImages[0];

		const isFarmingContractReadyToHarvest = Boolean(
			farmingContract?.contract.hasContract &&
				farmingContract.matchingPlantedCrop &&
				farmingContract.matchingPlantedCrop.ready
		);

		let backgroundImage = background.image!;
		if (bankBackgroundId === 29 && isFarmingContractReadyToHarvest) {
			backgroundImage = this.alternateImages.find(i => i.bgId === 29)!.image;
		}
		if (bankBackgroundId === 30 && isFarmingContractReadyToHarvest) {
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
		c: OSRSCanvas,
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

			await c.drawItemIDSprite({
				itemID: item.id,
				x: xLoc,
				y: yLoc,
				outline: isNewCLItem ? { outlineColor: '#ac7fff', alpha: 1 } : undefined,
				quantity,
				textColor: isNewCLItem ? OSRSCanvas.COLORS.PURPLE : undefined
			});

			let bottomItemText: string | number | null = null;

			if (flags.has('sv') || mahojiFlags?.includes('show_price')) {
				bottomItemText = (item.price ?? 0) * quantity;
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
				bottomItemText = forcedShortName.toUpperCase();
			}

			if (bottomItemText) {
				const text =
					typeof bottomItemText === 'number' ? toKMB(bottomItemText) : bottomItemText.toString().slice(0, 8);
				c.drawText({
					text,
					x: floor(xLoc - 1),
					y: yLoc + distanceFromTop - 1,
					color: typeof bottomItemText === 'string' ? 'white' : generateHexColorForCashStack(bottomItemText),
					font: forcedShortName ? 'TinyPixel' : 'Compact'
				});
			}
		}
	}

	async generateBankImage(
		opts: {
			bank: Bank;
			title?: string;
			showValue?: boolean;
			flags?: Flags;
			user?: MUser;
			collectionLog?: Bank;
			mahojiFlags?: BankFlag[];
		} & BaseCanvasArgs
	): Promise<BankImageResult> {
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

		const totalValue = sumArr(items.map(([i, q]) => (i.price ? i.price * q : 0)));

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
		} = this.getBgAndSprite({ ...opts, bankBackgroundId: bankBackgroundID });

		const isTransparent = Boolean(bgImage.transparent);

		const isPurple: boolean =
			flags.get('showNewCL') !== undefined &&
			currentCL !== undefined &&
			items.some(([item]) => !currentCL.has(item.id) && allCLItems.includes(item.id));

		const useSmallBank = user ? (hasBgSprite ? true : user.bitfield.includes(BitField.AlwaysSmallBank)) : true;

		const canvas = new OSRSCanvas({
			width,
			height: useSmallBank ? canvasHeight : Math.max(331, canvasHeight),
			sprite: bgSprite,
			iconPackId: opts.iconPackId ?? user?.iconPackId
		});

		const actualBackground = isPurple && bgImage.hasPurple ? bgImage.purpleImage! : backgroundImage;
		let resizeBg = -1;
		if (!wide && !useSmallBank && !isTransparent && actualBackground && canvasHeight > 331) {
			resizeBg = Math.min(1440, canvasHeight) / actualBackground.height;
		}

		const ctx = canvas.ctx;

		if (!isTransparent) {
			ctx.fillStyle = ctx.createPattern(bgSprite.repeatableBg, 'repeat')!;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		}

		const hexColor = user?.user.bank_bg_hex;
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

		canvas.drawTitleText({
			text: title,
			x: canvas.width / 2,
			y: 21,
			center: true
		});

		// Skips border if noBorder is set
		if (!isTransparent && noBorder !== 1) {
			canvas.drawBorder(bgSprite, bgImage.name === 'Default');
		}

		await this.drawItems(
			canvas,
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

		const image = await canvas.toScaledOutput(2);

		return {
			image,
			isTransparent
		};
	}
}

export const bankImageTask = new BankImageTask();
