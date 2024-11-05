import type { GearPreset } from '@prisma/client';
import { notEmpty, objectKeys, uniqueArr } from 'e';
import { Bank } from 'oldschooljs';

import { EquipmentSlot, type Item } from 'oldschooljs/dist/meta/types';

import { resolveItems } from 'oldschooljs/dist/util/util';
import { getSimilarItems, inverseSimilarItems } from '../data/similarItems';
import type {
	DefenceGearStat,
	GearSetup,
	GearSetupType,
	GearSlotItem,
	GearStats,
	OffenceGearStat,
	OtherGearStat
} from '../gear/types';
import { GearStat } from '../gear/types';
import type { GearRequirement } from '../minions/types';
import { assert } from '../util';
import getOSItem from '../util/getOSItem';
import itemID from '../util/itemID';

export type PartialGearSetup = Partial<{
	[key in EquipmentSlot]: string;
}>;

export function hasGracefulEquipped(setup: Gear) {
	return setup.hasEquipped(
		['Graceful hood', 'Graceful top', 'Graceful legs', 'Graceful boots', 'Graceful gloves', 'Graceful cape'],
		true
	);
}

// https://oldschool.runescape.wiki/w/Armour/Highest_bonuses
export const maxDefenceStats: { [key in DefenceGearStat]: number } = {
	[GearStat.DefenceCrush]: 505,
	[GearStat.DefenceMagic]: 238,
	[GearStat.DefenceRanged]: 542,
	[GearStat.DefenceSlash]: 521,
	[GearStat.DefenceStab]: 519
};

export const maxOffenceStats: { [key in OffenceGearStat]: number } = {
	[GearStat.AttackCrush]: 214,
	[GearStat.AttackMagic]: 177,
	[GearStat.AttackRanged]: 246,
	[GearStat.AttackSlash]: 182,
	[GearStat.AttackStab]: 177
};

export const maxOtherStats: { [key in OtherGearStat]: number } = {
	[GearStat.MeleeStrength]: 204,
	[GearStat.RangedStrength]: 172,
	[GearStat.MagicDamage]: 38,
	[GearStat.Prayer]: 66
};

export const defaultGear: GearSetup = {
	[EquipmentSlot.TwoHanded]: null,
	[EquipmentSlot.Ammo]: null,
	[EquipmentSlot.Body]: null,
	[EquipmentSlot.Cape]: null,
	[EquipmentSlot.Feet]: null,
	[EquipmentSlot.Hands]: null,
	[EquipmentSlot.Head]: null,
	[EquipmentSlot.Legs]: null,
	[EquipmentSlot.Neck]: null,
	[EquipmentSlot.Ring]: null,
	[EquipmentSlot.Shield]: null,
	[EquipmentSlot.Weapon]: null
};
Object.freeze(defaultGear);

