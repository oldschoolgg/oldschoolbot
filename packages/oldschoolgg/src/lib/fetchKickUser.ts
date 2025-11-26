import type { KickAPIUser } from '@worp/universal/fetchWorpKickAPIUser';

const kickApiUserCache = new Map<string, KickAPIUser>();

export function getCachedKickApiUser(slug: string): KickAPIUser | null {
	const cachedUser = kickApiUserCache.get(slug);
	if (cachedUser) {
		return cachedUser;
	}

	const localStorageCachedUser = localStorage.getItem(`kick.user.${slug}`);
	if (localStorageCachedUser) {
		const parsedUser = JSON.parse(localStorageCachedUser) as KickAPIUser;
		kickApiUserCache.set(slug, parsedUser);
		return parsedUser;
	}

	return null;
}

export async function fetchKickApiUser(slug: string): Promise<KickAPIUser> {
	const cachedUser = getCachedKickApiUser(slug);
	if (cachedUser) {
		return cachedUser;
	}

	const data = await fetch(`https://kick.com/api/v2/channels/${slug}`).then(
		res => res.json() as Promise<KickAPIUser>
	);
	if (!data || !data.slug) {
		throw new Error(`Failed to fetch Kick user with slug ${slug}`);
	}
	kickApiUserCache.set(slug, data);
	localStorage.setItem(`kick.user.${data.slug}`, JSON.stringify(data));
	return data as KickAPIUser;
}
