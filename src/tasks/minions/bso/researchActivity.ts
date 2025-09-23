import { researchTask } from '@/lib/invention/research.js';
import type { ResearchTaskOptions } from '@/lib/types/minions.js';

export const researchActivityTask: MinionTask = {
	type: 'Research',
	async run(data: ResearchTaskOptions) {
		researchTask(data);
	}
};
