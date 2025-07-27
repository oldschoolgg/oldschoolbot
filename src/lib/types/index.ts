import type { BaseMessageOptions } from 'discord.js';

import type { SkillsEnum } from '../skilling/types';

export interface ItemBank {
	[key: string]: number;
}

type ResolvableItem = number | string;
export type ArrayItemsResolvable = (ResolvableItem | ResolvableItem[])[];
export type ArrayItemsResolved = (number | number[])[];

export interface MakePartyOptions {
	maxSize: number;
	minSize: number;
	leader: MUser;
	message: string;
	ironmanAllowed: boolean;
	usersAllowed?: string[];
	customDenier?(user: MUser): Promise<[false] | [true, string]>;
	massTimeout?: number;
	allowedMentions?: BaseMessageOptions['allowedMentions'];
}

export type Skills = Partial<{
	[key in SkillsEnum]: number;
}>;

export type SkillRequirements = Skills & { combat?: number };
export type SkillsRequired = Required<Skills>;
