import { Mixable } from '../../../types';
import Crush from './crush';
import Grimy from './grimy';
import Potions from './potions';
import Tar from './tar';
import Unf from './unfinishedPotions';

const mixables: Mixable[] = [...Grimy, ...Unf, ...Potions, ...Crush, ...Tar];

export default mixables;
