import { Task } from 'klasa';
import { Items } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';
import { cleanString } from '../util';
import { itemNameMap } from 'oldschooljs/dist/structures/Items';
import getOSItem from '../lib/util/getOSItem';

function setCustomItem(id: number, name: string, baseItem: Item, newItemData?: Partial<Item>) {
	Items.set(id, {
		...baseItem,
		...newItemData,
		name,
		id
	});
	const cleanName = cleanString(name);
	itemNameMap.set(cleanName, id);
}
function initCustomItems() {
	setCustomItem(19939, 'Untradeable Mystery Box', getOSItem('Mystery box'));
	setCustomItem(6199, 'Tradeable Mystery Box', getOSItem('Mystery box'));
	setCustomItem(3062, 'Pet Mystery Box', getOSItem('Mystery box'));
	setCustomItem(3713, 'Holiday Mystery Box', getOSItem('Mystery box'));
	setCustomItem(5507, 'Remy', getOSItem("Chef's hat"));
	setCustomItem(3714, 'Shelldon', getOSItem('Leather gloves'));
	// duplicated daily items
	setCustomItem(11705, 'Yellow beach boxing gloves', getOSItem(11705));
	setCustomItem(11706, 'Purple beach boxing gloves', getOSItem(11706));
	// ornament items
	setCustomItem(12765, 'Dark bow (green)', getOSItem(12765));
	setCustomItem(12766, 'Dark bow (blue)', getOSItem(12766));
	setCustomItem(12767, 'Dark bow (yellow)', getOSItem(12767));
	setCustomItem(12768, 'Dark bow (white)', getOSItem(12768));
	setCustomItem(12795, 'Steam battlestaff (or)', getOSItem(12795));
	setCustomItem(21198, 'Lava battlestaff (or)', getOSItem(21198));
	setCustomItem(12848, 'Granite maul (or)', getOSItem(12848));
	setCustomItem(23330, 'Rune scimitar (guthix)', getOSItem(23330));
	setCustomItem(23332, 'Rune scimitar (saradomin)', getOSItem(23332));
	setCustomItem(23334, 'Rune scimitar (zamorak)', getOSItem(23334));
	setCustomItem(12806, 'Malediction ward (or)', getOSItem(12806));
	setCustomItem(12807, 'Odium ward (or)', getOSItem(12807));
	setCustomItem(12797, 'Dragon pickaxe (upgraded)', getOSItem(12797));
}

export default class extends Task {
	async init() {
		await Items.fetchAll();
		initCustomItems();
	}

	async run() {
		if (!this.client.production) return;
		this.syncItems();
	}

	async syncItems() {
		this.client.console.debug('Fetching all OSJS items.');
		await Items.fetchAll();
		initCustomItems();
	}
}
