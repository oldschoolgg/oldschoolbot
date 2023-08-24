import { researchTask } from '../../../lib/invention/research';
import { ResearchTaskOptions } from '../../../lib/types/minions';

export const researchActivityTask: MinionTask = {
	type: 'Research',
	async run(data: ResearchTaskOptions) {
		researchTask(data);
	}
};
