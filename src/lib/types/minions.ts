import { ItemBank } from 'oldschooljs/dist/meta/types';
import { TeamMember } from 'oldschooljs/dist/simulation/misc/ChambersOfXeric';

import { Kibble } from '../data/kibble';
import { IPatchData } from '../minions/farming/types';
import { Monkey } from '../monkeyRumble';
import { MinigameName } from '../settings/settings';
import { BossUser } from '../structures/Boss';
import { Peak } from '../tickers';
import { BirdhouseData } from './../skilling/skills/hunter/defaultBirdHouseTrap';
import { activity_type_enum } from '.prisma/client';

export interface ActivityTaskOptions {
	type: activity_type_enum;
	userID: string;
	duration: number;
	id: number;
	finishDate: number;
	channelID: string;
	cantBeDoubled?: boolean;
}

export interface KibbleOptions extends ActivityTaskOptions {
	quantity: number;
	kibbleType: Kibble['type'];
}
export interface TrickOrTreatOptions extends ActivityTaskOptions {
	rolls: number;
}

export interface ActivityTaskOptionsWithQuantity extends ActivityTaskOptions {
	quantity: number;
}

export interface RunecraftActivityTaskOptions extends ActivityTaskOptions {
	runeID: number;
	essenceQuantity: number;
	imbueCasts: number;
	obisEssenceQuantity?: number;
	useStaminas?: boolean;
	daeyaltEssence?: boolean;
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
	fakeDuration: number;
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
	fakeDurationMax: number;
	fakeDurationMin: number;
	oreID: number;
	quantity: number;
	powermine: boolean;
}

export interface SmeltingActivityTaskOptions extends ActivityTaskOptions {
	barID: number;
	quantity: number;
	blastf: boolean;
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
	fakeDurationMax: number;
	fakeDurationMin: number;
	powerchopping: boolean;
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
	usingStaminaPotion: boolean;
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
	fakeDuration: number;
	quantity: number;
}
export interface InfernoOptions extends ActivityTaskOptions {
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
	plantsName: string | null;
	quantity: number;
	upgradeType: string | null;
	payment?: boolean;
	patchType: IPatchData;
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

export interface HalloweenMinigameOptions extends ActivityTaskOptions {
	minigameID: number;
	nonce: number;
}

export interface MahoganyHomesActivityTaskOptions extends MinigameActivityTaskOptions {
	xp: number;
	quantity: number;
	points: number;
}

export interface BossActivityTaskOptions extends ActivityTaskOptions {
	users: string[];
	quantity: number;
}

export interface NightmareActivityTaskOptions extends ActivityTaskOptions {
	method: 'solo' | 'mass';
	quantity: number;
	isPhosani?: boolean;
}

interface StoredBossUser extends Omit<BossUser, 'user' | 'itemsToRemove'> {
	user: string;
	itemsToRemove: ItemBank;
}

export interface NewBossOptions extends ActivityTaskOptions {
	users: string[];
	quantity: number;
	bossUsers: StoredBossUser[];
	bossID: number;
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

export interface RaidsActivityTaskOptions extends ActivityTaskOptions {
	channelID: string;
	quantity: number;
	partyLeaderID: string;
	users: string[];
	team: TeamMember[];
	challengeMode: boolean;
}

export interface SawmillActivityTaskOptions extends ActivityTaskOptions {
	plankID: number;
	plankQuantity: number;
}

export interface ButlerActivityTaskOptions extends ActivityTaskOptions {
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
	quantity: number;
	monkeys: Monkey[];
}

export interface FishingContestOptions extends MinigameActivityTaskOptions {
	quantity: number;
	location: number;
}
export interface TearsOfGuthixActivityTaskOptions extends MinigameActivityTaskOptions {}

export interface KourendFavourActivityTaskOptions extends ActivityTaskOptions {
	favour: string;
	quantity: number;
}

export interface TokkulShopOptions extends ActivityTaskOptions {
	itemID: number;
	quantity: number;
}

export interface PuroPuroActivityTaskOptions extends MinigameActivityTaskOptions {
	quantity: number;
	implingID: number | null;
	darkLure: boolean;
}

export type ActivityTaskData =
	| ActivityTaskOptions
	| MonsterActivityTaskOptions
	| WoodcuttingActivityTaskOptions
	| CollectingOptions
	| RaidsActivityTaskOptions
	| MinigameActivityTaskOptions
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
	| AgilityActivityTaskOptions;
