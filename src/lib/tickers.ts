import { ButtonBuilder, ButtonStyle, EmbedBuilder } from '@oldschoolgg/discord';
import { noOp, stringMatches, Time } from '@oldschoolgg/toolkit';
import { TimerManager } from '@sapphire/timer-manager';

import { analyticsTick } from '@/lib/analytics.js';
import { syncBlacklists } from '@/lib/blacklists.js';
import { BitField, Channel, globalConfig } from '@/lib/constants.js';
import { GrandExchange } from '@/lib/grandExchange.js';
import { cacheGEPrices } from '@/lib/marketPrices.js';
import { collectMetrics } from '@/lib/metrics.js';
import { populateRoboChimpCache } from '@/lib/perkTier.js';
import { informationalButtons } from '@/lib/sharedComponents.js';
import { Farming } from '@/lib/skilling/skills/farming/index.js';
import type { FarmingPatchName, FarmingPatchSettingsKey } from '@/lib/skilling/skills/farming/utils/farmingHelpers.js';
import type { IPatchData } from '@/lib/skilling/skills/farming/utils/types.js';
import { handleGiveawayCompletion } from '@/lib/util/giveaway.js';

let lastMessageID: string | null = null;
let lastMessageGEID: string | null = null;
const supportEmbed = new EmbedBuilder()
	.setAuthor({ name: '⚠️ ⚠️ ⚠️ ⚠️ READ THIS ⚠️ ⚠️ ⚠️ ⚠️' })
	.addFields({
		name: '📖 Read the FAQ',
		value: 'The FAQ answers commonly asked questions: https://wiki.oldschool.gg/getting-started/faq/ - also make sure to read the other pages of the website, which might contain the information you need.'
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

/**
 * Tickers should idempotent, and be able to run at any time.
 */
export const tickers: {
	name: string;
	startupWait?: number;
	interval: number;
	timer: NodeJS.Timeout | null;
	productionOnly?: true;
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
		interval: globalConfig.isProduction ? Time.Second * 5 : 500,
		cb: async () => {
			await ActivityManager.processPendingActivities();
		}
	},
	{
		name: 'farming_reminder_ticker',
		startupWait: Time.Minute,
		interval: Time.Minute * 3.5,
		timer: null,
		productionOnly: true,
		cb: async () => {
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
				}
			});
			for (const partialUser of users) {
				if (partialUser.bitfield.includes(BitField.DisabledFarmingReminders)) continue;
				const user = await mUserFetch(partialUser.id);
				const { patches } = await Farming.getFarmingInfoFromUser(user);

				const patchesReadyToHarvest: FarmingPatchName[] = [];
				for (const patchType of Farming.farmingPatchNames) {
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
					patchesReadyToHarvest.push(patchType);
				}

				if (patchesReadyToHarvest.length > 0) {
					const userUpdates: Partial<Record<FarmingPatchSettingsKey, IPatchData>> = {};
					for (const patchType of patchesReadyToHarvest) {
						userUpdates[Farming.getFarmingKeyFromName(patchType)] = {
							...patches[patchType],
							wasReminded: true
						};
					}
					await globalClient.sendDm(user.id, {
						content: `The following farming patches are ready to be harvested: ${patchesReadyToHarvest.join(', ')}.`,
						components: [
							new ButtonBuilder()
								.setLabel('Disable Reminders')
								.setStyle(ButtonStyle.Secondary)
								.setCustomId('DISABLE'),
							...patchesReadyToHarvest.map(_p =>
								new ButtonBuilder()
									.setLabel(`Harvest ${_p}`)
									.setStyle(ButtonStyle.Primary)
									.setCustomId(`FARMING_PATRON_HARVEST_${_p}`)
							)
						]
					});
				}
			}
		}
	},
	{
		name: 'support_channel_messages',
		timer: null,
		startupWait: Time.Second * 22,
		interval: Time.Minute * 20,
		productionOnly: true,
		cb: async () => {
			const messages = await globalClient.fetchChannelMessages(Channel.HelpAndSupport, { limit: 10 })!;
			if (messages.some(m => m.author.id === globalClient.applicationUser!.id)) return;
			if (lastMessageID) {
				await globalClient.deleteMessage(Channel.HelpAndSupport, lastMessageID).catch(noOp);
			}

			const res = await globalClient.sendMessage(Channel.HelpAndSupport, {
				embeds: [supportEmbed],
				components: informationalButtons
			});

			lastMessageID = res.id;
		}
	},
	{
		name: 'ge_channel_messages',
		startupWait: Time.Second * 19,
		timer: null,
		interval: Time.Minute * 20,
		productionOnly: true,
		cb: async () => {
			const messages = await globalClient.fetchChannelMessages(Channel.GrandExchange, { limit: 10 })!;
			if (messages.some(m => m.author.id === globalClient.applicationUser!.id)) return;
			if (lastMessageGEID) {
				await globalClient.deleteMessage(Channel.GrandExchange, lastMessageGEID).catch(noOp);
			}

			const res = await globalClient.sendMessage(Channel.GrandExchange, {
				embeds: [geEmbed]
			});

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
	},
	{
		name: 'robochimp_cache',
		startupWait: Time.Minute * 5,
		timer: null,
		interval: Time.Minute * 30,
		cb: async () => {
			await populateRoboChimpCache();
		}
	},
	{
		name: 'Sync Blacklists',
		timer: null,
		interval: Time.Minute * 10,
		cb: async () => {
			await syncBlacklists();
		}
	},
	{
		name: 'Analytics',
		timer: null,
		interval: Time.Hour * 4.44,
		startupWait: Time.Minute * 30,
		cb: async () => {
			await analyticsTick();
		}
	},
	{
		name: 'Presence Update',
		timer: null,
		interval: Time.Hour * 8.44,
		cb: async () => {
			globalClient.setPresence({ text: '/help' });
		}
	},
	{
		name: 'Economy Item Snapshot',
		timer: null,
		startupWait: Time.Minute * 20,
		interval: Time.Hour * 13.55,
		cb: async () => {
			await prisma.$executeRaw`INSERT INTO economy_item_banks (bank)
VALUES (get_economy_bank());`;
		}
	},
	{
		name: 'Cache G.E Prices',
		timer: null,
		interval: Time.Hour * 12.55,
		startupWait: Time.Minute * 25,
		cb: async () => {
			await cacheGEPrices();
		}
	}
];

export function initTickers() {
	for (const ticker of tickers) {
		if (ticker.timer !== null) clearTimeout(ticker.timer);
		if (ticker.productionOnly && !globalConfig.isProduction) continue;
		const fn = async () => {
			try {
				if (globalClient.isShuttingDown) return;
				const start = performance.now();
				await ticker.cb();
				const end = performance.now();
				Logging.logPerf({
					duration: end - start,
					text: `Ticker.${ticker.name}`
				});
			} catch (err) {
				Logging.logError(err as Error);
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
