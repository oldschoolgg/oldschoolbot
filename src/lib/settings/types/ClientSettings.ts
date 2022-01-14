/* eslint-disable @typescript-eslint/no-namespace */
import { O } from 'ts-toolbelt';

import { SkillsEnum } from '../../skilling/types';
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
	export const BankLottery = T<O.Readonly<ItemBank>>('bank_lottery');
	export const DoubleLootFinishTime = T<number>('double_loot_finish_time');

	export namespace EconomyStats {
		export const DicingBank = T<number>('economyStats.dicingBank');
		export const DuelTaxBank = T<number>('economyStats.duelTaxBank');
		export const DailiesAmount = T<number>('economyStats.dailiesAmount');
		export const ItemSellTaxBank = T<number>('economyStats.itemSellTaxBank');
		export const BankBgCostBank = T<O.Readonly<ItemBank>>('economyStats.bankBgCostBank');
		export const SacrificedBank = T<O.Readonly<ItemBank>>('economyStats.sacrificedBank');

		export const WintertodtCost = T<O.Readonly<ItemBank>>('economyStats.wintertodtCost');
		export const WintertodtLoot = T<O.Readonly<ItemBank>>('economyStats.wintertodtLoot');
		export const FightCavesCost = T<O.Readonly<ItemBank>>('economyStats.fightCavesCost');
		export const PVMCost = T<O.Readonly<ItemBank>>('economyStats.PVMCost');
		export const ThievingCost = T<O.Readonly<ItemBank>>('economyStats.thievingCost');
		export const SoldItemsBank = T<O.Readonly<ItemBank>>('sold_items_bank');
		export const HerbloreCostBank = T<O.Readonly<ItemBank>>('herblore_cost_bank');
		export const ConstructCostBank = T<O.Readonly<ItemBank>>('construction_cost_bank');
		export const FarmingCostBank = T<O.Readonly<ItemBank>>('farming_cost_bank');
		export const FarmingLootBank = T<O.Readonly<ItemBank>>('farming_loot_bank');
		export const BuyCostBank = T<O.Readonly<ItemBank>>('buy_cost_bank');
		export const BuyLootBank = T<O.Readonly<ItemBank>>('buy_loot_bank');
		export const MagicCostBank = T<O.Readonly<ItemBank>>('magic_cost_bank');
		export const CraftingCost = T<O.Readonly<ItemBank>>('crafting_cost');

		export const GnomeRestaurantCostBank = T<O.Readonly<ItemBank>>('gnome_res_cost');
		export const GnomeRestaurantLootBank = T<O.Readonly<ItemBank>>('gnome_res_loot');

		export const RoguesDenStaminas = T<O.Readonly<ItemBank>>('rogues_den_cost');
		export const GauntletLoot = T<O.Readonly<ItemBank>>('gauntlet_loot');

		export const CoxCost = T<O.Readonly<ItemBank>>('cox_cost');
		export const CoxLoot = T<O.Readonly<ItemBank>>('cox_loot');

		export const CollectingCost = T<O.Readonly<ItemBank>>('collecting_cost');
		export const CollectingLoot = T<O.Readonly<ItemBank>>('collecting_loot');

		export const MTACostBank = T<O.Readonly<ItemBank>>('mta_cost');
		export const BlastFurnaceCostBank = T<O.Readonly<ItemBank>>('bf_cost');

		export const ItemContractCost = T<O.Readonly<ItemBank>>('item_contract_cost');
		export const ItemContractLoot = T<O.Readonly<ItemBank>>('item_contract_loot');

		export const KingGoldemarCost = T<O.Readonly<ItemBank>>('kg_cost');
		export const KingGoldemarLoot = T<O.Readonly<ItemBank>>('kg_loot');

		export const KalphiteKingCost = T<O.Readonly<ItemBank>>('kk_cost');
		export const KalphiteKingLoot = T<O.Readonly<ItemBank>>('kk_loot');

		export const NexCost = T<O.Readonly<ItemBank>>('nex_cost');
		export const NexLoot = T<O.Readonly<ItemBank>>('nex_loot');

		export const VasaCost = T<O.Readonly<ItemBank>>('vasa_cost');
		export const VasaLoot = T<O.Readonly<ItemBank>>('vasa_loot');

		export const ODSCost = T<O.Readonly<ItemBank>>('ods_cost');
		export const ODSLoot = T<O.Readonly<ItemBank>>('ods_loot');

		export const MageArenaCost = T<O.Readonly<ItemBank>>('mage_arena_cost');

		export const HunterCost = T<O.Readonly<ItemBank>>('hunter_cost');
		export const HunterLoot = T<O.Readonly<ItemBank>>('hunter_loot');

		export const IgnecarusCost = T<O.Readonly<ItemBank>>('ignecarus_cost');
		export const IgnecarusLoot = T<O.Readonly<ItemBank>>('ignecarus_loot');

		export const KibbleCost = T<O.Readonly<ItemBank>>('kibble_cost');

		export const RevsCost = T<O.Readonly<ItemBank>>('revs_cost');
		export const RevsLoot = T<O.Readonly<ItemBank>>('revs_loot');

		export const MonkeyRumbleCost = T<O.Readonly<ItemBank>>('mr_cost');
		export const MonkeyRumbleLoot = T<O.Readonly<ItemBank>>('mr_loot');
		export const InfernoCost = T<O.Readonly<ItemBank>>('inferno_cost');
		export const DroppedItems = T<O.Readonly<ItemBank>>('dropped_items');

		export const RunecraftCost = T<O.Readonly<ItemBank>>('runecraft_cost');

		export const SmithingCost = T<O.Readonly<ItemBank>>('smithing_cost');
		export const NightmareCost = T<O.Readonly<ItemBank>>('nightmare_cost');

		export const CreateCost = T<O.Readonly<ItemBank>>('create_cost');
		export const CreateLoot = T<O.Readonly<ItemBank>>('create_loot');

		export const TameMergingCost = T<O.Readonly<ItemBank>>('tame_merging_cost');
		export const TripDoublingLoot = T<O.Readonly<ItemBank>>('trip_doubling_loot');

		export const TOBCost = T<O.Readonly<ItemBank>>('tob_cost');
		export const TOBLoot = T<O.Readonly<ItemBank>>('tob_loot');

		export const FishingContestCost = T<O.Readonly<ItemBank>>('fc_cost');
		export const FishingContestLoot = T<O.Readonly<ItemBank>>('fc_loot');

		export const DegradedItemsCost = T<O.Readonly<ItemBank>>('degraded_items_cost');

		export const ZippyLoot = T<O.Readonly<ItemBank>>('zippy_loot');

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
	}

	export const LockedSkills = T<readonly SkillsEnum[]>('locked_skills');
	export const CustomPrices = T<O.Readonly<ItemBank>>('custom_prices');
}
