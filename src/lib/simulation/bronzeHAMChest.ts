import LootTable from 'oldschooljs/dist/structures/LootTable';
import { rand } from '../../util'

  var rolls = rand(1,5)

  /* Gem loots */
  const GemTable = new LootTable({ limit: 100 })
    .add('Uncut sapphire', 1, 25)
    .add('Sapphire', 1, 25)
    .add('Uncut emerald', 1, 15)
    .add('Emerald', 1, 15)
    .add('Uncut ruby', 1, 5)
    .add('Ruby', 1, 5)
    .add('Uncut diamond', 1, 5)
    .add('Diamond', 1, 5);

  const BronzeHAMChestTable = new LootTable()
    .every('Coins', [1, 400])
    .every(GemTable, rolls);

export default BronzeHAMChestTable;