import { channelIsSendable, mentionCommand } from '@oldschoolgg/toolkit/util';
import type { BaseMessageOptions, Message, TextChannel } from 'discord.js';
import { ButtonBuilder, ButtonStyle, EmbedBuilder, bold } from 'discord.js';
import { Time, isFunction, roll } from 'e';
import { LRUCache } from 'lru-cache';
import { Items } from 'oldschooljs';

import { UserError } from '@oldschoolgg/toolkit/structures';
import { command_name_enum } from '@prisma/client';
import { SupportServer, production } from '../config';
import { untrustedGuildSettingsCache } from '../mahoji/guildSettings';
import { minionStatusCommand } from '../mahoji/lib/abstracted_commands/minionStatusCommand';
import { BitField, Channel, Emoji, globalConfig } from './constants';
import pets from './data/pets';
import type { ItemBank } from './types';
import { formatDuration, makeComponents, toKMB } from './util';
import { logError } from './util/logError';
import { makeBankImage } from './util/makeBankImage';
import { minionStatsEmbed } from './util/minionStatsEmbed';

const rareRolesSrc: [string, number, string][] = [
	['670211706907000842', 250, 'Bronze'],
	['706511231242076253', 1000, 'Xerician'],
	['670211798091300864', 2500, 'Iron'],
	['688563471096348771', 5000, 'Steel'],
	['705987772372221984', 7500, 'Void'],
	['688563333464457304', 10_000, 'Mithril'],
	['688563389185917072', 15_000, 'Adamant'],
	['705988547202515016', 20_000, "Inquisitor's"],
	['670212713258942467', 25_000, 'Rune'],
	['705988292646141983', 30_000, 'Obsidian'],
	['706512132899995648', 40_000, 'Crystal'],
	['670212821484568577', 50_000, 'Dragon'],
	['706508079184871446', 60_000, 'Bandos'],
	['706512315805204502', 65_000, 'Armadyl'],
	['688563635873644576', 75_000, 'Barrows'],
	['705988130401943643', 80_000, 'Ancestral'],
	['706510440452194324', 85_000, "Dagon'hai"],
	['706510238643388476', 90_000, 'Lunar'],
	['688563780686446649', 100_000, 'Justiciar'],
	['670212876832735244', 1_000_000, 'Third Age']
];

const userCache = new LRUCache<string, number>({ max: 1000 });
function rareRoles(msg: Message) {
	if (!globalConfig.isProduction) return;

	if (!msg.guild || msg.guild.id !== SupportServer) {
		return;
	}

	const lastMessage = userCache.get(msg.author.id) ?? 1;
	if (Date.now() - lastMessage < Time.Second * 13) return;
	userCache.set(msg.author.id, Date.now());

	if (!roll(10)) return;

	for (const [roleID, chance, name] of rareRolesSrc) {
		if (roll(chance / 10)) {
			if (msg.member?.roles.cache.has(roleID)) continue;
			if (!production && msg.channel.isSendable()) {
				return msg.channel.send(`${msg.author}, you would've gotten the **${name}** role.`);
			}
			msg.member?.roles.add(roleID);
			msg.react(Emoji.Gift);

			const channel = globalClient.channels.cache.get(Channel.Notifications);

			if (
				!rareRolesSrc
					.slice(0, 3)
					.map(i => i[2])
					.includes(name)
			) {
				(channel as TextChannel).send(
					`${Emoji.Fireworks} **${msg.author.username}** just received the **${name}** role. `
				);
			}
			break;
		}
	}
}

