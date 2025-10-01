import type { ShootingStarsOptions } from '@/lib/types/minions.js';
import { shootingStarsActivity } from '@/tasks/minions/shootingStarActivity.js';

export const shootingStarTask: MinionTask = {
	type: 'ShootingStars',
	async run(data: ShootingStarsOptions) {
		return shootingStarsActivity(data);
	}
};
