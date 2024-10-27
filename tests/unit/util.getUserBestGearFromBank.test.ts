import { Bank, convertLVLtoXP } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { type GearSetup, GearStat } from '../../src/lib/gear/types';
import getUserBestGearFromBank from '../../src/lib/minions/functions/getUserBestGearFromBank';
import { Gear } from '../../src/lib/structures/Gear';
import type { Skills } from '../../src/lib/types';
import itemID from '../../src/lib/util/itemID';

const userBank = new Bank({
	'Bandos chestplate': 4,
	'Bandos tassets': 1,
	'Helm of neitiznot': 2,
	'Justiciar faceguard': 1,
	'Dragon scimitar': 1,
	'3rd age amulet': 1,
	'Occult necklace': 1,
	'Ancestral robe top': 1,
	'Ancestral robe bottom': 1,
	'Dragonfire shield': 1,
	'Amulet of glory': 1
});
const nullGear: GearSetup = {
	'2h': null,
	ammo: null,
	body: null,
	cape: null,
	feet: null,
	hands: null,
	head: null,
	legs: null,
	neck: null,
	ring: null,
	shield: null,
	weapon: null
};
const userGear = new Gear({
	...nullGear,
	'2h': { item: itemID('Elder maul'), quantity: 1 },
	body: { item: itemID('Dragon chainbody'), quantity: 1 },
	cape: { item: itemID('Cape of legends'), quantity: 1 },
	hands: { item: itemID('Leather gloves'), quantity: 1 },
	neck: { item: itemID('Amulet of strength'), quantity: 1 }
});

const maxCombat: Skills = {
	attack: convertLVLtoXP(99),
	strength: convertLVLtoXP(99),
	defence: convertLVLtoXP(99),
	ranged: convertLVLtoXP(99),
	magic: convertLVLtoXP(99),
	prayer: convertLVLtoXP(99)
};

