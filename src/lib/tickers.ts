import { Embed } from '@discordjs/builders';
import { Activity } from '@prisma/client';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, TextChannel } from 'discord.js';
import { noOp, randInt, shuffleArr, Time } from 'e';

import { production } from '../config';
import { mahojiUserSettingsUpdate } from '../mahoji/settingsUpdate';
import { BitField, Channel, informationalButtons } from './constants';
import { collectMetrics } from './metrics';
import { prisma, queryCountStore } from './settings/prisma';
import { runCommand } from './settings/settings';
import { getFarmingInfo } from './skilling/functions/getFarmingInfo';
import Farming from './skilling/skills/farming';
import { completeActivity } from './Task';
import { awaitMessageComponentInteraction, getSupportGuild, stringMatches } from './util';
import { farmingPatchNames, getFarmingKeyFromName } from './util/farmingHelpers';
import { handleGiveawayCompletion } from './util/giveaway';
import { logError } from './util/logError';
import { minionIsBusy } from './util/minionIsBusy';

let lastMessageID: string | null = null;
let lastMessageGEID: string | null = null;
const supportEmbed = new Embed()
	.setAuthor({ name: '⚠️ ⚠️ ⚠️ ⚠️ READ THIS ⚠️ ⚠️ ⚠️ ⚠️' })
	.addField({
		name: '📖 Read the FAQ',
		value: 'The FAQ answers commonly asked questions: https://wiki.oldschool.gg/faq - also make sure to read the other pages of the website, which might contain the information you need.'
	})
	.addField({
		name: '🔎 Search',
		value: 'Search this channel first, you might find your question has already been asked and answered.'
	})
	.addField({
		name: '💬 Ask',
		value: "If your question isn't answered in the FAQ, and you can't find it from searching, simply ask your question and wait for someone to answer. If you don't get an answer, you can post your question again."
	})
	.addField({
		name: '⚠️ Dont ping anyone',
		value: 'Do not ping mods, or any roles/people in here. You will be muted. Ask your question, and wait.'
	});

const geEmbed = new Embed()
	.setAuthor({ name: '⚠️ ⚠️ ⚠️ ⚠️ READ THIS ⚠️ ⚠️ ⚠️ ⚠️' })
	.addField({
		name: "⚠️ Don't get scammed",
		value: 'Beware of people "buying out banks" or buying lots of skilling supplies, which can be worth a lot more in the bot than they pay you. Skilling supplies are often worth a lot more than they are ingame. Don\'t just trust that they\'re giving you a fair price.'
	})
	.addField({
		name: '🔎 Search',
		value: 'Search this channel first, someone might already be selling/buying what you want.'
	})
	.addField({
		name: '💬 Read the rules/Pins',
		value: 'Read the pinned rules/instructions before using the channel.'
	})
	.addField({
		name: 'Keep Ads Short',
		value: 'Keep your ad less than 10 lines long, as short as possible.'
	});

export const enum PeakTier {
	High = 'high',
	Medium = 'medium',
	Low = 'low'
}

export interface Peak {
	startTime: number;
	finishTime: number;
	peakTier: PeakTier;
}

/**
 * Tickers should idempotent, and be able to run at any time.
 */
