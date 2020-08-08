import { CommandStore, KlasaMessage, util } from 'klasa';
import { Util, Monsters } from 'oldschooljs';
import { MessageEmbed } from 'discord.js';

import { BotCommand } from '../../lib/BotCommand';
import {
	Tasks,
	Activity,
	Emoji,
	Time,
	Color,
	PerkTier,
	MIMIC_MONSTER_ID
} from '../../lib/constants';
import {
	formatDuration,
	randomItemFromArray,
	isWeekend,
	itemNameFromID,
	addItemToBank,
	bankHasItem
} from '../../lib/util';
import { rand } from '../../util';
import itemID from '../../lib/util/itemID';
import resolveItems from '../../lib/util/resolveItems';
import clueTiers from '../../lib/minions/data/clueTiers';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { MonsterActivityTaskOptions } from '../../lib/types/minions';
import reducedTimeFromKC from '../../lib/minions/functions/reducedTimeFromKC';
import { SkillsEnum } from '../../lib/skilling/types';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { requiresMinion } from '../../lib/minions/decorators';
import findMonster from '../../lib/minions/functions/findMonster';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { Eatables } from '../../lib/eatables';
import calculateMonsterFood from '../../lib/minions/functions/calculateMonsterFood';

const invalidMonster = (prefix: string) =>
	`That isn't a valid monster, to see the monsters available do \`${prefix}minion kill --monsters\`.`;

const hasNoMinion = (prefix: string) =>
	`You don't have a minion yet. You can buy one by typing \`${prefix}minion buy\`.`;

const patMessages = [
	'You pat {name} on the head.',
	'You gently pat {name} on the head, they look back at you happily.',
	'You pat {name} softly on the head, and thank them for their hard work.',
	'You pat {name} on the head, they feel happier now.',
	'After you pat {name}, they feel more motivated now and in the mood for PVM.',
	'You give {name} head pats, they get comfortable and start falling asleep.'
];

const randomPatMessage = (minionName: string) =>
	randomItemFromArray(patMessages).replace('{name}', minionName);

const { floor, ceil } = Math;

const slayerHelmets = resolveItems([
	'Black mask',
	'Black mask (i)',
	'Slayer helmet',
	'Slayer helmet (i)',
	'Black slayer helmet',
	'Black slayer helmet (i)',
	'Green slayer helmet',
	'Green slayer helmet (i)',
	'Red slayer helmet',
	'Red slayer helmet (i)',
	'Purple slayer helmet',
	'Purple slayer helmet (i)',
	'Turquoise slayer helmet',
	'Turquoise slayer helmet (i)',
	'Hydra slayer helmet',
	'Hydra slayer helmet (i)',
	'Twisted slayer helmet',
	'Twisted slayer helmet (i)'
]);

