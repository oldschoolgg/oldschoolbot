import { GeneralBank, type GeneralBankType } from '@oldschoolgg/toolkit';
import { type DegradeableItem, degradeableItems } from '../degradeableItems';
import { type SkillNameType, SkillsArray } from '../skilling/types';

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
