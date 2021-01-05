import { Time } from '../../constants';
import { rand, shuffle } from '../../util';

// Automatic updates Wilderness Peak times once every 24 hour
setInterval(generatedWildernessPeakTimes, Time.Hour * 24);

const enum PeakTier {
	High = 'high',
	Medium = 'medium',
	Low = 'low'
}

interface Peak {
	startDate: Date;
	finishDate: Date;
	peakTier: PeakTier;
}

export function generatedWildernessPeakTimes() {
	let startDate = new Date();
	let finishDate = startDate;
	let hoursUsed = 0;
	let peakIntervall: Peak[] = [];
	const peakTiers: PeakTier[] = [PeakTier.High, PeakTier.Medium, PeakTier.Low];

	// Divide the current day into interverals
	for (let i = 0; i <= 10; i++) {
		let randomedTime = rand(1, 2);
		const [peakTier] = shuffle(peakTiers);
		finishDate.setHours(startDate.getHours() + randomedTime);
		const peak: Peak = {
			startDate,
			finishDate,
			peakTier
		};
		peakIntervall.push(peak);
		hoursUsed += randomedTime;
		startDate.setHours(finishDate.getHours());
	}

	// Add remaining time
	finishDate.setHours(startDate.getHours() + 24 - hoursUsed);

	const lastPeak: Peak = {
		startDate,
		finishDate,
		peakTier: PeakTier.Low
	};

	peakIntervall.push(lastPeak);

	peakIntervall = shuffle(peakIntervall);

	console.log(peakIntervall);

	return peakIntervall;
}
