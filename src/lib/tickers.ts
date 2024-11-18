import type { TextChannel } from 'discord.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { Time, noOp, randInt, removeFromArr, shuffleArr } from 'e';

import { TimerManager } from '@sapphire/timer-manager';
import { production } from '../config';
import { userStatsUpdate } from '../mahoji/mahojiSettings';
import { mahojiUserSettingsUpdate } from './MUser';
import { processPendingActivities } from './Task';
import { BitField, Channel, PeakTier } from './constants';
import { GrandExchange } from './grandExchange';
import { collectMetrics } from './metrics';
import { runCommand } from './settings/settings';
import { informationalButtons } from './sharedComponents';
import { getFarmingInfo } from './skilling/functions/getFarmingInfo';
import Farming from './skilling/skills/farming';
import { awaitMessageComponentInteraction, getSupportGuild, makeComponents, stringMatches } from './util';
import { farmingPatchNames, getFarmingKeyFromName } from './util/farmingHelpers';
import { handleGiveawayCompletion } from './util/giveaway';
import { logError } from './util/logError';
import { minionIsBusy } from './util/minionIsBusy';

let lastMessageID: string | null = null;
let lastMessageGEID: string | null = null;
const supportEmbed = new EmbedBuilder()
	.setAuthor({ name: '⚠️ ⚠️ ⚠️ ⚠️ READ THIS ⚠️ ⚠️ ⚠️ ⚠️' })
	.addFields({
		name: '📖 Read the FAQ',
		value: 'The FAQ answers commonly asked questions: https://wiki.oldschool.gg/faq - also make sure to read the other pages of the website, which might contain the information you need.'
	})
	.addFields({
		name: '🔎 Search',
		value: 'Search this channel first, you might find your question has already been asked and answered.'
	})
	.addFields({
		name: '💬 Ask',
		value: "If your question isn't answered in the FAQ, and you can't find it from searching, simply ask your question and wait for someone to answer. If you don't get an answer, you can post your question again."
	})
	.addFields({
		name: '⚠️ Dont ping anyone',
		value: 'Do not ping mods, or any roles/people in here. You will be muted. Ask your question, and wait.'
	});

const geEmbed = new EmbedBuilder()
	.setAuthor({ name: '⚠️ ⚠️ ⚠️ ⚠️ READ THIS ⚠️ ⚠️ ⚠️ ⚠️' })
	.addFields({
		name: "⚠️ Don't get scammed",
		value: 'Beware of people "buying out banks" or buying lots of skilling supplies, which can be worth a lot more in the bot than they pay you. Skilling supplies are often worth a lot more than they are ingame. Don\'t just trust that they\'re giving you a fair price.'
	})
	.addFields({
		name: '🔎 Search',
		value: 'Search this channel first, someone might already be selling/buying what you want.'
	})
	.addFields({
		name: '💬 Read the rules/Pins',
		value: 'Read the pinned rules/instructions before using the channel.'
	})
	.addFields({
		name: 'Keep Ads Short',
		value: 'Keep your ad less than 10 lines long, as short as possible.'
	});

export interface Peak {
	startTime: number;
	finishTime: number;
	peakTier: PeakTier;
}

/**
 * Tickers should idempotent, and be able to run at any time.
 */
