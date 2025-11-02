import { bold, dateFm, EmbedBuilder } from '@oldschoolgg/discord';
import { MathRNG, roll } from '@oldschoolgg/rng';
import type { IMessage } from '@oldschoolgg/schemas';
import { Emoji, Events, getNextUTCReset, isFunction, Time, UserError } from '@oldschoolgg/toolkit';
import { type ItemBank, Items, toKMB } from 'oldschooljs';

import type { command_name_enum } from '@/prisma/main/enums.js';
import {
	CHAT_PET_COOLDOWN_CACHE,
	lastRoboChimpSyncCache,
	RARE_ROLES_CACHE,
	untrustedGuildSettingsCache
} from '@/lib/cache.js';
import { globalConfig } from '@/lib/constants.js';
import pets from '@/lib/data/pets.js';
import { mentionCommand } from '@/lib/discord/utils.js';
import { roboChimpSyncData } from '@/lib/roboChimp.js';
import type { ActivityTaskData } from '@/lib/types/minions.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';
import { minionStatsEmbed } from '@/lib/util/minionStatsEmbed.js';
import { minionStatusCommand } from '@/mahoji/lib/abstracted_commands/minionStatusCommand.js';

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

async function rareRoles(msg: IMessage) {
	if (!globalConfig.isProduction) return;

	if (msg.guild_id !== globalConfig.supportServerID) {
		return;
	}

	const lastMessage = RARE_ROLES_CACHE.get(msg.author_id) ?? 1;
	if (Date.now() - lastMessage < Time.Second * 13) return;
	RARE_ROLES_CACHE.set(msg.author_id, Date.now());

	if (!roll(10) || !msg.guild_id) return;

	for (const [roleID, chance, name] of rareRolesSrc) {
		if (roll(chance / 10)) {
			const member = await Cache.getMainServerMember(msg.author_id);
			if (!member || member.roles.includes(roleID)) continue;
			await globalClient.giveRole(msg.guild_id, msg.author_id, roleID);
			await globalClient.reactToMsg({
				channelId: msg.channel_id,
				messageId: msg.id,
				emojiId: 'Gift'
			});

			if (
				!rareRolesSrc
					.slice(0, 3)
					.map(i => i[2])
					.includes(name)
			) {
				const username = await Cache.getBadgedUsername(msg.author_id);
				globalClient.emit(
					Events.ServerNotification,
					`${Emoji.Fireworks} **${username}** just received the **${name}** role. `
				);
			}
			break;
		}
	}
}

async function petMessages(msg: IMessage) {
	if (!msg.guild_id) return;
	const cachedSettings = untrustedGuildSettingsCache.get(msg.guild_id);
	if (!cachedSettings?.petchannel) return;

	const key = `${msg.author.id}.${msg.guild_id}`;
	// If they sent a message in this server in the past 1.5 mins, return.
	const lastMessage = CHAT_PET_COOLDOWN_CACHE.get(key) ?? 1;
	if (Date.now() - lastMessage < 80_000) return;
	CHAT_PET_COOLDOWN_CACHE.set(key, Date.now());

	const pet = MathRNG.pick(pets);
	if (MathRNG.roll(Math.max(Math.min(pet.chance, 250_000), 1000))) {
		Logging.logDebug(`${msg.author.id} triggered a pet message`);
		const user = await mUserFetch(msg.author.id);
		const { isNewPet } = await user.giveBotMessagePet(pet);
		await globalClient.sendMessage(
			msg.channel_id,
			isNewPet
				? `You have a funny feeling like you’re being followed, ${msg.author} ${pet.emoji}
Type \`/tools user mypets\` to see your pets.`
				: `${msg.author} has a funny feeling like they would have been followed. ${pet.emoji}`
		);
	}
}

const mentionText = `<@${globalConfig.clientID}>`;
const mentionRegex = new RegExp(`^(\\s*<@&?[0-9]+>)*\\s*<@${globalConfig.clientID}>\\s*(<@&?[0-9]+>\\s*)*$`);

export const TEARS_OF_GUTHIX_CD = Time.Day * 7;

const cooldownTimers: {
	name: string;
	timeStamp: (user: MUser, stats: { last_daily_timestamp: bigint; last_tears_of_guthix_timestamp: bigint }) => number;
	cd: number | ((user: MUser) => number);
	command: [string] | [string, string] | [string, string, string];
	utcReset: boolean;
}[] = [
	{
		name: 'Tears of Guthix',
		timeStamp: (_, stats) => Number(stats.last_tears_of_guthix_timestamp),
		cd: TEARS_OF_GUTHIX_CD,
		command: ['minigames', 'tears_of_guthix', 'start'],
		utcReset: true
	},
	{
		name: 'Daily',
		timeStamp: (_, stats) => Number(stats.last_daily_timestamp),
		cd: Time.Hour * 12,
		command: ['minion', 'daily'],
		utcReset: false
	}
];

interface MentionCommandOptions {
	user: MUser;
	components: BaseSendableMessage['components'];
	content: string;
}
interface MentionCommand {
	name: command_name_enum;
	aliases: string[];
	description: string;
	run: (options: MentionCommandOptions) => Promise<SendableMessage>;
}

