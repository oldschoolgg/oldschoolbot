import type { CropUpgradeType } from '@prisma/client';

import type { TeamMember } from 'discord.js';
import type { ItemBank } from '.';
import type { BathhouseTierName } from '../baxtorianBathhouses';
import type { TuraelsTrialsMethod } from '../bso/turaelsTrials';
import type { NMZStrategy, TwitcherGloves, UnderwaterAgilityThievingTrainingSkill } from '../constants';
import type { Kibble } from '../data/kibble';
import type { IMaterialBank, MaterialType } from '../invention';
import type { SlayerActivityConstants } from '../minions/data/combatConstants';
import type { IPatchData } from '../minions/farming/types';
import type { AttackStyles } from '../minions/functions';
import type { Monkey } from '../monkeyRumble';
import type { MinigameName } from '../settings/minigames';
import type { RaidLevel } from '../simulation/toa';
import type { BossUser } from '../structures/Boss';
import type { Peak } from '../tickers';
import type { BirdhouseData } from './../skilling/skills/hunter/defaultBirdHouseTrap';

export interface ActivityTaskOptions {
	userID: string;
	duration: number;
	id: number;
	finishDate: number;
	channelID: string;
	cantBeDoubled?: boolean;
}

export interface KibbleOptions extends ActivityTaskOptions {
	type: 'KibbleMaking';
	quantity: number;
	kibbleType: Kibble['type'];
}

export interface TuraelsTrialsOptions extends ActivityTaskOptions {
	type: 'TuraelsTrials';
	minigameID: MinigameName;
	q: number;
	m: TuraelsTrialsMethod;
}

export interface ActivityTaskOptionsWithNoChanges extends ActivityTaskOptions {
	type:
		| 'Questing'
		| 'Wintertodt'
		| 'Cyclops'
		| 'GloryCharging'
		| 'WealthCharging'
		| 'BarbarianAssault'
		| 'AgilityArena'
		| 'ChampionsChallenge'
		| 'MyNotes'
		| 'AerialFishing'
		| 'DriftNet'
		| 'SoulWars'
		| 'RoguesDenMaze'
		| 'CastleWars'
		| 'MageArena'
		| 'MageTrainingArena'
		| 'BlastFurnace'
		| 'MageArena2'
		| 'BigChompyBirdHunting'
		| 'PestControl'
		| 'VolcanicMine'
		| 'TearsOfGuthix'
		| 'LastManStanding'
		| 'BirthdayEvent'
		| 'TroubleBrewing'
		| 'Easter'
		| 'ShootingStars'
		| 'HalloweenEvent'
		| 'StrongholdOfSecurity'
		| 'TrickOrTreat'
		| 'HalloweenMiniMinigame'
		| 'BirthdayCollectIngredients'
		| 'CombatRing';
}

export interface ActivityTaskOptionsWithQuantity extends ActivityTaskOptions {
	type:
		| 'VolcanicMine'
		| 'Cyclops'
		| 'ShootingStars'
		| 'DriftNet'
		| 'WealthCharging'
		| 'GloryCharging'
		| 'AerialFishing'
		| 'FishingTrawler'
		| 'CamdozaalFishing'
		| 'CamdozaalMining'
		| 'CamdozaalSmithing'
		| 'Naxxus'
		| 'MyNotes';
	quantity: number;
	// iQty is 'input quantity.' This is the number specified at command time, so we can accurately repeat such trips.
	iQty?: number;
}

export interface ShootingStarsOptions extends ActivityTaskOptions {
	type: 'ShootingStars';
	size: number;
	usersWith: number;
	totalXp: number;
	lootItems: ItemBank;
}
interface ActivityTaskOptionsWithUsers extends ActivityTaskOptions {
	users: string[];
}

export interface RunecraftActivityTaskOptions extends ActivityTaskOptions {
	type: 'Runecraft';
	runeID: number;
	essenceQuantity: number;
	imbueCasts: number;
	obisEssenceQuantity?: number;
	useStaminas?: boolean;
	daeyaltEssence?: boolean;
}

