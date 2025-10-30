import { formatDuration, getNextUTCReset, Time } from '@oldschoolgg/toolkit';

import {
	BERT_SAND_BUCKETS,
	BERT_SAND_DURATION,
	BERT_SAND_ID,
	BERT_SAND_ITEM_ID,
	hasCollectedThisReset,
	isManualEligible
} from '@/lib/minions/data/bertSand.js';
import type { ActivityTaskMetadata, CollectingOptions } from '@/lib/types/minions.js';

const NON_REPEATABLE_METADATA: ActivityTaskMetadata = {
	activityID: BERT_SAND_ID,
	nonRepeatable: true
};

export async function collectBertSand(user: MUser, channelID: string) {
	const now = Date.now();
	const stats = await user.fetchStats();
	const lastCollected = Number(stats.last_bert_sand_timestamp ?? 0n);

	const requirementError = isManualEligible(user);
	if (requirementError) {
		return requirementError;
	}

	if (hasCollectedThisReset(lastCollected, now)) {
		const nextReset = getNextUTCReset(now, Time.Day);
		return `Bert will have more buckets of sand for you in ${formatDuration(nextReset - now)}.`;
	}

	await ActivityManager.startTrip<CollectingOptions>({
		collectableID: BERT_SAND_ITEM_ID,
		userID: user.id,
		channelID,
		quantity: 1,
		duration: BERT_SAND_DURATION,
		type: 'Collecting',
		lootQuantityOverride: BERT_SAND_BUCKETS,
		bertSand: { lastCollectedAtStart: lastCollected },
		metadata: NON_REPEATABLE_METADATA
	});

	return `Bert is sorting your buckets of sand… (${formatDuration(BERT_SAND_DURATION)})`;
}
