import { UserStats } from '@prisma/client';
import { Bank } from 'oldschooljs';

import { effectiveMonsters } from '../minions/data/killableMonsters';
import { prisma } from '../settings/prisma';
import Agility from '../skilling/skills/agility';
import { ItemBank, Skills } from '../types';
import { formatSkillRequirements, skillsMeetRequirements } from '../util';

type RequirementResult =
	| {
			doesHave: true;
			reason: null;
	  }
	| {
			doesHave: false;
			reason: string;
	  };

type ManualHasFunction = (args: {
	user: MUser;
	userStats: UserStats;
}) => Promise<RequirementResult> | RequirementResult;

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
	): Promise<RequirementResult> {
		if ('has' in requirement) {
			const has = await requirement.has({ user, userStats });
			if (!has.doesHave) return has;
		}

		if ('skillRequirements' in requirement) {
			if (!skillsMeetRequirements(user.skillsAsXP, requirement.skillRequirements)) {
				return {
					doesHave: false,
					reason: `You need ${formatSkillRequirements(requirement.skillRequirements)}.`
				};
			}
		}

		if ('clRequirement' in requirement) {
			if (!user.cl.has(requirement.clRequirement)) {
				const missingItems = requirement.clRequirement.clone().remove(user.cl);
				return {
					doesHave: false,
					reason: `You need ${missingItems} in your CL.`
				};
			}
		}

		if ('kcRequirement' in requirement) {
			const kcs = userStats.monster_scores as ItemBank;

			for (const [id, amount] of Object.entries(requirement.kcRequirement)) {
				if (!kcs[id] || kcs[id] < amount) {
					return {
						doesHave: false,
						reason: `You need ${amount}x ${effectiveMonsters.find(m => m.id === parseInt(id))!.name} KC.`
					};
				}
			}
		}

		if ('qpRequirement' in requirement) {
			if (user.QP < requirement.qpRequirement) {
				return {
					doesHave: false,
					reason: `You need ${requirement.qpRequirement} QP.`
				};
			}
		}

		if ('lapsRequirement' in requirement) {
			const laps = userStats.laps_scores as ItemBank;
			for (const [id, amount] of Object.entries(requirement.lapsRequirement)) {
				if (!laps[id] || laps[id] < amount) {
					return {
						doesHave: false,
						reason: `You need ${amount}x laps in the ${
							Agility.Courses.find(i => i.id.toString() === id)!.name
						} KC.`
					};
				}
			}
		}

		if ('sacrificedItemsRequirement' in requirement) {
			const sacBank = new Bank().add(userStats.sacrificed_bank as ItemBank);
			if (!sacBank.has(requirement.sacrificedItemsRequirement)) {
				return {
					doesHave: false,
					reason: `You need to have sacrificed these items: ${requirement.sacrificedItemsRequirement}.`
				};
			}
		}

		return {
			doesHave: true,
			reason: null
		};
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

		const results = await Promise.all(requirementResults);

		return {
			hasAll: results.every(i => i.doesHave),
			reasonsDoesnt: results.filter(i => !i.doesHave).map(i => i.reason!)
		};
	}
}
