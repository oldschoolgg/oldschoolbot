import type { ClientStorage, Prisma } from '@prisma/client';
import { Bank, type ItemBank } from 'oldschooljs';

import { globalConfig } from '@/lib/constants.js';

async function mahojiClientSettingsFetch(select: Prisma.ClientStorageSelect = { id: true }) {
	const clientSettings = await prisma.clientStorage.findFirst({
		where: {
			id: globalConfig.clientID
		},
		select
	});
	return clientSettings as ClientStorage;
}

async function mahojiClientSettingsUpdate(data: Prisma.ClientStorageUpdateInput) {
	await prisma.clientStorage.update({
		where: {
			id: globalConfig.clientID
		},
		data,
		select: {
			id: true
		}
	});
}

async function updateClientGPTrackSetting(
	setting:
		| 'gp_luckypick'
		| 'gp_pickpocket'
		| 'gp_alch'
		| 'gp_slots'
		| 'gp_dice'
		| 'gp_open'
		| 'gp_daily'
		| 'gp_sell'
		| 'gp_pvm'
		| 'economyStats_duelTaxBank'
		| 'gp_ic',
	amount: number
) {
	await prisma.clientStorage.update({
		where: {
			id: globalConfig.clientID
		},
		data: {
			[setting]: {
				increment: Math.floor(amount)
			}
		},
		select: {
			id: true
		}
	});
}

type BSOClientBankKey =
	| 'ignecarus_cost'
	| 'ignecarus_loot'
	| 'kibble_cost'
	| 'mr_cost'
	| 'mr_loot'
	| 'item_contract_cost'
	| 'item_contract_loot'
	| 'kg_cost'
	| 'kg_loot'
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
	| 'doa_cost'
	| 'doa_loot'
	| 'xmas_ironman_food_bank'
	| 'turaels_trials_cost_bank'
	| 'portable_tanner_loot'
	| 'clue_upgrader_loot'
	| 'turaels_trials_loot_bank';

type OSBClientBankKey =
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
	| 'gf_cost'
	| 'gf_loot'
	| 'nex_cost'
	| 'nex_loot'
	| 'nmz_cost'
	| 'toa_cost'
	| 'toa_loot'
	| 'ourania_loot'
	| 'colo_cost'
	| 'colo_loot';

export type ClientBankKey = OSBClientBankKey | BSOClientBankKey;

async function updateBankSetting(key: ClientBankKey, bankToAdd: Bank) {
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

async function addToGPTaxBalance(user: MUser, amount: number) {
	await Promise.all([
		prisma.clientStorage.update({
			where: {
				id: globalConfig.clientID
			},
			data: {
				gp_tax_balance: {
					increment: amount
				}
			},
			select: {
				id: true
			}
		}),
		user.statsUpdate({
			total_gp_traded: {
				increment: amount
			}
		})
	]);
}

const ClientSettingsSrc = {
	fetch: mahojiClientSettingsFetch,
	update: mahojiClientSettingsUpdate,
	updateClientGPTrackSetting,
	updateBankSetting,
	addToGPTaxBalance
};

declare global {
	var ClientSettings: typeof ClientSettingsSrc;
}

global.ClientSettings = ClientSettingsSrc;
