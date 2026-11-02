import { calcPercentOfNum, calcWhatPercent, toTitleCase } from '@oldschoolgg/toolkit';
import { Items } from 'oldschooljs';

import type { GEListing, GETransaction } from '@/prisma/main.js';
import { CanvasModule } from '@/lib/canvas/CanvasModule.js';
import { CanvasSpritesheet } from '@/lib/canvas/CanvasSpritesheet.js';
import { type Canvas, type CanvasImage, loadImage } from '@/lib/canvas/canvasUtil.js';
import { OSRSCanvas } from '@/lib/canvas/OSRSCanvas.js';
import type { GEListingWithTransactions } from '@/lib/grandExchange.js';

class GeImageGeneratorSingleton {
	public ready = false;
	public geInterface: Canvas | null = null;
	public geSlotLocked: Canvas | null = null;
	public geSlotOpen: Canvas | null = null;
	public geSlotActive: Canvas | null = null;
	public geSlotExpired: CanvasImage | null = null;
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
		this.geSlotExpired = await loadImage('./src/lib/resources/images/grandexchange/ge_slot_expired.png');
		this.geProgressShadow = geSpritesheet.getSprite('ge_progress_shadow');
		this.ready = true;
	}

	async getSlotImage(
		user: MUser | null,
		canvas: OSRSCanvas,
		slot: number,
		locked: boolean,
		listing: GEListingWithTransactions | undefined,
		expired = false
	) {
		const slotImage = listing
			? expired
				? this.geSlotExpired!
				: this.geSlotActive!
			: locked
				? this.geSlotLocked!
				: this.geSlotOpen!;
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
			quantity: listing.total_quantity,
			user: user ?? null
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
		const percentFullfilled = calcWhatPercent(
			listing.total_quantity - listing.quantity_remaining,
			listing.total_quantity
		);
		const progressWidth = calcPercentOfNum(percentFullfilled, maxWidth);
		if (percentFullfilled === 100 && listing.type !== 'Sell') {
			ctx.fillStyle = OSRSCanvas.COLORS.DARK_GREEN;
		} else {
			ctx.fillStyle = OSRSCanvas.COLORS.ORANGE;
		}

		ctx.fillRect(0, 0, progressWidth, progressShadowImage.height);
		ctx.drawImage(progressShadowImage, 0, 0, progressShadowImage.width, progressShadowImage.height);
		ctx.restore();
	}

	async addInterfaceSlots(
		canvas: OSRSCanvas,
		listingData: GEListingWithTransactions[],
		extra: {
			unlockedSlots?: number;
			page?: number;
			rowLength?: number;
			rowCount?: number;
			startX?: number;
			startY?: number;
			user?: MUser | null;
		} = {}
	) {
		const rowLength = extra.rowLength ?? 4;
		const rowCount = extra.rowCount ?? 2;
		const startX = extra.startX ?? 9;
		const startY = extra.startY ?? 64;
		const unlockedSlots = extra.unlockedSlots ?? listingData.length;
		const pageSize = rowLength * rowCount;
		const isPaged = extra.page !== undefined;
		const page = Math.max(extra.page ?? 1, 1);
		const pageStart = isPaged ? (page - 1) * pageSize : 0;
		const remainingUnlockedSlots = Math.max(0, unlockedSlots - pageStart);
		const slotCount = isPaged
			? pageSize
			: Math.ceil(Math.max(listingData.length, unlockedSlots) / rowLength) * rowLength;

		for (let indexOnCanvas = 0; indexOnCanvas < slotCount; indexOnCanvas++) {
			const slotIndex = pageStart + indexOnCanvas;
			const listing = listingData[slotIndex];
			const locked = indexOnCanvas >= remainingUnlockedSlots;
			const expired = Boolean(listing && locked);
			const x = indexOnCanvas % rowLength;
			const y = Math.floor(indexOnCanvas / rowLength) * (this.geSlotOpen!.height + 10);

			canvas.ctx.save();
			canvas.ctx.translate(startX + x * (this.geSlotOpen!.width + 2), startY + y);
			await this.getSlotImage(extra.user ?? null, canvas, slotIndex + 1, locked, listing, expired);
			canvas.ctx.restore();
		}
	}

	async createInterface(opts: {
		user?: MUser;
		slotsUsed: number;
		maxSlots: number;
		page: number;
		activeListings: (GEListing & {
			buyTransactions: GETransaction[];
			sellTransactions: GETransaction[];
		})[];
	}): Promise<Buffer> {
		await CanvasModule.waitTillReady();
		if (!this.ready) {
			await this.init();
		}
		let { slotsUsed, maxSlots, page, activeListings } = opts;
		const canvas = new OSRSCanvas({ width: this.geInterface!.width, height: this.geInterface!.height });
		canvas.ctx.drawImage(this.geInterface!, 0, 0, canvas.width, canvas.height);

		// Pages
		const slotsPerRow = 4;
		const rowsPerPage = 2;
		const chunkSize = slotsPerRow * rowsPerPage;
		const totalChunks = Math.max(1, Math.ceil(maxSlots / chunkSize));
		page = Math.min(Math.max(page, 1), totalChunks);
		if (page >= 0) {
			canvas.drawTitleText({
				text: `Page ${page} of ${totalChunks}`,
				x: canvas.width - 90,
				y: 22,
				center: false
			});
		}

		await this.addInterfaceSlots(canvas, activeListings, {
			unlockedSlots: slotsUsed,
			page,
			rowLength: slotsPerRow,
			rowCount: rowsPerPage,
			user: opts.user
		});

		return canvas.toScaledOutput(2);
	}
}

export const GeImageGenerator = new GeImageGeneratorSingleton();
