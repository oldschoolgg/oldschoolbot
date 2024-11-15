import type { AssignableSlayerTask } from '../types';
import { bossTasks } from './bossTasks';
import { chaeldarTasks } from './chaeldarTasks';
import { duradelTasks } from './duradelTasks';
import { konarTasks } from './konarTasks';
import { krystiliaTasks } from './krystiliaTasks';
import { mazchnaTasks } from './mazchnaTasks';
import { nieveTasks } from './nieveTasks';
import { turaelTasks } from './turaelTasks';
import { vannakaTasks } from './vannakaTasks';

export const allSlayerTasks: AssignableSlayerTask[] = [
	...bossTasks,
	...chaeldarTasks,
	...konarTasks,
	...mazchnaTasks,
	...nieveTasks,
	...turaelTasks,
	...vannakaTasks,
	...duradelTasks,
	...krystiliaTasks
];

export const allSlayerMonsters = allSlayerTasks.map(m => m.monster);
export const allSlayerMonstersIDs = new Set(allSlayerMonsters.map(m => m.id));
