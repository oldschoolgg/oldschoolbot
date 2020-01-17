import { Activity } from '../constants';

export interface Bank {
	[key: number]: number;
}

export interface ActivityTaskOptions {
	type: Activity;
	userID: string;
}

export interface MonsterActivityTaskOptions extends ActivityTaskOptions {
	monsterID: number;
	channelID: string;
	quantity: number;
	duration: number;
}

export interface ClueActivityTaskOptions extends ActivityTaskOptions {
	clueID: number;
	channelID: string;
	quantity: number;
	duration: number;
}

export interface SettingsEntry {
	id: string;
	RSN?: string;
	GP?: number;
	autoupdate?: boolean;
	badges?: string[];
	bank?: Bank;
	clueScores?: Bank;
	monsterScores?: Bank;
	collectionLog?: number[];
	pets?: number[];
	lastDailyTimestamp?: number;
	totalCommandsUsed?: number;
	minion?: {
		name?: string;
		hasBought: boolean;
	};
}

export interface Pet {
	id: number;
	emoji: string;
	chance: number;
	name: string;
	type: string;
	altNames: string[];
	bossKeys?: string[];
	finish?(): number;
	formatFinish(num: number): string;
}
