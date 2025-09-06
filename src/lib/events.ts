import { Emoji } from '@oldschoolgg/toolkit/constants';
import { channelIsSendable, mentionCommand } from '@oldschoolgg/toolkit/discord-util';
import { UserError } from '@oldschoolgg/toolkit/structures';
import { command_name_enum } from '@prisma/client';
import { type BaseMessageOptions, EmbedBuilder, type Message, bold, time } from 'discord.js';
import { Time, isFunction } from 'e';
import { type ItemBank, Items, toKMB } from 'oldschooljs';

import { dateFm, getNextUTCReset } from '@oldschoolgg/toolkit/util';
import { PATRON_DOUBLE_LOOT_COOLDOWN } from '../mahoji/commands/tools';
import { Cooldowns } from '../mahoji/lib/Cooldowns';
import { minionStatusCommand } from '../mahoji/lib/abstracted_commands/minionStatusCommand';
import { giveBoxResetTime, itemContractResetTime, spawnLampResetTime } from './MUser';
import { boxSpawnHandler } from './boxSpawns';
import { getGuthixianCacheInterval, userHasDoneCurrentGuthixianCache } from './bso/guthixianCache';
import { allIronmanMbTables, allMbTables } from './bsoOpenables';
import { globalConfig } from './constants';
import { customItems } from './customItems/util';
import { DOUBLE_LOOT_FINISH_TIME_CACHE, isDoubleLootActive } from './doubleLoot';
import { logError } from './util/logError';
import { makeBankImage } from './util/makeBankImage';
import { minionStatsEmbed } from './util/minionStatsEmbed';

const mentionText = `<@${globalConfig.clientID}>`;
const mentionRegex = new RegExp(`^(\\s*<@&?[0-9]+>)*\\s*<@${globalConfig.clientID}>\\s*(<@&?[0-9]+>\\s*)*$`);

export const tears_of_guthix_cd = Time.Day * 7;

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
		cd: tears_of_guthix_cd,
		command: ['minigames', 'tears_of_guthix', 'start'],
		utcReset: true
	},
	{
		name: 'Daily',
		timeStamp: (_, stats) => Number(stats.last_daily_timestamp),
		cd: Time.Hour * 12,
		command: ['minion', 'daily'],
		utcReset: false
	},
	{
		name: 'Spawn Lamp',
		timeStamp: (user: MUser) => Number(user.user.lastSpawnLamp),
		cd: (user: MUser) => spawnLampResetTime(user),
		command: ['tools', 'patron', 'spawnlamp'],
		utcReset: false
	},
	{
		name: 'Spawn Box',
		timeStamp: (user: MUser) => Cooldowns.cooldownMap.get(user.id)?.get('SPAWN_BOX') ?? 0,
		cd: Time.Minute * 45,
		command: ['tools', 'patron', 'spawnbox'],
		utcReset: false
	},
	{
		name: 'Give Box',
		timeStamp: (user: MUser) => Number(user.user.lastGivenBoxx),
		cd: giveBoxResetTime,
		command: ['tools', 'patron', 'give_box'],
		utcReset: false
	},
	{
		name: 'Item Contract',
		timeStamp: (user: MUser) => Number(user.user.last_item_contract_date),
		cd: itemContractResetTime,
		command: ['ic', 'info'],
		utcReset: false
	},
	{
		name: 'Monthly Double Loot',
		timeStamp: (user: MUser) => Number(user.user.last_patron_double_time_trigger),
		cd: PATRON_DOUBLE_LOOT_COOLDOWN,
		command: ['tools', 'patron', 'doubleloot'],
		utcReset: false
	},
	{
		name: 'Balthazars Big Bonanza',
		timeStamp: (user: MUser) => Number(user.user.last_bonanza_date),
		cd: Time.Day * 7,
		command: ['bsominigames', 'balthazars_big_bonanza', 'start'],
		utcReset: false
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
			const items = Items.filter(
				i =>
					[i.id.toString(), i.name.toLowerCase()].includes(content.toLowerCase()) &&
					!i.customItemData?.isSecret
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
					const isCustom = customItems.includes(item.id);
					if (isCustom) icons.push(Emoji.BSO);
					if (((sacrificedBank as ItemBank)[item.id] ?? 0) > 0) icons.push(Emoji.Incinerator);

					const price = toKMB(Math.floor(item.price ?? 0));
					const searchMbTable = user.isIronman ? allIronmanMbTables : allMbTables;
					let str = `${index + 1}. ${item.name} ID[${item.id}] Price[${price}] ${
						searchMbTable.includes(item.id) ? Emoji.MysteryBox : ''
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

			let content = cooldownTimers
				.map(cd => {
					const lastDone = cd.timeStamp(user, stats);
					const cooldown = isFunction(cd.cd) ? cd.cd(user) : cd.cd;
					const nextReset = cd.utcReset ? getNextUTCReset(lastDone, cooldown) : lastDone + cooldown;

					if (Date.now() < nextReset) {
						const durationRemaining = dateFm(new Date(nextReset));
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

			return msg.reply({
				content,
				components
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
	boxSpawnHandler(msg);
	if (!msg.content || msg.author.bot || !channelIsSendable(msg.channel)) return;
	const content = msg.content.trim();
	if (!content.includes(mentionText)) return;
	const user = await mUserFetch(msg.author.id);
	const result = await minionStatusCommand(user, msg.channelId);
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
