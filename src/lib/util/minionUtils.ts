import { formatDurationWithTimestamp, Time } from '@oldschoolgg/toolkit';
import type { Bank } from 'oldschooljs';

import { BitField } from '@/lib/constants.js';
import { QuestID } from '@/lib/minions/data/quests.js';

export async function formatTripDuration(user: MUser, durationMs: number): Promise<string> {
	const perkTier = await user.fetchPerkTier();
	const showTimestamp = user.bitfield.includes(BitField.ShowMinionReturnTime);
	return formatDurationWithTimestamp(durationMs, perkTier, showTimestamp);
}

const MOON_KEY_ONE_IN_PER_MINUTE = 60;

export function rollForMoonKeyHalf({
	rng,
	user,
	duration,
	loot
}: {
	rng: RNGProvider;
	user: MUser | boolean;
	duration: number;
	loot: Bank;
}) {
	if (typeof user === 'boolean' && !user) return;
	if (typeof user !== 'boolean' && !user.user.finished_quest_ids.includes(QuestID.ChildrenOfTheSun)) return;
	const minutes = duration / Time.Minute;
	const fullMinutes = Math.floor(minutes);
	const remainderMinutes = minutes - fullMinutes;

	for (let i = 0; i < fullMinutes; i++) {
		if (rng.roll(MOON_KEY_ONE_IN_PER_MINUTE)) {
			loot.add('Loop half of key (moon key)');
		}
	}

	if (remainderMinutes > 0) {
		const percentChance = (remainderMinutes / MOON_KEY_ONE_IN_PER_MINUTE) * 100;
		if (percentChance > 0 && rng.percentChance(percentChance)) {
			loot.add('Loop half of key (moon key)');
		}
	}
}
