import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { bold, time } from '@discordjs/builders';
import { Canvas, type Image, type SKRSContext2D, loadImage } from '@napi-rs/canvas';
import { mentionCommand } from '@oldschoolgg/toolkit';
import type { CommandResponse, CommandRunOptions } from '@oldschoolgg/toolkit';
import { type Tame, tame_growth } from '@prisma/client';
import { toTitleCase } from '@sapphire/utilities';
import { ApplicationCommandOptionType, type ChatInputCommandInteraction, type User } from 'discord.js';
import {
	Time,
	calcPercentOfNum,
	calcWhatPercent,
	increaseNumByPercent,
	notEmpty,
	percentChance,
	randInt,
	reduceNumByPercent
} from 'e';
import { Bank } from 'oldschooljs';
import type { Item, ItemBank } from 'oldschooljs/dist/meta/types';

import { type ClueTier, ClueTiers } from '../../lib/clues/clueTiers';
import { PerkTier, badges } from '../../lib/constants';
import { Eatables } from '../../lib/data/eatables';
import { getSimilarItems } from '../../lib/data/similarItems';
import { trackLoot } from '../../lib/lootTrack';
import { Planks } from '../../lib/minions/data/planks';
import getUserFoodFromBank from '../../lib/minions/functions/getUserFoodFromBank';
import { getUsersPerkTier } from '../../lib/perkTiers';

import Tanning from '../../lib/skilling/skills/crafting/craftables/tanning';
import { SkillsEnum } from '../../lib/skilling/types';
import {
	type SeaMonkeySpell,
	type TameKillableMonster,
	TameSpeciesID,
	TameType,
	createTameTask,
	getIgneTameKC,
	igneArmors,
	seaMonkeySpells,
	seaMonkeyStaves,
	tameFeedableItems,
	tameKillableMonsters,
	tameSpecies
} from '../../lib/tames';
import {
	assert,
	exponentialPercentScale,
	formatDuration,
	formatSkillRequirements,
	isWeekend,
	itemID,
	itemNameFromID,
	stringMatches
} from '../../lib/util';
import { patronMaxTripBonus } from '../../lib/util/calcMaxTripLength';
import { fillTextXTimesInCtx, getClippedRegionImage } from '../../lib/util/canvasUtil';
import getOSItem, { getItem } from '../../lib/util/getOSItem';
import { handleMahojiConfirmation } from '../../lib/util/handleMahojiConfirmation';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { parseStringBank } from '../../lib/util/parseStringBank';
import resolveItems from '../../lib/util/resolveItems';
import {
	calculateMaximumTameFeedingLevelGain,
	getMainTameLevel,
	getTameSpecies,
	getTameStatus,
	getUsersTame,
	tameGrowthLevel,
	tameHasBeenFed,
	tameName
} from '../../lib/util/tameUtil';
import { updateBankSetting } from '../../lib/util/updateBankSetting';
import { arbitraryTameActivities } from '../../tasks/tames/tameTasks';
import { collectables } from '../lib/abstracted_commands/collectCommand';
import type { OSBMahojiCommand } from '../lib/util';

const tameImageSize = 96;

async function tameAutocomplete(value: string, user: User) {
	const tames = await prisma.tame.findMany({
		where: {
			user_id: user.id
		}
	});
	return tames
		.sort(sortTames)
		.map(t => {
			const { relevantLevelCategory, name } = tameSpecies.find(i => i.id === t.species_id)!;
			return {
				name: `${t.nickname ?? name} (${t.growth_stage}, ${
					t[`max_${relevantLevelCategory}_level`]
				} ${toTitleCase(relevantLevelCategory)})`,
				value: t.id.toString()
			};
		})
		.filter(t => (!value ? true : t.name.toLowerCase().includes(value.toLowerCase())));
}

export const tameEquipSlots = ['equipped_primary', 'equipped_armor'] as const;

export type TameEquipSlot = (typeof tameEquipSlots)[number];
interface TameEquippable {
	item: Item;
	tameSpecies: TameSpeciesID[];
	slot: TameEquipSlot;
}

const igneClaws = [
	{
		item: getOSItem('Runite igne claws'),
		boost: 5
	},
	{
		item: getOSItem('Dragon igne claws'),
		boost: 8
	},
	{
		item: getOSItem('Barrows igne claws'),
		boost: 14
	},
	{
		item: getOSItem('Volcanic igne claws'),
		boost: 17
	},
	{
		item: getOSItem('Drygore igne claws'),
		boost: 22
	},
	{
		item: getOSItem('Dwarven igne claws'),
		boost: 27
	},
	{
		item: getOSItem('Gorajan igne claws'),
		boost: 35
	}
].map(i => ({ ...i, tameSpecies: [TameSpeciesID.Igne], slot: 'equipped_primary' as const }));

const eagleEquippables: TameEquippable[] = [
	{
		item: getOSItem('Demonic jibwings'),
		slot: 'equipped_armor',
		tameSpecies: [TameSpeciesID.Eagle]
	},
	{
		item: getOSItem('Abyssal jibwings'),
		slot: 'equipped_armor',
		tameSpecies: [TameSpeciesID.Eagle]
	},
	{
		item: getOSItem('3rd age jibwings'),
		slot: 'equipped_armor',
		tameSpecies: [TameSpeciesID.Eagle]
	},
	{
		item: getOSItem('Demonic jibwings (e)'),
		slot: 'equipped_armor',
		tameSpecies: [TameSpeciesID.Eagle]
	},
	{
		item: getOSItem('Abyssal jibwings (e)'),
		slot: 'equipped_armor',
		tameSpecies: [TameSpeciesID.Eagle]
	},
	{
		item: getOSItem('3rd age jibwings (e)'),
		slot: 'equipped_armor',
		tameSpecies: [TameSpeciesID.Eagle]
	},
	{
		item: getOSItem('Divine ring'),
		slot: 'equipped_primary',
		tameSpecies: [TameSpeciesID.Eagle]
	}
];

export const tameEquippables: TameEquippable[] = [
	...igneClaws,
	...igneArmors,
	...seaMonkeyStaves.map(i => ({
		item: i.item,
		tameSpecies: [TameSpeciesID.Monkey],
		slot: 'equipped_primary' as const
	})),
	...eagleEquippables
];

const feedingEasterEggs: [Bank, number, tame_growth[], string][] = [
	[new Bank().add('Vial of water'), 2, [tame_growth.baby], 'https://imgur.com/pYjshTg'],
	[new Bank().add('Bread'), 2, [tame_growth.baby, tame_growth.juvenile], 'https://i.imgur.com/yldSKLZ.mp4'],
	[new Bank().add('Banana', 2), 2, [tame_growth.juvenile, tame_growth.adult], 'https://i.imgur.com/11Bads1.mp4'],
	[new Bank().add('Strawberry'), 2, [tame_growth.juvenile, tame_growth.adult], 'https://i.imgur.com/ZqN1BHZ.mp4'],
	[new Bank().add('Lychee'), 2, [tame_growth.juvenile, tame_growth.adult], 'https://i.imgur.com/e5TqK1S.mp4'],
	[new Bank().add('Chocolate bar'), 2, [tame_growth.baby, tame_growth.juvenile], 'https://i.imgur.com/KRGURck.mp4'],
	[new Bank().add('Watermelon'), 2, [tame_growth.juvenile, tame_growth.adult], 'https://i.imgur.com/qDY6Skv.mp4'],
	[new Bank().add('Coconut milk'), 2, [tame_growth.baby], 'https://i.imgur.com/OE7tXI8.mp4'],
	[
		new Bank().add('Grapes'),
		2,
		[tame_growth.juvenile, tame_growth.adult],
		'https://c.tenor.com/ZHBDNOEv_m4AAAAM/monkey-monke.gif'
	]
];

const tameForegrounds = [
	{
		shouldActivate: (t: Tame) => t.nickname?.toLowerCase() === 'smaug' && t.species_id === TameSpeciesID.Igne,
		image: readFileSync('./src/lib/resources/images/tames/foreground_1.png')
	}
];

const tameImageReplacementChoices = [
	{
		name: 'Elvarg',
		species: TameSpeciesID.Igne,
		image: readFileSync('./src/lib/resources/images/tames/1_replace_1.png')
	},
	{
		name: 'King Black Dragon',
		species: TameSpeciesID.Igne,
		image: readFileSync('./src/lib/resources/images/tames/1_replace_2.png')
	},
	{
		name: 'Lava Dragon',
		species: TameSpeciesID.Igne,
		image: readFileSync('./src/lib/resources/images/tames/1_replace_3.png')
	},
	{
		name: 'Revenant Dragon',
		species: TameSpeciesID.Igne,
		image: readFileSync('./src/lib/resources/images/tames/1_replace_4.png')
	},
	{
		name: 'Rune Dragon',
		species: TameSpeciesID.Igne,
		image: readFileSync('./src/lib/resources/images/tames/1_replace_5.png')
	}
];

