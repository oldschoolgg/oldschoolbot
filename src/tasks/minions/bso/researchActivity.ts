import { researchTask } from '../../../lib/invention/research';
import type { ResearchTaskOptions } from '../../../lib/types/minions';

export const researchActivityTask: MinionTask = {
	type: 'Research',
	async run(data: ResearchTaskOptions) {
		researchTask(data);
	}
};
