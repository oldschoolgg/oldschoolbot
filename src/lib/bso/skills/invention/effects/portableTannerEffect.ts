import { InventionID, inventionItemBoostRaw } from '@/lib/bso/skills/invention/inventions.js';

import { Bank, Items } from 'oldschooljs';

import type { BitField } from '@/lib/constants.js';
import type { GearBank } from '@/lib/structures/GearBank.js';
import type { UpdateBank } from '@/lib/structures/UpdateBank.js';

const hideLeatherMap = [
	[Items.getOrThrow('Green dragonhide'), Items.getOrThrow('Green dragon leather')],
	[Items.getOrThrow('Blue dragonhide'), Items.getOrThrow('Blue dragon leather')],
	[Items.getOrThrow('Red dragonhide'), Items.getOrThrow('Red dragon leather')],
	[Items.getOrThrow('Black dragonhide'), Items.getOrThrow('Black dragon leather')],
	[Items.getOrThrow('Royal dragonhide'), Items.getOrThrow('Royal dragon leather')]
] as const;

export function portableTannerEffect({
	gearBank,
	duration,
	messages,
	disabledInventions,
	updateBank
}: {
	disabledInventions: number[];
	gearBank: GearBank;
	updateBank: UpdateBank;
	duration: number;
	messages: string[];
	bitfield: BitField[] | readonly BitField[];
}) {
	if (!gearBank.bank.has('Portable tanner')) return;
	const boostRes = inventionItemBoostRaw({
		gearBank,
		inventionID: InventionID.PortableTanner,
		duration,
		disabledInventions
	});

	if (!boostRes.success || !boostRes.materialCost) return;

	const toAdd = new Bank();
	for (const [hide, leather] of hideLeatherMap) {
		const qty = updateBank.itemLootBank.amount(hide.id);
		if (qty > 0) {
			updateBank.itemLootBank.remove(hide.id, qty);
			toAdd.add(leather.id, qty);
		}
	}

	if (toAdd.length === 0) return;

	updateBank.userStatsBankUpdates.portable_tanner_bank = toAdd;
	updateBank.clientStatsBankUpdates.portable_tanner_loot = toAdd;
	updateBank.itemLootBank.add(toAdd);
	updateBank.materialsCostBank.add(boostRes.materialCost);
	messages.push(`Portable Tanner turned the hides into leathers (${boostRes.messages})`);
}
