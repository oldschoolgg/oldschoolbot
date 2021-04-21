import { FormattedCustomEmoji } from '@sapphire/discord-utilities';
import { MessageEmbed } from 'discord.js';
import { chunk, sleep } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank, Monsters, Util } from 'oldschooljs';

import { Color, Emoji, MIMIC_MONSTER_ID, PerkTier, Time } from '../../lib/constants';
import clueTiers from '../../lib/minions/data/clueTiers';
import { effectiveMonsters } from '../../lib/minions/data/killableMonsters';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { randomItemFromArray } from '../../lib/util';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { minionStatsEmbed } from '../../lib/util/minionStatsEmbed';

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

async function runCommand(msg: KlasaMessage, name: string, args: unknown[]) {
	try {
		const command = msg.client.commands.get(name)!;
		await command!.run(msg, args);
	} catch (err) {
		msg.send(typeof err === 'string' ? err : err.message);
	}
}

export default class MinionCommand extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			aliases: ['m'],
			usage:
				'[seticon|clues|k|kill|setname|buy|clue|kc|pat|stats|mine|smith|quest|qp|chop|light|fish|laps|cook|smelt|craft|bury|offer|fletch|cancel|farm|harvest|mix|hunt] [quantity:int{1}|name:...string] [name:...string] [name:...string]',

			usageDelim: ' ',
			subcommands: true
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage) {
		return msg.send(msg.author.minionStatus);
	}

	@requiresMinion
	async seticon(msg: KlasaMessage, [icon]: [string]) {
		if (msg.author.perkTier < PerkTier.Six) {
			return msg.send(
				`You need to be a Tier 5 Patron to change your minion's icon to a custom icon.`
			);
		}

		const res = FormattedCustomEmoji.exec(icon);
		if (!res || !res[0]) {
			return msg.channel.send(`That's not a valid emoji.`);
		}
		await msg.author.settings.update(UserSettings.Minion.Icon, res[0]);

		return msg.send(`Changed your minion icon to ${res}.`);
	}

	async pat(msg: KlasaMessage) {
		return msg.send(randomPatMessage(msg.author.minionName));
	}

	@requiresMinion
	async stats(msg: KlasaMessage) {
		const embed = await minionStatsEmbed(msg.author);
		return msg.send(embed);
	}

	@requiresMinion
	async kc(msg: KlasaMessage) {
		const monsterScores = msg.author.settings.get(UserSettings.MonsterScores);
		const entries = Object.entries(monsterScores);
		if (entries.length === 0) throw `${msg.author.minionName} hasn't killed any monsters yet!`;

		const embed = new MessageEmbed()
			.setColor(Color.Orange)
			.setTitle(`**${msg.author.minionName}'s KCs**`)
			.setDescription(
				`These are your minions Kill Counts for all monsters, to see your Clue Scores, use \`${msg.cmdPrefix}m clues\`.`
			);

		for (const monsterScoreChunk of chunk(entries, 10)) {
			embed.addField(
				'\u200b',
				monsterScoreChunk
					.map(([monID, monKC]) => {
						if (parseInt(monID) === MIMIC_MONSTER_ID) {
							return `${Emoji.Casket} **Mimic:** ${monKC}`;
						}
						const mon = effectiveMonsters.find(m => m.id === parseInt(monID));
						if (!mon) return `**${Monsters.get(parseInt(monID))?.name}:** ${monKC}`;
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore
						return `${mon?.emoji} **${mon!.name}**: ${monKC}`;
					})
					.join('\n'),
				true
			);
		}

		return msg.send(embed);
	}

	@requiresMinion
	async qp(msg: KlasaMessage) {
		return msg.send(
			`${msg.author.minionName}'s Quest Point count is: ${msg.author.settings.get(
				UserSettings.QP
			)}.`
		);
	}

	@requiresMinion
	async clues(msg: KlasaMessage) {
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

		const starter = new Bank({
			Shark: 300,
			'Saradomin brew(4)': 20,
			'Super restore(4)': 10,
			'Anti-dragon shield': 1,
			'Tiny lamp': 3,
			'Small lamp': 1,
			'Tradeable mystery box': 1,
			'Dragon bones': 50,
			Coins: 100_000,
			'Clue scroll (beginner)': 5,
			'Equippable mystery box': 1
		});

		if (cost === 0) {
			await msg.author.settings.update(UserSettings.Minion.HasBought, true);
			await msg.author.addItemsToBank(starter, true);
			return msg.channel.send(
				`${Emoji.Gift} Your new minion is ready! Use \`${msg.cmdPrefix}minion\` to manage them, and check https://www.oldschool.gg/oldschoolbot for more information on them, and **make sure** to read the rules! Breaking the bot rules could result in you being banned or your account wiped - read them here: <https://www.oldschool.gg/oldschoolbot/rules>\n\nYou received: ${starter}.`
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

			await sleep(3000);

			await response.edit(
				`${Emoji.FancyLoveheart} Letting your new minion say goodbye to the unadopted minions...`
			);

			await sleep(3000);

			await msg.author.settings.sync(true);
			const balance = msg.author.settings.get(UserSettings.GP);
			if (balance < cost) return;

			await msg.author.settings.update(UserSettings.GP, balance - cost);
			await msg.author.settings.update(UserSettings.Minion.HasBought, true);
			await msg.author.addItemsToBank(starter, true);
			await response.edit(
				`${Emoji.Gift} Your new minion is ready! Use \`${msg.cmdPrefix}minion\` to manage them.\n\nYou received: **${starter}.**`
			);
		} catch (err) {
			return msg.channel.send('Cancelled minion purchase.');
		}
	}

	@requiresMinion
	async setname(msg: KlasaMessage, [name]: [string]) {
		if (
			!name ||
			typeof name !== 'string' ||
			name.length < 2 ||
			name.length > 30 ||
			['\n', '`', '@', '<', ':'].some(char => name.includes(char))
		) {
			return msg.send(`That's not a valid name for your minion.`);
		}

		await msg.author.settings.update(UserSettings.Minion.Name, name);
		return msg.send(`Renamed your minion to ${msg.author.minionName}.`);
	}

	async fish(msg: KlasaMessage, [quantity, fishName]: [number, string]) {
		runCommand(msg, 'fish', [quantity, fishName]);
	}

	async laps(msg: KlasaMessage, [quantity, courseName]: [number, string]) {
		runCommand(msg, 'laps', [quantity, courseName]);
	}

	async mine(msg: KlasaMessage, [quantity, oreName]: [number, string]) {
		runCommand(msg, 'mine', [quantity, oreName]);
	}

	async smelt(msg: KlasaMessage, [quantity, barName]: [number, string]) {
		runCommand(msg, 'smelt', [quantity, barName]);
	}

	async cook(msg: KlasaMessage, [quantity, cookableName]: [number | string, string]) {
		runCommand(msg, 'cook', [quantity, cookableName]);
	}

	async smith(msg: KlasaMessage, [quantity, smithableItemName]: [number, string]) {
		runCommand(msg, 'smith', [quantity, smithableItemName]);
	}

	async chop(msg: KlasaMessage, [quantity, logName]: [number, string]) {
		runCommand(msg, 'chop', [quantity, logName]);
	}

	async light(msg: KlasaMessage, [quantity, logName]: [number, string]) {
		runCommand(msg, 'light', [quantity, logName]);
	}

	async craft(msg: KlasaMessage, [quantity, itemName]: [number, string]) {
		runCommand(msg, 'craft', [quantity, itemName]);
	}

	async fletch(msg: KlasaMessage, [quantity, itemName]: [number, string]) {
		runCommand(msg, 'fletch', [quantity, itemName]);
	}

	async bury(msg: KlasaMessage, [quantity, boneName]: [number, string]) {
		runCommand(msg, 'bury', [quantity, boneName]);
	}

	async farm(msg: KlasaMessage, [quantity, seedName, upgradeType]: [number, string, string]) {
		runCommand(msg, 'farm', [quantity, seedName, upgradeType]);
	}

	async harvest(msg: KlasaMessage, [seedType]: [string]) {
		runCommand(msg, 'harvest', [seedType]);
	}

	async offer(msg: KlasaMessage, [quantity, boneName]: [number, string]) {
		runCommand(msg, 'offer', [quantity, boneName]);
	}

	async mix(msg: KlasaMessage, [quantity, mixName]: [number, string]) {
		runCommand(msg, 'mix', [quantity, mixName]);
	}

	async hunt(msg: KlasaMessage, [quantity, creatureName]: [number, string]) {
		runCommand(msg, 'hunt', [quantity, creatureName]);
	}

	async quest(msg: KlasaMessage) {
		runCommand(msg, 'quest', []);
	}

	async cancel(msg: KlasaMessage) {
		runCommand(msg, 'cancel', []);
	}

	@requiresMinion
	async clue(msg: KlasaMessage, [quantity, tierName]: [number | string, string]) {
		runCommand(msg, 'mclue', [quantity, tierName]);
	}

	async k(msg: KlasaMessage, [quantity, name = '']: [null | number | string, string]) {
		await this.kill(msg, [quantity, name]).catch(err => {
			throw err;
		});
	}

	@requiresMinion
	@minionNotBusy
	async kill(msg: KlasaMessage, [quantity, name = '']: [null | number | string, string]) {
		runCommand(msg, 'k', [quantity, name]);
	}
}
