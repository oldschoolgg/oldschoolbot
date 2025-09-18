import { sumArr } from 'e';

import { skillEmoji } from '../data/emojis.js';
import type { AddXpParams } from '../minions/types.js';
import type { SkillNameType, SkillsEnum } from '../skilling/types.js';
import type { Skills } from '../types.js';

export class XPBank {
	public xpList: AddXpParams[] = [];

	public add(
		skill: SkillNameType | XPBank,
		amount?: number,
		options: Partial<{ debugId: string } & Omit<AddXpParams, 'skillName' | 'amount'>> = {}
	) {
		if (skill instanceof XPBank) {
			this.xpList.push(...skill.xpList);
			return this;
		}
		if (!amount) {
			console.trace(`${options.debugId} Tried to add ${amount} XP to ${skill}`);
		}
		if (typeof amount !== 'number') {
			throw new Error(`${options.debugId} You must provide an amount of XP to add for ${skill}`);
		}
		if (amount < 0) {
			throw new Error(`${options.debugId} Provided a negative amount of XP to add for ${skill}`);
		}
		this.xpList.push({ skillName: skill as SkillsEnum, amount, ...options });
		return this;
	}

	public get length() {
		return this.xpList.length;
	}

	public totalXP() {
		return this.xpList.reduce((acc, curr) => acc + curr.amount, 0);
	}

	public amount(skill: SkillNameType) {
		return sumArr(this.xpList.filter(i => i.skillName === skill).map(i => i.amount));
	}

	toString() {
		if (this.xpList.length === 0) return 'No XP';
		const grouped: Skills = {};
		for (const i of this.xpList) grouped[i.skillName] = (grouped[i.skillName] ?? 0) + i.amount;
		return Object.entries(grouped)
			.map(([skill, xp]) => `${xp.toLocaleString()} ${skillEmoji[skill as keyof typeof skillEmoji]} XP`)
			.join(', ');
	}
}
