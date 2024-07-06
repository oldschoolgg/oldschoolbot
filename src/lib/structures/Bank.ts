import type { DegradeableItem } from '../degradeableItems';
import { degradeableItems } from '../degradeableItems';
import type { GeneralBankType } from './GeneralBank';
import { GeneralBank } from './GeneralBank';

export class ChargeBank extends GeneralBank<DegradeableItem['settingsKey']> {
	constructor(initialBank?: GeneralBankType<DegradeableItem['settingsKey']>) {
		super({ initialBank, allowedKeys: degradeableItems.map(i => i.settingsKey) });
	}
}
