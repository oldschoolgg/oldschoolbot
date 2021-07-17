import { FormattedCustomEmoji } from '@sapphire/discord-utilities';
import { MessageButton, MessageEmbed } from 'discord.js';
import { chunk, Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Monsters } from 'oldschooljs';

import {
	BitField,
	Color,
	Emoji,
	informationalButtons,
	lastTripCache,
	MAX_LEVEL,
	MIMIC_MONSTER_ID,
	PerkTier
} from '../../lib/constants';
import ClueTiers from '../../lib/minions/data/clueTiers';
import { effectiveMonsters } from '../../lib/minions/data/killableMonsters';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { getNewUser } from '../../lib/settings/settings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Skills from '../../lib/skilling/skills';
import { BotCommand } from '../../lib/structures/BotCommand';
import { GiveawayTable } from '../../lib/typeorm/GiveawayTable.entity';
import { MinigameTable } from '../../lib/typeorm/MinigameTable.entity';
import { NewUserTable } from '../../lib/typeorm/NewUserTable.entity';
import { PoHTable } from '../../lib/typeorm/PoHTable.entity';
import { SlayerTaskTable } from '../../lib/typeorm/SlayerTaskTable.entity';
import { XPGainsTable } from '../../lib/typeorm/XPGainsTable.entity';
import { convertLVLtoXP, isValidNickname, randomItemFromArray, stringMatches } from '../../lib/util';
import { minionStatsEmbed } from '../../lib/util/minionStatsEmbed';

const patMessages = [
	'You pat {name} on the head.',
	'You gently pat {name} on the head, they look back at you happily.',
	'You pat {name} softly on the head, and thank them for their hard work.',
	'You pat {name} on the head, they feel happier now.',
	'After you pat {name}, they feel more motivated now and in the mood for PVM.',
	'You give {name} head pats, they get comfortable and start falling asleep.'
];

const randomPatMessage = (minionName: string) => randomItemFromArray(patMessages).replace('{name}', minionName);

async function runCommand(msg: KlasaMessage, name: string, args: unknown[]) {
	try {
		const command = msg.client.commands.get(name)!;
		await command!.run(msg, args);
	} catch (err) {
		msg.channel.send(typeof err === 'string' ? err : err.message);
	}
}

