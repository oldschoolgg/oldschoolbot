import { GeneralBank, type GeneralBankType } from '@oldschoolgg/toolkit/structures';
import type { Prisma } from '@prisma/client';
import type { EMonster, ItemBank } from 'oldschooljs';

import { allKillableMonsterIDs } from '../minions/data/killableMonsters';

export class KCBank extends GeneralBank<EMonster> {
	constructor(initialBank?: GeneralBankType<EMonster>) {
		super({ initialBank, allowedKeys: Array.from(allKillableMonsterIDs) });
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
