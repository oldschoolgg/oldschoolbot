import type { Mixable } from '../../../types.js';
import { barbMixes } from './barbMixes.js';
import Crush from './crush.js';
import Grimy from './grimy.js';
import Potions from './potions.js';
import Tar from './tar.js';
import Unf from './unfinishedPotions.js';

const mixables: Mixable[] = [...Grimy, ...Unf, ...Potions, ...Crush, ...Tar, ...barbMixes];

export default mixables;