const tameImageReplacementEasterEggs = [
	{
		shouldActivate: (t: Tame) => t.nickname?.toLowerCase() === 'robochimp' && t.species_id === TameSpeciesID.Monkey,
		image: readFileSync('./src/lib/resources/images/tames/2_replace_1.png')
	},
	{
		shouldActivate: (t: Tame) => t.nickname?.toLowerCase() === 'magnaboy' && t.species_id === TameSpeciesID.Monkey,
		image: readFileSync('./src/lib/resources/images/tames/2_replace_2.png')
	},
	{
		shouldActivate: (t: Tame) =>
			t.nickname !== null &&
			['meneldor', 'gwaihir', 'landroval'].includes(t.nickname.toLowerCase()) &&
			t.species_id === TameSpeciesID.Eagle,
		image: readFileSync('./src/lib/resources/images/tames/3_replace_1.png')
	},
	...tameImageReplacementChoices.map(tameImage => ({
		shouldActivate: (t: Tame, user: MUser) =>
			t.custom_icon_id === tameImage.name && user.perkTier() >= PerkTier.Four,
		image: tameImage.image
	}))
];

let sprites: {
	base: {
		image: Image;
		slot: Image;
		selectedSlot: Image;
		shinyIcon: Image;
	};
	tames: {
		id: number;
		name: string;
		image: Image;
		sprites: { type: number; growthStage: Record<tame_growth, Image> }[];
	}[];
	gearIconBg: Image;
};
async function initSprites() {
	const tameSpriteBase = await loadImage(await readFile('./src/lib/resources/images/tames/tame_sprite.png'));
	sprites = {
		gearIconBg: await loadImage(await readFile('./src/lib/resources/images/gear_icon_bg.png')),
		base: {
			image: tameSpriteBase,
			slot: await getClippedRegionImage(tameSpriteBase, 0, 0, 256, 128),
			selectedSlot: await getClippedRegionImage(tameSpriteBase, 0, 128, 256, 128),
			shinyIcon: await getClippedRegionImage(tameSpriteBase, 256, 0, 24, 24)
		},
		tames: await Promise.all(
			tameSpecies.map(async value => {
				const tameImage = await loadImage(
					await readFile(`./src/lib/resources/images/tames/${value.id}_sprite.png`)
				);
				const vars = [...value.variants];
				if (value.shinyVariant) vars.push(value.shinyVariant);
				return {
					id: value.id,
					name: value.name,
					image: tameImage,
					sprites: await Promise.all(
						vars.map(async v => {
							return {
								type: v,
								growthStage: {
									[tame_growth.baby]: await getClippedRegionImage(
										tameImage,
										(v - 1) * tameImageSize,
										0,
										tameImageSize,
										tameImageSize
									),
									[tame_growth.juvenile]: await getClippedRegionImage(
										tameImage,
										(v - 1) * tameImageSize,
										tameImageSize,
										tameImageSize,
										tameImageSize
									),
									[tame_growth.adult]: await getClippedRegionImage(
										tameImage,
										(v - 1) * tameImageSize,
										tameImageSize * 2,
										tameImageSize,
										tameImageSize
									)
								}
							};
						})
					)
				};
			})
		)
	};
}
initSprites();

function drawText(ctx: SKRSContext2D, text: string, x: number, y: number) {
	const baseFill = ctx.fillStyle;
	ctx.fillStyle = '#000000';
	fillTextXTimesInCtx(ctx, text, x, y + 1);
	fillTextXTimesInCtx(ctx, text, x, y - 1);
	fillTextXTimesInCtx(ctx, text, x + 1, y);
	fillTextXTimesInCtx(ctx, text, x - 1, y);
	ctx.fillStyle = baseFill;
	fillTextXTimesInCtx(ctx, text, x, y);
}

function sortTames(tameA: Tame, tameB: Tame): number {
	const species = tameSpecies.find(i => i.id === tameA.species_id)!;
	if (tameA.species_variant === species.shinyVariant) return -1;
	if (tameB.species_variant === species.shinyVariant) return 1;
	if (tameA.last_activity_date && !tameB.last_activity_date) return -1;
	if (!tameA.last_activity_date && tameB.last_activity_date) return 1;
	if (tameA.last_activity_date && tameB.last_activity_date) {
		return tameB.last_activity_date.valueOf() - tameA.last_activity_date.valueOf();
	}
	// Fallback to sorting by max_combat_level if no last_activity_date for both
	return getMainTameLevel(tameB) - getMainTameLevel(tameA);
}
export async function tameImage(user: MUser): CommandResponse {
	const userTames = await prisma.tame.findMany({
		where: {
			user_id: user.id
		},
		orderBy: {
			last_activity_date: 'desc'
		}
	});

	userTames.sort(sortTames);

	if (userTames.length === 0) {
		return "You don't have any tames.";
	}

	const { tame, activity } = await getUsersTame(user);

	// Init the background images if they are not already

	const {
		sprite,
		uniqueSprite,
		background: userBgImage
	} = bankImageGenerator.getBgAndSprite(user.user.bankBackground ?? 1);
	const hexColor = user.user.bank_bg_hex;

	const tamesPerLine = 3;

	const canvas = new Canvas(
		12 + 10 + (256 + 10) * Math.min(userTames.length, tamesPerLine),
		12 + 10 + (128 + 10) * Math.ceil(userTames.length / tamesPerLine)
	);

	const ctx = canvas.getContext('2d');

	ctx.font = '16px OSRSFontCompact';
	ctx.imageSmoothingEnabled = false;

	ctx.fillStyle = userBgImage.transparent
		? hexColor
			? hexColor
			: 'transparent'
		: ctx.createPattern(sprite.repeatableBg, 'repeat')!;

	ctx.fillRect(0, 0, canvas.width, canvas.height);

	if (!uniqueSprite) {
		let imgHeight = 0;
		let imgWidth = 0;
		const ratio1 = canvas.height / userBgImage.image!.height;
		const ratio2 = canvas.width / userBgImage.image!.width;
		imgWidth = userBgImage.image!.width * (ratio1 > ratio2 ? ratio1 : ratio2);
		imgHeight = userBgImage.image!.height * (ratio1 > ratio2 ? ratio1 : ratio2);
		ctx.drawImage(
			userBgImage.image!,
			(canvas.width - imgWidth) / 2,
			(canvas.height - imgHeight) / 2,
			imgWidth,
			imgHeight
		);
	}

	if (!userBgImage.transparent) bankImageGenerator.drawBorder(ctx, sprite, false);

	ctx.translate(16, 16);
	let i = 0;
	for (const t of userTames) {
		const species = tameSpecies.find(i => i.id === t.species_id)!;
		let isTameActive = false;
		const selectedTame = tame && t.id === tame.id;
		if (selectedTame) isTameActive = activity !== null;

		const x = i % tamesPerLine;
		const y = Math.floor(i / tamesPerLine);
		ctx.drawImage(
			selectedTame ? sprites.base!.selectedSlot : sprites.base!.slot,
			(10 + 256) * x,
			(10 + 128) * y,
			256,
			128
		);

		const tameX = (10 + 256) * x + (isTameActive ? tameImageSize : 256 - tameImageSize) / 2;
		const tameY = (10 + 128) * y + 10;

		const imageReplacement = tameImageReplacementEasterEggs.find(i => i.shouldActivate(t, user));

		const tameImage = imageReplacement
			? await loadImage(imageReplacement.image)
			: sprites.tames!.find(t => t.id === species.id)!.sprites.find(f => f.type === t.species_variant)!
					.growthStage[t.growth_stage];

		// Draw tame
		ctx.drawImage(tameImage, tameX, tameY, tameImageSize, tameImageSize);
		const foreground = tameForegrounds.find(i => i.shouldActivate(t));
		if (foreground) {
			ctx.drawImage(await loadImage(foreground.image), tameX, tameY, tameImageSize, tameImageSize);
		}

		// Draw tame name / level / stats
		ctx.fillStyle = '#ffffff';
		ctx.textAlign = 'left';
		drawText(
			ctx,
			`${t.id}. ${t.nickname ? `${t.nickname} (${species.name})` : species.name}`,
			(10 + 256) * x + 5,
			(10 + 128) * y + 16
		);
		// Shiny indicator
		if (t.species_variant === species.shinyVariant) {
			ctx.drawImage(sprites.base!.shinyIcon, (10 + 256) * x + 5, (10 + 128) * y + 18, 16, 16);
			drawText(
				ctx,
				'Shiny!',
				(10 + 256) * x + 3 + sprites.base!.shinyIcon.width,
				(10 + 128) * y + 18 + sprites.base!.shinyIcon.height / 2
			);
		}

		ctx.textAlign = 'right';
		drawText(
			ctx,
			`${toTitleCase(species.relevantLevelCategory)}: ${getMainTameLevel(t)}`,
			(10 + 256) * x + 256 - 5,
			(10 + 128) * y + 16
		);
		ctx.textAlign = 'left';
		const grouthStage =
			t.growth_stage === 'adult' ? t.growth_stage : `${t.growth_stage} (${t.growth_percent.toFixed(2)}%)`;
		drawText(ctx, `${toTitleCase(grouthStage)}`, (10 + 256) * x + 5, (10 + 128) * y + 128 - 5);

		// Draw tame status (idle, in activity)
		if (selectedTame) {
			const mtText = getTameStatus(activity);
			ctx.textAlign = 'right';
			for (let i = 0; i < mtText.length; i++) {
				drawText(ctx, mtText[i], (10 + 256) * x + 256 - 5, (10 + 128) * y + 28 + i * 12);
			}
		} else {
			ctx.textAlign = 'right';
			drawText(ctx, 'Not selected', (10 + 256) * x + 256 - 5, (10 + 128) * y + 28);
		}

		// Draw tame boosts
		let prevWidth = 0;
		let feedQty = 0;
		for (const { item } of tameFeedableItems.filter(f => f.tameSpeciesCanBeFedThis.includes(species.id))) {
			if (tameHasBeenFed(t, item.id)) {
				const itemImage = await bankImageGenerator.getItemImage(item.id);
				if (itemImage) {
					const ratio = 19 / itemImage.height;
					const yLine = Math.floor(feedQty / 3);
					if (feedQty % 3 === 0) prevWidth = 0;
					ctx.drawImage(
						itemImage,
						(10 + 256) * x + 253 - prevWidth - Math.ceil(itemImage.width * ratio),
						(10 + 128) * y + 128 - 25 - yLine * 20,
						Math.floor(itemImage.width * ratio),
						Math.floor(itemImage.height * ratio)
					);

					prevWidth += Math.ceil(itemImage.width * ratio);
					feedQty++;
				}
			}
		}

		// Tame gear
		for (let i = 0; i < tameEquipSlots.length; i++) {
			const slot = tameEquipSlots[i];
			const equippedInThisSlot = t[slot];
			if (!equippedInThisSlot) continue;
			const thisX = sprites.gearIconBg.width + tameX - 20 + (i * sprites.gearIconBg.width + 5);
			const thisY = tameY + tameImageSize;
			const iconSize = Math.floor(calcPercentOfNum(75, sprites.gearIconBg.width));
			ctx.drawImage(sprites.gearIconBg, thisX, thisY, iconSize, iconSize);
			const icon = await bankImageGenerator.getItemImage(equippedInThisSlot);
			const iconWidth = Math.floor(calcPercentOfNum(65, icon.width));
			const iconHeight = Math.floor(calcPercentOfNum(65, icon.height));
			ctx.drawImage(
				icon,
				Math.floor(thisX + (iconSize - iconWidth) / 2) + 2,
				Math.floor(thisY + (iconSize - iconHeight) / 2),
				iconWidth,
				iconHeight
			);
		}

		i++;
	}

	const rawBadges = user.user.badges;
	const badgesStr = rawBadges.map(num => badges[num]).join(' ');
	const buffer = await canvas.encode('png');

	return {
		content: `${badgesStr}${user.usernameOrMention}, ${
			userTames.length > 1 ? 'here are your tames' : 'this is your tame'
		}!`,
		files: [{ attachment: buffer, name: `${user.usernameOrMention}_tames.png` }]
	};
}

