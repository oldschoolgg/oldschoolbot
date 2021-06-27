import { notEmpty, objectKeys } from 'e';
import { EquipmentSlot, Item } from 'oldschooljs/dist/meta/types';

import { getSimilarItems, inverseSimilarItems } from '../data/similarItems';
import { constructGearSetup, GearSetup, GearSlotItem, GearStats, PartialGearSetup } from '../gear';
import { GearRequirement } from '../minions/types';
import getOSItem from '../util/getOSItem';
import resolveItems from '../util/resolveItems';

const baseStats: GearStats = {
	attack_stab: 0,
	attack_slash: 0,
	attack_crush: 0,
	attack_magic: 0,
	attack_ranged: 0,
	defence_stab: 0,
	defence_slash: 0,
	defence_crush: 0,
	defence_magic: 0,
	defence_ranged: 0,
	melee_strength: 0,
	ranged_strength: 0,
	magic_damage: 0,
	prayer: 0
};

export class Gear {
	[EquipmentSlot.TwoHanded]: GearSlotItem | null = null;
	[EquipmentSlot.Ammo]: GearSlotItem | null = null;
	[EquipmentSlot.Body]: GearSlotItem | null = null;
	[EquipmentSlot.Cape]: GearSlotItem | null = null;
	[EquipmentSlot.Feet]: GearSlotItem | null = null;
	[EquipmentSlot.Hands]: GearSlotItem | null = null;
	[EquipmentSlot.Head]: GearSlotItem | null = null;
	[EquipmentSlot.Legs]: GearSlotItem | null = null;
	[EquipmentSlot.Neck]: GearSlotItem | null = null;
	[EquipmentSlot.Ring]: GearSlotItem | null = null;
	[EquipmentSlot.Shield]: GearSlotItem | null = null;
	[EquipmentSlot.Weapon]: GearSlotItem | null = null;
	stats = baseStats;

	constructor(_setup: GearSetup | PartialGearSetup = {}) {
		const setup =
			typeof _setup?.ammo === 'undefined' || typeof _setup?.ammo === 'string'
				? constructGearSetup(_setup as PartialGearSetup)
				: (_setup as GearSetup);

		this['2h'] = setup['2h'];
		this.ammo = setup.ammo;
		this.body = setup.body;
		this.cape = setup.cape;
		this.feet = setup.feet;
		this.hands = setup.hands;
		this.head = setup.head;
		this.legs = setup.legs;
		this.neck = setup.neck;
		this.ring = setup.ring;
		this.shield = setup.shield;
		this.weapon = setup.weapon;

		this.stats = this.getStats();
	}

	raw(): GearSetup {
		return {
			ammo: this.ammo,
			body: this.body,
			cape: this.cape,
			feet: this.feet,
			hands: this.hands,
			head: this.head,
			legs: this.legs,
			neck: this.neck,
			ring: this.ring,
			shield: this.shield,
			weapon: this.weapon,
			'2h': this['2h']
		};
	}

	allItems(similar = false): number[] {
		const gear = this.raw();
		const values = Object.values(gear)
			.filter(notEmpty)
			.map(i => i.item);

		if (similar) {
			for (const item of [...values]) {
				const inverse = inverseSimilarItems.get(item);
				if (inverse) {
					values.push(...inverse.values());
				}
				const similarItems = getSimilarItems(item);
				if (similarItems) {
					values.push(...similarItems);
				}
			}
		}

		return values;
	}

	hasEquipped(_items: string | (string | number)[], every = false, includeSimilar = true) {
		const items = resolveItems(_items);
		const allItems = this.allItems();
		if (!includeSimilar) {
			return items[every ? 'every' : 'some'](i => allItems.includes(i));
		} else if (every) {
			// similar = true, every = true
			const targetCount = items.length;
			let currentCount = 0;
			for (const i of [...items]) {
				const similarItems = getSimilarItems(i);
				if (similarItems.length) {
					if (similarItems.some(si => allItems.includes(si))) currentCount++;
				} else if (allItems.includes(i)) currentCount++;
			}
			return currentCount === targetCount;
		}
		// similar = true, every = false
		for (const i of [...items]) {
			const similarItems = getSimilarItems(i) ?? [i];
			if (similarItems.some(si => allItems.includes(si))) return true;
			else if (allItems.includes(i)) return true;
		}
		return false;
	}

	equippedWeapon(): Item | null {
		const normalWeapon = this.weapon;
		const twoHandedWeapon = this['2h'];
		if (!normalWeapon && !twoHandedWeapon) return null;
		return getOSItem(normalWeapon === null ? twoHandedWeapon!.item : normalWeapon.item);
	}

	getStats() {
		const sum = { ...baseStats };
		for (const id of this.allItems(false)) {
			const item = getOSItem(id);
			for (const keyToAdd of objectKeys(sum)) {
				sum[keyToAdd] += item.equipment![keyToAdd];
			}
		}
		return sum;
	}

	getHighestMeleeStat() {
		return this.stats.attack_stab >= this.stats.attack_slash && this.stats.attack_stab >= this.stats.attack_crush
			? 'AttackStab'
			: this.stats.attack_slash >= this.stats.attack_crush
			? 'AttackSlash'
			: 'AttackCrush';
	}

	meetsStatRequirements(gearRequirements: GearRequirement): [false, keyof GearStats, number] | [true, null, null] {
		const keys = objectKeys(this.stats as Record<keyof GearStats, number>);
		for (const key of keys) {
			const required = gearRequirements?.[key];
			if (!required) continue;
			const has = this.stats[key];
			if (has < required) {
				return [false, key, has];
			}
		}
		return [true, null, null];
	}

	toString() {
		const allItems = this.allItems(false);
		if (allItems.length === 0) {
			return 'No items';
		}
		let items = [];
		for (const item of allItems) {
			items.push(getOSItem(item).name);
		}
		return items.join(', ');
	}
}
