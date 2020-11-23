import { Castable } from '../../../../types';
import Lunar from '../Lunar';
import Standard from '../Standard';
import Ancient from './Ancient';
import Arceuus from './Arceuus';

const castables: Castable[] = [...Standard, ...Arceuus, ...Lunar, ...Ancient];

export default castables;
