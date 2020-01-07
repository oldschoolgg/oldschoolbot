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
