import { Bank } from 'oldschooljs';

export class TeamLoot {
	map = new Map<string, Bank>();

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

	entries() {
		return Array.from(this.map.entries());
	}
}
