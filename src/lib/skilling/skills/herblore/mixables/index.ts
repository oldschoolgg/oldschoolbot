import { Mixable } from '../../../types';
import Crush from './crush';
import Grimy from './grimy';
import Mixes from './barbMixes';
import Potions from './potions';
import Tar from './tar';
import Unf from './unfinishedPotions';

const mixables: Mixable[] = [...Grimy, ...Unf, ...Potions, ...Crush, ...Tar, ...Mixes];

export default mixables;
