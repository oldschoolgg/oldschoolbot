import nieveTasks from './nieveTasks';
import turaelTasks from './turaelTasks';

const slayerMasters = [
	{
		name: 'Nieve',
		tasks: nieveTasks,
		requirements: {
			combatLevel: 85,
			slayerLevel: 30
		}
	},
	{
		name: 'Turael',
		tasks: turaelTasks,
		requirements: {
			combatLevel: 3,
			slayerLevel: 0
		}
	}
];

export default slayerMasters;
