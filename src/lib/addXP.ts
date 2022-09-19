import { increaseNumByPercent, noOp, notEmpty, objectValues, Time } from 'e';
import { Item } from 'oldschooljs/dist/meta/types';

import { MAXING_MESSAGE } from '../config';
import {
	Channel,
	Events,
	GLOBAL_BSO_XP_MULTIPLIER,
	LEVEL_120_XP,
	MAX_TOTAL_LEVEL,
	MAX_XP,
	skillEmoji
} from './constants';
import { gorajanArcherOutfit, gorajanOccultOutfit, gorajanWarriorOutfit } from './data/CollectionsExport';
import { getSimilarItems } from './data/similarItems';
import { AddXpParams } from './minions/types';
import { prisma } from './settings/prisma';
import Skillcapes from './skilling/skillcapes';
import Skills from './skilling/skills';
import { SkillsEnum } from './skilling/types';
import { convertLVLtoXP, convertXPtoLVL, itemNameFromID, toKMB, toTitleCase } from './util';
import { formatOrdinal } from './util/formatOrdinal';
import getOSItem from './util/getOSItem';
import resolveItems from './util/resolveItems';
import { sendToChannelID } from './util/webhook';

const skillsVals = Object.values(Skills);
const maxFilter = skillsVals.map(s => `"skills.${s.id}" >= ${LEVEL_120_XP}`).join(' AND ');
const makeQuery = (ironman: boolean) => `SELECT count(id)
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

export async function onMax(user: MUser) {
	const { normies, irons } = await howManyMaxed();

	const str = `🎉 ${
		user.usernameOrMention
	}'s minion just achieved level 120 in every skill, they are the **${formatOrdinal(normies)}** minion to be maxed${
		user.isIronman ? `, and the **${formatOrdinal(irons)}** ironman to max.` : '.'
	} 🎉`;

	globalClient.emit(Events.ServerNotification, str);
	sendToChannelID(Channel.BSOGeneral, { content: str }).catch(noOp);
	const djsUser = await globalClient.users.fetch(user.id);
	djsUser.send(MAXING_MESSAGE).catch(noOp);
}

interface StaticXPBoost {
	item: Item;
	boostPercent: number;
	skill: SkillsEnum;
}
const staticXPBoosts = new Map<SkillsEnum, StaticXPBoost[]>().set(SkillsEnum.Firemaking, [
	{
		item: getOSItem('Flame gloves'),
		boostPercent: 2.5,
		skill: SkillsEnum.Firemaking
	},
	{
		item: getOSItem('Ring of fire'),
		boostPercent: 2.5,
		skill: SkillsEnum.Firemaking
	}
]);

// Build list of all Master capes including combined capes.
const allMasterCapes = Skillcapes.map(i => i.masterCape)
	.map(msc => getSimilarItems(msc.id))
	.flat(Infinity) as number[];

function getEquippedMasterCapes(user: MUser) {
	return objectValues(user.gear)
		.map(val => val.cape)
		.filter(notEmpty)
		.map(i => i.item);
}

export async function addXP(userID: string, params: AddXpParams): Promise<string> {
	const user = await mUserFetch(userID);
	const currentXP = Number(user.user[`skills_${params.skillName}`]);
	const currentLevel = user.skillLevel(params.skillName);
	const currentTotalLevel = user.totalLevel;
	const multiplier = params.multiplier !== false;
	if (multiplier) {
		params.amount *= GLOBAL_BSO_XP_MULTIPLIER;
	}
	const allCapes = getEquippedMasterCapes(user);

	// Get cape object from MasterSkillCapes that matches active skill.
	const matchingCape =
		multiplier || params.masterCapeBoost
			? Skillcapes.find(cape => params.skillName === cape.skill)?.masterCape
			: undefined;
	// If the matching cape [or similar] is equipped, isMatchingCape = matched itemId.
	const isMatchingCape =
		(multiplier || params.masterCapeBoost) && matchingCape
			? allCapes.find(cape => getSimilarItems(matchingCape.id).includes(cape))
			: false;
	// Get the masterCape itemId for use in text output, and check for non-matching cape.
	const masterCape = isMatchingCape
		? isMatchingCape
		: multiplier || params.masterCapeBoost === true
		? allMasterCapes.find(cape => allCapes.includes(cape))
		: undefined;
	if (masterCape) {
		params.amount = increaseNumByPercent(params.amount, isMatchingCape ? 8 : 3);
	}
	// Check if each gorajan set is equipped:
	const wildyOutfit = user.gear.wildy;
	const gorajanMeleeEquipped =
		user.gear.melee.hasEquipped(gorajanWarriorOutfit, true) || wildyOutfit.hasEquipped(gorajanWarriorOutfit, true);
	const gorajanRangeEquipped =
		user.gear.range.hasEquipped(gorajanArcherOutfit, true) || wildyOutfit.hasEquipped(gorajanArcherOutfit, true);
	const gorajanMageEquipped =
		user.gear.mage.hasEquipped(gorajanOccultOutfit, true) || wildyOutfit.hasEquipped(gorajanOccultOutfit, true);
	// Determine if boost should apply based on skill + equipped sets:
	let gorajanBoost = false;
	const gorajanMeleeBoost =
		multiplier &&
		[SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Defence].includes(params.skillName) &&
		gorajanMeleeEquipped;
	const gorajanRangeBoost = multiplier && params.skillName === SkillsEnum.Ranged && gorajanRangeEquipped;
	const gorajanMageBoost = multiplier && params.skillName === SkillsEnum.Magic && gorajanMageEquipped;
	// 2x HP if all 3 gorajan sets are equipped:
	const gorajanHpBoost =
		multiplier &&
		params.skillName === SkillsEnum.Hitpoints &&
		gorajanMeleeEquipped &&
		gorajanRangeEquipped &&
		gorajanMageEquipped;
	if (gorajanMeleeBoost || gorajanRangeBoost || gorajanMageBoost || gorajanHpBoost) {
		params.amount *= 2;
		gorajanBoost = true;
	}
	let firstAgeEquipped = 0;
	for (const item of resolveItems([
		'First age tiara',
		'First age amulet',
		'First age cape',
		'First age bracelet',
		'First age ring'
	])) {
		if (user.hasEquipped(item)) {
			firstAgeEquipped += 1;
		}
	}
	if (firstAgeEquipped > 0) {
		if (firstAgeEquipped === 5) {
			params.amount = increaseNumByPercent(params.amount, 6);
		} else {
			params.amount = increaseNumByPercent(params.amount, firstAgeEquipped);
		}
	}
	const boosts = staticXPBoosts.get(params.skillName);
	if (boosts && !params.artificial) {
		for (const booster of boosts) {
			if (user.hasEquipped(booster.item.id)) {
				params.amount = increaseNumByPercent(params.amount, booster.boostPercent);
			}
		}
	}
	params.amount = Math.floor(params.amount);
	const name = toTitleCase(params.skillName);

	const skill = Object.values(Skills).find(skill => skill.id === params.skillName)!;

	const newXP = Math.min(MAX_XP, currentXP + params.amount);
	const totalXPAdded = newXP - currentXP;
	const newLevel = convertXPtoLVL(newXP, 120);

	// Pre-MAX_XP
	let preMax = -1;
	if (totalXPAdded > 0) {
		preMax = totalXPAdded;
		await prisma.xPGain.create({
			data: {
				user_id: BigInt(user.id),
				skill: params.skillName,
				xp: Math.floor(totalXPAdded),
				artificial: params.artificial ? true : null
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
				post_max: true
			}
		});
	}

	// If they reached a XP milestone, send a server notification.
	if (preMax !== -1) {
		for (const XPMilestone of [
			50_000_000, 100_000_000, 150_000_000, 200_000_000, 1_000_000_000, 2_000_000_000, 3_000_000_000,
			4_000_000_000
		]) {
			if (newXP < XPMilestone) break;

			if (currentXP < XPMilestone && newXP >= XPMilestone) {
				globalClient.emit(
					Events.ServerNotification,
					`${skill.emoji} **${user.usernameOrMention}'s** minion, ${
						user.minionName
					}, just achieved ${newXP.toLocaleString()} XP in ${toTitleCase(params.skillName)}!`
				);
				break;
			}
		}
	}

	// // If they just reached 99, send a server notification.
	// if (currentLevel < 99 && newLevel >= 99) {
	// 	const skillNameCased = toTitleCase(params.skillName);
	// 	const [usersWith] = await prisma.$queryRawUnsafe<
	// 		{
	// 			count: string;
	// 		}[]
	// 	>(`SELECT COUNT(*) FROM users WHERE "skills.${params.skillName}" >= ${LEVEL_99_XP};`);

	// 	let str = `${skill.emoji} **${user.usernameOrMention}'s** minion, ${
	// 		user.minionName
	// 	}, just achieved level 99 in ${skillNameCased}! They are the ${formatOrdinal(
	// 		parseInt(usersWith.count) + 1
	// 	)} to get 99 ${skillNameCased}.`;

	// 	if (user.isIronman) {
	// 		const [ironmenWith] = await prisma.$queryRawUnsafe<
	// 			{
	// 				count: string;
	// 			}[]
	// 		>(
	// 			`SELECT COUNT(*) FROM users WHERE "minion.ironman" = true AND "skills.${params.skillName}" >= ${LEVEL_99_XP};`
	// 		);
	// 		str += ` They are the ${formatOrdinal(parseInt(ironmenWith.count) + 1)} Ironman to get 99.`;
	// 	}
	// 	globalClient.emit(Events.ServerNotification, str);
	// }

	// Announcements with nthUser
	for (const { type, value } of [
		{ type: 'lvl', value: 120 },
		{ type: 'xp', value: 500_000_000 },
		{ type: 'xp', value: 5_000_000_000 }
	]) {
		// Ignore check
		if (type === 'lvl') {
			if (newLevel < value || currentLevel >= value || newLevel < value) continue;
		} else if (newXP < value || currentXP >= value || newXP < value) continue;
		const skillNameCased = toTitleCase(params.skillName);
		let resultStr = '';
		let queryValue = 0;
		// Prepare the message to be sent
		if (type === 'lvl') {
			queryValue = convertLVLtoXP(value);
			resultStr += `${skill.emoji} **${user.usernameOrMention}'s** minion, ${
				user.minionName
			}, just achieved level ${value} in ${skillNameCased}! They are the {nthUser} to get level ${value} in ${skillNameCased}.${
				!user.isIronman ? '' : ` They are the {nthIron} to get level ${value} in ${skillNameCased}`
			}`;
		} else {
			queryValue = value;
			resultStr += `${skill.emoji} **${user.usernameOrMention}'s** minion, ${
				user.minionName
			}, just achieved ${toKMB(value)} XP in ${skillNameCased}! They are the {nthUser} to get ${toKMB(
				value
			)} in ${skillNameCased}.${
				!user.isIronman ? '' : ` They are the {nthIron} to get ${toKMB(value)} XP in ${skillNameCased}`
			}`;
		}
		// Query nthUser and nthIronman
		const [nthUser] = await prisma.$queryRawUnsafe<
			{
				count: string;
			}[]
		>(`SELECT COUNT(*) FROM users WHERE "skills.${params.skillName}" >= ${queryValue};`);
		resultStr = resultStr.replace('{nthUser}', formatOrdinal(Number(nthUser.count) + 1));
		if (user.isIronman) {
			const [nthIron] = await prisma.$queryRawUnsafe<
				{
					count: string;
				}[]
			>(
				`SELECT COUNT(*) FROM users WHERE "minion.ironman" = true AND "skills.${params.skillName}" >= ${queryValue};`
			);
			resultStr = resultStr.replace('{nthIron}', formatOrdinal(Number(nthIron.count) + 1));
		}
		globalClient.emit(Events.ServerNotification, resultStr);
	}

	if (currentXP >= MAX_XP) {
		let xpStr = '';
		if (params.duration && !params.minimal) {
			xpStr += `You received no XP because you have ${toKMB(MAX_XP)} ${name} XP already.`;
			xpStr += ` Tracked ${params.amount.toLocaleString()} ${skill.emoji} XP.`;
			let rawXPHr = (params.amount / (params.duration / Time.Minute)) * 60;
			rawXPHr = Math.floor(rawXPHr / 1000) * 1000;
			xpStr += ` (${toKMB(rawXPHr)}/Hr)`;
		} else {
			xpStr += `:no_entry_sign: Tracked ${params.amount.toLocaleString()} ${skill.emoji} XP.`;
		}
		return xpStr;
	}

	await user.update({
		[`skills_${params.skillName}`]: Math.floor(newXP)
	});

	let str = '';
	if (preMax !== -1) {
		str = params.minimal
			? `+${Math.ceil(params.amount).toLocaleString()} ${skillEmoji[params.skillName]}`
			: `You received ${Math.ceil(params.amount).toLocaleString()} ${skillEmoji[params.skillName]} XP`;
		if (masterCape && !params.minimal) {
			if (isMatchingCape) {
				str += ` You received 8% bonus XP for having a ${itemNameFromID(masterCape)}.`;
			} else {
				str += ` You received 3% bonus XP for having a ${itemNameFromID(masterCape)}.`;
			}
		}
		if (gorajanBoost && !params.minimal) {
			str += ' (2x boost from Gorajan armor)';
		}
		if (firstAgeEquipped && !params.minimal) {
			str += ` You received ${
				firstAgeEquipped === 5 ? 6 : firstAgeEquipped
			}% bonus XP for First age outfit items.`;
		}

		if (params.duration && !params.minimal) {
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
