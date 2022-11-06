import { MoktangTaskOptions } from '../../../lib/types/minions';
import { moktangActivity } from '../moktangActivity';

export const moktangTask: MinionTask = {
	type: 'Moktang',
	async run(data: MoktangTaskOptions) {
		moktangActivity(data);
	}
};
