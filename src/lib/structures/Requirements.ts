import { UserStats } from '@prisma/client';
import { objectEntries } from 'e';
import { Bank } from 'oldschooljs';

import { effectiveMonsters } from '../minions/data/killableMonsters';
import { prisma } from '../settings/prisma';
import Agility from '../skilling/skills/agility';
import { ItemBank, Skills } from '../types';

export interface RequirementFailure {
	reason: string;
}

type ManualHasFunction = (args: {
	user: MUser;
	userStats: UserStats;
}) => Promise<RequirementFailure[]> | RequirementFailure[];

type Requirement =
	| ({
			name?: string;
	  } & { has: ManualHasFunction })
	| { skillRequirements: Partial<Skills> }
	| { clRequirement: Bank }
	| { kcRequirement: Record<number, number> }
	| { qpRequirement: number }
	| { lapsRequirement: Record<number, number> }
	| { sacrificedItemsRequirement: Bank };

export class Requirements {
	requirements: Requirement[] = [];

	add(requirement: Requirement) {
		this.requirements.push(requirement);
		return this;
	}

	async checkSingleRequirement(
		requirement: Requirement,
		user: MUser,
		userStats: UserStats
	): Promise<RequirementFailure[]> {
		const results: RequirementFailure[] = [];

		if ('has' in requirement) {
			results.push(...(await requirement.has({ user, userStats })));
		}

		if ('skillRequirements' in requirement) {
			const insufficientLevels = [];
			for (const [skillName, level] of objectEntries(requirement.skillRequirements)) {
				if (user.skillsAsLevels[skillName] < level!) {
					insufficientLevels.push(`${level} ${skillName}`);
				}
			}
			if (insufficientLevels) {
				results.push({
					reason: `You need these stats: ${insufficientLevels.join(', ')}.`
				});
			}
		}

		if ('clRequirement' in requirement) {
			if (!user.cl.has(requirement.clRequirement)) {
				const missingItems = requirement.clRequirement.clone().remove(user.cl);
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
						} KC.`
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

		const requirementResults = [];
		for (const requirement of this.requirements) {
			requirementResults.push(this.checkSingleRequirement(requirement, user, userStats));
		}

		const results = (await Promise.all(requirementResults)).flat();

		return {
			hasAll: results.length === 0,
			reasonsDoesnt: results.map(i => i.reason),
			rendered: `- ${results.map(i => i.reason).join('\n- ')}`
		};
	}
}
