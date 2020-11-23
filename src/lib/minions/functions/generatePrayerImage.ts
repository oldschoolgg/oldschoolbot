/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { Canvas, createCanvas } from 'canvas';
import * as fs from 'fs';
import { KlasaClient, KlasaUser } from 'klasa';

import BankImageTask from '../../../tasks/bankImage';
import { UserSettings } from '../../settings/types/UserSettings';
import { canvasImageFromBuffer } from '../../util/canvasImageFromBuffer';
import { drawTitleText } from '../../util/drawTitleText';
import { fillTextXTimesInCtx } from '../../util/fillTextXTimesInCtx';
import { SkillsEnum } from './../../skilling/types';

const prayerTemplateFile = fs.readFileSync('./src/lib/resources/images/prayer_template.png');
const yellowCircleFile = fs.readFileSync('./src/lib/resources/images/yellowCircle.png');

/**
 * The default positions of the prayers.
 */
const slotCoordinates: { [key: string]: [number, number] } = {
	'Thick Skin': [15, 15],
	'Burst of Strength': [15, 30],
	'Clarity of Thought': [15, 45],
	'Sharp Eye': [15, 60],
	'Mystic Will': [15, 75],
	'Rock Skin': [30, 15],
	'Superhuman Strength': [30, 30],
	'Improved Reflexes': [30, 45],
	'Rapid Restore': [30, 60],
	'Rapid Heal': [30, 75],
	'Protect Item': [45, 15],
	'Hawk Eye': [45, 30],
	'Mystic Lore': [45, 45],
	'Steel Skin': [45, 60],
	'Ultimate Strength': [45, 75],
	'Incredible Reflexes': [60, 15],
	'Protect from Magic': [60, 30],
	'Protect from Missiles': [60, 45],
	'Protect from Melee': [60, 60],
	'Eagle Eye': [60, 75],
	'Mystic Might': [75, 15],
	Retribution: [75, 30],
	Redemption: [75, 45],
	Smite: [75, 60],
	Preserve: [75, 75],
	Chivalry: [90, 15],
	Piety: [90, 30],
	Rigour: [90, 45],
	Augury: [90, 60]
};

const tempPrayerSelection = ['Rapid Heal', 'Hawk Eye', 'Smite'];

const slotSize = 15;

let bankTask: BankImageTask | null = null;

function drawText(canvas: Canvas, text: string, x: number, y: number) {
	const ctx = canvas.getContext('2d');
	ctx.fillStyle = '#000000';
	fillTextXTimesInCtx(ctx, text, x + 1, y + 1);
	if (text.includes(':')) {
		const texts = text.split(':');
		for (let i = 0; i < texts.length; i++) {
			const t = texts[i] + (i === 0 ? ': ' : '');
			ctx.fillStyle = i === 0 ? '#ff981f' : '#ffffff';
			fillTextXTimesInCtx(
				ctx,
				t,
				i === 0
					? x - (ctx.textAlign === 'end' ? ctx.measureText(texts[i + 1]).width - 3 : 0)
					: ctx.textAlign === 'end'
					? x
					: ctx.measureText(texts[i - 1]).width + x + 3,
				y
			);
		}
	} else {
		ctx.fillStyle = '#ff981f';
		fillTextXTimesInCtx(ctx, text, x, y);
	}
}

export async function generatePrayerImage(client: KlasaClient, user: KlasaUser) {
	// Init the background images if they are not already
	if (!bankTask) {
		bankTask = client.tasks.get('bankImage') as BankImageTask;
	}

	const userBgID = user.settings.get(UserSettings.BankBackground) ?? 1;
	const userBg = bankTask.backgroundImages.find(i => i.id === userBgID)!.image!;
	// Temp
	const prayerSetup = tempPrayerSelection;
	const prayerLvl = user.skillLevel(SkillsEnum.Prayer);
	const prayerTemplateImage = await canvasImageFromBuffer(prayerTemplateFile);
	const yellowCircleImage = await canvasImageFromBuffer(yellowCircleFile);
	const canvas = createCanvas(prayerTemplateImage.width, prayerTemplateImage.height);
	const ctx = canvas.getContext('2d');
	ctx.imageSmoothingEnabled = false;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(
		userBg,
		(canvas.width - userBg.width) * 0.5,
		(canvas.height - userBg.height) * 0.5
	);
	ctx.drawImage(prayerTemplateImage, 0, 0, prayerTemplateImage.width, prayerTemplateImage.height);
	bankTask?.drawBorder(canvas, false);

	ctx.font = '16px OSRSFontCompact';
	// Draw preset title
	drawTitleText(ctx, 'Hey', Math.floor(176 / 2), 25);

	// Draw Prayer level
	ctx.save();
	ctx.translate(225, 198);
	ctx.font = '16px RuneScape Bold 12';
	ctx.textAlign = 'start';
	drawText(canvas, `${prayerLvl}`, 0, 0);
	ctx.restore();
	ctx.save();

	for (const prayer of prayerSetup) {
		const [x, y] = slotCoordinates[prayer];

		ctx.globalAlpha = 0.5;

		ctx.drawImage(
			yellowCircleImage,
			x + slotSize / 2 - yellowCircleImage.width / 2,
			y + slotSize / 2 - yellowCircleImage.height / 2,
			yellowCircleImage.width,
			yellowCircleImage.height
		);
	}

	return canvas.toBuffer();
}