const petCache = new LRUCache<string, number>({ max: 2000 });
async function petMessages(msg: Message) {
	if (!msg.guild) return;
	const cachedSettings = untrustedGuildSettingsCache.get(msg.guild.id);
	if (!cachedSettings?.petchannel) return;

	const key = `${msg.author.id}.${msg.guild.id}`;
	// If they sent a message in this server in the past 1.5 mins, return.
	const lastMessage = petCache.get(key) ?? 1;
	if (Date.now() - lastMessage < 80_000) return;
	petCache.set(key, Date.now());

	const pet = pets[Math.floor(Math.random() * pets.length)];
	if (roll(Math.max(Math.min(pet.chance, 250_000), 1000))) {
		const user = await mUserFetch(msg.author.id);
		const userPets = user.user.pets as ItemBank;
		const newUserPets = { ...userPets };
		if (!newUserPets[pet.id]) newUserPets[pet.id] = 1;
		else newUserPets[pet.id]++;
		await user.update({
			pets: { ...newUserPets }
		});
		if (!channelIsSendable(msg.channel)) return;
		if (userPets[pet.id] > 1) {
			msg.channel.send(`${msg.author} has a funny feeling like they would have been followed. ${pet.emoji}`);
		} else {
			msg.channel.send(`You have a funny feeling like you’re being followed, ${msg.author} ${pet.emoji}
Type \`/tools user mypets\` to see your pets.`);
		}
	}
}

const mentionText = `<@${globalConfig.clientID}>`;
const mentionRegex = new RegExp(`^(\\s*<@&?[0-9]+>)*\\s*<@${globalConfig.clientID}>\\s*(<@&?[0-9]+>\\s*)*$`);

const cooldownTimers: {
	name: string;
	timeStamp: (user: MUser, stats: { last_daily_timestamp: bigint; last_tears_of_guthix_timestamp: bigint }) => number;
	cd: number | ((user: MUser) => number);
	command: [string] | [string, string] | [string, string, string];
}[] = [
	{
		name: 'Tears of Guthix',
		timeStamp: (_, stats) => Number(stats.last_tears_of_guthix_timestamp),
		cd: Time.Day * 7,
		command: ['minigames', 'tears_of_guthix', 'start']
	},
	{
		name: 'Daily',
		timeStamp: (_, stats) => Number(stats.last_daily_timestamp),
		cd: Time.Hour * 12,
		command: ['minion', 'daily']
	}
];

interface MentionCommandOptions {
	msg: Message;
	user: MUser;
	components: BaseMessageOptions['components'];
	content: string;
}
interface MentionCommand {
	name: command_name_enum;
	aliases: string[];
	description: string;
	run: (options: MentionCommandOptions) => Promise<unknown>;
}

