import { calcWhatPercent, reduceNumByPercent, Time } from 'e';
import { CommandStore, KlasaClient, KlasaMessage, KlasaUser } from 'klasa';
import { Bank, Monsters } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import { Eatables } from '../../lib/data/eatables';
import { requiresMinion } from '../../lib/minions/decorators';
import getUserFoodFromBank from '../../lib/minions/functions/getUserFoodFromBank';
import { KillableMonster } from '../../lib/minions/types';
import { monkeyEatables } from '../../lib/monkeyRumble';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { createTameTask, getUsersTame } from '../../lib/tames';
import { TameGrowthStage, TamesTable } from '../../lib/typeorm/TamesTable.entity';
import {
	addBanks,
	formatDuration,
	itemNameFromID,
	patronMaxTripCalc,
	stringMatches,
	updateBankSetting
} from '../../lib/util';
import findMonster from '../../lib/util/findMonster';
import getOSItem from '../../lib/util/getOSItem';
import { parseStringBank } from '../../lib/util/parseStringBank';
import { collectables } from '../Minion/collect';

const feedableItems = [
	[getOSItem('Ori'), '25% extra loot'],
	[getOSItem('Zak'), '+35 minutes longer max trip length'],
	[getOSItem('Abyssal cape'), '25% food reduction']
] as const;

export async function removeRawFood({
	client,
	user,
	totalHealingNeeded,
	healPerAction,
	raw = false,
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
	tame: TamesTable;
}): Promise<[string, ItemBank]> {
	await user.settings.sync(true);
	if (tame.hasBeenFed('Abyssal cape')) {
		totalHealingNeeded = Math.floor(totalHealingNeeded * 0.75);
		healPerAction = Math.floor(healPerAction * 0.75);
	}

	const foodToRemove = getUserFoodFromBank(user, totalHealingNeeded, raw);
	if (!foodToRemove) {
		throw `You don't have enough Raw food to feed your tame in this trip. You need enough food to heal at least ${totalHealingNeeded} HP (${healPerAction} per action). You can use these food items: ${Eatables.filter(
			i => i.raw
		)
			.map(i => itemNameFromID(i.raw!))
			.join(', ')}.`;
	} else {
		const itemCost = new Bank(foodToRemove);
		if (monster.itemCost) {
			itemCost.add(monster.itemCost.clone().multiply(quantity));
		}
		if (!user.owns(itemCost)) {
			throw `You don't have the required items, you need: ${itemCost}.`;
		}
		await user.removeItemsFromBank(itemCost);

		updateBankSetting(client, ClientSettings.EconomyStats.PVMCost, itemCost);

		return [`${itemCost} from ${user.username}`, itemCost.bank];
	}
}

