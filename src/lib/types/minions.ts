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

export interface MonsterKillingTickerTaskData {
	subTasks: MonsterActivityTaskOptions[];
}

export interface ClueTickerTaskData {
	subTasks: ClueActivityTaskOptions[];
}

export interface MiningTickerTaskData {
	subTasks: MiningActivityTaskOptions[];
}

export type TickerTaskData =
	| MonsterKillingTickerTaskData
	| ClueTickerTaskData
	| MiningTickerTaskData;

export type MinionActivityTask = Tasks.MonsterActivity | Tasks.ClueActivity | Tasks.MiningActivity;
export type MinionActivityTaskData =
	| MonsterActivityTaskOptions
	| ClueActivityTaskOptions
	| MiningActivityTaskOptions;
