import { useElementSize } from '@mantine/hooks';
import { formatItemStackQuantity, generateHexColorForCashStack } from '@oldschoolgg/toolkit';
import { chunkArr } from '@oldschoolgg/util';
import type React from 'react';
import { useEffect, useRef } from 'react';

import { drawBorder } from '@/components/BankImage/bankImageUtil.js';
import { loadFont } from '@/components/BitMapFont/loadFont.js';
import { Renderer } from '@/components/BitMapFont/Renderer.js';
import { Bank, type ItemBank } from '@/osrs/index.js';
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

function calculateLayout(bank: ItemBank, ghosts: number[], availableWidth: number): LayoutDimensions {
	// Calculate number of columns that fit in the available width
	const columns = Math.max(1, Math.floor((availableWidth - distanceFromEdge * 2) / (itemSize + spacer)));

	// Count total items (including ghosts)
	const osBank = new Bank(bank);
	for (const ghost of ghosts) {
		if (!osBank.has(ghost)) {
			osBank.add(ghost, 0);
		}
	}
	const totalItems = osBank.length;

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
	font: any;
	boldFont: any;
}

type ItemEntry = [number, number];
const sortingMethods = {
	id: (a: ItemEntry, b: ItemEntry) => a[0] - b[0],
	name: (a: ItemEntry, b: ItemEntry) => a[0].toString().localeCompare(b[0].toString()),
	quantity: (a: ItemEntry, b: ItemEntry) => b[1] - a[1]
} as const;

