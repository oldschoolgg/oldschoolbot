import { Embed } from '@discordjs/builders';
import { bold, Message, MessageOptions, TextChannel } from 'discord.js';
import { roll, Time } from 'e';
import LRUCache from 'lru-cache';
import { Items } from 'oldschooljs';

import { CLIENT_ID, production, SupportServer } from '../config';
import { minionStatusCommand } from '../mahoji/lib/abstracted_commands/minionStatusCommand';
import { untrustedGuildSettingsCache } from '../mahoji/mahojiSettings';
import { Channel, Emoji } from './constants';
import pets from './data/pets';
import { prisma } from './settings/prisma';
import { ItemBank } from './types';
import { channelIsSendable, formatDuration, isFunction, toKMB } from './util';
import { makeBankImage } from './util/makeBankImage';

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
			if (!production) {
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

const petCache = new LRUCache<string, number>({ max: 1000 });
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

const mentionText = `<@${CLIENT_ID}>`;

const cooldownTimers = [
	{
		name: 'Tears of Guthix',
		timeStamp: (user: MUser) => Number(user.user.lastTearsOfGuthixTimestamp),
		cd: Time.Day * 7
	},
	{
		name: 'Daily',
		timeStamp: (user: MUser) => Number(user.user.lastDailyTimestamp),
		cd: Time.Hour * 12
	}
];

interface MentionCommandOptions {
	msg: Message;
	user: MUser;
	components: MessageOptions['components'];
	content: string;
}
interface MentionCommand {
	name: string;
	aliases: string[];
	description: string;
	run: (options: MentionCommandOptions) => Promise<unknown>;
}

const mentionCommands: MentionCommand[] = [
	{
		name: 'bs',
		aliases: ['bs'],
		description: 'Searches your bank.',
		run: async ({ msg, user, components, content }: MentionCommandOptions) => {
			msg.reply({
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
		name: 'bal',
		aliases: ['bal', 'gp'],
		description: 'Shows how much GP you have.',
		run: async ({ msg, user, components }: MentionCommandOptions) => {
			msg.reply({
				content: `${Emoji.MoneyBag} You have ${toKMB(user.GP)} (${user.GP.toLocaleString()}) GP.`,
				components
			});
		}
	},
	{
		name: 'is',
		aliases: ['is'],
		description: 'Searches for items.',
		run: async ({ msg, components, user, content }: MentionCommandOptions) => {
			const items = Items.filter(i =>
				[i.id.toString(), i.name.toLowerCase()].includes(content.toLowerCase())
			).array();
			if (items.length === 0) return msg.reply('No results for that item.');

			const gettedItem = items[0];

			let str = `Found ${items.length} items:\n${items
				.slice(0, 5)
				.map((item, index) => {
					const icons = [];

					if (user.cl.has(item.id)) icons.push(Emoji.CollectionLog);
					if (user.bank.has(item.id)) icons.push(Emoji.Bank);
					if (user.sacrificedItems.has(item.id)) icons.push(Emoji.Incinerator);

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

			return msg.reply({ embeds: [new Embed().setDescription(str)], components });
		}
	},
	{
		name: 'bank',
		aliases: ['b', 'bank'],
		description: 'Shows your bank.',
		run: async ({ msg, user, components }: MentionCommandOptions) => {
			msg.reply({
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
		name: 'cd',
		aliases: ['cd'],
		description: 'Shows your cooldowns.',
		run: async ({ msg, user, components }: MentionCommandOptions) => {
			msg.reply({
				content: cooldownTimers
					.map(cd => {
						const lastDone = cd.timeStamp(user);
						const difference = Date.now() - lastDone;
						const cooldown = isFunction(cd.cd) ? cd.cd(user) : cd.cd;
						if (difference < cooldown) {
							const durationRemaining = formatDuration(Date.now() - (lastDone + cooldown));
							return `${cd.name}: ${durationRemaining}`;
						}
						return bold(`${cd.name}: Ready`);
					})
					.join('\n'),
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
				flags: undefined,
				inhibited: false,
				is_mention_command: true
			}
		});
		await command.run({ msg, user, components, content: msgContentWithoutCommand });
		return;
	}

	msg.reply({
		content: result.content,
		components
	});
}