const mentionCommands: MentionCommand[] = [
	{
		name: command_name_enum.bs,
		aliases: ['bs'],
		description: 'Searches your bank.',
		run: async ({ msg, user, components, content }: MentionCommandOptions) => {
			return msg.reply({
				files: [
					(
						await makeBankImage({
							bank: user.bankWithGP.filter(i => i.name.toLowerCase().includes(content.toLowerCase())),
							title: 'Your Bank',
							user
						})
					).file.attachment
				],
				components
			});
		}
	},
	{
		name: command_name_enum.bal,
		aliases: ['bal', 'gp'],
		description: 'Shows how much GP you have.',
		run: async ({ msg, user, components }: MentionCommandOptions) => {
			return msg.reply({
				content: `${Emoji.MoneyBag} You have ${toKMB(user.GP)} (${user.GP.toLocaleString()}) GP.`,
				components
			});
		}
	},
	{
		name: command_name_enum.is,
		aliases: ['is'],
		description: 'Searches for items.',
		run: async ({ msg, components, user, content }: MentionCommandOptions) => {
			const items = Items.filter(i =>
				[i.id.toString(), i.name.toLowerCase()].includes(content.toLowerCase())
			).array();
			if (items.length === 0) return msg.reply('No results for that item.');

			const gettedItem = items[0];
			const { sacrificed_bank: sacrificedBank } = await user.fetchStats({ sacrificed_bank: true });

			let str = `Found ${items.length} items:\n${items
				.slice(0, 5)
				.map((item, index) => {
					const icons = [];

					if (user.cl.has(item.id)) icons.push(Emoji.CollectionLog);
					if (user.bank.has(item.id)) icons.push(Emoji.Bank);
					if (((sacrificedBank as ItemBank)[item.id] ?? 0) > 0) icons.push(Emoji.Incinerator);

					const price = toKMB(Math.floor(item.price));

					let str = `${index + 1}. ${item.name} ID[${item.id}] Price[${price}] ${
						item.tradeable ? 'Tradeable' : 'Untradeable'
					} [Wiki Page](${item.wiki_url}) ${icons.join(' ')}`;
					if (gettedItem.id === item.id) {
						str = bold(str);
					}

					return str;
				})
				.join('\n')}`;

			if (items.length > 5) {
				str += `\n...and ${items.length - 5} others`;
			}

			return msg.reply({ embeds: [new EmbedBuilder().setDescription(str)], components });
		}
	},
	{
		name: command_name_enum.bank,
		aliases: ['b', 'bank'],
		description: 'Shows your bank.',
		run: async ({ msg, user, components }: MentionCommandOptions) => {
			return msg.reply({
				files: [
					(
						await makeBankImage({
							bank: user.bankWithGP,
							title: 'Your Bank',
							user,
							flags: {
								page: 0
							}
						})
					).file.attachment
				],
				components
			});
		}
	},
	{
		name: command_name_enum.cd,
		aliases: ['cd'],
		description: 'Shows your cooldowns.',
		run: async ({ msg, user, components }: MentionCommandOptions) => {
			const stats = await user.fetchStats({ last_daily_timestamp: true, last_tears_of_guthix_timestamp: true });
			return msg.reply({
				content: cooldownTimers
					.map(cd => {
						const lastDone = cd.timeStamp(user, stats);
						const difference = Date.now() - lastDone;
						const cooldown = isFunction(cd.cd) ? cd.cd(user) : cd.cd;
						if (difference < cooldown) {
							const durationRemaining = formatDuration(Date.now() - (lastDone + cooldown));
							return `${cd.name}: ${durationRemaining}`;
						}
						return bold(
							`${cd.name}: Ready ${mentionCommand(
								globalClient,
								cd.command[0],
								cd.command[1],
								cd.command[2]
							)}`
						);
					})
					.join('\n'),
				components
			});
		}
	},
	{
		name: command_name_enum.sendtoabutton,
		aliases: ['sendtoabutton'],
		description: 'Shows your stats.',
		run: async ({ msg, user }: MentionCommandOptions) => {
			if ([BitField.isModerator].every(bit => !user.bitfield.includes(bit))) {
				return;
			}
			return msg.reply({
				content: `Click this button to find out if you're ready to do Tombs of Amascut! You can also use the ${mentionCommand(
					globalClient,
					'raid',
					'toa',
					'help'
				)} command.`,
				components: makeComponents([
					new ButtonBuilder()
						.setStyle(ButtonStyle.Primary)
						.setCustomId('TOA_CHECK')
						.setLabel('Check TOA Requirements')
						.setEmoji('1069174271894638652')
				])
			});
		}
	},
	{
		name: command_name_enum.stats,
		aliases: ['s', 'stats'],
		description: 'Shows your stats.',
		run: async ({ msg, user, components }: MentionCommandOptions) => {
			return msg.reply({
				embeds: [await minionStatsEmbed(user)],
				components
			});
		}
	}
];

export async function onMessage(msg: Message) {
	rareRoles(msg);
	petMessages(msg);
	if (!msg.content || msg.author.bot || !channelIsSendable(msg.channel)) return;
	const content = msg.content.trim();
	if (!content.includes(mentionText)) return;
	const user = await mUserFetch(msg.author.id);
	const result = await minionStatusCommand(user);
	const { components } = result;

	const command = mentionCommands.find(i =>
		i.aliases.some(alias => msg.content.startsWith(`${mentionText} ${alias}`))
	);
	if (command) {
		const msgContentWithoutCommand = msg.content.split(' ').slice(2).join(' ');
		await prisma.commandUsage.create({
			data: {
				user_id: BigInt(user.id),
				channel_id: BigInt(msg.channelId),
				guild_id: msg.guildId ? BigInt(msg.guildId) : undefined,
				command_name: command.name,
				args: msgContentWithoutCommand,
				inhibited: false,
				is_mention_command: true
			}
		});

		try {
			await command.run({ msg, user, components, content: msgContentWithoutCommand });
		} catch (err) {
			if (typeof err === 'string') return msg.reply(err);
			if (err instanceof UserError) return msg.reply(err.message);
			logError(err);
		}
		return;
	}

	if (content.match(mentionRegex)) {
		return msg.reply({
			content: result.content,
			components
		});
	}
}
