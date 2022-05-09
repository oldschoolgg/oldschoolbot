import { User } from '@prisma/client';
import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import Skillcapes from '../../skilling/skillcapes';
import { countSkillsAtleast99, toTitleCase } from '../../util';
import { Buyable } from './buyables';

export const skillCapeBuyables: Buyable[] = [];

for (const skillcape of Skillcapes) {
	skillCapeBuyables.push({
		name: `${toTitleCase(skillcape.skill)} cape`,
		outputItems: (user: User) => {
			const output = new Bank().add(skillcape.hood);

			if (countSkillsAtleast99(user) > 1) {
				output.add(skillcape.trimmed);
			} else {
				output.add(skillcape.untrimmed);
			}

			return output;
		},
		gpCost: 99_000,
		customReq: async (user: KlasaUser) => {
			if (user.skillLevel(skillcape.skill) < 99) {
				return [false, `You need level ${99} ${skillcape.skill}.`];
			}
			return [true];
		}
	});
}
