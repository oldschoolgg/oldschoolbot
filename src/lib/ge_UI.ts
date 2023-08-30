import { Image, SKRSContext2D } from '@napi-rs/canvas';
import * as fs from 'fs/promises';
import * as path from 'path';
import { canvasImageFromBuffer, fillTextXTimesInCtx } from './util/canvasUtil';

interface grandExchangeSlotsInterface {
	id: number;
}

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
	private geSetupOffer: Image | null = null;
	private geHistoryHeader: Image | null = null;
	private geHistoryBody: Image | null = null;
	private geHistoryFooter: Image | null = null;
	private geIconBuy: Image | null = null;
	private geIconSell: Image | null = null;
	private geIconBuyBig: Image | null = null;
	private geIconSellBig: Image | null = null;
	private geIconSellBuyBig: Image | null = null;
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
		this.geIconBuyBig = await canvasImageFromBuffer(
			await fs.readFile('./src/lib/resources/images/grandexchange/ge_icon_buy_big.png')
		);
		this.geIconSellBig = await canvasImageFromBuffer(
			await fs.readFile('./src/lib/resources/images/grandexchange/ge_icon_sell_big.png')
		);
		this.geIconSellBuyBig = await canvasImageFromBuffer(
			await fs.readFile('./src/lib/resources/images/grandexchange/ge_icon_sellbuy_big.png')
		);
		this.geCollectionSlot = await canvasImageFromBuffer(
			await fs.readFile('./src/lib/resources/images/grandexchange/ge_slot_collection.png')
		);
		this.geCollectionSlotLocked = await canvasImageFromBuffer(
			await fs.readFile('./src/lib/resources/images/grandexchange/ge_slot_collection_locked.png')
		);
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
		ctx: CanvasRenderingContext2D,
		slot: number,
		slotData: number | undefined,
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
			let cashImage: Image | undefined = undefined;
			// Get item
			const itemImage = await this.client.tasks
				.get('bankImage')!
				.getItemImage(slotData.item, slotData?.quantity)
				.catch(() => {
					console.error(`Failed to load item image for item with id: ${slotData.item}`);
				});
			if (!itemImage) {
				this.client.emit(Events.Warn, `Item with ID[${slotData.item}] has no item image.`);
			}
			if (collection && slotData.collectionCash) {
				// Get cash
				cashImage = await this.client.tasks.get('bankImage')!.getItemImage(995, slotData.collectionCash);
				if (!cashImage) {
					this.client.emit(Events.Warn, 'Item with ID[995] has no item image.');
				}
			}
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

	async createInterface(msg: KlasaMessage, slots: GrandExchangeTable[], collection: boolean = false) {
		const userAvailableSlots = this.getUserAvailableSlots(msg);
		const canvasImage = collection ? this.geInterfaceCollection! : this.geInterface!;
		const canvas = createCanvas(canvasImage.width, canvasImage.height);
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
		return canvasToBufferAsync(canvas, 'image/png');
	}

	async createHistoryInterface(items: historyInterface[]) {
		const repeaterLength = items.length > 0 ? items.length : 1;

		const canvasHeader = this.geHistoryHeader!;
		const canvasBody = this.geHistoryBody!;
		const canvasFooter = this.geHistoryFooter!;

		const canvasHeight = canvasHeader!.height + canvasFooter!.height + repeaterLength * canvasBody!.height;

		const canvas = createCanvas(canvasHeader.width, canvasHeight);
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
			const itemImage = await this.client.tasks
				.get('bankImage')!
				.getItemImage(item.item.id, item.qty)
				.catch(() => {
					console.error(`Failed to load item image for item with id: ${item.item.id}`);
				});
			if (!itemImage) {
				this.client.emit(Events.Warn, `Item with ID[${item.item.id}] has no item image.`);
			}

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
		return canvasToBufferAsync(canvas, 'image/png');
	}

	async createSetupOfferImage(item: Item, quantity: number, price: number, median: number, type: GrandExchangeType) {
		const canvasImage = this.geSetupOffer!;
		const canvas = createCanvas(canvasImage.width, canvasImage.height);
		const ctx = canvas.getContext('2d');
		ctx.font = '16px OSRSFontCompact';
		ctx.imageSmoothingEnabled = false;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(canvasImage, 0, 0, canvas.width, canvas.height);
		// Get item image
		const itemImage = await this.client.tasks
			.get('bankImage')!
			.getItemImage(item.id, quantity)
			.catch(() => {
				console.error(`Failed to load item image for item with id: ${item.id}`);
			});
		if (!itemImage) {
			this.client.emit(Events.Warn, `Item with ID[${item.id}] has no item image.`);
		}

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

		return canvasToBufferAsync(canvas, 'image/png');
	}

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

	async slots(msg: KlasaMessage, [cmd]: [string]) {
		const userSlots = await GrandExchangeTable.find({
			where: [
				{
					userID: msg.author.id,
					status: In([
						GrandExchangeStatus.Completed,
						GrandExchangeStatus.Canceled,
						GrandExchangeStatus.Notified,
						GrandExchangeStatus.Running
					])
				}
			]
		});

		// Get user limits on the slot items
		for (const s of userSlots) {
			// Prevents already limited items from re-calculating
			if (s.type === 'buy' && !s.limited) {
				const result = await getConnection().query('select * from grandexchangeuseritemlimit($1, $2)', [
					msg.author.id,
					s.item
				]);
				s.limited = result[0].trade_limit === 0;
				if (s.limited) {
					const tempDate = new Date(result[0].date_oldest_trade);
					tempDate.setHours(tempDate.getHours() + 4);
					s.limitedUnlock = tempDate.valueOf() - new Date().valueOf();
				}
				// Update other slots to avoid doing this for the same item multiple times
				userSlots.forEach(ss => {
					if (ss.type === 'buy' && ss.item === s.item && ss.id !== s.id) {
						ss.limited = s.limited;
						ss.limitedUnlock = s.limitedUnlock;
					}
				});
			}
		}

		let clerkMessage: string | false = 'Here you go! These are the status of all your slots.';
		let clerkOption = {};
		let collectView = false;

		if (cmd) {
			switch (cmd) {
				case 'collect':
				case 'cancel': {
					collectView = true;

					const filteredUserSlots = userSlots.filter(s => {
						if (cmd === 'collect' && s.collectionCash === 0 && s.collectionQuantity === 0) {
							return false;
						} else if (
							cmd === 'cancel' &&
							[GrandExchangeStatus.Completed, GrandExchangeStatus.Notified].includes(s.status)
						) {
							return false;
						}
						return true;
					});

					const selectOptions = filteredUserSlots.map(s => {
						return {
							label: `Slot ${s.slot} - ${toTitleCase(s.type)}`,
							value: `${s.id}`,
							description: `${toTitleCase(s.type)}ing ${s.quantity.toLocaleString()}x ${
								getOSItem(s.item).name
							}, ${(s.quantity - s.quantityTraded).toLocaleString()}x left.`
						};
					});

					if (filteredUserSlots.length === 0) {
						clerkMessage = `I am sorry, but you have no available slots to ${
							cmd === 'collect' ? 'collect' : 'cancel'
						} at the moment.`;
					} else {
						clerkMessage = `Please, select the slot/slots you want to ${
							cmd === 'collect' ? 'collect' : 'cancel'
						} from the list below.`;
						clerkOption = {
							components: [
								[
									new MessageSelectMenu({
										type: 3,
										customID: 'slotSelect',
										options: selectOptions,
										placeholder: 'Select a slot...',
										maxValues: filteredUserSlots.length,
										minValues: 1
									})
								]
							]
						};
					}
					break;
				}
				case 'cbox':
				case 'collection box':
				case 'collectionbox': {
					collectView = true;
					break;
				}
			}
		}

		const messageFiles = [];
		if (clerkMessage) {
			messageFiles.push(
				await chatHeadImage({
					content: clerkMessage,
					head: 'geClerk'
				})
			);
		}
		messageFiles.push(
			new MessageAttachment(
				await this.createInterface(msg, userSlots, collectView),
				`${msg.author.id}_GrandExchange_Slots_${new Date().toLocaleString()}.png`
			)
		);

		const messageOptions = {
			...clerkOption,
			files: messageFiles
		};

		const message = await msg.channel.send(messageOptions);

		let selectedSlots: string[] = [];

		if (Object.keys(clerkOption).length > 0) {
			try {
				const selection = await message.awaitMessageComponentInteraction({
					filter: i => {
						if (i.user.id !== msg.author.id) {
							i.reply({
								ephemeral: true,
								// This should NEVER be displayed, ever, as we force any GE transaction to be made
								// via DMs, so, just a funny safeguard.
								content: 'What? How did you... THIEF! GUARDS! GUARDS! We have an intruder!'
							});
							return false;
						}
						return true;
					},
					time: Time.Second * 15
				});
				if (selection.customID === 'slotSelect') {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					selectedSlots = selection.values;
					await message.delete();
				}
			} catch (e) {
				await message.delete();
				await this.clerkChat(
					msg,
					'I am sorry, I got other people to attend. When you are ready to do some business, talk with me again.'
				);
				throw new Error(SILENT_ERROR);
			}

			const slots = selectedSlots.map(ss => {
				return userSlots.find(s => {
					return Number(s.id) === Number(ss);
				})!;
			});

			switch (cmd) {
				case 'cancel': {
					return this.cancelSlot(msg, slots);
				}
				case 'collect': {
					return this.collectSlot(msg, slots);
				}
			}
		}
		return message;
	}

	async run() {
		await this.cacheFiles();


		if (!cmd) {
			return this.slots(msg, ['slots']);
		}

		const explodedCmd = cmd.split(' ');

		const baseCmd = explodedCmd[0];

		if (baseCmd) {
			switch (baseCmd) {
				case 'help': {
					return this.help(msg);
				}
				case 'collect': {
					return this.slots(msg, ['collect']);
				}
				case 'cancel': {
					return this.slots(msg, ['cancel']);
				}
				case 'cbox':
				case 'box': {
					return this.slots(msg, ['cbox']);
				}
				case 'history': {
					explodedCmd.shift();
					const searchOptions = <FindManyOptions<GrandExchangeHistoryTable>>{};
					let mine: string | undefined = explodedCmd.shift() ?? '';
					const type = ['mine', 'my'].includes(mine) ? explodedCmd.shift() ?? '' : mine;
					if (type === mine) mine = undefined;
					let item = explodedCmd.join(' ') ?? '';
					const whereOptions = <FindConditions<GrandExchangeHistoryTable>>{};

					if (type === GrandExchangeType.Sell) {
						if (mine) whereOptions.userSold = msg.author.id;
					} else if (type === GrandExchangeType.Buy) {
						if (mine) whereOptions.userBought = msg.author.id;
					} else {
						item = `${type} ${item}`;
					}
					item = item.trim();
					if (item) {
						const historyItem = getOSItem(item);
						if (historyItem) {
							whereOptions.item = historyItem.id;
						}
					}

					if (!type && !item && (!mine || mine === 'mine')) {
						mine = 'mine';
						searchOptions.where = [{ userBought: msg.author.id }, { userSold: msg.author.id }];
					} else {
						searchOptions.where = whereOptions;
					}
					searchOptions.order = {
						dateTransaction: 'DESC'
					};
					searchOptions.take = 15;
					const historyItems: historyInterface[] = (await GrandExchangeHistoryTable.find(searchOptions)).map(
						h => {
							return {
								item: getOSItem(h.item),
								price: h.price,
								type: h.userBought === msg.author.id ? GrandExchangeType.Buy : GrandExchangeType.Sell,
								qty: h.quantity,
								server: mine !== 'mine'
							};
						}
					);
					if (historyItems.length > 0) {
						return msg.channel.send({
							files: [
								await chatHeadImage({
									content: `Here are ${
										mine === 'mine' ? 'your' : 'the server'
									} latest transaction history...`,
									head: 'geClerk'
								}),
								new MessageAttachment(await this.createHistoryInterface(historyItems), 'test.png')
							]
						});
					}
					return this.clerkChat(
						msg,
						'I am sorry, but there is nothing to show using your search criteria. Please, try again.'
					);
				}
			}
		}
		console.log(explodedCmd);
		if (explodedCmd.length < 4) {
			return this.invalidCommand(msg);
		}

		// Get price per item
		const itemPrice = fromKMB(explodedCmd.pop()!);
		const type = explodedCmd.shift();
		const quantity = fromKMB(explodedCmd.shift()!);
		const item = explodedCmd.join(' ');
		let itemArray: Item[] = [];

		if (isNaN(itemPrice + quantity) || (type !== GrandExchangeType.Buy && type !== GrandExchangeType.Sell)) {
			return this.invalidCommand(msg);
		}

		const slotsInUse = await GrandExchangeTable.find({
			where: {
				userID: msg.author.id,
				slot: Between(1, 8),
				status: Not(GrandExchangeStatus.Cleared)
			}
		});

		let slot = 0;
		const userPerkTier = getUsersPerkTier(msg.author);
		for (const userSlot of grandExchangeSlots) {
			if (slotsInUse.some(s => s.slot === userSlot.id)) continue;
			if (userSlot.requirements) {
				if (userPerkTier < userSlot.requirements) {
					continue;
				}
			}
			slot = userSlot.id;
			break;
		}

		if (!slot || slot === 0) {
			return this.clerkChat(
				msg,
				`You dont have any free trading slot to use. Please, check ${prefix}ge to collect/cancel your active slots.`
			);
		}

		try {
			let itemCheck = item;
			const parsed = Number(item);
			if (!isNaN(parsed)) {
				itemCheck = getOSItem(parsed)?.name;
			}
			itemArray = Items.filter(
				i =>
					i.tradeable_on_ge &&
					(itemNameMap.get(cleanString(itemCheck)) === i.id || stringMatches(i.name, itemCheck))
			).array() as Item[];
		} catch (e) {}

		if (!itemArray.length) {
			return this.clerkChat(
				msg,
				`I am sorry sir, but I could not find any item with the name or ID ${item}. It either doesn't exists or it is not tradeable.`
			);
		}

		let selectedItem = <Item>{};
		const totalPrice = quantity * itemPrice;
		let channelMessage: KlasaMessage | undefined = undefined;

		if (type === 'sell') {
			// Check if the user has the item in bank
			const userBank = msg.author.bank();
			const osItem = itemArray.find(i => userBank.bank[i.id]);
			if (!osItem) {
				return msg.channel.send("You don't have any of this item to sell!");
			}
			if (userBank.amount(osItem.id) < quantity) {
				return msg.channel.send(
					`You don't have ${quantity.toLocaleString()}x ${osItem.name} [ID: ${
						osItem.id
					}] to to sell. You only have ${userBank
						.amount(osItem.id)
						.toLocaleString()} of this item in your bank.`
				);
			}
			selectedItem = osItem;
		} else {
			// Filter item array to only include tradeable items
			itemArray = itemArray.filter(i => i.tradeable_on_ge);

			if (itemArray.length === 0) {
				return msg.channel.send("Sorry, this is not tradeable item. We can't trade those.");
			}

			if (msg.author.bank({ withGP: true }).amount(995) < totalPrice) {
				return msg.channel.send(
					`You don't have enought GP for this transaction. You need ${totalPrice.toLocaleString()} GP to buy this item for the price informed.`
				);
			}

			if (itemArray.length > 1) {
				channelMessage = await this.clerkChat(
					msg,
					'I am sorry sir, but I found too many items with the name you typed. Could you select the correct one in the list below?',
					{
						components: [
							[
								new MessageSelectMenu({
									type: 3,
									customID: 'itemSelect',
									options: itemArray
										.filter(i => i.tradeable_on_ge)
										.map(i => {
											return {
												label: `${i.name.length > 25 ? `${i.name.substr(0, 22)}...` : i.name}`,
												value: String(i.id),
												description: `[ID: ${i.id}] ${i.examine}`
											};
										}),
									placeholder: 'Select an item...',
									maxValues: 1,
									minValues: 1
								})
							]
						]
					}
				);

				try {
					const selection = await channelMessage.awaitMessageComponentInteraction({
						filter: i => {
							if (i.user.id !== msg.author.id) {
								i.reply({
									ephemeral: true,
									// This should NEVER be displayed, ever, as we force any GE transaction to be made
									// via DMs, so, just a funny safeguard.
									content: 'What? How did you... THIEF! GUARDS! GUARDS! We have an intruder!'
								});
								return false;
							}
							return true;
						},
						time: Time.Second * 15
					});
					if (selection.customID === 'itemSelect') {
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore
						selectedItem = getOSItem(selection.values.pop());
						await channelMessage.delete();
					}
				} catch {
					await channelMessage.delete();
					await this.clerkChat(
						msg,
						'I am sorry, I got other people to attend. When you are ready to do some business, talk with me again.'
					);
					throw new Error(SILENT_ERROR);
				}
			} else {
				selectedItem = itemArray.pop()!;
			}
		}

		if (!msg.flagArgs.cf) {
			channelMessage = await msg.channel.send({
				files: [
					await chatHeadImage({
						content:
							'Please, check if your offer matches what you want and click confirm to add this trade your database.',
						head: 'geClerk'
					}),
					new MessageAttachment(
						await this.createSetupOfferImage(selectedItem, quantity, itemPrice, selectedItem.price, type),
						'test.png'
					)
				],
				components: [
					[
						new MessageButton({
							label: 'Everything is right.',
							style: 'SUCCESS',
							customID: 'confirmGeOffer'
						}),
						new MessageButton({
							label: 'On a second thought...',
							style: 'DANGER',
							customID: 'cancelGeOffer'
						})
					]
				]
			});

			try {
				const selection = await channelMessage.awaitMessageComponentInteraction({
					filter: i => {
						if (i.user.id !== msg.author.id) {
							i.reply({
								ephemeral: true,
								// This should NEVER be displayed, ever, as we force any GE transaction to be made
								// via DMs, so, just a funny safeguard.
								content: 'What? How did you... THIEF! GUARDS! GUARDS! We have an intruder!'
							});
							return false;
						}
						return true;
					},
					time: Time.Second * 15
				});
				if (selection.customID === 'cancelGeOffer') {
					await channelMessage.delete();
					return this.clerkChat(msg, "It is OK. I'll be here when you want to sell or buy anything.");
				}
				if (selection.customID === 'confirmGeOffer') {
					await channelMessage.delete();
				}
			} catch {
				await channelMessage.delete();
				return this.clerkChat(
					msg,
					'I am sorry, I got other people to attend. When you are ready to do some business, talk with me again.'
				);
			}
		}
		try {
			const table = new GrandExchangeTable();
			table.price = itemPrice;
			table.item = selectedItem.id;
			table.type = type;
			table.quantity = quantity;
			table.userID = msg.author.id;
			table.slot = slot;
			table.dateAdded = new Date();
			table.quantityTraded = 0;
			table.collectionQuantity = 0;
			table.collectionCash = 0;
			table.status = GrandExchangeStatus.Running;
			await table.save();

			if (type === GrandExchangeType.Buy) {
				await msg.author.removeGP(itemPrice * quantity);
				return this.clerkChat(
					msg,
					`Congratulations! Your trade offer for ${quantity}x ${selectedItem.name} was sucessfully added to our system! We'll notify you as soon as the trade is completed. Have a great day!`
				);
			}
			await msg.author.settings.update(
				UserSettings.Bank,
				removeBankFromBank(
					msg.author.settings.get(UserSettings.Bank),
					new Bank().add(selectedItem.id, quantity).bank
				)
			);
			return this.clerkChat(
				msg,
				`Congratulations! Your sell offer for ${quantity}x ${selectedItem.name} was sucessfully added to our system! We'll notify you as soon as the sale is completed. Have a great day!`
			);
		} catch (e) {
			console.log(e);
			return this.clerkChat(
				msg,
				'I am sorry, something went wrong while I was trying to make this transaction go forward. Could you try again in a few moments?'
			);
		}
	}
}

declare global {
	const geImageGenerator: GEImageTask;
}
declare global {
	namespace NodeJS {
		interface Global {
			geImageGenerator: GEImageTask;
		}
	}
}
global.geImageGenerator = new GEImageTask();
geImageGenerator.init();