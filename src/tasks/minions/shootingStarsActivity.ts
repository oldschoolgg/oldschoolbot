import type { ShootingStarsOptions } from '../../lib/types/minions.js';
import { shootingStarsActivity } from './shootingStarActivity.js';

export const shootingStarTask: MinionTask = {
	type: 'ShootingStars',
	async run(data: ShootingStarsOptions) {
		return shootingStarsActivity(data);
	}
};
