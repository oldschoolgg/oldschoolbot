import LootTable from 'oldschooljs/dist/structures/LootTable';

const BoneTable = new LootTable({ limit: 10000 })
    .add('Zogre bones', 1, 4996)
    .add('Fayrg bones', 1, 1086)
    .add('Raurg bones', 1, 766)
    .add('Ourg bones', 1, 375);

const OgreCoffinTable = new LootTable()
    /* Bone roll */
    .every(BoneTable)

    /* Loot roll */
    .add('Coins', [6, 20], 32)
    .add('Bronze axe', 1, 16)
    .add('Iron axe', 1, 16)
    .add('Steel axe', 1, 16)
    .add('Bronze pickaxe', 1, 16)
    .add('Iron pickaxe', 1, 16)
    .add('Steel pickaxe', 1, 16)
    .add('Bronze dagger', 1, 16)
    .add('Iron dagger', 1, 16)
    .add('Steel dagger', 1, 16)
    .add('Bronze nails', 1, 16)
    .add('Iron nails', 1, 16)
    .add('Steel nails', 1, 16)
    .add('Black nails', 1, 16)
    .add('Knife', 1, 16)
    .add('Rusty sword', 1, 8)
    .add('Damaged armour', 1, 8)
    .add('Leather body', 1, 8)
    .add('Tinderbox', 1, 8)
    .add('Buttons', 1, 4)
    .add('Uncut opal', 1, 4)
    .add('Uncut jade', 1, 4)
    .add('Grimy lantadyme', 1, 4)
    .add('Clue scroll (easy)', 1, 1);

export default OgreCoffinTable;