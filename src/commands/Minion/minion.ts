import { FormattedCustomEmoji } from '@sapphire/discord-utilities';
import { MessageAttachment, MessageButton, MessageEmbed } from 'discord.js';
import { chunk, randArrItem, Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank, Monsters } from 'oldschooljs';

import {
	Color,
	Emoji,
	informationalButtons,
	lastTripCache,
	MAX_LEVEL,
	MIMIC_MONSTER_ID,
	PerkTier
} from '../../lib/constants';
import { GearSetupType } from '../../lib/gear';
import ClueTiers from '../../lib/minions/data/clueTiers';
import { effectiveMonsters } from '../../lib/minions/data/killableMonsters';
import minionIcons from '../../lib/minions/data/minionIcons';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { autoFarm } from '../../lib/minions/functions/autoFarm';
import { becomeIronman } from '../../lib/minions/functions/becomeIronman';
import { blowpipeCommand } from '../../lib/minions/functions/blowpipeCommand';
import { cancelTaskCommand } from '../../lib/minions/functions/cancelTaskCommand';
import { dataCommand } from '../../lib/minions/functions/dataCommand';
import { degradeableItemsCommand } from '../../lib/minions/functions/degradeableItemsCommand';
import { equipPet } from '../../lib/minions/functions/equipPet';
import { pastActivities } from '../../lib/minions/functions/pastActivities';
import { tempCLCommand } from '../../lib/minions/functions/tempCLCommand';
import { trainCommand } from '../../lib/minions/functions/trainCommand';
import { unEquipAllCommand } from '../../lib/minions/functions/unequipAllCommand';
import { unequipPet } from '../../lib/minions/functions/unequipPet';
import { prisma } from '../../lib/settings/prisma';
import { runCommand } from '../../lib/settings/settings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Skills from '../../lib/skilling/skills';
import Agility from '../../lib/skilling/skills/agility';
import { BotCommand } from '../../lib/structures/BotCommand';
import { convertLVLtoXP, isAtleastThisOld, isValidNickname, stringMatches } from '../../lib/util';
import { minionStatsEmbed } from '../../lib/util/minionStatsEmbed';

const patMessages = [
	'You pat {name} on the head.',
	'You gently pat {name} on the head, they look back at you happily.',
	'You pat {name} softly on the head, and thank them for their hard work.',
	'You pat {name} on the head, they feel happier now.',
	'After you pat {name}, they feel more motivated now and in the mood for PVM.',
	'You give {name} head pats, they get comfortable and start falling asleep.'
];

const randomPatMessage = (minionName: string) => randArrItem(patMessages).replace('{name}', minionName);

const subCommands = [
	'lvl',
	'seticon',
	'clues',
	'k',
	'kill',
	'setname',
	'buy',
	'clue',
	'kc',
	'pat',
	'stats',
	'ironman',
	'opens',
	'info',
	'equippet',
	'unequippet',
	'autofarm',
	'activities',
	'af',
	'ep',
	'uep',
	'lapcounts',
	'cancel',
	'train',
	'unequipall',
	'tempcl',
	'blowpipe',
	'bp',
	'charge',
	'data',
	'commands'
];

