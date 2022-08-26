import { Prisma, User } from '@prisma/client';
import { Bank } from 'oldschooljs';

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
	meleeGear?: PartialGearSetup;
}

export const mockUser = (overrides?: MockUserArgs): User => {
	return {
		...overrides,
		gear_fashion: new Gear().raw() as Prisma.JsonValue,
		gear_mage: new Gear().raw() as Prisma.JsonValue,
		gear_melee: new Gear(overrides?.meleeGear).raw() as Prisma.JsonValue,
		gear_misc: new Gear().raw() as Prisma.JsonValue,
		gear_other: new Gear().raw() as Prisma.JsonValue,
		gear_range: new Gear().raw() as Prisma.JsonValue,
		gear_skilling: new Gear().raw() as Prisma.JsonValue,
		gear_wildy: new Gear().raw() as Prisma.JsonValue,
		bank: overrides?.bank?.bank ?? (new Bank().bank as Prisma.JsonValue),
		skills_agility: 1_000_000,
		bitfield: []
	} as unknown as User;
};
export const mockMUser = (overrides?: MockUserArgs) => {
	return new MUserClass(mockUser(overrides));
};
