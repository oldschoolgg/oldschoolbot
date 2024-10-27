import { Bank } from 'oldschooljs';

import type { ItemBank } from '../types';
import { mahojiClientSettingsFetch, mahojiClientSettingsUpdate } from './clientSettings';

export type ClientBankKey =
	| 'sold_items_bank'
	| 'herblore_cost_bank'
	| 'construction_cost_bank'
	| 'farming_cost_bank'
	| 'farming_loot_bank'
	| 'buy_cost_bank'
	| 'buy_loot_bank'
	| 'magic_cost_bank'
	| 'crafting_cost'
	| 'gnome_res_cost'
	| 'gnome_res_loot'
	| 'rogues_den_cost'
	| 'gauntlet_loot'
	| 'cox_cost'
	| 'cox_loot'
	| 'collecting_cost'
	| 'collecting_loot'
	| 'mta_cost'
	| 'bf_cost'
	| 'mage_arena_cost'
	| 'hunter_cost'
	| 'hunter_loot'
	| 'revs_cost'
	| 'revs_loot'
	| 'inferno_cost'
	| 'dropped_items'
	| 'runecraft_cost'
	| 'smithing_cost'
	| 'economyStats_dicingBank'
	| 'economyStats_duelTaxBank'
	| 'economyStats_dailiesAmount'
	| 'economyStats_itemSellTaxBank'
	| 'economyStats_bankBgCostBank'
	| 'economyStats_sacrificedBank'
	| 'economyStats_wintertodtCost'
	| 'economyStats_wintertodtLoot'
	| 'economyStats_fightCavesCost'
	| 'economyStats_PVMCost'
	| 'economyStats_thievingCost'
	| 'nightmare_cost'
	| 'create_cost'
	| 'create_loot'
	| 'tob_cost'
	| 'tob_loot'
	| 'degraded_items_cost'
	| 'tks_cost'
	| 'tks_loot'
	| 'gotr_cost'
	| 'gotr_loot'
	| 'ignecarus_cost'
	| 'ignecarus_loot'
	| 'kibble_cost'
	| 'mr_cost'
	| 'mr_loot'
	| 'item_contract_cost'
	| 'item_contract_loot'
	| 'kg_cost'
	| 'kg_loot'
	| 'gf_cost'
	| 'gf_loot'
	| 'nex_cost'
	| 'nex_loot'
	| 'kk_cost'
	| 'kk_loot'
	| 'vasa_cost'
	| 'vasa_loot'
	| 'ods_cost'
	| 'ods_loot'
	| 'naxxus_loot'
	| 'naxxus_cost'
	| 'tame_merging_cost'
	| 'trip_doubling_loot'
	| 'fc_cost'
	| 'fc_loot'
	| 'zippy_loot'
	| 'market_prices'
	| 'bb_cost'
	| 'bb_loot'
	| 'moktang_cost'
	| 'moktang_loot'
	| 'nmz_cost'
	| 'toa_cost'
	| 'toa_loot'
	| 'doa_cost'
	| 'doa_loot'
	| 'xmas_ironman_food_bank'
	| 'ourania_loot'
	| 'colo_cost'
	| 'colo_loot';

export async function updateBankSetting(key: ClientBankKey, bankToAdd: Bank) {
	if (bankToAdd === undefined || bankToAdd === null) throw new Error(`Gave null bank for ${key}`);
	const currentClientSettings = await mahojiClientSettingsFetch({
		[key]: true
	});
	const current = currentClientSettings[key] as ItemBank;
	const newBank = new Bank(current).add(bankToAdd);

	const res = await mahojiClientSettingsUpdate({
		[key]: newBank.toJSON()
	});
	return res;
}
