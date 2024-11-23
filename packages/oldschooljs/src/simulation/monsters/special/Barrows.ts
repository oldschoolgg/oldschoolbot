import { roll } from 'e';

import Bank from '../../../structures/Bank';
import LootTable from '../../../structures/LootTable';
import Monster from '../../../structures/Monster';

const BarrowsTable = new LootTable();

[
	"Ahrim's hood",
	"Ahrim's robetop",
	"Ahrim's robeskirt",
	"Ahrim's staff",

	"Dharok's helm",
	"Dharok's platebody",
	"Dharok's platelegs",
	"Dharok's greataxe",

	"Guthan's helm",
	"Guthan's platebody",
	"Guthan's chainskirt",
	"Guthan's warspear",

	"Karil's coif",
	"Karil's leathertop",
	"Karil's leatherskirt",
	"Karil's crossbow",

	"Torag's helm",
	"Torag's platebody",
	"Torag's platelegs",
	"Torag's hammers",

	"Verac's helm",
	"Verac's brassard",
	"Verac's plateskirt",
	"Verac's flail"
].map(item => BarrowsTable.add(item));

const OtherTable = new LootTable()
	.add('Coins', [2, 760], 380)
	.add('Mind rune', [381, 504], 125)
	.add('Chaos rune', [168, 210], 125)
	.add('Death rune', [105, 124], 125)
	.add('Bolt rack', [35, 40], 125)
	.add('Blood rune', [55, 66], 125)
	.add(new LootTable().add('Loop half of key').add('Tooth half of key'), 1, 6)
	.add('Dragon med helm');

const ClueTable = new LootTable().tertiary(34, 'Clue scroll (elite)');

const NUMBER_OF_BROTHERS = 6;

export class Barrows extends Monster {
	public kill(quantity = 1): Bank {
		const loot = new Bank();

		for (let i = 0; i < quantity; i++) {
			ClueTable.roll(1, { targetBank: loot });

			// We use a set to track items received, you cannot get
			// the same item twice per chest.
			const barrowsItemsThisKill = new Set();
			// You get 1 initial roll, then +6 for 6 brothers killed.
			for (let x = 0; x < NUMBER_OF_BROTHERS + 1; x++) {
				// 1 in (450 - (58 * Number of Brothers Killed))
				if (roll(450 - 58 * NUMBER_OF_BROTHERS)) {
					let [barrowsItem] = BarrowsTable.roll().items()[0];
					while (barrowsItemsThisKill.has(barrowsItem.id)) {
						[[barrowsItem]] = BarrowsTable.roll().items();
					}
					barrowsItemsThisKill.add(barrowsItem.id);
					loot.add(barrowsItem.id);
				} else {
					OtherTable.roll(1, { targetBank: loot });
				}
			}
		}

		return loot;
	}
}

// Uses NPC id for Dharoks
export default new Barrows({
	id: 1673,
	name: 'Barrows',
	aliases: ['barrows'],
	allItems: [...BarrowsTable.allItems, ...OtherTable.allItems]
});
