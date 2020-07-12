import LootTable from 'oldschooljs/dist/structures/LootTable';

const FoodTable = new LootTable(({ limit: 100 }))
    .add('Egg potato', 4, 60)
    .add('Shark', 4, 35)
    .add(
        [
            ['Saradomin brew(2)', 3],
            ['Super restore(2)', 1],
        ],
        1,
        5
    );

const PotionTable = new LootTable({ limit: 100 })
    .add(
        [
            ['Super attack(2)', 1],
            ['Super strength(2)', 1],
            ['Super defence(2)', 1]
        ],
        1,
        34
    )
    .add(
        [
            ['Super defence(2)', 1],
            ['Ranging potion(2)', 1],
        ],
        1,
        34
    )
    .add('Super restore(3)', 2, 16)
    .add('Prayer potion(3)', 2, 16);

const GrubbyChestTable = new LootTable()
    /* Food roll */
    .every(FoodTable, 2)

    /* Potion roll */
    .every(PotionTable, 1)

    /* Main roll */
    .add('Grimy toadflax', 10, 7)
    .add('Crystal key', 1, 6)
    .add('Law rune', 200, 10)
    .add('Death rune', 200, 10)
    .add('Astral rune', 200, 10)
    .add('Dragon dart tip', 50, 3)
    .add('Dragon arrowtips', 100, 2)
    .add('Blood rune', 200, 10)
    .add('Dragon bones', 10, 6)
    .add('Red dragonhide', 10, 6)
    .add('Grimy ranarr weed', 10, 7)
    .add('Grimy snapdragon', 10, 7)
    .add('Grimy torstol', 5, 7)
    .add('Coins', 10000, 9);
    
export default GrubbyChestTable;