import { z } from 'zod';

import {
	ZAttackStyles,
	ZAutoFarmFilter,
	ZBankSortMethod,
	ZBankSortWeightings,
	ZCombatOptions,
	ZCompostType,
	ZItemIdArray
} from './bot.js';
import { ZBotType, ZSnowflake } from './shared.js';

const ZUserMinionConfigPatchPayload = z
	.strictObject({
		bank_sort_method: ZBankSortMethod.nullable().optional(),
		bank_sort_weightings: ZBankSortWeightings.optional(),

		favorite_items: ZItemIdArray.max(1000).optional(),
		favorite_alchables: ZItemIdArray.max(1000).optional(),
		favorite_foods: ZItemIdArray.max(100).optional(),
		favorite_bh_seeds: ZItemIdArray.max(100).optional(),

		auto_farm_filter: ZAutoFarmFilter.optional(),
		default_compost: ZCompostType.optional(),
		attack_style: ZAttackStyles.optional(),
		combat_options: ZCombatOptions.optional()
	})
	.strict();

export type IUserMinionConfigPatchPayload = z.infer<typeof ZUserMinionConfigPatchPayload>;

export const ZUserMinionConfigPatchRequest = z.strictObject({
	body: ZUserMinionConfigPatchPayload,
	bot: ZBotType,
	targetUserId: ZSnowflake
});

export const ZUserMinionGetRequest = z.strictObject({
	bot: ZBotType,
	targetUserId: ZSnowflake
});

export const ZUserMinionsGetRequest = z.strictObject({
	bot: ZBotType,
	targetUserId: ZSnowflake
});

export const ZSimpleMinionInfo = z.strictObject({
	is_ironman: z.boolean(),
	has_minion: z.boolean(),
	bot: ZBotType,
	total_level: z.number().int().nonnegative()
});
export type ISimpleMinionInfo = z.infer<typeof ZSimpleMinionInfo>;
