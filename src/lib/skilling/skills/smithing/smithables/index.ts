import Adamant from './adamant';
import Bronze from './bronze';
import Dwarven from './dwarven';
import Gold from './gold';
import Gorajan from './gorajan';
import Iron from './iron';
import Mithril from './mithril';
import Rune from './rune';
import Steel from './steel';

const smithables = [...Adamant, ...Bronze, ...Iron, ...Mithril, ...Rune, ...Steel, ...Dwarven, ...Gorajan, ...Gold];

export default smithables;
export const smithingCL = smithables.map(i => i.id);
