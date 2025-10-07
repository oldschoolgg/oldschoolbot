import { MTame } from '@/lib/bso/structures/MTame.js';
import { runTameTask } from '@/lib/bso/tames/tameTasks.js';

import {
	awaitMessageComponentInteraction,
	cleanUsername,
	noOp,
	removeFromArr,
	stringMatches,
	Time
} from '@oldschoolgg/toolkit';
import { TimerManager } from '@sapphire/timer-manager';
import type { TextChannel } from 'discord.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';

import { BitField, Channel, globalConfig } from '@/lib/constants.js';
import { GrandExchange } from '@/lib/grandExchange.js';
import { mahojiUserSettingsUpdate } from '@/lib/MUser.js';
import { collectMetrics } from '@/lib/metrics.js';
import { populateRoboChimpCache } from '@/lib/perkTier.js';
import { fetchUsersWithoutUsernames } from '@/lib/rawSql.js';
import { runCommand } from '@/lib/settings/settings.js';
import { informationalButtons } from '@/lib/sharedComponents.js';
import { Farming } from '@/lib/skilling/skills/farming/index.js';
import { handleGiveawayCompletion } from '@/lib/util/giveaway.js';
import { makeBadgeString } from '@/lib/util/makeBadgeString.js';
import { getSupportGuild } from '@/lib/util.js';

let lastMessageID: string | null = null;
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
		cb: async () => {
			if (!globalConfig.isProduction) return;
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
					await user.update({
						[Farming.getFarmingKeyFromName(patchType)]: { ...patch, wasReminded: true }
					});

					// Build buttons (only show Harvest/replant if not busy):
					const farmingReminderButtons = new ActionRowBuilder<ButtonBuilder>();
					if (!ActivityManager.minionIsBusy(user.id)) {
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
					const djsUser = await globalClient.users.cache.get(user.id);
					if (!djsUser) continue;
					const message = await djsUser
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
								bitfield: removeFromArr(user.bitfield, BitField.DisabledFarmingReminders)
							});
							await djsUser.send('Farming patch reminders have been disabled.');
							return;
						}
						if (ActivityManager.minionIsBusy(user.id)) {
							selection.reply({ content: 'Your minion is busy.' });
							return;
						}
						if (selection.customId === 'HARVEST') {
							message.author = djsUser;
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
			if (!globalConfig.isProduction) return;
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
		name: 'tame_activities',
		startupWait: Time.Second * 15,
		timer: null,
		interval: Time.Second * 5,
		cb: async () => {
			const tameTasks = await prisma.tameActivity.findMany({
				where: {
					finish_date: globalConfig.isProduction
						? {
								lt: new Date()
							}
						: undefined,
					completed: false
				},
				include: {
					tame: true
				},
				take: 5
			});

			await prisma.tameActivity.updateMany({
				where: {
					id: {
						in: tameTasks.map(i => i.id)
					}
				},
				data: {
					completed: true
				}
			});

			for (const task of tameTasks) {
				await runTameTask(task, new MTame(task.tame));
			}
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
		interval: Time.Minute * 5,
		cb: async () => {
			await populateRoboChimpCache();
		}
	},
	{
		// Fetch users without usernames, and put in their usernames.
		name: 'username_filling',
		startupWait: Time.Minute * 10,
		timer: null,
		interval: Time.Minute * 33.33,
		cb: async () => {
			const users = await fetchUsersWithoutUsernames();
			if (process.env.TEST) return;
			for (const { id } of users) {
				const djsUser = await globalClient.users.fetch(id).catch(() => null);
				if (!djsUser) {
					Logging.logDebug(`username_filling: Could not fetch user with ID ${id}, skipping...`);
					continue;
				}
				const user = await prisma.user.upsert({
					where: {
						id
					},
					select: {
						username: true,
						badges: true,
						minion_ironman: true
					},
					create: {
						id
					},
					update: {}
				});
				const badges = makeBadgeString(user.badges, user.minion_ironman);
				const username = cleanUsername(djsUser.username);
				const usernameWithBadges = `${badges ? `${badges} ` : ''}${username}`;
				await prisma.user.update({
					where: {
						id
					},
					data: {
						username_with_badges: usernameWithBadges,
						username
					}
				});
				Logging.logDebug(
					`username_filling: Updated user[${id}] to username[${username}] withbadges[${usernameWithBadges}]`
				);
			}
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