export default class MinionCommand extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			aliases: ['m'],
			usage: '[lvl|seticon|clues|k|kill|setname|buy|clue|kc|pat|stats|ironman] [quantity:int{1}|name:...string] [name:...string] [name:...string]',
			usageDelim: ' ',
			subcommands: true,
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage) {
		let components = [];
		const bank = msg.author.bank();
		if (!msg.author.minionIsBusy) {
			for (const tier of ClueTiers) {
				if (bank.has(tier.scrollID)) {
					components.push(
						new MessageButton()
							.setLabel(`Do ${tier.name} Clue`)
							.setStyle('SECONDARY')
							.setCustomID(tier.name)
							.setEmoji('365003979840552960')
					);
				}
			}
		}

		const lastTrip = lastTripCache.get(msg.author.id);
		if (lastTrip && !msg.author.minionIsBusy) {
			components.push(
				new MessageButton()
					.setLabel(`Repeat ${lastTrip.data.type} Trip`)
					.setStyle('SECONDARY')
					.setCustomID('REPEAT_LAST_TRIP')
			);
		}

		const sentMessage = await msg.channel.send({
			content: msg.author.minionStatus,
			components: components.length > 0 ? [...chunk(components, 5)] : undefined
		});
		if (components.length > 0) {
			const handleButtons = async () => {
				try {
					const selection = await sentMessage.awaitMessageComponentInteraction({
						filter: i => {
							if (i.user.id !== msg.author.id) {
								i.reply({ ephemeral: true, content: 'This is not your confirmation message.' });
								return false;
							}
							if (i.user.minionIsBusy) {
								i.reply({ ephemeral: true, content: 'Your minion is busy.' });
								return false;
							}
							return true;
						},
						time: Time.Second * 15
					});
					await sentMessage.edit({ components: [] });
					selection.deferUpdate();
					if (selection.user.minionIsBusy) {
						return selection.reply({ content: msg.author.minionStatus, ephemeral: true });
					}
					if (selection.customID === 'REPEAT_LAST_TRIP' && lastTrip) {
						return lastTrip.continue(msg);
					}
					await this.client.commands.get('mclue')?.run(msg, [selection.customID]);
				} catch {
					await sentMessage.edit({ components: [] });
				}
			};
			handleButtons();
		}
	}

	@requiresMinion
	async lvl(msg: KlasaMessage, [input]: [string]) {
		const values = Object.values(Skills);
		const skill = values.find(s => stringMatches(s.name, input));
		if (!skill) {
			return msg.channel.send(
				`That's not a valid skill. The valid skills are: ${values.map(v => v.name).join(', ')}.`
			);
		}
		const level = msg.author.skillLevel(skill.id);
		const currentXP = msg.author.settings.get(`skills.${skill.id}`) as number;
		let str = `${skill.emoji} Your ${skill.name} level is **${level}** (${currentXP.toLocaleString()} XP).`;
		if (level < MAX_LEVEL) {
			const xpToLevel = convertLVLtoXP(level + 1) - currentXP;
			str += ` ${xpToLevel.toLocaleString()} XP away from level ${level + 1}`;
		}
		return msg.channel.send(str);
	}

	@requiresMinion
	async seticon(msg: KlasaMessage, [icon]: [string]) {
		if (msg.author.perkTier < PerkTier.Six) {
			return msg.channel.send("You need to be a Tier 5 Patron to change your minion's icon to a custom icon.");
		}

		const res = FormattedCustomEmoji.exec(icon);
		if (!res || !res[0]) {
			return msg.channel.send("That's not a valid emoji.");
		}
		await msg.author.settings.update(UserSettings.Minion.Icon, res[0]);

		return msg.channel.send(`Changed your minion icon to ${res}.`);
	}

	@requiresMinion
	@minionNotBusy
	async ironman(msg: KlasaMessage) {
		/**
		 * If the user is an ironman already, lets ask them if they want to de-iron.
		 */
		if (msg.author.isIronman) {
			const isPerm = msg.author.bitfield.includes(BitField.PermanentIronman);
			if (isPerm) {
				return msg.channel.send("You're a **permanent** ironman and you cannot de-iron.");
			}
			if (msg.flagArgs.permanent) {
				await msg.channel.send(
					`Would you like to change your ironman to a *permanent* iron? The only thing in your account that will change, is that you will no longer be able to de-iron. This is *permanent* and cannot be reversed, its permanent ironman mode.
Please say \`permanent\` to confirm.`
				);
				try {
					await msg.channel.awaitMessages({
						max: 1,
						time: 15_000,
						errors: ['time'],
						filter: answer =>
							answer.author.id === msg.author.id && answer.content.toLowerCase() === 'permanent'
					});
					await msg.author.settings.update(UserSettings.BitField, BitField.PermanentIronman);
					return msg.channel.send('You are now a **permanent** Ironman. Enjoy!');
				} catch (err) {
					return msg.channel.send('Cancelled.');
				}
			}

			await msg.channel.send(
				'Would you like to stop being an ironman? You will keep all your items and stats but you will have to start over if you want to play as an ironman again. Please say `deiron` to confirm.'
			);
			try {
				await msg.channel.awaitMessages({
					max: 1,
					time: 15_000,
					errors: ['time'],
					filter: answer => answer.author.id === msg.author.id && answer.content.toLowerCase() === 'deiron'
				});
				await msg.author.settings.update(UserSettings.Minion.Ironman, false);
				return msg.channel.send('You are no longer an ironman.');
			} catch (err) {
				return msg.channel.send('Cancelled de-ironning.');
			}
		}

		const existingGiveaways = await GiveawayTable.find({
			userID: msg.author.id,
			completed: false
		});

		if (existingGiveaways.length !== 0) {
			return msg.channel.send("You can't become an ironman because you have active giveaways.");
		}

		await msg.channel.send(
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
			await msg.channel.awaitMessages({
				max: 1,
				time: 15_000,
				errors: ['time'],
				filter: answer => answer.author.id === msg.author.id && answer.content.toLowerCase() === 'confirm'
			});

			msg.author.log(
				`just became an ironman, previous settings: ${JSON.stringify(msg.author.settings.toJSON())}`
			);

			await msg.author.settings.reset([
				UserSettings.Bank,
				UserSettings.CollectionLogBank,
				UserSettings.GP,
				UserSettings.QP,
				UserSettings.MonsterScores,
				UserSettings.ClueScores,
				UserSettings.BankBackground,
				UserSettings.SacrificedValue,
				UserSettings.SacrificedBank,
				UserSettings.HonourLevel,
				UserSettings.HonourPoints,
				UserSettings.HighGambles,
				UserSettings.CarpenterPoints,
				UserSettings.ZealTokens,
				UserSettings.OpenableScores,
				'slayer',
				'gear',
				'stats',
				'skills',
				'minion',
				'farmingPatches'
			]);

			try {
				await SlayerTaskTable.delete({ user: await getNewUser(msg.author.id) });
				await PoHTable.delete({ userID: msg.author.id });
				await MinigameTable.delete({ userID: msg.author.id });
				await XPGainsTable.delete({ userID: msg.author.id });
				await NewUserTable.delete({ id: msg.author.id });
			} catch (_) {}

			await msg.author.settings.update([
				[UserSettings.Minion.Ironman, true],
				[UserSettings.Minion.HasBought, true]
			]);
			return msg.channel.send('You are now an ironman.');
		} catch (err) {
			return msg.channel.send('Cancelled ironman swap.');
		}
	}

	@requiresMinion
	@minionNotBusy
	async pat(msg: KlasaMessage) {
		return msg.channel.send(randomPatMessage(msg.author.minionName));
	}

	@requiresMinion
	async stats(msg: KlasaMessage) {
		return msg.channel.send({ embeds: [await minionStatsEmbed(msg.author)] });
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
						return `${(mon as any)?.emoji ?? ''}**${mon!.name}**: ${monKC}`;
					})
					.join('\n'),
				true
			);
		}

		return msg.channel.send({ embeds: [embed] });
	}

	@requiresMinion
	async qp(msg: KlasaMessage) {
		return msg.channel.send(
			`${msg.author.minionName}'s Quest Point count is: ${msg.author.settings.get(UserSettings.QP)}.`
		);
	}

	@requiresMinion
	async clues(msg: KlasaMessage) {
		const clueScores = msg.author.settings.get(UserSettings.ClueScores);
		if (Object.keys(clueScores).length === 0) return msg.channel.send("You haven't done any clues yet.");

		let res = `${Emoji.Casket} **${msg.author.minionName}'s Clue Scores:**\n\n`;
		for (const [clueID, clueScore] of Object.entries(clueScores)) {
			const clue = ClueTiers.find(c => c.id === parseInt(clueID));
			res += `**${clue!.name}**: ${clueScore}\n`;
		}
		return msg.channel.send(res);
	}

	async buy(msg: KlasaMessage) {
		if (msg.author.hasMinion) return msg.channel.send('You already have a minion!');

		await msg.author.settings.update(UserSettings.Minion.HasBought, true);
		return msg.channel.send({
			embeds: [
				new MessageEmbed().setTitle('Your minion is now ready to use!').setDescription(
					`You have successfully got yourself a minion, and you're ready to use the bot now! Please check out the links below for information you should read.

🧑‍⚖️ **Rules:** You *must* follow our 5 simple rules, breaking any rule can result in a permanent ban - and "I didn't know the rules" is not a valid excuse, read them here: <https://wiki.oldschool.gg/rules>

<:patreonLogo:679334888792391703> **Patreon:** If you're able too, please consider supporting my work on Patreon, it's highly appreciated and helps me hugely <https://www.patreon.com/oldschoolbot> ❤️

<:BSO:863823820435619890> **BSO:** I run a 2nd bot called BSO (Bot School Old), which you can also play, it has lots of fun and unique changes, like 5x XP and infinitely stacking clues. Type \`${msg.cmdPrefix}bso\` for more information.

Please click the buttons below for important links.`
				)
			],
			components: [informationalButtons]
		});
	}

	@requiresMinion
	async setname(msg: KlasaMessage, [name]: [string]) {
		if (!isValidNickname(name)) {
			return msg.channel.send("That's not a valid name for your minion.");
		}

		await msg.author.settings.update(UserSettings.Minion.Name, name);
		return msg.channel.send(`Renamed your minion to ${msg.author.minionName}.`);
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
