import { MessageAttachment } from 'discord.js';
import { calcWhatPercent, reduceNumByPercent, Time } from 'e';
import fs from 'fs';
import { CommandStore, KlasaClient, KlasaMessage, KlasaUser } from 'klasa';
import { Bank, Monsters } from 'oldschooljs';
import { Item, ItemBank } from 'oldschooljs/dist/meta/types';
import { Canvas, CanvasRenderingContext2D, Image } from 'skia-canvas/lib';

import { badges } from '../../lib/constants';
import { Eatables } from '../../lib/data/eatables';
import { requiresMinion } from '../../lib/minions/decorators';
import getUserFoodFromBank from '../../lib/minions/functions/getUserFoodFromBank';
import { KillableMonster } from '../../lib/minions/types';
import { prisma, trackLoot } from '../../lib/settings/prisma';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import {
	createTameTask,
	getMainTameLevel,
	getTameSpecies,
	getUsersTame,
	tameGrowthLevel,
	tameHasBeenFed,
	tameName,
	tameSpecies,
	TameTaskOptions,
	TameType
} from '../../lib/tames';
import {
	addBanks,
	formatDuration,
	formatSkillRequirements,
	isWeekend,
	itemNameFromID,
	stringMatches,
	toTitleCase,
	updateBankSetting
} from '../../lib/util';
import { canvasImageFromBuffer, fillTextXTimesInCtx } from '../../lib/util/canvasUtil';
import findMonster from '../../lib/util/findMonster';
import getOSItem from '../../lib/util/getOSItem';
import { patronMaxTripCalc } from '../../lib/util/getUsersPerkTier';
import itemID from '../../lib/util/itemID';
import { parseStringBank } from '../../lib/util/parseStringBank';
import resolveItems from '../../lib/util/resolveItems';
import { collectables } from '../../mahoji/lib/abstracted_commands/collectCommand';
import { mahojiUserSettingsUpdate } from '../../mahoji/mahojiSettings';
import BankImageTask from '../../tasks/bankImage';
import { Tame, tame_growth, TameActivity } from '.prisma/client';

interface FeedableItem {
	item: Item;
	tameSpeciesCanBeFedThis: TameType[];
	description: string;
	announcementString: string;
}

const feedableItems: FeedableItem[] = [
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

function formatDurationSmall(ms: number) {
	if (ms < 0) ms = -ms;
	const time = {
		d: Math.floor(ms / 86_400_000),
		h: Math.floor(ms / 3_600_000) % 24,
		m: Math.floor(ms / 60_000) % 60,
		s: Math.floor(ms / 1000) % 60
	};
	let nums = Object.entries(time).filter(val => val[1] !== 0);
	if (nums.length === 0) return '1s';
	return nums.map(([key, val]) => `${val}${key}`).join(' ');
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
}): Promise<[string, Bank]> {
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
		throw `You don't have enough Raw food to feed your tame in this trip. You need enough food to heal at least ${totalHealingNeeded} HP (${healPerAction} per action). You can use these food items: ${Eatables.filter(
			i => i.raw
		)
			.map(i => itemNameFromID(i.raw!))
			.join(', ')}.`;
	} else {
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
			throw `You don't have the required items, you need: ${itemCost}.`;
		}
		await user.removeItemsFromBank(itemCost);

		updateBankSetting(client, ClientSettings.EconomyStats.PVMCost, itemCost);

		return [`${itemCost} from ${user.username}`, itemCost];
	}
}

