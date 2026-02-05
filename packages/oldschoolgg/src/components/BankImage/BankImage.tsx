import { useElementSize } from '@mantine/hooks';
import { formatItemStackQuantity, generateHexColorForCashStack } from '@oldschoolgg/toolkit';
import { chunkArr } from '@oldschoolgg/util';
import type React from 'react';
import { useEffect, useRef } from 'react';

import { drawBorder } from '@/components/BankImage/bankImageUtil.js';
import { useOSRSFonts } from '@/components/Canvas/fontLoader.js';
import type { ItemBank } from '@/osrs/index.js';
import bsoItemsSpritesheetJsonUrl from '../../../../../src/lib/resources/spritesheets/bso-items-spritesheet.json?url';
import bsoItemsSpritesheetPngUrl from '../../../../../src/lib/resources/spritesheets/bso-items-spritesheet.png?url';
import itemsSpritesheetJsonUrl from '../../../../../src/lib/resources/spritesheets/items-spritesheet.json?url';
import itemsSpritesheetPngUrl from '../../../../../src/lib/resources/spritesheets/items-spritesheet.png?url';
import { type Spritesheet, useSpritesheet } from '../../hooks/useSpritesheet.js';
import styles from './BankImage.module.css';

interface Props {
	bank: ItemBank;
	title: string | null;
	showPrice?: boolean;
	sort?: keyof typeof sortingMethods;
	width?: number;
	ghosts?: number[];
	showAsKc?: boolean;
}

const spacer = 32;
const itemSize = 32;
const distanceFromEdge = spacer * 0.6;
const RENDER_SCALE = 1;
const MIN_HEIGHT = 95;

function createRenderCanvas(width: number, height: number, scale: number) {
	const renderCanvas = document.createElement('canvas');
	renderCanvas.width = Math.max(1, Math.floor(width * scale));
	renderCanvas.height = Math.max(1, Math.floor(height * scale));
	renderCanvas.style.width = `${width}px`;
	renderCanvas.style.height = `${height}px`;
	return renderCanvas;
}

interface LayoutDimensions {
	columns: number;
	rows: number;
	width: number;
	height: number;
	itemSpacingX: number;
	itemSpacingY: number;
}

function calculateLayout(bank: ItemBank, availableWidth: number): LayoutDimensions {
	// Calculate number of columns that fit in the available width
	const columns = Math.max(1, Math.floor((availableWidth - distanceFromEdge * 2) / (itemSize + spacer)));

	const totalItems = Math.min(MAX_ITEMS_TO_DRAW, Object.keys(bank).length);

	// Calculate number of rows needed
	const rows = Math.max(1, Math.ceil(totalItems / columns));

	// Calculate actual spacing between items
	const itemSpacingY = itemSize + spacer / 2;

	// Calculate precise dimensions
	const width = Math.floor(availableWidth);
	// Items start at Y position: baseSpacing + 12
	// Last item ends at: baseSpacing + 12 + (rows - 1) * itemSpacingY + itemSize
	// To have symmetric padding, bottom padding should equal top padding (baseSpacing + 12)
	const topPadding = spacer + distanceFromEdge + 12;
	const contentHeight = topPadding + (rows - 1) * itemSpacingY + itemSize + topPadding;
	const height = Math.floor(Math.max(MIN_HEIGHT, contentHeight));

	// Calculate actual spacing between items
	// Total space available for items and spacing
	const availableContentWidth = availableWidth - distanceFromEdge * 2;
	// Space taken by items
	const totalItemWidth = columns * itemSize;
	// Remaining space for gaps between items
	const totalGapSpace = availableContentWidth - totalItemWidth;
	// Space per gap (columns + 1 gaps for equal padding on both sides)
	const gapSize = totalGapSpace / (columns + 1);
	// Distance between item centers
	const itemSpacingX = itemSize + gapSize;

	return {
		columns,
		rows,
		width,
		height,
		itemSpacingX,
		itemSpacingY
	};
}

interface DrawBankOptions {
	container: HTMLDivElement;
	canvas: HTMLCanvasElement;
	itemsSpritesheet: Spritesheet;
	bsoItemsSpritesheet: Spritesheet;
	bankSpritesheet: Spritesheet;
	bank: ItemBank;
	width: number;
	title: string | null;
	showPrice: boolean;
	sort: keyof typeof sortingMethods;
	ghosts?: number[];
	showAsKC?: boolean;
}

