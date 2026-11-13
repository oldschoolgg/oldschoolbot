import type { BingoChallenge, BingoProgressState } from '@/lib/bingo/bingoTypes.js';
import { challengeTarget } from '@/lib/bingo/bingoTypes.js';

export interface BingoEventData {
	items: Record<string, number>;
	activity_type: string | null;
	activity_completion: boolean;
}

export function evaluateBingoChallenge(challenge: BingoChallenge, previous: BingoProgressState, event: BingoEventData) {
	const target = challengeTarget(challenge);
	const items = { ...previous.items };
	let quantity = previous.quantity;
	if (quantity >= target) return { quantity, items, credit: 0 };

	switch (challenge.type) {
		case 'item_drop':
		case 'item_quantity': {
			const added = [...new Set(challenge.targetItemIDs)].reduce((sum, id) => sum + (event.items[id] ?? 0), 0);
			quantity = Math.min(target, quantity + added);
			break;
		}
		case 'activity_completion':
			if (event.activity_completion && event.activity_type === challenge.activityID) quantity++;
			break;
		case 'custom': {
			for (const id of challenge.itemSets.flat(2)) {
				if ((event.items[id] ?? 0) > 0) items[id] = 1;
			}
			quantity = Math.max(
				...challenge.itemSets.map(set => set.filter(group => group.some(id => items[id])).length / set.length)
			);
			break;
		}
	}
	return { quantity, items, credit: Math.max(0, (quantity - previous.quantity) / target) };
}

export function isBingoEventInSeason(
	season: { start_date: Date; end_date: Date },
	event: { occurred_at: Date; started_at: Date }
) {
	return (
		event.started_at >= season.start_date &&
		event.occurred_at >= season.start_date &&
		event.occurred_at < season.end_date
	);
}
