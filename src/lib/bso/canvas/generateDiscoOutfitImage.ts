import { DISCO_AESTHETIC_COLORS, DISCO_AESTHETICS, type DiscoItem } from '@/lib/bso/discoBloodbath.js';

import { promises as fs } from 'node:fs';

import { CanvasModule } from '@/lib/canvas/CanvasModule.js';
import { type CanvasImage, loadImage } from '@/lib/canvas/canvasUtil.js';
import { OSRSCanvas } from '@/lib/canvas/OSRSCanvas.js';

const outfitTemplate = fs
	.readFile('./src/lib/resources/images/gear_templates/disco_outfit_template-v1.png')
	.then(loadImage);

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

type Side = 'left' | 'right';
type Panel = [number, number, number, number];
type Route = {
	side: Side;
	panelIndex: number;
	points: [number, number][];
};

const PANEL_WIDTH = 450;
const PANEL_HEIGHT = 140;
const PANEL_YS = [100, 258, 416, 574, 732];
const panelPositions: Record<Side, Panel[]> = {
	left: PANEL_YS.map(y => [25, y, PANEL_WIDTH, PANEL_HEIGHT]),
	right: PANEL_YS.map(y => [1061, y, PANEL_WIDTH, PANEL_HEIGHT])
};

// These intentionally meet the equipment frames off-centre. Matching the
// stepped, diagonal joins keeps the panel layout from looking mechanically centred.
const routes: Record<string, Route> = {
	head: {
		side: 'left',
		panelIndex: 0,
		points: [
			[475, 164],
			[641, 164],
			[716, 236]
		]
	},
	cape: {
		side: 'left',
		panelIndex: 1,
		points: [
			[475, 322],
			[551, 322],
			[590, 386]
		]
	},
	weapon: {
		side: 'left',
		panelIndex: 2,
		points: [
			[475, 480],
			[590, 480]
		]
	},
	hands: {
		side: 'left',
		panelIndex: 3,
		points: [
			[475, 644],
			[544, 644],
			[590, 725]
		]
	},
	feet: {
		side: 'left',
		panelIndex: 4,
		points: [
			[475, 837],
			[760, 837],
			[770, 779]
		]
	},
	neck: {
		side: 'right',
		panelIndex: 0,
		points: [
			[1061, 168],
			[916, 168],
			[816, 332]
		]
	},
	shield: {
		side: 'right',
		panelIndex: 2,
		points: [
			[1061, 480],
			[950, 480]
		]
	},
	body: {
		side: 'right',
		panelIndex: 1,
		points: [
			[1061, 330],
			[938, 330],
			[816, 428]
		]
	},
	legs: {
		side: 'right',
		panelIndex: 3,
		points: [
			[1061, 637],
			[942, 637],
			[816, 590]
		]
	},
	ring: {
		side: 'right',
		panelIndex: 4,
		points: [
			[1061, 814],
			[1016, 716],
			[950, 716]
		]
	}
};

function routeForSlot(slot: string) {
	return routes[slot === '2h' ? 'weapon' : slot];
}

function strongestAesthetic(item: DiscoItem) {
	return DISCO_AESTHETICS.filter(aesthetic => item.points[aesthetic] !== 0).sort(
		(a, b) => Math.abs(item.points[b]) - Math.abs(item.points[a])
	)[0];
}

function drawChamferedRect(
	canvas: OSRSCanvas,
	x: number,
	y: number,
	width: number,
	height: number,
	corner: number,
	color: string,
	lineWidth: number
) {
	const { ctx } = canvas;
	ctx.strokeStyle = color;
	ctx.lineWidth = lineWidth;
	ctx.beginPath();
	ctx.moveTo(x + corner, y);
	ctx.lineTo(x + width - corner, y);
	ctx.lineTo(x + width, y + corner);
	ctx.lineTo(x + width, y + height - corner);
	ctx.lineTo(x + width - corner, y + height);
	ctx.lineTo(x + corner, y + height);
	ctx.lineTo(x, y + height - corner);
	ctx.lineTo(x, y + corner);
	ctx.closePath();
	ctx.stroke();
}

function drawPanel(canvas: OSRSCanvas, x: number, y: number, width: number, height: number) {
	const { ctx } = canvas;
	ctx.fillStyle = '#4b4b47';
	ctx.fillRect(x + 4, y + 4, width - 8, height - 8);
	drawChamferedRect(canvas, x + 2, y + 2, width - 4, height - 4, 14, '#171717', 6);
	drawChamferedRect(canvas, x + 6, y + 6, width - 12, height - 12, 11, '#e0d3ad', 3);
	drawChamferedRect(canvas, x + 10, y + 10, width - 20, height - 20, 8, '#282622', 2);
}

