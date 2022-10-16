import { Prisma, User } from '@prisma/client';
import { mockRandom, resetMockRandom } from 'jest-mock-random';
import murmurhash from 'murmurhash';
import { Bank } from 'oldschooljs';
import { convertLVLtoXP } from 'oldschooljs/dist/util';

import { BitField } from '../src/lib/constants';
import { filterGearSetup, GearSetup, PartialGearSetup } from '../src/lib/gear';
import { MUserClass } from '../src/lib/MUser';
import { Gear } from '../src/lib/structures/Gear';
import type { OSBMahojiCommand } from '../src/mahoji/lib/util';

interface MockUserArgs {
	bank?: Bank;
	cl?: Bank;
	QP?: number;
	meleeGear?: GearSetup | PartialGearSetup;
	skills_agility?: number;
	skills_attack?: number;
	skills_strength?: number;
	skills_ranged?: number;
	skills_magic?: number;
	skills_defence?: number;
	skills_hitpoints?: number;
	skills_prayer?: number;
	skills_fishing?: number;
	GP?: number;
	premium_balance_tier?: number;
	premium_balance_expiry_date?: number;
	bitfield?: BitField[];
	id: string;
}

export const mockUser = (overrides?: MockUserArgs): User => {
	const gearMelee = filterGearSetup(overrides?.meleeGear);
	return {
		gear_fashion: new Gear().raw() as Prisma.JsonValue,
		gear_mage: new Gear().raw() as Prisma.JsonValue,
		gear_melee: new Gear(gearMelee).raw() as Prisma.JsonValue,
		gear_misc: new Gear().raw() as Prisma.JsonValue,
		gear_other: new Gear().raw() as Prisma.JsonValue,
		gear_range: new Gear().raw() as Prisma.JsonValue,
		gear_skilling: new Gear().raw() as Prisma.JsonValue,
		gear_wildy: new Gear().raw() as Prisma.JsonValue,
		bank: overrides?.bank?.bank ?? {},
		collectionLogBank: overrides?.cl?.bank ?? {},
		skills_agility: overrides?.skills_agility ?? 0,
		skills_cooking: 0,
		skills_fishing: overrides?.skills_fishing ?? 0,
		skills_mining: 0,
		skills_smithing: 0,
		skills_woodcutting: 0,
		skills_firemaking: 0,
		skills_runecraft: 0,
		skills_crafting: 0,
		skills_prayer: overrides?.skills_prayer ?? 0,
		skills_fletching: 0,
		skills_thieving: 0,
		skills_farming: 0,
		skills_herblore: 0,
		skills_hunter: 0,
		skills_construction: 0,
		skills_magic: overrides?.skills_magic ?? 0,
		skills_ranged: overrides?.skills_ranged ?? 0,
		skills_attack: overrides?.skills_attack ?? 0,
		skills_strength: overrides?.skills_strength ?? 0,
		skills_defence: overrides?.skills_defence ?? 0,
		skills_slayer: 0,
		skills_hitpoints: overrides?.skills_hitpoints ?? convertLVLtoXP(10),
		GP: overrides?.GP,
		premium_balance_tier: overrides?.premium_balance_tier,
		premium_balance_expiry_date: overrides?.premium_balance_expiry_date,
		ironman_alts: [],
		bitfield: overrides?.bitfield ?? [],
		username: 'Magnaboy',
		QP: overrides?.QP ?? 0,
		kourend_favour: {
			Arceuus: 0,
			Hosidius: 0,
			Lovakengj: 0,
			Piscarilius: 0,
			Shayzien: 0
		},
		sacrificedValue: 0,
		id: overrides?.id ?? ''
	} as unknown as User;
};
export const mockMUser = (overrides?: MockUserArgs) => {
	return new MUserClass(mockUser(overrides));
};

export const mockUserMap = new Map<string, MUser>();

export function testRunCmd({ cmd, opts, user }: { cmd: OSBMahojiCommand; opts: any; user?: Omit<MockUserArgs, 'id'> }) {
	const hash = murmurhash(JSON.stringify({ name: cmd.name, opts, user })).toString();
	const mockedUser = mockMUser({ id: hash, ...user });
	mockUserMap.set(hash, mockedUser);
	const options: any = {
		user: mockedUser.user,
		channelID: '1234',
		userID: mockedUser.id,
		options: opts
	};
	return cmd.run(options);
}

export function commandTestSetup() {
	mockRandom([0.5]);
}

export function commandTestTeardown() {
	resetMockRandom();
}
