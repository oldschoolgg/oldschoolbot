import { toTitleCase } from '@oldschoolgg/toolkit/string-util';
import { EquipmentSlot } from 'oldschooljs';

import { OSRSCanvas } from '@/lib/canvas/OSRSCanvas';
import { gearImages, transmogItems } from '../gear/functions/gearImageData';
import type { GearSetup, GearSetupType } from '../gear/types';
import { GearSetupTypes } from '../gear/types';
import { type Gear, maxDefenceStats, maxOffenceStats } from '../structures/Gear';
import { type BaseCanvasArgs, calcAspectRatioFit } from './canvasUtil';

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

function drawText({
	canvas,
	text,
	x,
	y,
	maxStat = true
}: {
	canvas: OSRSCanvas;
	text: string;
	x: number;
	y: number;
	maxStat?: boolean;
}) {
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

export async function generateGearImage({
	gearSetup,
	petID,
	gearTemplate = 0,
	iconPackId,
	gearType,
	bankBgHexColor,
	farmingContract,
	bankBackgroundId
}: {
	gearSetup: Gear;
	gearType: GearSetupType | null | undefined;
	petID: number | null;
	gearTemplate?: number;
} & BaseCanvasArgs) {
	const {
		sprite,
		uniqueSprite,
		background: userBgImage
	} = bankImageGenerator.getBgAndSprite({ bankBackgroundId, farmingContract });

	const gearStats = gearSetup.stats;
	const gearTemplateImage = await gearImages[gearTemplate].template;
	const canvas = new OSRSCanvas({
		width: gearTemplateImage.width,
		height: gearTemplateImage.height,
		sprite,
		iconPackId
	});
	const ctx = canvas.ctx;

	ctx.fillStyle = userBgImage.transparent
		? bankBgHexColor
			? bankBgHexColor
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
	const transmogItem = transmogItems.find(t => gearSetup.hasEquipped(t.item.id)) ?? null;
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
	drawText({ canvas, text: 'Attack bonus', x: 0, y: 25 });
	ctx.font = '16px OSRSFontCompact';
	drawText({
		canvas,
		text: `Stab: ${gearStats.attack_stab}`,
		x: 0,
		y: 50,
		maxStat: maxOffenceStats.attack_stab === gearStats.attack_stab
	});
	drawText({
		canvas,
		text: `Slash: ${gearStats.attack_slash}`,
		x: 0,
		y: 68,
		maxStat: maxOffenceStats.attack_slash === gearStats.attack_slash
	});
	drawText({
		canvas,
		text: `Crush: ${gearStats.attack_crush}`,
		x: 0,
		y: 86,
		maxStat: maxOffenceStats.attack_crush === gearStats.attack_crush
	});
	drawText({
		canvas,
		text: `Ranged: ${gearStats.attack_ranged}`,
		x: 0,
		y: 104,
		maxStat: maxOffenceStats.attack_ranged === gearStats.attack_ranged
	});
	drawText({
		canvas,
		text: `Magic: ${gearStats.attack_magic}`,
		x: 0,
		y: 122,
		maxStat: maxOffenceStats.attack_magic === gearStats.attack_magic
	});
	ctx.restore();
	ctx.save();
	ctx.translate(canvas.width - 6 * 2, 0);
	ctx.font = '16px RuneScape Bold 12';
	ctx.textAlign = 'end';
	drawText({ canvas, text: 'Defence bonus', x: 0, y: 25 });
	ctx.font = '16px OSRSFontCompact';
	drawText({
		canvas,
		text: `Stab: ${gearStats.defence_stab}`,
		x: 0,
		y: 50,
		maxStat: maxDefenceStats.defence_stab === gearStats.defence_stab
	});
	drawText({
		canvas,
		text: `Slash: ${gearStats.defence_slash}`,
		x: 0,
		y: 68,
		maxStat: maxDefenceStats.defence_slash === gearStats.defence_slash
	});
	drawText({
		canvas,
		text: `Crush: ${gearStats.defence_crush}`,
		x: 0,
		y: 86,
		maxStat: maxDefenceStats.defence_crush === gearStats.defence_crush
	});
	drawText({
		canvas,
		text: `Ranged: ${gearStats.defence_ranged}`,
		x: 0,
		y: 104,
		maxStat: maxDefenceStats.defence_ranged === gearStats.defence_ranged
	});
	drawText({
		canvas,
		text: `Magic: ${gearStats.defence_magic}`,
		x: 0,
		y: 122,
		maxStat: maxDefenceStats.defence_magic === gearStats.defence_magic
	});
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
	drawText({ canvas, text: `Melee Str.: ${gearStats.melee_strength}`, x: 0, y: 165, maxStat: false });
	drawText({ canvas, text: `Ranged Str.: ${gearStats.ranged_strength}`, x: 0, y: 183, maxStat: false });
	// drawText({ canvas, text: `Undead: ${(0).toFixed(1)} %`, x: 0, y: 201, maxStat: false });
	ctx.restore();
	ctx.save();
	ctx.translate(canvas.width - 6 * 2, 0);
	ctx.font = '16px OSRSFontCompact';
	ctx.textAlign = 'end';
	drawText({ canvas, text: `Magic Dmg.: ${gearStats.magic_damage.toFixed(1)}%`, x: 0, y: 165, maxStat: false });
	drawText({ canvas, text: `Prayer: ${gearStats.prayer}`, x: 0, y: 183, maxStat: false });
	ctx.restore();

	// Draw items
	if (petID) {
		await canvas.drawItemIDSprite({
			itemID: petID,
			x: 178,
			y: 190
		});
	}

	for (const enumName of Object.values(EquipmentSlot)) {
		const item = gearSetup[enumName];
		if (!item) continue;
		const [x, y] = slotCoordinates[enumName];
		await canvas.drawItemIDSprite({
			itemID: item.item,
			x: x,
			y: y,
			quantity: item.quantity === 1 ? undefined : item.quantity
		});
	}

	return canvas.toScaledOutput(2);
}

export async function generateAllGearImage({
	bankBackgroundId = 1,
	gearTemplate = 0,
	iconPackId,
	gear,
	equippedPet,
	bankBgHexColor,
	farmingContract
}: BaseCanvasArgs & {
	gearTemplate?: number;
	gear: { [key in GearSetupType]: GearSetup };
	equippedPet?: number | null;
}) {
	const {
		sprite: bgSprite,
		uniqueSprite: hasBgSprite,
		background: userBg
	} = bankImageGenerator.getBgAndSprite({ farmingContract, bankBackgroundId });

	const gearTemplateImage = await gearImages[gearTemplate].templateCompact;
	const width = (gearTemplateImage.width + 10) * 4 + 20;
	const height = Number(gearTemplateImage.height) * 2 + 70;
	const canvas = new OSRSCanvas({ width, height, sprite: bgSprite, iconPackId });
	const ctx = canvas.ctx;

	ctx.fillStyle = userBg.transparent
		? bankBgHexColor
			? bankBgHexColor
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
		const gearSetup = gear[gearSetupName];
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
			const item = gearSetup[enumName];
			if (!item) continue;
			const [x, y] = slotCoordinatesCompact[enumName];

			await canvas.drawItemIDSprite({
				itemID: item.item,
				x,
				y,
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
	if (equippedPet) {
		await canvas.drawItemIDSprite({
			itemID: equippedPet,
			x: petX,
			y: petY
		});
	}

	if (!userBg.transparent) canvas.drawBorder(bgSprite, false);

	return canvas.toScaledOutput(2);
}
