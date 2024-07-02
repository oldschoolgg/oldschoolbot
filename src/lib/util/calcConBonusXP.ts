import { round } from 'e';

import type { GearSetup } from '../gear/types';
import itemID from './itemID';

export function calcConBonusXP(setup: GearSetup): number {
	let bonusMultiplier = 0;
	let numberOfItems = 0;

	if (setup.head?.item === itemID("Carpenter's helmet")) {
		bonusMultiplier += 0.4;
		numberOfItems++;
	}

	if (setup.body?.item === itemID("Carpenter's shirt")) {
		bonusMultiplier += 0.8;
		numberOfItems++;
	}

	if (setup.legs?.item === itemID("Carpenter's trousers")) {
		bonusMultiplier += 0.6;
		numberOfItems++;
	}

	if (setup.feet?.item === itemID("Carpenter's boots")) {
		bonusMultiplier += 0.2;
		numberOfItems++;
	}

	if (numberOfItems === 4) {
		bonusMultiplier += 0.5;
	}

	return round(bonusMultiplier, 1);
}
