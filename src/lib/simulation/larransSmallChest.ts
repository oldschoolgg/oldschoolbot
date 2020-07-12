import LootTable from 'oldschooljs/dist/structures/LootTable';

  const LarransSmallChestTable = new LootTable()
    .add('Uncut diamond', 21, 5)
    .add('Uncut ruby', [24, 29], 5)
    .add('Coal', [352, 443], 5)
    .add('Coins', [74000, 75000], 4)
    .add('Gold ore', [100, 150], 4)
    .add('Dragon arrowtips', [49, 182], 4)
    .add('Iron ore', [300, 450], 3)
    .add('Rune full helm', 3, 3)
    .add('Rune platebody', 2, 3)
    .add('Rune platelegs', 2, 3)
    .add('Runite ore', [10, 15], 2)
    .add('Steel bar', [250, 350], 2)
    .add('Magic logs', [80, 120], 2)
    .add('Dragon dart tip', 80, 2)
    .add('Palm tree seed', [2, 4], 1)
    .add('Magic seed', [1, 3], 1)
    .add('Celastrus seed', [2, 4], 1)
    .add('Dragonfruit tree seed', [1, 3], 1)
    .add('Redwood tree seed', 1, 1)
    .add('Torstol seed', 3, 1)
    .add('Snapdragon seed', 3, 1)
    .add('Ranarr seed', [2, 4], 1)
    .add('Pure essence', [3359, 5815], 1);
    
export default LarransSmallChestTable;