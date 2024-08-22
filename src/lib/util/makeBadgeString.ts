import { Emoji, badges } from '../constants';

export function makeBadgeString(badgeIDs: number[] | null | undefined, isIronman: boolean) {
	const rawBadges: string[] = (badgeIDs ?? []).map(num => badges[num]);
	if (isIronman) {
		rawBadges.push(Emoji.Ironman);
	}
	return rawBadges.join(' ').trim();
}
