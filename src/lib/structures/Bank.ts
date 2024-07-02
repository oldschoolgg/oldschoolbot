import type { DegradeableItem } from '../degradeableItems';
import { degradeableItems } from '../degradeableItems';
import type { SkillNameType } from '../skilling/types';
import { SkillsArray } from '../skilling/types';
import type { GeneralBankType } from './GeneralBank';
import { GeneralBank } from './GeneralBank';

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
