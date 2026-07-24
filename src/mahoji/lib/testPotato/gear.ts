import { stringMatches } from '@oldschoolgg/toolkit';
import { Items } from 'oldschooljs';

import { gearViewCommand } from '@/mahoji/lib/abstracted_commands/gearCommands.js';
import { gearPresets } from '@/mahoji/lib/testPotato/presets.js';

export async function handleTestPotatoGear(user: MUser, thing: string) {
	const gear = gearPresets.find(i => stringMatches(i.name, thing))!;

	for (const type of ['melee', 'range', 'mage'] as const) {
		const currentGear = gear[type];
		const ammo = currentGear.get('ammo');
		if (ammo && Items.getItem(ammo.item)?.stackable) {
			currentGear.set('ammo', { ...ammo, quantity: 10_000 });
		}
	}

	await user.updateGear([
		{ setup: 'melee', gear: gear.melee.raw() },
		{ setup: 'range', gear: gear.range.raw() },
		{ setup: 'mage', gear: gear.mage.raw() }
	]);

	return gearViewCommand(user, 'all', false);
}