export interface TiaraRunecraftActivityTaskOptions extends ActivityTaskOptions {
	type: 'TiaraRunecraft';
	tiaraID: number;
	tiaraQuantity: number;
}

export interface DarkAltarOptions extends ActivityTaskOptions {
	type: 'DarkAltar';
	quantity: number;
	hasElite: boolean;
	rune: 'blood' | 'soul';
}

export interface OuraniaAltarOptions extends ActivityTaskOptions {
	type: 'OuraniaAltar';
	quantity: number;
	stamina: boolean;
	daeyalt: boolean;
}

export interface AgilityActivityTaskOptions extends ActivityTaskOptions {
	type: 'Agility';
	courseID: string;
	quantity: number;
	alch: {
		itemID: number;
		quantity: number;
	} | null;
}

export interface CookingActivityTaskOptions extends ActivityTaskOptions {
	type: 'Cooking';
	cookableID: number;
	quantity: number;
}

export interface ConstructionActivityTaskOptions extends ActivityTaskOptions {
	type: 'Construction';
	objectID: number;
	quantity: number;
}

export interface MonsterActivityTaskOptions extends ActivityTaskOptions {
	type: 'MonsterKilling';
	mi: number;
	q: number;
	iQty?: number;
	usingCannon?: boolean;
	cannonMulti?: boolean;
	chinning?: boolean;
	bob?: SlayerActivityConstants.IceBarrage | SlayerActivityConstants.IceBurst;
	died?: boolean;
	pkEncounters?: number;
	hasWildySupplies?: boolean;
	isInWilderness?: boolean;
	attackStyles?: AttackStyles[];
}

export type UndoneChangesMonsterOptions = Omit<MonsterActivityTaskOptions, 'q' | 'mi'> & {
	quantity: number;
	monsterID: number;
};

export interface ClueActivityTaskOptions extends ActivityTaskOptions {
	type: 'ClueCompletion';
	ci: number;
	q: number;
	implingID?: number;
	implingClues?: number;
}

export interface FishingActivityTaskOptions extends ActivityTaskOptions {
	type: 'Fishing';
	fishID: number;
	quantity: number;
	flakesQuantity?: number;
	iQty?: number;
}

export interface MiningActivityTaskOptions extends ActivityTaskOptions {
	type: 'Mining';
	fakeDurationMax: number;
	fakeDurationMin: number;
	oreID: number;
	quantity: number;
	powermine: boolean;
	iQty?: number;
}

export interface MotherlodeMiningActivityTaskOptions extends ActivityTaskOptions {
	type: 'MotherlodeMining';
	fakeDurationMax: number;
	fakeDurationMin: number;
	quantity: number;
	iQty?: number;
}

export interface SmeltingActivityTaskOptions extends ActivityTaskOptions {
	type: 'Smelting';
	barID: number;
	quantity: number;
	blastf: boolean;
}

export interface SmithingActivityTaskOptions extends ActivityTaskOptions {
	type: 'Smithing';
	smithedBarID: number;
	quantity: number;
}

export interface FiremakingActivityTaskOptions extends ActivityTaskOptions {
	type: 'Firemaking';
	burnableID: number;
	quantity: number;
}

export interface WoodcuttingActivityTaskOptions extends ActivityTaskOptions {
	type: 'Woodcutting';
	fakeDurationMax: number;
	fakeDurationMin: number;
	powerchopping: boolean;
	forestry?: boolean;
	twitchers?: TwitcherGloves;
	logID: number;
	quantity: number;
	iQty?: number;
}

export interface CraftingActivityTaskOptions extends ActivityTaskOptions {
	type: 'Crafting';
	craftableID: number;
	quantity: number;
}

export interface FletchingActivityTaskOptions extends ActivityTaskOptions {
	type: 'Fletching';
	fletchableName: string;
	quantity: number;
}

export interface EnchantingActivityTaskOptions extends ActivityTaskOptions {
	type: 'Enchanting';
	itemID: number;
	quantity: number;
}

export interface CastingActivityTaskOptions extends ActivityTaskOptions {
	type: 'Casting';
	spellID: number;
	quantity: number;
}
export interface PickpocketActivityTaskOptions extends ActivityTaskOptions {
	type: 'Pickpocket';
	monsterID: number;
	quantity: number;
	xpReceived: number;
	successfulQuantity: number;
	damageTaken: number;
}

