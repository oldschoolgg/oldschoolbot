import Items from '../structures/Items';

export default function itemID(name: string): number {
	const item = Items.get(name);
	if (!item) {
		throw new Error(`ERROR: ${JSON.stringify(name)} doesnt exist.`);
	}
	return item.id;
}