async function getTameStatus(user: KlasaUser) {
	const [, currentTask] = await getUsersTame(user);
	if (currentTask) {
		const currentDate = new Date().valueOf();
		const timeRemaining = `${formatDuration(currentTask.finishDate.valueOf() - currentDate)} remaining.`;
		switch (currentTask.data.type) {
			case 'pvm': {
				const { monsterID } = currentTask.data;
				const mon = Monsters.find(m => m.id === monsterID)!;
				return `Currently killing ${currentTask.data.quantity}x ${mon.name}. ${timeRemaining}`;
			}
			case 'collect':
				return `Currently collecting ${itemNameFromID(currentTask.data.itemID)}. ${timeRemaining}.`;
		}
	}
	return 'Currently doing nothing';
}

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			altProtection: true,
			categoryFlags: ['minion'],
			description: 'Use to control and manage your tames.',
			examples: ['+tames k fire giant', '+tames', '+tames select 1', '+tames setname LilBuddy'],
			subcommands: true,
			usage: '[k|select|setname|feed] [input:...str]',
			usageDelim: ' ',
			aliases: ['tame', 't']
		});
	}

	async setname(msg: KlasaMessage, [name = '']: [string]) {
		if (
			!name ||
			typeof name !== 'string' ||
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
		selectedTame.nickname = name;
		await selectedTame.save();
		return msg.channel.send(`Updated the nickname of your selected tame to ${name}.`);
	}

	@requiresMinion
	async run(msg: KlasaMessage, [input]: [string | undefined]) {
		const allTames = await TamesTable.find({
			where: { userID: msg.author.id }
		});
		if (allTames.length === 0) {
			return msg.channel.send('You have no tames.');
		}
		if (input) {
			const tame = allTames.find(
				t => stringMatches(t.id.toString(), input) || stringMatches(t.nickname ?? '', input)
			);
			if (!tame) {
				return msg.channel.send('No matching tame found.');
			}
			return msg.channel.sendBankImage({
				content: `${tame!.toString()}`,
				flags: msg.flagArgs,
				bank: tame.totalLoot,
				title: `All Loot ${tame.name} Has Gotten You`
			});
		}
		const [selectedTame] = await getUsersTame(msg.author);
		const tames = [];
		for (const t of allTames) {
			tames.push(
				`${t.id}. ${t.toString()}${
					t.growthStage === TameGrowthStage.Adult
						? ''
						: ` ${t.currentGrowthPercent.toFixed(2)}% grown ${t.growthStage}`
				}${selectedTame?.id === t.id ? ` **Selected** - ${await getTameStatus(msg.author)}` : ''}`
			);
		}
		return msg.channel.send(`Your tames:\n${tames.join('\n')}`);
	}

	async select(msg: KlasaMessage, [str = '']: [string]) {
		const tames = await TamesTable.find({ where: { userID: msg.author.id } });
		const toSelect = tames.find(t => stringMatches(str, t.id.toString()) || stringMatches(str, t.nickname ?? ''));
		if (!toSelect) {
			return msg.channel.send("Couldn't find a tame to select.");
		}
		const [, currentTask] = await getUsersTame(msg.author);
		if (currentTask) {
			return msg.channel.send("You can't select a different tame, because your current one is busy.");
		}
		await msg.author.settings.update(UserSettings.SelectedTame, toSelect.id);
		return msg.channel.send(`You selected your ${toSelect.name}.`);
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
			let qtyToUse = !qty ? qtyOwned : qty > qtyOwned ? qtyOwned : qty;
			bankToAdd.add(item.id, qtyToUse);
		}
		if (!str || bankToAdd.length === 0) {
			return msg.channel.sendBankImage({
				bank: selectedTame.fedItems,
				title: 'Items Fed To This Tame',
				content: `The items which give a perk/usage when fed are: ${feedableItems
					.map(i => `${i[0].name} (${i[1]})`)
					.join(', ')}.`
			});
		}

		if (!userBank.fits(bankToAdd)) {
			return msg.channel.send("You don't have enough items.");
		}

		let specialStrArr = [];
		for (const [i, perk] of feedableItems) {
			if (bankToAdd.has(i.id)) {
				specialStrArr.push(`**${i.name}**: ${perk}`);
			}
		}
		let specialStr = specialStrArr.length === 0 ? '' : `\n\n${specialStrArr.join(', ')}`;
		await msg.confirm(
			`Are you sure you want to feed \`${bankToAdd}\` to ${selectedTame.name}? You cannot get these items back after they're eaten by your tame.${specialStr}`
		);
		await msg.author.removeItemsFromBank(bankToAdd);
		selectedTame.fedItems = addBanks([selectedTame.fedItems, bankToAdd.bank]);
		await selectedTame.save();
		return msg.channel.send(`You fed \`${bankToAdd}\` to ${selectedTame.name}.${specialStr}`);
	}

	async k(msg: KlasaMessage, [str = '']: [string]) {
		const [selectedTame, currentTask] = await getUsersTame(msg.author);
		if (!selectedTame) {
			return msg.channel.send('You have no selected tame.');
		}
		if (currentTask) {
			return msg.channel.send(`${selectedTame.name} is busy.`);
		}
		const monster = findMonster(str);
		if (!monster) {
			return msg.channel.send("That's not a valid monster.");
		}

		// Get the amount stronger than minimum, and set boost accordingly:
		const [speciesMinCombat, speciesMaxCombat] = selectedTame.species.combatLevelRange;
		// Example: If combat level is 80/100 with 70 min, give a 10% boost.
		const combatLevelBoost = calcWhatPercent(selectedTame.maxCombatLevel - speciesMinCombat, speciesMaxCombat);

		// Increase trip length based on minion growth:
		let speed = monster.timeToFinish * selectedTame.growthLevel;

		// Apply calculated boost:
		speed = reduceNumByPercent(speed, combatLevelBoost);

		let boosts = [];
		let maxTripLength = Time.Minute * 20 * (4 - selectedTame.growthLevel);
		if (selectedTame.hasBeenFed('Zak')) {
			maxTripLength += Time.Minute * 35;
			boosts.push('+35mins trip length (ate a Zak)');
		}
		maxTripLength += patronMaxTripCalc(msg.author) * 2;
		// Calculate monster quantity:
		const quantity = Math.floor(maxTripLength / speed);
		if (quantity < 1) {
			return msg.channel.send("Your tame can't kill this monster fast enough.");
		}
		const [foodStr] = await removeRawFood({
			client: this.client,
			totalHealingNeeded: (monster.healAmountNeeded ?? 1) * quantity,
			healPerAction: monster.healAmountNeeded ?? 1,
			raw: true,
			user: msg.author,
			monster,
			quantity,
			tame: selectedTame
		});
		const duration = Math.floor(quantity * speed);

		await createTameTask({
			user: msg.author,
			channelID: msg.channel.id,
			selectedTame,
			data: {
				type: 'pvm',
				monsterID: monster.id,
				quantity
			},
			type: 'pvm',
			duration
		});

		return msg.channel.send(
			`${selectedTame.name} is now killing ${quantity}x ${monster.name}. The trip will take ${formatDuration(
				duration
			)}.\n\nRemoved ${foodStr}`
		);
	}

	async c(msg: KlasaMessage, [str = '']: [string]) {
		const [selectedTame, currentTask] = await getUsersTame(msg.author);
		if (!selectedTame) {
			return msg.channel.send('You have no selected tame.');
		}
		if (currentTask) {
			return msg.channel.send(`${selectedTame.name} is busy.`);
		}
		const collectable = collectables.find(c => stringMatches(c.item.name, str));
		if (!collectable) {
			return msg.channel.send(
				`That's not a valid collectable item. The items you can collect are: ${collectables
					.map(i => i.item.name)
					.join(', ')}.`
			);
		}

		const [min, max] = selectedTame.species.gathererLevelRange;
		const gathererLevelBoost = calcWhatPercent(selectedTame.maxCombatLevel - min, max);

		// Increase trip length based on minion growth:
		let speed = collectable.duration * selectedTame.growthLevel;

		// Apply calculated boost:
		speed = reduceNumByPercent(speed, gathererLevelBoost);

		let boosts = [];
		let maxTripLength = Time.Minute * 20 * (4 - selectedTame.growthLevel);
		if (selectedTame.hasBeenFed('Zak')) {
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
		const foodRequired = Math.floor(duration / (Time.Minute * 1.34));

		const bank = msg.author.bank();
		const eatable = monkeyEatables.find(e => bank.amount(e.item.id) >= foodRequired);

		if (!eatable) {
			return msg.channel.send(
				`You don't have enough food to feed your monkey. They can only eat certain items (${monkeyEatables
					.map(i => i.item.name + (i.boost ? ` (${i.boost}% boost)` : ''))
					.join(', ')}). For this trip, you'd need ${foodRequired} of one of these items.`
			);
		}
		if (eatable.boost) {
			duration = reduceNumByPercent(duration, eatable.boost);
			boosts.push(`${eatable.boost}% for ${eatable.item.name} food`);
		}
		const cost = new Bank().add(eatable.item.id, foodRequired);
		await msg.author.removeItemsFromBank(cost);

		await createTameTask({
			user: msg.author,
			channelID: msg.channel.id,
			selectedTame,
			data: {
				type: 'collect',
				itemID: collectable.item.id,
				quantity
			},
			type: 'collect',
			duration
		});

		let reply = `${selectedTame.name} is now collecting ${quantity * collectable.quantity}x ${
			collectable.item.name
		}. The trip will take ${formatDuration(duration)}.\n\nRemoved ${cost}`;

		if (boosts.length > 0) {
			reply += `\n\n**Boosts:** ${boosts.join(', ')}.`;
		}

		return msg.channel.send(reply);
	}
}
