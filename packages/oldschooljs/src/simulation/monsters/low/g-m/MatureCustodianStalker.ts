import { GemTable, RareDropTable } from '@/simulation/subtables/RareDropTable.js';
import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const MatureCustodianStalkerPreTable = new LootTable()
    /* Runes and ammunition*/
    .add('Cannonball', [15, 30], 15) // 1/7.133
    .add('Air rune', 150, 12) // 1/8.917
    .add('Fire rune', 100, 12) // 1/8.917
    .add('Rune arrow', [10, 25], 10) // 1/10.7
    .add('Death rune', [25, 40], 6) // 1/17.83

    /* Resources */
    .add('Pure essence', 20, 10) // 1/10.7
    .add('Monkfish', [2, 3], 8) // 1/13.38
    .add('Broken antler', 1, 7) // 1/16
    .add('Mithril bar', [5, 10], 5) // 1/21.4
    .add('Raw beef', 1, 4) // 1/26.75
    .add('Huasca seed', 1, 1) // 1/107

    /* Coins */
    .add('Coins', [800, 1050], 10) // 1/10.7

    /* Gem drop table */
    .add(GemTable, 1, 6) // 6/107
    .add(RareDropTable, 1, 1); // 1/107

const MatureCustodianStalkerTable = new LootTable()
    .every('Big bones')
    .every(MatureCustodianStalkerPreTable)

    /* Tertiary */
    .tertiary(400, 'Long bone')
    .tertiary(800, 'Antler guard')
    .tertiary(5013, 'Curved bone');

export default new SimpleMonster({
    id: 14703,
    name: 'Mature custodian stalker',
    table: MatureCustodianStalkerTable,
    aliases: ['mature stalker', 'mature custodian stalker']
});