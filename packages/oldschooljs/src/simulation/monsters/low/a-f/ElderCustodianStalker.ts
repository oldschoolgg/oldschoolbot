import { GemTable, RareDropTable } from '@/simulation/subtables/RareDropTable.js';
import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const ElderCustodianStalkerPreTable = new LootTable()
    /* Runes and ammunition*/
    .add('Cannonball', [20, 30], 15) // 1/8.267
    .add('Air rune', 200, 12) // 1/10.33
    .add('Fire rune', 150, 12) // 1/10.33
    .add('Rune arrow', [20, 35], 12) // 1/10.33
    .add('Death rune', [40, 50], 6) // 1/20.67

    /* Resources */
    .add('Shark', [2, 3], 12) // 1/10.33
    .add('Pure essence', 30, 12) // 1/10.33
    .add('Mithril bar', [10, 15], 6) // 1/20.67
    .add('Broken antler', 1, 4) // 1/31
    .add('Raw beef', 1, 4) // 1/31
    .add('Huasca seed', [2, 3], 1) // 1/124

    /* Coins */
    .add('Coins', [1180, 3000], 19) // 1/6.526
    .add("Alchemist's signet", 1, 2) // 1/62

    /* Gem drop table */
    .add(GemTable, 1, 6) // 6/124
    .add(RareDropTable, 1, 1); // 1/124

const ElderCustodianStalkerTable = new LootTable()
    .every('Big bones')
    .every(ElderCustodianStalkerPreTable)

    /* Tertiary */
    .tertiary(400, 'Long bone')
    .tertiary(650, 'Antler guard')
    .tertiary(5013, 'Curved bone');

export default new SimpleMonster({
    id: 14704,
    name: 'Mature custodian stalker',
    table: ElderCustodianStalkerTable,
    aliases: ['mature stalker', 'mature custodian stalker']
});