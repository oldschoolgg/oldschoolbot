import { formatOrdinal, toTitleCase } from '@oldschoolgg/toolkit';
import { UserEventType } from '@prisma/client';
import { bold } from 'discord.js';
import { noOp, Time } from 'e';
import { convertXPtoLVL, toKMB } from 'oldschooljs/dist/util/util';

import { MAXING_MESSAGE, SupportServer } from '../config';
import { Events, LEVEL_99_XP, MAX_TOTAL_LEVEL, MAX_XP } from './constants';
import { skillEmoji } from './data/emojis';
import { AddXpParams } from './minions/types';
import { prisma } from './settings/prisma';
import Skills from './skilling/skills';
import { insertUserEvent } from './util/userEvents';
import { sendToChannelID } from './util/webhook';

const skillsVals = Object.values(Skills);
const maxFilter = skillsVals.map(s => `"skills.${s.id}" >= ${LEVEL_99_XP}`).join(' AND ');
const makeQuery = (ironman: boolean) => `SELECT count(id)::int
FROM users
WHERE ${maxFilter}
${ironman ? 'AND "minion.ironman" = true' : ''};`;

async function howManyMaxed() {
	const [normies, irons] = (
		(await Promise.all([prisma.$queryRawUnsafe(makeQuery(false)), prisma.$queryRawUnsafe(makeQuery(true))])) as any
	)
		.map((i: any) => i[0].count)
		.map((i: any) => parseInt(i));

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
	sendToChannelID(SupportServer, { content: str }).catch(noOp);
	const kUser = await globalClient.fetchUser(user.id);
	kUser.send(MAXING_MESSAGE).catch(noOp);
}

export async function addXP(user: MUser, params: AddXpParams): Promise<string> {
	const currentXP = Number(user.user[`skills_${params.skillName}`]);
	const currentLevel = user.skillLevel(params.skillName);
	const currentTotalLevel = user.totalLevel;

	const name = toTitleCase(params.skillName);

	const skill = Object.values(Skills).find(skill => skill.id === params.skillName)!;

	const newXP = Math.min(MAX_XP, currentXP + params.amount);
	const totalXPAdded = newXP - currentXP;
	const newLevel = convertXPtoLVL(Math.floor(newXP));

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
		>(`SELECT COUNT(*)::int FROM users WHERE "skills.${params.skillName}" >= ${LEVEL_99_XP};`);

		let str = `${skill.emoji} **${user.badgedUsername}'s** minion, ${
			user.minionName
		}, just achieved level 99 in ${skillNameCased}! They are the ${formatOrdinal(
			parseInt(usersWith.count) + 1
		)} to get 99 ${skillNameCased}.`;

		if (user.isIronman) {
			const [ironmenWith] = await prisma.$queryRawUnsafe<
				{
					count: string;
				}[]
			>(
				`SELECT COUNT(*)::int FROM users WHERE "minion.ironman" = true AND "skills.${params.skillName}" >= ${LEVEL_99_XP};`
			);
			str += ` They are the ${formatOrdinal(parseInt(ironmenWith.count) + 1)} Ironman to get 99.`;
		}
		globalClient.emit(Events.ServerNotification, str);
	}

	await user.update({
		[`skills_${params.skillName}`]: Math.floor(newXP)
	});

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
			: `You received ${Math.ceil(preMax).toLocaleString()} ${skillEmoji[params.skillName]} XP`;
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
