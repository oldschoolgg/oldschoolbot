import { chaeldarTasks } from './tasks/chaeldarTasks';
import { duradelTasks } from './tasks/duradelTasks';
import { konarTasks } from './tasks/konarTasks';
import { mazchnaTasks } from './tasks/mazchnaTasks';
import { nieveTasks } from './tasks/nieveTasks';
import { turaelTasks } from './tasks/turaelTasks';
import { vannakaTasks } from './tasks/vannakaTasks';
import { SlayerMaster } from './types';

export const slayerMasters: SlayerMaster[] = [
	{
		id: 1,
		name: 'Turael',
		aliases: ['turael', 'tu', 'tura'],
		tasks: turaelTasks,
		basePoints: 0
	},
	{
		id: 2,
		name: 'Mazchna',
		aliases: ['mazchna', 'ma', 'maz'],
		tasks: mazchnaTasks,
		basePoints: 2,
		combatLvl: 20,
		questPoints: 1
	},
	{
		id: 3,
		name: 'Vannaka',
		aliases: ['vannaka', 'van', 'vanna'],
		tasks: vannakaTasks,
		basePoints: 4,
		combatLvl: 40
	},
	{
		id: 4,
		name: 'Chaeldar',
		aliases: ['chaeldar', 'cha', 'chael'],
		tasks: chaeldarTasks,
		basePoints: 10,
		combatLvl: 70,
		questPoints: 3
	},
	{
		id: 5,
		name: 'Konar quo Maten',
		aliases: ['konar quo maten', 'konar', 'kon', 'kona'],
		tasks: konarTasks,
		bossTasks: true,
		basePoints: 18,
		combatLvl: 75
	},
	{
		id: 6,
		name: 'Nieve',
		aliases: ['nieve', 'steve', 'nie', 'niev'],
		tasks: nieveTasks,
		bossTasks: true,
		basePoints: 15,
		combatLvl: 85
	},
	{
		id: 7,
		name: 'Duradel',
		aliases: ['duradel', 'dur', 'dura', 'duradaddy'],
		tasks: duradelTasks,
		bossTasks: true,
		basePoints: 15,
		combatLvl: 100,
		slayerLvl: 50
	}
];
