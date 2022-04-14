import { Peak } from '../../tasks/WildernessPeakInterval';
import { IPatchData } from '../minions/farming/types';
import { MinigameName } from '../settings/minigames';
import { KourendFavour } from './../minions/data/kourendFavour';
import { BirdhouseData } from './../skilling/skills/hunter/defaultBirdHouseTrap';
import { ItemBank } from '.';
import { activity_type_enum } from '.prisma/client';

export interface ActivityTaskOptions {
	type: activity_type_enum;
	userID: string;
	duration: number;
	id: number;
	finishDate: number;
	channelID: string;
}

export interface ActivityTaskOptionsWithQuantity extends ActivityTaskOptions {
	quantity: number;
}

export interface RunecraftActivityTaskOptions extends ActivityTaskOptions {
	runeID: number;
	essenceQuantity: number;
	imbueCasts: number;
	useStaminas?: boolean;
}

export interface DarkAltarOptions extends ActivityTaskOptions {
	quantity: number;
	hasElite: boolean;
	rune: 'blood' | 'soul';
}

export interface AgilityActivityTaskOptions extends ActivityTaskOptions {
	courseID: string;
	quantity: number;
	alch: {
		itemID: number;
		quantity: number;
	} | null;
}

export interface CookingActivityTaskOptions extends ActivityTaskOptions {
	cookableID: number;
	quantity: number;
}

export interface ConstructionActivityTaskOptions extends ActivityTaskOptions {
	objectID: number;
	quantity: number;
}

export interface MonsterActivityTaskOptions extends ActivityTaskOptions {
	monsterID: number;
	quantity: number;
	usingCannon?: boolean;
	cannonMulti?: boolean;
	burstOrBarrage?: number;
}

export interface RevenantOptions extends ActivityTaskOptions {
	monsterID: number;
	quantity: number;
	died: boolean;
	usingPrayerPots: boolean;
	skulled: boolean;
	style: 'melee' | 'range' | 'mage';
}
export interface ClueActivityTaskOptions extends ActivityTaskOptions {
	clueID: number;
	quantity: number;
}

export interface FishingActivityTaskOptions extends ActivityTaskOptions {
	fishID: number;
	quantity: number;
}

export interface MiningActivityTaskOptions extends ActivityTaskOptions {
	oreID: number;
	quantity: number;
}

export interface SmeltingActivityTaskOptions extends ActivityTaskOptions {
	barID: number;
	quantity: number;
}

export interface SmithingActivityTaskOptions extends ActivityTaskOptions {
	smithedBarID: number;
	quantity: number;
}

export interface FiremakingActivityTaskOptions extends ActivityTaskOptions {
	burnableID: number;
	quantity: number;
}

export interface WoodcuttingActivityTaskOptions extends ActivityTaskOptions {
	logID: number;
	quantity: number;
}

export interface CraftingActivityTaskOptions extends ActivityTaskOptions {
	craftableID: number;
	quantity: number;
}

export interface FletchingActivityTaskOptions extends ActivityTaskOptions {
	fletchableName: string;
	quantity: number;
}

export interface EnchantingActivityTaskOptions extends ActivityTaskOptions {
	itemID: number;
	quantity: number;
}

export interface CastingActivityTaskOptions extends ActivityTaskOptions {
	spellID: number;
	quantity: number;
}
export interface PickpocketActivityTaskOptions extends ActivityTaskOptions {
	monsterID: number;
	quantity: number;
	xpReceived: number;
	successfulQuantity: number;
	damageTaken: number;
}

export interface BuryingActivityTaskOptions extends ActivityTaskOptions {
	boneID: number;
	quantity: number;
}

export interface OfferingActivityTaskOptions extends ActivityTaskOptions {
	boneID: number;
	quantity: number;
}

export interface AnimatedArmourActivityTaskOptions extends ActivityTaskOptions {
	armourID: string;
	quantity: number;
}

export interface HerbloreActivityTaskOptions extends ActivityTaskOptions {
	mixableID: number;
	quantity: number;
	zahur: boolean;
}

export interface HunterActivityTaskOptions extends ActivityTaskOptions {
	creatureName: string;
	quantity: number;
	usingHuntPotion: boolean;
	wildyPeak: Peak | null;
}

export interface AlchingActivityTaskOptions extends ActivityTaskOptions {
	itemID: number;
	quantity: number;
	alchValue: number;
}

