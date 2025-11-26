import {chunkArr} from '@oldschoolgg/util';
import React, { useEffect, useRef } from 'react';
import { useElementSize } from '@mantine/hooks';
import { useFont } from '@react-hooks-library/core';

import styles from './BankImage.module.css';
import spriteSheetImage from './items-spritesheet.png';
import spriteSheetData from './items-spritesheet.json';
import bankSpritesheet from '@/assets/spritesheets/bank.png';
import bankSpritesheetData from '@/assets/spritesheets/bank.json';
import { useImage } from '@/hooks/useImage.tsx';
import { generateHexColorForCashStack, formatItemStackQuantity, toKMB } from '@/osrs/utils.ts';
import { useSpritesheet, type Spritesheet } from './useSpritesheet.ts';
import { type BankSortMethod, sorts } from '@/components/BankImage/bankImageUtil.ts';
import { Bank, type ItemBank } from '@/osrs/Bank.ts';
import { Renderer } from '@/components/BitMapFont/Renderer.ts';
import { loadFont } from '@/components/BitMapFont/loadFont.ts';

type SpriteSheetData = Record<string, [number, number, number, number]>;

interface Props {
	bank: ItemBank;
	title: string | null;
	showPrice: boolean;
	sort?: BankSortMethod;
	width?: number;
	ghosts?: number[];
	showAsKc?: boolean;
}

function createScaledPattern(
	ctx: CanvasRenderingContext2D,
	image: HTMLImageElement,
	scale: number,
	repeat: 'repeat' | 'repeat-x' | 'repeat-y'
): CanvasPattern {
	console.log(`Creating scaled pattern with scale: ${scale} scale, ${image.width}x${image.height} image size`);
	const scaledCanvas = document.createElement('canvas');
	scaledCanvas.width = image.width * scale;
	scaledCanvas.height = image.height * scale;
	const scaledCtx = scaledCanvas.getContext('2d')!;
	scaledCtx.imageSmoothingEnabled = false;
	scaledCtx.drawImage(image, 0, 0, image.width * scale, image.height * scale);
	return ctx.createPattern(scaledCanvas, repeat)!;
}

function drawScaledText(
	ctx: CanvasRenderingContext2D,
	text: string,
	x: number,
	y: number,
	fontSize: number,
	fontFamily: string,
	color: string,
	scale: number
) {
	const tempCanvas = document.createElement('canvas');
	const tempCtx = tempCanvas.getContext('2d', { alpha: true })!;

	tempCtx.font = `${fontSize}px "${fontFamily}"`;
	const metrics = tempCtx.measureText(text);
	const textWidth = Math.ceil(metrics.width);
	const textHeight = fontSize * 2;

	tempCanvas.width = textWidth + 4;
	tempCanvas.height = textHeight;

	tempCtx.imageSmoothingEnabled = false;
	tempCtx.textBaseline = 'top';
	tempCtx.font = `${fontSize}px "${fontFamily}"`;
	tempCtx.fillStyle = color;
	tempCtx.fillText(text, 0, 0);

	ctx.imageSmoothingEnabled = false;
	ctx.drawImage(
		tempCanvas,
		0, 0, tempCanvas.width, tempCanvas.height,
		x, y - fontSize * scale, tempCanvas.width * scale, tempCanvas.height * scale
	);
}

