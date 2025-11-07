import { bold } from '@oldschoolgg/discord';
import { Events, formatOrdinal, Time, toTitleCase } from '@oldschoolgg/toolkit';
import { convertXPtoLVL, toKMB } from 'oldschooljs';

import { UserEventType } from '@/prisma/main/enums.js';
import type { User } from '@/prisma/main.js';
import { globalConfig, MAX_LEVEL, MAX_LEVEL_XP, MAX_TOTAL_LEVEL, MAX_XP } from '@/lib/constants.js';
import { skillEmoji } from '@/lib/data/emojis.js';
import type { AddXpParams } from '@/lib/minions/types.js';
import { Skills } from '@/lib/skilling/skills/index.js';
import { insertUserEvent } from '@/lib/util/userEvents.js';

const skillsVals = Object.values(Skills);
const maxFilter = skillsVals.map(s => `"skills.${s.id}" >= ${MAX_LEVEL_XP}`).join(' AND ');
const makeQuery = (ironman: boolean) => `SELECT count(id)::int
FROM users
WHERE ${maxFilter}
${ironman ? 'AND "minion.ironman" = true' : ''};`;

async function howManyMaxed() {
	const [normies, irons]: number[] = (
		await prisma.$transaction([
			prisma.$queryRawUnsafe<{ count: bigint }[]>(makeQuery(false)),
			prisma.$queryRawUnsafe<{ count: bigint }[]>(makeQuery(true))
		])
	)
		.map(i => i[0].count)
		.map(i => Number(i));

	return {
		normies,
		irons
	};
}

async function onMax(user: MUser) {
	const { normies, irons } = await howManyMaxed();

	const str = `🎉 ${
		user.badgedUsername
	}'s minion just achieved level 99 in every skill, they are the **${formatOrdinal(normies)}** minion to be maxed${
		user.isIronman ? `, and the **${formatOrdinal(irons)}** ironman to max.` : '.'
	} 🎉`;

	globalClient.emit(Events.ServerNotification, str);
	globalClient.sendMessage(globalConfig.supportServerID, { content: str });
	const clientSettings = await ClientSettings.fetch({ maxing_message: true });
	globalClient.sendDm(user.id, clientSettings.maxing_message);
}

export async function addXP(user: MUser, params: AddXpParams): Promise<string> {
	const currentXP = Number(user.user[`skills_${params.skillName}`]);
	const currentLevel = user.skillLevel(params.skillName);
	const currentTotalLevel = user.totalLevel;

	const name = toTitleCase(params.skillName);

	const skill = Object.values(Skills).find(skill => skill.id === params.skillName)!;

	const newXP = Math.min(MAX_XP, currentXP + params.amount);
	const totalXPAdded = newXP - currentXP;
	const newLevel = convertXPtoLVL(Math.floor(newXP), MAX_LEVEL);

	// Pre-MAX_XP
	let preMax = -1;
	if (totalXPAdded > 0) {
		preMax = totalXPAdded;
		await prisma.xPGain.create({
			data: {
				user_id: BigInt(user.id),
				skill: params.skillName,
				xp: Math.floor(totalXPAdded),
				artificial: params.artificial ? true : null,
				source: params.source
			}
		});
	}

	// Post-MAX_XP
	if (params.amount - totalXPAdded > 0) {
		await prisma.xPGain.create({
			data: {
				user_id: BigInt(user.id),
				skill: params.skillName,
				xp: Math.floor(params.amount - totalXPAdded),
				artificial: params.artificial ? true : null,
				post_max: true,
				source: params.source
			}
		});
	}

	// If they reached a XP milestone, send a server notification.
	if (preMax !== -1) {
		for (const XPMilestone of [50_000_000, 100_000_000, 150_000_000, MAX_XP]) {
			if (newXP < XPMilestone) break;

			if (currentXP < XPMilestone && newXP >= XPMilestone) {
				globalClient.emit(
					Events.ServerNotification,
					`${skill.emoji} **${user.badgedUsername}'s** minion, ${
						user.minionName
					}, just achieved ${newXP.toLocaleString()} XP in ${toTitleCase(params.skillName)}!`
				);
				break;
			}
		}
	}

	if (currentXP < MAX_XP && newXP >= MAX_XP) {
		await insertUserEvent({ userID: user.id, type: UserEventType.MaxXP, skill: skill.id });
	}

	// If they just reached 99, send a server notification.
	if (currentLevel < 99 && newLevel >= 99) {
		await insertUserEvent({ userID: user.id, type: UserEventType.MaxLevel, skill: skill.id });
		const skillNameCased = toTitleCase(params.skillName);
		const [usersWith] = await prisma.$queryRawUnsafe<
			{
				count: string;
			}[]
		>(`SELECT COUNT(*)::int FROM users WHERE "skills.${params.skillName}" >= ${MAX_LEVEL_XP};`);

		let str = `${skill.emoji} **${user.badgedUsername}'s** minion, ${
			user.minionName
		}, just achieved level 99 in ${skillNameCased}! They are the ${formatOrdinal(
			Number.parseInt(usersWith.count) + 1
		)} to get 99 ${skillNameCased}.`;

		if (user.isIronman) {
			const [ironmenWith] = await prisma.$queryRawUnsafe<
				{
					count: string;
				}[]
			>(
				`SELECT COUNT(*)::int FROM users WHERE "minion.ironman" = true AND "skills.${params.skillName}" >= ${MAX_LEVEL_XP};`
			);
			str += ` They are the ${formatOrdinal(Number.parseInt(ironmenWith.count) + 1)} Ironman to get 99.`;
		}
		globalClient.emit(Events.ServerNotification, str);
	}

	await prisma.$queryRawUnsafe(
		`UPDATE users SET "skills.${params.skillName}" = ${Math.floor(newXP)} WHERE id = '${user.id}';`
	);
	(user.user as User)[`skills_${params.skillName}`] = BigInt(Math.floor(newXP));
	user.updateProperties();

	if (currentXP < MAX_XP && newXP === MAX_XP && Object.values(user.skillsAsXP).every(xp => xp === MAX_XP)) {
		globalClient.emit(
			Events.ServerNotification,
			bold(
				`🎉 ${skill.emoji} **${user.badgedUsername}'s** minion, ${user.minionName}, just achieved the maximum possible total XP!`
			)
		);
		await insertUserEvent({ userID: user.id, type: UserEventType.MaxTotalXP });
	}

	let str = '';
	if (preMax !== -1) {
		str += params.minimal
			? `+${Math.ceil(preMax).toLocaleString()} ${skillEmoji[params.skillName]}`
			: `You received ${Math.ceil(preMax).toLocaleString()} ${skillEmoji[params.skillName]} XP.`;
		if (params.duration) {
			let rawXPHr = (params.amount / (params.duration / Time.Minute)) * 60;
			rawXPHr = Math.floor(rawXPHr / 1000) * 1000;
			str += ` (${toKMB(rawXPHr)}/Hr)`;
		}

		if (currentTotalLevel < MAX_TOTAL_LEVEL && user.totalLevel >= MAX_TOTAL_LEVEL) {
			str += '\n\n**Congratulations, your minion has reached the maximum total level!**\n\n';
			onMax(user);
		} else if (currentLevel !== newLevel) {
			str += params.minimal
				? `(Levelled up to ${newLevel})`
				: `\n**Congratulations! Your ${name} level is now ${newLevel}** 🎉`;
		}
	}
	return str;
}