export interface BuryingActivityTaskOptions extends ActivityTaskOptions {
	type: 'Burying';
	boneID: number;
	quantity: number;
}

export interface ScatteringActivityTaskOptions extends ActivityTaskOptions {
	type: 'Scattering';
	ashID: number;
	quantity: number;
}

export interface OfferingActivityTaskOptions extends ActivityTaskOptions {
	type: 'Offering';
	boneID: number;
	quantity: number;
}

export interface AnimatedArmourActivityTaskOptions extends ActivityTaskOptions {
	type: 'AnimatedArmour';
	armourID: string;
	quantity: number;
}

export interface HerbloreActivityTaskOptions extends ActivityTaskOptions {
	type: 'Herblore';
	mixableID: number;
	quantity: number;
	zahur: boolean;
	wesley: boolean;
}

export interface CreateForestersRationsActivityTaskOptions extends ActivityTaskOptions {
	type: 'CreateForestersRations';
	rationName: string;
	quantity: number;
}

export interface CutLeapingFishActivityTaskOptions extends ActivityTaskOptions {
	type: 'CutLeapingFish';
	fishID: number;
	quantity: number;
}

export interface HunterActivityTaskOptions extends ActivityTaskOptions {
	type: 'Hunter';
	creatureName: string;
	quantity: number;
	usingHuntPotion: boolean;
	wildyPeak: Peak | null;
	usingStaminaPotion: boolean;
}

export interface AlchingActivityTaskOptions extends ActivityTaskOptions {
	type: 'Alching';
	itemID: number;
	quantity: number;
	alchValue: number;
}

export interface FightCavesActivityTaskOptions extends ActivityTaskOptions {
	type: 'FightCaves';
	jadDeathChance: number;
	preJadDeathChance: number;
	preJadDeathTime: number | null;
	fakeDuration: number;
	quantity: number;
}
export interface InfernoOptions extends ActivityTaskOptions {
	type: 'Inferno';
	zukDeathChance: number;
	preZukDeathChance: number;
	emergedZukDeathChance: number;
	deathTime: number | null;
	fakeDuration: number;
	diedZuk: boolean;
	diedPreZuk: boolean;
	diedEmergedZuk: boolean;
	cost: ItemBank;
	isEmergedZuk: boolean;
}

export interface FarmingActivityTaskOptions extends ActivityTaskOptions {
	type: 'Farming';
	pid?: number;
	plantsName: string | null;
	quantity: number;
	upgradeType: CropUpgradeType | null;
	payment?: boolean;
	patchType: IPatchData;
	planting: boolean;
	currentDate: number;
	autoFarmed: boolean;
}

export interface BirdhouseActivityTaskOptions extends ActivityTaskOptions {
	type: 'Birdhouse';
	birdhouseName: string | null;
	placing: boolean;
	gotCraft: boolean;
	birdhouseData: BirdhouseData;
	currentDate: number;
}

interface MinigameActivityTaskOptions extends ActivityTaskOptions {
	minigameID: MinigameName;
	quantity: number;
}

export interface MinigameActivityTaskOptionsWithNoChanges extends MinigameActivityTaskOptions {
	type:
		| 'Wintertodt'
		| 'TroubleBrewing'
		| 'TearsOfGuthix'
		| 'SoulWars'
		| 'RoguesDenMaze'
		| 'MageTrainingArena'
		| 'LastManStanding'
		| 'BigChompyBirdHunting'
		| 'FishingTrawler'
		| 'PestControl'
		| 'BarbarianAssault'
		| 'ChampionsChallenge'
		| 'CastleWars'
		| 'AgilityArena'
		| 'GiantsFoundry'
		| 'StealingCreation'
		| 'OuraniaDeliveryService'
		| 'FistOfGuthix'
		| 'BalthazarsBigBonanza'
		| 'GuthixianCache'
		| 'TuraelsTrials';
}

export interface MahoganyHomesActivityTaskOptions extends MinigameActivityTaskOptions {
	type: 'MahoganyHomes';
	xp: number;
	quantity: number;
	points: number;
	tier: number;
}

