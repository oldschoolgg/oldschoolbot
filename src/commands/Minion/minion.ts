import { MessageEmbed } from 'discord.js';
import { randInt } from 'e';
import { CommandStore, KlasaMessage, util } from 'klasa';
import { Monsters, Util } from 'oldschooljs';

import { BotCommand } from '../../lib/BotCommand';
import {
	Activity,
	Color,
	Emoji,
	MIMIC_MONSTER_ID,
	PerkTier,
	Tasks,
	Time
} from '../../lib/constants';
import clueTiers from '../../lib/minions/data/clueTiers';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import { requiresMinion } from '../../lib/minions/decorators';
import calculateMonsterFood from '../../lib/minions/functions/calculateMonsterFood';
import findMonster from '../../lib/minions/functions/findMonster';
import reducedTimeFromKC from '../../lib/minions/functions/reducedTimeFromKC';
import removeFoodFromUser from '../../lib/minions/functions/removeFoodFromUser';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Skills from '../../lib/skilling/skills';
import { MonsterActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, isWeekend, itemNameFromID, randomItemFromArray } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';

const invalidMonster = (prefix: string) =>
	`That isn't a valid monster, the available monsters are: ${killableMonsters
		.map(mon => mon.name)
		.join(', ')}. For example, \`${prefix}minion kill 5 zulrah\``;

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

const { floor } = Math;

export default class MinionCommand extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			aliases: ['m'],
			usage:
				'[clues|k|kill|setname|buy|clue|kc|pat|stats|mine|smith|quest|qp|chop|ironman|light|fish|laps|cook|smelt|craft|bury|offer|fletch|cancel|farm|harvest|mix|hunt] [quantity:int{1}|name:...string] [name:...string] [name:...string]',

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
				UserSettings.SacrificedBank,
				'gear',
				'stats',
				'skills',
				'minion',
				'farmingPatches'
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

		let str = '';
		for (const skill of Object.values(Skills)) {
			str += `${skill.emoji} ${skill.name}: ${msg.author.skillLevel(
				skill.id
			)} (${(msg.author.settings.get(
				`skills.${skill.id}`
			) as number).toLocaleString()} xp)\n`;
		}

		return msg.send(`${msg.author.minionName}'s Stats:
${str}
${Emoji.XP} Total Level: ${msg.author.totalLevel().toLocaleString()} (${msg.author
			.totalLevel(true)
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

	async smith(msg: KlasaMessage, [quantity, smithableItemName]: [number, string]) {
		this.client.commands
			.get('smith')!
			.run(msg, [quantity, smithableItemName])
			.catch(err => {
				throw err;
			});
	}

	async chop(msg: KlasaMessage, [quantity, logName]: [number, string]) {
		this.client.commands
			.get('chop')!
			.run(msg, [quantity, logName])
			.catch(err => {
				throw err;
			});
	}

	async light(msg: KlasaMessage, [quantity, logName]: [number, string]) {
		this.client.commands
			.get('light')!
			.run(msg, [quantity, logName])
			.catch(err => {
				throw err;
			});
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

	async farm(msg: KlasaMessage, [quantity, seedName, upgradeType]: [number, string, string]) {
		await this.client.commands
			.get('farm')!
			.run(msg, [quantity, seedName, upgradeType])
			.catch(err => {
				throw err;
			});
	}

	async harvest(msg: KlasaMessage, [seedType]: [string]) {
		await this.client.commands
			.get('harvest')!
			.run(msg, [seedType])
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

	async mix(msg: KlasaMessage, [quantity, mixName]: [number, string]) {
		await this.client.commands
			.get('mix')!
			.run(msg, [quantity, mixName])
			.catch(err => {
				throw err;
			});
	}

	async hunt(msg: KlasaMessage, [quantity, creatureName]: [number, string]) {
		await this.client.commands
			.get('hunt')!
			.run(msg, [quantity, creatureName])
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
		const boosts = [];
		let messages: string[] = [];

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

		// If no quantity provided, set it to the max.
		if (quantity === null) {
			quantity = floor(msg.author.maxTripLength / timeToFinish);
		}

		// Check food
		let foodStr: undefined | string = undefined;
		if (monster.healAmountNeeded && monster.attackStyleToUse && monster.attackStylesUsed) {
			const [healAmountNeeded, foodMessages] = calculateMonsterFood(monster, msg.author);
			messages = messages.concat(foodMessages);

			const [result] = await removeFoodFromUser({
				client: this.client,
				user: msg.author,
				totalHealingNeeded: healAmountNeeded * quantity,
				healPerAction: Math.ceil(healAmountNeeded / quantity),
				activityName: monster.name,
				attackStylesUsed: [monster.attackStyleToUse]
			});

			foodStr = result;
		}

		let duration = timeToFinish * quantity;
		if (duration > msg.author.maxTripLength) {
			throw `${msg.author.minionName} can't go on PvM trips longer than ${formatDuration(
				msg.author.maxTripLength
			)}, try a lower quantity. The highest amount you can do for ${
				monster.name
			} is ${Math.floor(msg.author.maxTripLength / timeToFinish)}.`;
		}

		const randomAddedDuration = randInt(1, 20);
		duration += (randomAddedDuration * duration) / 100;

		if (isWeekend()) {
			boosts.push(`10% for Weekend`);
			duration *= 0.9;
		}

		await addSubTaskToActivityTask<MonsterActivityTaskOptions>(
			this.client,
			Tasks.MonsterKillingTicker,
			{
				monsterID: monster.id,
				userID: msg.author.id,
				channelID: msg.channel.id,
				quantity,
				duration,
				type: Activity.MonsterKilling
			}
		);

		let response = `${msg.author.minionName} is now killing ${quantity}x ${
			monster.name
		}, it'll take around ${formatDuration(duration)} to finish.`;
		if (foodStr) {
			response += ` Removed ${foodStr}.`;
		}

		if (boosts.length > 0) {
			response += `\n\n **Boosts:** ${boosts.join(', ')}.`;
		}

		if (messages.length > 0) {
			response += `\n\n**Messages:** ${messages.join('\n')}.`;
		}

		return msg.send(response);
	}
}
