import { Emoji } from '@oldschoolgg/toolkit';

import { badges } from '@/lib/constants.js';

export function makeBadgeString(
	badgeIDs: number[] | null | undefined,
	isIronman: boolean,
	isOriginalCyrSupporter: boolean
) {
	const rawBadges: string[] = (badgeIDs ?? []).map(num => badges[num]);
	if (isIronman) {
		rawBadges.push(Emoji.Ironman);
	}
	if (isOriginalCyrSupporter) {
		rawBadges.unshift('<:seer:924198628191531030>');
	}
	return rawBadges.join(' ').trim();
}