export interface BossActivityTaskOptions extends ActivityTaskOptions {
	type: 'Nex' | 'KalphiteKing';
	users: string[];
	quantity: number;
}

export interface NightmareActivityTaskOptions extends ActivityTaskOptions {
	type: 'Nightmare';
	method: 'solo' | 'mass';
	quantity: number;
	isPhosani?: boolean;
}

interface StoredBossUser extends Omit<BossUser, 'user' | 'itemsToRemove'> {
	user: string;
	itemsToRemove: ItemBank;
}

export interface NewBossOptions extends ActivityTaskOptions {
	type: 'VasaMagus' | 'Ignecarus' | 'KingGoldemar' | 'BossEvent';
	users: string[];
	quantity: number;
	bossUsers: StoredBossUser[];
	bossID: number;
}

export interface TemporossActivityTaskOptions extends MinigameActivityTaskOptions {
	type: 'Tempoross';
	quantity: number;
	rewardBoost: number;
}

export interface TitheFarmActivityTaskOptions extends MinigameActivityTaskOptions {
	type: 'TitheFarm';
}

export interface SepulchreActivityTaskOptions extends MinigameActivityTaskOptions {
	type: 'Sepulchre';
	floors: number[];
}

export interface PlunderActivityTaskOptions extends MinigameActivityTaskOptions {
	type: 'Plunder';
	rooms: number[];
}

export interface ZalcanoActivityTaskOptions extends ActivityTaskOptions {
	type: 'Zalcano';
	isMVP: boolean;
	performance: number;
	quantity: number;
}

export interface TempleTrekkingActivityTaskOptions extends MinigameActivityTaskOptions {
	type: 'Trekking';
	difficulty: string;
}

export interface RaidsActivityTaskOptions extends ActivityTaskOptions {
	type: 'Raids';
	channelID: string;
	quantity: number;
	partyLeaderID: string;
	users: string[];
	team: TeamMember[];
	challengeMode: boolean;
}

export interface SawmillActivityTaskOptions extends ActivityTaskOptions {
	type: 'Sawmill';
	plankID: number;
	plankQuantity: number;
}

export interface ButlerActivityTaskOptions extends ActivityTaskOptions {
	type: 'Butler';
	plankID: number;
	plankQuantity: number;
}

export interface GnomeRestaurantActivityTaskOptions extends MinigameActivityTaskOptions {
	type: 'GnomeRestaurant';
	gloriesRemoved: number;
}

export interface GauntletOptions extends ActivityTaskOptions {
	type: 'Gauntlet';
	corrupted: boolean;
	quantity: number;
}

export interface GroupMonsterActivityTaskOptions extends Omit<MonsterActivityTaskOptions, 'type'> {
	type: 'GroupMonsterKilling';
	leader: string;
	users: string[];
}

export interface RaidsOptions extends ActivityTaskOptionsWithUsers {
	type: 'Raids';
	leader: string;
	users: string[];
	challengeMode: boolean;
	maxSizeInput?: number;
	quantity?: number;
	// id of user that used chincannon
	cc?: string;
}

export interface TheatreOfBloodTaskOptions extends ActivityTaskOptionsWithUsers {
	type: 'TheatreOfBlood';
	leader: string;
	users: string[];
	hardMode: boolean;
	fakeDuration: number;
	wipedRooms: (null | number)[];
	deaths: number[][][];
	quantity: number;
	solo?: 'solo' | 'trio';
	// id of user that used chincannon
	cc?: string;
}

export interface ColoTaskOptions extends ActivityTaskOptions {
	type: 'Colosseum';
	quantity: number;
	fakeDuration: number;
	diedAt?: (number | null)[];
	loot?: ItemBank;
	maxGlory: number;
	scytheCharges: number;
	venatorBowCharges: number;
	bloodFuryCharges: number;
	voidStaffCharges: number;
}

type UserID = string;
type Points = number;
type RoomIDsDiedAt = number[];

