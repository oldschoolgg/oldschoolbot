import { Task } from '../../../types';
import bossTasks from './bossTasks';
import chaeldarTasks from './chaeldarTasks';
import duradelTasks from './duradelTasks';
import konarTasks from './konarTasks';
import krystiliaTasks from './krystiliaTasks';
import mazchnaTasks from './mazchnaTasks';
import nieveTasks from './nieveTasks';
import turaelTasks from './turaelTasks';
import vannakaTasks from './vannakaTasks';

const allTasks: Task[] = [
	...bossTasks,
	...chaeldarTasks,
	...duradelTasks,
	...konarTasks,
	...krystiliaTasks,
	...mazchnaTasks,
	...nieveTasks,
	...turaelTasks,
	...vannakaTasks
];

export default allTasks;
