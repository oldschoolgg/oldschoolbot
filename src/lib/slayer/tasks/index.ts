import type { AssignableSlayerTask } from '@/lib/slayer/types.js';
import { bossTasks } from './bossTasks.js';
import { chaeldarTasks } from './chaeldarTasks.js';
import { duradelTasks } from './duradelTasks.js';
import { konarTasks } from './konarTasks.js';
import { krystiliaTasks } from './krystiliaTasks.js';
import { mazchnaTasks } from './mazchnaTasks.js';
import { nieveTasks } from './nieveTasks.js';
import { turaelTasks } from './turaelTasks.js';
import { vannakaTasks } from './vannakaTasks.js';

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
