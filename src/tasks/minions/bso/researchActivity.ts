import { Task } from 'klasa';

import { researchTask, ResearchTaskOptions } from '../../../lib/invention/research';

export default class extends Task {
	async run(data: ResearchTaskOptions) {
		researchTask(data);
	}
}