type TOAUser = [UserID, Points[], RoomIDsDiedAt[]];
export interface TOAOptions extends ActivityTaskOptionsWithUsers {
	type: 'TombsOfAmascut';
	leader: string;
	detailedUsers: TOAUser[] | [UserID, Points, RoomIDsDiedAt][][];
	raidLevel: RaidLevel;
	fakeDuration: number;
	wipedRoom: null | number | (number | null)[];
	quantity: number;
	// id of user that used chincannon
	cc?: string;
}

export interface DOAStoredRaid {
	wipedRoom: number | null;
	users: { deaths: number[] }[];
}

export interface DOAOptions extends ActivityTaskOptionsWithUsers {
	type: 'DepthsOfAtlantis';
	leader: string;
	cm: boolean;
	fakeDuration: number;
	quantity: number;
	raids: DOAStoredRaid[];
	// id of user that used chincannon
	cc?: string;
}

export interface NexTaskOptions extends ActivityTaskOptionsWithUsers {
	type: 'Nex';
	quantity: number;
	leader: string;
	userDetails: [string, number, number[]][];
	fakeDuration: number;
	wipedKill: number | null;
}

export interface CollectingOptions extends ActivityTaskOptions {
	type: 'Collecting';
	collectableID: number;
	quantity: number;
	noStaminas?: boolean;
}

export interface RaidsOptions extends ActivityTaskOptions {
	leader: string;
	users: string[];
	challengeMode: boolean;
}

export interface VolcanicMineActivityTaskOptions extends ActivityTaskOptions {
	quantity: number;
}

export interface MonkeyRumbleOptions extends MinigameActivityTaskOptions {
	type: 'MonkeyRumble';
	quantity: number;
	monkeys: Monkey[];
}

export interface FishingContestOptions extends MinigameActivityTaskOptions {
	type: 'FishingContest';
	quantity: number;
	location: number;
}
export interface TearsOfGuthixActivityTaskOptions extends MinigameActivityTaskOptions {}

export interface KourendFavourActivityTaskOptions extends ActivityTaskOptions {
	type: 'KourendFavour';
	favour: string;
	quantity: number;
}

export interface TokkulShopOptions extends ActivityTaskOptions {
	type: 'TokkulShop';
	itemID: number;
	quantity: number;
}

export interface UnderwaterAgilityThievingTaskOptions extends ActivityTaskOptions {
	type: 'UnderwaterAgilityThieving';
	trainingSkill: UnderwaterAgilityThievingTrainingSkill;
	quantity: number;
	noStams: boolean;
}

export interface PuroPuroActivityTaskOptions extends MinigameActivityTaskOptions {
	type: 'PuroPuro';
	quantity: number;
	darkLure: boolean;
	implingTier: number | null;
}

export interface GiantsFoundryActivityTaskOptions extends MinigameActivityTaskOptions {
	type: 'GiantsFoundry';
	alloyID: number;
	quantity: number;
	metalScore: number;
}

export interface GuardiansOfTheRiftActivityTaskOptions extends MinigameActivityTaskOptions {
	type: 'GuardiansOfTheRift';
	minedFragments: number;
	barrierAndGuardian: number;
	rolls: number;
	combinationRunes: boolean;
}

export interface TinkeringWorkshopOptions extends MinigameActivityTaskOptions {
	type: 'TinkeringWorkshop';
	material: MaterialType;
}
export interface NightmareZoneActivityTaskOptions extends MinigameActivityTaskOptions {
	type: 'NightmareZone';
	strategy: NMZStrategy;
	quantity: number;
}

export interface ShadesOfMortonOptions extends MinigameActivityTaskOptions {
	type: 'ShadesOfMorton';
	shadeID: string;
	logID: number;
}
export interface SpecificQuestOptions extends ActivityTaskOptions {
	type: 'SpecificQuest';
	questID: number;
}

export interface MoktangTaskOptions extends ActivityTaskOptions {
	type: 'Moktang';
	qty: number;
}

export interface DungeoneeringOptions extends ActivityTaskOptions {
	type: 'Dungeoneering';
	leader: string;
	users: string[];
	quantity: number;
	floor: number;
}

export interface DisassembleTaskOptions extends ActivityTaskOptions {
	type: 'Disassembling';
	i: number;
	qty: number;
	mats: IMaterialBank;
	xp: number;
}

