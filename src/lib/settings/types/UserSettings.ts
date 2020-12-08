/* eslint-disable @typescript-eslint/no-namespace */
import { O } from 'ts-toolbelt';

import { GearTypes } from '../../gear';
import { SkillsEnum } from '../../skilling/types';
import { ItemBank } from '../../types';
import { FarmingPatchTypes } from '../../farming/types';
import { PatchTypes } from '../../farming';
import defaultContracts from '../../farming/defaultContracts';
import defaultTitheFarm from '../../farming/defaultTitheFarm';

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

		export const TitheFarmStats = T<typeof defaultTitheFarm>('stats.titheFarmStats');
	}

	export namespace Minion {
		export const Name = T<string>('minion.name');
		export const HasBought = T<boolean>('minion.hasBought');
		export const DailyDuration = T<number>('minion.dailyDuration');
		export const Ironman = T<boolean>('minion.ironman');
		export const Icon = T<string | null>('minion.icon');
		export const EquippedPet = T<number | null>('minion.equippedPet');
		export const FarmingContract = T<typeof defaultContracts>('minion.farmingContract');
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
		export const Herb = T<PatchTypes.PatchData>(`farmingPatches.${FarmingPatchTypes.Herb}`);
		export const FruitTree = T<PatchTypes.PatchData>(
			`farmingPatches.${FarmingPatchTypes.FruitTree}`
		);
		export const Tree = T<PatchTypes.PatchData>(`farmingPatches.${FarmingPatchTypes.Tree}`);
		export const Allotment = T<PatchTypes.PatchData>(
			`farmingPatches.${FarmingPatchTypes.Allotment}`
		);
		export const Cactus = T<PatchTypes.PatchData>(`farmingPatches.${FarmingPatchTypes.Cactus}`);
		export const Bush = T<PatchTypes.PatchData>(`farmingPatches.${FarmingPatchTypes.Bush}`);
		export const Spirit = T<PatchTypes.PatchData>(`farmingPatches.${FarmingPatchTypes.Spirit}`);
		export const Hardwood = T<PatchTypes.PatchData>(
			`farmingPatches.${FarmingPatchTypes.Hardwood}`
		);
		export const Seaweed = T<PatchTypes.PatchData>(
			`farmingPatches.${FarmingPatchTypes.Seaweed}`
		);
		export const Vine = T<PatchTypes.PatchData>(`farmingPatches.${FarmingPatchTypes.Vine}`);
		export const Calquat = T<PatchTypes.PatchData>(
			`farmingPatches.${FarmingPatchTypes.Calquat}`
		);
		export const Redwood = T<PatchTypes.PatchData>(
			`farmingPatches.${FarmingPatchTypes.Redwood}`
		);
		export const Crystal = T<PatchTypes.PatchData>(
			`farmingPatches.${FarmingPatchTypes.Crystal}`
		);
		export const Celastrus = T<PatchTypes.PatchData>(
			`farmingPatches.${FarmingPatchTypes.Celastrus}`
		);
		export const Hespori = T<PatchTypes.PatchData>(
			`farmingPatches.${FarmingPatchTypes.Hespori}`
		);
		export const Flower = T<PatchTypes.PatchData>(`farmingPatches.${FarmingPatchTypes.Flower}`);
	}
}
