/* eslint-disable @typescript-eslint/no-namespace */
import { HexColorString } from 'discord.js';

import { BitField } from '../../constants';
import { GearSetup } from '../../gear';
import { CombatOptionsEnum } from '../../minions/data/combatConstants';
import { BlowpipeData } from '../../minions/types';
import { AutoFarmFilterEnum, CompostName } from '../../skilling/skills/farming';
import { BirdhouseData } from '../../skilling/skills/hunter/defaultBirdHouseTrap';
import { SkillsEnum } from '../../skilling/types';
import { SlayerTaskUnlocksEnum } from '../../slayer/slayerUnlocks';
import { BankSortMethod } from '../../sorts';
import { ItemBank } from '../../types';
import { UserKourendFavour } from './../../minions/data/kourendFavour';

export type CustomGet<K extends string, TCustom> = K & { __type__: TCustom };

export function T<TCustom>(k: string): CustomGet<string, TCustom> {
	return k as CustomGet<string, Readonly<TCustom>>;
}

export namespace UserSettings {
	export const GP = T<number>('GP');
	export const QP = T<number>('QP');
	export const BankBackground = T<number>('bankBackground');
	export const Pets = T<Readonly<ItemBank>>('pets');
	export const CollectionLogBank = T<Readonly<ItemBank>>('collectionLogBank');
	export const MonsterScores = T<Readonly<ItemBank>>('monsterScores');
	export const CreatureScores = T<Readonly<ItemBank>>('creatureScores');
	export const LapsScores = T<Readonly<ItemBank>>('lapsScores');
	export const LastDailyTimestamp = T<number>('lastDailyTimestamp');
	export const LastTearsOfGuthixTimestamp = T<number>('lastTearsOfGuthixTimestamp');
	export const BitField = T<readonly BitField[]>('bitfield');
	export const FavoriteItems = T<readonly number[]>('favoriteItems');
	export const Badges = T<readonly number[]>('badges');
	export const RSN = T<string>('RSN');
	export const SacrificedValue = T<number>('sacrificedValue');
	export const SacrificedBank = T<Readonly<ItemBank>>('sacrificedBank');
	export const HonourLevel = T<number>('honour_level');
	export const HonourPoints = T<number>('honour_points');
	export const HighGambles = T<number>('high_gambles');
	export const CarpenterPoints = T<number>('carpenter_points');
	export const ZealTokens = T<number>('zeal_tokens');
	export const OpenableScores = T<Readonly<ItemBank>>('openable_scores');
	export const AttackStyle = T<readonly SkillsEnum[]>('attack_style');
	export const TotalCoxPoints = T<number>('total_cox_points');
	export const FavoriteAlchables = T<readonly number[]>('favorite_alchables');
	export const BankBackgroundHex = T<HexColorString | null>('bank_bg_hex');
	export const CombatOptions = T<readonly CombatOptionsEnum[]>('combat_options');
	export const FarmingPatchReminders = T<boolean>('farming_patch_reminders');
	export const PestControlPoints = T<number>('pest_control_points');
	export const VolcanicMinePoints = T<number>('volcanic_mine_points');
	export const FavoriteFood = T<readonly number[]>('favorite_food');
	export const KourendFavour = T<UserKourendFavour>('kourend_favour');
	export const IronmanAlts = T<readonly string[]>('ironman_alts');
	export const MainAccount = T<string | null>('main_account');

	export const InfernoAttempts = T<number>('inferno_attempts');
	export const InfernoCapeSacrifices = T<number>('inferno_cape_sacrifices');

	export const Blowpipe = T<Readonly<BlowpipeData>>('blowpipe');

	export const PremiumBalanceTier = T<number | null>('premium_balance_tier');
	export const PremiumBalanceExpiryDate = T<number | null>('premium_balance_expiry_date');

	export const TentacleCharges = T<number>('tentacle_charges');
	export const SangCharges = T<number>('sang_charges');

	export const TOBCost = T<Readonly<ItemBank>>('tob_cost');
	export const TOBLoot = T<Readonly<ItemBank>>('tob_loot');

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
		export const ChewedBonesOffered = T<number>('slayer.chewed_offered');
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

		export const InfernoAttempts = T<number>('inferno_attempts');
		export const InfernalCapesSacrificed = T<number>('infernal_cape_sacrifices');

		export const TobAttempts = T<number>('tob_attempts');
		export const TobHardModeAttempts = T<number>('tob_hard_attempts');
	}

	export namespace Minion {
		export const Name = T<string>('minion.name');
		export const HasBought = T<boolean>('minion.hasBought');
		export const Ironman = T<boolean>('minion.ironman');
		export const Icon = T<string | null>('minion.icon');
		export const EquippedPet = T<number | null>('minion.equippedPet');
		export const DefaultCompostToUse = T<CompostName | null>('minion.defaultCompostToUse');
		export const DefaultPay = T<boolean>('minion.defaultPay');
		export const AutoFarmFilterToUse = T<AutoFarmFilterEnum | null>('minion.autoFarmFilterToUse');
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
		export const Melee = T<GearSetup | null>('gear.melee');
		export const Range = T<GearSetup | null>('gear.range');
		export const Mage = T<GearSetup | null>('gear.mage');
		export const Misc = T<GearSetup | null>('gear.misc');
		export const Skilling = T<GearSetup | null>('gear.skilling');
		export const Wildy = T<GearSetup | null>('gear.wildy');
		export const Fashion = T<GearSetup | null>('gear.fashion');
		export const Other = T<GearSetup | null>('gear.other');
	}

	export const LMSPoints = T<number>('lms_points');
	export const GPLuckyPick = T<number>('gp_luckypick');
	export const GPDice = T<number>('gp_dice');
	export const GPSlots = T<number>('gp_slots');

	export const BankSortWeightings = T<Readonly<ItemBank>>('bank_sort_weightings');
	export const BankSortMethod = T<BankSortMethod | null>('bank_sort_method');
}
