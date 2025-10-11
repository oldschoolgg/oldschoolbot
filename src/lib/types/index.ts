import type { BaseMessageOptions } from 'discord.js';

import type { SkillNameType } from '@/lib/skilling/types.js';

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
	[key in SkillNameType]: number;
}>;

export type SkillRequirements = Skills & { combat?: number };
export type SkillsRequired = Required<Skills>;
