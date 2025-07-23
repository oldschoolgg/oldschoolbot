import { toTitleCase } from '@oldschoolgg/toolkit/string-util';
import { EquipmentSlot } from 'oldschooljs';

import { OSRSCanvas } from '@/lib/canvas/OSRSCanvas';
import { calcAspectRatioFit } from '../../canvas/canvasUtil';
import { Gear, maxDefenceStats, maxOffenceStats } from '../../structures/Gear';
import type { GearSetup, GearSetupType } from '../types';
import { GearSetupTypes } from '../types';
import { gearImages, transmogItems } from './gearImageData';

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

function drawText(canvas: OSRSCanvas, text: string, x: number, y: number, maxStat = true) {
	const ctx = canvas.ctx;

	if (text.includes(':')) {
		const texts = text.split(':');
		for (let i = 0; i < texts.length; i++) {
			const t = texts[i] + (i === 0 ? ': ' : '');
			const finalX =
				i === 0
					? x - (ctx.textAlign === 'end' ? ctx.measureText(texts[i + 1]).width - 3 : 0)
					: ctx.textAlign === 'end'
						? x
						: ctx.measureText(texts[i - 1]).width + x + 3;

			canvas.drawText({
				text: t,
				x: finalX,
				y,
				color: i === 0 ? '#ff981f' : maxStat ? '#00ff00' : '#ffffff'
			});
		}
	} else {
		canvas.drawText({
			text,
			x,
			y,
			color: '#ff981f'
		});
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
	const gearTemplateImage = await gearImages[user.user.gear_template ?? 0].template;
	const canvas = new OSRSCanvas({
		width: gearTemplateImage.width,
		height: gearTemplateImage.height,
		sprite,
		iconPackId: user.iconPackId
	});
	const ctx = canvas.ctx;

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

	if (!userBgImage.transparent) canvas.drawBorder(sprite, false);

	// Draw transmog
	const transmogItem = (gearType && transmogItems.find(t => user.gear[gearType].hasEquipped(t.item.name))) ?? null;
	const transMogImage = transmogItem === null ? null : await transmogItem.image;
	if (transMogImage) {
		const maxWidth = gearTemplateImage.width * 0.45;
		const altSize = calcAspectRatioFit(
			transMogImage.width / 2,
			transMogImage.height / 2,
			maxWidth,
			transmogItem?.maxHeight ?? gearTemplateImage.height * 0.5
		);

		const y = gearTemplateImage.height * 0.9 - altSize.height;
		ctx.drawImage(transMogImage, maxWidth / 2 - altSize.width / 2, y, altSize.width, altSize.height);
	}

	// Draw preset title
	if (gearType) {
		canvas.drawTitleText({
			text: toTitleCase(gearType),
			x: Math.floor(176 / 2),
			y: 25,
			center: true
		});
	}

	// Draw stats
	ctx.save();
	ctx.translate(225, 0);
	ctx.font = '16px RuneScape Bold 12';
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
	ctx.restore();
	canvas.drawText({
		text: 'Others',
		x: 210 + Math.floor(232 / 2),
		y: 140,
		font: 'Bold',
		color: '#ff981f',
		center: true
	});
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
		canvas.drawItemIDSprite({
			itemID: petID,
			x: 178 + slotSize / 2,
			y: 190 + slotSize / 2
		});
	}

	for (const enumName of Object.values(EquipmentSlot)) {
		const item = gearSetup[enumName];
		if (!item) continue;
		const [x, y] = slotCoordinates[enumName];
		canvas.drawItemIDSprite({
			itemID: item.item,
			x: x + slotSize / 2,
			y: y + slotSize / 2,
			quantity: item.quantity
		});
	}

	return canvas.toScaledOutput(2);
}

export async function generateAllGearImage(user: MUser) {
	const {
		sprite: bgSprite,
		uniqueSprite: hasBgSprite,
		background: userBg
	} = bankImageGenerator.getBgAndSprite(user.user.bankBackground ?? 1, user);

	const hexColor = user.user.bank_bg_hex;
	const gearTemplateImage = await gearImages[user.user.gear_template ?? 0].templateCompact;
	const width = (gearTemplateImage.width + 10) * 4 + 20;
	const height = Number(gearTemplateImage.height) * 2 + 70;
	const canvas = new OSRSCanvas({ width, height, sprite: bgSprite, iconPackId: user.iconPackId });
	const ctx = canvas.ctx;

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
	for (const gearSetupName of GearSetupTypes) {
		if (i === 4) {
			y += gearTemplateImage.height + 30;
			i = 0;
		}
		const gear = user.gear[gearSetupName];
		ctx.save();
		const x = Math.floor(gearTemplateImage.width / 2);
		const translateX = 15 + i * (gearTemplateImage.width + 10);
		ctx.translate(translateX, y);
		canvas.drawTitleText({
			text: toTitleCase(gearSetupName),
			x,
			y: -7,
			center: true
		});
		ctx.drawImage(gearTemplateImage, 0, 0, gearTemplateImage.width, gearTemplateImage.height);
		for (const enumName of Object.values(EquipmentSlot)) {
			const item = gear[enumName];
			if (!item) continue;
			const [x, y] = slotCoordinatesCompact[enumName];

			canvas.drawItemIDSprite({
				itemID: item.item,
				x: x + slotSize / 2 + 1,
				y: y + slotSize / 2 + 9,
				quantity: item.quantity
			});
		}
		i++;
		ctx.restore();
	}

	const petX = canvas.width - 50;
	const petY = canvas.height / 2 + 20;
	canvas.drawTitleText({ text: 'Pet', x: petX + 5, y: petY - 5 });
	ctx.drawImage(gearTemplateImage, 42, 1, 36, 36, petX, petY, 36, 36);
	const userPet = user.user.minion_equippedPet;
	if (userPet) {
		canvas.drawItemIDSprite({
			itemID: userPet,
			x: petX,
			y: petY
		});
	}

	if (!userBg.transparent) canvas.drawBorder(bgSprite, false);

	return canvas.toScaledOutput(2);
}
