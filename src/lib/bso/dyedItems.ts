import { type Item, Items, resolveItems } from 'oldschooljs';

interface DyedItem {
	baseItem: Item;
	dyedVersions: { item: Item; dye: Item }[];
}

const dwarvenDyed: DyedItem[] = [
	{
		baseItem: Items.getOrThrow('Dwarven full helm'),
		dyedVersions: [
			{
				item: Items.getOrThrow('Dwarven full helm (Volcanic)'),
				dye: Items.getOrThrow('Volcanic dye')
			}
		]
	},
	{
		baseItem: Items.getOrThrow('Dwarven platebody'),
		dyedVersions: [
			{
				item: Items.getOrThrow('Dwarven platebody (Volcanic)'),
				dye: Items.getOrThrow('Volcanic dye')
			}
		]
	},
	{
		baseItem: Items.getOrThrow('Dwarven platelegs'),
		dyedVersions: [
			{
				item: Items.getOrThrow('Dwarven platelegs (Volcanic)'),
				dye: Items.getOrThrow('Volcanic dye')
			}
		]
	},
	{
		baseItem: Items.getOrThrow('Dwarven gloves'),
		dyedVersions: [
			{
				item: Items.getOrThrow('Dwarven gloves (Volcanic)'),
				dye: Items.getOrThrow('Volcanic dye')
			}
		]
	},
	{
		baseItem: Items.getOrThrow('Dwarven boots'),
		dyedVersions: [
			{
				item: Items.getOrThrow('Dwarven boots (Volcanic)'),
				dye: Items.getOrThrow('Volcanic dye')
			}
		]
	},
	{
		baseItem: Items.getOrThrow('Dwarven pickaxe'),
		dyedVersions: [
			{
				item: Items.getOrThrow('Dwarven pickaxe (xmas)'),
				dye: Items.getOrThrow('Christmas dye')
			}
		]
	}
];
const gorajan = [
	// Warrior
	{
		baseItem: Items.getOrThrow('Gorajan warrior helmet'),
		dyedVersions: [
			{
				item: Items.getOrThrow('Gorajan warrior helmet (Primal)'),
				dye: Items.getOrThrow('Dungeoneering dye')
			},
			{
				item: Items.getOrThrow('Gorajan warrior helmet (Oceanic)'),
				dye: Items.getOrThrow('Oceanic dye')
			}
		]
	},
	{
		baseItem: Items.getOrThrow('Gorajan warrior top'),
		dyedVersions: [
			{
				item: Items.getOrThrow('Gorajan warrior top (Primal)'),
				dye: Items.getOrThrow('Dungeoneering dye')
			},
			{
				item: Items.getOrThrow('Gorajan warrior top (Oceanic)'),
				dye: Items.getOrThrow('Oceanic dye')
			}
		]
	},
	{
		baseItem: Items.getOrThrow('Gorajan warrior legs'),
		dyedVersions: [
			{
				item: Items.getOrThrow('Gorajan warrior legs (Primal)'),
				dye: Items.getOrThrow('Dungeoneering dye')
			},
			{
				item: Items.getOrThrow('Gorajan warrior legs (Oceanic)'),
				dye: Items.getOrThrow('Oceanic dye')
			}
		]
	},
	{
		baseItem: Items.getOrThrow('Gorajan warrior gloves'),
		dyedVersions: [
			{
				item: Items.getOrThrow('Gorajan warrior gloves (Primal)'),
				dye: Items.getOrThrow('Dungeoneering dye')
			},
			{
				item: Items.getOrThrow('Gorajan warrior gloves (Oceanic)'),
				dye: Items.getOrThrow('Oceanic dye')
			}
		]
	},
	{
		baseItem: Items.getOrThrow('Gorajan warrior boots'),
		dyedVersions: [
			{
				item: Items.getOrThrow('Gorajan warrior boots (Primal)'),
				dye: Items.getOrThrow('Dungeoneering dye')
			},
			{
				item: Items.getOrThrow('Gorajan warrior boots (Oceanic)'),
				dye: Items.getOrThrow('Oceanic dye')
			}
		]
	},
	// Celestial
	{
		baseItem: Items.getOrThrow('Gorajan occult helmet'),
		dyedVersions: [
			{
				item: Items.getOrThrow('Gorajan occult helmet (Celestial)'),
				dye: Items.getOrThrow('Dungeoneering dye')
			},
			{
				item: Items.getOrThrow('Gorajan occult helmet (Oceanic)'),
				dye: Items.getOrThrow('Oceanic dye')
			}
		]
	},
	{
		baseItem: Items.getOrThrow('Gorajan occult top'),
		dyedVersions: [
			{
				item: Items.getOrThrow('Gorajan occult top (Celestial)'),
				dye: Items.getOrThrow('Dungeoneering dye')
			},
			{
				item: Items.getOrThrow('Gorajan occult top (Oceanic)'),
				dye: Items.getOrThrow('Oceanic dye')
			}
		]
	},
	{
		baseItem: Items.getOrThrow('Gorajan occult legs'),
		dyedVersions: [
			{
				item: Items.getOrThrow('Gorajan occult legs (Celestial)'),
				dye: Items.getOrThrow('Dungeoneering dye')
			},
			{
				item: Items.getOrThrow('Gorajan occult legs (Oceanic)'),
				dye: Items.getOrThrow('Oceanic dye')
			}
		]
	},
	{
		baseItem: Items.getOrThrow('Gorajan occult gloves'),
		dyedVersions: [
			{
				item: Items.getOrThrow('Gorajan occult gloves (Celestial)'),
				dye: Items.getOrThrow('Dungeoneering dye')
			},
			{
				item: Items.getOrThrow('Gorajan occult gloves (Oceanic)'),
				dye: Items.getOrThrow('Oceanic dye')
			}
		]
	},
	{
		baseItem: Items.getOrThrow('Gorajan occult boots'),
		dyedVersions: [
			{
				item: Items.getOrThrow('Gorajan occult boots (Celestial)'),
				dye: Items.getOrThrow('Dungeoneering dye')
			},
			{
				item: Items.getOrThrow('Gorajan occult boots (Oceanic)'),
				dye: Items.getOrThrow('Oceanic dye')
			}
		]
	},
	// Sagittarian
	{
		baseItem: Items.getOrThrow('Gorajan archer helmet'),
		dyedVersions: [
			{
				item: Items.getOrThrow('Gorajan archer helmet (Sagittarian)'),
				dye: Items.getOrThrow('Dungeoneering dye')
			},
			{
				item: Items.getOrThrow('Gorajan archer helmet (Oceanic)'),
				dye: Items.getOrThrow('Oceanic dye')
			}
		]
	},
	{
		baseItem: Items.getOrThrow('Gorajan archer top'),
		dyedVersions: [
			{
				item: Items.getOrThrow('Gorajan archer top (Sagittarian)'),
				dye: Items.getOrThrow('Dungeoneering dye')
			},
			{
				item: Items.getOrThrow('Gorajan archer top (Oceanic)'),
				dye: Items.getOrThrow('Oceanic dye')
			}
		]
	},
	{
		baseItem: Items.getOrThrow('Gorajan archer legs'),
		dyedVersions: [
			{
				item: Items.getOrThrow('Gorajan archer legs (Sagittarian)'),
				dye: Items.getOrThrow('Dungeoneering dye')
			},
			{
				item: Items.getOrThrow('Gorajan archer legs (Oceanic)'),
				dye: Items.getOrThrow('Oceanic dye')
			}
		]
	},
	{
		baseItem: Items.getOrThrow('Gorajan archer gloves'),
		dyedVersions: [
			{
				item: Items.getOrThrow('Gorajan archer gloves (Sagittarian)'),
				dye: Items.getOrThrow('Dungeoneering dye')
			},
			{
				item: Items.getOrThrow('Gorajan archer gloves (Oceanic)'),
				dye: Items.getOrThrow('Oceanic dye')
			}
		]
	},
	{
		baseItem: Items.getOrThrow('Gorajan archer boots'),
		dyedVersions: [
			{
				item: Items.getOrThrow('Gorajan archer boots (Sagittarian)'),
				dye: Items.getOrThrow('Dungeoneering dye')
			},
			{
				item: Items.getOrThrow('Gorajan archer boots (Oceanic)'),
				dye: Items.getOrThrow('Oceanic dye')
			}
		]
	}
];

