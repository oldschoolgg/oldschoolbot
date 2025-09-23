import { Emoji } from '@oldschoolgg/toolkit/constants';

import { badges } from '@/lib/constants.js';

export function makeBadgeString(badgeIDs: number[] | null | undefined, isIronman: boolean) {
	const rawBadges: string[] = (badgeIDs ?? []).map(num => badges[num]);
	if (isIronman) {
		rawBadges.push(Emoji.Ironman);
	}
	return rawBadges.join(' ').trim();
}
