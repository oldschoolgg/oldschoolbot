import * as fs from 'node:fs/promises';
import { formatItemStackQuantity, generateHexColorForCashStack, toTitleCase } from '@oldschoolgg/toolkit/util';
import type { GEListing, GETransaction } from '@prisma/client';

import type { GEListingWithTransactions } from './../mahoji/commands/ge';
import { GrandExchange } from './grandExchange';
import {
	type Canvas,
	type CanvasContext,
	type CanvasImage,
	canvasToBuffer,
	createCanvas,
	fillTextXTimesInCtx,
	loadImage
} from './util/canvasUtil';
import getOSItem from './util/getOSItem';

function drawTitle(ctx: CanvasContext, title: string, canvas: Canvas) {
	// Draw Page Title
	ctx.font = '16px RuneScape Bold 12';
	const titleWidthPx = ctx.measureText(title);
	const titleX = Math.floor(Math.floor(canvas.width) * 0.95 - titleWidthPx.width);
	ctx.fillStyle = '#000000';
	fillTextXTimesInCtx(ctx, title, titleX + 1, 22);

	ctx.fillStyle = '#ff981f';
	fillTextXTimesInCtx(ctx, title, titleX, 21);
}

class GeImageTask {
	public geInterface: CanvasImage | null = null;
	public geSlotLocked: CanvasImage | null = null;
	public geSlotOpen: CanvasImage | null = null;
	public geSlotActive: CanvasImage | null = null;
	public geProgressShadow: CanvasImage | null = null;
	public geIconBuy: CanvasImage | null = null;
	public geIconSell: CanvasImage | null = null;

	async init() {
		await this.prepare();
	}

	async prepare() {
		this.geInterface = await loadImage(
			await fs.readFile('./src/lib/resources/images/grandexchange/ge_interface.png')
		);
		this.geSlotLocked = await loadImage(
			await fs.readFile('./src/lib/resources/images/grandexchange/ge_slot_locked.png')
		);
		this.geSlotOpen = await loadImage(
			await fs.readFile('./src/lib/resources/images/grandexchange/ge_slot_open.png')
		);
		this.geSlotActive = await loadImage(
			await fs.readFile('./src/lib/resources/images/grandexchange/ge_slot_active.png')
		);
		this.geProgressShadow = await loadImage(
			await fs.readFile('./src/lib/resources/images/grandexchange/ge_progress_shadow.png')
		);
		this.geIconBuy = await loadImage(
			await fs.readFile('./src/lib/resources/images/grandexchange/ge_buy_mini_icon.png')
		);
		this.geIconSell = await loadImage(
			await fs.readFile('./src/lib/resources/images/grandexchange/ge_sell_mini_icon.png')
		);
	}

	drawText(ctx: CanvasContext, text: string, x: number, y: number, maxWidth: number | undefined, lineHeight: number) {
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
		for (const [index, textLine] of (textLines.length > 0 ? textLines : [text]).entries()) {
			const textColor = ctx.fillStyle === '#000000' ? '#ff981f' : ctx.fillStyle;
			ctx.fillStyle = '#000000';
			fillTextXTimesInCtx(ctx, textLine.trim(), x + 1, y + lineHeight * index + 1);
			ctx.fillStyle = textColor;
			fillTextXTimesInCtx(ctx, textLine.trim(), x, y + lineHeight * index);
		}
	}

