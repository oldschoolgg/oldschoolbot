import { Prisma, User } from '@prisma/client';
import { Bank } from 'oldschooljs';
import { convertLVLtoXP } from 'oldschooljs/dist/util';

import { PartialGearSetup } from '../src/lib/gear';
import { MUserClass } from '../src/lib/MUser';
import { Gear } from '../src/lib/structures/Gear';

export function mockArgument(arg: any) {
	return new arg(
		{
			name: 'arguments',
			client: {
				options: {
					pieceDefaults: {
						arguments: {}
					}
				}
			}
		},
		['1'],
		'',
		{}
	);
}

interface MockUserArgs {
	bank?: Bank;
	cl?: Bank;
	meleeGear?: PartialGearSetup;
	skills_agility?: number;
	GP?: number;
}

export const mockUser = (overrides?: MockUserArgs): User => {
	return {
		gear_fashion: new Gear().raw() as Prisma.JsonValue,
		gear_mage: new Gear().raw() as Prisma.JsonValue,
		gear_melee: new Gear(overrides?.meleeGear).raw() as Prisma.JsonValue,
		gear_misc: new Gear().raw() as Prisma.JsonValue,
		gear_other: new Gear().raw() as Prisma.JsonValue,
		gear_range: new Gear().raw() as Prisma.JsonValue,
		gear_skilling: new Gear().raw() as Prisma.JsonValue,
		gear_wildy: new Gear().raw() as Prisma.JsonValue,
		bank: overrides?.bank?.bank ?? {},
		collectionLogBank: overrides?.cl?.bank ?? {},
		skills_agility: overrides?.skills_agility ?? 0,
		skills_cooking: 0,
		skills_fishing: 0,
		skills_mining: 0,
		skills_smithing: 0,
		skills_woodcutting: 0,
		skills_firemaking: 0,
		skills_runecraft: 0,
		skills_crafting: 0,
		skills_prayer: 0,
		skills_fletching: 0,
		skills_thieving: 0,
		skills_farming: 0,
		skills_herblore: 0,
		skills_hunter: 0,
		skills_construction: 0,
		skills_magic: 0,
		skills_ranged: 0,
		skills_attack: 0,
		skills_strength: 0,
		skills_defence: 0,
		skills_slayer: 0,
		skills_dungeoneering: 0,
		skills_invention: 0,
		skills_hitpoints: convertLVLtoXP(10),
		bitfield: [],
		GP: overrides?.GP
	} as unknown as User;
};
export const mockMUser = (overrides?: MockUserArgs) => {
	return new MUserClass(mockUser(overrides));
};
