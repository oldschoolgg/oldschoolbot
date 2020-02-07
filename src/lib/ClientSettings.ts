import { Bank, ItemPriceCache, OSRSPoll, PetRecords } from './types';

export type CustomGet<K extends string, TCustom> = K & { __type__: TCustom };

export function T<TCustom>(k: string): CustomGet<string, TCustom> {
	return k as CustomGet<string, TCustom>;
}

export namespace ClientSettings {
	export const TotalCommandsUsed = T<number>('totalCommandsUsed');
	export const CommandStats = T<Bank>('commandStats');
	export const Prices = T<ItemPriceCache>('prices');
	export const PollQuestions = T<OSRSPoll>('pollQuestions');
	export const PetRecords = T<PetRecords>('petRecords');
	export const GuildBlacklist = T<readonly string[]>('guildBlacklist');

	export namespace EconomyStats {
		export const DicingBank = T<number>('economyStats.dicingBank');
		export const DuelTaxBank = T<number>('economyStats.duelTaxBank');
		export const DailiesAmount = T<number>('economyStats.dailiesAmount');
		export const ItemSellTaxBank = T<number>('economyStats.itemSellTaxBank');
	}
}
