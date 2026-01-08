import type { GearSetup } from '@oldschoolgg/gear';
import type { IBirdhouseData, IFarmingContract } from '@oldschoolgg/schemas';
import type { ItemBank } from 'oldschooljs';

import type { AutoFarmFilterEnum, bank_sort_method_enum, CropUpgradeType } from '@/prisma/main.js';
import type { BlowpipeData } from '@/lib/minions/types.js';
import type { PatchTypes } from '@/lib/skilling/skills/farming/index.js';
import type { FarmingPatchSettingsKey } from '@/lib/skilling/skills/farming/utils/farmingHelpers.js';
import type { SkillNameType } from '@/lib/skilling/types.js';
import type { DegradeableItemColumns, GearColumns } from '@/lib/user/userTypes.js';

type PrismaArrayUpdateInput<T> = { push: T | T[] } | T[];

type PrismaIntArrayKeys =
	| 'favorite_bh_seeds'
	| 'favorite_alchables'
	| 'favoriteItems'
	| 'favorite_food'
	| 'badges'
	| 'bitfield'
	| 'finished_quest_ids'
	| 'completed_ca_task_ids'
	| 'slayer_autoslay_options'
	| 'slayer_blocked_ids'
	| 'slayer_unlocks'
	| 'store_bitfield'
	| 'combat_options'
	| 'cl_array';

type PrismaStringArrayKeys = 'attack_style' | 'completed_achievement_diaries';

type PrismaNullableIntKeys = 'minion_equippedPet' | 'gear_template';

type PrismaIntUpdateInput = number | { increment: number } | { decrement: number };

type PrismaIntKeys =
	| 'premium_balance_tier'
	| 'bankBackground'
	| 'QP'
	| 'lms_points'
	| 'volcanic_mine_points'
	| 'nmz_points'
	| 'carpenter_points'
	| 'zeal_tokens'
	| 'slayer_points'
	| 'sacrificedValue'
	| DegradeableItemColumns;

type PrismaBigIntUpdateInput = bigint | number | { increment: bigint | number } | { decrement: bigint | number };

type PrismaBigIntKeys = 'premium_balance_expiry_date' | 'GP' | 'sacrificedValue' | `skills_${SkillNameType}`;

type PrismaItemBankKeys = 'bank' | 'collectionLogBank' | 'bank_sort_weightings' | 'temp_cl' | 'pets';

type PrismaDateKeys = 'last_temp_cl_reset' | 'gambling_lockout_expiry' | 'minion_bought_date' | 'last_command_date';

type PrismaNullableStringKeys =
	| 'minion_icon'
	| 'minion_name'
	| 'bank_bg_hex'
	| 'username'
	| 'RSN'
	| 'username_with_badges'
	| 'slayer_remember_master'
	| 'icon_pack_id';

type PrismaBooleanKeys = 'minion_defaultPay' | 'minion_ironman' | 'minion_hasBought';

export type FullUserUpdateInput = Partial<
	{
		blowpipe: BlowpipeData;
		slayer_last_task: number;
		minion_farmingContract: IFarmingContract | null;
		minion_birdhouseTraps: IBirdhouseData | null;
		bank_sort_method: bank_sort_method_enum | null;
		auto_farm_filter: AutoFarmFilterEnum;
		minion_defaultCompostToUse: CropUpgradeType;
	} & Record<PrismaIntArrayKeys, PrismaArrayUpdateInput<number>> &
		Record<PrismaStringArrayKeys, PrismaArrayUpdateInput<string>> &
		Record<PrismaNullableIntKeys, number | null> &
		Record<PrismaIntKeys, PrismaIntUpdateInput> &
		Record<PrismaBigIntKeys, PrismaBigIntUpdateInput> &
		Record<PrismaItemBankKeys, ItemBank> &
		Record<FarmingPatchSettingsKey, PatchTypes.IPatchData> &
		Record<PrismaDateKeys, Date | null> &
		Record<PrismaNullableStringKeys, string | null> &
		Record<PrismaBooleanKeys, boolean> &
		Record<GearColumns, GearSetup | null>
>;

export type SafeUserUpdateInput = Omit<
	FullUserUpdateInput,
	| 'bank'
	| 'blowpipe'
	| 'minion_birdhouseTraps'
	| 'collectionLogBank'
	| 'minion_farmingContract'
	| GearColumns
	| FarmingPatchSettingsKey
>;