	async getSlotImage(
		ctx: CanvasContext,
		slot: number,
		locked: boolean,
		listing: GEListingWithTransactions | undefined
	) {
		const slotImage = listing ? this.geSlotActive! : locked ? this.geSlotLocked! : this.geSlotOpen!;
		ctx.drawImage(slotImage, 0, 0, slotImage.width, slotImage.height);

		// Draw Bank Title
		ctx.textAlign = 'center';
		ctx.font = '16px RuneScape Bold 12';
		const type = listing ? ` - ${toTitleCase(listing.type.toString())}` : ' - Empty';
		this.drawText(
			ctx,
			locked ? 'Locked' : `Slot ${slot}${type}`,
			Math.floor(slotImage.width / 2),
			17,
			undefined,
			10
		);

		if (listing) {
			// Get item
			const itemImage = await bankImageGenerator.getItemImage(listing.item_id);

			// Draw item
			ctx.textAlign = 'left';
			ctx.font = '16px OSRSFontCompact';
			ctx.save();

			ctx.translate(8, 34);
			ctx.drawImage(
				itemImage,
				Math.floor((32 - itemImage?.width) / 2) + 2,
				Math.floor((32 - itemImage?.height) / 2),
				itemImage?.width,
				itemImage?.height
			);
			if (listing.total_quantity > 1) {
				const formattedQuantity = formatItemStackQuantity(listing.total_quantity);
				ctx.fillStyle = generateHexColorForCashStack(listing.total_quantity);
				this.drawText(ctx, formattedQuantity, 0, 9, undefined, 10);
			}
			// Draw item name
			ctx.translate(39, 11);
			const itemName = getOSItem(listing.item_id).name;
			ctx.fillStyle = '#FFB83F';
			ctx.font = '16px OSRSFontCompact';
			this.drawText(ctx, itemName, 0, 0, ctx.measureText('Elysian spirit').width, 10);
			ctx.restore();

			ctx.save();
			// Draw item value of the transaction
			ctx.translate(0, 87);
			ctx.font = '16px OSRSFontCompact';
			ctx.textAlign = 'center';

			ctx.fillStyle = '#ff981f';
			this.drawText(
				ctx,
				`${Number(listing.asking_price_per_item).toLocaleString()} coins`,
				Math.floor(this.geSlotOpen!.width / 2) + 1,
				17,
				undefined,
				10
			);
			ctx.restore();
			// Draw progress bar
			ctx.save();

			const progressShadowImage = this.geProgressShadow!;

			ctx.translate(5, 75);

			const maxWidth = progressShadowImage.width;
			ctx.fillStyle = '#ff981f';
			let progressWidth = 0;
			if (listing.quantity_remaining > 0) {
				progressWidth = Math.floor(
					(maxWidth * (listing.total_quantity - listing.quantity_remaining)) / listing.total_quantity
				);
				if (progressWidth === maxWidth) {
					ctx.fillStyle = '#005F00';
				}
			} else {
				ctx.fillStyle = '#8F0000';
				progressWidth = maxWidth;
			}

			ctx.fillRect(0, 0, progressWidth, progressShadowImage.height);
			ctx.drawImage(progressShadowImage, 0, 0, progressShadowImage.width, progressShadowImage.height);

			ctx.restore();
		}
	}

	async createInterface(opts: {
		user: MUser;
		page: number;
		activeListings: (GEListing & {
			buyTransactions: GETransaction[];
			sellTransactions: GETransaction[];
		})[];
	}): Promise<Buffer> {
		let { user, page, activeListings } = opts;
		const { slots, maxPossible } = await GrandExchange.calculateSlotsOfUser(user);
		const canvasImage = this.geInterface!;
		const canvas = createCanvas(canvasImage.width, canvasImage.height);
		const ctx = canvas.getContext('2d');
		ctx.font = '16px OSRSFontCompact';
		ctx.imageSmoothingEnabled = false;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(canvasImage, 0, 0, canvas.width, canvas.height);

		// Pages
		const chunkSize = 8;
		const totalChunks = Math.ceil(maxPossible / chunkSize);
		if (page > totalChunks) page = totalChunks;
		if (page >= 0) {
			const pageTitle = `Page ${page} of ${totalChunks}`;
			drawTitle(ctx, pageTitle, canvas);
		}

		ctx.translate(9, 64);
		let y = 0;
		let x = 0;
		for (let i = (page - 1) * chunkSize; i < maxPossible; i++) {
			const listing: GEListingWithTransactions = activeListings[i];
			if (i > (page - 1) * chunkSize && i % 4 === 0) {
				y += this.geSlotOpen!.height + 10;
				x = 0;
			}
			ctx.save();
			ctx.translate(x * (this.geSlotOpen!.width + 2), y);
			await this.getSlotImage(ctx, i + 1, i >= slots, listing);
			ctx.restore();
			x++;
			if (i > (page - 1) * chunkSize + 8) break;
		}
		const image = await canvasToBuffer(canvas);

		return image;
	}
}

declare global {
	var geImageGenerator: GeImageTask;
}

global.geImageGenerator = new GeImageTask();

geImageGenerator.init();
