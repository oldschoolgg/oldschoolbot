/* eslint-disable @typescript-eslint/no-namespace */

import { ItemBank, ItemPriceCache } from '../../types';

export type CustomGet<K extends string, TCustom> = K & { __type__: TCustom };

export function T<TCustom>(k: string): CustomGet<string, TCustom> {
	return k as CustomGet<string, TCustom>;
}

export namespace ClientSettings {
	export const TotalCommandsUsed = T<number>('totalCommandsUsed');
	export const CommandStats = T<ItemBank>('commandStats');
	export const Prices = T<ItemPriceCache>('prices');
	export const GuildBlacklist = T<readonly string[]>('guildBlacklist');
	export const UserBlacklist = T<readonly string[]>('userBlacklist');
	export const BankLottery = T<Readonly<ItemBank>>('bank_lottery');

	export namespace EconomyStats {
		export const DicingBank = T<number>('economyStats.dicingBank');
		export const DuelTaxBank = T<number>('economyStats.duelTaxBank');
		export const DailiesAmount = T<number>('economyStats.dailiesAmount');
		export const ItemSellTaxBank = T<number>('economyStats.itemSellTaxBank');
		export const BankBgCostBank = T<Readonly<ItemBank>>('economyStats.bankBgCostBank');
		export const SacrificedBank = T<Readonly<ItemBank>>('economyStats.sacrificedBank');

		export const WintertodtCost = T<Readonly<ItemBank>>('economyStats.wintertodtCost');
		export const WintertodtLoot = T<Readonly<ItemBank>>('economyStats.wintertodtLoot');
		export const FightCavesCost = T<Readonly<ItemBank>>('economyStats.fightCavesCost');
		export const PVMCost = T<Readonly<ItemBank>>('economyStats.PVMCost');
		export const ThievingCost = T<Readonly<ItemBank>>('economyStats.thievingCost');
		export const SoldItemsBank = T<Readonly<ItemBank>>('sold_items_bank');
		export const HerbloreCostBank = T<Readonly<ItemBank>>('herblore_cost_bank');
		export const ConstructCostBank = T<Readonly<ItemBank>>('construction_cost_bank');
		export const FarmingCostBank = T<Readonly<ItemBank>>('farming_cost_bank');
		export const FarmingLootBank = T<Readonly<ItemBank>>('farming_loot_bank');
		export const BuyCostBank = T<Readonly<ItemBank>>('buy_cost_bank');
		export const BuyLootBank = T<Readonly<ItemBank>>('buy_loot_bank');
		export const MagicCostBank = T<Readonly<ItemBank>>('magic_cost_bank');
		export const CraftingCost = T<Readonly<ItemBank>>('crafting_cost');

		export const GnomeRestaurantCostBank = T<Readonly<ItemBank>>('gnome_res_cost');
		export const GnomeRestaurantLootBank = T<Readonly<ItemBank>>('gnome_res_loot');

		export const RoguesDenStaminas = T<Readonly<ItemBank>>('rogues_den_cost');
		export const GauntletLoot = T<Readonly<ItemBank>>('gauntlet_loot');

		export const CoxCost = T<Readonly<ItemBank>>('cox_cost');
		export const CoxLoot = T<Readonly<ItemBank>>('cox_loot');

		export const CollectingCost = T<Readonly<ItemBank>>('collecting_cost');
		export const CollectingLoot = T<Readonly<ItemBank>>('collecting_loot');

		export const MTACostBank = T<Readonly<ItemBank>>('mta_cost');
		export const BlastFurnaceCostBank = T<Readonly<ItemBank>>('bf_cost');

		export const ItemContractCost = T<Readonly<ItemBank>>('item_contract_cost');
		export const ItemContractLoot = T<Readonly<ItemBank>>('item_contract_loot');

		export const KingGoldemarCost = T<Readonly<ItemBank>>('kg_cost');
		export const KingGoldemarLoot = T<Readonly<ItemBank>>('kg_loot');

		export const KalphiteKingCost = T<Readonly<ItemBank>>('kk_cost');
		export const KalphiteKingLoot = T<Readonly<ItemBank>>('kk_loot');

