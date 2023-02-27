import type { ShootingStarsData } from '../../mahoji/lib/abstracted_commands/shootingStarsCommand';
import { shootingStarsActivity } from './shootingStarActivity';

export const shootingStarTask: MinionTask = {
	type: 'ShootingStars',
	async run(data: ShootingStarsData) {
		return shootingStarsActivity(data);
	}
};
