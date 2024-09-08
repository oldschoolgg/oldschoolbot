import { sumArr } from 'e';
import type { AddXpParams } from '../minions/types';
import type { SkillNameType, SkillsEnum } from '../skilling/types';

export class XPBank {
	public xpList: AddXpParams[] = [];

	public add(
		skill: SkillNameType | XPBank,
		amount?: number,
		options: Partial<Omit<AddXpParams, 'skillName' | 'amount'>> = {}
	) {
		if (skill instanceof XPBank) {
			this.xpList.push(...skill.xpList);
			return this;
		}
		if (!amount) {
			throw new Error('You must provide an amount of XP to add');
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
}
