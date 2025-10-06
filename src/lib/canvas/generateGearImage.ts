import { toTitleCase } from '@oldschoolgg/toolkit';
import { EquipmentSlot } from 'oldschooljs';

import { bankImageTask } from '@/lib/canvas/bankImage.js';
import { type BaseCanvasArgs, calcAspectRatioFit } from '@/lib/canvas/canvasUtil.js';
import { gearImages, transmogItems } from '@/lib/canvas/gearImageData.js';
import { OSRSCanvas } from '@/lib/canvas/OSRSCanvas.js';
import type { GearSetup, GearSetupType } from '@/lib/gear/types.js';
import { GearSetupTypes } from '@/lib/gear/types.js';
import { type Gear, maxDefenceStats, maxOffenceStats } from '@/lib/structures/Gear.js';

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

interface StatGroup {
	title: string;
	stats: Array<{
		label: string;
		statKey: string;
		value: number | string;
		checkMax?: boolean;
	}>;
}

function isMaxStat(statKey: string, value: number): boolean {
	const maxStats = { ...maxOffenceStats, ...maxDefenceStats };
	return maxStats[statKey as keyof typeof maxStats] === value;
}

function drawGearStats(canvas: OSRSCanvas, gearStats: any) {
	// Define stat groups with their data
	const attackStats: StatGroup = {
		title: 'Attack bonus',
		stats: [
			{ label: 'Stab', statKey: 'attack_stab', value: gearStats.attack_stab, checkMax: true },
			{ label: 'Slash', statKey: 'attack_slash', value: gearStats.attack_slash, checkMax: true },
			{ label: 'Crush', statKey: 'attack_crush', value: gearStats.attack_crush, checkMax: true },
			{ label: 'Ranged', statKey: 'attack_ranged', value: gearStats.attack_ranged, checkMax: true },
			{ label: 'Magic', statKey: 'attack_magic', value: gearStats.attack_magic, checkMax: true }
		]
	};

	const defenseStats: StatGroup = {
		title: 'Defence bonus',
		stats: [
			{ label: 'Stab', statKey: 'defence_stab', value: gearStats.defence_stab, checkMax: true },
			{ label: 'Slash', statKey: 'defence_slash', value: gearStats.defence_slash, checkMax: true },
			{ label: 'Crush', statKey: 'defence_crush', value: gearStats.defence_crush, checkMax: true },
			{ label: 'Ranged', statKey: 'defence_ranged', value: gearStats.defence_ranged, checkMax: true },
			{ label: 'Magic', statKey: 'defence_magic', value: gearStats.defence_magic, checkMax: true }
		]
	};

	const otherStats = [
		{ label: 'Melee Str.', statKey: 'melee_strength', value: gearStats.melee_strength, checkMax: false },
		{ label: 'Ranged Str.', statKey: 'ranged_strength', value: gearStats.ranged_strength, checkMax: false },
		{
			label: 'Magic Dmg.',
			statKey: 'magic_damage',
			value: `${gearStats.magic_damage.toFixed(1)}%`,
			checkMax: false
		},
		{ label: 'Prayer', statKey: 'prayer', value: gearStats.prayer, checkMax: false }
	];

	// Helper function to draw a stat group
	function drawStatGroup(statGroup: StatGroup, x: number, align: 'start' | 'end') {
		canvas.ctx.save();
		canvas.ctx.translate(x, 0);
		canvas.ctx.textAlign = align;

		// Draw title
		canvas.ctx.font = '16px RuneScape Bold 12';
		drawText({ canvas, text: statGroup.title, x: 0, y: 25 });

		// Draw stats
		canvas.ctx.font = '16px OSRSFontCompact';
		for (const [index, stat] of statGroup.stats.entries()) {
			const y = 50 + index * 18;
			const isMax = stat.checkMax && typeof stat.value === 'number' ? isMaxStat(stat.statKey, stat.value) : false;

			drawText({
				canvas,
				text: `${stat.label}: ${stat.value}`,
				x: 0,
				y,
				maxStat: isMax
			});
		}

		canvas.ctx.restore();
	}

	// Draw attack stats (left side)
	drawStatGroup(attackStats, 225, 'start');

	// Draw defense stats (right side)
	drawStatGroup(defenseStats, canvas.width - 12, 'end');

	// Draw "Others" section
	canvas.drawText({
		text: 'Others',
		x: 210 + Math.floor(232 / 2),
		y: 140,
		font: 'Bold',
		color: '#ff981f',
		center: true
	});

	// Draw other stats (split between left and right)
	canvas.ctx.save();
	canvas.ctx.translate(225, 0);
	canvas.ctx.font = '16px OSRSFontCompact';
	canvas.ctx.textAlign = 'start';

	// Left side other stats
	for (const [index, stat] of otherStats.slice(0, 2).entries()) {
		const y = 165 + index * 18;
		const isMax = stat.checkMax && typeof stat.value === 'number' ? isMaxStat(stat.statKey, stat.value) : false;

		drawText({
			canvas,
			text: `${stat.label}: ${stat.value}`,
			x: 0,
			y,
			maxStat: isMax
		});
	}

	canvas.ctx.restore();

	canvas.ctx.save();
	canvas.ctx.translate(canvas.width - 12, 0);
	canvas.ctx.font = '16px OSRSFontCompact';
	canvas.ctx.textAlign = 'end';

	// Right side other stats
	for (const [index, stat] of otherStats.slice(2).entries()) {
		const y = 165 + index * 18;
		const isMax = stat.checkMax && typeof stat.value === 'number' ? isMaxStat(stat.statKey, stat.value) : false;

		drawText({
			canvas,
			text: `${stat.label}: ${stat.value}`,
			x: 0,
			y,
			maxStat: isMax
		});
	}

	canvas.ctx.restore();
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
	petID?: number | null;
	gearTemplate?: number;
} & BaseCanvasArgs) {
	if (!bankImageTask.ready) {
		await bankImageTask.init();
		bankImageTask.ready = true;
	}
	const {
		sprite,
		uniqueSprite,
		background: userBgImage
	} = bankImageTask.getBgAndSprite({ bankBackgroundId, farmingContract });

	const gearStats = gearSetup.stats;
	const gearTemplateImage = await gearImages[gearTemplate].template;
	const canvas = new OSRSCanvas({
		width: gearTemplateImage.width,
		height: gearTemplateImage.height,
		sprite,
		iconPackId
	});
	const ctx = canvas.ctx;

	// Set background
	ctx.fillStyle = userBgImage.transparent
		? bankBgHexColor
			? bankBgHexColor
			: 'transparent'
		: ctx.createPattern(sprite.repeatableBg, 'repeat')!;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Draw background image if not unique sprite
	if (!uniqueSprite) {
		ctx.drawImage(
			userBgImage.image!,
			(canvas.width - userBgImage.image!.width) * 0.5,
			(canvas.height - userBgImage.image!.height) * 0.5
		);
	}

	drawGearStats(canvas, gearStats);

	// Draw border if background is not transparent
	if (!userBgImage.transparent) canvas.drawBorder(sprite, false);

	// Check for transmog item and draw it (early return if found)
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
		return canvas.toScaledOutput(2);
	}

	// Draw gear template
	ctx.drawImage(gearTemplateImage, 0, 0, gearTemplateImage.width, gearTemplateImage.height);

	// Draw gear type title
	if (gearType) {
		canvas.drawTitleText({
			text: toTitleCase(gearType),
			x: Math.floor(176 / 2),
			y: 25,
			center: true
		});
	}

	// Draw pet
	if (petID) {
		await canvas.drawItemIDSprite({
			itemID: petID,
			x: 178,
			y: 190
		});
	}

	// Draw equipped items
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
	} = bankImageTask.getBgAndSprite({ farmingContract, bankBackgroundId });

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
				quantity: item.quantity === 1 ? undefined : item.quantity
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
