import { bossTasks } from '@/lib/slayer/tasks/bossTasks.js';
import { chaeldarTasks } from '@/lib/slayer/tasks/chaeldarTasks.js';
import { duradelTasks } from '@/lib/slayer/tasks/duradelTasks.js';
import { konarTasks } from '@/lib/slayer/tasks/konarTasks.js';
import { krystiliaTasks } from '@/lib/slayer/tasks/krystiliaTasks.js';
import { mazchnaTasks } from '@/lib/slayer/tasks/mazchnaTasks.js';
import { nieveTasks } from '@/lib/slayer/tasks/nieveTasks.js';
import { turaelTasks } from '@/lib/slayer/tasks/turaelTasks.js';
import { vannakaTasks } from '@/lib/slayer/tasks/vannakaTasks.js';
import type { AssignableSlayerTask } from '@/lib/slayer/types.js';

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
