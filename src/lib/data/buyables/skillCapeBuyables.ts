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
}
