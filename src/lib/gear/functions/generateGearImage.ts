import { toTitleCase } from '@oldschoolgg/toolkit/util';
import { EquipmentSlot } from 'oldschooljs/dist/meta/types';

import { Gear, maxDefenceStats, maxOffenceStats } from '../../structures/Gear';
import {
	type Canvas,
	canvasToBuffer,
	createCanvas,
	drawItemQuantityText,
	drawTitleText,
	fillTextXTimesInCtx,
	loadAndCacheLocalImage
} from '../../util/canvasUtil';
import type { GearSetup, GearSetupType } from '../types';
import { GearSetupTypes } from '../types';

/**
 * The default gear in a gear setup, when nothing is equipped.
 */
const slotCoordinates: { [key in EquipmentSlot]: [number, number] } = {
	[EquipmentSlot.TwoHanded]: [15, 110],
	[EquipmentSlot.Ammo]: [112, 71],
	[EquipmentSlot.Body]: [70, 110],
	[EquipmentSlot.Cape]: [30, 71],
	[EquipmentSlot.Feet]: [70, 190],
	[EquipmentSlot.Hands]: [16, 190],
	[EquipmentSlot.Head]: [70, 31],
	[EquipmentSlot.Legs]: [70, 150],
	[EquipmentSlot.Neck]: [70, 71],
	[EquipmentSlot.Ring]: [127, 190],
	[EquipmentSlot.Shield]: [127, 110],
	[EquipmentSlot.Weapon]: [15, 108]
};

const slotCoordinatesCompact: { [key in EquipmentSlot]: [number, number] } = {
	[EquipmentSlot.Head]: [43, 1],
	[EquipmentSlot.Cape]: [2, 40],
	[EquipmentSlot.Neck]: [43, 40],
	[EquipmentSlot.Ammo]: [84, 40],
	[EquipmentSlot.TwoHanded]: [2, 79],
	[EquipmentSlot.Weapon]: [2, 79],
	[EquipmentSlot.Body]: [43, 79],
	[EquipmentSlot.Shield]: [84, 79],
	[EquipmentSlot.Legs]: [43, 119],
	[EquipmentSlot.Hands]: [2, 159],
	[EquipmentSlot.Feet]: [43, 159],
	[EquipmentSlot.Ring]: [84, 159]
};

const slotSize = 36;

