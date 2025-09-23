import Adamant from './adamant.js';
import Bronze from './bronze.js';
import BSOSmithables from './bsoSmithables.js';
import Dwarven from './dwarven.js';
import Gold from './gold.js';
import Gorajan from './gorajan.js';
import Iron from './iron.js';
import Mithril from './mithril.js';
import Rune from './rune.js';
import Silver from './silver.js';
import Steel from './steel.js';

const smithables = [
	...Bronze,
	...Iron,
	...Silver,
	...Steel,
	...Gold,
	...Mithril,
	...Adamant,
	...Rune,
	...Dwarven,
	...Gorajan,
	...BSOSmithables
];

export default smithables;
export const smithingCL = smithables.map(i => i.id);
