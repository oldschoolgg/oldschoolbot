export enum MinionActivity {
	PVM = 'PVM',
	SKILLING = 'SKILLING',
	CLUES = 'CLUES'
}

export interface Minion {
	id: number;
	name: string;
	activity: MinionActivity | null;
	lastPaid: number;
}

export const enum UserSettings {
	Minions = 'minions',
	GP = 'GP'
}

export interface Bank {
	[key: number]: number;
}