const mentionCommands: MentionCommand[] = [
	{
		name: 'bs',
		aliases: ['bs'],
		description: 'Searches your bank.',
		run: async ({ user, components, content }: MentionCommandOptions) => {
			return {
				files: [
					await makeBankImage({
						bank: user.bankWithGP.filter(i => i.name.toLowerCase().includes(content.toLowerCase())),
						title: 'Your Bank',
						user
					})
				],
				components
			};
		}
	},
	{
		name: 'bal',
		aliases: ['bal', 'gp'],
		description: 'Shows how much GP you have.',
		run: async ({ user, components }: MentionCommandOptions) => {
			return {
				content: `${Emoji.MoneyBag} You have ${toKMB(user.GP)} (${user.GP.toLocaleString()}) GP.`,
				components
			};
		}
	},
	{
		name: 'is',
		aliases: ['is'],
		description: 'Searches for items.',
		run: async ({ components, user, content }: MentionCommandOptions) => {
			const items = Items.filter(i =>
				[i.id.toString(), i.name.toLowerCase()].includes(content.toLowerCase())
			).array();
			if (items.length === 0) return { content: 'No results for that item.' };

			const gettedItem = items[0];
			const { sacrificed_bank: sacrificedBank } = await user.fetchStats();

			let str = `Found ${items.length} items:\n${items
				.slice(0, 5)
				.map((item, index) => {
					const icons = [];

					if (user.cl.has(item.id)) icons.push(Emoji.CollectionLog);
					if (user.bank.has(item.id)) icons.push(Emoji.Bank);
					if (((sacrificedBank as ItemBank)[item.id] ?? 0) > 0) icons.push(Emoji.Incinerator);

					const price = toKMB(Math.floor(item.price ?? 0));

					let str = `${index + 1}. ${item.name} ID[${item.id}] Price[${price}] ${
						item.tradeable ? 'Tradeable' : 'Untradeable'
					} ${icons.join(' ')}`;
					if (gettedItem.id === item.id) {
						str = bold(str);
					}

					return str;
				})
				.join('\n')}`;

			if (items.length > 5) {
				str += `\n...and ${items.length - 5} others`;
			}

			return { embeds: [new EmbedBuilder().setDescription(str)], components };
		}
	},
	{
		name: 'bank',
		aliases: ['b', 'bank'],
		description: 'Shows your bank.',
		run: async ({ user, components }: MentionCommandOptions) => {
			return {
				files: [
					await makeBankImage({
						bank: user.bankWithGP,
						title: 'Your Bank',
						user,
						flags: {
							page: 0
						}
					})
				],
				components
			};
		}
	},
	{
		name: 'cd',
		aliases: ['cd'],
		description: 'Shows your cooldowns.',
		run: async ({ user, components }: MentionCommandOptions) => {
			const stats = await user.fetchStats();
			return {
				content: cooldownTimers
					.map(cd => {
						const lastDone = cd.timeStamp(user, stats);
						const cooldown = isFunction(cd.cd) ? cd.cd(user) : cd.cd;
						const nextReset = cd.utcReset ? getNextUTCReset(lastDone, cooldown) : lastDone + cooldown;

						if (Date.now() < nextReset) {
							const durationRemaining = dateFm(new Date(nextReset));
							return `${cd.name}: ${durationRemaining}`;
						}
						return bold(`${cd.name}: Ready ${mentionCommand(cd.command[0], cd.command[1], cd.command[2])}`);
					})
					.join('\n'),
				components
			};
		}
	},
	{
		name: 'stats',
		aliases: ['s', 'stats'],
		description: 'Shows your stats.',
		run: async ({ user, components }: MentionCommandOptions) => {
			return {
				embeds: [await minionStatsEmbed(user)],
				components
			};
		}
	}
];

export async function onMessage(msg: IMessage) {
	rareRoles(msg);
	petMessages(msg);
	// TODO: channelIsSendable(msg.channel
	if (!msg.content || msg.author.bot) return;
	const content = msg.content.trim();
	if (!content.includes(mentionText)) return;
	const user = await mUserFetch(msg.author.id);
	const result = await minionStatusCommand(user);

	const command = mentionCommands.find(i =>
		i.aliases.some(alias => msg.content.startsWith(`${mentionText} ${alias}`))
	);
	if (command) {
		Logging.logDebug(`${msg.author.id} used the ${command.name} mention command`);
		const msgContentWithoutCommand = msg.content.split(' ').slice(2).join(' ');
		await prisma.commandUsage.create({
			data: {
				user_id: BigInt(user.id),
				channel_id: BigInt(msg.channel_id),
				guild_id: msg.guild_id ? BigInt(msg.guild_id) : undefined,
				command_name: command.name,
				args: msgContentWithoutCommand,
				inhibited: false,
				is_mention_command: true
			}
		});

		try {
			const response = await command.run({
				user,
				components: result.components,
				content: msgContentWithoutCommand
			});
			return globalClient.replyToMessage(msg, response);
		} catch (err) {
			if (typeof err === 'string') return globalClient.replyToMessage(msg, err);
			if (err instanceof UserError) return globalClient.replyToMessage(msg, err.message);
			Logging.logError(err as Error);
		}
		return;
	}

	if (content.match(mentionRegex)) {
		return globalClient.replyToMessage(msg, {
			content: result.content,
			components: result.components
		});
	}
}

export async function onMinionActivityFinish(activity: ActivityTaskData) {
	try {
		const lastSyncTime = lastRoboChimpSyncCache.get(activity.userID) ?? 0;
		const hasBeen30MinsSinceLast = Date.now() - lastSyncTime > Time.Minute * 30;
		const botJustStarted = process.uptime() < 60 * 10;
		// Max once per 30 minutes
		if (!botJustStarted && hasBeen30MinsSinceLast) {
			lastRoboChimpSyncCache.set(activity.userID, Date.now());
			Logging.logDebug(`Syncing RoboChimp for user ${activity.userID}`);
			await roboChimpSyncData(await mUserFetch(activity.userID));
		}
	} catch (err) {
		Logging.logError(err as Error, { activity: JSON.stringify(activity) });
	}
}
