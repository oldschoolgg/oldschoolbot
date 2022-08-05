import { time } from '@discordjs/builders';
import { Tame, tame_growth, TameActivity } from '@prisma/client';
import { calcPercentOfNum, calcWhatPercent, notEmpty, reduceNumByPercent, Time } from 'e';
import { readFile } from 'fs/promises';
import { KlasaClient, KlasaUser } from 'klasa';
import { APIUser, ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';
import { Bank, Monsters } from 'oldschooljs';
import { Item, ItemBank } from 'oldschooljs/dist/meta/types';
import { Canvas, CanvasRenderingContext2D, Image, loadImage } from 'skia-canvas/lib';

import { badges } from '../../lib/constants';
import { Eatables } from '../../lib/data/eatables';
import { getSimilarItems } from '../../lib/data/similarItems';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import getUserFoodFromBank from '../../lib/minions/functions/getUserFoodFromBank';
import { KillableMonster } from '../../lib/minions/types';
import { prisma, trackLoot } from '../../lib/settings/prisma';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import {
	createTameTask,
	getMainTameLevel,
	getTameSpecies,
	getUsersTame,
	tameGrowthLevel,
	tameHasBeenFed,
	tameName,
	tameSpecies,
	TameSpeciesID,
	TameTaskOptions,
	TameType
} from '../../lib/tames';
import {
	formatDuration,
	formatSkillRequirements,
	isWeekend,
	itemID,
	itemNameFromID,
	stringMatches,
	toTitleCase,
	updateBankSetting
} from '../../lib/util';
import { fillTextXTimesInCtx, getClippedRegion } from '../../lib/util/canvasUtil';
import findMonster from '../../lib/util/findMonster';
import getOSItem, { getItem } from '../../lib/util/getOSItem';
import { patronMaxTripCalc } from '../../lib/util/getUsersPerkTier';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { parseStringBank } from '../../lib/util/parseStringBank';
import resolveItems from '../../lib/util/resolveItems';
import BankImageTask from '../../tasks/bankImage';
import { collectables } from '../lib/abstracted_commands/collectCommand';
import { OSBMahojiCommand } from '../lib/util';
import { handleMahojiConfirmation, mahojiUserSettingsUpdate } from '../mahojiSettings';

async function tameAutocomplete(value: string, user: APIUser) {
	const tames = await prisma.tame.findMany({
		where: {
			user_id: user.id
		}
	});
	return tames
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

export type TameEquipSlot = typeof tameEquipSlots[number];
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

export const tameEquippables: TameEquippable[] = [...igneClaws];

interface FeedableItem {
	item: Item;
	tameSpeciesCanBeFedThis: TameType[];
	description: string;
	announcementString: string;
}

export const feedableItems: FeedableItem[] = [
	{
		item: getOSItem('Ori'),
		description: '25% extra loot',
		tameSpeciesCanBeFedThis: [TameType.Combat],
		announcementString: 'Your tame will now get 25% extra loot!'
	},
	{
		item: getOSItem('Zak'),
		description: '+35 minutes longer max trip length',
		tameSpeciesCanBeFedThis: [TameType.Combat, TameType.Gatherer],
		announcementString: 'Your tame now has a much longer max trip length!'
	},
	{
		item: getOSItem('Abyssal cape'),
		description: '25% food reduction',
		tameSpeciesCanBeFedThis: [TameType.Combat],
		announcementString: 'Your tame now has 25% food reduction!'
	},
	{
		item: getOSItem('Voidling'),
		description: '10% faster collecting',
		tameSpeciesCanBeFedThis: [TameType.Gatherer],
		announcementString: 'Your tame can now collect items 10% faster thanks to the Voidling helping them teleport!'
	},
	{
		item: getOSItem('Ring of endurance'),
		description: '10% faster collecting',
		tameSpeciesCanBeFedThis: [TameType.Gatherer],
		announcementString:
			'Your tame can now collect items 10% faster thanks to the Ring of endurance helping them run for longer!'
	},
	{
		item: getOSItem('Dwarven warhammer'),
		description: '30% faster PvM',
		tameSpeciesCanBeFedThis: [TameType.Combat],
		announcementString: "Your tame can now kill 30% faster! It's holding the Dwarven warhammer in its claws..."
	},
	{
		item: getOSItem('Mr. E'),
		description: 'Chance to get 2x loot',
		tameSpeciesCanBeFedThis: [TameType.Combat, TameType.Gatherer, TameType.Artisan, TameType.Support],
		announcementString: "With Mr. E's energy absorbed, your tame now has a chance at 2x loot!"
	}
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

// eslint-disable-next-line @typescript-eslint/init-declarations
let sprites: {
	base: {
		image: Image;
		slot: Canvas;
		selectedSlot: Canvas;
		shinyIcon: Canvas;
	};
	tames: {
		id: number;
		name: string;
		image: Image;
		sprites: { type: number; growthStage: Record<tame_growth, Canvas> }[];
	}[];
	gearIconBg: Image;
};
async function initSprites() {
	const tameSpriteBase = await loadImage(await readFile('./src/lib/resources/images/tames/tame_sprite.png'));
	sprites = {
		gearIconBg: await loadImage(await readFile('./src/lib/resources/images/gear_icon_bg.png')),
		base: {
			image: tameSpriteBase,
			slot: getClippedRegion(tameSpriteBase, 0, 0, 256, 128),
			selectedSlot: getClippedRegion(tameSpriteBase, 0, 128, 256, 128),
			shinyIcon: getClippedRegion(tameSpriteBase, 256, 0, 24, 24)
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
					sprites: vars.map(v => {
						return {
							type: v,
							growthStage: {
								[tame_growth.baby]: getClippedRegion(tameImage, (v - 1) * 96, 0, 96, 96),
								[tame_growth.juvenile]: getClippedRegion(tameImage, (v - 1) * 96, 96, 96, 96),
								[tame_growth.adult]: getClippedRegion(tameImage, (v - 1) * 96, 96 * 2, 96, 96)
							}
						};
					})
				};
			})
		)
	};
}
initSprites();

function drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number) {
	const baseFill = ctx.fillStyle;
	ctx.fillStyle = '#000000';
	fillTextXTimesInCtx(ctx, text, x, y + 1);
	fillTextXTimesInCtx(ctx, text, x, y - 1);
	fillTextXTimesInCtx(ctx, text, x + 1, y);
	fillTextXTimesInCtx(ctx, text, x - 1, y);
	ctx.fillStyle = baseFill;
	fillTextXTimesInCtx(ctx, text, x, y);
}

async function tameImage(user: KlasaUser): CommandResponse {
	const userTames = await prisma.tame.findMany({
		where: {
			user_id: user.id
		},
		orderBy: {
			id: 'asc'
		}
	});

	if (userTames.length === 0) {
		return "You don't have any tames.";
	}

	let { tame, activity } = await getUsersTame(user);

	// Init the background images if they are not already
	const bankTask = globalClient.tasks.get('bankImage') as BankImageTask;

	let {
		sprite,
		uniqueSprite,
		background: userBgImage
	} = bankTask.getBgAndSprite(user.settings.get(UserSettings.BankBackground) ?? 1);
	const hexColor = user.settings.get(UserSettings.BankBackgroundHex);

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

	if (!userBgImage.transparent) bankTask.drawBorder(ctx, sprite, false);

	ctx.translate(16, 16);
	let i = 0;
	for (const t of userTames) {
		const species = tameSpecies.find(i => i.id === t.species_id)!;
		let isTameActive: boolean = false;
		let selectedTame = tame && t.id === tame.id;
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

		const tameX = (10 + 256) * x + (isTameActive ? 96 : 256 - 96) / 2;
		const tameY = (10 + 128) * y + 10;
		const tameImageSize = 96;
		const tameImage = sprites
			.tames!.find(t => t.id === species.id)!
			.sprites.find(f => f.type === t.species_variant)!.growthStage[t.growth_stage];
		// Draw tame
		ctx.drawImage(tameImage, tameX, tameY, tameImageSize, tameImageSize);

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
		for (const { item } of feedableItems.filter(f => f.tameSpeciesCanBeFedThis.includes(species.type))) {
			if (tameHasBeenFed(t, item.id)) {
				const itemImage = await bankTask.getItemImage(item.id);
				if (itemImage) {
					let ratio = 19 / itemImage.height;
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
			const icon = await bankTask.getItemImage(equippedInThisSlot);
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

	const rawBadges = user.settings.get(UserSettings.Badges);
	const badgesStr = rawBadges.map(num => badges[num]).join(' ');
	const buffer = await canvas.toBuffer('png');

	return {
		content: `${badgesStr}${user.username}, ${userTames.length > 1 ? 'here are your tames' : 'this is your tame'}!`,
		attachments: [{ buffer, fileName: `${user.username}_${user.discriminator}_tames.png` }]
	};
}

export async function removeRawFood({
	client,
	user,
	totalHealingNeeded,
	healPerAction,
	monster,
	quantity,
	tame
}: {
	client: KlasaClient;
	user: KlasaUser;
	totalHealingNeeded: number;
	healPerAction: number;
	raw?: boolean;
	monster: KillableMonster;
	quantity: number;
	tame: Tame;
}): Promise<{ success: false; str: string } | { success: true; str: string; removed: Bank }> {
	await user.settings.sync(true);
	if (tameHasBeenFed(tame, itemID('Abyssal cape'))) {
		totalHealingNeeded = Math.floor(totalHealingNeeded * 0.75);
		healPerAction = Math.floor(healPerAction * 0.75);
	}

	const foodToRemove = getUserFoodFromBank(
		user,
		totalHealingNeeded,
		user.settings.get(UserSettings.FavoriteFood),
		true
	);
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

	updateBankSetting(client, ClientSettings.EconomyStats.PVMCost, itemCost);

	return {
		success: true,
		str: `${itemCost} from ${user.username}`,
		removed: itemCost
	};
}

export function getTameStatus(tameActivity: TameActivity | null) {
	if (tameActivity) {
		const currentDate = new Date().valueOf();
		const timeRemaining = `${formatDuration(tameActivity.finish_date.valueOf() - currentDate, true)} remaining`;
		const activityData = tameActivity.data as any as TameTaskOptions;
		switch (activityData.type) {
			case TameType.Combat:
				return [
					`Killing ${activityData.quantity.toLocaleString()}x ${Monsters.find(
						m => m.id === activityData.monsterID
					)?.name.toLowerCase()}`,
					timeRemaining
				];
			case TameType.Gatherer:
				return [`Collecting ${itemNameFromID(activityData.itemID)?.toLowerCase()}`, timeRemaining];
			default:
				return ['This tame type is not released yet.'];
		}
	}
	return ['Idle'];
}

async function setNameCommand(user: KlasaUser, name: string) {
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

async function cancelCommand(user: KlasaUser) {
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

async function mergeCommand(user: KlasaUser, interaction: SlashCommandInteraction, tameID: number) {
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

	const tames = await prisma.tame.findMany({ where: { user_id: user.id } });
	const toSelect = tames.find(t => t.id === tameID);
	if (!toSelect || !tameID) {
		return "Couldn't find a tame to participate in the ritual. Make sure you selected the correct Tame, by its number or nickname.";
	}

	const { tame, activity, species } = await getUsersTame(user);
	if (activity) return 'Your tame is busy. Wait for it to be free to do this.';
	if (!tame || !species) return "You don't have a selected tame. Select your tame first.";
	if (tame.id === toSelect.id) return `You can't merge ${tameName(tame)} with itself!`;
	if (species.id !== getTameSpecies(toSelect).id) {
		return "You can't merge two tames from two different species!";
	}

	const { mergingCost, shinyVariant } = species;

	if (!user.owns(mergingCost)) {
		return `You don't have enough materials for this ritual. You need ${mergingCost}. You are missing **${mergingCost
			.clone()
			.remove(user.bank())}**.`;
	}

	const mergeStuff = {
		totalLoot: new Bank(tame!.max_total_loot as ItemBank).add(toSelect.max_total_loot as ItemBank).bank,
		fedItems: new Bank(tame!.fed_items as ItemBank).add(toSelect.fed_items as ItemBank).bank,
		maxCombatLevel: Math.max(tame!.max_combat_level, toSelect.max_combat_level),
		maxArtisanLevel: Math.max(tame!.max_artisan_level, toSelect.max_artisan_level),
		maxGathererLevel: Math.max(tame!.max_gatherer_level, toSelect.max_gatherer_level),
		maxSupportLevel: Math.max(tame!.max_support_level, toSelect.max_support_level),
		speciesVariant:
			tame!.species_variant === shinyVariant || toSelect.species_variant === shinyVariant
				? shinyVariant
				: tame!.species_variant
	};

	await handleMahojiConfirmation(
		interaction,
		`Are you sure you want to merge **${tameName(toSelect)}** (Tame ${toSelect.id}) into **${tameName(
			tame!
		)}** (Tame ${tame!.id})?\n\n${tameName(
			tame!
		)} will receive all the items fed and all loot obtained from ${tameName(
			toSelect
		)}, and will have its stats match the highest of both tames.\n\n**THIS ACTION CAN NOT BE REVERSED!**`
	);

	await user.removeItemsFromBank(mergingCost);
	updateBankSetting(globalClient, ClientSettings.EconomyStats.TameMergingCost, mergingCost);

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

	return `${tameName(tame)} consumed ${tameName(toSelect)} and all its attributes.`;
}

async function feedCommand(interaction: SlashCommandInteraction, user: KlasaUser, str: string) {
	const { tame, species } = await getUsersTame(user);
	if (!tame) {
		return 'You have no selected tame.';
	}

	let rawBank = parseStringBank(str);
	let bankToAdd = new Bank();
	let userBank = user.bank();
	for (const [item, qty] of rawBank) {
		let qtyOwned = userBank.amount(item.id);
		if (qtyOwned === 0) continue;
		let qtyToUse = !qty ? 1 : qty > qtyOwned ? qtyOwned : qty;
		bankToAdd.add(item.id, qtyToUse);
	}

	const thisTameSpecialFeedableItems = feedableItems.filter(f => f.tameSpeciesCanBeFedThis.includes(species!.type));

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

	let specialStrArr = [];
	for (const { item, description, tameSpeciesCanBeFedThis } of thisTameSpecialFeedableItems) {
		const similarItems = [item.id, ...getSimilarItems(item.id)];
		if (similarItems.some(si => bankToAdd.has(si))) {
			if (!tameSpeciesCanBeFedThis.includes(species!.type)) {
				await handleMahojiConfirmation(
					interaction,
					`Feeding a '${item.name}' to your tame won't give it a perk, are you sure you want to?`
				);
			}
			specialStrArr.push(`**${item.name}**: ${description}`);
		}
	}
	let specialStr = specialStrArr.length === 0 ? '' : `\n\n${specialStrArr.join(', ')}`;
	await handleMahojiConfirmation(
		interaction,
		`Are you sure you want to feed \`${bankToAdd}\` to ${tameName(
			tame
		)}? You **cannot** get these items back after they're eaten by your tame.${specialStr}`
	);

	let egg = '';
	for (const [eggBank, eggSpecies, eggGrowth, easterEgg] of feedingEasterEggs) {
		if (species!.id === eggSpecies && bankToAdd.fits(eggBank) && eggGrowth.includes(tame.growth_stage)) {
			egg = ` ${easterEgg}`;
		}
	}

	let newBoosts: string[] = [];
	for (const { item, announcementString } of thisTameSpecialFeedableItems) {
		if (bankToAdd.has(item.id) && !tameHasBeenFed(tame, item.id)) {
			newBoosts.push(`**${announcementString}**`);
		}
	}

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

async function killCommand(user: KlasaUser, channelID: bigint, str: string) {
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
	const monster = findMonster(str);
	if (!monster) {
		return "That's not a valid monster.";
	}

	// Get the amount stronger than minimum, and set boost accordingly:
	const [speciesMinCombat, speciesMaxCombat] = species.combatLevelRange;
	// Example: If combat level is 80/100 with 70 min, give a 10% boost.
	const combatLevelBoost = calcWhatPercent(tame.max_combat_level - speciesMinCombat, speciesMaxCombat);

	// Increase trip length based on minion growth:
	let speed = monster.timeToFinish * tameGrowthLevel(tame);

	// Apply calculated boost:
	speed = reduceNumByPercent(speed, combatLevelBoost);

	let boosts = [];
	let maxTripLength = Time.Minute * 20 * (4 - tameGrowthLevel(tame));
	if (tameHasBeenFed(tame, itemID('Zak'))) {
		maxTripLength += Time.Minute * 35;
		boosts.push('+35mins trip length (ate a Zak)');
	}

	maxTripLength += patronMaxTripCalc(user) * 2;
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

	// Calculate monster quantity:
	const quantity = Math.floor(maxTripLength / speed);
	if (quantity < 1) {
		return "Your tame can't kill this monster fast enough.";
	}
	const foodRes = await removeRawFood({
		client: globalClient,
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

	const duration = Math.floor(quantity * speed);

	await trackLoot({
		id: monster.name,
		changeType: 'cost',
		type: 'Monster',
		cost: foodRes.removed,
		suffix: 'tame'
	});

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
		duration
	});

	let reply = `${tameName(tame)} is now killing ${quantity}x ${monster.name}. The trip will take ${formatDuration(
		duration
	)}.\n\nRemoved ${foodRes.str}`;

	if (boosts.length > 0) {
		reply += `\n\n**Boosts:** ${boosts.join(', ')}.`;
	}

	return reply;
}

async function collectCommand(user: KlasaUser, channelID: bigint, str: string) {
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

	let boosts = [];

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
	maxTripLength += patronMaxTripCalc(user) * 2;
	// Calculate monster quantity:
	const quantity = Math.floor(maxTripLength / speed);
	if (quantity < 1) {
		return "Your tame can't kill this monster fast enough.";
	}

	let duration = Math.floor(quantity * speed);

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
		duration
	});

	let reply = `${tameName(tame)} is now collecting ${quantity * collectable.quantity}x ${
		collectable.item.name
	}. The trip will take ${formatDuration(duration)}.`;

	if (boosts.length > 0) {
		reply += `\n\n**Boosts:** ${boosts.join(', ')}.`;
	}

	return reply;
}

async function selectCommand(user: KlasaUser, tameID: number) {
	const tames = await prisma.tame.findMany({ where: { user_id: user.id } });
	const toSelect = tames.find(t => t.id === tameID);
	if (!toSelect) {
		return "Couldn't find a tame to select.";
	}
	const { activity } = await getUsersTame(user);
	if (activity) {
		return "You can't select a different tame, because your current one is busy.";
	}
	await mahojiUserSettingsUpdate(user.id, {
		selected_tame: toSelect.id
	});
	return `You selected your ${tameName(toSelect)}.`;
}

async function viewCommand(user: KlasaUser, tameID: number): CommandResponse {
	const tames = await prisma.tame.findMany({ where: { user_id: user.id } });
	const tame = tames.find(t => t.id === tameID);
	if (!tame) {
		return "Couldn't find that tame.";
	}
	const species = tameSpecies.find(i => i.id === tame.species_id)!;
	const fedItems = new Bank(tame.fed_items as ItemBank);
	const loot = new Bank(tame.max_total_loot as ItemBank);
	const image = await makeBankImage({
		bank: loot,
		title: 'Total Loot From This Tame',
		user
	});
	const fedImage = await makeBankImage({
		bank: fedItems,
		title: 'Items Fed To This Tame',
		user
	});
	return {
		content: `**Name:** ${tame.nickname ?? 'No name'}
**Species:** ${species.name}
**Shiny:** ${tame.species_variant === species.shinyVariant ? 'Yes' : 'No'}
**Growth:** ${tame.growth_percent}% ${tame.growth_stage}
**Hatch Date:** ${time(tame.date)} / ${time(tame.date, 'R')}
**${toTitleCase(species.relevantLevelCategory)} Level:** ${tame[`max_${species.relevantLevelCategory}_level`]}
**Boosts:** ${feedableItems
			.filter(i => tameHasBeenFed(tame, i.item.id))
			.map(i => `${i.item.name} (${i.description})`)
			.join(', ')}`,
		attachments: [image.file, fedImage.file]
	};
}

async function statusCommand(user: KlasaUser) {
	const { tame, activity } = await getUsersTame(user);
	if (!tame) {
		return 'You have no tame selected.';
	}
	return `${tameName(tame)} is currently: ${getTameStatus(activity)}`;
}

async function tameEquipCommand(user: KlasaUser, itemName: string) {
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

async function tameUnequipCommand(user: KlasaUser, itemName: string) {
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
						return killableMonsters
							.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
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
						const klasaUser = await globalClient.fetchUser(user.id);
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
		}
	],
	run: async ({ options, userID, channelID, interaction }: TamesCommandOptions) => {
		const user = await globalClient.fetchUser(userID);
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
		return 'Invalid command.';
	}
};