function drawConnector(canvas: OSRSCanvas, route: Route, color: string) {
	const { ctx } = canvas;
	ctx.save();
	ctx.strokeStyle = color;
	ctx.lineWidth = 5;
	ctx.lineCap = 'butt';
	ctx.lineJoin = 'miter';
	ctx.beginPath();
	ctx.moveTo(...route.points[0]);
	for (const point of route.points.slice(1)) ctx.lineTo(...point);
	ctx.stroke();
	ctx.restore();
}

function trimText(canvas: OSRSCanvas, text: string, font: 'Bold', maxWidth: number, scale: number) {
	if (canvas.measureTextWidth(text, font) * scale <= maxWidth) return text;
	let trimmed = text;
	while (trimmed.length > 1 && canvas.measureTextWidth(`${trimmed}…`, font) * scale > maxWidth) {
		trimmed = trimmed.slice(0, -1);
	}
	return `${trimmed}…`;
}

function drawLegend(canvas: OSRSCanvas) {
	const entries = DISCO_AESTHETICS.flatMap(aesthetic => [
		{ aesthetic, positive: true },
		{ aesthetic, positive: false }
	]);
	for (const [index, entry] of entries.entries()) {
		const x = 500 + index * 92;
		drawScaledText(canvas, {
			text: `${entry.aesthetic} ${entry.positive ? '+' : '-'}`,
			x: x + 36,
			y: 1008,
			center: true,
			font: 'TinyPixel',
			color: DISCO_AESTHETIC_COLORS[entry.aesthetic][entry.positive ? 'positive' : 'negative'],
			scale: 1.2
		});
	}
}

function drawSupernova(canvas: OSRSCanvas, x: number, y: number) {
	const { ctx } = canvas;
	const rays = [
		[-92, -27],
		[-54, -42],
		[-20, -68],
		[20, -68],
		[54, -42],
		[92, -27],
		[78, 8],
		[96, 28],
		[45, 28],
		[20, 51],
		[-20, 51],
		[-45, 28],
		[-96, 28],
		[-78, 8]
	] as const;

	ctx.save();
	ctx.globalAlpha = 0.42;
	ctx.fillStyle = '#f0e7ca';
	ctx.beginPath();
	for (const [index, [rayX, rayY]] of rays.entries()) {
		const next = rays[(index + 1) % rays.length];
		ctx.moveTo(x, y);
		ctx.lineTo(x + rayX, y + rayY);
		ctx.lineTo(x + next[0] * 0.58, y + next[1] * 0.58);
	}
	ctx.fill();
	ctx.globalAlpha = 0.85;
	ctx.strokeStyle = '#fff6d8';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.arc(x, y, 38, 0, Math.PI * 2);
	ctx.stroke();
	ctx.restore();
}

function drawTotalNode(
	canvas: OSRSCanvas,
	{ label, value, x, y, color, emphasized = false }: {
		label: string;
		value: number;
		x: number;
		y: number;
		color: string;
		emphasized?: boolean;
	}
) {
	const width = emphasized ? 182 : 156;
	const height = emphasized ? 66 : 54;
	const { ctx } = canvas;
	ctx.save();
	ctx.globalAlpha = emphasized ? 0.95 : 0.88;
	ctx.fillStyle = '#252522';
	ctx.fillRect(x - width / 2, y - height / 2, width, height);
	ctx.restore();
	drawChamferedRect(canvas, x - width / 2, y - height / 2, width, height, 10, '#171717', 5);
	drawChamferedRect(canvas, x - width / 2 + 5, y - height / 2 + 5, width - 10, height - 10, 7, color, 2);
	drawScaledText(canvas, {
		text: label,
		x,
		y: y - (emphasized ? 8 : 5),
		center: true,
		font: 'Bold',
		color: '#f0e7ca',
		scale: emphasized ? 1.65 : 1.35
	});
	drawScaledText(canvas, {
		text: String(value),
		x,
		y: y + (emphasized ? 22 : 18),
		center: true,
		font: 'Bold',
		color,
		scale: emphasized ? 2.25 : 1.8
	});
}

