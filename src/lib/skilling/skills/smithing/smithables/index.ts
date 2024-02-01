import Adamant from './adamant';
import Bronze from './bronze';
import Dwarven from './dwarven';
import Gold from './gold';
import Gorajan from './gorajan';
import Iron from './iron';
import Mithril from './mithril';
import Rune from './rune';
import Silver from './silver';
import Steel from './steel';

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
	...Gorajan
];

export default smithables;
export const smithingCL = smithables.map(i => i.id);
