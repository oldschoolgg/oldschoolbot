/* eslint-disable @typescript-eslint/no-namespace */
import { O } from 'ts-toolbelt';

import { BitField } from '../../constants';
import { GearSetup } from '../../gear';
import { PatchTypes } from '../../minions/farming';
import { CompostTier, FarmingContract, FarmingPatchTypes } from '../../minions/farming/types';
import { BirdhouseData } from '../../skilling/skills/hunter/defaultBirdHouseTrap';
import { SkillsEnum } from '../../skilling/types';
import { SlayerTaskUnlocksEnum } from '../../slayer/slayerUnlocks';
import { ItemBank } from '../../types';
import {CombatOptionsEnum} from "../../minions/data/combatConstants";

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
	export const CreatureScores = T<O.Readonly<ItemBank>>('creatureScores');
	export const ClueScores = T<O.Readonly<ItemBank>>('clueScores');
	export const LapsScores = T<O.Readonly<ItemBank>>('lapsScores');
	export const LastDailyTimestamp = T<number>('lastDailyTimestamp');
	export const BitField = T<readonly BitField[]>('bitfield');
	export const FavoriteItems = T<readonly number[]>('favoriteItems');
	export const Badges = T<readonly number[]>('badges');
	export const RSN = T<string>('RSN');
	export const SacrificedValue = T<number>('sacrificedValue');
	export const SacrificedBank = T<O.Readonly<ItemBank>>('sacrificedBank');
	export const HonourLevel = T<number>('honour_level');
	export const HonourPoints = T<number>('honour_points');
	export const HighGambles = T<number>('high_gambles');
	export const PatreonID = T<string | null>('patreon_id');
	export const GithubID = T<number | null>('github_id');
	export const CarpenterPoints = T<number>('carpenter_points');
	export const ZealTokens = T<number>('zeal_tokens');
	export const OpenableScores = T<O.Readonly<ItemBank>>('openable_scores');
	export const AttackStyle = T<readonly SkillsEnum[]>('attack_style');
	export const TotalCoxPoints = T<number>('total_cox_points');
	export const FavoriteAlchables = T<readonly number[]>('favorite_alchables');
	export const BankBackgroundHex = T<string | null>('bank_bg_hex');
	export const CombatOptions = T<readonly CombatOptionsEnum[]>('combat_options');

	export namespace Slayer {
		export const SlayerPoints = T<number>('slayer.points');
		export const TaskStreak = T<number>('slayer.task_streak');
		export const RememberSlayerMaster = T<string | null>('slayer.remember_master');
		export const SuperiorCount = T<number>('slayer.superior_count');
		export const SlayerUnlocks = T<readonly SlayerTaskUnlocksEnum[]>('slayer.unlocks');
		export const BlockedTasks = T<readonly number[]>('slayer.blocked_ids');
		export const AutoslayOptions = T<readonly number[]>('slayer.autoslay_options');
		export const LastTask = T<number>('slayer.last_task');
		export const UnsiredOffered = T<number>('slayer.unsired_offered');
	}

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
		export const Ironman = T<boolean>('minion.ironman');
		export const Icon = T<string | null>('minion.icon');
		export const EquippedPet = T<number | null>('minion.equippedPet');
		export const FarmingContract = T<FarmingContract | null>('minion.farmingContract');
		export const DefaultCompostToUse = T<CompostTier>('minion.defaultCompostToUse');
		export const DefaultPay = T<boolean>('minion.defaultPay');
		export const BirdhouseTraps = T<BirdhouseData | null>('minion.birdhouseTraps');
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
		export const Thieving = T<number>(`skills.${SkillsEnum.Thieving}`);
		export const Farming = T<number>(`skills.${SkillsEnum.Farming}`);
		export const Herblore = T<number>(`skills.${SkillsEnum.Herblore}`);
		export const Hunter = T<number>(`skills.${SkillsEnum.Hunter}`);
		export const Construction = T<number>(`skills.${SkillsEnum.Construction}`);
		export const Magic = T<number>(`skills.${SkillsEnum.Magic}`);
		export const Attack = T<number>(`skills.${SkillsEnum.Attack}`);
		export const Strength = T<number>(`skills.${SkillsEnum.Strength}`);
		export const Defence = T<number>(`skills.${SkillsEnum.Defence}`);
		export const Ranged = T<number>(`skills.${SkillsEnum.Ranged}`);
		export const Hitpoints = T<number>(`skills.${SkillsEnum.Hitpoints}`);
		export const Slayer = T<number>(`skills.${SkillsEnum.Slayer}`);
	}

	export namespace Gear {
		export const Melee = T<GearSetup | null>(`gear.melee`);
		export const Range = T<GearSetup | null>(`gear.range`);
		export const Mage = T<GearSetup | null>(`gear.mage`);
		export const Misc = T<GearSetup | null>(`gear.misc`);
		export const Skilling = T<GearSetup | null>(`gear.skilling`);
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
		export const Hops = T<PatchTypes.PatchData>(`farmingPatches.${FarmingPatchTypes.Hops}`);
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
		export const Mushroom = T<PatchTypes.PatchData>(
			`farmingPatches.${FarmingPatchTypes.Mushroom}`
		);
		export const Belladonna = T<PatchTypes.PatchData>(
			`farmingPatches.${FarmingPatchTypes.Belladonna}`
		);
	}
}
