import { GeneralBank, type GeneralBankType } from '@oldschoolgg/toolkit/dist/lib/GeneralBank';

import type { DegradeableItem } from '../degradeableItems';
import { degradeableItems } from '../degradeableItems';

export class ChargeBank extends GeneralBank<DegradeableItem['settingsKey']> {
	constructor(initialBank?: GeneralBankType<DegradeableItem['settingsKey']>) {
		super({ initialBank, allowedKeys: degradeableItems.map(i => i.settingsKey) });
	}
}