function drawBorder(ctx: CanvasRenderingContext2D, bankSpritesheet: Spritesheet, scale: number = 1) {
	const corner = bankSpritesheet.get('bank_border_c');
	const top = bankSpritesheet.get('bank_border_h');
	const side = bankSpritesheet.get('bank_border_v');
	console.log(`corner: ${corner.width}x${corner.height}, top: ${top.width}x${top.height}, side: ${side.width}x${side.height}`);

	const scaledTopHeight = top.height * scale;
	const scaledSideWidth = side.width * scale;

	// Draw top border
	ctx.fillStyle = createScaledPattern(ctx, top, scale, 'repeat-x');
	ctx.fillRect(0, 0, ctx.canvas.width, scaledTopHeight);

	// Draw bottom border
	ctx.save();
	ctx.fillStyle = createScaledPattern(ctx, top, scale, 'repeat-x');
	ctx.translate(0, ctx.canvas.height);
	ctx.scale(1, -1);
	ctx.fillRect(0, 0, ctx.canvas.width, scaledTopHeight);
	ctx.restore();

	// Draw title line
	ctx.save();
	ctx.fillStyle = createScaledPattern(ctx, top, scale, 'repeat-x');
	ctx.translate(scaledSideWidth, 27 * scale);
	ctx.fillRect(0, 0, ctx.canvas.width, scaledTopHeight);
	ctx.restore();

	// Draw left border
	ctx.save();
	ctx.fillStyle = createScaledPattern(ctx, side, scale, 'repeat-y');
	ctx.translate(0, scaledSideWidth);
	ctx.fillRect(0, 0, scaledSideWidth, ctx.canvas.height);
	ctx.restore();

	// Draw right border
	ctx.save();
	ctx.fillStyle = createScaledPattern(ctx, side, scale, 'repeat-y');
	ctx.translate(ctx.canvas.width, 0);
	ctx.scale(-1, 1);
	ctx.fillRect(0, 0, scaledSideWidth, ctx.canvas.height);
	ctx.restore();

	// Draw corner borders
	const scaledCornerWidth = corner.width * scale;
	const scaledCornerHeight = corner.height * scale;

	// Top left
	ctx.save();
	ctx.imageSmoothingEnabled = false;
	ctx.drawImage(corner, 0, 0, corner.width, corner.height, 0, 0, scaledCornerWidth, scaledCornerHeight);
	ctx.restore();

	// Top right
	ctx.save();
	ctx.translate(ctx.canvas.width, 0);
	ctx.scale(-1, 1);
	ctx.imageSmoothingEnabled = false;
	ctx.drawImage(corner, 0, 0, corner.width, corner.height, 0, 0, scaledCornerWidth, scaledCornerHeight);
	ctx.restore();

	// Bottom right
	ctx.save();
	ctx.translate(ctx.canvas.width, ctx.canvas.height);
	ctx.scale(-1, -1);
	ctx.imageSmoothingEnabled = false;
	ctx.drawImage(corner, 0, 0, corner.width, corner.height, 0, 0, scaledCornerWidth, scaledCornerHeight);
	ctx.restore();

	// Bottom left
	ctx.save();
	ctx.translate(0, ctx.canvas.height);
	ctx.scale(1, -1);
	ctx.imageSmoothingEnabled = false;
	ctx.drawImage(corner, 0, 0, corner.width, corner.height, 0, 0, scaledCornerWidth, scaledCornerHeight);
	ctx.restore();
}

const spacer = 22;
const itemSize = 32;
const distanceFromEdge = spacer * 0.6;

const RENDER_SCALE = 4;

export function setupDisplayCanvas(canvas: HTMLCanvasElement, width: number, height: number) {
	canvas.width = width * RENDER_SCALE;
	canvas.height = height * RENDER_SCALE;
	canvas.style.width = `${width}px`;
	canvas.style.height = `${height}px`;
}

interface DrawBankOptions {
	canvas: HTMLCanvasElement;
	itemsSpritesheet: HTMLImageElement;
	bankSpritesheet: Spritesheet;
	bank: ItemBank;
	width: number;
	title: string | null;
	showPrice: boolean;
	sort: BankSortMethod;
	ghosts?: number[];
	showAsKC?: boolean;
	font: any;
}


