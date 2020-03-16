/* eslint-disable @typescript-eslint/no-namespace */
import { Bank as BankType, SkillsEnum } from './types';

export type CustomGet<K extends string, TCustom> = K & { __type__: TCustom };

export function T<TCustom>(k: string): CustomGet<string, TCustom> {
	return k as CustomGet<string, TCustom>;
}

export namespace UserSettings {
	export const GP = T<number>('GP');
	export const Bank = T<BankType>('bank');
	export const BankBackground = T<number>('bankBackground');
	export const Pets = T<BankType>('pets');
	export const CollectionLogBank = T<BankType>('collectionLogBank');
	export const MonsterScores = T<BankType>('monsterScores');
	export const ClueScores = T<BankType>('clueScores');
	export const LastDailyTimestamp = T<number>('lastDailyTimestamp');
	export const BitField = T<readonly number[]>('bitfield');
	export const Badges = T<readonly number[]>('badges');
	export const RSN = T<string>('RSN');
	export const TotalCommandsUsed = T<number>('totalCommandsUsed');
	
	export namespace Stats {
		export const Deaths = T<number>('stats.deaths');

		export const DiceWins = T<number>('stats.diceWins');
		export const DiceLosses = T<number>('stats.diceLosses');

		export const DuelWins = T<number>('stats.duelWins');
		export const DuelLosses = T<number>('stats.duelLosses');
	}

	export namespace Minion {
		export const Name = T<string>('minion.name');

		export const HasBought = T<boolean>('minion.hasBought');
		export const DailyDuration = T<number>('minion.dailyDuration');
		export const ironman = T<boolean>('minion.ironman');
	}

	export namespace Skills {
		export const Mining = T<number>(`skills.${SkillsEnum.Mining}`);
		export const Smithing = T<number>(`skills.${SkillsEnum.Smithing}`);
	}
}
