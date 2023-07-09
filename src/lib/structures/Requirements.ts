import { Minigame, UserStats } from '@prisma/client';
import { objectEntries } from 'e';
import { Bank } from 'oldschooljs';

import { getParsedStashUnits, ParsedUnit } from '../../mahoji/lib/abstracted_commands/stashUnitsCommand';
import { BitField, BitFieldData } from '../constants';
import { effectiveMonsters } from '../minions/data/killableMonsters';
import { UserKourendFavour } from '../minions/data/kourendFavour';
import { MinigameName } from '../settings/minigames';
import { prisma } from '../settings/prisma';
import Agility from '../skilling/skills/agility';
import { ItemBank, Skills } from '../types';
import { itemNameFromID } from '../util';

export interface RequirementFailure {
	reason: string;
}

type ManualHasFunction = (args: {
	user: MUser;
	userStats: UserStats;
	stashUnits: ParsedUnit[];
	minigames: Minigame;
}) => Promise<RequirementFailure[]> | RequirementFailure[];

type Requirement =
	| ({
			name?: string;
	  } & { has: ManualHasFunction })
	| { skillRequirements: Partial<Skills> }
	| { clRequirement: Bank | number[] }
	| { kcRequirement: Record<number, number> }
	| { qpRequirement: number }
	| { lapsRequirement: Record<number, number> }
	| { sacrificedItemsRequirement: Bank }
	| { favour: Partial<UserKourendFavour> }
	| { OR: Requirement[] }
	| { minigames: Partial<Record<MinigameName, number>> }
	| { bitfieldRequirement: BitField };

export class Requirements {
	requirements: Requirement[] = [];

	add(requirement: Requirement) {
		this.requirements.push(requirement);
		return this;
	}

	async checkSingleRequirement(
		requirement: Requirement,
		{
			user,
			userStats,
			minigames,
			stashUnits
		}: { user: MUser; userStats: UserStats; minigames: Minigame; stashUnits: ParsedUnit[] }
	): Promise<RequirementFailure[]> {
		const results: RequirementFailure[] = [];

		if ('has' in requirement) {
			results.push(...(await requirement.has({ user, userStats, minigames, stashUnits })));
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
					reason: `You need these stats: ${insufficientLevels.join(', ')}.`
				});
			}
		}

		if ('clRequirement' in requirement) {
			if (!user.cl.has(requirement.clRequirement)) {
				const missingItems = Array.isArray(requirement.clRequirement)
					? requirement.clRequirement
							.filter(i => !user.cl.has(i))
							.map(itemNameFromID)
							.join(', ')
					: requirement.clRequirement.clone().remove(user.cl);
				results.push({
					reason: `You need ${missingItems} in your CL.`
				});
			}
		}

		if ('kcRequirement' in requirement) {
			const kcs = userStats.monster_scores as ItemBank;
			const missingMonsterNames = [];
			for (const [id, amount] of Object.entries(requirement.kcRequirement)) {
				if (!kcs[id] || kcs[id] < amount) {
					missingMonsterNames.push(`${amount}x ${effectiveMonsters.find(m => m.id === parseInt(id))!.name}`);
				}
			}
			if (missingMonsterNames.length > 0) {
				results.push({
					reason: `You need the following KC's: ${missingMonsterNames.join(', ')}.`
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
			const laps = userStats.laps_scores as ItemBank;
			for (const [id, amount] of Object.entries(requirement.lapsRequirement)) {
				if (!laps[id] || laps[id] < amount) {
					results.push({
						reason: `You need ${amount}x laps in the ${
							Agility.Courses.find(i => i.id.toString() === id)!.name
						} agility course.`
					});
				}
			}
		}

		if ('sacrificedItemsRequirement' in requirement) {
			const sacBank = new Bank().add(userStats.sacrificed_bank as ItemBank);
			if (!sacBank.has(requirement.sacrificedItemsRequirement)) {
				results.push({
					reason: `You need to have sacrificed these items: ${requirement.sacrificedItemsRequirement}.`
				});
			}
		}

		if ('favour' in requirement) {
			const insufficientFavour = [];
			for (const [house, favour] of objectEntries(requirement.favour)) {
				if (user.kourendFavour[house] < favour!) {
					insufficientFavour.push(`${favour}% favour in ${house}`);
				}
			}
			if (insufficientFavour.length > 0) {
				results.push({
					reason: `You need these favour: ${insufficientFavour.join(', ')}.`
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
					reason: `You need these minigames scores: ${insufficientMinigames.join(', ')}.`
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

		if ('OR' in requirement) {
			const orResults = await Promise.all(
				requirement.OR.map(req => this.checkSingleRequirement(req, { user, userStats, minigames, stashUnits }))
			);
			if (!orResults.some(i => i.length === 0)) {
				results.push({
					reason: `You need to meet one of these requirements:\n${orResults.map((res, index) => {
						return `${index + 1}. ${res.join(', ')})}`;
					})}`
				});
			}
		}

		return results;
	}

	async check(user: MUser) {
		const userStats = await prisma.userStats.upsert({
			where: {
				user_id: BigInt(user.id)
			},
			create: {
				user_id: BigInt(user.id)
			},
			update: {}
		});
		const minigames = await user.fetchMinigames();
		const stashUnits = await getParsedStashUnits(user.id);

		const requirementResults = [];
		for (const requirement of this.requirements) {
			requirementResults.push(
				this.checkSingleRequirement(requirement, { user, userStats, minigames, stashUnits })
			);
		}

		const results = (await Promise.all(requirementResults)).flat();

		return {
			hasAll: results.length === 0,
			reasonsDoesnt: results.map(i => i.reason),
			rendered: `- ${results.map(i => i.reason).join('\n- ')}`
		};
	}
}
