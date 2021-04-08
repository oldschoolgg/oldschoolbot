import { noOp, reduceNumByPercent, Time } from 'e';
import { Task } from 'klasa';

import { DungeoneeringOptions, maxFloorUserCanDo } from '../../commands/Minion/dung';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { randomVariation, toKMB } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: DungeoneeringOptions) {
		const { channelID, duration, userID, floor, quantity, users } = data;
		const user = await this.client.users.fetch(userID);

		let baseXp = ((Math.log(floor * 16 + 1) * quantity * 1) / (36 - floor * 5)) * 59_000;
		let str = `<:dungeoneering:828683755198873623> ${user}, your party finished ${quantity}x Floor ${floor} dungeons.\n\n`;

		for (const id of users) {
			const u = await this.client.users.fetch(id).catch(noOp);
			if (!u) return;
			let xp = Math.floor(
				randomVariation((baseXp * u.skillLevel(SkillsEnum.Dungeoneering)) / 120, 5)
			);
			// 7 - 1
			const maxFloor = maxFloorUserCanDo(u);
			if (floor !== maxFloor) {
				xp = reduceNumByPercent(xp, maxFloor - floor * 3);
			}

			const tokens = Math.floor(xp * 0.1);
			await user.addXP(SkillsEnum.Dungeoneering, xp / 5, duration);
			await user.settings.update(
				UserSettings.DungeoneeringTokens,
				user.settings.get(UserSettings.DungeoneeringTokens) + tokens
			);
			let rawXPHr = (xp / (duration / Time.Minute)) * 60;
			rawXPHr = Math.floor(xp / 1000) * 1000;
			str += `${u} received: ${xp.toLocaleString()} XP (${toKMB(
				rawXPHr
			)}/hr) and <:dungeoneeringToken:829004684685606912> ${tokens.toLocaleString()} Dungeoneering tokens (${toKMB(
				rawXPHr * 0.1
			)}/hr)`;
		}

		handleTripFinish(this.client, user, channelID, str, undefined, undefined, data, null);
	}
}
