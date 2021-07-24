import { Task } from 'klasa';
import { In } from 'typeorm';

import { SkillsEnum } from '../../lib/skilling/types';
import { FarmingPatchesTable } from '../../lib/typeorm/FarmingPatchesTable.entity';
import { FarmingActivityTaskOptions } from '../../lib/types/minions';

export default class extends Task {
	async run(data: FarmingActivityTaskOptions) {
		const user = await this.client.users.fetch(data.userID);
		const currentFarmingLevel = user.skillLevel(SkillsEnum.Farming);
		const currentWoodcuttingLevel = user.skillLevel(SkillsEnum.Woodcutting);

		// Collect what there is to collect
		const patchesToCollect = await FarmingPatchesTable.find({
			where: {
				id: In(data.toCollect)
			}
		});

		const baseBonus = 1;

		for (const collect of patchesToCollect) {
		}

		// Plant what there is to plant

		console.log(data);
	}
}
