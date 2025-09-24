import { calcWhatPercent, objectEntries } from '@oldschoolgg/toolkit';
import type { activity_type_enum, Minigame, PlayerOwnedHouse } from '@prisma/client';
import type { Bank } from 'oldschooljs';

import type { ClueTier } from '@/lib/clues/clueTiers.js';
import { type BitField, BitFieldData, BOT_TYPE } from '@/lib/constants.js';
import { diaries, userhasDiaryTierSync } from '@/lib/diaries.js';
import { effectiveMonsters } from '@/lib/minions/data/killableMonsters/index.js';
import type { ClueBank, DiaryID, DiaryTierName } from '@/lib/minions/types.js';
import type { RobochimpUser } from '@/lib/roboChimp.js';
import { type MinigameName, minigameColumnToNameMap } from '@/lib/settings/minigames.js';
import Agility from '@/lib/skilling/skills/agility.js';
import type { MTame } from '@/lib/structures/MTame.js';
import { MUserStats } from '@/lib/structures/MUserStats.js';
import type { Skills } from '@/lib/types/index.js';
import { formatList, itemNameFromID } from '@/lib/util/smallUtils.js';
import { getParsedStashUnits, type ParsedUnit } from '@/mahoji/lib/abstracted_commands/stashUnitsCommand.js';

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
	tames: MTame[];
}

type ManualHasFunction = (args: RequirementUserArgs) => RequirementFailure[] | undefined | string | boolean;

type Requirement = {
	name?: string;
} & (
	| { name: string; has: ManualHasFunction }
	| { skillRequirements: Partial<Skills> }
	| { clRequirement: Bank | number[] }
	| { kcRequirement: Record<string, number | number[]> }
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
				`Required Skills: ${formatList(
					objectEntries(req.skillRequirements).map(([skill, level]) => `Level ${level} ${skill}`)
				)}`
			);
		}

		if ('clRequirement' in req) {
			requirementParts.push(
				`Items Must Be in CL: ${
					Array.isArray(req.clRequirement)
						? formatList(req.clRequirement.map(itemNameFromID))
						: req.clRequirement.toString()
				}`
			);
		}

		if ('kcRequirement' in req) {
			const requirementStrings = Object.entries(req.kcRequirement).map(([key, value]) => {
				if (typeof value === 'number') {
					const monster = effectiveMonsters.find(i => i.id === Number(key));
					return `${value}x ${monster?.name ?? 'Unknown'} KC`;
				}

				// checks combined KC if multiple IDs
				else if (Array.isArray(value)) {
					const groupName = key;
					const requiredKC = value[0];
					return `${requiredKC}x ${groupName} KC`;
				}

				return '';
			});

			requirementParts.push(`Kill Count Requirement: ${formatList(requirementStrings)}`);
		}

		if ('qpRequirement' in req) {
			requirementParts.push(`Quest Point Requirement: ${req.qpRequirement} QP`);
		}

		if ('lapsRequirement' in req) {
			requirementParts.push(
				`Agility Course Laps Requirements: ${formatList(
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
				`Minigame Requirements: ${formatList(
					Object.entries(req.minigames).map(([k, v]) => `${v}x ${minigameColumnToNameMap.get(k)} KC`)
				)}.`
			);
		}

		if ('bitfieldRequirement' in req) {
			requirementParts.push(`${BitFieldData[req.bitfieldRequirement].name}`);
		}

		if ('diaryRequirement' in req) {
			requirementParts.push(
				`Achievement Diary Requirement: ${formatList(
					req.diaryRequirement.map(i => `${i[1]} ${diaries.find(d => d.id === i[0])?.name}`)
				)}`
			);
		}

		if ('OR' in req) {
			const subResults = req.OR.map(i => this.formatRequirement(i));
			requirementParts.push(
				`ONE of the following requirements must be met: ${formatList(subResults.flat(100), 'or')}.`
			);
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
					reason: `You need these stats: ${formatList(insufficientLevels)}.`
				});
			}
		}

		if ('clRequirement' in requirement) {
			if (!user.cl.has(requirement.clRequirement)) {
				const missingItems = Array.isArray(requirement.clRequirement)
					? formatList(requirement.clRequirement.filter(i => !user.cl.has(i)).map(itemNameFromID))
					: requirement.clRequirement.clone().remove(user.cl);
				results.push({
					reason: `You need ${missingItems} in your CL.`
				});
			}
		}

		if ('kcRequirement' in requirement) {
			const kcs = stats.monsterScores;
			const missingRequirements: string[] = [];

			for (const [key, value] of Object.entries(requirement.kcRequirement)) {
				// Case 1: Handle the original, SINGLE monster KC check
				if (typeof value === 'number') {
					const monsterID = Number(key);
					const requiredKC = value;
					const userKC = kcs[monsterID] ?? 0; // Safely get user's KC, or 0

					if (userKC < requiredKC) {
						const monster = effectiveMonsters.find(m => m.id === monsterID);
						missingRequirements.push(`${requiredKC}x ${monster?.name ?? `ID ${monsterID}`}`);
					}
				}

				// Case 2: Handle our new, COMBINED KC check
				else if (Array.isArray(value)) {
					const groupName = key;
					const [requiredKC, ...monsterIDs] = value;

					// sum the KC for all monsters in the group
					const totalKC = monsterIDs.reduce((sum, id) => sum + (kcs[id] ?? 0), 0);

					if (totalKC < requiredKC) {
						missingRequirements.push(`${requiredKC}x ${groupName}`);
					}
				}
			}

			if (missingRequirements.length > 0) {
				results.push({
					reason: `You need the following KC's: ${formatList(missingRequirements)}.`
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
					reason: `You need these minigames scores: ${formatList(insufficientMinigames)}.`
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
					reason: `You need to finish these achievement diaries: ${formatList(
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
						return `${index + 1}. ${formatList(
							res.map(r => r.reason),
							'or'
						)})}`;
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

		const tames = await user.fetchTames();

		return {
			user,
			minigames,
			stashUnits,
			stats,
			roboChimpUser,
			clueCounts,
			poh,
			uniqueRunesCrafted,
			uniqueActivitiesDone: uniqueActivitiesDone.map(i => i.type),
			tames
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
				.map(i => `${i.requirement.name}: ${formatList(i.result.map(t => t.reason))}`),
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
