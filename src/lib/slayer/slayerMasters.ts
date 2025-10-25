import { MonsterSlayerMaster } from 'oldschooljs';

import { chaeldarTasks } from '@/lib/slayer/tasks/chaeldarTasks.js';
import { duradelTasks } from '@/lib/slayer/tasks/duradelTasks.js';
import { konarTasks } from '@/lib/slayer/tasks/konarTasks.js';
import { krystiliaTasks } from '@/lib/slayer/tasks/krystiliaTasks.js';
import { mazchnaTasks } from '@/lib/slayer/tasks/mazchnaTasks.js';
import { nieveTasks } from '@/lib/slayer/tasks/nieveTasks.js';
import { turaelTasks } from '@/lib/slayer/tasks/turaelTasks.js';
import { vannakaTasks } from '@/lib/slayer/tasks/vannakaTasks.js';
import type { SlayerMaster } from '@/lib/slayer/types.js';

export const slayerMasters: SlayerMaster[] = [
	{
		id: 1,
		name: 'Turael',
		aliases: ['turael', 'tu', 'tura'],
		tasks: turaelTasks,
		basePoints: 0,
		osjsEnum: MonsterSlayerMaster.Turael
	},
	{
		id: 2,
		name: 'Mazchna',
		aliases: ['mazchna', 'ma', 'maz'],
		tasks: mazchnaTasks,
		basePoints: 2,
		combatLvl: 20,
		questPoints: 1,
		osjsEnum: MonsterSlayerMaster.Mazchna
	},
	{
		id: 3,
		name: 'Vannaka',
		aliases: ['vannaka', 'van', 'vanna'],
		tasks: vannakaTasks,
		basePoints: 4,
		combatLvl: 40,
		osjsEnum: MonsterSlayerMaster.Vannaka
	},
	{
		id: 4,
		name: 'Chaeldar',
		aliases: ['chaeldar', 'cha', 'chael'],
		tasks: chaeldarTasks,
		basePoints: 10,
		combatLvl: 70,
		questPoints: 3,
		osjsEnum: MonsterSlayerMaster.Chaeldar
	},
	{
		id: 5,
		name: 'Konar quo Maten',
		aliases: ['konar quo maten', 'konar', 'kon', 'kona'],
		tasks: konarTasks,
		bossTasks: true,
		basePoints: 18,
		combatLvl: 75,
		osjsEnum: MonsterSlayerMaster.Konar
	},
	{
		id: 6,
		name: 'Nieve',
		aliases: ['nieve', 'steve', 'nie', 'niev'],
		tasks: nieveTasks,
		bossTasks: true,
		basePoints: 15,
		combatLvl: 85,
		osjsEnum: MonsterSlayerMaster.Nieve
	},
	{
		id: 7,
		name: 'Duradel',
		aliases: ['duradel', 'dur', 'dura', 'duradaddy'],
		tasks: duradelTasks,
		bossTasks: true,
		basePoints: 15,
		combatLvl: 100,
		slayerLvl: 50,
		osjsEnum: MonsterSlayerMaster.Duradel
	},
	{
		id: 8,
		name: 'Krystilia',
		aliases: ['krystilia', 'wildy slayer', 'wilderness slayer'],
		tasks: krystiliaTasks,
		basePoints: 25,
		osjsEnum: MonsterSlayerMaster.Krystilia
	}
];
