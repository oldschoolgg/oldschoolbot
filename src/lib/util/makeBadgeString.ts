import { Emoji } from '@oldschoolgg/toolkit';

import { badges } from '@/lib/constants.js';

export function makeBadgeString(
	badgeIDs: number[] | null | undefined,
	isIronman: boolean,
	isOriginalCyrSupporter = false
) {
	const rawBadges: string[] = (badgeIDs ?? []).map(num => badges[num]);
	if (isOriginalCyrSupporter) {
		rawBadges.unshift(Emoji.Seer);
	}
	if (isIronman) {
		rawBadges.push(Emoji.Ironman);
	}
	return rawBadges.join(' ').trim();
}
