import { formatItemStackQuantity, toTitleCase, generateHexColorForCashStack } from '@oldschoolgg/toolkit';
import { Image, SKRSContext2D, loadImage, Canvas } from '@napi-rs/canvas';
import * as fs from 'fs/promises';
import * as path from 'path';
import { canvasImageFromBuffer, fillTextXTimesInCtx } from './util/canvasUtil';
import getOSItem from './util/getOSItem';
import { logError } from './util/logError';
import fetch from 'node-fetch';

const CACHE_DIR = './icon_cache';

class GeImageTask {
	private geInterface: Image | null = null;
	private geInterfaceCollection: Image | null = null;
	private geSlotLocked: Image | null = null;
	private geSlotOpen: Image | null = null;
	private geSlotActive: Image | null = null;
	private geProgressShadow: Image | null = null;
	private geProgressCollectionShadow: Image | null = null;
	private geCollectionSlot: Image | null = null;
	private geCollectionSlotLocked: Image | null = null;
	//private geSetupOffer: Image | null = null;
	//private geHistoryHeader: Image | null = null;
	//private geHistoryBody: Image | null = null;
	//private geHistoryFooter: Image | null = null;
	private geIconBuy: Image | null = null;
	private geIconSell: Image | null = null;
	//private geIconBuyBig: Image | null = null;
	//private geIconSellBig: Image | null = null;
	//private geIconSellBuyBig: Image | null = null;
	public itemIconsList: Set<number>;
	public itemIconImagesCache: Map<number, Image>;
	public alternateImages: { id: number; geId: number; image: Image }[] = [];

	public constructor() {
		// This tells us simply whether the file exists or not on disk.
		this.itemIconsList = new Set();

		// If this file does exist, it might be cached in this, or need to be read from fs.
		this.itemIconImagesCache = new Map();
	}

	async init() {
		await this.prepare();

		// Init bank sprites

		await this.run();
	}

	async prepare() {

		this.geInterface = await canvasImageFromBuffer(
			await fs.readFile('./src/lib/resources/images/grandexchange/ge_interface.png')
		);
		this.geSlotLocked = await canvasImageFromBuffer(
			await fs.readFile('./src/lib/resources/images/grandexchange/ge_slot_locked.png')
		);
		this.geSlotOpen = await canvasImageFromBuffer(
			await fs.readFile('./src/lib/resources/images/grandexchange/ge_slot_open.png')
		);
		this.geSlotActive = await canvasImageFromBuffer(
			await fs.readFile('./src/lib/resources/images/grandexchange/ge_slot_active.png')
		);
		this.geProgressShadow = await canvasImageFromBuffer(
			await fs.readFile('./src/lib/resources/images/grandexchange/ge_progress_shadow.png')
		);
		this.geProgressCollectionShadow = await canvasImageFromBuffer(
			await fs.readFile('./src/lib/resources/images/grandexchange/ge_shadow_collection_progress.png')
		);
		this.geInterfaceCollection = await canvasImageFromBuffer(
			await fs.readFile('./src/lib/resources/images/grandexchange/ge_interface_collection_box.png')
		);
		this.geIconBuy = await canvasImageFromBuffer(
			await fs.readFile('./src/lib/resources/images/grandexchange/ge_buy_mini_icon.png')
		);
		this.geIconSell = await canvasImageFromBuffer(
			await fs.readFile('./src/lib/resources/images/grandexchange/ge_sell_mini_icon.png')
		);
		/*
		this.geIconBuyBig = await canvasImageFromBuffer(
			await fs.readFile('./src/lib/resources/images/grandexchange/ge_icon_buy_big.png')
		);
		this.geIconSellBig = await canvasImageFromBuffer(
			await fs.readFile('./src/lib/resources/images/grandexchange/ge_icon_sell_big.png')
		);
		this.geIconSellBuyBig = await canvasImageFromBuffer(
			await fs.readFile('./src/lib/resources/images/grandexchange/ge_icon_sellbuy_big.png')
		);
		*/
		this.geCollectionSlot = await canvasImageFromBuffer(
			await fs.readFile('./src/lib/resources/images/grandexchange/ge_slot_collection.png')
		);
		this.geCollectionSlotLocked = await canvasImageFromBuffer(
			await fs.readFile('./src/lib/resources/images/grandexchange/ge_slot_collection_locked.png')
		);
		/*
		this.geSetupOffer = await canvasImageFromBuffer(
			await fs.readFile('./src/lib/resources/images/grandexchange/ge_setup_offer.png')
		);
		this.geHistoryHeader = await canvasImageFromBuffer(
			await fs.readFile('./src/lib/resources/images/grandexchange/ge_history_header.png')
		);
		this.geHistoryBody = await canvasImageFromBuffer(
			await fs.readFile('./src/lib/resources/images/grandexchange/ge_history_body.png')
		);
		this.geHistoryFooter = await canvasImageFromBuffer(
			await fs.readFile('./src/lib/resources/images/grandexchange/ge_history_footer.png')
		);
		*/
	}

