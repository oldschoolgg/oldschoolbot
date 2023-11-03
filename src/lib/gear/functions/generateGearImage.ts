/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { Canvas, Image } from '@napi-rs/canvas';
import { toTitleCase } from '@oldschoolgg/toolkit';
import { randInt } from 'e';
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import { EquipmentSlot, Item } from 'oldschooljs/dist/meta/types';

import { monkeyTiers } from '../../monkeyRumble';
import { Gear } from '../../structures/Gear';
import {
	calcAspectRatioFit,
	canvasImageFromBuffer,
	drawItemQuantityText,
	drawTitleText,
	fillTextXTimesInCtx
} from '../../util/canvasUtil';
import { applyCustomItemEffects } from '../../util/customItemEffects';
import getOSItem from '../../util/getOSItem';
import { allSlayerMaskHelmsAndMasks, slayerMaskLeaderboardCache } from '../../util/slayerMaskLeaderboard';
import { GearSetup, GearSetupType, GearSetupTypes, GearStats, maxDefenceStats, maxOffenceStats } from '..';

const banana = canvasImageFromBuffer(fs.readFileSync('./src/lib/resources/images/banana.png'));

export const gearImages = [
	{
		id: 0,
		template: fs.readFileSync('./src/lib/resources/images/gear_template.png'),
		templateCompact: fs.readFileSync('./src/lib/resources/images/gear_template_compact.png'),
		name: 'Default'
	},
	{
		id: 1,
		template: fs.readFileSync('./src/lib/resources/images/gear_template_hween.png'),
		templateCompact: fs.readFileSync('./src/lib/resources/images/gear_template_compact_hween.png'),
		name: 'Spooky'
	}
] as const;

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

async function drawStats(canvas: Canvas, gearStats: GearStats, alternateImage: Image | null) {
	const ctx = canvas.getContext('2d');

	if (alternateImage) {
		const numBananas = randInt(1, 30);
		for (let i = 0; i < numBananas; i++) {
			let b = await banana;
			ctx.drawImage(
				b,
				randInt(1, canvas.width * 0.8),
				randInt(canvas.height * 0.75, canvas.height * 0.8),
				b.width,
				b.height
			);
		}
		let { sprite } = bankImageGenerator.getBgAndSprite(1);
		if (1 > 2) bankImageGenerator.drawBorder(ctx, sprite, false);
		return;
	}

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
}

interface TransmogItem {
	item: Item;
	image: Promise<Image>;
	maxHeight?: number;
}
const transmogItems: TransmogItem[] = [
	{
		item: getOSItem('Gorilla rumble greegree'),
		image: fsPromises.readFile('./src/lib/resources/images/mmmr/gorilla.png').then(canvasImageFromBuffer),
		maxHeight: 170
	},
	...monkeyTiers.map(m => m.greegrees.map(g => ({ item: g, image: m.image }))).flat(2),
	{
		item: getOSItem('Gastly ghost cape'),
		image: fsPromises.readFile('./src/lib/resources/images/ghost.png').then(canvasImageFromBuffer),
		maxHeight: 170
	},
	{
		item: getOSItem('Spooky cat ears'),
		image: fsPromises.readFile('./src/lib/resources/images/cat.png').then(canvasImageFromBuffer),
		maxHeight: 74
	},
	{
		item: getOSItem('Pumpkinpole'),
		image: fsPromises.readFile('./src/lib/resources/images/pumpkin.png').then(canvasImageFromBuffer),
		maxHeight: 180
	}
];

export async function generateGearImage(
	user: MUser,
	gearSetup: Gear | GearSetup,
	gearType: GearSetupType | null,
	petID: number | null
) {
	debugLog('Generating gear image', { user_id: user.id });
	const transmogItem = (gearType && transmogItems.find(t => user.gear[gearType].hasEquipped(t.item.name))) ?? null;
	const transMogImage = transmogItem === null ? null : await transmogItem.image;

	const bankBg = user.user.bankBackground ?? 1;

	let { sprite, uniqueSprite, background: userBgImage } = bankImageGenerator.getBgAndSprite(bankBg);

	const hexColor = user.user.bank_bg_hex;

	const gearStats = gearSetup instanceof Gear ? gearSetup.stats : new Gear(gearSetup).stats;
	const gearTemplateImage = await canvasImageFromBuffer(user.gearTemplate.template);
	const canvas = new Canvas(gearTemplateImage.width, gearTemplateImage.height);
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
	if (!transMogImage) {
		ctx.drawImage(gearTemplateImage, 0, 0, gearTemplateImage.width, gearTemplateImage.height);
	} else {
		ctx.drawImage(gearTemplateImage, 200, 0, gearTemplateImage.width, gearTemplateImage.height);
	}

	if (!userBgImage.transparent) bankImageGenerator.drawBorder(ctx, sprite, false);

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

	// Draw stats
	if (!transMogImage) await drawStats(canvas, gearStats, transMogImage);

	ctx.font = '16px OSRSFontCompact';
	// Draw preset title
	if (gearType) {
		drawTitleText(ctx, toTitleCase(gearType), Math.floor(176 / 2) + (transMogImage ? 200 : 0), 25);
	}

	// Draw items
	if (petID) {
		const image = await bankImageGenerator.getItemImage(petID, user);
		const imageAfterEffects = await applyCustomItemEffects(user, image, petID);
		ctx.drawImage(
			imageAfterEffects,
			(transMogImage ? 200 : 0) + 178 + slotSize / 2 - image.width / 2,
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

		if (transMogImage) {
			x += 200;
		}

		let glow: Image | null = null;
		if (allSlayerMaskHelmsAndMasks.has(item.item)) {
			if (slayerMaskLeaderboardCache.get(item.item) === user?.id) {
				glow = bankImageGenerator.redGlow;
			}
		}
		if (glow) {
			const centerX = x + image.width / 2;
			const centerY = y + image.height / 2;
			const glowX = centerX - glow.width / 2;
			const glowY = centerY - glow.width / 2;
			ctx.strokeStyle = 'red';
			ctx.drawImage(glow, glowX, glowY, glow.width, glow.height);
		}

		const imageAfterEffects = await applyCustomItemEffects(user, image, item.item);
		ctx.drawImage(imageAfterEffects, x, y, image.width, image.height);

		if (item.quantity > 1) {
			drawItemQuantityText(ctx, item.quantity, x + 1, y + 9);
		}
	}

	return canvas.encode('png');
}

export async function generateAllGearImage(user: MUser) {
	let {
		sprite: bgSprite,
		uniqueSprite: hasBgSprite,
		background: userBg
	} = bankImageGenerator.getBgAndSprite(user.user.bankBackground ?? 1, user);

	const hexColor = user.user.bank_bg_hex;
	debugLog('Generating all-gear image', { user_id: user.id });
	const gearTemplateImage = await canvasImageFromBuffer(user.gearTemplate.templateCompact);
	const canvas = new Canvas((gearTemplateImage.width + 10) * 4 + 20, Number(gearTemplateImage.height) * 2 + 70);
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
			const preImage = await bankImageGenerator.getItemImage(item.item, user);
			const image = await applyCustomItemEffects(user, preImage, item.item);
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

	return canvas.encode('png');
}
