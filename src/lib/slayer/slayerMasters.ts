import { MonsterSlayerMaster } from 'oldschooljs';

import { chaeldarTasks } from './tasks/chaeldarTasks';
import { duradelTasks } from './tasks/duradelTasks';
import { konarTasks } from './tasks/konarTasks';
import { krystiliaTasks } from './tasks/krystiliaTasks';
import { mazchnaTasks } from './tasks/mazchnaTasks';
import { nieveTasks } from './tasks/nieveTasks';
import { turaelTasks } from './tasks/turaelTasks';
import { vannakaTasks } from './tasks/vannakaTasks';
import type { SlayerMaster } from './types';

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
