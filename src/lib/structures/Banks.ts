import { DegradeableItem, degradeableItems } from '../degradeableItems';
import { SkillNameType, SkillsArray } from '../skilling/types';
import { GeneralBank, GeneralBankType } from './GeneralBank';

export class ChargeBank extends GeneralBank<DegradeableItem['settingsKey']> {
	constructor(initialBank?: GeneralBankType<DegradeableItem['settingsKey']>) {
		super({ initialBank, allowedKeys: degradeableItems.map(i => i.settingsKey) });
	}
}

export class XPBank extends GeneralBank<SkillNameType> {
	constructor(initialBank?: GeneralBankType<SkillNameType>) {
		super({ initialBank, allowedKeys: SkillsArray });
	}
}

export class FloatsBank extends GeneralBank<number> {
	constructor(initialBank?: GeneralBankType<number>) {
		super({ initialBank, valueSchema: { floats: true, min: 0, max: 1000 } });
	}
}

const floats = new FloatsBank();
floats.addItem(1, 1.5);
console.log(floats.entries());