export interface ResearchTaskOptions extends ActivityTaskOptions {
	type: 'Research';
	material: MaterialType;
	quantity: number;
}

export interface BathhouseTaskOptions extends MinigameActivityTaskOptions {
	type: 'BaxtorianBathhouses';
	mixture: string;
	ore: number;
	tier: BathhouseTierName;
}

export interface MortimerOptions extends ActivityTaskOptions {
	type: 'Mortimer';
}

export interface MemoryHarvestOptions extends ActivityTaskOptions {
	type: 'MemoryHarvest';
	e: number;
	t: number;
	wb: boolean;
	dh: boolean;
	dp: boolean;
	r: number;
}

export type ActivityTaskData =
	| MonsterActivityTaskOptions
	| WoodcuttingActivityTaskOptions
	| CollectingOptions
	| RaidsActivityTaskOptions
	| RaidsOptions
	| GauntletOptions
	| CastingActivityTaskOptions
	| EnchantingActivityTaskOptions
	| ConstructionActivityTaskOptions
	| HunterActivityTaskOptions
	| ZalcanoActivityTaskOptions
	| SawmillActivityTaskOptions
	| ButlerActivityTaskOptions
	| FarmingActivityTaskOptions
	| HerbloreActivityTaskOptions
	| FletchingActivityTaskOptions
	| RunecraftActivityTaskOptions
	| TempleTrekkingActivityTaskOptions
	| TemporossActivityTaskOptions
	| PuroPuroActivityTaskOptions
	| KourendFavourActivityTaskOptions
	| AgilityActivityTaskOptions
	| InfernoOptions
	| TOAOptions
	| NexTaskOptions
	| ZalcanoActivityTaskOptions
	| TheatreOfBloodTaskOptions
	| GuardiansOfTheRiftActivityTaskOptions
	| GiantsFoundryActivityTaskOptions
	| NightmareZoneActivityTaskOptions
	| ShadesOfMortonOptions
	| UnderwaterAgilityThievingTaskOptions
	| PickpocketActivityTaskOptions
	| BuryingActivityTaskOptions
	| ScatteringActivityTaskOptions
	| OfferingActivityTaskOptions
	| AnimatedArmourActivityTaskOptions
	| CookingActivityTaskOptions
	| CraftingActivityTaskOptions
	| FiremakingActivityTaskOptions
	| FishingActivityTaskOptions
	| MiningActivityTaskOptions
	| MotherlodeMiningActivityTaskOptions
	| PlunderActivityTaskOptions
	| SmithingActivityTaskOptions
	| SmeltingActivityTaskOptions
	| TiaraRunecraftActivityTaskOptions
	| ClueActivityTaskOptions
	| AlchingActivityTaskOptions
	| DarkAltarOptions
	| OuraniaAltarOptions
	| GroupMonsterActivityTaskOptions
	| MahoganyHomesActivityTaskOptions
	| NightmareActivityTaskOptions
	| TitheFarmActivityTaskOptions
	| SepulchreActivityTaskOptions
	| GnomeRestaurantActivityTaskOptions
	| SpecificQuestOptions
	| ActivityTaskOptionsWithNoChanges
	| TokkulShopOptions
	| BirdhouseActivityTaskOptions
	| FightCavesActivityTaskOptions
	| ActivityTaskOptionsWithQuantity
	| MinigameActivityTaskOptionsWithNoChanges
	| NewBossOptions
	| TinkeringWorkshopOptions
	| BossActivityTaskOptions
	| MonkeyRumbleOptions
	| MoktangTaskOptions
	| KibbleOptions
	| FishingContestOptions
	| DungeoneeringOptions
	| DOAOptions
	| DisassembleTaskOptions
	| BathhouseTaskOptions
	| ResearchTaskOptions
	| CutLeapingFishActivityTaskOptions
	| MortimerOptions
	| MemoryHarvestOptions
	| TuraelsTrialsOptions
	| CutLeapingFishActivityTaskOptions
	| CreateForestersRationsActivityTaskOptions
	| ColoTaskOptions;