export async function removeRawFood({
	user,
	totalHealingNeeded,
	healPerAction,
	monster,
	quantity,
	tame
}: {
	user: MUser;
	totalHealingNeeded: number;
	healPerAction: number;
	raw?: boolean;
	monster: TameKillableMonster;
	quantity: number;
	tame: Tame;
}): Promise<{ success: false; str: string } | { success: true; str: string; removed: Bank }> {
	totalHealingNeeded = increaseNumByPercent(totalHealingNeeded, 25);
	healPerAction = increaseNumByPercent(healPerAction, 25);

	const foodBoosts: string[] = [];

	if (tameHasBeenFed(tame, itemID('Abyssal cape'))) {
		totalHealingNeeded = Math.floor(totalHealingNeeded * 0.8);
		healPerAction = Math.floor(healPerAction * 0.8);
		foodBoosts.push('20% less for Ab. cape');
	}
	const equippedArmor = tame.equipped_armor;
	if (equippedArmor) {
		const obj = igneArmors.find(i => i.item.id === equippedArmor)!;
		totalHealingNeeded = reduceNumByPercent(totalHealingNeeded, obj.foodReduction);
		healPerAction = reduceNumByPercent(healPerAction, obj.foodReduction);
		foodBoosts.push(`${obj.foodReduction}% less for ${obj.item.name}`);
	}

	const foodToRemove = getUserFoodFromBank({
		user,
		totalHealingNeeded,
		favoriteFood: user.user.favorite_food,
		raw: true
	});
	if (!foodToRemove) {
		return {
			success: false,
			str: `You don't have enough Raw food to feed your tame in this trip. You need enough food to heal at least ${totalHealingNeeded} HP (${healPerAction} per action). You can use these food items: ${Eatables.filter(
				i => i.raw
			)
				.map(i => itemNameFromID(i.raw!))
				.join(', ')}.`
		};
	}
	const itemCost = foodToRemove;
	if (monster.itemCost) {
		if (monster.itemCost.qtyPerKill) {
			for (const [item, qty] of monster.itemCost.itemCost.items()) {
				itemCost.add(item.id, Math.ceil(qty * monster.itemCost.qtyPerKill * quantity));
			}
		} else {
			itemCost.add(monster.itemCost.itemCost.clone().multiply(quantity));
		}
	}
	if (!user.owns(itemCost)) {
		return { success: false, str: `You don't have the required items, you need: ${itemCost}.` };
	}
	await user.removeItemsFromBank(itemCost);
	await prisma.tame.update({
		where: {
			id: tame.id
		},
		data: {
			total_cost: new Bank(tame.total_cost as ItemBank).add(itemCost).bank
		}
	});

	updateBankSetting('economyStats_PVMCost', itemCost);

	return {
		success: true,
		str: `${itemCost} from ${user.rawUsername}${foodBoosts.length > 0 ? `(${foodBoosts.join(', ')})` : ''}`,
		removed: itemCost
	};
}

async function setNameCommand(user: MUser, name: string) {
	if (!name || name.length < 2 || name.length > 30 || ['\n', '`', '@', '<', ':'].some(char => name.includes(char))) {
		return "That's not a valid name for your tame.";
	}
	const { tame } = await getUsersTame(user);
	if (!tame) {
		return 'You have no selected tame to set a nickname for, select one first.';
	}

	await prisma.tame.update({
		where: {
			id: tame.id
		},
		data: {
			nickname: name
		}
	});

	return `Updated the nickname of your selected tame to ${name}.`;
}

async function cancelCommand(user: MUser) {
	const { tame, activity } = await getUsersTame(user);
	if (!tame) {
		return 'You have no selected tame.';
	}

	if (!activity) {
		return `${tameName(tame)} is not doing any activity, so there's nothing to cancel.`;
	}

	await prisma.tameActivity.delete({
		where: {
			id: activity.id
		}
	});

	return "You cancelled your tames' task.";
}

