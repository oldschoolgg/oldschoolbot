import { noOp, objectEntries } from '@oldschoolgg/toolkit';
import { cleanUsername } from '@oldschoolgg/toolkit/discord-util';
import { Stopwatch } from '@oldschoolgg/toolkit/structures';
import type { Prisma, User } from '@prisma/client';
import { type Guild, userMention } from 'discord.js';
import { calcCombatLevel, convertXPtoLVL } from 'oldschooljs';

import type { SkillNameType } from '@/lib/skilling/types.js';
import type { GearBank } from '@/lib/structures/GearBank.js';
import { makeBadgeString } from '@/lib/util/makeBadgeString.js';
import { sendToChannelID } from '@/lib/util/webhook.js';
import { usernameWithBadgesCache } from './cache.js';
import { BitField, globalConfig, MAX_LEVEL, MAX_XP } from './constants.js';
import type { MUserClass } from './MUser.js';
import type { Skills } from './types/index.js';
import type { GroupMonsterActivityTaskOptions } from './types/minions.js';

// @ts-expect-error ignore
BigInt.prototype.toJSON = function () {
	return this.toString();
};

export function isGroupActivity(data: any): data is GroupMonsterActivityTaskOptions {
	return 'users' in data;
}

export function getSupportGuild(): Guild | null {
	if (!globalClient || Object.keys(globalClient).length === 0) return null;
	const guild = globalClient.guilds.cache.get(globalConfig.supportServerID);
	if (!guild) return null;
	return guild;
}

export function skillsMeetRequirements(skills: Skills, requirements: Skills) {
	for (const [skillName, level] of objectEntries(requirements)) {
		if ((skillName as string) === 'combat') {
			if (calcCombatLevel(skills as any, MAX_LEVEL) < level!) return false;
		} else {
			const xpHas = skills[skillName];
			const levelHas = convertXPtoLVL(xpHas ?? 1, MAX_LEVEL);
			if (levelHas < level!) return false;
		}
	}
	return true;
}

export function skillingPetDropRate(
	user: MUserClass | GearBank | number,
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

export async function getUsername(_id: string | bigint): Promise<string> {
	const id = _id.toString();
	const cached = usernameWithBadgesCache.get(id);
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
		const djsUser = await globalClient.users.fetch(id).catch(() => null);
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

	const newValue = createUsernameWithBadges(user);
	usernameWithBadgesCache.set(id, newValue);
	await prisma.user.update({
		where: {
			id
		},
		data: {
			username_with_badges: newValue
		}
	});
	return newValue;
}

export function getUsernameSync(_id: string | bigint) {
	return usernameWithBadgesCache.get(_id.toString()) ?? 'Unknown';
}

export async function runTimedLoggedFn<T>(name: string, fn: () => Promise<T>, threshholdToLog = 100): Promise<T> {
	const logger = globalConfig.isProduction ? debugLog : console.log;
	const stopwatch = new Stopwatch();
	stopwatch.start();
	const result = await fn();
	stopwatch.stop();
	if (!globalConfig.isProduction || stopwatch.duration > threshholdToLog) {
		logger(`Took ${stopwatch} to do ${name}`);
	}
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

	await sendToChannelID(globalConfig.moderatorLogsChannels, {
		content: `${message} ${globalConfig.adminUserIDs.map(i => userMention(i)).join(', ')}`,
		allowedMentions: { users: globalConfig.adminUserIDs }
	}).catch(noOp);
}

export function ISODateString(date?: Date) {
	return (date ?? new Date()).toISOString().slice(0, 10);
}
