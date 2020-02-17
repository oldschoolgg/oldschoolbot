import { CommandStore, KlasaMessage, util } from 'klasa';
import { Util } from 'oldschooljs';

import { BotCommand } from '../../lib/BotCommand';
import { Tasks, Activity, Emoji, Time, Events } from '../../lib/constants';
import {
	stringMatches,
	formatDuration,
	getMinionName,
	randomItemFromArray,
	findMonster,
	isWeekend,
	itemNameFromID
} from '../../lib/util';
import { SkillsEnum } from '../../lib/types/index';
import { rand } from '../../util';
import clueTiers from '../../lib/clueTiers';
import killableMonsters from '../../lib/killableMonsters';
import { UserSettings } from '../../lib/UserSettings';
import { ClueActivityTaskOptions, MonsterActivityTaskOptions } from '../../lib/types/minions';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

const invalidClue = (prefix: string) =>
	`That isn't a valid clue tier, the valid tiers are: ${clueTiers
		.map(tier => tier.name)
		.join(', ')}. For example, \`${prefix}minion clue 1 easy\``;

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

const hurtMessages = [
	'You hit {name} on the head.',
	'You violently punch {name} in the face, they look sad and you can see a tear rolling down their cheek.',
	'You kick {name} against their shin, and say how dissapointed you are.',
	'You shout at {name}, what a terrible performance.',
	'After you punch {name}, they feel more motivated to prevent this in the future.'
];

const randomPatMessage = (minionName: string) =>
	randomItemFromArray(patMessages).replace('{name}', minionName);