type ItemEntry = [number, number];
const sortingMethods = {
	id: (a: ItemEntry, b: ItemEntry) => a[0] - b[0],
	name: (a: ItemEntry, b: ItemEntry) => a[0].toString().localeCompare(b[0].toString()),
	quantity: (a: ItemEntry, b: ItemEntry) => b[1] - a[1]
} as const;

function drawQtyText({
	ctx,
	x,
	y,
	quantity
}: {
	ctx: CanvasRenderingContext2D;
	x: number;
	y: number;
	quantity: number;
}) {
	x = x * RENDER_SCALE;
	y = y * RENDER_SCALE;

	const quantityColor = generateHexColorForCashStack(quantity);
	const formattedQuantity = formatItemStackQuantity(quantity);
	const dis = 5 * RENDER_SCALE;
	const shadowDist = 1 * RENDER_SCALE;
	for (let i = 0; i < 1; i++) {
		ctx.fillStyle = '#000000';
		ctx.fillText(formattedQuantity, x + shadowDist, y + dis + shadowDist);
	}
	for (let i = 0; i < 2; i++) {
		ctx.fillStyle = quantityColor;
		ctx.fillText(formattedQuantity, x, y + dis);
	}
}

const MAX_ITEMS_TO_DRAW = 500;

function drawBank({
	canvas,
	itemsSpritesheet,
	bsoItemsSpritesheet,
	bankSpritesheet,
	bank,
	width,
	title,
	sort
}: DrawBankOptions) {
	const start = performance.now();

	const layout = calculateLayout(bank, width);

	// Prepare bank data
	const bankEntries = Object.entries(bank)
		.map(([id, qty]) => [Number(id), qty] as ItemEntry)
		.slice(0, MAX_ITEMS_TO_DRAW)
		.sort(sortingMethods[sort]);
	console.log(`Drawing bank image at width ${width}px with ${bankEntries.length} items.`);

	const chunkedLoot = chunkArr(bankEntries, layout.columns);

	// Create render canvas with calculated dimensions
	const renderCanvas = createRenderCanvas(layout.width, layout.height, RENDER_SCALE);
	const ctx = renderCanvas.getContext('2d', { alpha: false })!;
	ctx.imageSmoothingEnabled = false;

	ctx.fillStyle = '#494034';

	// Draw background pattern
	const repeaterImage = bankSpritesheet.get('repeating_bg');
	const ptrn = ctx.createPattern(repeaterImage, 'repeat')!;
	ctx.fillStyle = ptrn;
	ctx.fillRect(0, 0, renderCanvas.width, renderCanvas.height);

	// Draw items
	const baseSpacing = spacer + distanceFromEdge;

	ctx.filter =
		'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxmaWx0ZXIgaWQ9ImZpbHRlciIgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj48ZmVDb21wb25lbnRUcmFuc2Zlcj48ZmVGdW5jUiB0eXBlPSJpZGVudGl0eSIvPjxmZUZ1bmNHIHR5cGU9ImlkZW50aXR5Ii8+PGZlRnVuY0IgdHlwZT0iaWRlbnRpdHkiLz48ZmVGdW5jQSB0eXBlPSJkaXNjcmV0ZSIgdGFibGVWYWx1ZXM9IjAgMSIvPjwvZmVDb21wb25lbnRUcmFuc2Zlcj48L2ZpbHRlcj48L3N2Zz4=#filter)';
	ctx.font = `${RENDER_SCALE * 16}px 'OSRSFontCompact'`;
	for (let row = 0; row < chunkedLoot.length; row++) {
		for (let col = 0; col < chunkedLoot[row].length; col++) {
			const [item, quantity] = chunkedLoot[row][col];

			const isBsoItem = bsoItemsSpritesheet.data[item];
			const spritesheetToUse = isBsoItem ? bsoItemsSpritesheet : itemsSpritesheet;
			const itemData = spritesheetToUse.data[item];
			if (!itemData) {
				// console.log(`Missing spritesheet data for item ID ${item}, skipping draw.`);
				continue;
			}
			const [_sX, _sY, sW, sH] = itemData;

			// Calculate position using layout spacing
			const xLoc = Math.floor(baseSpacing + col * layout.itemSpacingX) * RENDER_SCALE;
			const yLoc = (Math.floor(baseSpacing + row * layout.itemSpacingY) + 12) * RENDER_SCALE;

			const x = xLoc + ((itemSize - sW) / 2) * RENDER_SCALE;
			const y = yLoc + ((itemSize - sH) / 2) * RENDER_SCALE;
			spritesheetToUse.draw({
				id: item,
				ctx,
				x,
				y,
				width: sW * RENDER_SCALE,
				height: sH * RENDER_SCALE
			});

			if (quantity > 0) {
				const textXLoc = Math.floor(baseSpacing + col * layout.itemSpacingX - 6);
				const textYLoc = Math.floor(baseSpacing + row * layout.itemSpacingY + 10);
				drawQtyText({ ctx, x: textXLoc, y: textYLoc, quantity });
			}
		}
	}

	drawBorder(ctx, bankSpritesheet, RENDER_SCALE);

	if (title) {
		const titleX = Math.floor(renderCanvas.width / 2);
		const titleY = 21 * RENDER_SCALE;
		ctx.font = `${16 * RENDER_SCALE}px 'RuneScape Bold 12'`;
		ctx.fillStyle = '#000000';
		ctx.fillText(title, titleX, titleY);
		ctx.fillStyle = '#ff981f';
		ctx.fillText(title, titleX, titleY);
	}

	canvas.width = renderCanvas.width;
	canvas.height = renderCanvas.height;
	canvas.style.width = `${layout.width * RENDER_SCALE}px`;
	canvas.style.height = `${layout.height * RENDER_SCALE}px`;
	canvas.style.display = 'block';
	canvas.style.maxWidth = 'none';

	const displayCtx = canvas.getContext('2d', { alpha: false })!;
	displayCtx.imageSmoothingEnabled = false;
	displayCtx.clearRect(0, 0, canvas.width, canvas.height);
	displayCtx.drawImage(renderCanvas, 0, 0);

	console.log(
		`[${performance.now() - start}ms] Generated bank image: ${layout.columns}x${layout.rows} grid, display ${canvas.width}x${canvas.height}, rendered ${renderCanvas.width}x${renderCanvas.height}`
	);
}

