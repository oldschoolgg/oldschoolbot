import Items from '../structures/Items';

export default function itemID(name: string): number {
	const item = Items.get(name);
       if (!item) {
               throw new Error(`ERROR: ${JSON.stringify(name)} doesn't exist.`);
       }
	return item.id;
}
