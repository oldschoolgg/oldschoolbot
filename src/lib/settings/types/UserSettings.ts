/* eslint-disable @typescript-eslint/no-namespace */
import { ItemBank } from '../../types';
import { GearTypes } from '../../gear';
import { PatchTypes } from '../../farming';
import { SkillsEnum } from '../../skilling/types';
import { O } from 'ts-toolbelt';

export type CustomGet<K extends string, TCustom> = K & { __type__: TCustom };

export function T<TCustom>(k: string): CustomGet<string, TCustom> {
	return k as CustomGet<string, Readonly<TCustom>>;
}

export namespace UserSettings {
	export const GP = T<number>('GP');
	export const QP = T<number>('QP');
	export const Bank = T<O.Readonly<ItemBank>>('bank');
	export const BankBackground = T<number>('bankBackground');
	export const Pets = T<O.Readonly<ItemBank>>('pets');
	export const CollectionLogBank = T<O.Readonly<ItemBank>>('collectionLogBank');
	export const MonsterScores = T<O.Readonly<ItemBank>>('monsterScores');
	export const ClueScores = T<O.Readonly<ItemBank>>('clueScores');
	export const MinigameScores = T<O.Readonly<ItemBank>>('minigameScores');
	export const LastDailyTimestamp = T<number>('lastDailyTimestamp');
	export const BitField = T<readonly number[]>('bitfield');
	export const Badges = T<readonly number[]>('badges');
	export const RSN = T<string>('RSN');
	export const TotalCommandsUsed = T<number>('totalCommandsUsed');
	export const SacrificedValue = T<number>('sacrificedValue');

	export namespace Stats {
		export const Deaths = T<number>('stats.deaths');

		export const DiceWins = T<number>('stats.diceWins');
		export const DiceLosses = T<number>('stats.diceLosses');

		export const DuelWins = T<number>('stats.duelWins');
		export const DuelLosses = T<number>('stats.duelLosses');

		export const FightCavesAttempts = T<number>('stats.fightCavesAttempts');
		export const FireCapesSacrificed = T<number>('stats.fireCapesSacrificed');

		export const TitheFarmsCompleted = T<number>('stats.titheFarmsCompleted');
		export const TitheFarmPoints = T<number>('stats.titheFarmPoints');
	}

	export namespace Minion {
		export const Name = T<string>('minion.name');
		export const HasBought = T<boolean>('minion.hasBought');
		export const DailyDuration = T<number>('minion.dailyDuration');
		export const Ironman = T<boolean>('minion.ironman');
		export const Icon = T<string | null>('minion.icon');
		export const EquippedPet = T<number | null>('minion.equippedPet');
	}

	export namespace Skills {
		export const Agility = T<number>(`skills.${SkillsEnum.Agility}`);
		export const Cooking = T<number>(`skills.${SkillsEnum.Cooking}`);
		export const Fishing = T<number>(`skills.${SkillsEnum.Fishing}`);
		export const Mining = T<number>(`skills.${SkillsEnum.Mining}`);
		export const Smithing = T<number>(`skills.${SkillsEnum.Smithing}`);
		export const Woodcutting = T<string>(`skills.${SkillsEnum.Woodcutting}`);
		export const Firemaking = T<number>(`skills.${SkillsEnum.Firemaking}`);
		export const Runecraft = T<number>(`skills.${SkillsEnum.Runecraft}`);
		export const Crafting = T<number>(`skills.${SkillsEnum.Crafting}`);
		export const Prayer = T<number>(`skills.${SkillsEnum.Prayer}`);
		export const Fletching = T<number>(`skills.${SkillsEnum.Fletching}`);
		export const Farming = T<number>(`skills.${SkillsEnum.Farming}`);
	}

	export namespace Gear {
		export const Melee = T<GearTypes.GearSetup>(`gear.melee`);
		export const Range = T<GearTypes.GearSetup>(`gear.range`);
		export const Mage = T<GearTypes.GearSetup>(`gear.mage`);
		export const Misc = T<GearTypes.GearSetup>(`gear.misc`);
		export const Skilling = T<GearTypes.GearSetup>(`gear.skilling`);
	}

	export namespace FarmingPatches {
		export const Herb = T<PatchTypes.FarmingPatchTypes>('farmingpatches.herb');
		export const FruitTree = T<PatchTypes.FarmingPatchTypes>('farmingpatches.fruittree');
		export const Tree = T<PatchTypes.FarmingPatchTypes>('farmingpatches.tree');
		export const Allotment = T<PatchTypes.FarmingPatchTypes>('farmingpatches.allotment');
		export const Cactus = T<PatchTypes.FarmingPatchTypes>('farmingpatches.cactus');
		export const Bush = T<PatchTypes.FarmingPatchTypes>('farmingpatches.bush');
		export const Spirit = T<PatchTypes.FarmingPatchTypes>('farmingpatches.spirit');
		export const Hardwood = T<PatchTypes.FarmingPatchTypes>('farmingpatches.hardwood');
		export const Seaweed = T<PatchTypes.FarmingPatchTypes>('farmingpatches.seaweed');
		export const Vine = T<PatchTypes.FarmingPatchTypes>('farmingpatches.vine');
		export const Calquat = T<PatchTypes.FarmingPatchTypes>('farmingpatches.calquat');
		export const Redwood = T<PatchTypes.FarmingPatchTypes>('farmingpatches.redwood');
		export const Crystal = T<PatchTypes.FarmingPatchTypes>('farmingpatches.crystal');
		export const Celastrus = T<PatchTypes.FarmingPatchTypes>('farmingpatches.celastrus');
		export const Hespori = T<PatchTypes.FarmingPatchTypes>('farmingpatches.hespori');
	}
}
