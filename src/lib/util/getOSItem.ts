import { Items } from 'oldschooljs';
import cleanItemName from './cleanItemName';
import { Item } from 'oldschooljs/dist/meta/types';

export default function getOSItem(itemName: string): Item {
	const osItem = Items.get(cleanItemName(itemName)) as Item | undefined;
	if (!osItem) throw `That item doesnt exist.`;
	return osItem;
}
