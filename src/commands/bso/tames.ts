import { calcWhatPercent, reduceNumByPercent, Time } from 'e';
import { CommandStore, KlasaClient, KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import { Eatables } from '../../lib/data/eatables';
import { requiresMinion } from '../../lib/minions/decorators';
import getUserFoodFromBank from '../../lib/minions/functions/getUserFoodFromBank';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { getUsersTame } from '../../lib/tames';
import { TameActivityTable } from '../../lib/typeorm/TameActivityTable.entity';
import { TameGrowthStage, TamesTable } from '../../lib/typeorm/TamesTable.entity';
import { formatDuration, itemNameFromID, stringMatches, updateBankSetting } from '../../lib/util';
import findMonster from '../../lib/util/findMonster';

export async function removeRawFood({
	client,
	user,
	totalHealingNeeded,
	healPerAction,
	raw = false
}: {
	client: KlasaClient;
	user: KlasaUser;
	totalHealingNeeded: number;
	healPerAction: number;
	raw?: boolean;
}): Promise<[string, ItemBank]> {
	await user.settings.sync(true);

	const foodToRemove = getUserFoodFromBank(user, totalHealingNeeded, raw);
	if (!foodToRemove) {
		throw `You don't have enough Raw food to feed your tame in this trip. You need enough food to heal at least ${totalHealingNeeded} HP (${healPerAction} per action). You can use these food items: ${Eatables.filter(
			i => i.raw
		)
			.map(i => itemNameFromID(i.raw!))
			.join(', ')}.`;
	} else {
		await user.removeItemsFromBank(foodToRemove);

		updateBankSetting(client, ClientSettings.EconomyStats.PVMCost, foodToRemove);

		return [`${new Bank(foodToRemove)} from ${user.username}`, foodToRemove];
	}
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
			usage: '[k|select|setname] [input:...str]',
			usageDelim: ' ',
			aliases: ['tame']
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
				bank: tame.totalLoot,
				title: `All Loot ${tame.name} Has Gotten You`
			});
		}
		const [selectedTame] = await getUsersTame(msg.author);
		return msg.channel.send(
			`Your tames:
${allTames
	.map(
		t =>
			`${t.id}. ${t.toString()}${
				t?.growthStage === TameGrowthStage.Adult ? '' : ` ${t?.currentGrowthPercent}% grown ${t.growthStage}`
			}${selectedTame?.id === t.id ? ' *Selected*' : ''}`
	)
	.join('\n')}`
		);
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

		// Calculate monster quantity:
		const quantity = Math.floor(Time.Hour / speed);
		if (quantity < 1) {
			return msg.channel.send("Your tame can't kill this monster fast enough.");
		}

		// Calculate food cost: 100% for baby, 67% for juvenile, 33% for adult
		const baseFoodNeeded = monster.healAmountNeeded ?? 1;
		// Food divisor: baby = 3/3, juvenile = 2/3, adult = 1/3
		const growthFactor = selectedTame.growthLevel / 3;
		const foodPerKill = Math.ceil(baseFoodNeeded * growthFactor);

		const [foodStr] = await removeRawFood({
			client: this.client,
			totalHealingNeeded: foodPerKill * quantity,
			healPerAction: foodPerKill,
			raw: true,
			user: msg.author
		});
		const duration = Math.floor(quantity * speed);

		const activity = new TameActivityTable();
		activity.userID = msg.author.id;
		activity.startDate = new Date();
		activity.finishDate = new Date(Date.now() + duration);
		activity.completed = false;
		activity.type = 'pvm';
		activity.data = {
			type: 'pvm',
			monsterID: monster.id,
			quantity
		};
		activity.channelID = msg.channel.id;
		activity.duration = duration;
		activity.tame = selectedTame;
		await activity.save();

		return msg.channel.send(
			`${selectedTame.name} is now killing ${quantity}x ${monster.name}. The trip will take ${formatDuration(
				duration
			)}.\n\nRemoved ${foodStr}`
		);
	}
}
