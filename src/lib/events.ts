import { channelIsSendable, mentionCommand } from '@oldschoolgg/toolkit';
import { UserError } from '@oldschoolgg/toolkit';
import { type BaseMessageOptions, type Message, bold, time } from 'discord.js';
import { Time, isFunction } from 'e';
import { minionStatusCommand } from '../mahoji/lib/abstracted_commands/minionStatusCommand';
import { getGuthixianCacheInterval, userHasDoneCurrentGuthixianCache } from './bso/guthixianCache';
import { Emoji, globalConfig } from './constants';
import { DOUBLE_LOOT_FINISH_TIME_CACHE, isDoubleLootActive } from './doubleLoot';

import { formatDuration, toKMB } from './util';
import { logError } from './util/logError';
import { makeBankImage } from './util/makeBankImage';
import { minionStatsEmbed } from './util/minionStatsEmbed';

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
	},
	{
		name: 'Balthazars Big Bonanza',
		timeStamp: (user: MUser) => Number(user.user.last_bonanza_date),
		cd: Time.Day * 7,
		command: ['bsominigames', 'balthazars_big_bonanza', 'start']
	}
];

interface MentionCommandOptions {
	msg: Message;
	user: MUser;
	components: BaseMessageOptions['components'];
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
		name: 'bal',
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
		name: 'bank',
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
		name: 'cd',
		aliases: ['cd'],
		description: 'Shows your cooldowns.',
		run: async ({ msg, user, components }: MentionCommandOptions) => {
			const stats = await user.fetchStats({ last_daily_timestamp: true, last_tears_of_guthix_timestamp: true });
			let content = cooldownTimers
				.map(cd => {
					const lastDone = cd.timeStamp(user, stats);
					const difference = Date.now() - lastDone;
					const cooldown = isFunction(cd.cd) ? cd.cd(user) : cd.cd;
					if (difference < cooldown) {
						const durationRemaining = formatDuration(Date.now() - (lastDone + cooldown));
						return `${cd.name}: ${durationRemaining}`;
					}
					return bold(
						`${cd.name}: Ready ${mentionCommand(globalClient, cd.command[0], cd.command[1], cd.command[2])}`
					);
				})
				.join('\n');

			const currentGuthixCacheInterval = getGuthixianCacheInterval();
			content += '\n';
			if (await userHasDoneCurrentGuthixianCache(user)) {
				content += `Guthixian Cache: ${currentGuthixCacheInterval.nextResetStr}`;
			} else {
				content += bold(
					`Guthixian Cache: Ready ${mentionCommand(globalClient, 'bsominigames', 'guthixian_cache', 'join')}`
				);
			}

			if (isDoubleLootActive()) {
				const date = new Date(DOUBLE_LOOT_FINISH_TIME_CACHE);
				content += `\n\n2️⃣🇽 **Double Loot is Active until ${time(date)} (${time(date, 'R')})**`;
			}
			msg.reply({
				content,
				components
			});
		}
	},
	{
		name: 's',
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
