import { ShootingStarsData } from '../../lib/types/minions';
import { shootingStarsActivity } from './minigames/shootingStarsActivity';

export const shootingStarTask: MinionTask = {
	type: 'ShootingStars',
	async run(data: ShootingStarsData) {
		return shootingStarsActivity(data);
	}
};
