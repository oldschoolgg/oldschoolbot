import { keyCrates } from '../../keyCrates';
import { Buyable } from './buyables';

export const keyCrateBuyables: Buyable[] = [];

for (const crate of keyCrates) {
	keyCrateBuyables.push({
		name: crate.key.name,
		gpCost: crate.keyCostGP,
		ironmanPrice: Math.floor(crate.keyCostGP / 10)
	});
}
