import { calcPercentOfNum, calcWhatPercent, toTitleCase } from '@oldschoolgg/toolkit';
import type { GEListing, GETransaction } from '@prisma/client';
import { Items } from 'oldschooljs';
import type { Canvas } from 'skia-canvas';

import type { GEListingWithTransactions } from '@/mahoji/commands/ge.js';
import { CanvasSpritesheet } from './CanvasSpritesheet.js';
import { OSRSCanvas } from './OSRSCanvas.js';

class GeImageGeneratorSingleton {
	public geInterface: Canvas | null = null;
	public geSlotLocked: Canvas | null = null;
	public geSlotOpen: Canvas | null = null;
	public geSlotActive: Canvas | null = null;
	public geProgressShadow: Canvas | null = null;

	async init() {
		const geSpritesheet = await CanvasSpritesheet.create(
			'./src/lib/resources/spritesheets/ge-spritesheet.json',
			'./src/lib/resources/spritesheets/ge-spritesheet.png'
		);

		this.geInterface = geSpritesheet.getSprite('ge_interface');
		this.geSlotActive = geSpritesheet.getSprite('ge_slot_active');
		this.geSlotLocked = geSpritesheet.getSprite('ge_slot_locked');
		this.geSlotOpen = geSpritesheet.getSprite('ge_slot_open');
		this.geProgressShadow = geSpritesheet.getSprite('ge_progress_shadow');
	}

	async getSlotImage(
		canvas: OSRSCanvas,
		slot: number,
		locked: boolean,
		listing: GEListingWithTransactions | undefined
	) {
		const slotImage = listing ? this.geSlotActive! : locked ? this.geSlotLocked! : this.geSlotOpen!;
		const ctx = canvas.ctx;

		// Draw slot background
		ctx.drawImage(slotImage, 0, 0, slotImage.width, slotImage.height);

		// Draw slot title - positioned absolutely within the slot
		const type = listing ? ` - ${toTitleCase(listing.type.toString())}` : ' - Empty';

		canvas.drawText({
			text: locked ? 'Locked' : `Slot ${slot}${type}`,
			x: Math.floor(slotImage.width / 2),
			y: 17,
			font: 'Bold',
			color: OSRSCanvas.COLORS.ORANGE,
			center: true
		});

		if (!listing) return;

		// Draw item
		await canvas.drawItemIDSprite({
			itemID: listing.item_id,
			x: 8,
			y: 34,
			glow:
				listing.type === 'Buy' && listing.asking_price_per_item >= 500_000_000_000
					? {
							color: OSRSCanvas.COLORS.MAGENTA,
							blur: 20,
							radius: 10
						}
					: undefined,
			quantity: listing.total_quantity
		});

		// Draw item name
		canvas.drawText({
			text: Items.itemNameFromId(listing.item_id)!,
			x: 8 + 39,
			y: 34 + 11,
			color: '#FFB83F',
			maxWidth: ctx.measureText('Elysian spirit').width,
			lineHeight: 10
		});

		// Draw item value of the transaction
		ctx.save();
		ctx.translate(0, 87);
		canvas.drawText({
			text: `${Number(listing.asking_price_per_item).toLocaleString()} coins`,
			x: Math.floor(this.geSlotOpen!.width / 2),
			y: 17,
			color: '#ff981f',
			center: true,
			lineHeight: 10
		});
		ctx.restore();

		// Draw progress bar
		ctx.save();
		const progressShadowImage = this.geProgressShadow!;
		ctx.translate(5, 75);

		const maxWidth = progressShadowImage.width;
		ctx.fillStyle = OSRSCanvas.COLORS.ORANGE;
		let percentFullfilled = calcWhatPercent(listing.quantity_remaining, listing.total_quantity);
		if (listing.type === 'Sell') {
			percentFullfilled = 100 - percentFullfilled;
		}
		const progressWidth = calcPercentOfNum(percentFullfilled, maxWidth);
		if (percentFullfilled === 100) {
			ctx.fillStyle = OSRSCanvas.COLORS.DARK_GREEN;
		} else {
			ctx.fillStyle = OSRSCanvas.COLORS.ORANGE;
		}
		// if (listing.quantity_remaining > 0) {
		// 	progressWidth = Math.floor(
		// 		(maxWidth * (listing.total_quantity - listing.quantity_remaining)) / listing.total_quantity
		// 	);
		// 	if (progressWidth === maxWidth) {
		// 		ctx.fillStyle = OSRSCanvas.COLORS.DARK_GREEN;
		// 	}
		// } else {
		// 	ctx.fillStyle = OSRSCanvas.COLORS.DARK_RED;
		// 	progressWidth = maxWidth;
		// }

		ctx.fillRect(0, 0, progressWidth, progressShadowImage.height);
		ctx.drawImage(progressShadowImage, 0, 0, progressShadowImage.width, progressShadowImage.height);
		ctx.restore();
	}

	async createInterface(opts: {
		slotsUsed: number;
		maxSlots: number;
		page: number;
		activeListings: (GEListing & {
			buyTransactions: GETransaction[];
			sellTransactions: GETransaction[];
		})[];
	}): Promise<Buffer> {
		let { slotsUsed, maxSlots, page, activeListings } = opts;
		const canvas = new OSRSCanvas({ width: this.geInterface!.width, height: this.geInterface!.height });
		canvas.ctx.drawImage(this.geInterface!, 0, 0, canvas.width, canvas.height);

		// Pages
		const chunkSize = 8;
		const totalChunks = Math.ceil(maxSlots / chunkSize);
		if (page > totalChunks) page = totalChunks;
		if (page >= 0) {
			canvas.drawTitleText({
				text: `Page ${page} of ${totalChunks}`,
				x: canvas.width - 90,
				y: 22,
				center: false
			});
		}

		const startX = 9;
		const startY = 64;

		let y = 0;
		let x = 0;
		for (let i = (page - 1) * chunkSize; i < maxSlots; i++) {
			const listing: GEListingWithTransactions = activeListings[i];
			if (i > (page - 1) * chunkSize && i % 4 === 0) {
				y += this.geSlotOpen!.height + 10;
				x = 0;
			}

			canvas.ctx.save();
			canvas.ctx.translate(startX + x * (this.geSlotOpen!.width + 2), startY + y);
			await this.getSlotImage(canvas, i + 1, i >= slotsUsed, listing);
			canvas.ctx.restore();

			x++;
			if (i > (page - 1) * chunkSize + 8) break;
		}

		return canvas.toScaledOutput(2);
	}
}

export const GeImageGenerator = new GeImageGeneratorSingleton();
