import { Bank } from 'oldschooljs';

import type { Createable } from '../createables';

const bellatorRing: Createable[] = [
	{
		name: 'Warrior icon',
		inputItems: new Bank().add('Warrior ring'),
		outputItems: new Bank().add('Warrior icon')
	},
	{
		name: 'Bellator icon',
		inputItems: new Bank().add('Bellator vestige').add('Warrior icon').add('Blood rune', 500),
		outputItems: new Bank().add('Bellator icon')
	},
	{
		name: 'Bellator ring',
		inputItems: new Bank().add('Bellator icon').add('Chromium ingot', 3),
		outputItems: new Bank().add('Bellator ring')
	}
];

const ultorRing: Createable[] = [
	{
		name: 'Berserker icon',
		inputItems: new Bank().add('Berserker ring'),
		outputItems: new Bank().add('Berserker icon')
	},
	{
		name: 'Ultor icon',
		inputItems: new Bank().add('Ultor vestige').add('Berserker icon').add('Blood rune', 500),
		outputItems: new Bank().add('Ultor icon')
	},
	{
		name: 'Ultor ring',
		inputItems: new Bank().add('Ultor icon').add('Chromium ingot', 3),
		outputItems: new Bank().add('Ultor ring')
	}
];

const magusRing: Createable[] = [
	{
		name: 'Seers icon',
		inputItems: new Bank().add('Seers ring'),
		outputItems: new Bank().add('Seers icon')
	},
	{
		name: 'Magus icon',
		inputItems: new Bank().add('Magus vestige').add('Seers icon').add('Blood rune', 500),
		outputItems: new Bank().add('Magus icon')
	},
	{
		name: 'Magus ring',
		inputItems: new Bank().add('Magus icon').add('Chromium ingot', 3),
		outputItems: new Bank().add('Magus ring')
	}
];

const venatorRing: Createable[] = [
	{
		name: 'Archer icon',
		inputItems: new Bank().add('Archers ring'),
		outputItems: new Bank().add('Archer icon')
	},
	{
		name: 'Venator icon',
		inputItems: new Bank().add('Venator vestige').add('Archer icon').add('Blood rune', 500),
		outputItems: new Bank().add('Venator icon')
	},
	{
		name: 'Venator ring',
		inputItems: new Bank().add('Venator icon').add('Chromium ingot', 3),
		outputItems: new Bank().add('Venator ring')
	}
];

const ancientBloodCustomReq: NonNullable<Createable['customReq']> = async user => {
	if (!user.owns('Ancient blood ornament kit')) {
		return "You need a 'Ancient blood ornament kit' to make this item.";
	}
	return null;
};

const bloodTorva: Createable[] = [
	{
		name: 'Sanguine torva full helm',
		inputItems: new Bank().add('Torva full helm').add('Blood rune', 20_000),
		outputItems: new Bank().add('Sanguine torva full helm'),
		customReq: ancientBloodCustomReq
	},
	{
		name: 'Sanguine torva platebody',
		inputItems: new Bank().add('Torva platebody').add('Blood rune', 20_000),
		outputItems: new Bank().add('Sanguine torva platebody'),
		customReq: ancientBloodCustomReq
	},
	{
		name: 'Sanguine torva platelegs',
		inputItems: new Bank().add('Torva platelegs').add('Blood rune', 20_000),
		outputItems: new Bank().add('Sanguine torva platelegs'),
		customReq: ancientBloodCustomReq
	}
];

export const dtCreatables: Createable[] = [
	...bellatorRing,
	...ultorRing,
	...magusRing,
	...bloodTorva,
	...venatorRing,
	{
		name: 'Soulreaper axe',
		inputItems: new Bank()
			.add("Leviathan's lure")
			.add("Siren's staff")
			.add("Executioner's axe head")
			.add('Eye of the duke')
			.add('Blood rune', 2000),
		outputItems: new Bank().add('Soulreaper axe')
	}
];
