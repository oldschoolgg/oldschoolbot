import { randArrItem } from 'e';
import { LootTable } from 'oldschooljs';

export const PUMPKINHEAD_ID = 93_898_458;

export const pumpkinHeadUniqueTable = new LootTable()
	.add('Haunted cloak', 1, 2)
	.add("Pumpkinhead's headbringer")
	.add('Haunted amulet')
	.add('Haunted gloves', 1, 2)
	.add('Haunted boots', 1, 2)
	.add("Pumpkinhead's pumpkin head")
	.tertiary(1200, 'Mini Pumpkinhead');

export const PUMPKINHEAD_HEALING_NEEDED = 60;
const pumpkinHeadDescriptors = [
	['Head', 'Skull', 'Body', 'Minion', 'Limb'],
	['Crushing', 'Slashing', 'Chopping', 'Destroying', 'Stomping', 'Ripping', 'Slicing', 'Stabbing']
];

export function getPHeadDescriptor() {
	const first = randArrItem(pumpkinHeadDescriptors[0]);
	const second = randArrItem(pumpkinHeadDescriptors[1]);
	return `${first}-${second}`;
}

export function numberOfPHeadItemsInCL(user: MUser) {
	let amount = 0;
	const { cl } = user;
	for (const item of pumpkinHeadUniqueTable.allItems) {
		if (cl.has(item)) {
			amount++;
		}
	}
	return amount;
}
export const treatTable = new LootTable()
	.add('Candy teeth', 1, 350)
	.add('Toffeet', 1, 240)
	.add('Chocolified skull', 1, 240)
	.add('Rotten sweets', 1, 240)
	.add('Hairyfloss', 1, 240)
	.add('Eyescream', 1, 180)
	.add('Goblinfinger soup', 1, 180)
	.add("Choc'rock", 1, 7);

export const pumpkinHeadNonUniqueTable = new LootTable().every(treatTable, [1, 6]);
