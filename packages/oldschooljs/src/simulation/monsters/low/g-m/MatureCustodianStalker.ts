import { GemTable, RareDropTable } from '@/simulation/subtables/RareDropTable.js';
import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const MatureCustodianStalkerPreTable = new LootTable()
    /* Runes and ammunition*/
    .add('Cannonball', [15, 30], 15)
    .add('Air rune', 150, 12)
    .add('Fire rune', 100, 12)
    .add('Rune arrow', [10, 25], 10)
    .add('Death rune', [25, 40], 6)

    /* Resources */
    .add('Pure essence', 20, 10)
    .add('Monkfish', [2, 3], 8)
    .add('Broken antler', 1, 7)
    .add('Mithril bar', [5, 10], 5)
    .add('Raw beef', 1, 4)
    .add('Huasca seed', 1, 1)

    /* Coins */
    .add('Coins', [800, 1050], 10)

    /* Gem drop table */
    .add(GemTable, 1, 6)
    .add(RareDropTable, 1, 1);

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