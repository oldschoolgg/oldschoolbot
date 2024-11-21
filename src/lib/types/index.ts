import type { SkillsEnum } from '../skilling/types';

export interface ItemBank {
	[key: string]: number;
}

export interface MakePartyOptions {
	maxSize: number;
	minSize: number;
	leader: MUser;
	message: string;
	ironmanAllowed: boolean;
	usersAllowed?: string[];
	customDenier?(user: MUser): Promise<[false] | [true, string]>;
}

export type Skills = Partial<{
	[key in SkillsEnum]: number;
}>;

export type SkillRequirements = Skills & { combat?: number };
export type SkillsRequired = Required<Skills>;

export type CategoryFlag =
	| 'minion'
	| 'settings'
	| 'patron'
	| 'skilling'
	| 'pvm'
	| 'minigame'
	| 'utility'
	| 'fun'
	| 'simulation';

export interface IDiscordSettings {
	Roles: Record<string, string>;
	Channels: Record<string, string>;
	Emojis: Record<string, string>;
	SupportServer: string;
}
