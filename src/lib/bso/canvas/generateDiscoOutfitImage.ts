import { DISCO_AESTHETICS, type DiscoAesthetic, type DiscoItem } from '@/lib/bso/discoBloodbath.js';

import { promises as fs } from 'node:fs';

import { CanvasModule } from '@/lib/canvas/CanvasModule.js';
import { type CanvasImage, loadImage } from '@/lib/canvas/canvasUtil.js';
import { OSRSCanvas } from '@/lib/canvas/OSRSCanvas.js';

const outfitTemplate = fs
	.readFile('./src/lib/resources/images/gear_templates/disco_outfit_template-v1.png')
	.then(loadImage);

const colors: Record<DiscoAesthetic, { positive: string; negative: string }> = {
	Futuristic: { positive: '#00d8e8', negative: '#123c71' },
	Ragdoll: { positive: '#ff4f9a', negative: '#7a1730' },
	'Anti-Fashion': { positive: '#b8ec00', negative: '#405800' }
};

const slotPositions: Record<string, [number, number]> = {
	head: [716, 178],
	cape: [590, 300],
	neck: [716, 300],
	weapon: [590, 425],
	'2h': [590, 425],
	body: [716, 425],
	shield: [840, 425],
	legs: [716, 548],
	hands: [590, 670],
	feet: [716, 670],
	ring: [840, 670]
};

const panelPositions: Array<[number, number, number, number]> = [
	[560, 14, 420, 112],
	[25, 125, 450, 145],
	[25, 335, 450, 145],
	[25, 545, 450, 145],
	[25, 750, 450, 145],
	[1055, 20, 440, 84],
	[1055, 125, 450, 145],
	[1055, 335, 450, 145],
	[1055, 545, 450, 145],
	[1055, 750, 450, 145]
];

function strongestAesthetic(item: DiscoItem) {
	return DISCO_AESTHETICS.filter(aesthetic => item.points[aesthetic] !== 0).sort(
		(a, b) => Math.abs(item.points[b]) - Math.abs(item.points[a])
	)[0];
}

function drawPanel(canvas: OSRSCanvas, x: number, y: number, width: number, height: number) {
	const { ctx } = canvas;
	ctx.fillStyle = '#4b4b47';
	ctx.fillRect(x, y, width, height);
	canvas.drawHollowSquare(x, y, width, height, '#171717');
	canvas.drawHollowSquare(x + 4, y + 4, width - 8, height - 8, '#e0d3ad');
	canvas.drawHollowSquare(x + 7, y + 7, width - 14, height - 14, '#282622');
}

function drawConnector(
	canvas: OSRSCanvas,
	from: [number, number],
	panel: [number, number, number, number],
	color: string
) {
	const { ctx } = canvas;
	const [x, y] = from;
	const [panelX, panelY, panelWidth, panelHeight] = panel;
	const endX = panelX < x ? panelX + panelWidth : panelX;
	const endY = Math.max(panelY + 18, Math.min(y, panelY + panelHeight - 18));
	const bendX = panelX < x ? endX + 25 : endX - 25;
	ctx.save();
	ctx.strokeStyle = color;
	ctx.lineWidth = 4;
	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.lineTo(bendX, y);
	ctx.lineTo(bendX, endY);
	ctx.lineTo(endX, endY);
	ctx.stroke();
	ctx.restore();
}

function drawLegend(canvas: OSRSCanvas) {
	const entries = DISCO_AESTHETICS.flatMap(aesthetic => [
		{ aesthetic, positive: true },
		{ aesthetic, positive: false }
	]);
	for (const [index, entry] of entries.entries()) {
		const x = 500 + index * 92;
		canvas.drawText({
			text: `${entry.aesthetic} ${entry.positive ? '+' : '-'}`,
			x: x + 36,
			y: 1015,
			center: true,
			font: 'TinyPixel',
			color: colors[entry.aesthetic][entry.positive ? 'positive' : 'negative']
		});
	}
}

export async function generateDiscoOutfitImage({
	items,
	user
}: {
	items: { item: DiscoItem; slot: string }[];
	user: MUser;
}) {
	await CanvasModule.waitTillReady();
	const template: CanvasImage = await outfitTemplate;
	const canvas = new OSRSCanvas({ width: template.width, height: template.height });
	canvas.ctx.drawImage(template, 0, 0);
	drawPanel(canvas, ...panelPositions[5]);

	for (const [index, scored] of items.entries()) {
		const panel = panelPositions[index];
		const position = slotPositions[scored.slot];
		if (!panel || !position) continue;
		const strongest = strongestAesthetic(scored.item);
		if (strongest) {
			drawConnector(
				canvas,
				[position[0] + 55, position[1] + 55],
				panel,
				colors[strongest][scored.item.points[strongest] < 0 ? 'negative' : 'positive']
			);
		}
	}

	for (const [index, scored] of items.entries()) {
		const panel = panelPositions[index];
		const position = slotPositions[scored.slot];
		if (!panel || !position) continue;
		const [panelX, panelY, panelWidth] = panel;
		await canvas.drawItemIDSprite({ itemID: scored.item.item.id, x: position[0] + 10, y: position[1] + 12, user });
		const points = DISCO_AESTHETICS.filter(aesthetic => scored.item.points[aesthetic] !== 0).sort(
			(a, b) => Math.abs(scored.item.points[b]) - Math.abs(scored.item.points[a])
		);
		for (const [line, aesthetic] of points.entries()) {
			const value = scored.item.points[aesthetic];
			canvas.drawText({
				text: `${aesthetic}: ${value}`,
				x: panelX + 20,
				y: panelY + 42 + line * 28,
				font: value < 0 ? 'Bold' : 'Compact',
				color: colors[aesthetic][value < 0 ? 'negative' : 'positive'],
				maxWidth: panelWidth - 40
			});
		}
	}

	drawLegend(canvas);
	return canvas.toScaledOutput(1);
}
