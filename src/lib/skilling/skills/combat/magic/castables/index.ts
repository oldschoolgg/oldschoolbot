import { Castable } from '../../../../types';
import Ancient from './Ancient';
import Arceuus from './Arceuus';
import Lunar from './Lunar';
import Standard from './Standard';

const castables: Castable[] = [...Standard, ...Arceuus, ...Lunar, ...Ancient];

export default castables;