export const tickers: {
	name: string;
	startupWait?: number;
	interval: number;
	timer: NodeJS.Timeout | null;
	cb: () => Promise<unknown>;
}[] = [
	{
		name: 'giveaways',
		startupWait: Time.Second * 30,
		interval: Time.Second * 10,
		timer: null,
		cb: async () => {
			const result = await prisma.giveaway.findMany({
				where: {
					completed: false,
					finish_date: {
						lt: new Date()
					}
				}
			});

			await Promise.all(result.map(t => handleGiveawayCompletion(t)));
		}
	},
	{
		name: 'metrics',
		timer: null,
		interval: Time.Minute,
		cb: async () => {
			const data = {
				timestamp: Math.floor(Date.now() / 1000),
				...(await collectMetrics())
			};
			if (Number.isNaN(data.eventLoopDelayMean)) {
				data.eventLoopDelayMean = 0;
			}
			await prisma.metric.create({
				data
			});
		}
	},
	{
		name: 'minion_activities',
		startupWait: Time.Second * 10,
		timer: null,
		interval: production ? Time.Second * 5 : 500,
		cb: async () => {
			await processPendingActivities();
		}
	},
	{
		name: 'daily_reminders',
		interval: Time.Minute * 3,
		startupWait: Time.Minute,
		timer: null,
		cb: async () => {
			const result = await prisma.$queryRawUnsafe<{ id: string; last_daily_timestamp: bigint }[]>(
				`
SELECT users.id, user_stats.last_daily_timestamp
FROM users
JOIN user_stats ON users.id::bigint = user_stats.user_id
WHERE bitfield && '{2,3,4,5,6,7,8,12,21,24}'::int[] AND user_stats."last_daily_timestamp" != -1 AND to_timestamp(user_stats."last_daily_timestamp" / 1000) < now() - INTERVAL '12 hours';
`
			);
			const dailyDMButton = new ButtonBuilder()
				.setCustomId('CLAIM_DAILY')
				.setLabel('Claim Daily')
				.setEmoji('493286312854683654')
				.setStyle(ButtonStyle.Secondary);
			const components = [dailyDMButton];
			const str = 'Your daily is ready!';

			for (const row of result.values()) {
				if (!production) continue;
				if (Number(row.last_daily_timestamp) === -1) continue;

				await userStatsUpdate(
					row.id,
					{
						last_daily_timestamp: -1
					},
					{}
				);
				const user = await globalClient.fetchUser(row.id);
				await user.send({ content: str, components: makeComponents(components) }).catch(noOp);
			}
		}
	},
	{
		name: 'wilderness_peak_times',
		timer: null,
		interval: Time.Hour * 24,
		cb: async () => {
			let hoursUsed = 0;
			let peakInterval: Peak[] = [];
			const peakTiers: PeakTier[] = [PeakTier.High, PeakTier.Medium, PeakTier.Low];

			// Divide the current day into interverals
			for (let i = 0; i <= 10; i++) {
				const randomedTime = randInt(1, 2);
				const [peakTier] = shuffleArr(peakTiers);
				const peak: Peak = {
					startTime: randomedTime,
					finishTime: randomedTime,
					peakTier
				};
				peakInterval.push(peak);
				hoursUsed += randomedTime;
			}

			const lastPeak: Peak = {
				startTime: 24 - hoursUsed,
				finishTime: 24 - hoursUsed,
				peakTier: PeakTier.Low
			};

			peakInterval.push(lastPeak);

			peakInterval = shuffleArr(peakInterval);

			let currentTime = new Date().getTime();

			for (const peak of peakInterval) {
				peak.startTime = currentTime;
				currentTime += peak.finishTime * Time.Hour;
				peak.finishTime = currentTime;
			}

			globalClient._peakIntervalCache = peakInterval;
		}
	},
	{
		name: 'farming_reminder_ticker',
		startupWait: Time.Minute,
		interval: Time.Minute * 3.5,
		timer: null,
		cb: async () => {
			if (!production) return;
			const basePlantTime = 1_626_556_507_451;
			const now = Date.now();
			const users = await prisma.user.findMany({
				where: {
					bitfield: {
						hasSome: [
							BitField.IsPatronTier3,
							BitField.IsPatronTier4,
							BitField.IsPatronTier5,
							BitField.IsPatronTier6,
							BitField.isModerator
						]
					}
				},
				select: {
					id: true,
					bitfield: true
				}
			});
			for (const { id, bitfield } of users) {
				if (bitfield.includes(BitField.DisabledFarmingReminders)) continue;
				const { patches } = await getFarmingInfo(id);
				for (const patchType of farmingPatchNames) {
					const patch = patches[patchType];
					if (!patch) continue;
					if (patch.plantTime < basePlantTime) continue;

					const storeHarvestablePlant = patch.lastPlanted;
					const planted = storeHarvestablePlant
						? (Farming.Plants.find(plants => stringMatches(plants.name, storeHarvestablePlant)) ??
							Farming.Plants.find(
								plants =>
									stringMatches(plants.name, storeHarvestablePlant) ||
									stringMatches(plants.name.split(' ')[0], storeHarvestablePlant)
							))
						: null;
					const difference = now - patch.plantTime;
					if (!planted) continue;
					if (difference < planted.growthTime * Time.Minute) continue;
					if (patch.wasReminded) continue;
					await mahojiUserSettingsUpdate(id, {
						[getFarmingKeyFromName(patchType)]: { ...patch, wasReminded: true }
					});

					// Build buttons (only show Harvest/replant if not busy):
					const farmingReminderButtons = new ActionRowBuilder<ButtonBuilder>();
					if (!minionIsBusy(id)) {
						farmingReminderButtons.addComponents(
							new ButtonBuilder()
								.setLabel('Harvest & Replant')
								.setStyle(ButtonStyle.Primary)
								.setCustomId('HARVEST')
						);
					}
					// Always show disable reminders:
					farmingReminderButtons.addComponents(
						new ButtonBuilder()
							.setLabel('Disable Reminders')
							.setStyle(ButtonStyle.Secondary)
							.setCustomId('DISABLE')
					);
					const user = await globalClient.users.cache.get(id);
					if (!user) continue;
					const message = await user
						.send({
							content: `The ${planted.name} planted in your ${patchType} patches are ready to be harvested!`,
							components: [farmingReminderButtons]
						})
						.catch(noOp);
					if (!message) return;
					try {
						const selection = await awaitMessageComponentInteraction({
							message,
							time: Time.Minute * 5,
							filter: () => true
						});
						if (!selection.isButton()) return;
						message.edit({ components: [] });

						// Check disable first so minion doesn't have to be free to disable reminders.
						if (selection.customId === 'DISABLE') {
							await mahojiUserSettingsUpdate(user.id, {
								bitfield: removeFromArr(bitfield, BitField.DisabledFarmingReminders)
							});
							await user.send('Farming patch reminders have been disabled.');
							return;
						}
						if (minionIsBusy(user.id)) {
							selection.reply({ content: 'Your minion is busy.' });
							return;
						}
						if (selection.customId === 'HARVEST') {
							message.author = user;
							runCommand({
								commandName: 'farming',
								args: { harvest: { patch_name: patchType } },
								bypassInhibitors: true,
								channelID: message.channel.id,
								guildID: undefined,
								user: await mUserFetch(user.id),
								member: message.member,
								interaction: selection,
								continueDeltaMillis: selection.createdAt.getTime() - message.createdAt.getTime()
							});
						}
					} catch {
						message.edit({ components: [] });
					}
				}
			}
		}
	},
	{
		name: 'support_channel_messages',
		timer: null,
		startupWait: Time.Second * 22,
		interval: Time.Minute * 20,
		cb: async () => {
			if (!production) return;
			const guild = getSupportGuild();
			const channel = guild?.channels.cache.get(Channel.HelpAndSupport) as TextChannel | undefined;
			if (!channel) return;
			const messages = await channel.messages.fetch({ limit: 5 });
			if (messages.some(m => m.author.id === globalClient.user?.id)) return;
			if (lastMessageID) {
				const message = await channel.messages.fetch(lastMessageID).catch(noOp);
				if (message) {
					await message.delete();
				}
			}
			const res = await channel.send({
				embeds: [supportEmbed],
				components: [new ActionRowBuilder<ButtonBuilder>().addComponents(informationalButtons)]
			});
			lastMessageID = res.id;
		}
	},
	{
		name: 'ge_channel_messages',
		startupWait: Time.Second * 19,
		timer: null,
		interval: Time.Minute * 20,
		cb: async () => {
			if (!production) return;
			const guild = getSupportGuild();
			const channel = guild?.channels.cache.get(Channel.GrandExchange) as TextChannel | undefined;
			if (!channel) return;
			const messages = await channel.messages.fetch({ limit: 5 });
			if (messages.some(m => m.author.id === globalClient.user?.id)) return;
			if (lastMessageGEID) {
				const message = await channel.messages.fetch(lastMessageGEID).catch(noOp);
				if (message) {
					await message.delete();
				}
			}
			const res = await channel.send({ embeds: [geEmbed] });
			lastMessageGEID = res.id;
		}
	},
	{
		name: 'ge_ticker',
		startupWait: Time.Second * 30,
		timer: null,
		interval: Time.Second * 10,
		cb: async () => {
			await GrandExchange.tick();
		}
	}
];

export function initTickers() {
	for (const ticker of tickers) {
		if (ticker.timer !== null) clearTimeout(ticker.timer);
		const fn = async () => {
			try {
				if (globalClient.isShuttingDown) return;
				await ticker.cb();
			} catch (err) {
				logError(err);
				debugLog(`${ticker.name} ticker errored`, { type: 'TICKER' });
			} finally {
				if (ticker.timer) TimerManager.clearTimeout(ticker.timer);
				ticker.timer = TimerManager.setTimeout(fn, ticker.interval);
			}
		};
		ticker.timer = TimerManager.setTimeout(() => {
			fn();
		}, ticker.startupWait ?? 1);
	}
}