export const BankImage: React.FC<Props> = ({
	bank,
	title,
	showPrice = false,
	sort = 'quantity',
	width: customWidth,
	ghosts,
	showAsKc
}) => {
	const osrsFontsReady = useOSRSFonts();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const { ref: containerRef, width } = useElementSize();

	const bankSheet = useSpritesheet(
		'https://cdn.oldschool.gg/website/spritesheets/bank.a0bf6f62.webp',
		'https://cdn.oldschool.gg/website/spritesheets/bank.0b91c04f.json'
	);
	const itemsSpritesheet = useSpritesheet(itemsSpritesheetPngUrl, itemsSpritesheetJsonUrl);
	const bsoItemsSpritesheet = useSpritesheet(bsoItemsSpritesheetPngUrl, bsoItemsSpritesheetJsonUrl);

	useEffect(() => {
		if (!bankSheet || !itemsSpritesheet || !bsoItemsSpritesheet || !osrsFontsReady) {
			console.log('Spritesheets not loaded yet, skipping bank image draw.');
			return;
		}

		if (canvasRef.current && width > 0) {
			drawBank({
				container: containerRef.current!,
				canvas: canvasRef.current!,
				itemsSpritesheet,
				bsoItemsSpritesheet,
				bankSpritesheet: bankSheet!,
				bank,
				width: customWidth ?? Math.min(1024, width),
				title,
				showPrice,
				sort,
				ghosts,
				showAsKC: showAsKc
			});
		}
	}, [
		itemsSpritesheet,
		bsoItemsSpritesheet,
		bankSheet,
		bank.toString(),
		customWidth,
		width,
		title,
		showPrice,
		sort,
		ghosts,
		showAsKc,
		osrsFontsReady
	]);

	return (
		<div className={styles.bank_container} id="bank" ref={containerRef}>
			<canvas className={styles.bank_image_canvas} ref={canvasRef} />
		</div>
	);
};
