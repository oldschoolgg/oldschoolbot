import { Castable } from '../../../types';
import Standard from './Standard';
import Arceuus from './Arceuus';
import Lunar from './Lunar';

const castables: Castable[] = [...Standard, ...Arceuus, ...Lunar];

export default castables;
