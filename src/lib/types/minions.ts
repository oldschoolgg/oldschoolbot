import { Activity, Tasks } from '../constants';
import { MinigameIDsEnum } from '../minions/data/minigames';

export interface ActivityJobOptions {
	type: Activity;
	userID: string;
	duration: number;
	id: string;
	finishDate: number;
	channelID: string;
}

export interface AgilityActivityJobOptions extends ActivityJobOptions {
	courseID: string;
	quantity: number;
}

export interface CookingActivityJobOptions extends ActivityJobOptions {
	cookableID: number;
	quantity: number;
}

export interface MonsterActivityJobOptions extends ActivityJobOptions {
	monsterID: number;
	quantity: number;
}

export interface ClueActivityJobOptions extends ActivityJobOptions {
	clueID: number;
	quantity: number;
}

export interface FishingActivityJobOptions extends ActivityJobOptions {
	fishID: number;
	quantity: number;
}

export interface MiningActivityJobOptions extends ActivityJobOptions {
	oreID: number;
	quantity: number;
}

export interface SmeltingActivityJobOptions extends ActivityJobOptions {
	barID: number;
	quantity: number;
}

export interface SmithingActivityJobOptions extends ActivityJobOptions {
	smithedBarID: number;
	quantity: number;
}

export interface FiremakingActivityJobOptions extends ActivityJobOptions {
	burnableID: number;
	quantity: number;
}

export interface WoodcuttingActivityJobOptions extends ActivityJobOptions {
	logID: number;
	quantity: number;
}

export interface CraftingActivityJobOptions extends ActivityJobOptions {
	craftableID: number;
	quantity: number;
}

export interface FletchingActivityJobOptions extends ActivityJobOptions {
	fletchableName: string;
	quantity: number;
}

export interface BuryingActivityJobOptions extends ActivityJobOptions {
	boneID: number;
	quantity: number;
}

export interface OfferingActivityJobOptions extends ActivityJobOptions {
	boneID: number;
	quantity: number;
}

export interface AlchingActivityJobOptions extends ActivityJobOptions {
	itemID: number;
	quantity: number;
	alchValue: number;
}

export interface QuestingActivityJobOptions extends ActivityJobOptions {}

export interface MinigameActivityJobOptions extends ActivityJobOptions {
	minigameID: MinigameIDsEnum;
	quantity: number;
}

export interface FightCavesActivityJobOptions extends MinigameActivityJobOptions {
	jadDeathChance: number;
	preJadDeathChance: number;
	preJadDeathTime: number | null;
}

export interface NightmareActivityJobOptions extends MinigameActivityJobOptions {
	leader: string;
	users: string[];
}

export interface WintertodtActivityJobOptions extends MinigameActivityJobOptions {
	quantity: number;
}

export interface SepulchreActivityJobOptions extends MinigameActivityJobOptions {
	floors: number[];
}

export type MinionActivityTask =
	| Tasks.CraftingActivity
	| Tasks.AgilityActivity
	| Tasks.CookingActivity
	| Tasks.MonsterActivity
	| Tasks.GroupMonsterActivity
	| Tasks.ClueActivity
	| Tasks.FishingActivity
	| Tasks.MiningActivity
	| Tasks.SmeltingActivity
	| Tasks.SmithingActivity
	| Tasks.WoodcuttingActivity
	| Tasks.RunecraftActivity
	| Tasks.FiremakingActivity
	| Tasks.QuestingActivity
	| Tasks.BuryingActivity
	| Tasks.OfferingActivity
	| Tasks.FightCavesActivity
	| Tasks.FletchingActivity
	| Tasks.WintertodtActivity
	| Tasks.AlchingActivity
	| Tasks.NightmareActivity
	| Tasks.SepulchreActivity;
