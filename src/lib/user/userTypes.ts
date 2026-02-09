import type { GearSetup, GearSetupType } from '@oldschoolgg/gear';

import type { Prisma, UserStats } from '@/prisma/main.js';
import type { TransactItemsArgs } from '@/lib/util/transactItemsFromBank.js';

type HasDiaryRegion =
	| 'ardougne'
	| 'desert'
	| 'falador'
	| 'fremennik'
	| 'kandarin'
	| 'karamja'
	| 'kourend&kebos'
	| 'lumbridge&draynor'
	| 'morytania'
	| 'varrock'
	| 'westernprovinces'
	| 'wilderness';

type HasDiaryTier = 'easy' | 'medium' | 'hard' | 'elite';

export type HasDiaryDiaryKey = `${HasDiaryRegion}.${HasDiaryTier}`;

export type DegradeableItemColumns =
	| 'tentacle_charges'
	| 'sang_charges'
	| 'celestial_ring_charges'
	| 'ash_sanctifier_charges'
	| 'serp_helm_charges'
	| 'blood_fury_charges'
	| 'tum_shadow_charges'
	| 'blood_essence_charges'
	| 'trident_charges'
	| 'scythe_of_vitur_charges'
	| 'venator_bow_charges'
	| 'void_staff_charges';

export type Exact<A, B> = A extends B ? (B extends A ? A : never) : never;

export type SelectedUserStats<T extends Prisma.UserStatsSelect> = {
	[K in keyof T]: K extends keyof UserStats ? UserStats[K] : never;
};

export type GearColumns = `gear_${GearSetupType}`;

type QueuedUpdateFnReturnValue =
	| { response: SendableMessage }
	| ({ response: SendableMessage } & Omit<TransactItemsArgs, 'userID'>);
type QueuedUpdateFnReturn = Promise<QueuedUpdateFnReturnValue> | QueuedUpdateFnReturnValue;
export type QueuedUpdateFn = (user: MUserClass) => QueuedUpdateFnReturn;

export type GearWithSetupType = { setup: GearSetupType; gear: GearSetup | null };