async function mergeCommand(user: MUser, interaction: ChatInputCommandInteraction, tameID: number) {
	const requirements = {
		[SkillsEnum.Magic]: 110,
		[SkillsEnum.Runecraft]: 110,
		[SkillsEnum.Herblore]: 110
	};

	if (!user.hasSkillReqs(requirements)) {
		return `You are not skillful enough to do this merging ritual. You need the following requirements: ${formatSkillRequirements(
			requirements
		)}`;
	}

	const tames = await user.fetchTames();
	const toSelect = tames.find(t => t.id === tameID);
	if (!toSelect || !tameID) {
		return "Couldn't find a tame to participate in the ritual. Make sure you selected the correct Tame, by its number or nickname.";
	}

	if (toSelect.equippedArmor || toSelect.equippedPrimary) {
		return "The tame you're merging has gear equipped, unequip that gear first.";
	}

	const { tame, activity, species } = await getUsersTame(user);
	if (activity) return 'Your tame is busy. Wait for it to be free to do this.';
	if (!tame || !species) return "You don't have a selected tame. Select your tame first.";
	if (tame.id === toSelect.id) return `You can't merge ${tameName(tame)} with itself!`;
	if (species.id !== toSelect.species.id) {
		return "You can't merge two tames from two different species!";
	}

	const { mergingCost, shinyVariant } = species;

	if (!user.owns(mergingCost)) {
		return `You don't have enough materials for this ritual. You need ${mergingCost}. You are missing **${mergingCost
			.clone()
			.remove(user.bank)}**.`;
	}

	const mergeStuff = {
		totalLoot: new Bank(tame!.max_total_loot as ItemBank).add(toSelect.totalLoot).bank,
		fedItems: new Bank(tame!.fed_items as ItemBank).add(toSelect.fedItems).bank,
		maxCombatLevel: Math.max(tame!.max_combat_level, toSelect.maxCombatLevel),
		maxArtisanLevel: Math.max(tame!.max_artisan_level, toSelect.maxArtisanLevel),
		maxGathererLevel: Math.max(tame!.max_gatherer_level, toSelect.maxGathererLevel),
		maxSupportLevel: Math.max(tame!.max_support_level, toSelect.maxSupportLevel),
		speciesVariant:
			tame!.species_variant === shinyVariant || toSelect.speciesVariant === shinyVariant
				? shinyVariant
				: tame!.species_variant
	};

	await handleMahojiConfirmation(
		interaction,
		`Are you sure you want to merge **${toSelect}** (Tame ${toSelect.id}) into **${tameName(
			tame!
		)}** (Tame ${tame!.id})?\n\n${tameName(
			tame!
		)} will receive all the items fed and all loot obtained from ${toSelect}, and will have its stats match the highest of both tames.\n\n**THIS ACTION CAN NOT BE REVERSED!**`
	);

	await user.removeItemsFromBank(mergingCost);
	updateBankSetting('tame_merging_cost', mergingCost);

	// Set the merged tame activities to the tame that is consuming it
	await prisma.tameActivity.updateMany({
		where: {
			tame_id: toSelect.id
		},
		data: {
			tame_id: tame.id
		}
	});

	await prisma.tame.delete({
		where: {
			id: toSelect.id
		}
	});

	await prisma.tame.update({
		where: {
			id: tame!.id
		},
		data: {
			max_total_loot: mergeStuff.totalLoot,
			fed_items: mergeStuff.fedItems,
			max_combat_level: mergeStuff.maxCombatLevel,
			max_artisan_level: mergeStuff.maxArtisanLevel,
			max_gatherer_level: mergeStuff.maxGathererLevel,
			max_support_level: mergeStuff.maxSupportLevel,
			species_variant: mergeStuff.speciesVariant
		}
	});

	return `${tameName(tame)} consumed ${toSelect} and all its attributes.`;
}

async function feedCommand(interaction: ChatInputCommandInteraction, user: MUser, str: string) {
	const { tame, species } = await getUsersTame(user);
	if (!tame) {
		return 'You have no selected tame.';
	}

	const rawBank = parseStringBank(str);
	const bankToAdd = new Bank();
	const userBank = user.bank;
	for (const [item, qty] of rawBank) {
		const qtyOwned = userBank.amount(item.id);
		if (qtyOwned === 0) continue;
		const qtyToUse = !qty ? 1 : qty > qtyOwned ? qtyOwned : qty;
		bankToAdd.add(item.id, qtyToUse);
	}

	const thisTameSpecialFeedableItems = tameFeedableItems.filter(f => f.tameSpeciesCanBeFedThis.includes(species!.id));

	if (!str || bankToAdd.length === 0) {
		const image = await makeBankImage({
			bank: new Bank(tame.fed_items as ItemBank),
			title: 'Items Fed To This Tame'
		});

		return {
			...image,
			content: `The items which give a perk/usage to this tame type when fed are:\n${thisTameSpecialFeedableItems
				.map(i => `- ${i.item.name} (${i.description})`)
				.join('\n')}.`
		};
	}

	if (!userBank.fits(bankToAdd)) {
		return "You don't have enough items.";
	}

	// Egg feeding
	const tameEggs = tameSpecies.map(t => t.egg.id);
	const eggBeingFed = tameEggs.find(egg => bankToAdd.has(egg));
	if (eggBeingFed && bankToAdd.has(eggBeingFed)) {
		if (bankToAdd.length !== 1) {
			return "Your tame can't eat anything else with the egg.";
		}
		if (tame.growth_stage !== tame_growth.adult) {
			return 'Your tame is too young to eat the egg.';
		}
		if (typeof tame.levels_from_egg_feed === 'number') {
			return `Your tame has already eaten an egg, it can't eat another one. It gained ${tame.levels_from_egg_feed} levels from the egg.`;
		}

		const levelsCanGain = calculateMaximumTameFeedingLevelGain(tame);
		if (levelsCanGain < 1) {
			return "Your tame isn't interested in eating the egg.";
		}

		const levelRange = [0, levelsCanGain];
		await handleMahojiConfirmation(
			interaction,
			`Are you sure you want to feed the egg to your tame? You cannot get the egg back, and you cannot feed this tame an egg more than once.

Your tame will gain between (inclusively) ${levelRange[0]} and ${levelRange[1]} levels from the egg.`
		);
		const gained = randInt(levelRange[0], levelRange[1]);
		await user.removeItemsFromBank(bankToAdd);

		await prisma.tame.update({
			where: {
				id: tame.id
			},
			data: {
				levels_from_egg_feed: gained,
				[`max_${species!.relevantLevelCategory}_level`]: {
					increment: gained
				}
			}
		});

		await prisma.tame.update({
			where: {
				id: tame.id
			},
			data: {
				fed_items: new Bank().add(tame.fed_items as ItemBank).add(bankToAdd).bank
			}
		});

		return `You fed ${bankToAdd} to ${tameName(tame)}. It gained ${bold(gained.toString())} levels from the egg!`;
	}

	const specialStrArr = [];
	for (const { item, description, tameSpeciesCanBeFedThis } of thisTameSpecialFeedableItems) {
		const similarItems = getSimilarItems(item.id);
		if (similarItems.some(si => bankToAdd.has(si))) {
			if (!tameSpeciesCanBeFedThis.includes(species!.id)) {
				await handleMahojiConfirmation(
					interaction,
					`Feeding a '${item.name}' to your tame won't give it a perk, are you sure you want to?`
				);
			}
			specialStrArr.push(`**${item.name}**: ${description}`);
		}
	}
	const specialStr = specialStrArr.length === 0 ? '' : `\n\n${specialStrArr.join(', ')}`;
	await handleMahojiConfirmation(
		interaction,
		`Are you sure you want to feed \`${bankToAdd}\` to ${tameName(
			tame
		)}? You **cannot** get these items back after they're eaten by your tame.${specialStr}

Note: Some items must be equipped to your tame, not fed. Check that you are feeding something which is meant to be fed.`
	);

	let egg = '';
	for (const [eggBank, eggSpecies, eggGrowth, easterEgg] of feedingEasterEggs) {
		if (species!.id === eggSpecies && bankToAdd.fits(eggBank) && eggGrowth.includes(tame.growth_stage)) {
			egg = ` ${easterEgg}`;
		}
	}

	const newBoosts: string[] = [];
	for (const { item, announcementString } of thisTameSpecialFeedableItems) {
		if (bankToAdd.has(item.id) && !tameHasBeenFed(tame, item.id)) {
			newBoosts.push(`**${announcementString}**`);
		}
	}

	if (!user.owns(bankToAdd)) return "You don't own those items.";
	await user.removeItemsFromBank(bankToAdd);

	await prisma.tame.update({
		where: {
			id: tame.id
		},
		data: {
			fed_items: new Bank().add(tame.fed_items as ItemBank).add(bankToAdd).bank
		}
	});

	return `You fed \`${bankToAdd}\` to ${tameName(tame)}.${
		newBoosts.length > 0 ? `\n\n${newBoosts.join('\n')}` : ''
	}${specialStr}${egg}`;
}