describe('getUserBestGearFromBank', () => {
	test('autoequip melee attack slash', async () => {
		expect(getUserBestGearFromBank(userBank, userGear, 'melee', maxCombat, GearStat.AttackSlash)).toStrictEqual({
			gearToEquip: {
				...nullGear,
				body: { item: itemID('Bandos chestplate'), quantity: 1 },
				cape: { item: itemID('Cape of legends'), quantity: 1 },
				hands: { item: itemID('Leather gloves'), quantity: 1 },
				neck: { item: itemID('Amulet of glory'), quantity: 1 },
				head: { item: itemID('Justiciar faceguard'), quantity: 1 },
				legs: { item: itemID('Bandos tassets'), quantity: 1 },
				weapon: { item: itemID('Dragon scimitar'), quantity: 1 },
				shield: { item: itemID('Dragonfire shield'), quantity: 1 }
			},
			toRemoveFromGear: new Bank({
				'Elder maul': 1,
				'Dragon chainbody': 1,
				'Amulet of strength': 1
			}),
			toRemoveFromBank: new Bank({
				'Dragon scimitar': 1,
				'Bandos tassets': 1,
				'Bandos chestplate': 1,
				'Justiciar faceguard': 1,
				'Amulet of glory': 1,
				'Dragonfire shield': 1
			}),
			userFinalBank: new Bank({
				'Bandos chestplate': 3,
				'Dragon chainbody': 1,
				'Helm of neitiznot': 2,
				'Elder maul': 1,
				'3rd age amulet': 1,
				'Occult necklace': 1,
				'Ancestral robe top': 1,
				'Ancestral robe bottom': 1,
				'Amulet of strength': 1
			})
		});
	});
	test('autoequip melee attack crush', async () => {
		expect(getUserBestGearFromBank(userBank, userGear, 'melee', maxCombat, GearStat.AttackCrush)).toStrictEqual({
			gearToEquip: {
				...nullGear,
				body: { item: itemID('Bandos chestplate'), quantity: 1 },
				cape: { item: itemID('Cape of legends'), quantity: 1 },
				hands: { item: itemID('Leather gloves'), quantity: 1 },
				neck: { item: itemID('Amulet of glory'), quantity: 1 },
				head: { item: itemID('Justiciar faceguard'), quantity: 1 },
				legs: { item: itemID('Bandos tassets'), quantity: 1 },
				'2h': { item: itemID('Elder maul'), quantity: 1 }
			},
			toRemoveFromGear: new Bank({
				'Dragon chainbody': 1,
				'Amulet of strength': 1
			}),
			toRemoveFromBank: new Bank({
				'Bandos chestplate': 1,
				'Bandos tassets': 1,
				'Justiciar faceguard': 1,
				'Amulet of glory': 1
			}),
			userFinalBank: new Bank({
				'Bandos chestplate': 3,
				'Helm of neitiznot': 2,
				'Dragon scimitar': 1,
				'Dragon chainbody': 1,
				'3rd age amulet': 1,
				'Occult necklace': 1,
				'Ancestral robe top': 1,
				'Ancestral robe bottom': 1,
				'Dragonfire shield': 1,
				'Amulet of strength': 1
			})
		});
	});
	test('autoequip mage attack magic strength', async () => {
		expect(
			getUserBestGearFromBank(userBank, userGear, 'mage', maxCombat, GearStat.AttackMagic, 'strength')
		).toStrictEqual({
			gearToEquip: {
				...nullGear,
				cape: { item: itemID('Cape of legends'), quantity: 1 },
				hands: { item: itemID('Leather gloves'), quantity: 1 },
				neck: { item: itemID('Occult necklace'), quantity: 1 },
				head: { item: itemID('Helm of neitiznot'), quantity: 1 },
				legs: { item: itemID('Ancestral robe bottom'), quantity: 1 },
				body: { item: itemID('Ancestral robe top'), quantity: 1 }
			},
			toRemoveFromGear: new Bank({
				'Dragon chainbody': 1,
				'Amulet of strength': 1,
				'Elder maul': 1
			}),
			toRemoveFromBank: new Bank({
				'Helm of neitiznot': 1,
				'Ancestral robe top': 1,
				'Ancestral robe bottom': 1,
				'Occult necklace': 1
			}),
			userFinalBank: new Bank({
				'Bandos chestplate': 4,
				'Bandos tassets': 1,
				'Helm of neitiznot': 1,
				'Justiciar faceguard': 1,
				'Dragon scimitar': 1,
				'3rd age amulet': 1,
				'Dragon chainbody': 1,
				'Amulet of strength': 1,
				'Elder maul': 1,
				'Dragonfire shield': 1,
				'Amulet of glory': 1
			})
		});
	});
	test('autoequip mage attack magic', async () => {
		expect(getUserBestGearFromBank(userBank, userGear, 'mage', maxCombat, GearStat.AttackMagic)).toStrictEqual({
			gearToEquip: {
				...nullGear,
				cape: { item: itemID('Cape of legends'), quantity: 1 },
				hands: { item: itemID('Leather gloves'), quantity: 1 },
				neck: { item: itemID('3rd age amulet'), quantity: 1 },
				head: { item: itemID('Helm of neitiznot'), quantity: 1 },
				legs: { item: itemID('Ancestral robe bottom'), quantity: 1 },
				body: { item: itemID('Ancestral robe top'), quantity: 1 }
			},
			toRemoveFromGear: new Bank({
				'Dragon chainbody': 1,
				'Amulet of strength': 1,
				'Elder maul': 1
			}),
			toRemoveFromBank: new Bank({
				'Helm of neitiznot': 1,
				'Ancestral robe top': 1,
				'Ancestral robe bottom': 1,
				'3rd age amulet': 1
			}),
			userFinalBank: new Bank({
				'Bandos chestplate': 4,
				'Bandos tassets': 1,
				'Helm of neitiznot': 1,
				'Justiciar faceguard': 1,
				'Dragon scimitar': 1,
				'Occult necklace': 1,
				'Dragon chainbody': 1,
				'Amulet of strength': 1,
				'Elder maul': 1,
				'Dragonfire shield': 1,
				'Amulet of glory': 1
			})
		});
	});
	test('autoequip melee defence slash', async () => {
		expect(getUserBestGearFromBank(userBank, userGear, 'melee', maxCombat, GearStat.DefenceSlash)).toStrictEqual({
			gearToEquip: {
				...nullGear,
				body: { item: itemID('Bandos chestplate'), quantity: 1 },
				cape: { item: itemID('Cape of legends'), quantity: 1 },
				hands: { item: itemID('Leather gloves'), quantity: 1 },
				neck: { item: itemID('Amulet of glory'), quantity: 1 },
				head: { item: itemID('Justiciar faceguard'), quantity: 1 },
				legs: { item: itemID('Bandos tassets'), quantity: 1 },
				weapon: { item: itemID('Dragon scimitar'), quantity: 1 },
				shield: { item: itemID('Dragonfire shield'), quantity: 1 }
			},
			toRemoveFromGear: new Bank({
				'Dragon chainbody': 1,
				'Amulet of strength': 1,
				'Elder maul': 1
			}),
			toRemoveFromBank: new Bank({
				'Bandos chestplate': 1,
				'Bandos tassets': 1,
				'Justiciar faceguard': 1,
				'Amulet of glory': 1,
				'Dragonfire shield': 1,
				'Dragon scimitar': 1
			}),
			userFinalBank: new Bank({
				'Bandos chestplate': 3,
				'Dragon chainbody': 1,
				'Helm of neitiznot': 2,
				'3rd age amulet': 1,
				'Occult necklace': 1,
				'Ancestral robe top': 1,
				'Ancestral robe bottom': 1,
				'Elder maul': 1,
				'Amulet of strength': 1
			})
		});
	});
	test('insufficient stats', async () => {
		expect(
			getUserBestGearFromBank(userBank, userGear, 'melee', { defence: convertLVLtoXP(99) }, GearStat.DefenceSlash)
		).toStrictEqual({
			gearToEquip: {
				...nullGear,
				body: { item: itemID('Bandos chestplate'), quantity: 1 },
				cape: { item: itemID('Cape of legends'), quantity: 1 },
				hands: { item: itemID('Leather gloves'), quantity: 1 },
				neck: { item: itemID('Amulet of glory'), quantity: 1 },
				head: { item: itemID('Justiciar faceguard'), quantity: 1 },
				legs: { item: itemID('Bandos tassets'), quantity: 1 },
				weapon: null,
				shield: { item: itemID('Dragonfire shield'), quantity: 1 }
			},
			toRemoveFromGear: new Bank({
				'Dragon chainbody': 1,
				'Amulet of strength': 1,
				'Elder maul': 1
			}),
			toRemoveFromBank: new Bank({
				'Bandos chestplate': 1,
				'Bandos tassets': 1,
				'Justiciar faceguard': 1,
				'Amulet of glory': 1,
				'Dragonfire shield': 1
			}),
			userFinalBank: new Bank({
				'Bandos chestplate': 3,
				'Dragon chainbody': 1,
				'Helm of neitiznot': 2,
				'3rd age amulet': 1,
				'Occult necklace': 1,
				'Ancestral robe top': 1,
				'Ancestral robe bottom': 1,
				'Elder maul': 1,
				'Amulet of strength': 1,
				'Dragon scimitar': 1
			})
		});
	});
	test('autoequip stackable items equipped', async () => {
		// Crucially, we must test that a stackable item is equipped, must have quantity, and
		// must be replaced by the same item, in addition to a different item.
		const userBankStackables = new Bank({
			'Armadyl chestplate': 4,
			'Armadyl chainskirt': 1,
			'Armadyl coif': 2,
			'Justiciar faceguard': 1,
			'Dragon scimitar': 1,
			'Necklace of anguish': 1,
			'Occult necklace': 1,
			'Ancestral robe top': 1,
			'Ancestral robe bottom': 1,
			'Dragonfire shield': 1,
			'Amulet of glory': 1,
			'Dragon arrow': 100,
			'Twisted bow': 1,
			"Ava's assembler": 1
		});

		const userGearStackables1 = new Gear({
			...nullGear,
			weapon: { item: itemID('Dragon dart'), quantity: 300 },
			body: { item: itemID('Dragon chainbody'), quantity: 1 },
			cape: { item: itemID('Cape of legends'), quantity: 1 },
			hands: { item: itemID('Leather gloves'), quantity: 1 },
			neck: { item: itemID('Amulet of strength'), quantity: 1 },
			ammo: { item: itemID('Dragon arrow'), quantity: 201 }
		});
		expect(
			getUserBestGearFromBank(
				userBankStackables,
				userGearStackables1,
				'range',
				{ ...maxCombat, hitpoints: convertLVLtoXP(99) },
				GearStat.AttackRanged
			)
		).toStrictEqual({
			gearToEquip: {
				...nullGear,
				'2h': { item: itemID('Twisted bow'), quantity: 1 },
				body: { item: itemID('Armadyl chestplate'), quantity: 1 },
				legs: { item: itemID('Armadyl chainskirt'), quantity: 1 },
				cape: { item: itemID("Ava's assembler"), quantity: 1 },
				hands: { item: itemID('Leather gloves'), quantity: 1 },
				neck: { item: itemID('Necklace of anguish'), quantity: 1 },
				ammo: { item: itemID('Dragon arrow'), quantity: 1 },
				head: { item: itemID('Armadyl coif'), quantity: 1 }
			},
			toRemoveFromGear: new Bank({
				'Dragon arrow': 200,
				'Dragon dart': 300,
				'Amulet of strength': 1,
				'Cape of legends': 1,
				'Dragon chainbody': 1
			}),
			toRemoveFromBank: new Bank({
				'Twisted bow': 1,
				'Armadyl chestplate': 1,
				'Armadyl chainskirt': 1,
				'Armadyl coif': 1,
				'Necklace of anguish': 1,
				"Ava's assembler": 1
			}),
			userFinalBank: new Bank({
				'Armadyl chestplate': 3,
				'Armadyl coif': 1,
				'Justiciar faceguard': 1,
				'Dragon scimitar': 1,
				'Occult necklace': 1,
				'Ancestral robe top': 1,
				'Ancestral robe bottom': 1,
				'Dragonfire shield': 1,
				'Amulet of glory': 1,
				'Dragon arrow': 300,
				'Dragon dart': 300,
				'Cape of legends': 1,
				'Dragon chainbody': 1,
				'Amulet of strength': 1
			})
		});
	});
});