		export const NexCost = T<Readonly<ItemBank>>('nex_cost');
		export const NexLoot = T<Readonly<ItemBank>>('nex_loot');

		export const VasaCost = T<Readonly<ItemBank>>('vasa_cost');
		export const VasaLoot = T<Readonly<ItemBank>>('vasa_loot');

		export const NaxxusCost = T<Readonly<ItemBank>>('naxxus_cost');
		export const NaxxusLoot = T<Readonly<ItemBank>>('naxxus_loot');

		export const ODSCost = T<Readonly<ItemBank>>('ods_cost');
		export const ODSLoot = T<Readonly<ItemBank>>('ods_loot');

		export const MageArenaCost = T<Readonly<ItemBank>>('mage_arena_cost');

		export const HunterCost = T<Readonly<ItemBank>>('hunter_cost');
		export const HunterLoot = T<Readonly<ItemBank>>('hunter_loot');

		export const IgnecarusCost = T<Readonly<ItemBank>>('ignecarus_cost');
		export const IgnecarusLoot = T<Readonly<ItemBank>>('ignecarus_loot');

		export const KibbleCost = T<Readonly<ItemBank>>('kibble_cost');

		export const RevsCost = T<Readonly<ItemBank>>('revs_cost');
		export const RevsLoot = T<Readonly<ItemBank>>('revs_loot');

		export const MonkeyRumbleCost = T<Readonly<ItemBank>>('mr_cost');
		export const MonkeyRumbleLoot = T<Readonly<ItemBank>>('mr_loot');
		export const InfernoCost = T<Readonly<ItemBank>>('inferno_cost');
		export const DroppedItems = T<Readonly<ItemBank>>('dropped_items');

		export const RunecraftCost = T<Readonly<ItemBank>>('runecraft_cost');

		export const SmithingCost = T<Readonly<ItemBank>>('smithing_cost');
		export const NightmareCost = T<Readonly<ItemBank>>('nightmare_cost');

		export const CreateCost = T<Readonly<ItemBank>>('create_cost');
		export const CreateLoot = T<Readonly<ItemBank>>('create_loot');

		export const TameMergingCost = T<Readonly<ItemBank>>('tame_merging_cost');
		export const TripDoublingLoot = T<Readonly<ItemBank>>('trip_doubling_loot');

		export const TOBCost = T<Readonly<ItemBank>>('tob_cost');
		export const TOBLoot = T<Readonly<ItemBank>>('tob_loot');

		export const FishingContestCost = T<Readonly<ItemBank>>('fc_cost');
		export const FishingContestLoot = T<Readonly<ItemBank>>('fc_loot');

		export const BaxtorianBathhousesCost = T<Readonly<ItemBank>>('bb_cost');
		export const BaxtorianBathhousesLoot = T<Readonly<ItemBank>>('bb_loot');

		export const DegradedItemsCost = T<Readonly<ItemBank>>('degraded_items_cost');

		export const ZippyLoot = T<Readonly<ItemBank>>('zippy_loot');
		export const TKSCost = T<Readonly<ItemBank>>('tks_cost');
		export const TKSLoot = T<Readonly<ItemBank>>('tks_loot');

		export const GPSourceSellingItems = T<number>('gp_sell');
		export const GPSourcePVMLoot = T<number>('gp_pvm');
		export const GPSourceAlching = T<number>('gp_alch');
		export const GPSourcePickpocket = T<number>('gp_pickpocket');
		export const GPSourceDice = T<number>('gp_dice');
		export const GPSourceOpen = T<number>('gp_open');
		export const GPSourcePet = T<number>('gp_pet');
		export const GPSourceDaily = T<number>('gp_daily');
		export const GPSourceItemContracts = T<number>('gp_ic');
		export const GPSourceLuckyPick = T<number>('gp_luckypick');
		export const GPSourceSlots = T<number>('gp_slots');
		export const GPHotCold = T<number>('gp_hotcold');
	}

	export const CustomPrices = T<Readonly<ItemBank>>('custom_prices');
}
