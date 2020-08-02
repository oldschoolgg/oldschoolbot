import turaelTasks from './tasks/turaelTasks';
// import krystiliaTasks from './tasks/krystiliaTasks';
// import mazchnaTasks from './tasks/mazchnaTasks';
// import vannakaTasks from './tasks/vannakaTasks';
import chaeldarTasks from './tasks/chaeldarTasks';
// import konarTasks from './tasks/konarTasks';
// import nieveTasks from './tasks/nieveTasks';
// import bossTasks from './tasks/bossTasks';
import duradelTasks from './tasks/duradelTasks';
import { SlayerMaster } from '../../types';

const slayerMasters: SlayerMaster[] = [
	{
		name: 'Turael',
		aliases: ['turael', 'tu', 'tur', 'tura', 'turry'],
		tasks: turaelTasks,
		masterId: 1,
		basePoints: 0
	} /*
	{
		name: 'Krystilia',
		aliases: ['krystilia', 'kr', 'kry', 'krys', 'krysti'],
		tasks: krystiliaTasks,
		masterId: 2,
		basePoints: 25
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
	},*/,
	{
		name: 'Chaeldar',
		aliases: ['chaeldar', 'ch', 'cha', 'chael'],
		tasks: chaeldarTasks,
		masterId: 5,
		basePoints: 10,
		combatLvl: 70,
		questPoints: 3
	} /*
	{
		name: 'Konar quo Maten',
		aliases: ['konar quo maten', 'konar', 'ko', 'kon', 'kona'],
		tasks: konarTasks,
	//	bossTasks,
		masterId: 6,
		basePoints: 14,
		combatLvl: 75
	},
	{
		name: 'Nieve',
		aliases: ['nieve', 'steve', 'ni', 'nie', 'niev'],
		tasks: nieveTasks,
	//	bossTasks,
		masterId: 7,
		basePoints: 15,
		combatLvl: 85
	},*/,
	{
		name: 'Duradel',
		aliases: ['duradel', 'du', 'dur', 'dura', 'duradaddy'],
		tasks: duradelTasks,
		//	bossTasks,
		masterId: 8,
		basePoints: 15,
		combatLvl: 100,
		slayerLvl: 50
	}
];

export default slayerMasters;
