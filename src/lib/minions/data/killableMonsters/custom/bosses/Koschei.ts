import { Monsters } from 'oldschooljs';
import { LootTable } from 'oldschooljs';

import setCustomMonster from '../../../../../util/setCustomMonster';

export const koscheiTable = new LootTable().add('Fremennik blade');
export const KOSCHEI_ID = 234_262;
setCustomMonster(KOSCHEI_ID, 'Koschei the deathless', koscheiTable, Monsters.GeneralGraardor, {
	id: KOSCHEI_ID,
	name: 'Koschei the deathless',
	aliases: ['koschei the deathless', 'koschei', 'ko']
});

const Koschei = Monsters.find(mon => mon.name === 'Koschei the deathless')!;

export default Koschei;