export const globalPresets: (GearPreset & { defaultSetup: GearSetupType })[] = [
	{
		name: 'graceful',
		user_id: '123',
		head: itemID('Graceful hood'),
		neck: null,
		body: itemID('Graceful top'),
		legs: itemID('Graceful legs'),
		cape: itemID('Graceful cape'),
		two_handed: null,
		hands: itemID('Graceful gloves'),
		feet: itemID('Graceful boots'),
		shield: null,
		weapon: null,
		ring: null,
		ammo: null,
		ammo_qty: null,
		emoji_id: null,
		times_equipped: 0,
		defaultSetup: 'skilling',
		pinned_setup: null
	},
	{
		name: 'construction',
		user_id: '123',
		head: itemID("Carpenter's helmet"),
		neck: null,
		body: itemID("Carpenter's shirt"),
		legs: itemID("Carpenter's trousers"),
		cape: null,
		two_handed: null,
		hands: null,
		feet: itemID("Carpenter's boots"),
		shield: null,
		weapon: null,
		ring: null,
		ammo: null,
		ammo_qty: null,
		emoji_id: null,
		times_equipped: 0,
		defaultSetup: 'skilling',
		pinned_setup: null
	},
	{
		name: 'thieving',
		user_id: '123',
		head: itemID('Rogue mask'),
		neck: null,
		body: itemID('Rogue top'),
		legs: itemID('Rogue trousers'),
		cape: null,
		two_handed: null,
		hands: itemID('Rogue gloves'),
		feet: itemID('Rogue boots'),
		shield: null,
		weapon: null,
		ring: null,
		ammo: null,
		ammo_qty: null,
		emoji_id: null,
		times_equipped: 0,
		defaultSetup: 'skilling',
		pinned_setup: null
	},
	{
		name: 'clue_hunter',
		user_id: '123',
		head: itemID('Helm of raedwald'),
		neck: null,
		body: itemID('Clue hunter garb'),
		legs: itemID('Clue hunter trousers'),
		cape: itemID('Clue hunter cloak'),
		two_handed: null,
		hands: itemID('Clue hunter gloves'),
		feet: itemID('Clue hunter boots'),
		shield: null,
		weapon: null,
		ring: null,
		ammo: null,
		ammo_qty: null,
		emoji_id: null,
		times_equipped: 0,
		defaultSetup: 'skilling',
		pinned_setup: null
	},
	{
		name: 'fishing',
		user_id: '123',
		head: itemID('Angler hat'),
		neck: null,
		body: itemID('Angler top'),
		legs: itemID('Angler waders'),
		cape: null,
		two_handed: null,
		hands: null,
		feet: itemID('Angler boots'),
		shield: null,
		weapon: null,
		ring: null,
		ammo: null,
		ammo_qty: null,
		emoji_id: null,
		times_equipped: 0,
		defaultSetup: 'skilling',
		pinned_setup: null
	},
	{
		name: 'firemaking',
		user_id: '123',
		head: itemID('Pyromancer hood'),
		neck: null,
		body: itemID('Pyromancer garb'),
		legs: itemID('Pyromancer robe'),
		cape: null,
		two_handed: null,
		hands: null,
		feet: itemID('Pyromancer boots'),
		shield: null,
		weapon: null,
		ring: null,
		ammo: null,
		ammo_qty: null,
		emoji_id: null,
		times_equipped: 0,
		defaultSetup: 'skilling',
		pinned_setup: null
	},
	{
		name: 'mining',
		user_id: '123',
		head: itemID('Prospector helmet'),
		neck: null,
		body: itemID('Prospector jacket'),
		legs: itemID('Prospector legs'),
		cape: null,
		two_handed: null,
		hands: null,
		feet: itemID('Prospector boots'),
		shield: null,
		weapon: null,
		ring: null,
		ammo: null,
		ammo_qty: null,
		emoji_id: null,
		times_equipped: 0,
		defaultSetup: 'skilling',
		pinned_setup: null
	},
	{
		name: 'woodcutting',
		user_id: '123',
		head: itemID('Lumberjack hat'),
		neck: null,
		body: itemID('Lumberjack top'),
		legs: itemID('Lumberjack legs'),
		cape: null,
		two_handed: null,
		hands: null,
		feet: itemID('Lumberjack boots'),
		shield: null,
		weapon: null,
		ring: null,
		ammo: null,
		ammo_qty: null,
		emoji_id: null,
		times_equipped: 0,
		defaultSetup: 'skilling',
		pinned_setup: null
	},
	{
		name: 'farming',
		user_id: '123',
		head: itemID("Farmer's strawhat"),
		neck: null,
		body: itemID("Farmer's jacket"),
		legs: itemID("Farmer's boro trousers"),
		cape: null,
		two_handed: null,
		hands: null,
		feet: itemID("Farmer's boots"),
		shield: null,
		weapon: null,
		ring: null,
		ammo: null,
		ammo_qty: null,
		emoji_id: null,
		times_equipped: 0,
		defaultSetup: 'skilling',
		pinned_setup: null
	},
	{
		name: 'runecraft',
		user_id: '123',
		head: itemID('Hat of the eye'),
		neck: null,
		body: itemID('Robe top of the eye'),
		legs: itemID('Robe bottoms of the eye'),
		cape: null,
		two_handed: null,
		hands: null,
		feet: itemID('Boots of the eye'),
		shield: null,
		weapon: null,
		ring: null,
		ammo: null,
		ammo_qty: null,
		emoji_id: null,
		times_equipped: 0,
		defaultSetup: 'skilling',
		pinned_setup: null
	},
	{
		name: 'smithing',
		user_id: '123',
		head: null,
		neck: null,
		body: itemID('Smiths tunic'),
		legs: itemID('Smiths trousers'),
		cape: null,
		two_handed: null,
		hands: itemID('Smiths gloves'),
		feet: itemID('Smiths boots'),
		shield: null,
		weapon: null,
		ring: null,
		ammo: null,
		ammo_qty: null,
		emoji_id: null,
		times_equipped: 0,
		defaultSetup: 'skilling',
		pinned_setup: null
	}
];

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

	constructor(_setup: GearSetup | PartialGearSetup | GearPreset = {}) {
		if ('user_id' in _setup) {
			const gear: GearSetup = {} as GearSetup;
			for (const key of [
				'cape',
				'feet',
				'hands',
				'head',
				'legs',
				'neck',
				'ring',
				'shield',
				'weapon',
				'body'
			] as const) {
				const val = _setup[key];
				gear[key] = val !== null ? { item: val, quantity: 1 } : null;
			}

			gear.ammo = _setup.ammo ? { item: _setup.ammo, quantity: _setup.ammo_qty ?? 1 } : null;
			gear['2h'] = _setup.two_handed ? { item: _setup.two_handed, quantity: 1 } : null;
			return new Gear(gear);
		}
		const setup =
			(typeof _setup.ammo === 'undefined' || typeof _setup.ammo === 'string') && !('user_id' in _setup)
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
				values.push(...getSimilarItems(item));
			}
		}

		return uniqueArr(values);
	}

	allItemsBank() {
		const gear = this.raw();
		const values = Object.values(gear).filter(notEmpty);

		const bank = new Bank();

		for (const item of values) {
			bank.add(item.item, item.quantity);
		}
		return bank;
	}

	hasEquipped(_items: number | string | (string | number)[], every = false, includeSimilar = true) {
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
				if (similarItems.some(si => allItems.includes(si))) {
					currentCount++;
				} else if (allItems.includes(i)) currentCount++;
			}
			return currentCount === targetCount;
		}
		// similar = true, every = false
		for (const i of [...items]) {
			const similarItems = getSimilarItems(i);
			if (similarItems.some(si => allItems.includes(si))) return true;
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
				sum[keyToAdd] += item.equipment ? item.equipment[keyToAdd] : 0;
			}
		}
		return sum;
	}

	meetsStatRequirements(gearRequirements: GearRequirement): [false, keyof GearStats, number] | [true, null, null] {
		const keys = objectKeys(this.stats as Record<keyof GearStats, number>);
		for (const key of keys) {
			const required = gearRequirements?.[key];
			if (!required) continue;
			const has = this.stats[key];
			if (required < 0) continue;
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
		const items = [];
		for (const item of allItems) {
			items.push(getOSItem(item).name);
		}
		return items.join(', ');
	}

	clone() {
		return new Gear({ ...this.raw() });
	}

	equip(_itemToEquip: Item | string, quantity = 1): { refundBank: Bank | null } {
		const itemToEquip: Item = typeof _itemToEquip === 'string' ? getOSItem(_itemToEquip) : _itemToEquip;
		assert(quantity >= 1, 'Cannot equip less than 1 item.');
		if (!itemToEquip.equipment) throw new Error(`${itemToEquip.name} is not equippable.`);
		const refundBank = new Bank();

		const { slot } = itemToEquip.equipment;

		const unequipAndEquip = () => {
			const equippedAlready = this[slot];
			if (equippedAlready) {
				refundBank.add(equippedAlready.item, equippedAlready.quantity);
				this[slot] = null;
			}
			this[slot] = { item: itemToEquip.id, quantity };
		};

		switch (slot) {
			case EquipmentSlot.TwoHanded: {
				// If trying to equip a 2h weapon, remove the weapon and shield.
				if (this.weapon) {
					refundBank.add(this.weapon.item, this.weapon.quantity);
					this.weapon = null;
				}
				if (this.shield) {
					refundBank.add(this.shield.item, this.shield.quantity);
					this.shield = null;
				}
				if (this['2h']) {
					refundBank.add(this['2h'].item, this['2h'].quantity);
					this['2h'] = null;
				}
				this['2h'] = { item: itemToEquip.id, quantity };
				break;
			}
			case EquipmentSlot.Weapon:
			case EquipmentSlot.Shield: {
				const twoHanded = this['2h'];
				if (twoHanded) {
					refundBank.add(twoHanded.item, twoHanded.quantity);
					this['2h'] = null;
				}

				unequipAndEquip();
				break;
			}
			default: {
				unequipAndEquip();
			}
		}

		return { refundBank: refundBank.length === 0 ? null : refundBank };
	}
}

export function constructGearSetup(setup: PartialGearSetup): Gear {
	return new Gear({
		'2h': setup['2h'] ? { item: itemID(setup['2h']), quantity: 1 } : null,
		ammo: setup.ammo ? { item: itemID(setup.ammo), quantity: 1 } : null,
		body: setup.body ? { item: itemID(setup.body), quantity: 1 } : null,
		cape: setup.cape ? { item: itemID(setup.cape), quantity: 1 } : null,
		feet: setup.feet ? { item: itemID(setup.feet), quantity: 1 } : null,
		hands: setup.hands ? { item: itemID(setup.hands), quantity: 1 } : null,
		head: setup.head ? { item: itemID(setup.head), quantity: 1 } : null,
		legs: setup.legs ? { item: itemID(setup.legs), quantity: 1 } : null,
		neck: setup.neck ? { item: itemID(setup.neck), quantity: 1 } : null,
		ring: setup.ring ? { item: itemID(setup.ring), quantity: 1 } : null,
		shield: setup.shield ? { item: itemID(setup.shield), quantity: 1 } : null,
		weapon: setup.weapon ? { item: itemID(setup.weapon), quantity: 1 } : null
	});
}
