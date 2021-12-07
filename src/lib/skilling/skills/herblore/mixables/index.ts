import { Mixable } from '../../../types';
import { bsoMixables } from './bsoMixables';
import Crush from './crush';
import Grimy from './grimy';
import Potions from './potions';
import Tar from './tar';
import Unf from './unfinishedPotions';

const mixables: Mixable[] = [...Grimy, ...Unf, ...Potions, ...Crush, ...Tar, ...bsoMixables];

export default mixables;
