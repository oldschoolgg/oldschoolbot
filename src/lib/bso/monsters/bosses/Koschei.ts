import { EBSOMonster } from '@/lib/bso/EBSOMonster.js';
import { setCustomMonster } from '@/lib/bso/monsters/setCustomMonster.js';

import { LootTable, Monsters } from 'oldschooljs';

const koscheiTable = new LootTable().add('Fremennik blade');

setCustomMonster(EBSOMonster.KOSCHEI, 'Koschei the deathless', koscheiTable, Monsters.GeneralGraardor, {
	id: EBSOMonster.KOSCHEI,
	name: 'Koschei the deathless',
	aliases: ['koschei the deathless', 'koschei', 'ko']
});

export const Koschei = Monsters.find(mon => mon.name === 'Koschei the deathless')!;
