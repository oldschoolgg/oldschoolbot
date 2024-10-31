import type { Minigame, PlayerOwnedHouse, activity_type_enum } from '@prisma/client';
import { calcWhatPercent, objectEntries } from 'e';
import type { Bank } from 'oldschooljs';

import type { ParsedUnit } from '../../mahoji/lib/abstracted_commands/stashUnitsCommand';
import { getParsedStashUnits } from '../../mahoji/lib/abstracted_commands/stashUnitsCommand';
import type { ClueTier } from '../clues/clueTiers';
import type { BitField } from '../constants';
import { BOT_TYPE, BitFieldData } from '../constants';
import { diaries, userhasDiaryTierSync } from '../diaries';
import { effectiveMonsters } from '../minions/data/killableMonsters';
import type { ClueBank, DiaryID, DiaryTierName } from '../minions/types';
import type { RobochimpUser } from '../roboChimp';
import { type MinigameName, minigameColumnToNameMap } from '../settings/minigames';
import Agility from '../skilling/skills/agility';
import type { Skills } from '../types';
import { itemNameFromID, joinStrings } from '../util';
import { MUserStats } from './MUserStats';

export interface RequirementFailure {
	reason: string;
}

interface RequirementUserArgs {
	user: MUser;
	stashUnits: ParsedUnit[];
	minigames: Minigame;
	stats: MUserStats;
	roboChimpUser: RobochimpUser;
	clueCounts: ClueBank;
	poh: PlayerOwnedHouse;
	uniqueRunesCrafted: number[];
	uniqueActivitiesDone: activity_type_enum[];
}

type ManualHasFunction = (args: RequirementUserArgs) => RequirementFailure[] | undefined | string | boolean;

type Requirement = {
	name?: string;
} & (
	| { name: string; has: ManualHasFunction }
	| { skillRequirements: Partial<Skills> }
	| { clRequirement: Bank | number[] }
	| { kcRequirement: Record<number, number> }
	| { qpRequirement: number }
	| { lapsRequirement: Record<number, number> }
	| { sacrificedItemsRequirement: Bank }
	| { OR: Requirement[] }
	| { minigames: Partial<Record<MinigameName, number>> }
	| { bitfieldRequirement: BitField }
	| { diaryRequirement: [DiaryID, DiaryTierName][] }
	| { clueCompletions: Partial<Record<ClueTier['name'], number>> }
);

export class Requirements {
	requirements: Requirement[] = [];

	get size() {
		return this.requirements.length;
	}

	formatRequirement(req: Requirement): (string | string[])[] {
		const requirementParts: (string | string[])[] = [];
		if ('skillRequirements' in req) {
			requirementParts.push(
				`Required Skills: ${joinStrings(
					objectEntries(req.skillRequirements).map(([skill, level]) => `Level ${level} ${skill}`)
				)}`
			);
		}

		if ('clRequirement' in req) {
			requirementParts.push(
				`Items Must Be in CL: ${
					Array.isArray(req.clRequirement)
						? joinStrings(req.clRequirement.map(itemNameFromID))
						: req.clRequirement.toString()
				}`
			);
		}

		if ('kcRequirement' in req) {
			requirementParts.push(
				`Kill Count Requirement: ${joinStrings(
					Object.entries(req.kcRequirement).map(
						([k, v]) => `${v}x ${effectiveMonsters.find(i => i.id === Number(k))?.name} KC`
					)
				)}`
			);
		}

		if ('qpRequirement' in req) {
			requirementParts.push(`Quest Point Requirement: ${req.qpRequirement} QP`);
		}

		if ('lapsRequirement' in req) {
			requirementParts.push(
				`Agility Course Laps Requirements: ${joinStrings(
					Object.entries(req.lapsRequirement).map(
						([k, v]) => `${v}x laps of ${Agility.Courses.find(i => i.id === Number(k))?.name}`
					)
				)}.`
			);
		}

		if ('sacrificedItemsRequirement' in req) {
			requirementParts.push(`Sacrificed Items Requirement: ${req.sacrificedItemsRequirement.toString()}`);
		}

		if ('minigames' in req) {
			requirementParts.push(
				`Minigame Requirements: ${joinStrings(
					Object.entries(req.minigames).map(([k, v]) => `${v}x ${minigameColumnToNameMap.get(k)} KC`)
				)}.`
			);
		}

		if ('bitfieldRequirement' in req) {
			requirementParts.push(`${BitFieldData[req.bitfieldRequirement].name}`);
		}

		if ('diaryRequirement' in req) {
			requirementParts.push(
				`Achievement Diary Requirement: ${joinStrings(
					req.diaryRequirement.map(i => `${i[1]} ${diaries.find(d => d.id === i[0])?.name}`)
				)}`
			);
		}

		if ('OR' in req) {
			const subResults = req.OR.map(i => this.formatRequirement(i));
			requirementParts.push(`ONE of the following requirements must be met: ${joinStrings(subResults, 'or')}.`);
		}

		if ('name' in req && req.name) {
			requirementParts.push(req.name);
		}

		return requirementParts;
	}

