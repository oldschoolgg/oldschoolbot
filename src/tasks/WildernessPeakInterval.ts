import { Task } from 'klasa';

import { Time } from '../lib/constants';
import { rand, shuffle } from '../lib/util';

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

export default class extends Task {
	async init() {
		this.run();
	}

	async run() {
		this.WildernessPeakTimes();
	}

	WildernessPeakTimes() {
		let hoursUsed = 0;
		let peakInterval: Peak[] = [];
		const peakTiers: PeakTier[] = [PeakTier.High, PeakTier.Medium, PeakTier.Low];

		// Divide the current day into interverals
		for (let i = 0; i <= 10; i++) {
			let randomedTime = rand(1, 2);
			const [peakTier] = shuffle(peakTiers);
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

		peakInterval = shuffle(peakInterval);

		let currentTime = new Date().getTime();

		for (let peak of peakInterval) {
			peak.startTime = currentTime;
			currentTime += peak.finishTime * Time.Hour;
			peak.finishTime = currentTime;
		}

		// Automatic updates Wilderness Peak times once every 24 hour
		setInterval(this.WildernessPeakTimes, Time.Hour * 24);

		return peakInterval;
	}
}
