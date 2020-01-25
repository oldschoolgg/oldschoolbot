import { KlasaClient, CommandStore, KlasaMessage, util } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Tasks, Activity, UserSettings, Emoji, Time, Events } from '../../lib/constants';
import {
	stringMatches,
	formatDuration,
	getMinionName,
	randomItemFromArray,
	findMonster,
	isWeekend
} from '../../lib/util';
import { MonsterActivityTaskOptions, ClueActivityTaskOptions } from '../../lib/types/index';
import { rand } from '../../../config/util';
import clueTiers from '../../lib/clueTiers';
import killableMonsters from '../../lib/killableMonsters';

const COST_OF_MINION = 50_000_000;

const invalidClue = (prefix: string) =>
	`That isn't a valid clue tier, the valid tiers are: ${clueTiers
		.map(tier => tier.name)
		.join(', ')}. For example, \`${prefix}minion clue 1 easy\``;

const invalidMonster = (prefix: string) =>
	`That isn't a valid monster, the available monsters are: ${killableMonsters
		.map(mon => mon.name)
		.join(', ')}. For example, \`${prefix}minion kill 5 zulrah\``;

const hasNoMinion = (prefix: string) =>
	`You don't have a minion yet. You can buy one for 50m by typing \`${prefix}minion buy\`.`;

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

export default class extends BotCommand {
	public constructor(
		client: KlasaClient,
		store: CommandStore,
		file: string[],
		directory: string
	) {
		super(client, store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			aliases: ['m'],
			usage:
				'[kill|setname|buy|clue|kc|pat] [quantity:int{1}|name:...string] [name:...string]',
			usageDelim: ' ',
			subcommands: true
		});
	}

	async run(msg: KlasaMessage) {
		await msg.author.settings.sync(true);
		if (!msg.author.hasMinion) {
			throw hasNoMinion(msg.cmdPrefix);
		}
		return msg.send(msg.author.minionStatus);
	}

	async pat(msg: KlasaMessage) {
		await msg.author.settings.sync(true);
		if (!msg.author.hasMinion) {
			throw hasNoMinion(msg.cmdPrefix);
		}

		if (msg.author.minionIsBusy) {
			return msg.send(msg.author.minionStatus);
		}

		return msg.send(randomPatMessage(getMinionName(msg.author)));
	}

	async kc(msg: KlasaMessage) {
		await msg.author.settings.sync(true);
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
		if (msg.author.hasMinion) throw 'You already have a minion!';

		await msg.author.settings.sync(true);
		const balance = msg.author.settings.get('GP');

		if (balance < COST_OF_MINION) {
			throw "You can't afford to buy a minion! You need 50m";
		}

		await msg.send(
			'Are you sure you want to spend 50m on buying a minion? Please say `yes` to confirm.'
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
			if (balance < COST_OF_MINION) return;

			await msg.author.settings.update(UserSettings.GP, balance - COST_OF_MINION);
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

	async clue(msg: KlasaMessage, [tierName]: [string]) {
		await msg.author.settings.sync(true);
		if (msg.author.minionIsBusy) {
			this.client.emit(
				Events.Log,
				`${msg.author.username}[${msg.author.id}] [TTK-BUSY] ${tierName}`
			);
			return msg.send(msg.author.minionStatus);
		}

		if (!msg.author.hasMinion) {
			throw hasNoMinion(msg.cmdPrefix);
		}

		if (!tierName) throw invalidClue(msg.cmdPrefix);

		const clueTier = clueTiers.find(tier => stringMatches(tier.name, tierName));

		if (!clueTier) throw invalidClue(msg.cmdPrefix);

		let duration = clueTier.timeToFinish;
		const bank = msg.author.settings.get('bank');
		const numOfScrolls = bank[clueTier.scrollID];

		if (!numOfScrolls) {
			throw `You don't have a ${clueTier.name} clue scroll.`;
		}

		await msg.author.removeItemFromBank(clueTier.scrollID);

		const randomAddedDuration = rand(1, 20);
		duration += (randomAddedDuration * duration) / 100;

		if (isWeekend()) {
			duration *= 0.9;
		}

		const data: ClueActivityTaskOptions = {
			clueID: clueTier.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			duration,
			type: Activity.ClueCompletion
		};

		this.client.schedule.create(Tasks.ClueActivity, Date.now() + duration, {
			data,
			catchUp: true
		});

		return msg.send(
			`${getMinionName(msg.author)} is now completing a ${
				clueTier.name
			} clue, it'll take around ${formatDuration(
				clueTier.timeToFinish
			)} to finish.`
		);
	}

	async kill(msg: KlasaMessage, [quantity, name]: [number|string, string]) {
		if( typeof quantity === 'number') {
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
				type: Activity.MonsterKilling
			};

			this.client.schedule.create(Tasks.MonsterActivity, Date.now() + duration, {
				data,
				catchUp: true
			});

			return msg.send(
				`${getMinionName(msg.author)} is now killing ${data.quantity}x ${
					monster.name
				}, it'll take around ${formatDuration(duration)} to finish.`
			);
		}
		else if( typeof name === 'undefined'){
			let monsterName = quantity;

			await msg.author.settings.sync(true);
			if (msg.author.minionIsBusy) {
				this.client.emit(
					Events.Log,
					`${msg.author.username}[${msg.author.id}] [TTK-BUSY]  max number ${monsterName}`
				);
				return msg.send(msg.author.minionStatus);
			}
			if (!msg.author.hasMinion) {
				throw hasNoMinion(msg.cmdPrefix);
			}

			if (!monsterName) throw invalidMonster(msg.cmdPrefix);

			const monster = findMonster(monsterName);

			if (!monster) throw invalidMonster(msg.cmdPrefix);

			let numberKilled = Math.floor((Time.Minute * 30) / monster.timeToFinish)
			let duration = numberKilled * monster.timeToFinish;
			const randomAddedDuration = rand(1, 20);
			duration += (randomAddedDuration * duration) / 100;

			if (isWeekend()) {
				duration *= 0.9;
			}

			const data: MonsterActivityTaskOptions = {
				monsterID: monster.id,
				userID: msg.author.id,
				channelID: msg.channel.id,
				quantity: numberKilled,
				duration,
				type: Activity.MonsterKilling
			};

			this.client.schedule.create(Tasks.MonsterActivity, Date.now() + duration, {
				data,
				catchUp: true
			});

			return msg.send(
				`${getMinionName(msg.author)} is now killing ${data.quantity}x ${
					monster.name
				}, it'll take around ${formatDuration(duration)} to finish.`
			);
		}
	}
}