const randomHurtMessage = (minionName: string) =>
	randomItemFromArray(hurtMessages).replace('{name}', minionName);

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			aliases: ['m'],
			usage:
				'[kill|setname|buy|clue|kc|pat|hurt|stats|mine] [quantity:int{1}|name:...string] [name:...string]',
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

	async pat(msg: KlasaMessage) {
		if (!msg.author.hasMinion) {
			throw hasNoMinion(msg.cmdPrefix);
		}

		if (msg.author.minionIsBusy) {
			return msg.send(msg.author.minionStatus);
		}

		return msg.send(randomPatMessage(getMinionName(msg.author)));
	}

	async hurt(msg: KlasaMessage) {
		if (!msg.author.hasMinion) {
			throw hasNoMinion(msg.cmdPrefix);
		}

		if (msg.author.minionIsBusy) {
			return msg.send(msg.author.minionStatus);
		}

		return msg.send(randomHurtMessage(getMinionName(msg.author)));
	}

	async stats(msg: KlasaMessage) {
		if (!msg.author.hasMinion) {
			throw hasNoMinion(msg.cmdPrefix);
		}

		return msg.send(`${msg.author.minionName}'s Stats:

${Emoji.Mining} Mining: ${msg.author.skillLevel(SkillsEnum.Mining)}
`);
	}

	async kc(msg: KlasaMessage) {
		if (!msg.author.hasMinion) {
			throw hasNoMinion(msg.cmdPrefix);
		}
		const monsterScores = msg.author.settings.get(UserSettings.MonsterScores);

		let res = `**${getMinionName(msg.author)}'s KCs:**\n\n`;
		for (const [monID, monKC] of Object.entries(monsterScores)) {
			const mon = killableMonsters.find(m => m.id === parseInt(monID));
			res += `${mon!.emoji} **${mon!.name}**: ${monKC}\n`;
		}
		return msg.send(res);
	}

	async buy(msg: KlasaMessage) {
		let cost = 50_000_000;
		const accountAge = Date.now() - msg.author.createdTimestamp;
		if (accountAge > Time.Year * 2) {
			cost = 5_000_000;
		} else if (accountAge > Time.Year) {
			cost = 10_000_000;
		} else if (accountAge > Time.Month * 6) {
			cost = 35_000_000;
		}

		if (msg.author.hasMinion) throw 'You already have a minion!';

		await msg.author.settings.sync(true);
		const balance = msg.author.settings.get(UserSettings.GP);

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
		return msg.send(`Renamed your minion to ${Emoji.Minion} **${name}**`);
	}

	async mine(msg: KlasaMessage, [quantity, oreName]: [number, string]) {
		this.client.commands.get('mine')!.run(msg, [quantity, oreName]);
	}

	async clue(msg: KlasaMessage, [quantity, tierName]: [number, string]) {
		await msg.author.settings.sync(true);
		if (msg.author.minionIsBusy) {
			this.client.emit(
				Events.Log,
				`${msg.author.username}[${msg.author.id}] [TTK-BUSY] ${quantity} ${tierName}`
			);
			return msg.send(msg.author.minionStatus);
		}

		if (!msg.author.hasMinion) {
			throw hasNoMinion(msg.cmdPrefix);
		}

		if (!tierName) throw invalidClue(msg.cmdPrefix);

		const clueTier = clueTiers.find(tier => stringMatches(tier.name, tierName));

		if (!clueTier) throw invalidClue(msg.cmdPrefix);

		let duration = clueTier.timeToFinish * quantity;
		if (duration > Time.Minute * 30) {
			throw `${getMinionName(
				msg.author
			)} can't go on Clue trips longer than 30 minutes, try a lower quantity. The highest amount you can do for ${
				clueTier.name
			} is ${Math.floor((Time.Minute * 30) / clueTier.timeToFinish)}.`;
		}

		const bank = msg.author.settings.get(UserSettings.Bank);
		const numOfScrolls = bank[clueTier.scrollID];

		if (!numOfScrolls || numOfScrolls < quantity) {
			throw `You don't have ${quantity} ${clueTier.name} clue scrolls.`;
		}

		await msg.author.removeItemFromBank(clueTier.scrollID, quantity);

		const randomAddedDuration = rand(1, 20);
		duration += (randomAddedDuration * duration) / 100;

		if (isWeekend()) {
			duration *= 0.9;
		}

		const data: ClueActivityTaskOptions = {
			clueID: clueTier.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.ClueCompletion,
			id: rand(1, 10_000_000),
			finishDate: Date.now() + duration
		};

		await addSubTaskToActivityTask(this.client, Tasks.ClueTicker, data);

		return msg.send(
			`${getMinionName(msg.author)} is now completing ${data.quantity}x ${
				clueTier.name
			} clues, it'll take around ${formatDuration(
				clueTier.timeToFinish * quantity
			)} to finish.`
		);
	}

	async kill(msg: KlasaMessage, [quantity, name = '']: [null | number | string, string]) {
		if (typeof quantity === 'string') {
			name = quantity;
			quantity = null;
		}

		await msg.author.settings.sync(true);
		if (msg.author.minionIsBusy) {
			this.client.emit(
				Events.Log,
				`${msg.author.username}[${msg.author.id}] [TTK-BUSY] ${quantity} ${name}`
			);
			return msg.send(msg.author.minionStatus);
		}
		if (!msg.author.hasMinion) {
			throw hasNoMinion(msg.cmdPrefix);
		}

		if (!name) throw invalidMonster(msg.cmdPrefix);

		const monster = findMonster(name);

		if (!monster) throw invalidMonster(msg.cmdPrefix);

		// If no quantity provided, set it to the max.
		if (quantity === null) {
			quantity = Math.floor((Time.Minute * 30) / monster.timeToFinish);
		}

		// Make sure they have all the required items to kill this monster
		const bank = msg.author.settings.get(UserSettings.Bank);
		for (const item of monster.itemsRequired as number[]) {
			if (!bank[item] || bank[item] < 0) {
				throw `To kill ${
					monster.name
				}, you need these items: ${monster.itemsRequired
					.map(id => itemNameFromID(id))
					.join(', ')}.`;
			}
		}

		let duration = monster.timeToFinish * quantity;
		if (duration > Time.Minute * 30) {
			throw `${getMinionName(
				msg.author
			)} can't go on PvM trips longer than 30 minutes, try a lower quantity. The highest amount you can do for ${
				monster.name
			} is ${Math.floor((Time.Minute * 30) / monster.timeToFinish)}.`;
		}

		const randomAddedDuration = rand(1, 20);
		duration += (randomAddedDuration * duration) / 100;

		if (isWeekend()) {
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

		return msg.send(
			`${getMinionName(msg.author)} is now killing ${data.quantity}x ${
				monster.name
			}, it'll take around ${formatDuration(duration)} to finish.`
		);
	}
}
