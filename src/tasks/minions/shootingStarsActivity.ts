import type { ShootingStarsOptions } from '../../lib/types/minions';
import { shootingStarsActivity } from './shootingStarActivity';

export const shootingStarTask: MinionTask = {
	type: 'ShootingStars',
	async run(data: ShootingStarsOptions) {
		return shootingStarsActivity(data);
	}
};