	formatAllRequirements() {
		let finalStr = '';
		for (const req of this.requirements) {
			const formatted = this.formatRequirement(req);
			finalStr += `  - ${req.name}\n`;
			for (const subReq of formatted) {
				finalStr += `    - ${subReq}`;
			}
			finalStr += '\n';
		}

		return finalStr;
	}

	add(requirement: Requirement) {
		this.requirements.push(requirement);
		return this;
	}

	checkSingleRequirement(requirement: Requirement, userArgs: RequirementUserArgs): RequirementFailure[] {
		const { user, stats, minigames, clueCounts } = userArgs;
		const results: RequirementFailure[] = [];

		if ('has' in requirement) {
			const result = requirement.has(userArgs);
			if (typeof result === 'boolean') {
				if (!result) {
					results.push({ reason: requirement.name });
				}
			} else if (result) {
				if (typeof result === 'string') {
					results.push({ reason: result });
				} else {
					results.push(...result);
				}
			}
		}

		if ('skillRequirements' in requirement) {
			const insufficientLevels = [];
			for (const [skillName, level] of objectEntries(requirement.skillRequirements)) {
				if (user.skillsAsLevels[skillName] < level!) {
					insufficientLevels.push(`${level} ${skillName}`);
				}
			}
			if (insufficientLevels.length > 0) {
				results.push({
					reason: `You need these stats: ${joinStrings(insufficientLevels)}.`
				});
			}
		}

		if ('clRequirement' in requirement) {
			if (!user.cl.has(requirement.clRequirement)) {
				const missingItems = Array.isArray(requirement.clRequirement)
					? joinStrings(requirement.clRequirement.filter(i => !user.cl.has(i)).map(itemNameFromID))
					: requirement.clRequirement.clone().remove(user.cl);
				results.push({
					reason: `You need ${missingItems} in your CL.`
				});
			}
		}

		if ('kcRequirement' in requirement) {
			const kcs = stats.monsterScores;
			const missingMonsterNames = [];
			for (const [id, amount] of Object.entries(requirement.kcRequirement)) {
				if (!kcs[id] || kcs[id] < amount) {
					missingMonsterNames.push(
						`${amount}x ${effectiveMonsters.find(m => m.id === Number.parseInt(id))?.name ?? id}`
					);
				}
			}
			if (missingMonsterNames.length > 0) {
				results.push({
					reason: `You need the following KC's: ${joinStrings(missingMonsterNames)}.`
				});
			}
		}

		if ('qpRequirement' in requirement) {
			if (user.QP < requirement.qpRequirement) {
				results.push({
					reason: `You need ${requirement.qpRequirement} QP.`
				});
			}
		}

		if ('lapsRequirement' in requirement) {
			const laps = stats.lapsScores;
			for (const [id, amount] of Object.entries(requirement.lapsRequirement)) {
				if (!laps[id] || laps[id] < amount) {
					results.push({
						reason: `You need ${amount}x laps in the ${
							Agility.Courses.find(i => i.id.toString() === id)?.name
						} agility course.`
					});
				}
			}
		}

		if ('sacrificedItemsRequirement' in requirement) {
			const sacBank = stats.sacrifiedBank();
			if (!sacBank.has(requirement.sacrificedItemsRequirement)) {
				results.push({
					reason: `You need to have sacrificed these items: ${requirement.sacrificedItemsRequirement}.`
				});
			}
		}

		if ('minigames' in requirement) {
			const insufficientMinigames = [];
			for (const [minigame, score] of objectEntries(requirement.minigames)) {
				if (minigames[minigame] < score!) {
					insufficientMinigames.push(`${score}x ${minigame}`);
				}
			}
			if (insufficientMinigames.length > 0) {
				results.push({
					reason: `You need these minigames scores: ${joinStrings(insufficientMinigames)}.`
				});
			}
		}

		if ('bitfieldRequirement' in requirement) {
			if (!user.bitfield.includes(requirement.bitfieldRequirement)) {
				const bitName = BitFieldData[requirement.bitfieldRequirement].name;
				results.push({
					reason: `You need: ${bitName}.`
				});
			}
		}

		if ('diaryRequirement' in requirement) {
			const unmetDiaries = requirement.diaryRequirement
				.map(([diary, tier]) => {
					const { hasDiary, diaryGroup } = userhasDiaryTierSync(user, [diary, tier], {
						stats,
						minigameScores: minigames
					});
					return {
						has: hasDiary,
						tierName: `${tier} ${diaryGroup.name}`
					};
				})
				.filter(i => !i.has);
			if (unmetDiaries.length > 0) {
				results.push({
					reason: `You need to finish these achievement diaries: ${joinStrings(
						unmetDiaries.map(i => i.tierName)
					)}.`
				});
			}
		}

		if ('clueCompletions' in requirement) {
			for (const [key, val] of objectEntries(requirement.clueCompletions)) {
				if (!val || clueCounts[key] < val) {
					results.push({
						reason: `You need to complete ${val}x ${key} clues.`
					});
				}
			}
		}

		if ('OR' in requirement) {
			const orResults = requirement.OR.map(req => this.checkSingleRequirement(req, userArgs));
			if (!orResults.some(i => i.length === 0)) {
				results.push({
					reason: `You need to meet one of these requirements:\n${orResults.map((res, index) => {
						return `${index + 1}. ${joinStrings(res, 'or')})}`;
					})}`
				});
			}
		}

		return results;
	}

	static async fetchRequiredData(user: MUser) {
		const minigames = await user.fetchMinigames();
		const stashUnits = await getParsedStashUnits(user.id);
		const stats = await MUserStats.fromID(user.id);
		const roboChimpUser = await user.fetchRobochimpUser();
		const clueCounts =
			BOT_TYPE === 'OSB' ? stats.clueScoresFromOpenables() : (await user.calcActualClues()).clueCounts;

		const [_uniqueRunesCrafted, uniqueActivitiesDone, poh] = await prisma.$transaction([
			prisma.$queryRaw<{ rune_id: string }[]>`SELECT DISTINCT(data->>'runeID') AS rune_id
FROM activity
WHERE user_id = ${BigInt(user.id)}
AND type = 'Runecraft'
AND data->>'runeID' IS NOT NULL;`,
			prisma.$queryRaw<{ type: activity_type_enum }[]>`SELECT DISTINCT(type)
FROM activity
WHERE user_id = ${BigInt(user.id)}
GROUP BY type;`,
			prisma.playerOwnedHouse.upsert({ where: { user_id: user.id }, update: {}, create: { user_id: user.id } })
		]);
		const uniqueRunesCrafted = _uniqueRunesCrafted.map(i => Number(i.rune_id));
		return {
			user,
			minigames,
			stashUnits,
			stats,
			roboChimpUser,
			clueCounts,
			poh,
			uniqueRunesCrafted,
			uniqueActivitiesDone: uniqueActivitiesDone.map(i => i.type)
		};
	}

	static async checkMany(user: MUser, requirements: Requirements[]) {
		const data = await Requirements.fetchRequiredData(user);
		return requirements.map(i => i.check(data));
	}

	check(data: Awaited<ReturnType<typeof Requirements.fetchRequiredData>>) {
		const results = this.requirements.map(i => ({
			result: this.checkSingleRequirement(i, data),
			requirement: i
		}));

		const flatReasons = results.flatMap(r => r.result);
		const totalRequirements = this.requirements.length;
		const metRequirements = results.filter(i => i.result.length === 0).length;
		const completionPercentage = calcWhatPercent(metRequirements, totalRequirements);

		return {
			hasAll: results.filter(i => i.result.length !== 0).length === 0,
			reasonsDoesnt: results
				.filter(i => i.result.length > 0)
				.map(i => `${i.requirement.name}: ${joinStrings(i.result.map(t => t.reason))}`),
			rendered: `- ${flatReasons
				.filter(i => i.reason)
				.map(i => i.reason)
				.join('\n- ')}`,
			totalRequirements,
			metRequirements,
			completionPercentage
		};
	}
}
