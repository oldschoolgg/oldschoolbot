import { Time, randInt, shuffleArr } from 'e';

import { production } from '../config';
import { runTameTask } from '../tasks/tames/tameTasks';
import { processPendingActivities } from './Task';
import { PeakTier } from './constants';

import { logError } from './util/logError';

export interface Peak {
	startTime: number;
	finishTime: number;
	peakTier: PeakTier;
}

/**
 * Tickers should idempotent, and be able to run at any time.
 */
export const tickers: { name: string; interval: number; timer: NodeJS.Timeout | null; cb: () => Promise<unknown> }[] = [
	{
		name: 'minion_activities',
		timer: null,
		interval: production ? Time.Second * 5 : 500,
		cb: async () => {
			await processPendingActivities();
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
				debugLog(`${ticker.name} ticker errored`, { type: 'TICKER' });
			} finally {
				ticker.timer = setTimeout(fn, ticker.interval);
			}
		};
		fn();
	}
}
