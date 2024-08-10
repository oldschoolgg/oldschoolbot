import { badges } from '../constants';

export function makeBadgeString(user: MUser, badgeIDs: number[] | null | undefined) {
	const method = user.getRandomizeMethod();
	const rawBadges: string[] = (badgeIDs ?? []).map(num => badges[num]);
	rawBadges.push(method?.emoji ?? '');
	return rawBadges.join(' ').trim();
}