export async function getTameStatus(user: KlasaUser) {
	const [, currentTask] = await getUsersTame(user);
	if (currentTask) {
		const currentDate = new Date().valueOf();
		const timeRemaining = `${formatDurationSmall(currentTask.finish_date.valueOf() - currentDate)} remaining`;
		const activityData = currentTask.data as any as TameTaskOptions;
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

let bankTask: BankImageTask | null = null;
// Split sprite into smaller images by coors and size
function getClippedRegion(image: Image | Canvas, x: number, y: number, width: number, height: number) {
	const canvas = new Canvas(0, 0);
	const ctx = canvas.getContext('2d');
	canvas.width = width;
	canvas.height = height;
	ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
	return canvas;
}

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

async function getItem(item: number) {
	return bankTask!.getItemImage(item).catch(() => {
		console.error(`Failed to load item image for item with id: ${item}`);
	});
}

export default class extends BotCommand {
	public tameSprites: {
		base?: {
			image: Image;
			slot: Canvas;
			selectedSlot: Canvas;
			shinyIcon: Canvas;
		};
		tames?: {
			id: number;
			name: string;
			image: Image;
			sprites: {
				type: number;
				growthStage: {
					[tame_growth.baby]: Canvas;
					[tame_growth.juvenile]: Canvas;
					[tame_growth.adult]: Canvas;
				};
			}[];
		}[];
	} = {};

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			categoryFlags: ['minion'],
			description: 'Use to control and manage your tames.',
			examples: ['+tames k fire giant', '+tames', '+tames select 1', '+tames setname LilBuddy'],
			subcommands: true,
			usage: '[k|c|select|setname|feed|merge|cancel] [input:...str]',
			usageDelim: ' ',
			aliases: ['tame', 't']
		});
	}

	async init() {
		const tameSpriteBase = await canvasImageFromBuffer(
			fs.readFileSync('./src/lib/resources/images/tames/tame_sprite.png')
		);
		this.tameSprites.base = {
			image: tameSpriteBase,
			slot: getClippedRegion(tameSpriteBase, 0, 0, 256, 128),
			selectedSlot: getClippedRegion(tameSpriteBase, 0, 128, 256, 128),
			shinyIcon: getClippedRegion(tameSpriteBase, 256, 0, 24, 24)
		};
		this.tameSprites.tames = await Promise.all(
			tameSpecies.map(async value => {
				const tameImage = await canvasImageFromBuffer(
					fs.readFileSync(`./src/lib/resources/images/tames/${value.id}_sprite.png`)
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
		);
	}

	async setname(msg: KlasaMessage, [name = '']: [string]) {
		if (
			!name ||
			name.length < 2 ||
			name.length > 30 ||
			['\n', '`', '@', '<', ':'].some(char => name.includes(char))
		) {
			return msg.channel.send("That's not a valid name for your tame.");
		}
		const [selectedTame] = await getUsersTame(msg.author);
		if (!selectedTame) {
			return msg.channel.send('You have no selected tame to set a nickname for, select one first.');
		}

		await prisma.tame.update({
			where: {
				id: selectedTame.id
			},
			data: {
				nickname: name
			}
		});

		return msg.channel.send(`Updated the nickname of your selected tame to ${name}.`);
	}

	async tameList(msg: KlasaMessage) {
		if (this.client.owners.has(msg.author) && msg.flagArgs.reload) await this.init();
		const userTames = await prisma.tame.findMany({
			where: {
				user_id: msg.author.id
			},
			orderBy: {
				id: 'asc'
			}
		});

		if (userTames.length === 0) {
			return msg.channel.send("You don't have any tames.");
		}

		let mainTame: [Tame | null, TameActivity | null] | null = null;
		try {
			mainTame = await getUsersTame(msg.author);
		} catch (e) {}

		// Init the background images if they are not already
		if (!bankTask) bankTask = this.client.tasks.get('bankImage') as BankImageTask;

		let {
			sprite,
			uniqueSprite,
			background: userBgImage
		} = bankTask.getBgAndSprite(msg.author.settings.get(UserSettings.BankBackground) ?? 1);
		const hexColor = msg.author.settings.get(UserSettings.BankBackgroundHex);

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

		if (!userBgImage.transparent) bankTask?.drawBorder(ctx, sprite, false);

		ctx.translate(16, 16);
		let i = 0;
		for (const tame of userTames) {
			let isTameActive = false;
			let selectedTame = mainTame && mainTame[0] && mainTame[0].id === tame.id;
			if (selectedTame) isTameActive = (await getTameStatus(msg.author)).length > 1;

			const x = i % tamesPerLine;
			const y = Math.floor(i / tamesPerLine);
			ctx.drawImage(
				selectedTame ? this.tameSprites.base!.selectedSlot : this.tameSprites.base!.slot,
				(10 + 256) * x,
				(10 + 128) * y,
				256,
				128
			);
			// Draw tame
			ctx.drawImage(
				this.tameSprites
					.tames!.find(t => t.id === getTameSpecies(tame).id)!
					.sprites.find(f => f.type === tame.species_variant)!.growthStage[tame.growth_stage],
				(10 + 256) * x + (isTameActive ? 96 : 256 - 96) / 2,
				(10 + 128) * y + 10,
				96,
				96
			);

			// Draw tame name / level / stats
			ctx.fillStyle = '#ffffff';
			ctx.textAlign = 'left';
			drawText(
				ctx,
				`${tame.id}. ${
					tame.nickname ? `${tame.nickname} (${getTameSpecies(tame).name})` : getTameSpecies(tame).name
				}`,
				(10 + 256) * x + 5,
				(10 + 128) * y + 16
			);
			// Shiny indicator
			if (tame.species_variant === getTameSpecies(tame).shinyVariant) {
				ctx.drawImage(this.tameSprites.base!.shinyIcon, (10 + 256) * x + 5, (10 + 128) * y + 18, 16, 16);
				drawText(
					ctx,
					'Shiny!',
					(10 + 256) * x + 3 + this.tameSprites.base!.shinyIcon.width,
					(10 + 128) * y + 18 + this.tameSprites.base!.shinyIcon.height / 2
				);
			}

			ctx.textAlign = 'right';
			drawText(
				ctx,
				`${toTitleCase(getTameSpecies(tame).relevantLevelCategory)}: ${getMainTameLevel(tame)}`,
				(10 + 256) * x + 256 - 5,
				(10 + 128) * y + 16
			);
			ctx.textAlign = 'left';
			const grouthStage =
				tame.growth_stage === 'adult'
					? tame.growth_stage
					: `${tame.growth_stage} (${tame.growth_percent.toFixed(2)}%)`;
			drawText(ctx, `${toTitleCase(grouthStage)}`, (10 + 256) * x + 5, (10 + 128) * y + 128 - 5);

			// Draw tame status (idle, in activity)
			if (selectedTame) {
				const mtText = await getTameStatus(msg.author);
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
			for (const { item } of feedableItems.filter(f =>
				f.tameSpeciesCanBeFedThis.includes(getTameSpecies(tame).type)
			)) {
				if (tameHasBeenFed(tame, item.id)) {
					const itemImage = await getItem(item.id);
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
			i++;
		}

		const rawBadges = msg.author.settings.get(UserSettings.Badges);
		const badgesStr = rawBadges.map(num => badges[num]).join(' ');
		const buffer = await canvas.toBuffer('png');

		return msg.channel.send({
			content: `${badgesStr}${msg.author.username}, ${
				userTames.length > 1 ? 'here are your tames' : 'this is your tame'
			}!`,
			files: [new MessageAttachment(buffer, `${msg.author.username}_${msg.author.discriminator}_tames.png`)]
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage, [input]: [string | undefined]) {
		if (input) {
			const allTames = await prisma.tame.findMany({
				where: { user_id: msg.author.id }
			});
			const tame = allTames.find(
				t => stringMatches(t.id.toString(), input) || stringMatches(t.nickname ?? '', input)
			);
			if (!tame) {
				return msg.channel.send('No matching tame found.');
			}
			return msg.channel.sendBankImage({
				content: `${tameName(tame)}`,
				flags: msg.flagArgs,
				bank: new Bank(tame.max_total_loot as ItemBank),
				title: `All Loot ${tameName(tame)} Has Gotten You`
			});
		}
		return this.tameList(msg);
	}

	async select(msg: KlasaMessage, [str = '']: [string]) {
		const tames = await prisma.tame.findMany({ where: { user_id: msg.author.id } });
		const toSelect = tames.find(t => stringMatches(str, t.id.toString()) || stringMatches(str, t.nickname ?? ''));
		if (!toSelect) {
			return msg.channel.send("Couldn't find a tame to select.");
		}
		const [, currentTask] = await getUsersTame(msg.author);
		if (currentTask) {
			return msg.channel.send("You can't select a different tame, because your current one is busy.");
		}
		await mahojiUserSettingsUpdate(msg.author.id, {
			selected_tame: toSelect.id
		});
		return msg.channel.send(`You selected your ${tameName(toSelect)}.`);
	}

	async feed(msg: KlasaMessage, [str = '']: [string]) {
		const [selectedTame] = await getUsersTame(msg.author);
		if (!selectedTame) {
			return msg.channel.send('You have no selected tame.');
		}

		let rawBank = parseStringBank(str);
		let bankToAdd = new Bank();
		let userBank = msg.author.bank();
		for (const [item, qty] of rawBank) {
			let qtyOwned = userBank.amount(item.id);
			if (qtyOwned === 0) continue;
			let qtyToUse = !qty ? 1 : qty > qtyOwned ? qtyOwned : qty;
			bankToAdd.add(item.id, qtyToUse);
		}

		const thisTameSpecialFeedableItems = feedableItems.filter(f =>
			f.tameSpeciesCanBeFedThis.includes(getTameSpecies(selectedTame).type)
		);

		if (!str || bankToAdd.length === 0) {
			return msg.channel.sendBankImage({
				bank: new Bank(selectedTame.fed_items as ItemBank),
				title: 'Items Fed To This Tame',
				content: `The items which give a perk/usage to this tame type when fed are:\n${thisTameSpecialFeedableItems
					.map(i => `- ${i.item.name} (${i.description})`)
					.join('\n')}.`
			});
		}

		if (!userBank.fits(bankToAdd)) {
			return msg.channel.send("You don't have enough items.");
		}

		let specialStrArr = [];
		for (const { item, description, tameSpeciesCanBeFedThis } of thisTameSpecialFeedableItems) {
			if (bankToAdd.has(item.id)) {
				if (!tameSpeciesCanBeFedThis.includes(getTameSpecies(selectedTame).type)) {
					await msg.confirm(
						`Feeding a '${item.name}' to your tame won't give it a perk, are you sure you want to?`
					);
				}
				specialStrArr.push(`**${item.name}**: ${description}`);
			}
		}
		let specialStr = specialStrArr.length === 0 ? '' : `\n\n${specialStrArr.join(', ')}`;
		await msg.confirm(
			`Are you sure you want to feed \`${bankToAdd}\` to ${tameName(
				selectedTame
			)}? You **cannot** get these items back after they're eaten by your tame.${specialStr}`
		);

		for (const [eggBank, eggSpecies, eggGrowth, easterEgg] of feedingEasterEggs) {
			if (
				getTameSpecies(selectedTame).id === eggSpecies &&
				bankToAdd.fits(eggBank) &&
				eggGrowth.includes(selectedTame.growth_stage)
			) {
				msg.channel.send(easterEgg);
			}
		}

		let newBoosts: string[] = [];
		for (const { item, announcementString } of thisTameSpecialFeedableItems) {
			if (bankToAdd.has(item.id) && !tameHasBeenFed(selectedTame, item.id)) {
				newBoosts.push(`**${announcementString}**`);
			}
		}

		await msg.author.removeItemsFromBank(bankToAdd);

		await prisma.tame.update({
			where: {
				id: selectedTame.id
			},
			data: {
				fed_items: addBanks([selectedTame.fed_items as ItemBank, bankToAdd.bank])
			}
		});

		return msg.channel.send(
			`You fed \`${bankToAdd}\` to ${tameName(selectedTame)}.${
				newBoosts.length > 0 ? `\n\n${newBoosts.join('\n')}` : ''
			}${specialStr}`
		);
	}

	async k(msg: KlasaMessage, [str = '']: [string]) {
		const [selectedTame, currentTask] = await getUsersTame(msg.author);
		if (!selectedTame) {
			return msg.channel.send('You have no selected tame.');
		}
		if (getTameSpecies(selectedTame).type !== TameType.Combat) {
			return msg.channel.send('This tame species cannot do PvM.');
		}
		if (currentTask) {
			return msg.channel.send(`${tameName(selectedTame)} is busy.`);
		}
		const monster = findMonster(str);
		if (!monster) {
			return msg.channel.send("That's not a valid monster.");
		}

		// Get the amount stronger than minimum, and set boost accordingly:
		const [speciesMinCombat, speciesMaxCombat] = getTameSpecies(selectedTame).combatLevelRange;
		// Example: If combat level is 80/100 with 70 min, give a 10% boost.
		const combatLevelBoost = calcWhatPercent(selectedTame.max_combat_level - speciesMinCombat, speciesMaxCombat);

		// Increase trip length based on minion growth:
		let speed = monster.timeToFinish * tameGrowthLevel(selectedTame);

		// Apply calculated boost:
		speed = reduceNumByPercent(speed, combatLevelBoost);

		let boosts = [];
		let maxTripLength = Time.Minute * 20 * (4 - tameGrowthLevel(selectedTame));
		if (tameHasBeenFed(selectedTame, itemID('Zak'))) {
			maxTripLength += Time.Minute * 35;
			boosts.push('+35mins trip length (ate a Zak)');
		}
		maxTripLength += patronMaxTripCalc(msg.author) * 2;
		if (isWeekend()) {
			speed = reduceNumByPercent(speed, 10);
			boosts.push('10% weekend boost');
		}
		if (tameHasBeenFed(selectedTame, itemID('Dwarven warhammer'))) {
			speed = reduceNumByPercent(speed, 30);
			boosts.push('30% faster (ate a DWWH)');
		}

		// Calculate monster quantity:
		const quantity = Math.floor(maxTripLength / speed);
		if (quantity < 1) {
			return msg.channel.send("Your tame can't kill this monster fast enough.");
		}
		const [foodStr, cost] = await removeRawFood({
			client: this.client,
			totalHealingNeeded: (monster.healAmountNeeded ?? 1) * quantity,
			healPerAction: monster.healAmountNeeded ?? 1,
			user: msg.author,
			monster,
			quantity,
			tame: selectedTame
		});
		const duration = Math.floor(quantity * speed);

		await trackLoot({
			id: monster.name,
			changeType: 'cost',
			type: 'Monster',
			cost,
			suffix: 'tame'
		});

		await createTameTask({
			user: msg.author,
			channelID: msg.channel.id,
			selectedTame,
			data: {
				type: TameType.Combat,
				monsterID: monster.id,
				quantity
			},
			type: TameType.Combat,
			duration
		});

		let reply = `${tameName(selectedTame)} is now killing ${quantity}x ${
			monster.name
		}. The trip will take ${formatDuration(duration)}.\n\nRemoved ${foodStr}`;

		if (boosts.length > 0) {
			reply += `\n\n**Boosts:** ${boosts.join(', ')}.`;
		}

		return msg.channel.send(reply);
	}

	async c(msg: KlasaMessage, [str = '']: [string]) {
		const [selectedTame, currentTask] = await getUsersTame(msg.author);
		if (!selectedTame) {
			return msg.channel.send('You have no selected tame.');
		}

		if (getTameSpecies(selectedTame).type !== TameType.Gatherer) {
			return msg.channel.send('This tame species cannot collect items.');
		}
		if (currentTask) {
			return msg.channel.send(`${tameName(selectedTame)} is busy.`);
		}
		const collectable = collectables.find(c => stringMatches(c.item.name, str));
		if (!collectable) {
			return msg.channel.send(
				`That's not a valid collectable item. The items you can collect are: ${collectables
					.map(i => i.item.name)
					.join(', ')}.`
			);
		}

		const [min, max] = getTameSpecies(selectedTame).gathererLevelRange;
		const gathererLevelBoost = calcWhatPercent(selectedTame.max_gatherer_level - min, max);

		// Increase trip length based on minion growth:
		let speed = collectable.duration;
		if (selectedTame.growth_stage === tame_growth.baby) {
			speed /= 1.5;
		} else if (selectedTame.growth_stage === tame_growth.juvenile) {
			speed /= 2;
		} else {
			speed /= 2.5;
		}

		let boosts = [];

		for (const item of resolveItems(['Voidling', 'Ring of endurance'])) {
			if (tameHasBeenFed(selectedTame, item)) {
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

		let maxTripLength = Time.Minute * 20 * (4 - tameGrowthLevel(selectedTame));
		if (tameHasBeenFed(selectedTame, itemID('Zak'))) {
			maxTripLength += Time.Minute * 35;
			boosts.push('+35mins trip length (ate a Zak)');
		}
		maxTripLength += patronMaxTripCalc(msg.author) * 2;
		// Calculate monster quantity:
		const quantity = Math.floor(maxTripLength / speed);
		if (quantity < 1) {
			return msg.channel.send("Your tame can't kill this monster fast enough.");
		}

		let duration = Math.floor(quantity * speed);

		await createTameTask({
			user: msg.author,
			channelID: msg.channel.id,
			selectedTame,
			data: {
				type: TameType.Gatherer,
				itemID: collectable.item.id,
				quantity
			},
			type: TameType.Gatherer,
			duration
		});

		let reply = `${tameName(selectedTame)} is now collecting ${quantity * collectable.quantity}x ${
			collectable.item.name
		}. The trip will take ${formatDuration(duration)}.`;

		if (boosts.length > 0) {
			reply += `\n\n**Boosts:** ${boosts.join(', ')}.`;
		}

		return msg.channel.send(reply);
	}

	async cancel(msg: KlasaMessage) {
		const [selectedTame, currentTask] = await getUsersTame(msg.author);
		if (!selectedTame) {
			return msg.channel.send('You have no selected tame.');
		}

		if (!currentTask) {
			return msg.channel.send(
				`${tameName(selectedTame)} is not doing any activity, so there's nothing to cancel.`
			);
		}

		await msg.confirm(
			'Are you sure you want to cancel your tames task? If they took any items (e.g food) on this trip, they will not be returned.'
		);

		await prisma.tameActivity.delete({
			where: {
				id: currentTask.id
			}
		});

		return msg.channel.send("You cancelled your tames' task.");
	}

	async merge(msg: KlasaMessage, [tame = '']: [string]) {
		const requirements = {
			[SkillsEnum.Magic]: 110,
			[SkillsEnum.Runecraft]: 110,
			[SkillsEnum.Herblore]: 110
		};

		if (!msg.author.hasSkillReqs(requirements)) {
			return msg.channel.send(
				`You are not skillful enough to do this merging ritual. You need the following requirements: ${formatSkillRequirements(
					requirements
				)}`
			);
		}

		const tames = await prisma.tame.findMany({ where: { user_id: msg.author.id } });
		const toSelect = tames.find(t => stringMatches(tame, t.id.toString()) || stringMatches(tame, t.nickname ?? ''));
		if (!toSelect || !tame) {
			return msg.channel.send(
				"Couldn't find a tame to participate in the ritual. Make sure you selected the correct Tame, by its number or nickname."
			);
		}

		const [currentTame, currentTask] = await getUsersTame(msg.author);
		if (currentTask) return msg.channel.send('Your tame is busy. Wait for it to be free to do this.');
		if (!currentTame) return msg.channel.send("You don't have a selected tame. Select your tame first.");
		if (currentTame.id === toSelect.id)
			return msg.channel.send(`You can't merge ${tameName(currentTame)} with itself!`);
		if (getTameSpecies(currentTame).id !== getTameSpecies(toSelect).id) {
			return msg.channel.send("You can't merge two tames from two different species!");
		}

		const { mergingCost, shinyVariant } = getTameSpecies(currentTame);

		if (!msg.author.owns(mergingCost)) {
			return msg.channel.send(
				`You don't have enough materials for this ritual. You need ${mergingCost}. You are missing **${mergingCost
					.clone()
					.remove(msg.author.bank())}**.`
			);
		}

		const mergeStuff = {
			totalLoot: new Bank(currentTame!.max_total_loot as ItemBank).add(toSelect.max_total_loot as ItemBank).bank,
			fedItems: new Bank(currentTame!.fed_items as ItemBank).add(toSelect.fed_items as ItemBank).bank,
			maxCombatLevel: Math.max(currentTame!.max_combat_level, toSelect.max_combat_level),
			maxArtisanLevel: Math.max(currentTame!.max_artisan_level, toSelect.max_artisan_level),
			maxGathererLevel: Math.max(currentTame!.max_gatherer_level, toSelect.max_gatherer_level),
			maxSupportLevel: Math.max(currentTame!.max_support_level, toSelect.max_support_level),
			speciesVariant:
				currentTame!.species_variant === shinyVariant || toSelect.species_variant === shinyVariant
					? shinyVariant
					: currentTame!.species_variant
		};

		delete msg.flagArgs.cf;
		delete msg.flagArgs.confirm;

		await msg.confirm(
			`Are you sure you want to merge **${tameName(toSelect)}** (Tame ${toSelect.id}) into **${tameName(
				currentTame!
			)}** (Tame ${currentTame!.id})?\n\n${tameName(
				currentTame!
			)} will receive all the items fed and all loot obtained from ${tameName(
				toSelect
			)}, and will have its stats match the highest of both tames.\n\n**THIS ACTION CAN NOT BE REVERSED!**`
		);

		await msg.author.removeItemsFromBank(mergingCost);
		updateBankSetting(this.client, ClientSettings.EconomyStats.TameMergingCost, mergingCost);

		// Set the merged tame activities to the tame that is consuming it
		await prisma.tameActivity.updateMany({
			where: {
				tame_id: toSelect.id
			},
			data: {
				tame_id: currentTame.id
			}
		});

		await prisma.tame.delete({
			where: {
				id: toSelect.id
			}
		});

		await prisma.tame.update({
			where: {
				id: currentTame!.id
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

		return msg.channel.send(`${tameName(currentTame)} consumed ${tameName(toSelect)} and all its attributes.`);
	}
}
