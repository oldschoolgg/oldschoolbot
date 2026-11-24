import { convertLVLtoXP } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import {
	BERT_SAND_QP_REQUIRED,
	BERT_SAND_SKILL_REQS,
	bertResetStart,
	hasCollectedThisReset,
	isManualEligible
} from '@/lib/minions/data/bertSand.js';
import { mockMUser } from './userutil.js';

describe('bertSand', () => {
	test('hasCollectedThisReset respects UTC reset window', () => {
		const now = Date.UTC(2024, 0, 2, 12, 0, 0);
		const resetStart = bertResetStart(now);

		expect(hasCollectedThisReset(resetStart - 1, now)).toEqual(false);
		expect(hasCollectedThisReset(resetStart, now)).toEqual(true);
		expect(hasCollectedThisReset(resetStart + 1, now)).toEqual(true);
	});

	test('isManualEligible returns QP error when below requirement', () => {
		const user = mockMUser({ QP: BERT_SAND_QP_REQUIRED - 1 });
		expect(isManualEligible(user)).toEqual(
			`You need at least ${BERT_SAND_QP_REQUIRED} Quest Points to collect sand for Bert.`
		);
	});

	test('isManualEligible returns skill error when below requirement', () => {
		const [, level] = BERT_SAND_SKILL_REQS[0];
		const user = mockMUser({
			QP: BERT_SAND_QP_REQUIRED,
			skills_crafting: convertLVLtoXP(level - 1),
			skills_thieving: convertLVLtoXP(99)
		});
		expect(isManualEligible(user)).toEqual(`You need level ${level} Crafting to collect sand for Bert.`);
	});

	test('isManualEligible returns null when requirements met', () => {
		const user = mockMUser({
			QP: BERT_SAND_QP_REQUIRED,
			skills_crafting: convertLVLtoXP(49),
			skills_thieving: convertLVLtoXP(17)
		});
		expect(isManualEligible(user)).toBeNull();
	});
});
