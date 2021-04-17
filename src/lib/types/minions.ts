import { MinigameKey } from '../../extendables/User/Minigame';
import { Peak } from '../../tasks/WildernessPeakInterval';
import { Activity } from '../constants';
import { IPatchData } from '../minions/farming/types';
import { BirdhouseData } from './../skilling/skills/hunter/defaultBirdHouseTrap';

export interface ActivityTaskOptions {
	type: Activity;
	userID: string;
	duration: number;
	id: string;
	finishDate: number;
	channelID: string;
}

export interface GloryChargingActivityTaskOptions extends ActivityTaskOptions {
	quantity: number;
}

export interface WealthChargingActivityTaskOptions extends ActivityTaskOptions {
	quantity: number;
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

export interface CyclopsActivityTaskOptions extends ActivityTaskOptions {
	quantity: number;
}

export interface AnimatedArmourActivityTaskOptions extends ActivityTaskOptions {
	armourID: string;
	quantity: number;
}

export interface HerbloreActivityTaskOptions extends ActivityTaskOptions {
	mixableID: number;
	channelID: string;
	quantity: number;
	zahur: boolean;
}

export interface HunterActivityTaskOptions extends ActivityTaskOptions {
	creatureName: string;
	channelID: string;
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

export interface QuestingActivityTaskOptions extends ActivityTaskOptions {}

export interface FarmingActivityTaskOptions extends ActivityTaskOptions {
	plantsName: string | null;
	channelID: string;
	quantity: number;
	upgradeType: 'compost' | 'supercompost' | 'ultracompost' | null;
	payment?: boolean;
	patchType: IPatchData;
	getPatchType: string;
	planting: boolean;
	currentDate: number;
}

export interface BirdhouseActivityTaskOptions extends ActivityTaskOptions {
	birdhouseName: string | null;
	channelID: string;
	placing: boolean;
	gotCraft: boolean;
	birdhouseData: BirdhouseData;
	currentDate: number;
}

export interface AerialFishingActivityTaskOptions extends ActivityTaskOptions {
	quantity: number;
}

export interface MinigameActivityTaskOptions extends ActivityTaskOptions {
	minigameID: MinigameKey;
	quantity: number;
}

export interface MahoganyHomesActivityTaskOptions extends MinigameActivityTaskOptions {
	xp: number;
	quantity: number;
	points: number;
}

export interface FishingTrawlerActivityTaskOptions extends MinigameActivityTaskOptions {}

export interface NightmareActivityTaskOptions extends ActivityTaskOptions {
	leader: string;
	users: string[];
	quantity: number;
}

export interface WintertodtActivityTaskOptions extends MinigameActivityTaskOptions {
	quantity: number;
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

export interface BarbarianAssaultActivityTaskOptions extends MinigameActivityTaskOptions {
	leader: string;
	users: string[];
	totalLevel: number;
}

export interface AgilityArenaActivityTaskOptions extends MinigameActivityTaskOptions {}

export interface MonsterKillingTickerTaskData {
	subTasks: (MonsterActivityTaskOptions | GroupMonsterActivityTaskOptions)[];
}

export interface ClueTickerTaskData {
	subTasks: ClueActivityTaskOptions[];
}

export interface SkillingTickerTaskData {
	subTasks: ActivityTaskOptions[];
}

export interface SawmillActivityTaskOptions extends ActivityTaskOptions {
	plankID: number;
	plankQuantity: number;
}

export interface GnomeRestaurantActivityTaskOptions extends MinigameActivityTaskOptions {
	gloriesRemoved: number;
}

export interface SoulWarsOptions extends ActivityTaskOptions {
	leader: string;
	users: string[];
	quantity: number;
}

export interface RoguesDenMazeTaskOptions extends MinigameActivityTaskOptions {
	quantity: number;
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

export interface CollectingOptions extends ActivityTaskOptions {
	collectableID: number;
	quantity: number;
}

export interface BlastFurnaceActivityTaskOptions extends ActivityTaskOptions {
	barID: number;
	quantity: number;
}