async function killCommand(user: MUser, channelID: string, str: string) {
	const { tame, activity, species } = await getUsersTame(user);
	if (!tame || !species) {
		return 'You have no selected tame.';
	}
	if (species.type !== TameType.Combat) {
		return 'This tame species cannot do PvM.';
	}
	if (activity) {
		return `${tameName(tame)} is busy.`;
	}
	//
	const monster = tameKillableMonsters.find(
		i => stringMatches(i.name, str) || i.aliases.some(alias => stringMatches(alias, str))
	);
	if (monster?.tameCantKill) {
		return 'Tames cannot kill this monster.';
	}
	if (!monster) return "That's not a valid monster.";
	if (monster.mustBeAdult && tame.growth_stage !== tame_growth.adult) {
		return 'Only fully grown tames can kill this monster.';
	}
	if (monster.requiredBitfield && !user.bitfield.includes(monster.requiredBitfield)) {
		return "You haven't unlocked this monster.";
	}
	// Get the amount stronger than minimum, and set boost accordingly:
	const [speciesMinCombat, speciesMaxCombat] = species.combatLevelRange;
	// Example: If combat level is 80/100 with 70 min, give a 10% boost.
	const combatLevelBoost = calcWhatPercent(tame.max_combat_level - speciesMinCombat, speciesMaxCombat);

	// Increase trip length based on minion growth:
	let speed = monster.timeToFinish * tameGrowthLevel(tame);

	const boosts = [];

	// Apply calculated boost:
	const combatLevelChange = reduceNumByPercent(speed, combatLevelBoost);
	boosts.push(
		`${combatLevelBoost}% (${formatDuration(
			calcPercentOfNum(combatLevelBoost, speed),
			true
		)}) speed boost for combat level`
	);
	speed = combatLevelChange;

	let maxTripLength = Time.Minute * 20 * (4 - tameGrowthLevel(tame));
	if (tameHasBeenFed(tame, itemID('Zak'))) {
		maxTripLength += Time.Minute * 35;
		boosts.push('+35mins trip length (ate a Zak)');
	}

	const patronBoost = patronMaxTripBonus(user) * 2;
	if (patronBoost > 0) {
		maxTripLength += patronBoost;
		boosts.push(`+${formatDuration(patronBoost, true)} trip length for T${getUsersPerkTier(user) - 1} patron`);
	}

	if (isWeekend()) {
		speed = reduceNumByPercent(speed, 10);
		boosts.push('10% weekend boost');
	}
	if (tameHasBeenFed(tame, itemID('Dwarven warhammer'))) {
		speed = reduceNumByPercent(speed, 30);
		boosts.push('30% faster (ate a DWWH)');
	}

	for (const { item, boost } of igneClaws) {
		if (tame.equipped_primary === item.id) {
			boosts.push(`${boost}% faster (${item.name})`);
			speed = reduceNumByPercent(speed, boost);
			break;
		}
	}

	if (monster.minArmorTier) {
		const theirArmor = tame.equipped_armor ? igneArmors.find(i => i.item.id === tame.equipped_armor)! : null;
		if (
			!theirArmor ||
			igneArmors.indexOf(theirArmor) < igneArmors.indexOf(igneArmors.find(i => i.item === monster.minArmorTier)!)
		) {
			return `You need ${monster.minArmorTier.name} on your tame, or better, to kill ${monster.name}.`;
		}
	}

	// Calculate monster quantity:
	const quantity = Math.floor(maxTripLength / speed);
	if (quantity < 1) {
		return "Your tame can't kill this monster fast enough.";
	}

	const foodRes = await removeRawFood({
		totalHealingNeeded: (monster.healAmountNeeded ?? 1) * quantity,
		healPerAction: monster.healAmountNeeded ?? 1,
		user,
		monster,
		quantity,
		tame
	});
	if (!foodRes.success) {
		return foodRes.str;
	}

	const fakeDuration = Math.floor(quantity * speed);

	await trackLoot({
		id: monster.name,
		changeType: 'cost',
		type: 'Monster',
		totalCost: foodRes.removed,
		suffix: 'tame',
		users: [
			{
				id: user.id,
				cost: foodRes.removed
			}
		]
	});

	const kcs = await getIgneTameKC(tame);
	const deathChance = monster.deathChance ? monster.deathChance({ tame, kc: kcs.idBank[monster.id] ?? 0 }) : 0;
	let realDuration: number = fakeDuration;
	let deaths = 0;
	for (let i = 0; i < quantity; i++) {
		if (percentChance(deathChance)) {
			deaths++;
			realDuration -= calcPercentOfNum(randInt(30, 60), speed);
		}
	}

	await createTameTask({
		user,
		channelID: channelID.toString(),
		selectedTame: tame,
		data: {
			type: TameType.Combat,
			monsterID: monster.id,
			quantity
		},
		type: TameType.Combat,
		duration: realDuration,
		fakeDuration: deaths > 0 ? fakeDuration : undefined,
		deaths
	});

	let reply = `${tameName(tame)} is now killing ${quantity}x ${monster.name}${
		deathChance > 0 ? `, and has a ${deathChance.toFixed(2)}% chance of dying` : ''
	}. The trip will take ${formatDuration(fakeDuration)}.\n\nRemoved ${foodRes.str}`;

	if (boosts.length > 0) {
		reply += `\n\n**Boosts:** ${boosts.join(', ')}.`;
	}

	reply += `\n\n${monster.name} has a base kill time of **${formatDuration(
		monster.timeToFinish,
		true
	)}**, your kill time is **${formatDuration(speed, true)}**, meaning you can kill **${(maxTripLength / speed).toFixed(2)}** in your max trip length of **${formatDuration(maxTripLength, true)}**`;

	return reply;
}

async function collectCommand(user: MUser, channelID: string, str: string) {
	const { tame, activity } = await getUsersTame(user);
	if (!tame) {
		return 'You have no selected tame.';
	}

	if (getTameSpecies(tame).type !== TameType.Gatherer) {
		return 'This tame species cannot collect items.';
	}
	if (activity) {
		return `${tameName(tame)} is busy.`;
	}
	const collectable = collectables.find(c => stringMatches(c.item.name, str));
	if (!collectable) {
		return `That's not a valid collectable item. The items you can collect are: ${collectables
			.map(i => i.item.name)
			.join(', ')}.`;
	}

	const [min, max] = getTameSpecies(tame).gathererLevelRange;
	const gathererLevelBoost = calcWhatPercent(tame.max_gatherer_level - min, max);

	// Increase trip length based on minion growth:
	let speed = collectable.duration;
	if (tame.growth_stage === tame_growth.baby) {
		speed /= 1.5;
	} else if (tame.growth_stage === tame_growth.juvenile) {
		speed /= 2;
	} else {
		speed /= 2.5;
	}

	const boosts = [];

	const equippedStaff = seaMonkeyStaves.find(s => s.item.id === tame.equipped_primary);
	if (equippedStaff) {
		speed = reduceNumByPercent(speed, 5);
		boosts.push('5% faster (seamonkey staff)');
	}

	for (const item of resolveItems(['Voidling', 'Ring of endurance'])) {
		if (tameHasBeenFed(tame, item)) {
			speed = reduceNumByPercent(speed, 10);
			boosts.push(`10% for ${itemNameFromID(item)}`);
		}
	}

	if (isWeekend()) {
		speed = reduceNumByPercent(speed, 10);
		boosts.push('10% weekend boost');
	}

	// Apply calculated boost:
	speed = reduceNumByPercent(speed, gathererLevelBoost);

	let maxTripLength = Time.Minute * 20 * (4 - tameGrowthLevel(tame));
	if (tameHasBeenFed(tame, itemID('Zak'))) {
		maxTripLength += Time.Minute * 35;
		boosts.push('+35mins trip length (ate a Zak)');
	}
	maxTripLength += patronMaxTripBonus(user) * 2;
	// Calculate monster quantity:
	const quantity = Math.floor(maxTripLength / speed);
	if (quantity < 1) {
		return "Your tame can't kill this monster fast enough.";
	}

	const duration = Math.floor(quantity * speed);

	await createTameTask({
		user,
		channelID: channelID.toString(),
		selectedTame: tame,
		data: {
			type: TameType.Gatherer,
			itemID: collectable.item.id,
			quantity
		},
		type: TameType.Gatherer,
		duration,
		fakeDuration: undefined
	});

	let reply = `${tameName(tame)} is now collecting ${quantity * collectable.quantity}x ${
		collectable.item.name
	}. The trip will take ${formatDuration(duration)}.`;

	if (boosts.length > 0) {
		reply += `\n\n**Boosts:** ${boosts.join(', ')}.`;
	}

	return reply;
}

