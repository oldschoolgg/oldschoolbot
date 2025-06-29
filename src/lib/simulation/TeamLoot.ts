import { Emoji } from '@oldschoolgg/toolkit/constants';
import { spoiler, userMention } from 'discord.js';
import { Bank } from 'oldschooljs';

export class TeamLoot {
	map = new Map<string, Bank>();
	purpleItems: number[];

	constructor(purpleItems?: number[]) {
		this.purpleItems = purpleItems ?? [];
	}

	totalLoot() {
		const totalLoot = new Bank();
		for (const bank of this.map.values()) {
			totalLoot.add(bank);
		}
		return totalLoot;
	}

	get(id: string): Bank {
		const entry = this.map.get(id);
		if (!entry) {
			this.map.set(id, new Bank());
			return this.get(id);
		}
		return entry;
	}

	add(id: string, ...args: Parameters<Bank['add']>) {
		const bank = this.get(id);
		bank.add(...args);
		return bank;
	}

	remove(id: string, ...args: Parameters<Bank['remove']>) {
		const bank = this.get(id);
		bank.remove(...args);
		return bank;
	}

	entries() {
		return Array.from(this.map.entries());
	}

	formatLoot(kc?: { id: string; quantity: number }[]): string {
		let str = '';
		for (const [id, loot] of this.entries()) {
			const kcString = kc ? ` (${kc.find(u => u.id === id)?.quantity ?? 0} KC)` : '';
			const isPurple = this.purpleItems.some(i => loot.has(i));
			str += isPurple
				? `${Emoji.Purple} ${userMention(id)}${kcString} received ${spoiler(loot.toString())}`
				: `${userMention(id)}${kcString} received ${loot}.`;
			str += '\n';
		}
		return str;
	}
}
