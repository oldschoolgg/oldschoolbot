import { researchTask, ResearchTaskOptions } from '../../../lib/invention/research';

export const researchActivityTask: MinionTask = {
	type: 'Research',
	async run(data: ResearchTaskOptions) {
		researchTask(data);
	}
};