async function monkeyMagicHandler(
	user: MUser,
	channelID: string,
	spellOptions: {
		spell: SeaMonkeySpell;
		itemID: number;
		costPerItem: Bank;
		lootPerItem: Bank;
		timePerSpell: number;
		runes: {
			per: number;
			cost: Bank;
		};
	}
) {
	if (!spellOptions.spell.itemIDs.includes(spellOptions.itemID)) {
		throw new Error(`Invalid item ID for spell ${spellOptions.spell.name}: ${spellOptions.itemID}`);
	}
	const { tame, activity } = await getUsersTame(user);
	if (!tame) {
		return 'You have no selected tame.';
	}

	if (getTameSpecies(tame).id !== TameSpeciesID.Monkey) {
		return 'This tame species cannot do magic.';
	}

	const equippedStaff = seaMonkeyStaves.find(s => s.item.id === tame.equipped_primary);

	if (!equippedStaff) {
		return 'Your monkey does not have a seamonkey staff equipped.';
	}

	if (equippedStaff.tier < spellOptions.spell.tierRequired) {
		return `Your monkey needs atleast a tier ${spellOptions.spell.tierRequired} staff to cast this spell.`;
	}

	if (activity) {
		return `${tameName(tame)} is busy.`;
	}

	const maxCanDo = Math.floor(user.bankWithGP.fits(spellOptions.costPerItem));
	if (maxCanDo < 1) {
		return `You don't have enough items to cast this spell, you need ${spellOptions.costPerItem} per cast.`;
	}

	let speed = spellOptions.timePerSpell;
	const boosts = [];
	const [min] = getTameSpecies(tame).gathererLevelRange;
	const minBoost = exponentialPercentScale(min, 0.01);
	const gathererLevelBoost = exponentialPercentScale(tame.max_gatherer_level, 0.01) - minBoost;
	if (gathererLevelBoost > 0) {
		speed = reduceNumByPercent(speed, gathererLevelBoost);
		boosts.push(`${gathererLevelBoost.toFixed(2)}% for gatherer level of ${tame.max_gatherer_level}`);
	}
	if (isWeekend()) {
		speed = reduceNumByPercent(speed, 5);
		boosts.push('5% weekend boost');
	}
	let maxTripLength = Time.Minute * 20 * (4 - tameGrowthLevel(tame));
	if (tameHasBeenFed(tame, itemID('Zak'))) {
		maxTripLength += Time.Minute * 35;
		boosts.push('+35mins trip length (ate a Zak)');
	}

	if (equippedStaff.tier > 2) {
		speed = reduceNumByPercent(speed, 12);
		boosts.push('12% faster for staff');
	}
	if (tameHasBeenFed(tame, itemID('Klik'))) {
		speed = reduceNumByPercent(speed, 22);
		boosts.push('22% faster for Klik firebreathing');
	}

	maxTripLength += patronMaxTripBonus(user) * 2;

	const quantity = Math.min(maxCanDo, Math.floor(maxTripLength / speed));

	const runeCost = spellOptions.runes.cost.clone().multiply(Math.ceil(quantity / spellOptions.runes.per));

	const finalCost = new Bank().add(runeCost).add(spellOptions.costPerItem.clone().multiply(quantity));
	if (!user.bankWithGP.has(finalCost)) {
		return `You need ${finalCost} to cast this spell ${quantity}x times.`;
	}

	await user.removeItemsFromBank(finalCost);
	await trackLoot({
		id: `${spellOptions.spell.name}`,
		changeType: 'cost',
		type: 'Skilling',
		totalCost: finalCost,
		suffix: 'tame',
		users: [
			{
				id: user.id,
				cost: finalCost
			}
		]
	});
	await prisma.tame.update({
		where: {
			id: tame.id
		},
		data: {
			total_cost: new Bank(tame.total_cost as ItemBank).add(finalCost).bank
		}
	});
	await updateBankSetting('economyStats_PVMCost', finalCost);

	const duration = Math.floor(quantity * speed);

	await createTameTask({
		user,
		channelID: channelID.toString(),
		selectedTame: tame,
		data: {
			type: 'SpellCasting',
			itemID: spellOptions.itemID,
			quantity,
			spellID: spellOptions.spell.id,
			loot: spellOptions.lootPerItem.clone().multiply(quantity).bank
		},
		type: TameType.Gatherer,
		duration,
		fakeDuration: undefined
	});

	let reply = `${tameName(tame)} is now casting the ${
		spellOptions.spell.name
	} spell ${quantity}x times, removed ${finalCost} from your bank. The trip will take ${formatDuration(duration)}.`;

	if (boosts.length > 0) {
		reply += `\n\n**Boosts:** ${boosts.join(', ')}.`;
	}

	return reply;
}

async function tanLeatherCommand(user: MUser, channelID: string, itemName: string) {
	const item = Tanning.find(i => getOSItem(i.id).name === itemName);
	if (!item) {
		return "That's not a valid item to tan.";
	}

	return monkeyMagicHandler(user, channelID, {
		spell: seaMonkeySpells.find(i => i.id === 1)!,
		itemID: item.id,
		costPerItem: item.inputItems.clone().remove('Coins', item.inputItems.amount('Coins')),
		lootPerItem: new Bank().add(item.id),
		timePerSpell: Time.Millisecond * 500,
		runes: {
			per: 5,
			cost: new Bank().add('Fire rune', 5).add('Nature rune', 1).add('Astral rune', 2)
		}
	});
}

async function superGlassCommand(user: MUser, channelID: string) {
	const moltenGlass = getOSItem('Molten glass');

	return monkeyMagicHandler(user, channelID, {
		spell: seaMonkeySpells.find(i => i.id === 4)!,
		itemID: moltenGlass.id,
		costPerItem: new Bank().add('Giant seaweed').add('Bucket of sand', 6),
		lootPerItem: new Bank().add(moltenGlass, 8),
		timePerSpell: Time.Second * 3,
		runes: {
			per: 3,
			cost: new Bank().add('Air rune', 10).add('Fire rune', 6).add('Astral rune', 2)
		}
	});
}

async function plankMakeCommand(user: MUser, channelID: string, plankName: string) {
	const item = Planks.find(p => p.name === plankName);
	if (!item) {
		return "That's not a valid plank to make.";
	}

	return monkeyMagicHandler(user, channelID, {
		spell: seaMonkeySpells.find(i => i.id === 2)!,
		itemID: item.outputItem,
		costPerItem: new Bank().add(item.inputItem).add('Coins', Math.ceil(calcPercentOfNum(70, item.gpCost))),
		lootPerItem: new Bank().add(item.outputItem),
		timePerSpell: Time.Second * 4,
		runes: {
			per: 1,
			cost: new Bank().add('Earth rune', 15).add('Nature rune', 1).add('Astral rune', 2)
		}
	});
}

async function spinFlaxCommand(user: MUser, channelID: string) {
	const flax = getOSItem('Flax');
	const bowstring = getOSItem('Bow string');

	return monkeyMagicHandler(user, channelID, {
		spell: seaMonkeySpells.find(i => i.id === 3)!,
		itemID: bowstring.id,
		costPerItem: new Bank().add(flax),
		lootPerItem: new Bank().add(bowstring),
		timePerSpell: Time.Millisecond * 800,
		runes: {
			per: 5,
			cost: new Bank().add('Air rune', 5).add('Nature rune', 1).add('Astral rune', 2)
		}
	});
}
async function selectCommand(user: MUser, tameID: number) {
	const tames = await user.fetchTames();
	const toSelect = tames.find(t => t.id === tameID);
	if (!toSelect) {
		return "Couldn't find a tame to select.";
	}
	const { activity } = await getUsersTame(user);
	if (activity) {
		return "You can't select a different tame, because your current one is busy.";
	}
	await user.update({
		selected_tame: toSelect.id
	});
	return `You selected your ${toSelect}.`;
}

async function viewCommand(user: MUser, tameID: number): CommandResponse {
	const tames = await prisma.tame.findMany({ where: { user_id: user.id } });
	const tame = tames.find(t => t.id === tameID);
	if (!tame) {
		return "Couldn't find that tame.";
	}
	const species = tameSpecies.find(i => i.id === tame.species_id)!;
	const fedItems = new Bank(tame.fed_items as ItemBank);
	const loot = new Bank(tame.max_total_loot as ItemBank);
	const fedImage = await makeBankImage({
		bank: fedItems,
		title: 'Items Fed To This Tame',
		user
	});

	const files = [fedImage.file.attachment];

	const isTierThree = user.perkTier() >= PerkTier.Four;
	if (isTierThree) {
		files.push(
			(
				await makeBankImage({
					bank: loot,
					title: 'Total Loot From This Tame',
					user
				})
			).file.attachment
		);

		files.push(
			(
				await makeBankImage({
					bank: new Bank(tame.total_cost as ItemBank),
					title: 'Items This Tame Used',
					user
				})
			).file.attachment
		);

		files.push(
			(
				await makeBankImage({
					bank: new Bank(tame.elder_knowledge_loot_bank as ItemBank),
					title: 'Total Loot From Elder Knowledge',
					user
				})
			).file.attachment
		);
	}

	let content = `**Name:** ${tame.nickname ?? 'No name'}
**Species:** ${species.name}
**Shiny:** ${tame.species_variant === species.shinyVariant ? 'Yes' : 'No'}
**Growth:** ${tame.growth_percent}% ${tame.growth_stage}
**Hatch Date:** ${time(tame.date)} / ${time(tame.date, 'R')}
**${toTitleCase(species.relevantLevelCategory)} Level:** ${tame[`max_${species.relevantLevelCategory}_level`]}
**Boosts:** ${tameFeedableItems
		.filter(i => tameHasBeenFed(tame, i.item.id))
		.map(i => `${i.item.name} (${i.description})`)
		.join(', ')}`;
	if (species.id === TameSpeciesID.Igne) {
		const kcs = await getIgneTameKC(tame);
		content += `\n**KCs:** ${kcs.sortedTuple
			.slice(0, 10)
			.map(i => `${i[1]}x ${i[0]}`)
			.join(', ')}`;
	}
	if (!isTierThree) {
		content += '\nYou need to be a Tier 3 patron to see all the loot your tame has collected.';
	}
	return {
		content,
		files
	};
}

async function statusCommand(user: MUser) {
	const { tame, activity } = await getUsersTame(user);
	if (!tame) {
		return 'You have no tame selected.';
	}
	return `${tameName(tame)} is currently: ${getTameStatus(activity).join('. ')}.`;
}

