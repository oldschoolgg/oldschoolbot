import { Task } from 'klasa';

import { moktangActivity, MoktangTaskOptions } from '../../../mahoji/lib/abstracted_commands/moktangCommand';

export default class extends Task {
	async run(data: MoktangTaskOptions) {
		moktangActivity(data);
	}
}
