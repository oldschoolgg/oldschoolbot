import { GeneralBank, type GeneralBankType } from '@oldschoolgg/toolkit';
import type { EMonster } from 'oldschooljs';

import type { Prisma } from '@prisma/client';
import type { DegradeableItem } from '../degradeableItems';
import { degradeableItems } from '../degradeableItems';
import killableMonsters, { allKillableMonsterIDs } from '../minions/data/killableMonsters';
import type { ItemBank } from '../types';

export class ChargeBank extends GeneralBank<DegradeableItem['settingsKey']> {
	constructor(initialBank?: GeneralBankType<DegradeableItem['settingsKey']>) {
		super({ initialBank, allowedKeys: degradeableItems.map(i => i.settingsKey) });
	}
}

export { XPBank } from './XPBank';

export class KCBank extends GeneralBank<EMonster> {
	constructor(initialBank?: GeneralBankType<EMonster>) {
		super({ initialBank, allowedKeys: killableMonsters.map(i => i.id) });
	}
}

export function safelyMakeKCBank(kcBankRaw: ItemBank | Prisma.JsonValue | KCBank): KCBank {
	if (kcBankRaw instanceof KCBank) {
		return kcBankRaw;
	}
	const kcBank = new KCBank();
	for (const [key, value] of Object.entries(kcBankRaw as ItemBank)) {
		if (allKillableMonsterIDs.has(Number.parseInt(key))) {
			kcBank.add(Number.parseInt(key), value);
		}
	}
	return kcBank;
}