async function tameEquipCommand(user: MUser, itemName: string) {
	const { tame, activity } = await getUsersTame(user);
	if (!tame) return "You don't have a tame selected.";
	if (activity) {
		return "You can't equip something to your tame, because it is busy.";
	}
	const item = getItem(itemName);
	if (!item) return "That's not a valid item.";
	const equippable = tameEquippables.find(i => i.item === item);
	if (!equippable) return "That's not an item you can equip to a tame.";
	if (!equippable.tameSpecies.includes(tame.species_id)) {
		return 'This item cannot be equipped to this tame species.';
	}
	const cost = new Bank().add(item.id);
	if (!user.owns(cost)) return `You don't own ${cost}.`;

	const refundBank = new Bank();
	const existingItem = tame[equippable.slot];
	if (existingItem) refundBank.add(existingItem);
	await user.removeItemsFromBank(cost);
	if (refundBank.length > 0) {
		await user.addItemsToBank({ items: refundBank, collectionLog: false, dontAddToTempCL: true });
	}

	await prisma.tame.update({
		where: {
			id: tame.id
		},
		data: {
			[equippable.slot]: item.id
		}
	});

	const refundStr = existingItem
		? ` A ${itemNameFromID(existingItem)} was unequipped and returned to your bank.`
		: '';
	return `You equipped a ${equippable.item.name} to your ${tameName(tame)}.${refundStr}`;
}

async function tameUnequipCommand(user: MUser, itemName: string) {
	const { tame, activity } = await getUsersTame(user);
	if (!tame) return "You don't have a tame selected.";
	if (activity) {
		return "You can't unequip something to your tame, because it is busy.";
	}
	const item = getItem(itemName);
	if (!item) return "That's not a valid item.";
	const equippable = tameEquippables.find(i => i.item === item);
	if (!equippable) return "That's not an item you can equip to a tame.";
	if (!equippable.tameSpecies.includes(tame.species_id)) {
		return 'This item cannot be equipped to this tame species.';
	}

	const existingItem = tame[equippable.slot];
	if (!existingItem || existingItem !== item.id) {
		return "You don't have this item equipped in your tame.";
	}

	const loot = new Bank().add(equippable.item.id);
	await user.addItemsToBank({ items: loot, collectionLog: false, dontAddToTempCL: true });

	await prisma.tame.update({
		where: {
			id: tame.id
		},
		data: {
			[equippable.slot]: null
		}
	});

	return `You unequipped a ${equippable.item.name} from your ${tameName(tame)}.`;
}

export function determineTameClueResult({
	tameGrowthLevel,
	clueTier,
	extraTripLength,
	supportLevel,
	equippedArmor,
	equippedPrimary
}: {
	extraTripLength: number;
	clueTier: ClueTier;
	tameGrowthLevel: number;
	supportLevel: number;
	equippedArmor: number | null;
	equippedPrimary: number | null;
}) {
	const boosts: string[] = [];
	let maxTripLength = Time.Minute * 20 * (4 - tameGrowthLevel);
	if (
		equippedArmor &&
		resolveItems(['Abyssal jibwings (e)', 'Demonic jibwings (e)', '3rd age jibwings (e)']).includes(equippedArmor)
	) {
		maxTripLength += Time.Minute * 30;
		boosts.push('+30mins trip length for enhanced jibwings');
	}

	maxTripLength += extraTripLength;

	let timePerClue = clueTier.timeToFinish * 1.3;

	const s = exponentialPercentScale(supportLevel, 0.03);
	const base = exponentialPercentScale(50, 0.03);
	const boostPercent = Math.max(0, s / 1.5 - base / 1.5);

	timePerClue = reduceNumByPercent(timePerClue, boostPercent);
	boosts.push(`${boostPercent.toFixed(2)}% faster for support level`);

	if (equippedPrimary === itemID('Divine ring')) {
		boosts.push(`20% faster (${formatDuration(calcPercentOfNum(20, timePerClue))} per clue) for Divine ring`);
		timePerClue = reduceNumByPercent(timePerClue, 15);
	}

	const quantity = Math.floor(maxTripLength / timePerClue);
	const duration = Math.floor(quantity * timePerClue);

	const baseCost = (ClueTiers.indexOf(clueTier) + 1) * quantity;
	const kibbleNeeded = Math.ceil(baseCost / 2);
	const cost = new Bank().add('Extraordinary kibble', kibbleNeeded).add(clueTier.scrollID, quantity);

	let costSavedByDemonicJibwings = null;
	if (equippedArmor && getSimilarItems(itemID('Demonic jibwings')).includes(equippedArmor) && percentChance(30)) {
		costSavedByDemonicJibwings = new Bank().add('Extraordinary kibble', cost.amount('Extraordinary kibble'));
		cost.remove(costSavedByDemonicJibwings);
		boosts.push('No food used due to demonic jibwings');
	}

	return {
		boosts,
		quantity,
		duration,
		cost,
		costSavedByDemonicJibwings
	};
}

