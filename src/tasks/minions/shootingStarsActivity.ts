import { shootingStarsActivity, ShootingStarsData } from '../../mahoji/lib/abstracted_commands/shootingStarsCommand';

export const shootingStarTask: MinionTask = {
	type: 'ShootingStars',
	async run(data: ShootingStarsData) {
		return shootingStarsActivity(data);
	}
};
