import { Items } from 'oldschooljs';

export default function itemID(name: string) {
	const osItem = Items.get(name);
	if (!osItem) throw `That item doesnt exist.`;

	return osItem.id;
}
