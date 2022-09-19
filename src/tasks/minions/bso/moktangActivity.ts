import { moktangActivity, MoktangTaskOptions } from '../../../mahoji/lib/abstracted_commands/moktangCommand';

export const moktangTask: MinionTask = {
	type: 'Moktang',
	async run(data: MoktangTaskOptions) {
		moktangActivity(data);
	}
};
