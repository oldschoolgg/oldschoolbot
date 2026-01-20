import { boxSpawnHandler } from '@/lib/bso/boxSpawns.js';
import { giveBoxResetTime, itemContractResetTime, spawnLampResetTime } from '@/lib/bso/bsoConstants.js';
import { DOUBLE_LOOT_FINISH_TIME_CACHE, isDoubleLootActive } from '@/lib/bso/doubleLoot.js';
import { getGuthixianCacheInterval, userHasDoneCurrentGuthixianCache } from '@/lib/bso/minigames/guthixianCache.js';
import { allIronmanMbTables, allMbTables } from '@/lib/bso/openables/mysteryBoxes.js';

import { bold, dateFm, EmbedBuilder, time } from '@oldschoolgg/discord';
import type { IMessage } from '@oldschoolgg/schemas';
import { Emoji, getNextUTCReset, isFunction, type PerkTier, Time } from '@oldschoolgg/toolkit';
import { type ItemBank, Items, toKMB } from 'oldschooljs';

import type { command_name_enum } from '@/prisma/main.js';
import { mentionCommand } from '@/discord/utils.js';
import { lastRoboChimpSyncCache } from '@/lib/cache.js';
import { CONSTANTS, globalConfig } from '@/lib/constants.js';
import { customItems } from '@/lib/customItems/util.js';
import { roboChimpSyncData } from '@/lib/roboChimp.js';
import type { ActivityTaskData } from '@/lib/types/minions.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';
import { minionStatsEmbed } from '@/lib/util/minionStatsEmbed.js';
import { PATRON_DOUBLE_LOOT_COOLDOWN } from '@/mahoji/commands/tools.js';
import { minionStatusCommand } from '@/mahoji/lib/abstracted_commands/minionStatusCommand.js';

const mentionText = `<@${globalConfig.clientID}>`;
const mentionRegex = new RegExp(`^(\\s*<@&?[0-9]+>)*\\s*<@${globalConfig.clientID}>\\s*(<@&?[0-9]+>\\s*)*$`);

interface CooldownFnParams {
	user: MUser;
	perkTier: PerkTier | 0;
}

const cooldownTimers: {
	name: string;
	timeStamp: (user: MUser, stats: { last_daily_timestamp: bigint; last_tears_of_guthix_timestamp: bigint }) => number;
	cd: number | ((args: CooldownFnParams) => number);
	command: [string] | [string, string] | [string, string, string];
	utcReset: boolean;
}[] = [
	{
		name: 'Tears of Guthix',
		timeStamp: (_, stats) => Number(stats.last_tears_of_guthix_timestamp),
		cd: CONSTANTS.TEARS_OF_GUTHIX_CD,
		command: ['minigames', 'tears_of_guthix', 'start'],
		utcReset: true
	},
	{
		name: 'Daily',
		timeStamp: (_, stats) => Number(stats.last_daily_timestamp),
		cd: CONSTANTS.DAILY_COOLDOWN,
		command: ['minion', 'daily'],
		utcReset: false
	},
	{
		name: 'Spawn Lamp',
		timeStamp: (user: MUser) => Number(user.user.lastSpawnLamp),
		cd: ({ user, perkTier }) => spawnLampResetTime(user, perkTier),
		command: ['tools', 'patron', 'spawnlamp'],
		utcReset: false
	},
	{
		name: 'Spawn Box',
		timeStamp: (user: MUser) => Number(user.user.last_spawn_box_date ?? 0),
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
			const items = Items.filter(
				i =>
					[i.id.toString(), i.name.toLowerCase()].includes(content.toLowerCase()) &&
					!i.customItemData?.isSecret
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
			const perkTier = await user.fetchPerkTier();

			let content = cooldownTimers
				.map(cd => {
					const lastDone = cd.timeStamp(user, stats);
					const cooldown = isFunction(cd.cd) ? cd.cd({ user, perkTier }) : cd.cd;
					const nextReset = cd.utcReset ? getNextUTCReset(lastDone, cooldown) : lastDone + cooldown;

					if (Date.now() < nextReset) {
						const durationRemaining = dateFm(new Date(nextReset));
						return `${cd.name}: ${durationRemaining}`;
					}
					return bold(`${cd.name}: Ready ${mentionCommand(cd.command[0], cd.command[1], cd.command[2])}`);
				})
				.join('\n');

			const currentGuthixCacheInterval = getGuthixianCacheInterval();
			content += '\n';
			if (await userHasDoneCurrentGuthixianCache(user)) {
				content += `Guthixian Cache: ${time(currentGuthixCacheInterval.end)}`;
			} else {
				content += bold(`Guthixian Cache: Ready ${mentionCommand('bsominigames', 'guthixian_cache', 'join')}`);
			}

			if (isDoubleLootActive()) {
				const date = new Date(DOUBLE_LOOT_FINISH_TIME_CACHE);
				content += `\n\n2️⃣🇽 **Double Loot is Active until ${time(date)} (${time(date, 'R')})**`;
			}

			return {
				content,
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
	if (!msg.content) return;
	boxSpawnHandler(msg);

	const content = msg.content.trim();
	if (!content.includes(mentionText)) return;

	const sendable = await globalClient.channelIsSendable(msg.channel_id);
	if (!sendable) return;

	const user = await mUserFetch(msg.author_id);
	const result = await minionStatusCommand(user, msg.channel_id);

	const command = mentionCommands.find(i =>
		i.aliases.some(alias => msg.content.startsWith(`${mentionText} ${alias}`))
	);
	if (command) {
		Logging.logDebug(`${msg.author_id} used the ${command.name} mention command`);
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
			await globalClient.replyToMessage(msg, response);
		} catch (err) {
			let errMsg = 'There was an error running that command.';
			if (typeof err === 'string') errMsg = err;
			else if (err instanceof Error) errMsg = err.message;
			await globalClient.replyToMessage(msg, { content: errMsg });
			Logging.logError(err as Error);
		}
		return;
	}

	if (content.match(mentionRegex)) {
		await globalClient.replyToMessage(msg, {
			content: result.content,
			components: result.components
		});
		return;
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
			await roboChimpSyncData(await mUserFetch(activity.userID));
		}
	} catch (err) {
		Logging.logError(err as Error, { activity: JSON.stringify(activity) });
	}
}
