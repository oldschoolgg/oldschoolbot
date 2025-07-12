import { Emoji } from '@oldschoolgg/toolkit/constants';
import { perTimeUnitChance, toTitleCase } from '@oldschoolgg/toolkit/util';
import { type BaseMessageOptions, time } from 'discord.js';
import { Time } from 'e';
import type { Bank } from 'oldschooljs';

import { MUserClass } from '../MUser';
import { QuestID } from '../minions/data/quests';
import type { Peak } from './../tickers';

export function checkPeakTimes(): BaseMessageOptions {
	const cachedPeakInterval: Peak[] = globalClient._peakIntervalCache;
	let str = '';
	for (const peak of cachedPeakInterval) {
		str += `${Emoji.Stopwatch} **${toTitleCase(peak.peakTier)}** peak time: ${time(
			new Date(peak.startTime),
			'T'
		)} to ${time(new Date(peak.finishTime), 'T')} (**${Math.round(
			(peak.finishTime - peak.startTime) / Time.Hour
		)}** hour peak ${time(new Date(peak.startTime), 'R')})\n`;
	}

	return {
		content: str
	};
}

export function rollForMoonKeyHalf({ user, duration, loot }: { user: MUser | boolean; duration: number; loot: Bank }) {
	if (user instanceof MUserClass && !user.user.finished_quest_ids.includes(QuestID.ChildrenOfTheSun)) return;
	if (!user) return;
	perTimeUnitChance(duration, 1, Time.Minute * 60, () => {
		loot.add('Loop half of key (moon key)');
	});
}
