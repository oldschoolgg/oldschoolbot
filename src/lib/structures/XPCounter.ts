import { skillEmoji } from '@/lib/data/emojis.js';
import type { SkillNameType } from '@/lib/skilling/types.js';
import { XPBank } from '@/lib/structures/XPBank.js';

export class XPCounter {
	private xpList: Map<SkillNameType, number> = new Map();

	public add(skill: SkillNameType | XPBank, amount?: number): this {
		if (skill instanceof XPBank) {
			for (const { skillName, amount } of skill.xpList) {
				this.add(skillName, amount);
			}
			return this;
		}
		if (amount === undefined) throw new Error('Amount must be provided when adding single skill XP.');
		this.xpList.set(skill, (this.xpList.get(skill) ?? 0) + amount);
		return this;
	}

	public get length() {
		return this.xpList.size;
	}

	public totalXP(): number {
		return Array.from(this.xpList.values()).reduce((acc, curr) => acc + curr, 0);
	}

	public amount(skill: SkillNameType): number {
		return this.xpList.get(skill) ?? 0;
	}

	toString(): string {
		return Array.from(this.xpList.entries())
			.map(([skill, xp]) => `${xp.toLocaleString()} ${skillEmoji[skill as keyof typeof skillEmoji]} XP`)
			.join(', ');
	}

	public entries() {
		return this.xpList.entries();
	}
}
