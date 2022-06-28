import { Task } from 'klasa';

import { shootingStarsActivity, ShootingStarsData } from '../../mahoji/lib/abstracted_commands/shootingStarsCommand';

export default class extends Task {
	async run(data: ShootingStarsData) {
		return shootingStarsActivity(data);
	}
}
