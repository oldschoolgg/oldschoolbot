import { DISCO_AESTHETICS } from '@/lib/bso/discoBloodbath.js';

import { bankImageTask } from '@/lib/canvas/bankImage.js';
import { OSRSCanvas } from '@/lib/canvas/OSRSCanvas.js';

export type DiscoLeaderboardEntry = {
	label: string;
	username: string | null;
	score: number;
};

export type DiscoOverallLeader = DiscoLeaderboardEntry & {
	points: Record<(typeof DISCO_AESTHETICS)[number], number>;
};

function drawScaledText(
	canvas: OSRSCanvas,
	{
		text,
		x,
		y,
		color,
		scale,
		center = false,
		font = 'Bold'
	}: {
		text: string;
		x: number;
		y: number;
		color: string;
		scale: number;
		center?: boolean;
		font?: 'Bold' | 'Compact' | 'TinyPixel';
	}
) {
	canvas.ctx.save();
	canvas.ctx.translate(x, y);
	canvas.ctx.scale(scale, scale);
	canvas.drawText({ text, x: 0, y: 0, color, center, font });
	canvas.ctx.restore();
}

function trimText(canvas: OSRSCanvas, text: string, maxWidth: number, scale: number) {
	if (canvas.measureTextWidth(text, 'Bold') * scale <= maxWidth) return text;
	let trimmed = text;
	while (trimmed.length > 1 && canvas.measureTextWidth(`${trimmed}…`, 'Bold') * scale > maxWidth) {
		trimmed = trimmed.slice(0, -1);
	}
	return `${trimmed}…`;
}

function drawTrophy(canvas: OSRSCanvas, x: number, y: number, size: number, glow = false) {
	const { ctx } = canvas;
	if (glow) canvas.drawGlowingBlur(x, y + size * 0.43, size * 0.42, '#ffcb3d', size * 0.3, 1.5);
	ctx.save();
	ctx.translate(x, y);
	ctx.scale(size / 100, size / 100);
	ctx.lineJoin = 'round';
	ctx.lineWidth = 7;
	ctx.strokeStyle = '#593a08';
	ctx.fillStyle = '#f8c63c';
	ctx.beginPath();
	ctx.moveTo(-32, 8);
	ctx.lineTo(32, 8);
	ctx.lineTo(24, 48);
	ctx.quadraticCurveTo(0, 72, -24, 48);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(-32, 17);
	ctx.lineTo(-53, 17);
	ctx.quadraticCurveTo(-48, 55, -22, 49);
	ctx.moveTo(32, 17);
	ctx.lineTo(53, 17);
	ctx.quadraticCurveTo(48, 55, 22, 49);
	ctx.stroke();
	ctx.fillStyle = '#fff19b';
	ctx.fillRect(-17, 15, 12, 9);
	ctx.fillStyle = '#b0700a';
	ctx.fillRect(-9, 66, 18, 17);
	ctx.fillStyle = '#f8c63c';
	ctx.fillRect(-34, 82, 68, 14);
	ctx.strokeRect(-34, 82, 68, 14);
	ctx.restore();
}

function drawCard(canvas: OSRSCanvas, entry: DiscoLeaderboardEntry, x: number, y: number, width: number, height: number) {
	const { ctx } = canvas;
	ctx.save();
	ctx.fillStyle = 'rgba(28, 27, 24, 0.88)';
	ctx.fillRect(x, y, width, height);
	ctx.strokeStyle = '#d8bd71';
	ctx.lineWidth = 3;
	ctx.strokeRect(x + 2, y + 2, width - 4, height - 4);
	ctx.strokeStyle = '#221b10';
	ctx.lineWidth = 2;
	ctx.strokeRect(x + 8, y + 8, width - 16, height - 16);
	ctx.restore();
	drawTrophy(canvas, x + width / 2, y + 13, 54);
	drawScaledText(canvas, {
		text: entry.label,
		x: x + width / 2,
		y: y + 84,
		color: '#ffcf4c',
		scale: 1.05,
		center: true,
		font: 'TinyPixel'
	});
	drawScaledText(canvas, {
		text: trimText(canvas, entry.username ?? 'Unclaimed', width - 22, 1.35),
		x: x + width / 2,
		y: y + 112,
		color: '#f3ead1',
		scale: 1.35,
		center: true
	});
	drawScaledText(canvas, {
		text: entry.score.toLocaleString(),
		x: x + width / 2,
		y: y + 139,
		color: '#fff44f',
		scale: 1.25,
		center: true
	});
}

export async function generateDiscoLeaderboardImage({
	overall,
	leaders
}: {
	overall: DiscoOverallLeader;
	leaders: DiscoLeaderboardEntry[];
}) {
	if (!bankImageTask.ready) {
		await bankImageTask.init();
		bankImageTask.ready = true;
	}
	const { sprite } = bankImageTask.getBgAndSprite({ bankBackgroundId: 1 });
	const canvas = new OSRSCanvas({ width: 1000, height: 890, sprite });
	canvas.drawBackgroundPattern(sprite);

	drawScaledText(canvas, {
		text: 'Disco Bloodbath Leaders!',
		x: 500,
		y: 44,
		color: '#ff9d22',
		scale: 2.25,
		center: true
	});

	const { ctx } = canvas;
	ctx.fillStyle = 'rgba(23, 22, 19, 0.9)';
	ctx.fillRect(90, 80, 820, 198);
	ctx.strokeStyle = '#efc84c';
	ctx.lineWidth = 4;
	ctx.strokeRect(93, 83, 814, 192);
	drawTrophy(canvas, 500, 88, 115, true);
	drawScaledText(canvas, {
		text: trimText(canvas, overall.username ?? 'Unclaimed', 520, 2),
		x: 500,
		y: 205,
		color: '#fff3c4',
		scale: 2,
		center: true
	});
	drawScaledText(canvas, {
		text: `${overall.score.toLocaleString()} combined points`,
		x: 500,
		y: 235,
		color: '#fff44f',
		scale: 1.45,
		center: true
	});
	const pointText = DISCO_AESTHETICS.map(
		aesthetic => `${aesthetic}: ${overall.points[aesthetic].toLocaleString()}`
	).join('     ');
	drawScaledText(canvas, {
		text: pointText,
		x: 500,
		y: 263,
		color: '#d9cead',
		scale: 0.87,
		center: true,
		font: 'TinyPixel'
	});

	const cardWidth = 286;
	const cardHeight = 174;
	for (const [index, entry] of leaders.entries()) {
		const row = Math.floor(index / 3);
		const column = index % 3;
		drawCard(canvas, entry, 55 + column * 315, 322 + row * 214, cardWidth, cardHeight);
	}

	canvas.drawBorder(sprite);
	return canvas.toScaledOutput(1);
}
