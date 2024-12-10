import type { Mixable } from '../../../types';
import { barbMixes } from './barbMixes';
import { bsoMixables } from './bsoMixables';
import Crush from './crush';
import Grimy from './grimy';
import Potions from './potions';
import Tar from './tar';
import Unf from './unfinishedPotions';

const mixables: Mixable[] = [...Grimy, ...Unf, ...Potions, ...Crush, ...Tar, ...bsoMixables, ...barbMixes];

export default mixables;

export const herbloreCL = mixables.map(i => i.item.id);
