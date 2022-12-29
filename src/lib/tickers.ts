import { Activity } from '@prisma/client';
import { randInt, shuffleArr, Time } from 'e';

import { production } from '../config';
import { collectMetrics } from './metrics';
import { prisma, queryCountStore } from './settings/prisma';
import { runTameTask } from './tames';
import { completeActivity } from './Task';
import { logError } from './util/logError';

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
		name: 'tame_activities',
		timer: null,
		interval: Time.Second * 5,
		cb: async () => {
			const tameTasks = await prisma.tameActivity.findMany({
				where: {
					finish_date: production
						? {
								lt: new Date()
						  }
						: undefined,
					completed: false
				},
				include: {
					tame: true
				}
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
				runTameTask(task, task.tame);
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
				logError(err);
			} finally {
				ticker.timer = setTimeout(fn, ticker.interval);
			}
		};
		fn();
	}
}