function drawText(canvas: Canvas, text: string, x: number, y: number, maxStat = true) {
	const ctx = canvas.getContext('2d');
	ctx.fillStyle = '#000000';
	fillTextXTimesInCtx(ctx, text, x + 1, y + 1);
	if (text.includes(':')) {
		const texts = text.split(':');
		for (let i = 0; i < texts.length; i++) {
			const t = texts[i] + (i === 0 ? ': ' : '');
			ctx.fillStyle = i === 0 ? '#ff981f' : maxStat ? '#00ff00' : '#ffffff';
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

export async function generateGearImage(
	user: MUser,
	gearSetup: Gear | GearSetup,
	gearType: GearSetupType | null,
	petID: number | null
) {
	const bankBg = user.user.bankBackground ?? 1;

	const { sprite, uniqueSprite, background: userBgImage } = bankImageGenerator.getBgAndSprite(bankBg, user);

	const hexColor = user.user.bank_bg_hex;

	const gearStats = gearSetup instanceof Gear ? gearSetup.stats : new Gear(gearSetup).stats;
	const gearTemplateImage = await loadAndCacheLocalImage('./src/lib/resources/images/gear_template.png');
	const canvas = createCanvas(gearTemplateImage.width, gearTemplateImage.height);
	const ctx = canvas.getContext('2d');
	ctx.imageSmoothingEnabled = false;

	ctx.fillStyle = userBgImage.transparent
		? hexColor
			? hexColor
			: 'transparent'
		: ctx.createPattern(sprite.repeatableBg, 'repeat')!;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	if (!uniqueSprite) {
		ctx.drawImage(
			userBgImage.image!,
			(canvas.width - userBgImage.image!.width) * 0.5,
			(canvas.height - userBgImage.image!.height) * 0.5
		);
	}
	ctx.drawImage(gearTemplateImage, 0, 0, gearTemplateImage.width, gearTemplateImage.height);

	if (!userBgImage.transparent) bankImageGenerator.drawBorder(ctx, sprite, false);

	ctx.font = '16px OSRSFontCompact';
	// Draw preset title
	if (gearType) {
		drawTitleText(ctx, toTitleCase(gearType), Math.floor(176 / 2), 25);
	}

	// Draw stats
	ctx.save();
	ctx.translate(225, 0);
	ctx.font = '16px RuneScape Bold 12';
	ctx.textAlign = 'start';
	drawText(canvas, 'Attack bonus', 0, 25);
	ctx.font = '16px OSRSFontCompact';
	drawText(canvas, `Stab: ${gearStats.attack_stab}`, 0, 50, maxOffenceStats.attack_stab === gearStats.attack_stab);
	drawText(
		canvas,
		`Slash: ${gearStats.attack_slash}`,
		0,
		68,
		maxOffenceStats.attack_slash === gearStats.attack_slash
	);
	drawText(
		canvas,
		`Crush: ${gearStats.attack_crush}`,
		0,
		86,
		maxOffenceStats.attack_crush === gearStats.attack_crush
	);
	drawText(
		canvas,
		`Ranged: ${gearStats.attack_ranged}`,
		0,
		104,
		maxOffenceStats.attack_ranged === gearStats.attack_ranged
	);
	drawText(
		canvas,
		`Magic: ${gearStats.attack_magic}`,
		0,
		122,
		maxOffenceStats.attack_magic === gearStats.attack_magic
	);
	ctx.restore();
	ctx.save();
	ctx.translate(canvas.width - 6 * 2, 0);
	ctx.font = '16px RuneScape Bold 12';
	ctx.textAlign = 'end';
	drawText(canvas, 'Defence bonus', 0, 25);
	ctx.font = '16px OSRSFontCompact';
	drawText(canvas, `Stab: ${gearStats.defence_stab}`, 0, 50, maxDefenceStats.defence_stab === gearStats.defence_stab);
	drawText(
		canvas,
		`Slash: ${gearStats.defence_slash}`,
		0,
		68,
		maxDefenceStats.defence_slash === gearStats.defence_slash
	);
	drawText(
		canvas,
		`Crush: ${gearStats.defence_crush}`,
		0,
		86,
		maxDefenceStats.defence_crush === gearStats.defence_crush
	);
	drawText(
		canvas,
		`Ranged: ${gearStats.defence_ranged}`,
		0,
		104,
		maxDefenceStats.defence_ranged === gearStats.defence_ranged
	);
	drawText(
		canvas,
		`Magic: ${gearStats.defence_magic}`,
		0,
		122,
		maxDefenceStats.defence_magic === gearStats.defence_magic
	);
	ctx.textAlign = 'center';
	ctx.restore();
	drawTitleText(ctx, 'Others', 210 + Math.floor(232 / 2), 140);
	ctx.restore();
	ctx.save();
	ctx.translate(225, 0);
	ctx.font = '16px OSRSFontCompact';
	ctx.textAlign = 'start';
	drawText(canvas, `Melee Str.: ${gearStats.melee_strength}`, 0, 165, false);
	drawText(canvas, `Ranged Str.: ${gearStats.ranged_strength}`, 0, 183, false);
	// drawText(canvas, `Undead: ${(0).toFixed(1)} %`, 0, 201, false);
	ctx.restore();
	ctx.save();
	ctx.translate(canvas.width - 6 * 2, 0);
	ctx.font = '16px OSRSFontCompact';
	ctx.textAlign = 'end';
	drawText(canvas, `Magic Dmg.: ${gearStats.magic_damage.toFixed(1)}%`, 0, 165, false);
	drawText(canvas, `Prayer: ${gearStats.prayer}`, 0, 183, false);
	ctx.restore();

	// Draw items
	if (petID) {
		const image = await bankImageGenerator.getItemImage(petID, user);
		ctx.drawImage(
			image,
			178 + slotSize / 2 - image.width / 2,
			190 + slotSize / 2 - image.height / 2,
			image.width,
			image.height
		);
	}

	for (const enumName of Object.values(EquipmentSlot)) {
		const item = gearSetup[enumName];
		if (!item) continue;
		const image = await bankImageGenerator.getItemImage(item.item, user);

		let [x, y] = slotCoordinates[enumName];
		x = x + slotSize / 2 - image.width / 2;
		y = y + slotSize / 2 - image.height / 2;
		ctx.drawImage(image, x, y, image.width, image.height);

		if (item.quantity > 1) {
			drawItemQuantityText(ctx, item.quantity, x + 1, y + 9);
		}
	}

	return canvasToBuffer(canvas);
}

export async function generateAllGearImage(user: MUser) {
	const {
		sprite: bgSprite,
		uniqueSprite: hasBgSprite,
		background: userBg
	} = bankImageGenerator.getBgAndSprite(user.user.bankBackground ?? 1, user);

	const hexColor = user.user.bank_bg_hex;
	const gearTemplateImage = await loadAndCacheLocalImage('./src/lib/resources/images/gear_template_compact.png');
	const canvas = createCanvas((gearTemplateImage.width + 10) * 4 + 20, Number(gearTemplateImage.height) * 2 + 70);
	const ctx = canvas.getContext('2d');
	ctx.imageSmoothingEnabled = false;

	ctx.fillStyle = userBg.transparent
		? hexColor
			? hexColor
			: 'transparent'
		: ctx.createPattern(bgSprite.repeatableBg, 'repeat')!;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	if (!hasBgSprite) {
		let imgHeight = 0;
		let imgWidth = 0;
		if (userBg.transparent) {
			const ratio = canvas.width / userBg.image!.width;
			imgHeight = userBg.image!.height * ratio;
			imgWidth = canvas.width;
		} else {
			const ratio = canvas.height / userBg.image!.height;
			imgWidth = userBg.image!.width * ratio;
			imgHeight = userBg.image!.height * ratio;
		}
		ctx.drawImage(
			userBg.image!,
			(canvas.width - imgWidth) / 2,
			(canvas.height - imgHeight) / 2,
			imgWidth,
			imgHeight
		);
	}
	let i = 0;
	let y = 30;
	for (const type of GearSetupTypes) {
		if (i === 4) {
			y += gearTemplateImage.height + 30;
			i = 0;
		}
		const gear = user.gear[type];
		ctx.save();
		ctx.translate(15 + i * (gearTemplateImage.width + 10), y);
		ctx.font = '16px RuneScape Bold 12';
		ctx.textAlign = 'center';
		drawText(canvas, toTitleCase(type), gearTemplateImage.width / 2, -7);
		ctx.drawImage(gearTemplateImage, 0, 0, gearTemplateImage.width, gearTemplateImage.height);
		for (const enumName of Object.values(EquipmentSlot)) {
			const item = gear[enumName];
			if (!item) continue;
			const image = await bankImageGenerator.getItemImage(item.item, user);
			let [x, y] = slotCoordinatesCompact[enumName];
			x = x + slotSize / 2 - image.width / 2;
			y = y + slotSize / 2 - image.height / 2;
			ctx.drawImage(image, x, y, image.width, image.height);

			if (item.quantity > 1) {
				drawItemQuantityText(ctx, item.quantity, x + 1, y + 9);
			}
		}
		i++;
		ctx.restore();
	}

	ctx.font = '16px RuneScape Bold 12';
	const petX = canvas.width - 50;
	const petY = canvas.height / 2 + 20;
	drawText(canvas, 'Pet', petX + 5, petY - 5);
	ctx.drawImage(gearTemplateImage, 42, 1, 36, 36, petX, petY, 36, 36);
	const userPet = user.user.minion_equippedPet;
	if (userPet) {
		const image = await bankImageGenerator.getItemImage(userPet, user);
		ctx.drawImage(image, petX, petY, image.width, image.height);
	}

	if (!userBg.transparent) bankImageGenerator.drawBorder(ctx, bgSprite, false);

	return canvasToBuffer(canvas);
}
