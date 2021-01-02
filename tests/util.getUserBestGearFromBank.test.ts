import { resolveNameBank } from 'oldschooljs/dist/util';

import { GearSetup, GearSetupTypes } from '../src/lib/gear/types';
import getUserBestGearFromBank from '../src/lib/minions/functions/getUserBestGearFromBank';
import itemID from '../src/lib/util/itemID';

const userBank = resolveNameBank({
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
	'Amulet of glory': 1,
	'Blade of saeldor': 0
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
const userGear: GearSetup = {
	...nullGear,
	'2h': { item: itemID('Elder maul'), quantity: 1 },
	body: { item: itemID('Dragon chainbody'), quantity: 1 },
	cape: { item: itemID('Cape of legends'), quantity: 1 },
	hands: { item: itemID('Leather gloves'), quantity: 1 },
	neck: { item: itemID('Amulet of strength'), quantity: 1 }
};

describe('getUserBestGearFromBank', () => {
	test('autoequip melee attack slash', async () => {
		expect(
			getUserBestGearFromBank(userBank, userGear, GearSetupTypes.Melee, 'attack', 'slash')
		).toStrictEqual({
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
			toRemoveFromGear: resolveNameBank({
				'Elder maul': 1,
				'Dragon chainbody': 1,
				'Amulet of strength': 1
			}),
			toRemoveFromBank: resolveNameBank({
				'Dragon scimitar': 1,
				'Bandos tassets': 1,
				'Bandos chestplate': 1,
				'Justiciar faceguard': 1,
				'Amulet of glory': 1,
				'Dragonfire shield': 1
			}),
			userFinalBank: resolveNameBank({
				'Bandos chestplate': 3,
				'Dragon chainbody': 1,
				'Helm of neitiznot': 2,
				'Elder maul': 1,
				'3rd age amulet': 1,
				'Occult necklace': 1,
				'Ancestral robe top': 1,
				'Ancestral robe bottom': 1,
				'Amulet of strength': 1,
				'Blade of saeldor': 0
			})
		});
	});
	test('autoequip melee attack crush', async () => {
		expect(
			getUserBestGearFromBank(userBank, userGear, GearSetupTypes.Melee, 'attack', 'crush')
		).toStrictEqual({
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
			toRemoveFromGear: resolveNameBank({
				'Dragon chainbody': 1,
				'Amulet of strength': 1
			}),
			toRemoveFromBank: resolveNameBank({
				'Bandos chestplate': 1,
				'Bandos tassets': 1,
				'Justiciar faceguard': 1,
				'Amulet of glory': 1
			}),
			userFinalBank: resolveNameBank({
				'Bandos chestplate': 3,
				'Helm of neitiznot': 2,
				'Dragon scimitar': 1,
				'Dragon chainbody': 1,
				'3rd age amulet': 1,
				'Occult necklace': 1,
				'Ancestral robe top': 1,
				'Ancestral robe bottom': 1,
				'Dragonfire shield': 1,
				'Amulet of strength': 1,
				'Blade of saeldor': 0
			})
		});
	});
	test('autoequip mage attack magic strength', async () => {
		expect(
			getUserBestGearFromBank(
				userBank,
				userGear,
				GearSetupTypes.Mage,
				'attack',
				'magic',
				'strength'
			)
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
			toRemoveFromGear: resolveNameBank({
				'Dragon chainbody': 1,
				'Amulet of strength': 1,
				'Elder maul': 1
			}),
			toRemoveFromBank: resolveNameBank({
				'Helm of neitiznot': 1,
				'Ancestral robe top': 1,
				'Ancestral robe bottom': 1,
				'Occult necklace': 1
			}),
			userFinalBank: resolveNameBank({
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
				'Amulet of glory': 1,
				'Blade of saeldor': 0
			})
		});
	});
	test('autoequip mage attack magic', async () => {
		expect(
			getUserBestGearFromBank(userBank, userGear, GearSetupTypes.Mage, 'attack', 'magic')
		).toStrictEqual({
			gearToEquip: {
				...nullGear,
				cape: { item: itemID('Cape of legends'), quantity: 1 },
				hands: { item: itemID('Leather gloves'), quantity: 1 },
				neck: { item: itemID('3rd age amulet'), quantity: 1 },
				head: { item: itemID('Helm of neitiznot'), quantity: 1 },
				legs: { item: itemID('Ancestral robe bottom'), quantity: 1 },
				body: { item: itemID('Ancestral robe top'), quantity: 1 }
			},
			toRemoveFromGear: resolveNameBank({
				'Dragon chainbody': 1,
				'Amulet of strength': 1,
				'Elder maul': 1
			}),
			toRemoveFromBank: resolveNameBank({
				'Helm of neitiznot': 1,
				'Ancestral robe top': 1,
				'Ancestral robe bottom': 1,
				'3rd age amulet': 1
			}),
			userFinalBank: resolveNameBank({
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
				'Amulet of glory': 1,
				'Blade of saeldor': 0
			})
		});
	});
	test('autoequip melee defence slash', async () => {
		expect(
			getUserBestGearFromBank(userBank, userGear, GearSetupTypes.Melee, 'defence', 'slash')
		).toStrictEqual({
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
			toRemoveFromGear: resolveNameBank({
				'Dragon chainbody': 1,
				'Amulet of strength': 1,
				'Elder maul': 1
			}),
			toRemoveFromBank: resolveNameBank({
				'Bandos chestplate': 1,
				'Bandos tassets': 1,
				'Justiciar faceguard': 1,
				'Amulet of glory': 1,
				'Dragonfire shield': 1,
				'Dragon scimitar': 1
			}),
			userFinalBank: resolveNameBank({
				'Bandos chestplate': 3,
				'Dragon chainbody': 1,
				'Helm of neitiznot': 2,
				'3rd age amulet': 1,
				'Occult necklace': 1,
				'Ancestral robe top': 1,
				'Ancestral robe bottom': 1,
				'Elder maul': 1,
				'Amulet of strength': 1,
				'Blade of saeldor': 0
			})
		});
	});
});