function drawOutfitTotals(canvas: OSRSCanvas, points: Record<(typeof DISCO_AESTHETICS)[number], number>) {
	const center: [number, number] = [768, 119];
	const nodes = [
		{ aesthetic: 'Futuristic', x: 558, y: 49 },
		{ aesthetic: 'Ragdoll', x: 768, y: 31 },
		{ aesthetic: 'Anti-Fashion', x: 978, y: 49 }
	] as const;
	const { ctx } = canvas;

	ctx.save();
	ctx.lineWidth = 3;
	ctx.globalAlpha = 0.8;
	for (const node of nodes) {
		ctx.strokeStyle = DISCO_AESTHETIC_COLORS[node.aesthetic][points[node.aesthetic] < 0 ? 'negative' : 'positive'];
		ctx.beginPath();
		ctx.moveTo(node.x, node.y + 28);
		ctx.lineTo(center[0], center[1] - 22);
		ctx.stroke();
	}
	ctx.restore();

	drawSupernova(canvas, ...center);
	for (const node of nodes) {
		drawTotalNode(canvas, {
			label: node.aesthetic,
			value: points[node.aesthetic],
			x: node.x,
			y: node.y,
			color: DISCO_AESTHETIC_COLORS[node.aesthetic][points[node.aesthetic] < 0 ? 'negative' : 'positive']
		});
	}
	drawTotalNode(canvas, {
		label: 'Combined',
		value: Object.values(points).reduce((total, value) => total + value, 0),
		x: center[0],
		y: center[1],
		color: '#fff6d8',
		emphasized: true
	});
}

function totalOutfitPoints(items: { item: DiscoItem }[]) {
	const totals = Object.fromEntries(DISCO_AESTHETICS.map(aesthetic => [aesthetic, 0])) as Record<
		(typeof DISCO_AESTHETICS)[number],
		number
	>;
	for (const { item } of items) {
		for (const aesthetic of DISCO_AESTHETICS) totals[aesthetic] += item.points[aesthetic];
	}
	return totals;
}

function drawScaledText(
	canvas: OSRSCanvas,
	{
		text,
		x,
		y,
		font,
		color,
		scale,
		center = false,
		maxWidth
	}: {
		text: string;
		x: number;
		y: number;
		font: 'Compact' | 'Bold' | 'TinyPixel';
		color: string;
		scale: number;
		center?: boolean;
		maxWidth?: number;
	}
) {
	canvas.ctx.save();
	canvas.ctx.translate(x, y);
	canvas.ctx.scale(scale, scale);
	canvas.drawText({ text, x: 0, y: 0, font, color, center, maxWidth: maxWidth && maxWidth / scale });
	canvas.ctx.restore();
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
	drawOutfitTotals(canvas, totalOutfitPoints(items));

	const routeColors = new Map<string, string>();
	for (const scored of items) {
		const strongest = strongestAesthetic(scored.item);
		if (strongest) {
			routeColors.set(
				scored.slot === '2h' ? 'weapon' : scored.slot,
				DISCO_AESTHETIC_COLORS[strongest][scored.item.points[strongest] < 0 ? 'negative' : 'positive']
			);
		}
	}
	for (const [slot, route] of Object.entries(routes))
		drawConnector(canvas, route, routeColors.get(slot) ?? '#969693');
	for (const panels of Object.values(panelPositions)) {
		for (const panel of panels) drawPanel(canvas, ...panel);
	}

	for (const scored of items) {
		const route = routeForSlot(scored.slot);
		const panel = route && panelPositions[route.side][route.panelIndex];
		const position = slotPositions[scored.slot];
		if (!panel || !position) continue;
		const [panelX, panelY, panelWidth] = panel;
		await canvas.drawItemIDSprite({
			itemID: scored.item.item.id,
			x: position[0] + 9,
			y: position[1] + 9,
			size: { width: 92, height: 92 },
			user
		});
		const points = DISCO_AESTHETICS.filter(aesthetic => scored.item.points[aesthetic] !== 0).sort(
			(a, b) => Math.abs(scored.item.points[b]) - Math.abs(scored.item.points[a])
		);
		const nameScale = Math.max(
			1.4,
			Math.min(2.1, (panelWidth - 40) / canvas.measureTextWidth(scored.item.item.name, 'Bold'))
		);
		drawScaledText(canvas, {
			text: trimText(canvas, scored.item.item.name, 'Bold', panelWidth - 40, nameScale),
			x: panelX + 20,
			y: panelY + 35,
			font: 'Bold',
			color: '#f0e7ca',
			scale: nameScale
		});
		for (const [line, aesthetic] of points.entries()) {
			const value = scored.item.points[aesthetic];
			drawScaledText(canvas, {
				text: `${aesthetic}: ${value}`,
				x: panelX + 20,
				y: panelY + 66 + line * 25,
				font: 'Bold',
				color: DISCO_AESTHETIC_COLORS[aesthetic][value < 0 ? 'negative' : 'positive'],
				maxWidth: panelWidth - 40,
				scale: 1.8
			});
		}
	}

	drawLegend(canvas);
	return canvas.toScaledOutput(1);
}
