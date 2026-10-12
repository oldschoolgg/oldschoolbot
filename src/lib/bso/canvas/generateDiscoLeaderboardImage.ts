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

function trimText(canvas: OSRSCanvas, text: string, maxWidth: number) {
	if (canvas.measureTextWidth(text, 'Bold') <= maxWidth) return text;
	let trimmed = text;
	while (trimmed.length > 1 && canvas.measureTextWidth(`${trimmed}…`, 'Bold') > maxWidth) {
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

function drawCard(
	canvas: OSRSCanvas,
	entry: DiscoLeaderboardEntry,
	x: number,
	y: number,
	width: number,
	height: number
) {
	const { ctx } = canvas;
	const centerX = Math.round(x + width / 2);
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
	drawTrophy(canvas, centerX, y + 5, 27);
	canvas.drawText({
		text: entry.label,
		x: centerX,
		y: y + 41,
		color: '#ffcf4c',
		center: true,
		font: 'TinyPixel'
	});
	canvas.drawText({
		text: trimText(canvas, entry.username ?? '???', width - 22),
		x: centerX,
		y: y + 57,
		color: '#f3ead1',
		center: true
	});
	canvas.drawText({
		text: entry.score.toLocaleString(),
		x: centerX,
		y: y + 73,
		color: '#fff44f',
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
	const canvas = new OSRSCanvas({ width: 500, height: 400, sprite });
	canvas.drawBackgroundPattern(sprite);
	canvas.ctx.imageSmoothingEnabled = false;
	canvas.drawBorder(sprite);

	canvas.drawTitleText({ text: 'Disco Bloodbath Leaders!', x: 250, y: 22, center: true });

	const { ctx } = canvas;
	ctx.fillStyle = 'rgba(23, 22, 19, 0.9)';
	ctx.fillRect(45, 34, 410, 94);
	ctx.strokeStyle = '#efc84c';
	ctx.lineWidth = 2;
	ctx.strokeRect(46, 35, 408, 92);
	drawTrophy(canvas, 250, 38, 55, true);
	canvas.drawText({
		text: trimText(canvas, overall.username ?? '???', 260),
		x: 250,
		y: 100,
		color: '#fff3c4',
		center: true
	});
	canvas.drawText({
		text: `${overall.score.toLocaleString()} combined points`,
		x: 250,
		y: 112,
		color: '#fff44f',
		center: true
	});
	const pointText = DISCO_AESTHETICS.map(
		aesthetic => `${aesthetic}: ${overall.points[aesthetic].toLocaleString()}`
	).join('     ');
	canvas.drawText({ text: pointText, x: 250, y: 121, color: '#d9cead', center: true, font: 'TinyPixel' });

	const cardWidth = 143;
	const cardHeight = 82;
	for (const [index, entry] of leaders.entries()) {
		const row = Math.floor(index / 3);
		const column = index % 3;
		drawCard(canvas, entry, 28 + column * 157, 142 + row * 92, cardWidth, cardHeight);
	}

	const winners = new Set(
		[overall, ...leaders].flatMap(entry => (entry.username ? [entry.username.toLowerCase()] : []))
	);
	if (winners.size > 1) {
		canvas.drawText({
			text: 'Only 1 prize will be awarded per player. If a player wins more than 1 category, the next-highest player will win one of the prizes.',
			x: 250,
			y: 340,
			color: '#f3ead1',
			font: 'Compact',
			center: true,
			maxWidth: 420,
			lineHeight: 16
		});
	}

	return canvas.toScaledOutput(2);
}
