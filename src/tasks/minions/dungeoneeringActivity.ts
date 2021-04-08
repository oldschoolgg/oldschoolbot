import { noOp, Time } from 'e';
import { Task } from 'klasa';

import { DungeoneeringOptions } from '../../commands/Minion/dung';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { randomVariation, toKMB } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: DungeoneeringOptions) {
		const { channelID, duration, userID, floor, quantity, users } = data;
		const user = await this.client.users.fetch(userID);

		let baseXp = ((Math.log(floor * 4 + 1) * quantity * 1) / (36 - floor * 5)) * 73_000;
		let str = `${user}, your party finished ${quantity}x Floor ${floor} dungeons.\n\n`;

		for (const id of users) {
			const u = await this.client.users.fetch(id).catch(noOp);
			if (!u) return;
			const xp = Math.floor(
				randomVariation((baseXp * u.skillLevel(SkillsEnum.Dungeoneering)) / 120, 5)
			);

			const tokens = Math.floor(xp * 0.1);
			await user.addXP(SkillsEnum.Dungeoneering, xp, duration);
			await user.settings.update(
				UserSettings.DungeoneeringTokens,
				user.settings.get(UserSettings.DungeoneeringTokens) + tokens
			);
			str += `${u} received: ${xp.toLocaleString()} XP and <:dungeoneeringToken:829004684685606912> ${tokens} Dungeoneering tokens.`;
			let rawXPHr = (xp / (duration / Time.Minute)) * 60;
			rawXPHr = Math.floor(xp / 1000) * 1000;
			str += `\n

${toKMB(rawXPHr)} XP/Hr
${toKMB(rawXPHr * 0.1)} Tokens/Hr`;
		}

		handleTripFinish(this.client, user, channelID, str, undefined, undefined, data, null);
	}
}
