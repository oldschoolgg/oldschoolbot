import type { Prisma, User } from '@prisma/client';
import { Bank, convertLVLtoXP } from 'oldschooljs';

import { MUserClass } from '../../src/lib/MUser';
import type { BitField } from '../../src/lib/constants';
import type { GearSetup } from '../../src/lib/gear/types';
import { Gear } from '../../src/lib/structures/Gear';
import { type PartialGearSetup, constructGearSetup } from '../../src/lib/structures/Gear';

function filterGearSetup(gear: undefined | null | GearSetup | PartialGearSetup): GearSetup | undefined {
	const filteredGear = !gear
		? undefined
		: typeof gear.ammo === 'undefined' || typeof gear.ammo === 'string'
			? constructGearSetup(gear as PartialGearSetup)
			: (gear as GearSetup);
	return filteredGear;
}

export interface MockUserArgs {
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
	bitfield?: BitField[];
	id?: string;
}

const mockUser = (overrides?: MockUserArgs): User => {
	const gearMelee = filterGearSetup(overrides?.meleeGear);
	const cl = new Bank().add(overrides?.cl ?? {});
	const r = {
		cl,
		gear_fashion: new Gear().raw() as Prisma.JsonValue,
		gear_mage: new Gear().raw() as Prisma.JsonValue,
		gear_melee: new Gear(gearMelee).raw() as Prisma.JsonValue,
		gear_misc: new Gear().raw() as Prisma.JsonValue,
		gear_other: new Gear().raw() as Prisma.JsonValue,
		gear_range: new Gear().raw() as Prisma.JsonValue,
		gear_skilling: new Gear().raw() as Prisma.JsonValue,
		gear_wildy: new Gear().raw() as Prisma.JsonValue,
		bank: overrides?.bank?.toJSON() ?? {},
		collectionLogBank: overrides?.cl?.toJSON() ?? {},
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
		GP: overrides?.GP ?? 0,
		bitfield: overrides?.bitfield ?? [],
		username: 'Magnaboy',
		QP: overrides?.QP ?? 0,
		sacrificedValue: 0,
		id: overrides?.id ?? '',
		monsterScores: {},
		badges: []
	} as unknown as User;

	return r;
};

export const mockMUser = (overrides?: MockUserArgs) => {
	const user = new MUserClass(mockUser(overrides));
	return user;
};
