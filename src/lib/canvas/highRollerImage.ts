import type { SendableFile } from '@oldschoolgg/discord';
import { toKMB } from 'oldschooljs';

import { CanvasModule } from '@/lib/canvas/CanvasModule.js';
import { OSRSCanvas } from '@/lib/canvas/OSRSCanvas.js';

export type HighRollerImageEntry = {
	position: number;
	username: string;
	itemID: number;
	itemName: string;
	value: number;
};

export async function drawHighRollerImage({ rolls }: { rolls: HighRollerImageEntry[] }): Promise<SendableFile | null> {
	if (rolls.length === 0) {
		return null;
	}

	await CanvasModule.ensureInit();
	const MAX_VISIBLE_ROLLS = 20;
	const padding = 20;
	const headerHeight = 40;
	const rowHeight = 44;
	const width = 520;
	const displayedRolls = rolls.slice(0, MAX_VISIBLE_ROLLS);
	const overflow = rolls.length - displayedRolls.length;
	const overflowHeight = overflow > 0 ? rowHeight : 0;
	const height = padding * 2 + headerHeight + rowHeight * displayedRolls.length + overflowHeight;

	const canvas = new OSRSCanvas({ width, height });

	// Background
	canvas.ctx.fillStyle = '#1a1a1a';
	canvas.ctx.fillRect(0, 0, width, height);

	// Header
	canvas.drawTitleText({ text: 'High Roller Results', x: Math.floor(width / 2), y: padding + 4, center: true });

	for (const [index, roll] of displayedRolls.entries()) {
		const rowTop = padding + headerHeight + index * rowHeight;
		const iconX = padding;
		const iconY = rowTop + 4;
		await canvas.drawItemIDSprite({ itemID: roll.itemID, x: iconX, y: iconY });

		const textX = iconX + 52;
		const username = truncate(roll.username, 24);
		const itemName = truncate(roll.itemName, 32);
		canvas.drawText({
			text: `${roll.position}. ${username}`,
			x: textX,
			y: rowTop + 18,
			color: OSRSCanvas.COLORS.WHITE,
			font: 'Bold'
		});
		canvas.drawText({
			text: `${itemName} (${toKMB(roll.value)} GP)`,
			x: textX,
			y: rowTop + 34,
			color: OSRSCanvas.COLORS.YELLOW
		});
	}

	if (overflow > 0) {
		const overflowY = padding + headerHeight + displayedRolls.length * rowHeight + Math.floor(rowHeight / 2);
		canvas.drawText({
			text: `...and ${overflow} more participants`,
			x: Math.floor(width / 2),
			y: overflowY,
			color: '#b2b2b2',
			font: 'Bold',
			center: true
		});
	}

	const scale = rolls.length > MAX_VISIBLE_ROLLS ? 1.5 : 2;
	const buffer = await canvas.toScaledOutput(scale);
	return { name: 'high-roller-results.png', buffer };
}

function truncate(text: string, maxLength: number): string {
	if (text.length <= maxLength) {
		return text;
	}
	if (maxLength <= 1) {
		return text.slice(0, maxLength);
	}
	return `${text.slice(0, maxLength - 1)}…`;
}
