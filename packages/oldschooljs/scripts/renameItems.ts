/**
 * Renames items by manually updating their names in the item_data.json file
 */
import { readFileSync, writeFileSync } from 'node:fs';

const itemRenames = [
	// Item ID, New Name
	[2978, 'Chompy bird hat (ogre bowman)'],
	[2979, 'Chompy bird hat (bowman)'],
	[2980, 'Chompy bird hat (ogre yeoman)'],
	[2981, 'Chompy bird hat (yeoman)'],
	[2982, 'Chompy bird hat (ogre marksman)'],
	[2983, 'Chompy bird hat (marksman)'],
	[2984, 'Chompy bird hat (ogre woodsman)'],
	[2985, 'Chompy bird hat (woodsman)'],
	[2986, 'Chompy bird hat (ogre forester)'],
	[2987, 'Chompy bird hat (forester)'],
	[2988, 'Chompy bird hat (ogre bowmaster)'],
	[2989, 'Chompy bird hat (bowmaster)'],
	[2990, 'Chompy bird hat (ogre expert)'],
	[2991, 'Chompy bird hat (expert)'],
	[2992, 'Chompy bird hat (ogre dragon archer)'],
	[2993, 'Chompy bird hat (dragon archer)'],
	[2994, 'Chompy bird hat (expert ogre dragon archer)'],
	[2995, 'Chompy bird hat (expert dragon archer)']
];

async function renameItems() {
	const itemData = JSON.parse(readFileSync('./src/assets/item_data.json', 'utf-8'));

	for (const [id, newName] of itemRenames) {
		if (!itemData[id]) {
			throw new Error(`Item with ID ${id} does not exist in item_data.json`);
		}

		if (itemData[id].name === newName) {
			console.log(`Item ID ${id} already has the name "${newName}". Skipping.`);
			continue;
		}
		console.log(`Renaming item ID ${id} from "${itemData[id].name}" to "${newName}"`);
		itemData[id].name = newName;
	}

	writeFileSync('./src/assets/item_data.json', JSON.stringify(itemData, null, 2), 'utf-8');
}

renameItems();
