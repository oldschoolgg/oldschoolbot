import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';
import { ElderCustodianStalkerPreTable } from '../low/a-f/ElderCustodianStalker.js';

const AncientCustodianTable = new LootTable()
    .every('Big bones')
    .every(ElderCustodianStalkerPreTable, 3)
    .tertiary(400, 'Long bone')
    .tertiary(650, 'Antler guard')
    .tertiary(5013, 'Curved bone')

    /* Superior Slayer tertiary */
    .tertiary(144, 'Mist battlestaff')
    .tertiary(144, 'Dust battlestaff')
    .tertiary(504, 'Eternal gem')
    .tertiary(504, 'Imbued heart');

export default new SimpleMonster({
    id: 14520,
    name: 'Ancient Custodian',
    table: AncientCustodianTable,
    aliases: ['ancient custodian']
});
