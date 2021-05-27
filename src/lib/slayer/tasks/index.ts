import { AssignableSlayerTask } from '../types';
import { bossTasks } from './bossTasks';
import { chaeldarTasks } from './chaeldarTasks';
import { duradelTasks } from './duradelTasks';
import { konarTasks } from './konarTasks';
import { mazchnaTasks } from './mazchnaTasks';
import { nieveTasks } from './nieveTasks';
import { turaelTasks } from './turaelTasks';
import { vannakaTasks } from './vannakaTasks';

const allTasks: AssignableSlayerTask[] = [
	...bossTasks,
	...chaeldarTasks,
	...konarTasks,
	...mazchnaTasks,
	...nieveTasks,
	...turaelTasks,
	...vannakaTasks,
	...duradelTasks
];

export default allTasks;
