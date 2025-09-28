import { GeneralBank, type GeneralBankType } from '@oldschoolgg/toolkit';

import { type DegradeableItem, degradeableItems } from '@/lib/degradeableItems.js';

export class ChargeBank extends GeneralBank<DegradeableItem['settingsKey']> {
	constructor(initialBank?: GeneralBankType<DegradeableItem['settingsKey']>) {
		super({ initialBank, allowedKeys: degradeableItems.map(i => i.settingsKey) });
	}
}

export { XPBank } from './XPBank.js';
