import { toTitleCase } from '@oldschoolgg/toolkit/util';
import { Bank } from 'oldschooljs';

import Skillcapes from '../../skilling/skillcapes';
import type { Buyable } from './buyables';

export const skillCapeBuyables: Buyable[] = [];

for (const skillcape of Skillcapes) {
	skillCapeBuyables.push({
		name: `${toTitleCase(skillcape.skill)} cape`,
		outputItems: (user: MUser) => {
			const output = new Bank().add(skillcape.hood);

			if (user.countSkillsAtLeast99() > 1) {
				output.add(skillcape.trimmed);
			} else {
				output.add(skillcape.untrimmed);
			}

			return output;
		},
		gpCost: 99_000,
		customReq: async (user: MUser) => {
			if (user.skillLevel(skillcape.skill) < 99) {
				return [false, `You need level ${99} ${toTitleCase(skillcape.skill)} to buy a cape of accomplishment.`];
			}
			return [true];
		}
	});

	// Master
	skillCapeBuyables.push({
		name: skillcape.masterCape.name,
		outputItems: () => new Bank().add(skillcape.masterCape.id),
		gpCost: 1_000_000_000,
		customReq: async (user: MUser) => {
			if (user.skillsAsXP[skillcape.skill] < 500_000_000) {
				return [false, 'You need 500m XP to buy a master cape.'];
			}
			return [true];
		}
	});
}
