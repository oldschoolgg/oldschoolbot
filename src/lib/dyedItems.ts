import { Item } from 'oldschooljs/dist/meta/types';

import getOSItem from './util/getOSItem';

interface DyedItem {
	baseItem: Item;
	dyedVersions: { item: Item; dye: Item }[];
}

const dwarvenDyed: DyedItem[] = [
	{
		baseItem: getOSItem('Dwarven full helm'),
		dyedVersions: [
			{
				item: getOSItem('Dwarven full helm (Volcanic)'),
				dye: getOSItem('Volcanic dye')
			}
		]
	},
	{
		baseItem: getOSItem('Dwarven platebody'),
		dyedVersions: [
			{
				item: getOSItem('Dwarven platebody (Volcanic)'),
				dye: getOSItem('Volcanic dye')
			}
		]
	},
	{
		baseItem: getOSItem('Dwarven platelegs'),
		dyedVersions: [
			{
				item: getOSItem('Dwarven platelegs (Volcanic)'),
				dye: getOSItem('Volcanic dye')
			}
		]
	},
	{
		baseItem: getOSItem('Dwarven gloves'),
		dyedVersions: [
			{
				item: getOSItem('Dwarven gloves (Volcanic)'),
				dye: getOSItem('Volcanic dye')
			}
		]
	},
	{
		baseItem: getOSItem('Dwarven boots'),
		dyedVersions: [
			{
				item: getOSItem('Dwarven boots (Volcanic)'),
				dye: getOSItem('Volcanic dye')
			}
		]
	}
];
const gorajan = [
	// Warrior
	{
		baseItem: getOSItem('Gorajan warrior helmet'),
		dyedVersions: [
			{
				item: getOSItem('Gorajan warrior helmet (Primal)'),
				dye: getOSItem('Dungeoneering dye')
			}
		]
	},
	{
		baseItem: getOSItem('Gorajan warrior top'),
		dyedVersions: [
			{
				item: getOSItem('Gorajan warrior top (Primal)'),
				dye: getOSItem('Dungeoneering dye')
			}
		]
	},
	{
		baseItem: getOSItem('Gorajan warrior legs'),
		dyedVersions: [
			{
				item: getOSItem('Gorajan warrior legs (Primal)'),
				dye: getOSItem('Dungeoneering dye')
			}
		]
	},
	{
		baseItem: getOSItem('Gorajan warrior gloves'),
		dyedVersions: [
			{
				item: getOSItem('Gorajan warrior gloves (Primal)'),
				dye: getOSItem('Dungeoneering dye')
			}
		]
	},
	{
		baseItem: getOSItem('Gorajan warrior boots'),
		dyedVersions: [
			{
				item: getOSItem('Gorajan warrior boots (Primal)'),
				dye: getOSItem('Dungeoneering dye')
			}
		]
	},
	// Celestial
	{
		baseItem: getOSItem('Gorajan occult helmet'),
		dyedVersions: [
			{
				item: getOSItem('Gorajan occult helmet (Celestial)'),
				dye: getOSItem('Dungeoneering dye')
			}
		]
	},
	{
		baseItem: getOSItem('Gorajan occult top'),
		dyedVersions: [
			{
				item: getOSItem('Gorajan occult top (Celestial)'),
				dye: getOSItem('Dungeoneering dye')
			}
		]
	},
	{
		baseItem: getOSItem('Gorajan occult legs'),
		dyedVersions: [
			{
				item: getOSItem('Gorajan occult legs (Celestial)'),
				dye: getOSItem('Dungeoneering dye')
			}
		]
	},
	{
		baseItem: getOSItem('Gorajan occult gloves'),
		dyedVersions: [
			{
				item: getOSItem('Gorajan occult gloves (Celestial)'),
				dye: getOSItem('Dungeoneering dye')
			}
		]
	},
	{
		baseItem: getOSItem('Gorajan occult boots'),
		dyedVersions: [
			{
				item: getOSItem('Gorajan occult boots (Celestial)'),
				dye: getOSItem('Dungeoneering dye')
			}
		]
	},
	// Sagittarian
	{
		baseItem: getOSItem('Gorajan archer helmet'),
		dyedVersions: [
			{
				item: getOSItem('Gorajan archer helmet (Sagittarian)'),
				dye: getOSItem('Dungeoneering dye')
			}
		]
	},
	{
		baseItem: getOSItem('Gorajan archer top'),
		dyedVersions: [
			{
				item: getOSItem('Gorajan archer top (Sagittarian)'),
				dye: getOSItem('Dungeoneering dye')
			}
		]
	},
	{
		baseItem: getOSItem('Gorajan archer legs'),
		dyedVersions: [
			{
				item: getOSItem('Gorajan archer legs (Sagittarian)'),
				dye: getOSItem('Dungeoneering dye')
			}
		]
	},
	{
		baseItem: getOSItem('Gorajan archer gloves'),
		dyedVersions: [
			{
				item: getOSItem('Gorajan archer gloves (Sagittarian)'),
				dye: getOSItem('Dungeoneering dye')
			}
		]
	},
	{
		baseItem: getOSItem('Gorajan archer boots'),
		dyedVersions: [
			{
				item: getOSItem('Gorajan archer boots (Sagittarian)'),
				dye: getOSItem('Dungeoneering dye')
			}
		]
	}
];

