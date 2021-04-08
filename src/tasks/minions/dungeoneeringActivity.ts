import { noOp, reduceNumByPercent, Time } from 'e';
import { KlasaUser } from 'klasa';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { DungeoneeringOptions, maxFloorUserCanDo } from '../../commands/Minion/dung';
import { hasArrayOfItemsEquipped } from '../../lib/gear';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { randomVariation, roll, toKMB } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import resolveItems from '../../lib/util/resolveItems';

const gorajanWarriorOutfit = resolveItems([
	'Gorajan warrior helmet',
	'Gorajan warrior top',
	'Gorajan warrior legs',
	'Gorajan warrior gloves',
	'Gorajan warrior boots'
]);
const gorajanOccultOutfit = resolveItems([
	'Gorajan occult helmet',
	'Gorajan occult top',
	'Gorajan occult legs',
	'Gorajan occult gloves',
	'Gorajan occult boots'
]);
const gorajanArcherOutfit = resolveItems([
	'Gorajan archer helmet',
	'Gorajan archer top',
	'Gorajan archer legs',
	'Gorajan archer gloves',
	'Gorajan archer boots'
]);
const data = [
	[gorajanWarriorOutfit, 'melee'],
	[gorajanOccultOutfit, 'mage'],
	[gorajanArcherOutfit, 'range']
] as const;

export function numberOfGorajanOutfitsEquipped(user: KlasaUser) {
	let num = 0;
	for (const outfit of data) {
		if (hasArrayOfItemsEquipped(outfit[0], user.getGear(outfit[1]))) {
			num++;
		}
	}
	return num;
}
export default class extends Task {
	async run(data: DungeoneeringOptions) {
		const { channelID, duration, userID, floor, quantity, users } = data;
		const user = await this.client.users.fetch(userID);

		let baseXp = ((Math.log(floor * 16 + 1) * quantity * 1) / (36 - floor * 5)) * 59_000;
		let str = `<:dungeoneering:828683755198873623> ${user}, your party finished ${quantity}x Floor ${floor} dungeons.\n\n`;
		const minutes = duration / Time.Minute;

		for (const id of users) {
			const u = await this.client.users.fetch(id).catch(noOp);
			if (!u) return;
			let xp = Math.floor(
				randomVariation((baseXp * u.skillLevel(SkillsEnum.Dungeoneering)) / 120, 5)
			);
			const maxFloor = maxFloorUserCanDo(u);
			xp = reduceNumByPercent(xp, (maxFloor - floor) * 5);

			const tokens = Math.floor(xp * 0.1);
			const gorajanEquipped = numberOfGorajanOutfitsEquipped(user);
			let bonusXP = 0;
			if (gorajanEquipped > 0) {
				bonusXP += Math.floor(xp * (gorajanEquipped / 8));
				xp += bonusXP;
			}
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
			if (gorajanEquipped > 0) {
				str += ` ${bonusXP.toLocaleString()} Bonus XP`;
			}
			if (floor >= 5 && roll(Math.floor(2000 / minutes))) {
				str += ` **1x Gorajan shards**`;
				await u.addItemsToBank(new Bank().add('Gorajan shards'), true);
			}
		}

		handleTripFinish(this.client, user, channelID, str, undefined, undefined, data, null);
	}
}
