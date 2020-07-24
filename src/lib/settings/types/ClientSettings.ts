/* eslint-disable @typescript-eslint/no-namespace */
import { O } from 'ts-toolbelt';

import {
	Bank,
	ItemBank,
	ItemPriceCache,
	OSRSPoll,
	PetRecords as PetRecordsType
} from '../../types';

export type CustomGet<K extends string, TCustom> = K & { __type__: TCustom };

export function T<TCustom>(k: string): CustomGet<string, TCustom> {
	return k as CustomGet<string, TCustom>;
}

export namespace ClientSettings {
	export const TotalCommandsUsed = T<number>('totalCommandsUsed');
	export const CommandStats = T<Bank>('commandStats');
	export const Prices = T<ItemPriceCache>('prices');
	export const PollQuestions = T<OSRSPoll>('pollQuestions');
	export const PetRecords = T<PetRecordsType>('petRecords');
	export const GuildBlacklist = T<readonly string[]>('guildBlacklist');

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
	}
}