	async cacheFiles() {
		// Ensure that the icon_cache dir exists.
		await fs.mkdir(CACHE_DIR).catch(() => null);
		CACHE_DIR
		// Get a list of all files (images) in the dir.
		const filesInDir = await fs.readdir(CACHE_DIR);

		// For each one, set a cache value that it exists.
		for (const fileName of filesInDir) {
			this.itemIconsList.add(parseInt(path.parse(fileName).name));
		}
	}

	drawText(
		ctx: SKRSContext2D,
		text: string,
		x: number,
		y: number,
		maxWidth: number | undefined = undefined,
		lineHeight: number
	) {
		// If max width is set, we have to line break the text
		const textLines = [];
		const measuredText = ctx.measureText(text);
		if (maxWidth && measuredText.width > maxWidth) {
			const explodedText = text.split(' ');
			let newTextLine = '';
			for (const word of explodedText) {
				if (ctx.measureText(`${newTextLine} ${word}`).width >= maxWidth) {
					textLines.push(newTextLine);
					newTextLine = word;
				} else {
					newTextLine += ` ${word}`;
				}
			}
			textLines.push(newTextLine);
		}
		for (const [index, textLine] of (textLines.length ? textLines : [text]).entries()) {
			const textColor = ctx.fillStyle === '#000000' ? '#ff981f' : ctx.fillStyle;
			ctx.fillStyle = '#000000';
			fillTextXTimesInCtx(ctx, textLine.trim(), x + 1, y + lineHeight * index + 1);
			ctx.fillStyle = textColor;
			fillTextXTimesInCtx(ctx, textLine.trim(), x, y + lineHeight * index);
		}
	}