export default class MinionCommand extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			aliases: ['m'],
			usage: `[${subCommands.join('|')}] [quantity:int{1}|name:...string] [name:...string] [name:...string]`,
			usageDelim: ' ',
			subcommands: true,
			requiredPermissionsForBot: ['EMBED_LINKS']
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
					await runCommand(msg, 'mclue', [selection.customID]);
				} catch {
					await sentMessage.edit({ components: [] });
				}
			};
			handleButtons();
		}
	}

	async ironman(msg: KlasaMessage) {
		return becomeIronman(msg);
	}

	async cancel(msg: KlasaMessage) {
		return cancelTaskCommand(msg);
	}

	async train(msg: KlasaMessage, [input]: [string | undefined]) {
		return trainCommand(msg, input);
	}

	async commands(msg: KlasaMessage) {
		const commands = await prisma.commandUsage.findMany({
			where: {
				user_id: msg.author.id
			},
			orderBy: {
				date: 'desc'
			},
			take: 15
		});
		return msg.channel.send(
			commands
				.map(
					(c, inde) =>
						`${inde + 1}. \`+${c.command_name}\` Args[${JSON.stringify(c.args)}] Date[<t:${Math.round(
							c.date.getTime() / 1000
						)}:R>] isContinue[${c.is_continue ? 'Yes' : 'No'}]`
				)
				.join('\n')
		);
	}

	async data(msg: KlasaMessage, [input = '']: [string | undefined]) {
		if (msg.author.perkTier < PerkTier.Four) {
			return msg.channel.send('Sorry, you need to be a Tier 3 Patron to use this command.');
		}
		const result = await dataCommand(msg, input);
		if ('bank' in result) {
			return msg.channel.sendBankImage({
				title: result.title,
				bank: result.bank,
				content: result.content
			});
		}
		const output = Buffer.isBuffer(result) ? { files: [new MessageAttachment(result)] } : result;
		return msg.channel.send(output);
	}

	async lapcounts(msg: KlasaMessage) {
		const entries = Object.entries(msg.author.settings.get(UserSettings.LapsScores)).map(arr => [
			parseInt(arr[0]),
			arr[1]
		]);
		const sepulchreCount = await msg.author.getMinigameScore('sepulchre');
		if (sepulchreCount === 0 && entries.length === 0) {
			return msg.channel.send("You haven't done any laps yet! Sad.");
		}
		const data = `${entries
			.map(([id, qty]) => `**${Agility.Courses.find(c => c.id === id)!.name}:** ${qty}`)
			.join('\n')}\n**Hallowed Sepulchre:** ${await sepulchreCount}`;
		return msg.channel.send(data);
	}

	async charge(msg: KlasaMessage, [input = '']: [string | undefined]) {
		return degradeableItemsCommand(msg, input);
	}

	async bp(msg: KlasaMessage, [input = '']: [string | undefined]) {
		return this.blowpipe(msg, [input]);
	}

	async blowpipe(msg: KlasaMessage, [input = '']: [string | undefined]) {
		return blowpipeCommand(msg, input);
	}

	async info(msg: KlasaMessage) {
		return runCommand(msg, 'rp', ['c', msg.author]);
	}

	async tempcl(msg: KlasaMessage, [input = '']: [string | undefined]) {
		return tempCLCommand(msg, input);
	}

	async unequippet(msg: KlasaMessage) {
		return unequipPet(msg);
	}

	@minionNotBusy
	async equippet(msg: KlasaMessage, [input = '']: [string | undefined]) {
		return equipPet(msg, input);
	}

	async uep(msg: KlasaMessage) {
		return unequipPet(msg);
	}

	@minionNotBusy
	async ep(msg: KlasaMessage, [input = '']: [string | undefined]) {
		return equipPet(msg, input);
	}

	async af(msg: KlasaMessage) {
		return autoFarm(msg);
	}

	async autofarm(msg: KlasaMessage) {
		return autoFarm(msg);
	}

	async activities(msg: KlasaMessage) {
		return pastActivities(msg);
	}

	@requiresMinion
	async lvl(msg: KlasaMessage, [input]: [string]) {
		const values = Object.values(Skills);
		const skill = values.find(s => stringMatches(s.name, input) || s.aliases.some(a => stringMatches(a, input)));
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
		if (msg.author.perkTier < PerkTier.Four) {
			return msg.channel.send("You need to be a Tier 3 Patron to change your minion's icon to a custom icon.");
		}

		if (!icon) {
			await msg.confirm('Would you like to return to your default minion icon?');
			const sacValue = msg.author.settings.get(UserSettings.SacrificedValue);
			let icon = null;
			for (const sacIcon of minionIcons) {
				if (sacValue < sacIcon.valueRequired) continue;
				if (sacValue >= sacIcon.valueRequired) {
					icon = sacIcon.emoji;
					break;
				}
			}
			await msg.author.settings.update(UserSettings.Minion.Icon, icon);
			return msg.channel.send(`Restored your minion icon to ${icon ?? Emoji.Minion}.`);
		}

		const res = FormattedCustomEmoji.exec(icon);
		if (!res || !res[0]) {
			return msg.channel.send("That's not a valid emoji.");
		}

		await msg.confirm('Icons cannot be inappropriate or NSFW. Do you understand?');

		await msg.author.settings.update(UserSettings.Minion.Icon, res[0]);

		return msg.channel.send(`Changed your minion icon to ${res}.`);
	}

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

		const starter = isAtleastThisOld(msg.author.createdTimestamp, Time.Year * 2)
			? new Bank({
					Shark: 300,
					'Saradomin brew(4)': 50,
					'Super restore(4)': 20,
					'Anti-dragon shield': 1,
					'Tiny lamp': 5,
					'Small lamp': 2,
					'Tradeable mystery box': 5,
					'Untradeable Mystery box': 5,
					'Dragon bones': 50,
					Coins: 50_000_000,
					'Clue scroll (beginner)': 10,
					'Equippable mystery box': 1,
					'Pet Mystery box': 1
			  })
			: null;

		if (starter) {
			await msg.author.addItemsToBank({ items: starter, collectionLog: false });
		}

		return msg.channel.send({
			embeds: [
				new MessageEmbed().setTitle('Your minion is now ready to use!').setDescription(
					`You have successfully got yourself a minion, and you're ready to use the bot now! Please check out the links below for information you should read.

${starter !== null ? `**You received these starter items:** ${starter}.` : ''}

🧑‍⚖️ **Rules:** You *must* follow our 5 simple rules, breaking any rule can result in a permanent ban - and "I didn't know the rules" is not a valid excuse, read them here: <https://wiki.oldschool.gg/rules>

<:patreonLogo:679334888792391703> **Patreon:** If you're able too, please consider supporting my work on Patreon, it's highly appreciated and helps me hugely <https://www.patreon.com/oldschoolbot> ❤️

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

	@requiresMinion
	@minionNotBusy
	async k(msg: KlasaMessage, [quantity, name = '']: [null | number | string, string]) {
		runCommand(msg, 'k', [quantity, name]);
	}

	@requiresMinion
	@minionNotBusy
	async kill(msg: KlasaMessage, [quantity, name = '']: [null | number | string, string]) {
		runCommand(msg, 'k', [quantity, name]);
	}

	async opens(msg: KlasaMessage) {
		const openableScores = new Bank(msg.author.settings.get(UserSettings.OpenableScores));
		return msg.channel.send(`You've opened... ${openableScores}`);
	}

	@requiresMinion
	@minionNotBusy
	async unequipall(msg: KlasaMessage, [gearType]: [string]) {
		return unEquipAllCommand(msg, gearType as GearSetupType);
	}
}
