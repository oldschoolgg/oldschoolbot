/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { Canvas, createCanvas } from 'canvas';
import * as fs from 'fs';
import { KlasaClient, KlasaUser } from 'klasa';

import BankImageTask from '../../../tasks/bankImage';
import { UserSettings } from '../../settings/types/UserSettings';
import { toTitleCase } from '../../util';
import { canvasImageFromBuffer } from '../../util/canvasImageFromBuffer';
import { fillTextXTimesInCtx } from '../../util/fillTextXTimesInCtx';
import { SkillsEnum } from './../../skilling/types';

const prayerTemplateFile = fs.readFileSync('./src/lib/resources/images/prayer_template.png');
const yellowCircleFile = fs.readFileSync('./src/lib/resources/images/yellowCircle.png');

/**
 * The default positions of the prayers.
 */
const slotCoordinates: { [key: string]: [number, number] } = {
	'Thick Skin': [10, 15],
	'Burst Of Strength': [47, 15],
	'Clarity Of Thought': [84, 15],
	'Sharp Eye': [121, 15],
	'Mystic Will': [158, 15],
	'Rock Skin': [10, 52],
	'Superhuman Strength': [47, 52],
	'Improved Reflexes': [84, 52],
	'Rapid Restore': [121, 52],
	'Rapid Heal': [158, 52],
	'Protect Item': [10, 89],
	'Hawk Eye': [47, 89],
	'Mystic Lore': [84, 89],
	'Steel Skin': [121, 89],
	'Ultimate Strength': [158, 89],
	'Incredible Reflexes': [10, 126],
	'Protect From Magic': [47, 126],
	'Protect From Missiles': [84, 126],
	'Protect From Melee': [121, 126],
	'Eagle Eye': [158, 126],
	'Mystic Might': [10, 163],
	Retribution: [47, 163],
	Redemption: [84, 163],
	Smite: [121, 163],
	Preserve: [158, 163],
	Chivalry: [10, 200],
	Piety: [47, 200],
	Rigour: [84, 200],
	Augury: [121, 200]
};

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
	const prayerSetup = user.settings.get(UserSettings.SelectedPrayers);
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

	// Draw Prayer level
	ctx.save();
	ctx.translate(prayerTemplateImage.width / 2 - 12, prayerTemplateImage.height - 17);
	ctx.font = '16px RuneScape Bold 12';
	ctx.textAlign = 'start';
	drawText(canvas, `${prayerLvl}/${prayerLvl}`, 0, 0);
	ctx.restore();
	ctx.save();

	for (const prayer of prayerSetup) {
		const [x, y] = slotCoordinates[toTitleCase(prayer)];

		ctx.globalAlpha = 0.13;

		ctx.drawImage(yellowCircleImage, x, y);
	}

	return canvas.toBuffer();
}
