import { Activity, Tasks } from '../constants';

export interface ActivityTaskOptions {
	type: Activity;
	userID: string;
	duration: number;
	id: number;
	finishDate: number;
}

export interface MonsterActivityTaskOptions extends ActivityTaskOptions {
	monsterID: number;
	channelID: string;
	quantity: number;
}

export interface ClueActivityTaskOptions extends ActivityTaskOptions {
	clueID: number;
	channelID: string;
	quantity: number;
}

export interface MiningActivityTaskOptions extends ActivityTaskOptions {
	oreID: number;
	channelID: string;
	quantity: number;
}

export interface SmithingActivityTaskOptions extends ActivityTaskOptions {
	barID: number;
	channelID: string;
	quantity: number;
}

export interface MonsterKillingTickerTaskData {
	subTasks: MonsterActivityTaskOptions[];
}

export interface ClueTickerTaskData {
	subTasks: ClueActivityTaskOptions[];
}

export interface SkillingTickerTaskData {
	subTasks: ActivityTaskOptions[];
}

export type TickerTaskData =
	| MonsterKillingTickerTaskData
	| ClueTickerTaskData
	| SkillingTickerTaskData;

export type MinionActivityTask =
	| Tasks.MonsterActivity
	| Tasks.ClueActivity
	| Tasks.MiningActivity
	| Tasks.SmithingActivity;
