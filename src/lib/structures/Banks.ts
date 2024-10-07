import { GeneralBank, type GeneralBankType } from '@oldschoolgg/toolkit/structures';
import { type DegradeableItem, degradeableItems } from '../degradeableItems';

export class ChargeBank extends GeneralBank<DegradeableItem['settingsKey']> {
	constructor(initialBank?: GeneralBankType<DegradeableItem['settingsKey']>) {
		super({ initialBank, allowedKeys: degradeableItems.map(i => i.settingsKey) });
	}
}

export { XPBank } from './XPBank';
