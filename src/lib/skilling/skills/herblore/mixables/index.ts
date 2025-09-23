import type { Mixable } from '@/lib/skilling/types.js';
import { barbMixes } from './barbMixes.js';
import { bsoMixables } from './bsoMixables.js';
import Crush from './crush.js';
import Grimy from './grimy.js';
import Potions from './potions.js';
import Tar from './tar.js';
import Unf from './unfinishedPotions.js';

const mixables: Mixable[] = [...Grimy, ...Unf, ...Potions, ...Crush, ...Tar, ...bsoMixables, ...barbMixes];

export default mixables;

export const herbloreCL = mixables.map(i => i.item.id);
