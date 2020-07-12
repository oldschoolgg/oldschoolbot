import LootTable from 'oldschooljs/dist/structures/LootTable';
import { rand } from '../../util'

  var rolls = rand(1,5)

  /* Gem loots */
  const GemTable = new LootTable({ limit: 100 })
    .add('Uncut sapphire', 1, 20)
    .add('Sapphire', 1, 20)
    .add('Uncut emerald', 1, 10)
    .add('Emerald', 1, 10)
    .add('Uncut ruby', 1, 10)
    .add('Ruby', 1, 10)
    .add('Uncut diamond', 1, 10)
    .add('Diamond', 1, 10);

  const SteelHAMChestTable = new LootTable()
    .every('Coins', [400, 800])
    .every(GemTable, rolls);

export default SteelHAMChestTable;