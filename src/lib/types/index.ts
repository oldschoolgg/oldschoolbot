import type { SkillNameType } from '@/lib/skilling/types.js';

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
	[key in SkillNameType]: number;
}>;

export type SkillRequirements = Skills & { combat?: number };
export type SkillsRequired = Required<Skills>;