async function tameClueCommand(user: MUser, channelID: string, inputName: string) {
	const { tame, activity } = await user.fetchActiveTame();
	if (activity) {
		return `${tame} is busy.`;
	}
	if (!tame) {
		return 'You have no selected tame.';
	}
	if (tame.species.id !== TameSpeciesID.Eagle) {
		return `Only Eagle tames can do clue scrolls, switch to a different tame: ${mentionCommand(
			globalClient,
			'tames',
			'select'
		)}.`;
	}

	const clueTier = ClueTiers.find(c => stringMatches(c.name, inputName));
	if (!clueTier) {
		return 'Invalid clue tier.';
	}

	if (clueTier.name === 'Elder' && !tame.hasBeenFed('Elder knowledge')) {
		return 'Your tame lacks the *knowledge* required to complete elder clues.';
	}

	const { cost, quantity, duration, boosts, costSavedByDemonicJibwings } = determineTameClueResult({
		tameGrowthLevel: tame.growthLevel,
		clueTier,
		extraTripLength: patronMaxTripBonus(user) * 2,
		supportLevel: tame.currentSupportLevel,
		equippedArmor: tame.equippedArmor?.id ?? null,
		equippedPrimary: tame.equippedPrimary?.id ?? null
	});

	if (quantity === 0) {
		return "Your tame can't do this clue scroll fast enough.";
	}

	assert(quantity >= 1 && Number.isInteger(quantity), `${quantity} quantity should be an integer.`);
	assert(duration >= 1 && Number.isInteger(duration), `${duration} duration should be an integer.`);

	const units = await user.fetchStashUnits();
	if (units.filter(u => u.tier.tier === clueTier.name).some(u => !u.isFull)) {
		return `You need to have all your ${clueTier.name} STASH units built and full.`;
	}
	if (['Grandmaster', 'Elder'].includes(clueTier.name) && units.some(u => !u.isFull)) {
		return 'You need to have all your STASH units built and full for your tame to do Grandmaster/Elder clues.';
	}

	if (!user.owns(cost) || (costSavedByDemonicJibwings !== null && !user.owns(costSavedByDemonicJibwings))) {
		if (costSavedByDemonicJibwings) cost.add(costSavedByDemonicJibwings);
		return `You need ${cost} to feed your Eagle for this trip.`;
	}

	await user.removeItemsFromBank(cost);
	await tame.addToStatsBank('total_cost', cost);
	await updateBankSetting('economyStats_PVMCost', cost);
	if (costSavedByDemonicJibwings) {
		await tame.addToStatsBank('demonic_jibwings_saved_cost', costSavedByDemonicJibwings);
	}

	const task = await createTameTask({
		user,
		channelID,
		selectedTame: tame.tame,
		data: {
			type: 'Clues',
			clueID: clueTier.scrollID,
			quantity
		},
		type: 'Clues',
		duration,
		fakeDuration: undefined
	});

	let reply = `${tame} is now completing ${quantity}x ${itemNameFromID(
		clueTier.scrollID
	)}. Removed ${cost} from your bank. The trip will take ${formatDuration(task.duration)}.`;

	if (boosts.length > 0) {
		reply += `\n\n**Boosts:** ${boosts.join(', ')}.`;
	}

	return reply;
}
export type TamesCommandOptions = CommandRunOptions<{
	set_name?: { name: string };
	cancel?: {};
	list?: {};
	merge?: { tame: string };
	feed?: { items: string };
	kill?: { name: string };
	collect?: { name: string };
	select?: { tame: string };
	view?: { tame: string };
	status?: {};
	equip?: { item: string };
	unequip?: { item: string };
	cast?: {
		tan?: string;
		spin_flax?: string;
		plank_make?: string;
		superglass_make?: string;
	};
	activity?: {
		name: string;
	};
	clue?: {
		clue: string;
	};
	set_custom_image?: {
		image: string;
	};
}>;
export const tamesCommand: OSBMahojiCommand = {
	name: 'tames',
	description: 'Manage your tames.',
	attributes: {
		requiresMinion: true,
		examples: ['/tames select 1']
	},
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'status',
			description: 'Check the status of your selected tame.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'list',
			description: 'List your tames.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'set_name',
			description: 'Change your tames name.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'name',
					description: 'The name you want to use.',
					required: true
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'cancel',
			description: 'Cancel your tames trip.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'merge',
			description: 'Merge a tame into your selected tame.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'tame',
					description: 'The tame you want to merge.',
					required: true,
					autocomplete: tameAutocomplete
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'feed',
			description: 'Feed your selected tame items.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'items',
					description: 'The items you want to feed.',
					required: true
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'kill',
			description: 'Send your selected tame to kill things.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'name',
					description: 'The thing you want to kill.',
					required: true,
					autocomplete: async (value: string) => {
						return tameKillableMonsters
							.filter(i =>
								!value
									? true
									: i.name.toLowerCase().includes(value.toLowerCase()) ||
										i.aliases.some(alias => stringMatches(alias, value))
							)
							.map(i => ({ name: i.name, value: i.name }));
					}
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'collect',
			description: 'Send your selected tame to collect things.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'name',
					description: 'The thing you want to collect.',
					required: true,
					autocomplete: async (value: string) => {
						return collectables
							.filter(i => (!value ? true : i.item.name.toLowerCase().includes(value.toLowerCase())))
							.map(i => ({ name: i.item.name, value: i.item.name }));
					}
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'select',
			description: 'Select a tame.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'tame',
					description: 'The tame you want to select.',
					required: true,
					autocomplete: tameAutocomplete
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'view',
			description: 'View a tame.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'tame',
					description: 'The tame you want to view.',
					required: true,
					autocomplete: tameAutocomplete
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'equip',
			description: 'Equip an tame to your selected tame.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'item',
					description: 'The item you want to equip.',
					required: true,
					autocomplete: async (value: string) => {
						return tameEquippables
							.filter(t => (!value ? true : t.item.name.toLowerCase().includes(value.toLowerCase())))
							.map(i => ({ name: i.item.name, value: i.item.name }));
					}
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'unequip',
			description: 'Unequip an item from your selected tame.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'item',
					description: 'The item you want to unequip.',
					required: true,
					autocomplete: async (_, user) => {
						const klasaUser = await mUserFetch(user.id);
						const { tame } = await getUsersTame(klasaUser);
						return tameEquipSlots
							.map(i => tame?.[i])
							.filter(notEmpty)
							.map(itemNameFromID)
							.filter(notEmpty)
							.map(i => ({ name: i, value: i }));
					}
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'cast',
			description: 'Make your monkey do some magic!',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'tan',
					description: 'The leather you want your monkey to tan.',
					required: false,
					autocomplete: async input => {
						return Tanning.filter(t =>
							!input ? true : t.name.toLowerCase().includes(input.toLowerCase())
						).map(t => ({ name: t.name, value: t.name }));
					}
				},
				{
					type: ApplicationCommandOptionType.String,
					name: 'spin_flax',
					description: 'Create flax.',
					required: false,
					choices: [{ name: 'Flax', value: 'flax' }]
				},
				{
					type: ApplicationCommandOptionType.String,
					name: 'plank_make',
					description: 'The plank you want to make.',
					required: false,
					choices: Planks.map(t => ({ name: t.name, value: t.name }))
				},
				{
					type: ApplicationCommandOptionType.String,
					name: 'superglass_make',
					description: 'Create glass.',
					required: false,
					choices: [{ name: 'Molten glass', value: 'molten glass' }]
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'activity',
			description: 'Send your tame to do other activities.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'name',
					description: 'The activity to do.',
					required: true,
					autocomplete: async input => {
						return arbitraryTameActivities
							.filter(t => (!input ? true : t.name.toLowerCase().includes(input.toLowerCase())))
							.map(t => ({ name: t.name, value: t.name }));
					}
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'clue',
			description: 'Send your eagle tame to do some clue scrolls.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'clue',
					description: 'The clue tier to do.',
					required: true,
					autocomplete: async (input, rawUser) => {
						const user = await mUserFetch(rawUser.id);
						return ClueTiers.filter(t =>
							!input ? true : t.name.toLowerCase().includes(input.toLowerCase())
						)
							.filter(t => user.bank.has(t.scrollID))
							.map(t => ({ name: `${t.name} (${user.bank.amount(t.scrollID)}x owned)`, value: t.name }));
					}
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'set_custom_image',
			description: 'Set a custom image for your tame.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'image',
					description: 'The image to pick.',
					required: true,
					autocomplete: async () => {
						const options = tameImageReplacementChoices.map(t => ({
							name: `${t.name} (${tameSpecies.find(s => s.id === t.species)!.name})`,
							value: t.name
						}));
						options.unshift({ name: 'None', value: 'none' });
						return options;
					}
				}
			]
		}
	],
	run: async ({ options, userID, channelID, interaction }: TamesCommandOptions) => {
		const user = await mUserFetch(userID);
		if (options.set_name) return setNameCommand(user, options.set_name.name);
		if (options.cancel) return cancelCommand(user);
		if (options.list) return tameImage(user);
		if (options.merge) return mergeCommand(user, interaction, Number(options.merge.tame));
		if (options.feed) return feedCommand(interaction, user, options.feed.items);
		if (options.kill) return killCommand(user, channelID, options.kill.name);
		if (options.collect) return collectCommand(user, channelID, options.collect.name);
		if (options.select) return selectCommand(user, Number(options.select.tame));
		if (options.view) return viewCommand(user, Number(options.view.tame));
		if (options.status) return statusCommand(user);
		if (options.equip) return tameEquipCommand(user, options.equip.item);
		if (options.unequip) return tameUnequipCommand(user, options.unequip.item);
		if (options.cast?.plank_make) return plankMakeCommand(user, channelID, options.cast.plank_make);
		if (options.cast?.spin_flax) return spinFlaxCommand(user, channelID);
		if (options.cast?.tan) return tanLeatherCommand(user, channelID, options.cast.tan);
		if (options.cast?.superglass_make) return superGlassCommand(user, channelID);
		if (options.clue?.clue) {
			return tameClueCommand(user, channelID, options.clue.clue);
		}
		if (options.activity) {
			const tameActivity = arbitraryTameActivities.find(i => stringMatches(i.name, options.activity!.name));
			if (!tameActivity) {
				return 'Invalid activity.';
			}
			const { tame, activity, species } = await getUsersTame(user);
			if (activity) {
				return `${tameName(tame)} is busy.`;
			}
			if (!tame || !species) {
				return 'You have no selected tame.';
			}
			if (!tameActivity.allowedTames.includes(tame.species_id)) {
				return `Your selected tame species cannot do this activity, switch to a different tame: ${mentionCommand(
					globalClient,
					'tames',
					'select'
				)}.`;
			}
			const boosts: string[] = [];
			let maxTripLength = Time.Minute * 20 * (4 - tameGrowthLevel(tame));
			if (tameHasBeenFed(tame, itemID('Zak'))) {
				maxTripLength += Time.Minute * 35;
				boosts.push('+35mins trip length (ate a Zak)');
			}
			maxTripLength += patronMaxTripBonus(user) * 2;
			const task = await createTameTask({
				user,
				channelID: channelID.toString(),
				selectedTame: tame,
				data: {
					type: tameActivity.id
				},
				type: tameActivity.id,
				duration: maxTripLength,
				fakeDuration: undefined
			});

			let reply = `${tameName(tame)} is now doing ${tameActivity.name}. The trip will take ${formatDuration(
				task.duration
			)}.`;

			if (boosts.length > 0) {
				reply += `\n\n**Boosts:** ${boosts.join(', ')}.`;
			}

			return reply;
		}
		if (options.set_custom_image) {
			if (user.perkTier() < PerkTier.Four) {
				return 'You need to be a Tier 3 patron to set a custom image for your tame.';
			}

			// Handle resetting the custom image:
			if (options.set_custom_image?.image.toLowerCase() === 'none') {
				const { tame } = await getUsersTame(user);
				if (tame === null) {
					return "You don't have a tame selected, select the tame who's icon should be reset.";
				}
				await prisma.tame.update({
					where: {
						id: tame.id
					},
					data: {
						custom_icon_id: null
					}
				});
				return 'Successfully removed the custom tame icon!';
			}

			// Handle updating the image:
			const replacement = tameImageReplacementChoices.find(i => i.name === options.set_custom_image?.image);
			if (!replacement) {
				return 'Invalid image.';
			}
			const { tame } = await getUsersTame(user);
			if (tame === null) {
				return "You don't have a tame selected, select the tame you want to give this icon.";
			}
			if (tame.species_id !== replacement.species) {
				return `This image is for the ${tameSpecies.find(s => s.id === replacement.species)!.name} species.`;
			}
			await prisma.tame.update({
				where: {
					id: tame.id
				},
				data: {
					custom_icon_id: replacement.name
				}
			});
			return `You set the '${replacement.name}' custom image for your ${tameName(tame)}.`;
		}
		return 'Invalid command.';
	}
};
