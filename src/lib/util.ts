import { userMention } from '@oldschoolgg/discord';
import { cleanUsername } from '@oldschoolgg/toolkit';
import { convertXPtoLVL } from 'oldschooljs';

import type { Prisma, User } from '@/prisma/main.js';
import { BitField, globalConfig, MAX_LEVEL, MAX_XP } from '@/lib/constants.js';
import type { SkillNameType } from '@/lib/skilling/types.js';
import type { GearBank } from '@/lib/structures/GearBank.js';
import { makeBadgeString } from '@/lib/util/makeBadgeString.js';

// @ts-expect-error ignore
BigInt.prototype.toJSON = function () {
	return this.toString();
};

export function skillingPetDropRate(
	user: MUser | GearBank | number,
	skill: SkillNameType,
	baseDropRate: number
): { petDropRate: number } {
	const xp = typeof user === 'number' ? user : user.skillsAsXP[skill];
	const twoHundredMillXP = xp >= MAX_XP;
	const skillLevel = convertXPtoLVL(xp, MAX_LEVEL);
	const petRateDivisor = twoHundredMillXP ? 15 : 1;
	const dropRate = Math.floor((baseDropRate - skillLevel * 25) / petRateDivisor);
	return { petDropRate: dropRate };
}

function createUsernameWithBadges(user: Pick<User, 'username' | 'badges' | 'minion_ironman'>): string {
	if (!user.username) return 'Unknown';
	const badges = makeBadgeString(user.badges, user.minion_ironman);
	return `${badges ? `${badges} ` : ''}${user.username}`;
}

export async function fetchUsernameAndCache(_id: string | bigint): Promise<string> {
	const id = _id.toString();
	const cached = await Cache._getBadgedUsernameRaw(id);
	if (cached) return cached;
	let user = await prisma.user.upsert({
		where: {
			id
		},
		select: {
			username: true,
			badges: true,
			minion_ironman: true
		},
		create: {
			id
		},
		update: {}
	});

	// If no username available, fetch it
	if (!user?.username && !process.env.TEST) {
		const djsUser = await globalClient.fetchUser(id).catch(() => null);
		if (djsUser) {
			user = await prisma.user.update({
				where: {
					id
				},
				data: {
					username: cleanUsername(djsUser.username)
				}
			});
		}
		// Now the user has a username, and we can continue to create the username with badges.
	}

	const badgedUsername = createUsernameWithBadges(user);
	await Promise.all([
		Cache.setBadgedUsername(id, badgedUsername),
		prisma.user.update({
			where: {
				id
			},
			data: {
				username_with_badges: badgedUsername
			}
		})
	]);
	return badgedUsername;
}

export async function runTimedLoggedFn<T>(name: string, fn: () => Promise<T>): Promise<T> {
	const start = performance.now();
	const result = await fn();
	const end = performance.now();
	Logging.logPerf({
		text: name,
		duration: end - start
	});
	return result;
}

export function logWrapFn<T extends (...args: any[]) => Promise<unknown>>(
	name: string,
	fn: T
): (...args: Parameters<T>) => ReturnType<T> {
	return (...args: Parameters<T>): ReturnType<T> => runTimedLoggedFn(name, () => fn(...args)) as ReturnType<T>;
}

export function isModOrAdmin(user: MUser) {
	return globalConfig.adminUserIDs.includes(user.id) || user.bitfield.includes(BitField.isModerator);
}

export type JsonKeys<T> = {
	[K in keyof T]: T[K] extends Prisma.JsonValue ? K : never;
}[keyof T];

export async function adminPingLog(message: string) {
	if (!globalConfig.isProduction) {
		console.log(message);
		return;
	}

	await globalClient.sendMessage(globalConfig.moderatorLogsChannels, {
		content: `${message} ${globalConfig.adminUserIDs.map(i => userMention(i)).join(', ')}`,
		allowedMentions: { users: globalConfig.adminUserIDs }
	});
}
