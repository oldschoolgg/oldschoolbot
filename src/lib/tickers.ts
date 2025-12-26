import { syncSlayerMaskLeaderboardCache } from '@/lib/bso/skills/slayer/slayerMaskLeaderboard.js';
import { MTame } from '@/lib/bso/structures/MTame.js';
import { runTameTask } from '@/lib/bso/tames/tameTasks.js';

import { ButtonBuilder, ButtonStyle } from '@oldschoolgg/discord';
import { stringMatches, Time } from '@oldschoolgg/toolkit';
import { TimerManager } from '@sapphire/timer-manager';

import type { User } from '@/prisma/main.js';
import { analyticsTick } from '@/lib/analytics.js';
import { globalConfig } from '@/lib/constants.js';
import { GrandExchange } from '@/lib/grandExchange.js';
import { MUserClass } from '@/lib/MUser.js';
import { cacheGEPrices } from '@/lib/marketPrices.js';
import { collectMetrics } from '@/lib/metrics.js';
import { Farming } from '@/lib/skilling/skills/farming/index.js';
import type { FarmingPatchName, FarmingPatchSettingsKey } from '@/lib/skilling/skills/farming/utils/farmingHelpers.js';
import type { IPatchData } from '@/lib/skilling/skills/farming/utils/types.js';
import { handleGiveawayCompletion } from '@/lib/util/giveaway.js';

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
		interval: Time.Second * 5,
		cb: async () => {
			const data = {
				timestamp: Math.floor(Date.now() / 1000),
				...collectMetrics()
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
			const basePlantTime = 1_626_556_507_451;
			const now = Date.now();
			const keys = [
				'farmingPatches.herb',
				'farmingPatches.fruit tree',
				'farmingPatches.tree',
				'farmingPatches.allotment',
				'farmingPatches.hops',
				'farmingPatches.cactus',
				'farmingPatches.bush',
				'farmingPatches.spirit',
				'farmingPatches.hardwood',
				'farmingPatches.seaweed',
				'farmingPatches.vine',
				'farmingPatches.calquat',
				'farmingPatches.redwood',
				'farmingPatches.crystal',
				'farmingPatches.celastrus',
				'farmingPatches.hespori',
				'farmingPatches.flower',
				'farmingPatches.mushroom',
				'farmingPatches.belladonna'
			];
			const users = await prisma.$queryRawUnsafe<User[]>(`SELECT *
FROM users u
WHERE
  bitfield && ARRAY[
    4,  -- IsPatronTier3
    5,  -- IsPatronTier4
    6,  -- IsPatronTier5
    21, -- IsPatronTier6
    7   -- isModerator
  ]::int[]
AND last_command_date > now() - INTERVAL '5 days'
AND EXISTS (
  SELECT 1
  FROM farmed_crop fc
  WHERE fc.user_id = u.id
    AND fc.date_planted > now() - INTERVAL '2 days'
)
AND NOT (bitfield @> ARRAY[
    37  -- DisabledFarmingReminders
]::int[])
AND (
  ${keys.map(_key => `("${_key}" IS NOT NULL AND NOT "${_key}"::jsonb ? 'wasReminded')`).join(' OR ')}
)
ORDER BY random()
LIMIT 10;`);
			for (const user of users.map(_u => new MUserClass(_u))) {
				const { patches } = Farming.getFarmingInfoFromUser(user);

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

				if (patchesReadyToHarvest.length === 0) continue;
				const userUpdates: Partial<Record<FarmingPatchSettingsKey, IPatchData>> = {};
				for (const patchType of patchesReadyToHarvest) {
					userUpdates[Farming.getFarmingKeyFromName(patchType)] = {
						...patches[patchType],
						wasReminded: true
					};
				}

				if (globalConfig.isProduction) {
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
	},
	{
		name: 'Sync Slayer Mask LB',
		timer: null,
		interval: Time.Hour * 14.66,
		cb: async () => {
			syncSlayerMaskLeaderboardCache();
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
				if (ticker.interval > Time.Minute * 30) {
					Logging.logDebug(`Running ${ticker.name} ticker`);
				}
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