	async getSlotImage(
		ctx: SKRSContext2D,
		slot: number,
		slotData: someData | undefined,
		collection: boolean = false,
		locked: boolean = false
	) {
		const slotImage = collection
			? locked
				? this.geCollectionSlotLocked!
				: this.geCollectionSlot!
			: slotData
			? this.geSlotActive!
			: locked
			? this.geSlotLocked!
			: this.geSlotOpen!;
		ctx.drawImage(slotImage, 0, 0, slotImage.width, slotImage.height);

		if (!collection) {
			// Draw Bank Title
			ctx.textAlign = 'center';
			ctx.font = '16px RuneScape Bold 12';
			let type = slotData ? ` - ${toTitleCase(slotData.type)}` : '';
			this.drawText(
				ctx,
				locked ? 'Locked' : `Slot ${slot}${type}`,
				Math.floor(slotImage.width / 2),
				17,
				undefined,
				10
			);
		}

		if (slotData) {
			let cashImage = await this.getItemImage(995);
			// Get item
			const itemImage = await this.getItemImage(someData.id);

			// Draw item
			ctx.textAlign = 'left';
			ctx.font = '16px OSRSFontCompact';
			ctx.save();
			if (collection) {
				// Draw the small icon
				ctx.translate(81, 15);
				ctx.drawImage(
					itemImage,
					Math.floor((18 - itemImage!.width) / 2) + 2,
					Math.floor((18 - itemImage!.height) / 2),
					18,
					18
				);
				ctx.restore();
				ctx.save();
				ctx.translate(11, 32);
				// First collection slot (item being bought or cash if selling)
				if (slotData.collectionQuantity > 0) {
					ctx.drawImage(
						itemImage,
						Math.floor((32 - itemImage!.width) / 2) + 2,
						Math.floor((32 - itemImage!.height) / 2),
						itemImage!.width,
						itemImage!.height
					); 
					if (slotData.collectionQuantity > 1) {
						const formattedQuantity = formatItemStackQuantity(slotData.collectionQuantity);
						ctx.fillStyle = generateHexColorForCashStack(slotData.collectionQuantity);
						this.drawText(ctx, formattedQuantity, 0, 9, undefined, 10);
					}
				}
				if (slotData.collectionCash > 0) {
					if (slotData.collectionQuantity > 0) {
						ctx.translate(45, 0);
					}
					ctx.drawImage(
						cashImage,
						Math.floor((32 - cashImage!.width) / 2) + 2,
						Math.floor((32 - cashImage!.height) / 2),
						cashImage!.width,
						cashImage!.height
					);
					const formattedQuantity = formatItemStackQuantity(slotData.collectionCash);
					ctx.fillStyle = generateHexColorForCashStack(slotData.collectionCash);
					this.drawText(ctx, formattedQuantity, 0, 9, undefined, 10);
				}
			} else {
				ctx.translate(8, 34);
				ctx.drawImage(
					itemImage,
					Math.floor((32 - itemImage!.width) / 2) + 2,
					Math.floor((32 - itemImage!.height) / 2),
					itemImage!.width,
					itemImage!.height
				);
				if (slotData.quantity > 1) {
					const formattedQuantity = formatItemStackQuantity(slotData.quantity);
					ctx.fillStyle = generateHexColorForCashStack(slotData.quantity);
					this.drawText(ctx, formattedQuantity, 0, 9, undefined, 10);
				} 
				// Draw item name
				ctx.translate(39, 11);
				const itemName = getOSItem(slotData.item).name;
				ctx.fillStyle = '#FFB83F';
				ctx.font = '16px OSRSFontCompact';
				this.drawText(ctx, itemName, 0, 0, ctx.measureText('Elysian spirit').width, 10);
			}
			ctx.restore();

			if (collection) {
				// Draw icon
				const icon = slotData.type === 'sell' ? this.geIconSell! : this.geIconBuy!;
				ctx.save();
				ctx.translate(41, 2);
				ctx.drawImage(
					icon,
					Math.floor((32 - icon!.width) / 2) + 2,
					Math.floor((32 - icon!.height) / 2),
					icon!.width,
					icon!.height
				);
				ctx.restore();
			}

			if (!collection) {
				ctx.save();
				// Draw item value of the transaction
				ctx.translate(0, 87);
				ctx.font = '16px OSRSFontCompact';
				ctx.textAlign = 'center';

				ctx.fillStyle = '#ff981f';
				this.drawText(
					ctx,
					`${Number(slotData.price).toLocaleString()} coins`,
					Math.floor(this.geSlotOpen!.width / 2) + 1,
					17,
					undefined,
					10
				);
				ctx.restore();
			}
			// Draw progress bar
			const progressShadowImage = collection ? this.geProgressCollectionShadow! : this.geProgressShadow!;

			ctx.save();
			if (collection) ctx.translate(9, 9);
			else ctx.translate(5, 75);

			const maxWidth = progressShadowImage.width;
			ctx.fillStyle = '#ff981f';
			let progressWidth = 0;
			if (slotData.status !== GrandExchangeStatus.Canceled) {
				progressWidth = Math.floor((maxWidth * slotData.quantityTraded) / slotData.quantity);
				if (progressWidth === maxWidth) {
					ctx.fillStyle = '#005F00';
				}
			} else {
				ctx.fillStyle = '#8F0000';
				progressWidth = maxWidth;
			}
			// Change color to show that this trade is locked
			if (slotData.limited && ctx.fillStyle === '#ff981f') {
				ctx.fillStyle = '#174972';
			}
			ctx.fillRect(0, 0, progressWidth, progressShadowImage.height);
			ctx.drawImage(progressShadowImage, 0, 0, progressShadowImage.width, progressShadowImage.height);
			// Draw locked text
			if (!collection && slotData.limited && ctx.fillStyle === '#174972') {
				ctx.textAlign = 'center';
				ctx.fillStyle = '#FFB83F';
				this.drawText(
					ctx,
					`Limited${!slotData.limitedUnlock ? '!' : ` ${this.formatDuration(slotData.limitedUnlock)}`}`,
					Math.floor(this.geSlotOpen!.width / 2) - 3,
					11,
					undefined,
					10
				);
			}
			ctx.restore();
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

	async fetchAndCacheImage(itemID: number) {
		const imageBuffer = await fetch(`https://chisel.weirdgloop.org/static/img/osrs-sprite/${itemID}.png`).then(
			result => result.buffer()
		);

		await fs.writeFile(path.join(CACHE_DIR, `${itemID}.png`), imageBuffer);

		const image = await loadImage(imageBuffer);

		this.itemIconsList.add(itemID);
		this.itemIconImagesCache.set(itemID, image);
	}

	async createInterface(opts: {
		title?: string;
		user: MUser;
		collection: boolean;
		}): Promise<Buffer> {
		let { user, collection, title = ''} = opts;
		const userAvailableSlots = this.getUserAvailableSlots(msg);
		const canvasImage = collection ? this.geInterfaceCollection! : this.geInterface!;

		const canvas = new Canvas(canvasImage.width, canvasImage.height);
		const ctx = canvas.getContext('2d');
		ctx.font = '16px OSRSFontCompact';
		ctx.imageSmoothingEnabled = false;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(canvasImage, 0, 0, canvas.width, canvas.height);
		if (collection) ctx.translate(15, 44);
		else ctx.translate(9, 64);
		let y = 0;
		let x = 0;
		for (let i = 0; i < 8; i++) {
			if (i > 0 && i % 4 === 0) {
				y += (collection ? this.geCollectionSlot!.height : this.geSlotOpen!.height) + 10;
				x = 0;
			}
			ctx.save();
			ctx.translate(x * (collection ? this.geCollectionSlot!.width + 10 : this.geSlotOpen!.width + 2), y);
			await this.getSlotImage(
				ctx,
				i + 1,
				slots.find(s => s.slot === i + 1),
				collection,
				!userAvailableSlots.includes(i + 1)
			);
			ctx.restore();
			x++;
		}
		const image = await canvas.encode('png');

		return image;
	}

	/*
	async createHistoryInterface(items: historyInterface[]): Promise<Buffer> {
		const repeaterLength = items.length > 0 ? items.length : 1;

		const canvasHeader = this.geHistoryHeader!;
		const canvasBody = this.geHistoryBody!;
		const canvasFooter = this.geHistoryFooter!;

		const canvasHeight = canvasHeader!.height + canvasFooter!.height + repeaterLength * canvasBody!.height;
		const canvas = new Canvas(canvasHeader.width, canvasHeight);
		const ctx = canvas.getContext('2d');
		ctx.font = '16px OSRSFontCompact';
		ctx.imageSmoothingEnabled = false;
		ctx.clearRect(0, 0, canvas.width, canvasHeight);

		// Draw background
		// Draw header
		ctx.drawImage(canvasHeader, 0, 0, canvasHeader.width, canvasHeader.height);
		// Draw body
		ctx.fillStyle = ctx.createPattern(canvasBody, 'repeat');
		ctx.fillRect(0, canvasHeader.height, canvas.width, canvas.height);
		// Draw footer
		ctx.drawImage(
			canvasFooter,
			0,
			canvasHeader.height + repeaterLength * canvasBody.height,
			canvasFooter.width,
			canvasFooter.height
		);

		// Draw first item
		ctx.translate(11, canvasHeader.height);
		ctx.save();
		for (const [index, item] of items.entries()) {
			// Draw transparency background for this row
			ctx.fillStyle = `rgba(255, 255, 255, ${index % 2 === 0 ? '0.06' : '0.03'})`;
			ctx.fillRect(0, index * canvasBody.height, canvas.width - 22, canvasBody.height);

			// Draw item name
			ctx.save();
			ctx.translate(159, index * canvasBody.height + 22);
			ctx.font = '16px OSRSFontCompact';
			ctx.textAlign = 'center';
			ctx.fillStyle = '#FFB83F';
			this.drawText(ctx, `${item.item.name}`, 0, 1, undefined, 10);
			ctx.restore();

			// Get item image
			const itemImage = await this.getItemImage(item.id);

			// Draw item
			ctx.save();
			ctx.translate(261, index * canvasBody.height + 3);
			ctx.drawImage(
				itemImage,
				Math.floor((32 - itemImage!.width) / 2) + 2,
				Math.floor((32 - itemImage!.height) / 2),
				itemImage!.width,
				itemImage!.height
			);
			if (item.qty > 1) {
				ctx.fillStyle = generateHexColorForCashStack(item.qty);
				this.drawText(ctx, `${item.server ? '' : item.qty.toLocaleString()}`, -1, 9, undefined, 10);
			}
			ctx.restore();

			// Total value of the history
			ctx.save();
			ctx.translate(canvasBody.width - 28, index * canvasBody.height + 15);
			ctx.textAlign = 'right';
			if (!item.server && item.qty > 1) {
				ctx.fillStyle = generateHexColorForCashStack(item.price * item.qty);
				this.drawText(ctx, `${(item.price * item.qty).toLocaleString()} GP`, 0, 2, undefined, 10);
				ctx.fillStyle = generateHexColorForCashStack(item.price);
				this.drawText(ctx, `${item.price.toLocaleString()} GP each`, 0, 16, undefined, 10);
			} else {
				ctx.fillStyle = generateHexColorForCashStack(item.price);
				this.drawText(ctx, `${item.price.toLocaleString()} GP`, 0, 10, undefined, 10);
			}
			ctx.restore();

			// Draw type icon + type text
			ctx.save();
			ctx.translate(2, index * canvasBody.height + 3);
			const icon = item.server
				? this.geIconSellBuyBig!
				: item.type === GrandExchangeType.Buy
				? this.geIconBuyBig!
				: this.geIconSellBig!;
			ctx.drawImage(
				icon,
				Math.floor((32 - icon!.width) / 2) + 2,
				Math.floor((32 - icon!.height) / 2),
				icon!.width,
				icon!.height
			);
			ctx.fillStyle = item.type === GrandExchangeType.Buy ? '#B2C803' : '#C66903';
			this.drawText(
				ctx,
				`${item.server ? '' : item.type === GrandExchangeType.Buy ? 'Bought' : 'Sold'}`,
				40,
				20,
				undefined,
				10
			);
			ctx.restore();
		}

		const image = await canvas.encode('png');

		return image;
	}

	async createSetupOfferImage(item: Item, quantity: number, price: number, median: number, type: GrandExchangeType): Promise<Buffer> {
		const canvasImage = this.geSetupOffer!;
		const canvas = new Canvas(canvasImage.width, canvasImage.height);
		const ctx = canvas.getContext('2d');
		ctx.font = '16px OSRSFontCompact';
		ctx.imageSmoothingEnabled = false;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(canvasImage, 0, 0, canvas.width, canvas.height);
		// Get item image
		const itemImage = await this.getItemImage(item.id);

		// Draw item image
		ctx.save();
		ctx.translate(80, 73);
		ctx.drawImage(
			itemImage,
			Math.floor((32 - itemImage!.width) / 2) + 2,
			Math.floor((32 - itemImage!.height) / 2),
			itemImage!.width,
			itemImage!.height
		);
		ctx.restore();

		// Draw item name
		ctx.save();
		ctx.translate(181, 57);
		ctx.font = '16px RuneScape Bold 12';
		ctx.textAlign = 'left';
		ctx.fillStyle = '#FF981F';
		this.drawText(ctx, `${item.name}`, 0, 0, undefined, 10);
		ctx.restore();

		// Draw item description
		ctx.save();
		ctx.translate(182, 71);
		ctx.textAlign = 'left';
		ctx.fillStyle = '#FFB83F';
		this.drawText(ctx, `${item.examine}`, 0, 0, 270, 11);
		ctx.restore();

		// Draw unit price
		ctx.save();
		ctx.translate(311, 173);
		ctx.textAlign = 'center';
		ctx.font = '16px RuneScape Bold 12';
		ctx.fillStyle = generateHexColorForCashStack(price);
		this.drawText(ctx, `${price.toLocaleString()} coins`, 42, 0, undefined, 11);
		ctx.restore();

		// Draw qty
		ctx.save();
		ctx.translate(131, 173);
		ctx.textAlign = 'center';
		ctx.font = '16px RuneScape Bold 12';
		ctx.fillStyle = '#FFB83F';
		this.drawText(ctx, `${quantity.toLocaleString()}`, 0, 0, undefined, 11);
		ctx.restore();

		// Draw total price
		ctx.save();
		ctx.translate(242, 220);
		ctx.textAlign = 'center';
		ctx.font = '16px RuneScape Bold 12';
		ctx.fillStyle = generateHexColorForCashStack(price * quantity);
		this.drawText(ctx, `${(price * quantity).toLocaleString()} coins`, 0, 0, undefined, 11);
		ctx.restore();

		// Draw median price
		ctx.save();
		ctx.translate(85, 124);
		ctx.textAlign = 'left';
		ctx.fillStyle = '#FFB83F';
		this.drawText(ctx, `${Math.floor(median).toLocaleString()} coins`, 0, 0, undefined, 11);
		ctx.restore();

		// Draw of offer
		ctx.save();
		ctx.translate(96, 59);
		ctx.font = '16px RuneScape Bold 12';
		ctx.textAlign = 'center';
		ctx.fillStyle = '#FF981F';
		this.drawText(ctx, `${toTitleCase(type)} offer`, 0, 0, undefined, 11);
		ctx.restore();

		// Draw offer icon
		ctx.save();
		ctx.translate(135, 38);
		const icon = type === 'sell' ? this.geIconSell! : this.geIconBuy!;
		ctx.drawImage(
			icon,
			Math.floor((32 - icon!.width) / 2) + 2,
			Math.floor((32 - icon!.height) / 2),
			icon!.width,
			icon!.height
		);
		ctx.restore();

		const image = await canvas.encode('png');

		return image;
	}
	*/

	formatDuration(ms: number) {
		if (ms < 0) ms = -ms;
		const time = {
			d: Math.floor(ms / 86400000),
			h: Math.floor(ms / 3600000) % 24,
			m: Math.floor(ms / 60000) % 60,
			s: Math.floor(ms / 1000) % 60
		};
		let nums = Object.entries(time).filter(val => val[1] !== 0);
		if (!time.m || time.m < 1) return '< 1m';
		return nums.map(([key, val]) => `${val}${key}`).join('');
	}

	async run() {
		await this.cacheFiles();
	}
}

declare global {
	const geImageGenerator: GeImageTask;
}
declare global {
	namespace NodeJS {
		interface Global {
			geImageGenerator: GeImageTask;
		}
	}
}
global.geImageGenerator = new GeImageTask();
geImageGenerator.init();