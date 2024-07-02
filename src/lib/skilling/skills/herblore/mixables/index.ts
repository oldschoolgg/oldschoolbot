import type { Mixable } from '../../../types';
import { barbMixes } from './barbMixes';
import Crush from './crush';
import Grimy from './grimy';
import Potions from './potions';
import Tar from './tar';
import Unf from './unfinishedPotions';

const mixables: Mixable[] = [...Grimy, ...Unf, ...Potions, ...Crush, ...Tar, ...barbMixes];

export default mixables;
