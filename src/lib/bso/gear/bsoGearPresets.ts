import { itemID } from 'oldschooljs';

import type { GlobalPreset } from '@/lib/gear/gearPresets.js';

export const bsoGlobalGearPresets: GlobalPreset[] = [
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
		times_equipped: 0,
		defaultSetup: 'skilling',
		pinned_setup: null
	},
	{
		name: 'diviner',
		user_id: '123',
		head: itemID("Diviner's headwear"),
		neck: null,
		body: itemID("Diviner's robe"),
		legs: itemID("Diviner's legwear"),
		cape: null,
		two_handed: null,
		hands: itemID("Diviner's handwear"),
		feet: itemID("Diviner's footwear"),
		shield: null,
		weapon: null,
		ring: null,
		ammo: null,
		ammo_qty: null,
		times_equipped: 0,
		defaultSetup: 'skilling',
		pinned_setup: null
	}
];
