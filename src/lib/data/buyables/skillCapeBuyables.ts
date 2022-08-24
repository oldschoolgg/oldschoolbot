import { Bank } from 'oldschooljs';

import { countSkillsAtleast99 } from '../../../mahoji/mahojiSettings';
import { MUser } from '../../MUser';
import Skillcapes from '../../skilling/skillcapes';
import { toTitleCase } from '../../util';
import { Buyable } from './buyables';

export const skillCapeBuyables: Buyable[] = [];

for (const skillcape of Skillcapes) {
	skillCapeBuyables.push({
		name: `${toTitleCase(skillcape.skill)} cape`,
		outputItems: (user: MUser) => {
			const output = new Bank().add(skillcape.hood);

			if (countSkillsAtleast99(user) > 1) {
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