export interface FightCavesActivityTaskOptions extends ActivityTaskOptions {
	jadDeathChance: number;
	preJadDeathChance: number;
	preJadDeathTime: number | null;
	quantity: number;
}
export interface InfernoOptions extends ActivityTaskOptions {
	zukDeathChance: number;
	preZukDeathChance: number;
	deathTime: number | null;
	fakeDuration: number;
	diedZuk: boolean;
	diedPreZuk: boolean;
	cost: ItemBank;
}

export interface FarmingActivityTaskOptions extends ActivityTaskOptions {
	plantsName: string | null;
	quantity: number;
	upgradeType: string | null;
	payment?: boolean;
	patchType: IPatchData;
	getPatchType: string;
	planting: boolean;
	currentDate: number;
	autoFarmed: boolean;
}

export interface BirdhouseActivityTaskOptions extends ActivityTaskOptions {
	birdhouseName: string | null;
	placing: boolean;
	gotCraft: boolean;
	birdhouseData: BirdhouseData;
	currentDate: number;
}

export interface MinigameActivityTaskOptions extends ActivityTaskOptions {
	minigameID: MinigameName;
	quantity: number;
}

export interface MahoganyHomesActivityTaskOptions extends MinigameActivityTaskOptions {
	xp: number;
	quantity: number;
	points: number;
}

export interface NightmareActivityTaskOptions extends ActivityTaskOptions {
	leader: string;
	users: string[];
	quantity: number;
	isPhosani?: boolean;
}

export interface TemporossActivityTaskOptions extends MinigameActivityTaskOptions {
	quantity: number;
	rewardBoost: number;
}

export interface TitheFarmActivityTaskOptions extends MinigameActivityTaskOptions {}

export interface SepulchreActivityTaskOptions extends MinigameActivityTaskOptions {
	floors: number[];
}

export interface PlunderActivityTaskOptions extends MinigameActivityTaskOptions {
	rooms: number[];
}

export interface ZalcanoActivityTaskOptions extends ActivityTaskOptions {
	isMVP: boolean;
	performance: number;
	quantity: number;
}

export interface TempleTrekkingActivityTaskOptions extends MinigameActivityTaskOptions {
	difficulty: string;
}

export interface SawmillActivityTaskOptions extends ActivityTaskOptions {
	plankID: number;
	plankQuantity: number;
}

export interface GnomeRestaurantActivityTaskOptions extends MinigameActivityTaskOptions {
	gloriesRemoved: number;
}

export interface GauntletOptions extends ActivityTaskOptions {
	corrupted: boolean;
	quantity: number;
}

export interface GroupMonsterActivityTaskOptions extends MonsterActivityTaskOptions {
	leader: string;
	users: string[];
}

export interface RaidsOptions extends ActivityTaskOptions {
	leader: string;
	users: string[];
	challengeMode: boolean;
}

export interface TheatreOfBloodTaskOptions extends ActivityTaskOptions {
	leader: string;
	users: string[];
	hardMode: boolean;
	fakeDuration: number;
	wipedRoom: null | number;
	deaths: number[][];
}

export interface NexTaskOptions extends ActivityTaskOptions {
	quantity: number;
	leader: string;
	users: string[];
	userDetails: [string, number, number[]][];
	fakeDuration: number;
	wipedKill: number | null;
}

export interface CollectingOptions extends ActivityTaskOptions {
	collectableID: number;
	quantity: number;
}

export interface BlastFurnaceActivityTaskOptions extends ActivityTaskOptions {
	barID: number;
	quantity: number;
}

export interface KourendFavourActivityTaskOptions extends ActivityTaskOptions {
	favour: KourendFavour;
	quantity: number;
}

export interface TokkulShopOptions extends ActivityTaskOptions {
	itemID: number;
	quantity: number;
}

export type ActivityTaskData =
	| ActivityTaskOptions
	| MonsterActivityTaskOptions
	| BlastFurnaceActivityTaskOptions
	| WoodcuttingActivityTaskOptions
	| CollectingOptions
	| RaidsOptions
	| MinigameActivityTaskOptions
	| GauntletOptions
	| CastingActivityTaskOptions
	| EnchantingActivityTaskOptions
	| ConstructionActivityTaskOptions
	| HunterActivityTaskOptions
	| ZalcanoActivityTaskOptions
	| SawmillActivityTaskOptions
	| FarmingActivityTaskOptions
	| HerbloreActivityTaskOptions
	| FletchingActivityTaskOptions
	| RunecraftActivityTaskOptions
	| TempleTrekkingActivityTaskOptions
	| TemporossActivityTaskOptions
	| KourendFavourActivityTaskOptions;