function drawBank({
	canvas,
	itemsSpritesheet,
	bsoItemsSpritesheet,
	bankSpritesheet,
	bank,
	width,
	title,
	sort,
	ghosts = [],
	showAsKC = false,
	font,
	boldFont
}: DrawBankOptions) {
	console.log(`Drawing bank image at width ${width}px`);
	const start = performance.now();

	// Calculate layout dimensions
	const layout = calculateLayout(bank, ghosts, width);

	// Prepare bank data
	const bankEntries = Object.entries(bank)
		.map(([id, qty]) => [Number(id), qty] as ItemEntry)
		.sort(sortingMethods[sort]);
	const chunkedLoot = chunkArr(bankEntries, layout.columns);

	// Create render canvas with calculated dimensions
	const renderCanvas = createRenderCanvas(layout.width, layout.height, RENDER_SCALE);
	const ctx = renderCanvas.getContext('2d', { alpha: false })!;
	const renderer = new Renderer({
		font: font,
		canvas: renderCanvas
	});
	const rendererBold = new Renderer({
		font: boldFont,
		canvas: renderCanvas
	});

	ctx.imageSmoothingEnabled = false;
	ctx.fillStyle = '#494034';

	// Draw background pattern
	const repeaterImage = bankSpritesheet.get('repeating_bg');
	const ptrn = ctx.createPattern(repeaterImage, 'repeat')!;
	ctx.fillStyle = ptrn;
	ctx.fillRect(0, 0, renderCanvas.width, renderCanvas.height);

	// Draw items
	const baseSpacing = spacer + distanceFromEdge;

	const TEXT_RENDER_SCALE = 0.5;
	const TITLE_TEXT_RENDER_SCALE = 1;

	for (let row = 0; row < chunkedLoot.length; row++) {
		for (let col = 0; col < chunkedLoot[row].length; col++) {
			const [item, quantity] = chunkedLoot[row][col];

			const isBsoItem = bsoItemsSpritesheet.data[item];
			const spritesheetToUse = isBsoItem ? bsoItemsSpritesheet : itemsSpritesheet;
			const itemData = spritesheetToUse.data[item];
			if (!itemData) {
				console.log(`Missing spritesheet data for item ID ${item}, skipping draw.`);
				continue;
			}
			const [_sX, _sY, sW, sH] = itemData;

			// Calculate position using layout spacing
			const xLoc = Math.floor(baseSpacing + col * layout.itemSpacingX) * RENDER_SCALE;
			const yLoc = (Math.floor(baseSpacing + row * layout.itemSpacingY) + 12) * RENDER_SCALE;

			// Draw item with ghost effect if needed
			if (ghosts.includes(item) && quantity === 0) {
				ctx.globalAlpha = 0.2;
			}

			spritesheetToUse.draw({
				id: item,
				ctx,
				x: xLoc + ((itemSize - sW) / 2) * RENDER_SCALE,
				y: yLoc + ((itemSize - sH) / 2) * RENDER_SCALE,
				width: sW * RENDER_SCALE,
				height: sH * RENDER_SCALE
			});

			ctx.globalAlpha = 1;

			// Calculate text position
			const textXLoc = Math.floor((baseSpacing + col * layout.itemSpacingX - 6) * RENDER_SCALE);
			const textYLoc = Math.floor((baseSpacing + row * layout.itemSpacingY + 10) * RENDER_SCALE);

			// Draw quantity
			if (quantity > 0) {
				const quantityColor = generateHexColorForCashStack(quantity);
				let formattedQuantity = formatItemStackQuantity(quantity);
				if (showAsKC) formattedQuantity = `${formattedQuantity} KC`;

				// Shadow
				renderer.draw(textXLoc + TEXT_RENDER_SCALE, textYLoc + TEXT_RENDER_SCALE, formattedQuantity, {
					color: '#000000',
					scale: TEXT_RENDER_SCALE
				});
				// Main text
				renderer.draw(textXLoc, textYLoc, formattedQuantity, {
					color: quantityColor,
					scale: TEXT_RENDER_SCALE
				});
			}

			// Draw price if enabled
			// if (showPrice) {
			// 	const value = (item.price ?? 0) * quantity;
			// 	const fmted = toKMB(value);
			// 	const valueColor = generateHexColorForCashStack(value);

			// 	// Shadow
			// 	renderer.draw(
			// 		textXLoc + TEXT_RENDER_SCALE,
			// 		textYLoc + Math.floor(24 * TEXT_RENDER_SCALE) + TEXT_RENDER_SCALE,
			// 		fmted,
			// 		{
			// 			color: '#000000',
			// 			scale: TEXT_RENDER_SCALE
			// 		}
			// 	);
			// 	// Main text
			// 	renderer.draw(textXLoc, textYLoc + Math.floor(24 * TEXT_RENDER_SCALE), fmted, {
			// 		color: valueColor,
			// 		scale: TEXT_RENDER_SCALE
			// 	});
			// }
		}
	}

	drawBorder(ctx, bankSpritesheet, RENDER_SCALE);

	if (title) {
		const chars = Array.from(title);
		let textAdvance = 0;
		for (let c = 0; c < chars.length; c++) {
			const ch = chars[c];
			const charMeta = (font as any).characters?.[ch];
			textAdvance += (charMeta ? charMeta.width : 0) * 1;
		}

		const titleX = Math.floor((renderCanvas.width - textAdvance) / 2);
		const titleY = Math.floor(9 * TITLE_TEXT_RENDER_SCALE);

		rendererBold.draw(titleX + TITLE_TEXT_RENDER_SCALE, titleY + TITLE_TEXT_RENDER_SCALE, title, {
			color: '#000000',
			scale: TITLE_TEXT_RENDER_SCALE
		});
		rendererBold.draw(titleX, titleY, title, { color: '#ff981f', scale: TITLE_TEXT_RENDER_SCALE });
	}

	canvas.width = renderCanvas.width;
	canvas.height = renderCanvas.height;
	canvas.style.width = `${layout.width}px`;
	canvas.style.height = `${layout.height}px`;
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
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const compactFontRef = useRef<any>(null);
	const boldFontRef = useRef<any>(null);
	const { ref: containerRef, width } = useElementSize();

	const bankSheet = useSpritesheet(
		'https://cdn.oldschool.gg/website/spritesheets/bank.a0bf6f62.webp',
		'https://cdn.oldschool.gg/website/spritesheets/bank.0b91c04f.json'
	);
	const itemsSpritesheet = useSpritesheet(itemsSpritesheetPngUrl, itemsSpritesheetJsonUrl);
	const bsoItemsSpritesheet = useSpritesheet(bsoItemsSpritesheetPngUrl, bsoItemsSpritesheetJsonUrl);

	useEffect(() => {
		if (canvasRef.current) {
			loadFont(
				'https://cdn.oldschool.gg/website/osrs-bitmap-fonts/compact_24.png',
				'https://cdn.oldschool.gg/website/osrs-bitmap-fonts/compact_24.json'
			).then((_font: any) => {
				compactFontRef.current = _font;
			});
			loadFont(
				'https://cdn.oldschool.gg/website/osrs-bitmap-fonts/bold_12.png',
				'https://cdn.oldschool.gg/website/osrs-bitmap-fonts/bold_12.json'
			).then((_font: any) => {
				boldFontRef.current = _font;
			});
		}
	}, [canvasRef]);

	useEffect(() => {
		if (!bankSheet || !itemsSpritesheet || !bsoItemsSpritesheet) {
			console.log('Spritesheets not loaded yet, skipping bank image draw.');
			return;
		}
		if (!compactFontRef.current || !boldFontRef.current) {
			console.log('Fonts not loaded yet, skipping bank image draw.');
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
				width: customWidth ?? Math.min(1000, width),
				title,
				showPrice,
				sort,
				ghosts,
				showAsKC: showAsKc,
				font: compactFontRef.current,
				boldFont: boldFontRef.current
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
		showAsKc
	]);

	return (
		<div className={styles.bank_container} id="bank" ref={containerRef}>
			<canvas className={styles.bank_image_canvas} ref={canvasRef} />
		</div>
	);
};