function drawBank({
	canvas,
	itemsSpritesheet,
	bankSpritesheet,
	bank,
	width,
	title,
	showPrice,
	sort,
	ghosts = [],
	showAsKC = false,
	font
}: DrawBankOptions) {
	const columns = Math.floor((width - distanceFromEdge * 2) / (itemSize + spacer * 2));
	const osBank = new Bank(bank);

	for (const ghost of ghosts) {
		if (!osBank.has(ghost)) {
			osBank.add(ghost, 0);
		}
	}

	const bankEntries = osBank.items().sort(sorts[sort]);
	const chunkedLoot = chunkArr(bankEntries, Math.max(columns, 1));
	const rows = chunkedLoot.length;

	const height = Math.floor(Math.max(95, rows * (itemSize + spacer) + distanceFromEdge * 2));
	width = Math.floor(width);

	// Setup display canvas at high resolution
	setupDisplayCanvas(canvas, width, height);
	const ctx = canvas.getContext('2d', { alpha: false })!;

	// Create a dedicated renderer for the canvas
	const renderer = new Renderer({
		font: font,
		canvas: canvas
	});

	const baseFontSize = 12;

	ctx.imageSmoothingEnabled = false;
	ctx.fillStyle = '#494034';

	// Draw background pattern
	const repeaterImage = bankSpritesheet.get('repeating_bg');
	const ptrn = ctx.createPattern(repeaterImage, 'repeat')!;
	ctx.fillStyle = ptrn;
	ctx.fillRect(0, 0, width * RENDER_SCALE * 2, height * RENDER_SCALE * 2);

	for (let i = 0; i < chunkedLoot.length; i++) {
		for (let x = 0; x < chunkedLoot[i].length; x++) {
			const [item, quantity] = chunkedLoot[i][x];
			const [sX, sY, sW, sH] = (spriteSheetData as unknown as SpriteSheetData)[item.id]!;

			const spacing = spacer + distanceFromEdge;

			const xLoc = Math.floor(spacing + x * (width / columns)) * RENDER_SCALE;
			const yLoc = (Math.floor(spacing + i * (itemSize + spacer / 2)) + 12) * RENDER_SCALE;

			if (ghosts.includes(item.id) && quantity === 0) {
				ctx.globalAlpha = 0.2;
			}
			ctx.drawImage(
				itemsSpritesheet,
				sX,
				sY,
				sW,
				sH,
				xLoc + ((itemSize - sW) / 2) * RENDER_SCALE,
				yLoc + ((itemSize - sH) / 2) * RENDER_SCALE,
				sW * RENDER_SCALE,
				sH * RENDER_SCALE
			);
			ctx.globalAlpha = 1;

			const textXLoc = Math.floor((Math.floor(spacing + x * (width / columns)) - 3) * RENDER_SCALE);
			const textYLoc = Math.floor((Math.floor(spacing + i * (itemSize + spacer / 2)) + 12 + 6) * RENDER_SCALE);

			if (quantity > 0) {
				const quantityColor = generateHexColorForCashStack(quantity);
				let formattedQuantity = formatItemStackQuantity(quantity);
				if (showAsKC) formattedQuantity = `${formattedQuantity} KC`;

				// Draw shadow
				renderer.draw(textXLoc + RENDER_SCALE, textYLoc + RENDER_SCALE, formattedQuantity, { color: '#000000', scale: RENDER_SCALE });
				// Draw main text
				renderer.draw(textXLoc, textYLoc, formattedQuantity, { color: quantityColor, scale: RENDER_SCALE });
			}

			if (showPrice) {
				const value = (item.price ?? 0) * quantity;
				const fmted = toKMB(value);
				const valueColor = generateHexColorForCashStack(value);

				// Draw shadow
				renderer.draw(textXLoc + RENDER_SCALE, textYLoc + Math.floor(24 * RENDER_SCALE) + RENDER_SCALE, fmted, { color: '#000000', scale: RENDER_SCALE });
				// Draw main text
				renderer.draw(textXLoc, textYLoc + Math.floor(24 * RENDER_SCALE), fmted, { color: valueColor, scale: RENDER_SCALE });
			}
		}
	}

	drawBorder(ctx, bankSpritesheet, RENDER_SCALE);

	if (title) {
		const titleX = Math.floor((width / 2) * RENDER_SCALE);
		const titleY = Math.floor(22 * RENDER_SCALE);

		drawScaledText(ctx, title, titleX + RENDER_SCALE, titleY + RENDER_SCALE, baseFontSize, 'RuneScape Bold 12', '#000000', RENDER_SCALE);
		drawScaledText(ctx, title, titleX, titleY, baseFontSize, 'RuneScape Bold 12', '#ff981f', RENDER_SCALE);
	}

	console.log(`Generated bank image: ${width}x${height} (rendered at ${canvas.width}x${canvas.height})`);
}

export const BankImage: React.FC<Props> = ({
	bank,
	title,
	showPrice,
	sort = 'value',
	width: customWidth,
	ghosts,
	showAsKc
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const fontRef = useRef<any>(null);

	const {ref: containerRef, width} = useElementSize();

	const compactFont = useFont('OSRSFontCompact Regular', 'https://cdn.oldschool.gg/fonts/osrs-font-compact.otf');
	const boldFont = useFont('RuneScape Bold 12', 'https://cdn.oldschool.gg/fonts/osrs-font-bold.ttf');

	const [itemsSpritesheet] = useImage(spriteSheetImage.src);
	const bankSheet = useSpritesheet(
		bankSpritesheet,
		bankSpritesheetData as any as Record<string, [number, number, number, number]>
	);

	const fontsLoaded = compactFont.loaded && boldFont.loaded;
	const isFinishedLoading = fontsLoaded && itemsSpritesheet && bankSheet && canvasRef.current;

		useEffect(() => {
			if (canvasRef.current) {
				loadFont(
					'/osrs_bitmap_fonts/compact_16.png',
					'/osrs_bitmap_fonts/compact_16.json'
					).then((_font: any) => {
						fontRef.current = _font;
					})

			}
		}, [canvasRef]);

	useEffect(() => {
		if (isFinishedLoading && width > 0 && canvasRef.current && fontRef.current) {
			console.log(`Drawing bank image. ${bankSheet.image.width}x${bankSheet.image.height} spritesheet size.`);
			drawBank({
				canvas: canvasRef.current!,
				itemsSpritesheet: itemsSpritesheet!,
				bankSpritesheet: bankSheet!,
				bank,
				width: customWidth ?? Math.min(1000, width),
				title,
				showPrice,
				sort,
				ghosts,
				showAsKC: showAsKc,
				font: fontRef.current
			});
		}
	}, [isFinishedLoading, itemsSpritesheet, bankSheet, bank, customWidth, width, title, showPrice, sort, ghosts, showAsKc]);

	return (
		<div className={styles.bank_container} id="bank" ref={containerRef}>
			{isFinishedLoading ? "" : 'Loading...'}
			<canvas className={styles.bank_image_canvas} ref={canvasRef} />
		</div>
	);
};