export const tickers: { name: string; interval: number; timer: NodeJS.Timeout | null; cb: () => unknown }[] = [
	{
		name: 'giveaways',
		interval: Time.Second * 5,
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
			let storedCount = queryCountStore.value;
			queryCountStore.value = 0;
			const data = {
				timestamp: Math.floor(Date.now() / 1000),
				...collectMetrics(),
				qps: storedCount / 60
			};
			if (isNaN(data.eventLoopDelayMean)) {
				data.eventLoopDelayMean = 0;
			}
			await prisma.metric.create({
				data
			});
		}
	},
	{
		name: 'minion_activities',
		timer: null,
		interval: Time.Second * 5,
		cb: async () => {
			const activities: Activity[] = await prisma.activity.findMany({
				where: {
					completed: false,
					finish_date: production
						? {
								lt: new Date()
						  }
						: undefined
				}
			});

			await prisma.activity.updateMany({
				where: {
					id: {
						in: activities.map(i => i.id)
					}
				},
				data: {
					completed: true
				}
			});

			await Promise.all(activities.map(completeActivity));
		}
	},
	{
		name: 'daily_reminders',
		interval: Time.Minute,
		timer: null,
		cb: async () => {
			const result = await prisma.$queryRawUnsafe<{ id: string }[]>(
				'SELECT id FROM users WHERE bitfield && \'{2,3,4,5,6,7,8}\'::int[] AND "lastDailyTimestamp" != -1 AND to_timestamp("lastDailyTimestamp" / 1000) < now() - interval \'12 hours\';'
			);

			for (const row of result.values()) {
				if (!production) continue;
				const user = await mUserFetch(row.id);
				if (Number(user.user.lastDailyTimestamp) === -1) continue;

				await user.update({
					lastDailyTimestamp: -1
				});
				const klasaUser = await globalClient.fetchUser(user.id);
				await klasaUser.send('Your daily is ready!').catch(noOp);
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
				let randomedTime = randInt(1, 2);
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

			for (let peak of peakInterval) {
				peak.startTime = currentTime;
				currentTime += peak.finishTime * Time.Hour;
				peak.finishTime = currentTime;
			}

			globalClient._peakIntervalCache = peakInterval;
		}
	},
	{
		name: 'farming_reminder_ticker',
		interval: Time.Minute * 2,
		timer: null,
		cb: async () => {
			if (!production) return;
			let basePlantTime = 1_626_556_507_451;
			const now = Date.now();
			const users = await prisma.user.findMany({
				where: {
					bitfield: {
						hasSome: [
							BitField.IsPatronTier3,
							BitField.IsPatronTier4,
							BitField.IsPatronTier5,
							BitField.isContributor,
							BitField.isModerator
						]
					},
					farming_patch_reminders: true
				},
				select: {
					id: true
				}
			});
			for (const { id } of users) {
				const { patches } = await getFarmingInfo(id);
				for (const patchType of farmingPatchNames) {
					const patch = patches[patchType];
					if (!patch) continue;
					if (patch.plantTime < basePlantTime) continue;

					const storeHarvestablePlant = patch.lastPlanted;
					const planted = storeHarvestablePlant
						? Farming.Plants.find(plants => stringMatches(plants.name, storeHarvestablePlant)) ??
						  Farming.Plants.find(
								plants =>
									stringMatches(plants.name, storeHarvestablePlant) ||
									stringMatches(plants.name.split(' ')[0], storeHarvestablePlant)
						  )
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
					const message = await user.send({
						content: `The ${planted.name} planted in your ${patchType} patches is ready to be harvested!`,
						components: [farmingReminderButtons]
					});
					try {
						const selection = await awaitMessageComponentInteraction({
							message,
							time: Time.Minute * 5,
							filter: () => true
						});
						message.edit({ components: [] });

						// Check disable first so minion doesn't have to be free to disable reminders.
						if (selection.customId === 'DISABLE') {
							await mahojiUserSettingsUpdate(user.id, {
								farming_patch_reminders: false
							});
							await user.send('Farming patch reminders have been disabled..');
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
								member: message.member
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
		interval: Time.Minute * 20,
		cb: async () => {
			if (!production) return;
			const guild = getSupportGuild();
			const channel = guild?.channels.cache.get(Channel.HelpAndSupport) as TextChannel | undefined;
			if (!channel) return;
			const messages = await channel.messages.fetch({ limit: 5 });
			if (messages.some(m => m.author.id === globalClient.user!.id)) return;
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
		timer: null,
		interval: Time.Minute * 20,
		cb: async () => {
			if (!production) return;
			const guild = getSupportGuild();
			const channel = guild?.channels.cache.get(Channel.GrandExchange) as TextChannel | undefined;
			if (!channel) return;
			const messages = await channel.messages.fetch({ limit: 5 });
			if (messages.some(m => m.author.id === globalClient.user!.id)) return;
			if (lastMessageGEID) {
				const message = await channel.messages.fetch(lastMessageGEID).catch(noOp);
				if (message) {
					await message.delete();
				}
			}
			const res = await channel.send({ embeds: [geEmbed] });
			lastMessageGEID = res.id;
		}
	}
];

export function initTickers() {
	for (const ticker of tickers) {
		if (ticker.timer !== null) clearTimeout(ticker.timer);
		const fn = async () => {
			try {
				await ticker.cb();
			} catch (err) {
				logError(err);
			} finally {
				ticker.timer = setTimeout(fn, ticker.interval);
			}
		};
		fn();
	}
}