export default class MinionCommand extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			aliases: ['m'],
			usage:
				'[clues|k|kill|setname|buy|clue|kc|pat|stats|mine|smith|quest|qp|chop|ironman|light|fish|laps|cook|smelt|craft|bury|offer|fletch|cancel] [quantity:int{1}|name:...string] [name:...string]',

			usageDelim: ' ',
			subcommands: true
		});
	}

	async run(msg: KlasaMessage) {
		if (!msg.author.hasMinion) {
			throw hasNoMinion(msg.cmdPrefix);
		}
		return msg.send(msg.author.minionStatus);
	}

	async ironman(msg: KlasaMessage) {
		if (!msg.author.hasMinion) {
			throw hasNoMinion(msg.cmdPrefix);
		}

		if (msg.author.minionIsBusy) {
			return msg.send(msg.author.minionStatus);
		}

		/**
		 * If the user is an ironman already, lets ask them if they want to de-iron.
		 */
		if (msg.author.isIronman) {
			await msg.send(
				`Would you like to stop being an ironman? You will keep all your items and stats but you will have to start over if you want to play as an ironman again. Please say \`deiron\` to confirm.`
			);
			try {
				await msg.channel.awaitMessages(
					answer =>
						answer.author.id === msg.author.id &&
						answer.content.toLowerCase() === 'deiron',
					{
						max: 1,
						time: 15000,
						errors: ['time']
					}
				);
				await msg.author.settings.update(UserSettings.Minion.Ironman, false);
				return msg.send('You are no longer an ironman.');
			} catch (err) {
				return msg.channel.send('Cancelled de-ironning.');
			}
		}

		await msg.send(
			`Are you sure you want to start over and play as an ironman?

:warning: **Read the following text before confirming. This is your only warning. ** :warning:

The following things will be COMPLETELY reset/wiped from your account, with no chance of being recovered: Your entire bank, collection log, GP/Coins, QP/Quest Points, Clue Scores, Monster Scores, all XP. If you type \`confirm\`, they will all be wiped.

After becoming an ironman:
	- You will no longer be able to receive GP from  \`+daily\`
	- You will no longer be able to use \`+pay\`, \`+duel\`, \`+sellto\`, \`+sell\`, \`+dice\`
	- You can de-iron at any time, and keep all your stuff acquired while playing as an ironman.

Type \`confirm\` if you understand the above information, and want to become an ironman now.`
		);

		try {
			await msg.channel.awaitMessages(
				answer =>
					answer.author.id === msg.author.id &&
					answer.content.toLowerCase() === 'confirm',
				{
					max: 1,
					time: 15000,
					errors: ['time']
				}
			);

			msg.author.log(
				`just became an ironman, previous settings: ${JSON.stringify(
					msg.author.settings.toJSON()
				)}`
			);

			await msg.author.settings.reset([
				UserSettings.Bank,
				UserSettings.CollectionLogBank,
				UserSettings.GP,
				UserSettings.QP,
				UserSettings.MonsterScores,
				UserSettings.MinigameScores,
				UserSettings.ClueScores,
				UserSettings.BankBackground,
				UserSettings.SacrificedValue,
				'gear',
				'stats',
				'skills',
				'minion'
			]);

			await msg.author.settings.update([
				[UserSettings.Minion.Ironman, true],
				[UserSettings.Minion.HasBought, true]
			]);
			return msg.send('You are now an ironman.');
		} catch (err) {
			return msg.channel.send('Cancelled ironman swap.');
		}
	}

	async pat(msg: KlasaMessage) {
		if (!msg.author.hasMinion) {
			throw hasNoMinion(msg.cmdPrefix);
		}

		if (msg.author.minionIsBusy) {
			return msg.send(msg.author.minionStatus);
		}

		return msg.send(randomPatMessage(msg.author.minionName));
	}

	async stats(msg: KlasaMessage) {
		if (!msg.author.hasMinion) {
			throw hasNoMinion(msg.cmdPrefix);
		}

		return msg.send(`${msg.author.minionName}'s Stats:
${Emoji.Crafting} Crafting: ${msg.author.skillLevel(
			SkillsEnum.Crafting
		)} (${msg.author.settings.get(UserSettings.Skills.Crafting).toLocaleString()} xp)
${Emoji.Agility} Agility: ${msg.author.skillLevel(SkillsEnum.Agility)} (${msg.author.settings
			.get(UserSettings.Skills.Agility)
			.toLocaleString()} xp)
${Emoji.Cooking} Cooking: ${msg.author.skillLevel(SkillsEnum.Cooking)} (${msg.author.settings
			.get(UserSettings.Skills.Cooking)
			.toLocaleString()} xp)
${Emoji.Fishing} Fishing: ${msg.author.skillLevel(SkillsEnum.Fishing)} (${msg.author.settings
			.get(UserSettings.Skills.Fishing)
			.toLocaleString()} xp)
${Emoji.Mining} Mining: ${msg.author.skillLevel(SkillsEnum.Mining)} (${msg.author.settings
			.get(UserSettings.Skills.Mining)
			.toLocaleString()} xp)
${Emoji.Smithing} Smithing: ${msg.author.skillLevel(
			SkillsEnum.Smithing
		)} (${msg.author.settings.get(UserSettings.Skills.Smithing).toLocaleString()} xp)
${Emoji.Woodcutting} Woodcutting: ${msg.author.skillLevel(
			SkillsEnum.Woodcutting
		)} (${msg.author.settings.get(UserSettings.Skills.Woodcutting).toLocaleString()} xp)
${Emoji.Firemaking} Firemaking: ${msg.author.skillLevel(
			SkillsEnum.Firemaking
		)} (${msg.author.settings.get(UserSettings.Skills.Firemaking).toLocaleString()} xp)
${Emoji.Runecraft} Runecraft: ${msg.author.skillLevel(
			SkillsEnum.Runecraft
		)} (${msg.author.settings.get(UserSettings.Skills.Runecraft).toLocaleString()} xp)
${Emoji.Prayer} Prayer: ${msg.author.skillLevel(SkillsEnum.Prayer)} (${msg.author.settings
			.get(UserSettings.Skills.Prayer)
			.toLocaleString()} xp)
${Emoji.Fletching} Fletching: ${msg.author.skillLevel(
			SkillsEnum.Fletching
		)} (${msg.author.settings.get(UserSettings.Skills.Fletching).toLocaleString()} xp)
${Emoji.Slayer} Slayer: ${msg.author.skillLevel(SkillsEnum.Slayer)} (${msg.author.settings
			.get(UserSettings.Skills.Slayer)
			.toLocaleString()} xp)
${Emoji.QuestIcon} QP: ${msg.author.settings.get(UserSettings.QP)}
`);
	}

	async kc(msg: KlasaMessage) {
		if (!msg.author.hasMinion) {
			throw hasNoMinion(msg.cmdPrefix);
		}

		const monsterScores = msg.author.settings.get(UserSettings.MonsterScores);
		const entries = Object.entries(monsterScores);
		if (entries.length === 0) throw `${msg.author.minionName} hasn't killed any monsters yet!`;

		const embed = new MessageEmbed()
			.setColor(Color.Orange)
			.setTitle(`**${msg.author.minionName}'s KCs**`)
			.setDescription(
				`These are your minions Kill Counts for all monsters, to see your Clue Scores, use \`${msg.cmdPrefix}m clues\`.`
			);

		for (const monsterScoreChunk of util.chunk(entries, 10)) {
			embed.addField(
				'\u200b',
				monsterScoreChunk
					.map(([monID, monKC]) => {
						if (parseInt(monID) === MIMIC_MONSTER_ID) {
							return `${Emoji.Casket} **Mimic:** ${monKC}`;
						}
						const mon = killableMonsters.find(m => m.id === parseInt(monID));
						if (!mon) return `**${Monsters.get(parseInt(monID))?.name}:** ${monKC}`;
						return `${mon!.emoji} **${mon!.name}**: ${monKC}`;
					})
					.join('\n'),
				true
			);
		}

		return msg.send(embed);
	}

	async qp(msg: KlasaMessage) {
		if (!msg.author.hasMinion) {
			throw hasNoMinion(msg.cmdPrefix);
		}

		return msg.send(
			`${msg.author.minionName}'s Quest Point count is: ${msg.author.settings.get(
				UserSettings.QP
			)}.`
		);
	}

	async clues(msg: KlasaMessage) {
		if (!msg.author.hasMinion) {
			throw hasNoMinion(msg.cmdPrefix);
		}

		const clueScores = msg.author.settings.get(UserSettings.ClueScores);
		if (Object.keys(clueScores).length === 0) throw `You haven't done any clues yet.`;

		let res = `${Emoji.Casket} **${msg.author.minionName}'s Clue Scores:**\n\n`;
		for (const [clueID, clueScore] of Object.entries(clueScores)) {
			const clue = clueTiers.find(c => c.id === parseInt(clueID));
			res += `**${clue!.name}**: ${clueScore}\n`;
		}
		return msg.send(res);
	}

	async buy(msg: KlasaMessage) {
		if (msg.author.hasMinion) throw 'You already have a minion!';

		await msg.author.settings.sync(true);
		const balance = msg.author.settings.get(UserSettings.GP);

		let cost = 20_000_000;
		const accountAge = Date.now() - msg.author.createdTimestamp;
		if (accountAge > Time.Month * 6 || getUsersPerkTier(msg.author) >= PerkTier.One) {
			cost = 0;
		}

		if (cost === 0) {
			await msg.author.settings.update(UserSettings.Minion.HasBought, true);

			return msg.channel.send(
				`${Emoji.Gift} Your new minion is ready! Use \`${msg.cmdPrefix}minion\` to manage them, and check https://www.oldschool.gg/oldschoolbot for more information on them, and **make sure** to read the rules! Breaking the bot rules could result in you being banned or your account wiped - read them here: <https://www.oldschool.gg/oldschoolbot/rules>`
			);
		}

		if (balance < cost) {
			throw `You can't afford to buy a minion! You need ${Util.toKMB(cost)}`;
		}

		await msg.send(
			`Are you sure you want to spend ${Util.toKMB(
				cost
			)} on buying a minion? Please say \`yes\` to confirm.`
		);

		try {
			await msg.channel.awaitMessages(
				answer =>
					answer.author.id === msg.author.id && answer.content.toLowerCase() === 'yes',
				{
					max: 1,
					time: 15000,
					errors: ['time']
				}
			);
			const response = await msg.channel.send(
				`${Emoji.Search} Finding the right minion for you...`
			);

			await util.sleep(3000);

			await response.edit(
				`${Emoji.FancyLoveheart} Letting your new minion say goodbye to the unadopted minions...`
			);

			await util.sleep(3000);

			await msg.author.settings.sync(true);
			const balance = msg.author.settings.get(UserSettings.GP);
			if (balance < cost) return;

			await msg.author.settings.update(UserSettings.GP, balance - cost);
			await msg.author.settings.update(UserSettings.Minion.HasBought, true);

			await response.edit(
				`${Emoji.Gift} Your new minion is ready! Use \`${msg.cmdPrefix}minion\` to manage them.`
			);
		} catch (err) {
			return msg.channel.send('Cancelled minion purchase.');
		}
	}

	async setname(msg: KlasaMessage, [name]: [string]) {
		if (!msg.author.hasMinion) {
			throw hasNoMinion(msg.cmdPrefix);
		}

		if (
			!name ||
			typeof name !== 'string' ||
			name.length < 2 ||
			name.length > 30 ||
			['\n', '`', '@'].some(char => name.includes(char))
		) {
			throw 'Please specify a valid name for your minion!';
		}

		await msg.author.settings.update(UserSettings.Minion.Name, name);
		return msg.send(`Renamed your minion to ${msg.author.minionName}.`);
	}

	async fish(msg: KlasaMessage, [quantity, fishName]: [number, string]) {
		await this.client.commands
			.get('fish')!
			.run(msg, [quantity, fishName])
			.catch(err => {
				throw err;
			});
	}

	async laps(msg: KlasaMessage, [quantity, courseName]: [number, string]) {
		await this.client.commands
			.get('laps')!
			.run(msg, [quantity, courseName])
			.catch(err => {
				throw err;
			});
	}

	async mine(msg: KlasaMessage, [quantity, oreName]: [number, string]) {
		await this.client.commands
			.get('mine')!
			.run(msg, [quantity, oreName])
			.catch(err => {
				throw err;
			});
	}

	async smelt(msg: KlasaMessage, [quantity, barName]: [number, string]) {
		await this.client.commands
			.get('smelt')!
			.run(msg, [quantity, barName])
			.catch(err => {
				throw err;
			});
	}

	async cook(msg: KlasaMessage, [quantity, cookableName]: [number | string, string]) {
		await this.client.commands
			.get('cook')!
			.run(msg, [quantity, cookableName])
			.catch(err => {
				throw err;
			});
	}

	async smith(msg: KlasaMessage, [quantity, smithedBarName]: [number, string]) {
		this.client.commands
			.get('smith')!
			.run(msg, [quantity, smithedBarName])
			.catch(err => {
				throw err;
			});
	}

	async chop(msg: KlasaMessage, [quantity, logName]: [number, string]) {
		this.client.commands.get('chop')!.run(msg, [quantity, logName]);
	}

	async light(msg: KlasaMessage, [quantity, logName]: [number, string]) {
		this.client.commands.get('light')!.run(msg, [quantity, logName]);
	}

	async craft(msg: KlasaMessage, [quantity, itemName]: [number, string]) {
		await this.client.commands
			.get('craft')!
			.run(msg, [quantity, itemName])
			.catch(err => {
				throw err;
			});
	}

	async fletch(msg: KlasaMessage, [quantity, itemName]: [number, string]) {
		await this.client.commands
			.get('fletch')!
			.run(msg, [quantity, itemName])
			.catch(err => {
				throw err;
			});
	}

	async bury(msg: KlasaMessage, [quantity, boneName]: [number, string]) {
		await this.client.commands
			.get('bury')!
			.run(msg, [quantity, boneName])
			.catch(err => {
				throw err;
			});
	}

	async offer(msg: KlasaMessage, [quantity, boneName]: [number, string]) {
		await this.client.commands
			.get('offer')!
			.run(msg, [quantity, boneName])
			.catch(err => {
				throw err;
			});
	}

	async quest(msg: KlasaMessage) {
		await this.client.commands
			.get('quest')!
			.run(msg, [])
			.catch(err => {
				throw err;
			});
	}

	async cancel(msg: KlasaMessage) {
		await this.client.commands
			.get('cancel')!
			.run(msg, [])
			.catch(err => {
				throw err;
			});
	}

	@requiresMinion
	async clue(msg: KlasaMessage, [quantity, tierName]: [number | string, string]) {
		await this.client.commands
			.get('mclue')!
			.run(msg, [quantity, tierName])
			.catch(err => {
				throw err;
			});
	}

	async k(msg: KlasaMessage, [quantity, name = '']: [null | number | string, string]) {
		await this.kill(msg, [quantity, name]).catch(err => {
			throw err;
		});
	}

	@requiresMinion
	async kill(msg: KlasaMessage, [quantity, name = '']: [null | number | string, string]) {
		const bank = msg.author.settings.get(UserSettings.Bank);
		const slayerInfo = msg.author.settings.get(UserSettings.Slayer.SlayerInfo);
		const unlockList = msg.author.settings.get(UserSettings.Slayer.UnlockedList);
		const boosts = [];
		let messages: string[] = [];

		// Add more information into text file
		if (msg.flagArgs.monsters) {
			return msg.channel.sendFile(
				Buffer.from(killableMonsters.map(mon => `${mon.name}`).join('\n')),
				`Available monsters.txt`
			);
		}

		if (typeof quantity === 'string') {
			name = quantity;
			quantity = null;
		}

		await msg.author.settings.sync(true);
		if (msg.author.minionIsBusy) {
			msg.author.log(`[TTK-BUSY] ${quantity} ${name}`);
			return msg.send(msg.author.minionStatus);
		}

		if (!name) throw invalidMonster(msg.cmdPrefix);

		const monster =
			name === 'random'
				? randomItemFromArray(
						killableMonsters.filter(mon => msg.author.hasMonsterRequirements(mon)[0])
				  )
				: findMonster(name);
		if (!monster) throw invalidMonster(msg.cmdPrefix);

		// Checking for alternative monsters on current task.
		let alsoSlayerTask = false;
		if (slayerInfo.hasTask) {
			for (const tempMonstID of slayerInfo.currentTask?.Id!) {
				if (tempMonstID === monster.id) {
					alsoSlayerTask = true;
					break;
				}
			}
		}

		// Check if slayer only monster
		if (
			monster.slayerOnly &&
			slayerInfo.currentTask?.name.toLowerCase() !== monster.name.toLowerCase() &&
			!alsoSlayerTask
		) {
			throw `You can only kill ${monster.name} while on task!`;
		}

		// Check requirements
		const [hasReqs, reason] = msg.author.hasMonsterRequirements(monster);
		if (!hasReqs) throw reason;

		let [timeToFinish, percentReduced] = reducedTimeFromKC(
			monster,
			msg.author.settings.get(UserSettings.MonsterScores)[monster.id] ?? 1
		);

		if (percentReduced >= 1) boosts.push(`${percentReduced}% for KC`);

		if (monster.itemInBankBoosts) {
			for (const [itemID, boostAmount] of Object.entries(monster.itemInBankBoosts)) {
				if (!msg.author.hasItemEquippedOrInBank(parseInt(itemID))) continue;
				timeToFinish *= (100 - boostAmount) / 100;
				boosts.push(`${boostAmount}% for ${itemNameFromID(parseInt(itemID))}`);
			}
		}
		// Check if killing monster on task and if user got any slayer helmet
		if (
			slayerInfo.hasTask &&
			(monster.name.toLowerCase() === slayerInfo.currentTask?.name.toLowerCase() ||
				alsoSlayerTask)
		) {
			for (const helmet of slayerHelmets) {
				if (msg.author.hasItemEquippedAnywhere(helmet)) {
					if (monster.slayerHelmBoost) {
						timeToFinish *= (100 - monster.slayerHelmBoost) / 100;
						boosts.push(`${monster.slayerHelmBoost}% for ${itemNameFromID(helmet)}`);
						break;
					}
				}
			}
		}
		// Check if unlocked Duly noted in slayer shop and on mithril dragon task
		if (
			monster.name.toLowerCase() === 'mithril dragon' &&
			slayerInfo.currentTask?.name.toLowerCase() === 'mithril dragon'
		) {
			for (const unlock of unlockList) {
				if (unlock.name.toLowerCase() === 'duly noted') {
					timeToFinish *= (100 - 3) / 100;
					boosts.push(`3% for unlocking Duly noted`);
					break;
				}
			}
		}

		// Check if gargoyle, if Gargoyle smasher is unlocked
		if (
			monster.name.toLowerCase() === 'gargoyle' ||
			monster.name.toLowerCase() === 'grotesque guardians'
		) {
			for (const unlock of unlockList) {
				if (unlock.name.toLowerCase() === 'gargoyle smasher') {
					timeToFinish *= (100 - 3) / 100;
					boosts.push(`3% for unlocking Gargoyle smasher`);
					break;
				}
			}
		}

		// If no quantity provided, set it to the max.
		if (quantity === null) {
			quantity = floor(msg.author.maxTripLength / timeToFinish);
		}

		// Makes sure that slayer only monsters can't be killed past task quantity
		if (monster.slayerOnly) {
			if (quantity > slayerInfo.remainingQuantity!) {
				quantity = slayerInfo.remainingQuantity!;
			}
		}

		// Check food
		if (monster.healAmountNeeded && monster.attackStyleToUse && monster.attackStylesUsed) {
			const [healAmountNeeded, foodMessages] = calculateMonsterFood(monster, msg.author);
			messages = messages.concat(foodMessages);

			for (const food of Eatables) {
				const amountNeeded = ceil(healAmountNeeded / food.healAmount!) * quantity;
				if (!bankHasItem(bank, food.id, amountNeeded)) {
					if (Eatables.indexOf(food) === Eatables.length - 1) {
						throw `You don't have enough food to kill ${
							monster.name
						}! You need enough food to heal atleast ${healAmountNeeded} HP (${healAmountNeeded /
							quantity} per kill) You can use these food items: ${Eatables.map(
							i => i.name
						).join(', ')}.`;
					}
					continue;
				}

				messages.push(`Removed ${amountNeeded}x ${food.name}'s from your bank`);
				await msg.author.removeItemFromBank(food.id, amountNeeded);

				// Track this food cost in Economy Stats
				await this.client.settings.update(
					ClientSettings.EconomyStats.PVMCost,
					addItemToBank(
						this.client.settings.get(ClientSettings.EconomyStats.PVMCost),
						food.id,
						amountNeeded
					)
				);

				break;
			}
		}

		// Check if the monster consumes any items upon entry
		if (monster.consumedItem) {
			if (bankHasItem(bank, itemID(monster.consumedItem), quantity)) {
				messages.push(`Removed ${quantity}x ${monster.consumedItem}'s from your bank`);
				await msg.author.removeItemFromBank(itemID(monster.consumedItem), quantity);
			}
			else { 
				quantity = bank[itemID(monster.consumedItem)];
				messages.push(`Removed ${quantity}x ${monster.consumedItem}'s from your bank`);
				await msg.author.removeItemFromBank(itemID(monster.consumedItem), quantity);
			}
		}

		let duration = timeToFinish * quantity;
		if (duration > msg.author.maxTripLength) {
			throw `${msg.author.minionName} can't go on PvM trips longer than ${formatDuration(
				msg.author.maxTripLength
			)}, try a lower quantity. The highest amount you can do for ${
				monster.name
			} is ${Math.floor(msg.author.maxTripLength / timeToFinish)}.`;
		}

		const randomAddedDuration = rand(1, 20);
		duration += (randomAddedDuration * duration) / 100;

		// Check if Rockslug, if Slug salter is unlocked and if got consumables
		if (monster.name.toLowerCase() === 'rockslug') {
			// Checks if brine sabre isn't equipped or bank
			if (!msg.author.hasItemEquippedOrInBank(11037)) {
				if (!bankHasItem(bank, 4161, quantity)) {
					throw `You don't have enough Bag of salt to kill ${quantity} x ${monster.name}, which require 1 x Bag of salt per kill! You need atleast ${quantity} Bag of salt for this trip. Either lower the amount of kills or buy Bag of salt.`;
				}
				messages.push(`Removed ${quantity}x Bag of salt's from your bank`);
				await msg.author.removeItemFromBank(4161, quantity);
			}
			for (const unlock of unlockList) {
				if (unlock.name.toLowerCase() === 'slug salter') {
					duration *= 98;
					boosts.push(`2% for unlocking Slug salter`);
					break;
				}
			}
		}

		// Check if Lizard, if Reptile freezer is unlocked and if got consumables
		if (
			monster.name.toLowerCase() === 'lizard' ||
			monster.name.toLowerCase() === 'small lizard' ||
			monster.name.toLowerCase() === 'desert lizard'
		) {
			if (!bankHasItem(bank, 6696, quantity)) {
				throw `You don't have enough Ice cooler to kill ${quantity} x ${monster.name}, which require 1 x Ice cooler per kill! You need atleast ${quantity} Ice cooler for this trip. Either lower the amount of kills or buy Ice cooler.`;
			}
			messages.push(`Removed ${quantity}x Ice cooler's from your bank`);
			await msg.author.removeItemFromBank(6696, quantity);

			for (const unlock of unlockList) {
				if (unlock.name.toLowerCase() === 'reptile freezer') {
					duration *= 98;
					boosts.push(`2% for unlocking Reptile freezer`);
					break;
				}
			}
		}

		// Check if zygomites, if 'Shroom sprayer is unlocked and if got consumables
		if (
			monster.name.toLowerCase() === 'zygomite' ||
			monster.name.toLowerCase() === 'ancient zygomite'
		) {
			if (!bankHasItem(bank, 7421, quantity)) {
				throw `You don't have enough Fungicide spray 10 to kill ${quantity} x ${monster.name}, which require 1 x Fungicide spray 10 per kill! You need atleast ${quantity} Fungicide spray 10 for this trip. Either lower the amount of kills or buy Fungicide spray 10.`;
			}
			messages.push(`Removed ${quantity}x Fungicide spray 10's from your bank`);
			await msg.author.removeItemFromBank(7421, quantity);

			for (const unlock of unlockList) {
				if (unlock.name.toLowerCase() === "'shroom sprayer") {
					duration *= 98;
					boosts.push(`2% for unlocking 'Shroom sprayer`);
					break;
				}
			}
		}

		// Check if flag cannon and monster can be killed with Dwarf cannon
		if (msg.flagArgs.cannon) {
			if (msg.flagArgs.barrage) {
				throw `You can not use --cannon and --barrage at same time.`;
			}
			if (!monster.cannonballs) {
				throw `${monster.name} can't be killed with a Dwarf cannon. Skip the --cannon.`;
			}
			if (!bankHasItem(bank, 12863, 1)) {
				throw `You don't have a Dwarf cannon set to kill ${monster.name}! You can buy one by typing \`${msg.cmdPrefix}buy Dwarf cannon set\``;
			}
			if (!bankHasItem(bank, 2, quantity * monster.cannonballs)) {
				throw `You don't have enough cannonballs to kill ${quantity} x ${
					monster.name
				}, which require ${monster.cannonballs}x per kill! You need atleast ${quantity *
					monster.cannonballs} cannonballs for this trip. Either lower the amount of kills or buy cannonballs.`;
			}
			messages.push(`Removed ${quantity * monster.cannonballs}x cannonball's from your bank`);
			await msg.author.removeItemFromBank(2, quantity * monster.cannonballs);
			boosts.push(`${monster.cannonBoost}% for using cannon`);
			duration *= (100 - monster.cannonBoost!) / 100;
		}

		// Check if flag barrage and monster can be killed with Ice Barraging
		if (msg.flagArgs.barrage) {
			if (msg.flagArgs.cannon) {
				throw `You can not use --barrage and --cannon at same time.`;
			}
			if (!monster.barrageAmount) {
				throw `${monster.name} can't be killed with Ice Barrage. Skip the --barrage.`;
			}
			if (
				!bankHasItem(bank, 555, quantity * monster.barrageAmount * 6) ||
				!bankHasItem(bank, 565, quantity * monster.barrageAmount * 2) ||
				!bankHasItem(bank, 560, quantity * monster.barrageAmount * 4)
			) {
				throw `You don't have enough Ice Barrage casts to kill ${quantity} x ${
					monster.name
				}, which require ${monster.barrageAmount * 6}x Water rune, ${monster.barrageAmount *
					2}x Blood rune and ${monster.barrageAmount *
					4}x Death rune per kill! You need atleast ${quantity *
					monster.barrageAmount *
					6} Water rune, ${quantity *
					monster.barrageAmount *
					2} Blood rune and ${quantity *
					monster.barrageAmount *
					4} Death rune for this trip. Either lower the amount of kills or buy more runes.`;
			}
			messages.push(
				`Removed ${quantity * monster.barrageAmount * 6}x Water rune's, ${quantity *
					monster.barrageAmount *
					2}x Blood rune's and ${quantity *
					monster.barrageAmount *
					4}x Blood rune's from your bank`
			);
			await msg.author.removeItemFromBank(555, quantity * monster.barrageAmount * 6);
			await msg.author.removeItemFromBank(565, quantity * monster.barrageAmount * 2);
			await msg.author.removeItemFromBank(560, quantity * monster.barrageAmount * 4);
			boosts.push(`${monster.barrageBoost}% for using Ice Barrage`);
			duration *= (100 - monster.barrageBoost!) / 100;
		}

		if (isWeekend()) {
			boosts.push(`10% for Weekend`);
			duration *= 0.9;
		}

		const data: MonsterActivityTaskOptions = {
			monsterID: monster.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.MonsterKilling,
			id: rand(1, 10_000_000),
			finishDate: Date.now() + duration
		};

		await addSubTaskToActivityTask(this.client, Tasks.MonsterKillingTicker, data);

		let response = `${msg.author.minionName} is now killing ${data.quantity}x ${
			monster.name
		}, it'll take around ${formatDuration(duration)} to finish.`;

		if (boosts.length > 0) {
			response += `\n\n **Boosts:** ${boosts.join(', ')}.`;
		}

		if (messages.length > 0) {
			response += `\n\n**Messages:** ${messages.join('\n')}.`;
		}

		return msg.send(response);
	}
}
