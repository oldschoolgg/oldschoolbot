import { getNextUTCReset, Time, toTitleCase } from '@oldschoolgg/toolkit';
import { Items } from 'oldschooljs';

import type { MUser } from '@/lib/MUser.js';
import type { SkillNameType } from '@/lib/skilling/types.js';

export const BERT_SAND_ID = 'bert_sand' as const;
export const BERT_SAND_BUCKETS = 84;
export const BERT_SAND_DURATION = Time.Second * 15;
export const BERT_SAND_SKILL_REQS: readonly [SkillNameType, number][] = [
	['crafting', 49],
	['thieving', 17]
];
export const BERT_SAND_QP_REQUIRED = 5;
export const BERT_SAND_ITEM_ID = Items.getOrThrow('Bucket of sand').id;

export interface BertSandTripMetadata {
	lastCollectedAtStart: number;
}

export const bertResetStart = (now = Date.now()) => getNextUTCReset(now, Time.Day) - Time.Day;

export function hasCollectedThisReset(lastCollected: number, now = Date.now()) {
	return lastCollected >= bertResetStart(now);
}

export function isManualEligible(user: MUser): string | null {
	if (user.QP < BERT_SAND_QP_REQUIRED) {
		return `You need at least ${BERT_SAND_QP_REQUIRED} Quest Points to collect sand for Bert.`;
	}

	for (const [skill, level] of BERT_SAND_SKILL_REQS) {
		if (user.skillsAsLevels[skill] < level) {
			return `You need level ${level} ${toTitleCase(skill)} to collect sand for Bert.`;
		}
	}

	return null;
}

export function hasBertSandAutoDelivery(user: { completed_achievement_diaries: string[] }) {
	return user.completed_achievement_diaries.includes('ardougne.elite');
}