export const dyedItems: DyedItem[] = [
	{
		baseItem: getOSItem('Drygore rapier'),
		dyedVersions: [
			{
				item: getOSItem('Drygore rapier (blood)'),
				dye: getOSItem('Blood dye')
			},
			{
				item: getOSItem('Drygore rapier (ice)'),
				dye: getOSItem('Ice dye')
			},
			{
				item: getOSItem('Drygore rapier (shadow)'),
				dye: getOSItem('Shadow dye')
			},
			{
				item: getOSItem('Drygore rapier (3a)'),
				dye: getOSItem('Third age dye')
			}
		]
	},
	{
		baseItem: getOSItem('Offhand drygore rapier'),
		dyedVersions: [
			{
				item: getOSItem('Offhand drygore rapier (blood)'),
				dye: getOSItem('Blood dye')
			},
			{
				item: getOSItem('Offhand drygore rapier (ice)'),
				dye: getOSItem('Ice dye')
			},
			{
				item: getOSItem('Offhand drygore rapier (shadow)'),
				dye: getOSItem('Shadow dye')
			},
			{
				item: getOSItem('Offhand drygore rapier (3a)'),
				dye: getOSItem('Third age dye')
			}
		]
	},
	{
		baseItem: getOSItem('Drygore mace'),
		dyedVersions: [
			{
				item: getOSItem('Drygore mace (blood)'),
				dye: getOSItem('Blood dye')
			},
			{
				item: getOSItem('Drygore mace (ice)'),
				dye: getOSItem('Ice dye')
			},
			{
				item: getOSItem('Drygore mace (shadow)'),
				dye: getOSItem('Shadow dye')
			},
			{
				item: getOSItem('Drygore mace (3a)'),
				dye: getOSItem('Third age dye')
			}
		]
	},
	{
		baseItem: getOSItem('Offhand drygore mace'),
		dyedVersions: [
			{
				item: getOSItem('Offhand drygore mace (blood)'),
				dye: getOSItem('Blood dye')
			},
			{
				item: getOSItem('Offhand drygore mace (ice)'),
				dye: getOSItem('Ice dye')
			},
			{
				item: getOSItem('Offhand drygore mace (shadow)'),
				dye: getOSItem('Shadow dye')
			},
			{
				item: getOSItem('Offhand drygore mace (3a)'),
				dye: getOSItem('Third age dye')
			}
		]
	},
	{
		baseItem: getOSItem('Drygore longsword'),
		dyedVersions: [
			{
				item: getOSItem('Drygore longsword (blood)'),
				dye: getOSItem('Blood dye')
			},
			{
				item: getOSItem('Drygore longsword (ice)'),
				dye: getOSItem('Ice dye')
			},
			{
				item: getOSItem('Drygore longsword (shadow)'),
				dye: getOSItem('Shadow dye')
			},
			{
				item: getOSItem('Drygore longsword (3a)'),
				dye: getOSItem('Third age dye')
			}
		]
	},
	{
		baseItem: getOSItem('Offhand drygore longsword'),
		dyedVersions: [
			{
				item: getOSItem('Offhand drygore longsword (blood)'),
				dye: getOSItem('Blood dye')
			},
			{
				item: getOSItem('Offhand drygore longsword (ice)'),
				dye: getOSItem('Ice dye')
			},
			{
				item: getOSItem('Offhand drygore longsword (shadow)'),
				dye: getOSItem('Shadow dye')
			},
			{
				item: getOSItem('Offhand drygore longsword (3a)'),
				dye: getOSItem('Third age dye')
			}
		]
	},
	{
		baseItem: getOSItem('Dwarven warhammer'),
		dyedVersions: [
			{
				item: getOSItem('Dwarven warhammer (blood)'),
				dye: getOSItem('Blood dye')
			},
			{
				item: getOSItem('Dwarven warhammer (ice)'),
				dye: getOSItem('Ice dye')
			},
			{
				item: getOSItem('Dwarven warhammer (shadow)'),
				dye: getOSItem('Shadow dye')
			},
			{
				item: getOSItem('Dwarven warhammer (3a)'),
				dye: getOSItem('Third age dye')
			},
			{
				item: getOSItem('Dwarven warnana'),
				dye: getOSItem('Monkey dye')
			},
			{
				item: getOSItem('Dwarven warhammer (volcanic)'),
				dye: getOSItem('Volcanic dye')
			}
		]
	},
	{
		baseItem: getOSItem('Twisted bow'),
		dyedVersions: [
			{
				item: getOSItem('Twisted bow (ice)'),
				dye: getOSItem('Ice dye')
			},
			{
				item: getOSItem('Twisted bow (shadow)'),
				dye: getOSItem('Shadow dye')
			},
			{
				item: getOSItem('Twisted bow (blood)'),
				dye: getOSItem('Blood dye')
			},
			{
				item: getOSItem('Twisted bow (3a)'),
				dye: getOSItem('Third age dye')
			},
			{
				item: getOSItem('Twisted bownana'),
				dye: getOSItem('Monkey dye')
			}
		]
	},
	{
		baseItem: getOSItem('Zaryte bow'),
		dyedVersions: [
			{
				item: getOSItem('Zaryte bow (ice)'),
				dye: getOSItem('Ice dye')
			},
			{
				item: getOSItem('Zaryte bow (shadow)'),
				dye: getOSItem('Shadow dye')
			},
			{
				item: getOSItem('Zaryte bow (blood)'),
				dye: getOSItem('Blood dye')
			},
			{
				item: getOSItem('Zaryte bow (3a)'),
				dye: getOSItem('Third age dye')
			},
			{
				item: getOSItem('Zaryte bownana'),
				dye: getOSItem('Monkey dye')
			}
		]
	},
	{
		baseItem: getOSItem('Hellfire bow'),
		dyedVersions: [
			{
				item: getOSItem('Hellfire bownana'),
				dye: getOSItem('Monkey dye')
			}
		]
	},
	...gorajan,
	...dwarvenDyed
];
