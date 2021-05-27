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
		name: 'Turael',
		aliases: ['turael', 'tu', 'tur', 'tura', 'turry'],
		tasks: turaelTasks,
		masterId: 1,
		basePoints: 0
	},
	{
		name: 'Mazchna',
		aliases: ['mazchna', 'ma', 'maz'],
		tasks: mazchnaTasks,
		masterId: 3,
		basePoints: 2,
		combatLvl: 20,
		questPoints: 1
	},
	{
		name: 'Vannaka',
		aliases: ['vannaka', 'va', 'van', 'vanna'],
		tasks: vannakaTasks,
		masterId: 4,
		basePoints: 4,
		combatLvl: 40
	},
	{
		name: 'Chaeldar',
		aliases: ['chaeldar', 'ch', 'cha', 'chael'],
		tasks: chaeldarTasks,
		masterId: 5,
		basePoints: 10,
		combatLvl: 70,
		questPoints: 3
	},
	{
		name: 'Konar quo Maten',
		aliases: ['konar quo maten', 'konar', 'ko', 'kon', 'kona'],
		tasks: konarTasks,
		bossTasks: true,
		masterId: 6,
		basePoints: 14,
		combatLvl: 75
	},
	{
		name: 'Nieve',
		aliases: ['nieve', 'steve', 'ni', 'nie', 'niev'],
		tasks: nieveTasks,
		bossTasks: true,
		masterId: 7,
		basePoints: 15,
		combatLvl: 85
	},
	{
		name: 'Duradel',
		aliases: ['duradel', 'du', 'dur', 'dura', 'duradaddy'],
		tasks: duradelTasks,
		bossTasks: true,
		masterId: 8,
		basePoints: 15,
		combatLvl: 100,
		slayerLvl: 50
	}
];