export const allDyes = Items.resolveFullItems([
	'Dungeoneering dye',
	'Blood dye',
	'Ice dye',
	'Shadow dye',
	'Third age dye',
	'Monkey dye',
	'Volcanic dye',
	'Christmas dye',
	'Oceanic dye',
	'Saradomin egg',
	'Zamorak egg',
	'Spooky dye'
]);

export const discontinuedDyes = resolveItems(['Spooky dye', 'Christmas dye']);

export const dyedItems: DyedItem[] = [
	{
		baseItem: Items.getOrThrow('Drygore rapier'),
		dyedVersions: [
			{
				item: Items.getOrThrow('Drygore rapier (blood)'),
				dye: Items.getOrThrow('Blood dye')
			},
			{
				item: Items.getOrThrow('Drygore rapier (ice)'),
				dye: Items.getOrThrow('Ice dye')
			},
			{
				item: Items.getOrThrow('Drygore rapier (shadow)'),
				dye: Items.getOrThrow('Shadow dye')
			},
			{
				item: Items.getOrThrow('Drygore rapier (3a)'),
				dye: Items.getOrThrow('Third age dye')
			},
			{
				item: Items.getOrThrow('Drygore rapier (xmas)'),
				dye: Items.getOrThrow('Christmas dye')
			}
		]
	},
	{
		baseItem: Items.getOrThrow('Offhand drygore rapier'),
		dyedVersions: [
			{
				item: Items.getOrThrow('Offhand drygore rapier (blood)'),
				dye: Items.getOrThrow('Blood dye')
			},
			{
				item: Items.getOrThrow('Offhand drygore rapier (ice)'),
				dye: Items.getOrThrow('Ice dye')
			},
			{
				item: Items.getOrThrow('Offhand drygore rapier (shadow)'),
				dye: Items.getOrThrow('Shadow dye')
			},
			{
				item: Items.getOrThrow('Offhand drygore rapier (3a)'),
				dye: Items.getOrThrow('Third age dye')
			},
			{
				item: Items.getOrThrow('Offhand drygore rapier (xmas)'),
				dye: Items.getOrThrow('Christmas dye')
			}
		]
	},
	{
		baseItem: Items.getOrThrow('Drygore mace'),
		dyedVersions: [
			{
				item: Items.getOrThrow('Drygore mace (blood)'),
				dye: Items.getOrThrow('Blood dye')
			},
			{
				item: Items.getOrThrow('Drygore mace (ice)'),
				dye: Items.getOrThrow('Ice dye')
			},
			{
				item: Items.getOrThrow('Drygore mace (shadow)'),
				dye: Items.getOrThrow('Shadow dye')
			},
			{
				item: Items.getOrThrow('Drygore mace (3a)'),
				dye: Items.getOrThrow('Third age dye')
			},
			{
				item: Items.getOrThrow('Drygore mace (xmas)'),
				dye: Items.getOrThrow('Christmas dye')
			}
		]
	},
	{
		baseItem: Items.getOrThrow('Offhand drygore mace'),
		dyedVersions: [
			{
				item: Items.getOrThrow('Offhand drygore mace (blood)'),
				dye: Items.getOrThrow('Blood dye')
			},
			{
				item: Items.getOrThrow('Offhand drygore mace (ice)'),
				dye: Items.getOrThrow('Ice dye')
			},
			{
				item: Items.getOrThrow('Offhand drygore mace (shadow)'),
				dye: Items.getOrThrow('Shadow dye')
			},
			{
				item: Items.getOrThrow('Offhand drygore mace (3a)'),
				dye: Items.getOrThrow('Third age dye')
			},
			{
				item: Items.getOrThrow('Offhand drygore mace (xmas)'),
				dye: Items.getOrThrow('Christmas dye')
			}
		]
	},
	{
		baseItem: Items.getOrThrow('Drygore longsword'),
		dyedVersions: [
			{
				item: Items.getOrThrow('Drygore longsword (blood)'),
				dye: Items.getOrThrow('Blood dye')
			},
			{
				item: Items.getOrThrow('Drygore longsword (ice)'),
				dye: Items.getOrThrow('Ice dye')
			},
			{
				item: Items.getOrThrow('Drygore longsword (shadow)'),
				dye: Items.getOrThrow('Shadow dye')
			},
			{
				item: Items.getOrThrow('Drygore longsword (3a)'),
				dye: Items.getOrThrow('Third age dye')
			},
			{
				item: Items.getOrThrow('Drygore longsword (xmas)'),
				dye: Items.getOrThrow('Christmas dye')
			}
		]
	},
	{
		baseItem: Items.getOrThrow('Offhand drygore longsword'),
		dyedVersions: [
			{
				item: Items.getOrThrow('Offhand drygore longsword (blood)'),
				dye: Items.getOrThrow('Blood dye')
			},
			{
				item: Items.getOrThrow('Offhand drygore longsword (ice)'),
				dye: Items.getOrThrow('Ice dye')
			},
			{
				item: Items.getOrThrow('Offhand drygore longsword (shadow)'),
				dye: Items.getOrThrow('Shadow dye')
			},
			{
				item: Items.getOrThrow('Offhand drygore longsword (3a)'),
				dye: Items.getOrThrow('Third age dye')
			},
			{
				item: Items.getOrThrow('Offhand drygore longsword (xmas)'),
				dye: Items.getOrThrow('Christmas dye')
			}
		]
	},
	{
		baseItem: Items.getOrThrow('Dwarven warhammer'),
		dyedVersions: [
			{
				item: Items.getOrThrow('Dwarven warhammer (blood)'),
				dye: Items.getOrThrow('Blood dye')
			},
			{
				item: Items.getOrThrow('Dwarven warhammer (ice)'),
				dye: Items.getOrThrow('Ice dye')
			},
			{
				item: Items.getOrThrow('Dwarven warhammer (shadow)'),
				dye: Items.getOrThrow('Shadow dye')
			},
			{
				item: Items.getOrThrow('Dwarven warhammer (3a)'),
				dye: Items.getOrThrow('Third age dye')
			},
			{
				item: Items.getOrThrow('Dwarven warnana'),
				dye: Items.getOrThrow('Monkey dye')
			},
			{
				item: Items.getOrThrow('Dwarven warhammer (volcanic)'),
				dye: Items.getOrThrow('Volcanic dye')
			},
			{
				item: Items.getOrThrow('Ho-ho hammer'),
				dye: Items.getOrThrow('Christmas dye')
			},
			{
				item: Items.getOrThrow('Dwarven pumpkinsmasher'),
				dye: Items.getOrThrow('Spooky dye')
			}
		]
	},
	{
		baseItem: Items.getOrThrow('Twisted bow'),
		dyedVersions: [
			{
				item: Items.getOrThrow('Twisted bow (ice)'),
				dye: Items.getOrThrow('Ice dye')
			},
			{
				item: Items.getOrThrow('Twisted bow (shadow)'),
				dye: Items.getOrThrow('Shadow dye')
			},
			{
				item: Items.getOrThrow('Twisted bow (blood)'),
				dye: Items.getOrThrow('Blood dye')
			},
			{
				item: Items.getOrThrow('Twisted bow (3a)'),
				dye: Items.getOrThrow('Third age dye')
			},
			{
				item: Items.getOrThrow('Twisted bownana'),
				dye: Items.getOrThrow('Monkey dye')
			}
		]
	},
	{
		baseItem: Items.getOrThrow('Zaryte bow'),
		dyedVersions: [
			{
				item: Items.getOrThrow('Zaryte bow (ice)'),
				dye: Items.getOrThrow('Ice dye')
			},
			{
				item: Items.getOrThrow('Zaryte bow (shadow)'),
				dye: Items.getOrThrow('Shadow dye')
			},
			{
				item: Items.getOrThrow('Zaryte bow (blood)'),
				dye: Items.getOrThrow('Blood dye')
			},
			{
				item: Items.getOrThrow('Zaryte bow (3a)'),
				dye: Items.getOrThrow('Third age dye')
			},
			{
				item: Items.getOrThrow('Zaryte bownana'),
				dye: Items.getOrThrow('Monkey dye')
			}
		]
	},
	{
		baseItem: Items.getOrThrow('Hellfire bow'),
		dyedVersions: [
			{
				item: Items.getOrThrow('Hellfire bownana'),
				dye: Items.getOrThrow('Monkey dye')
			},
			{
				item: Items.getOrThrow('Mistleboe'),
				dye: Items.getOrThrow('Christmas dye')
			},
			{
				item: Items.getOrThrow('Hellfire bow (ice)'),
				dye: Items.getOrThrow('Ice dye')
			},
			{
				item: Items.getOrThrow('Hellfire bow (Oceanic)'),
				dye: Items.getOrThrow('Oceanic dye')
			},
			{
				item: Items.getOrThrow('Demonic piercer'),
				dye: Items.getOrThrow('Spooky dye')
			}
		]
	},
	{
		baseItem: Items.getOrThrow('Zaryte crossbow'),
		dyedVersions: [
			{
				item: Items.getOrThrow('Zaryte crossbow (xmas)'),
				dye: Items.getOrThrow('Christmas dye')
			}
		]
	},
	{
		baseItem: Items.getOrThrow('Vasa cloak'),
		dyedVersions: [
			{
				item: Items.getOrThrow('Vasa cloak (xmas)'),
				dye: Items.getOrThrow('Christmas dye')
			},
			{
				item: Items.getOrThrow('Vasa cloak (zamorak)'),
				dye: Items.getOrThrow('Zamorak egg')
			},
			{
				item: Items.getOrThrow('Vasa cloak (saradomin)'),
				dye: Items.getOrThrow('Saradomin egg')
			}
		]
	},
	{
		baseItem: Items.getOrThrow('Dragon claws'),
		dyedVersions: [
			{
				item: Items.getOrThrow('Santa claws'),
				dye: Items.getOrThrow('Christmas dye')
			}
		]
	},
	{
		baseItem: Items.getOrThrow('TzKal cape'),
		dyedVersions: [
			{
				item: Items.getOrThrow('TzKal cape (Oceanic)'),
				dye: Items.getOrThrow('Oceanic dye')
			},
			{
				item: Items.getOrThrow('TzKal cape (Volcanic)'),
				dye: Items.getOrThrow('Volcanic dye')
			},
			{
				item: Items.getOrThrow('TzKal cape (spooky)'),
				dye: Items.getOrThrow('Spooky dye')
			}
		]
	},
	...gorajan,
	...dwarvenDyed,
	{
		baseItem: Items.getOrThrow('Infernal slayer helmet(i)'),
		dyedVersions: [
			{
				item: Items.getOrThrow('Infernal slayer helmet(i) (ice)'),
				dye: Items.getOrThrow('Ice dye')
			},
			{
				item: Items.getOrThrow('Infernal slayer helmet(i) (xmas)'),
				dye: Items.getOrThrow('Christmas dye')
			}
		]
	},
	{
		baseItem: Items.getOrThrow('Scythe of vitur'),
		dyedVersions: [
			{
				item: Items.getOrThrow('The Grim Reaper'),
				dye: Items.getOrThrow('Spooky dye')
			}
		]
	},
	{
		baseItem: Items.getOrThrow('Tidal collector'),
		dyedVersions: [
			{
				item: Items.getOrThrow('Deathly collector'),
				dye: Items.getOrThrow('Spooky dye')
			}
		]
	},
	{
		baseItem: Items.getOrThrow('Titan ballista'),
		dyedVersions: [
			{
				item: Items.getOrThrow('Titan ballista (xmas)'),
				dye: Items.getOrThrow('Christmas dye')
			}
		]
	},
	{
		baseItem: Items.getOrThrow('Atlantean trident'),
		dyedVersions: [
			{
				item: Items.getOrThrow('Atlantean trident (xmas)'),
				dye: Items.getOrThrow('Christmas dye')
			}
		]
	},
	{
		baseItem: Items.getOrThrow('Axe of the high sungod'),
		dyedVersions: [
			{
				item: Items.getOrThrow('Axe of the high sungod (xmas)'),
				dye: Items.getOrThrow('Christmas dye')
			}
		]
	}
];

export const allDyedItems = dyedItems.flatMap(i => i.dyedVersions).map(i => i.item.id);
