import { Activity } from '../constants';
import Monster from 'oldschooljs/dist/structures/Monster';

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
	duration: number;
	quantity: number;
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
	collectionLogBank?: Bank;
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

export interface KillWorkerOptions {
	bossName: string;
	quantity: number;
	limit: number;
}

export interface KillableMonster extends Monster {
	table: Monster;
	timeToFinish: number;
	emoji: string;
	wildy: boolean;
	canBeKilled: boolean;
}
