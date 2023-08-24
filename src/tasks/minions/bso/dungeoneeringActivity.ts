import { reduceNumByPercent, Time } from 'e';
import { Bank } from 'oldschooljs';

import { MysteryBoxes } from '../../../lib/bsoOpenables';
import { Emoji } from '../../../lib/constants';
import { isDoubleLootActive } from '../../../lib/doubleLoot';
import {
	gorajanShardChance,
	maxFloorUserCanDo,
	numberOfGorajanOutfitsEquipped
} from '../../../lib/skilling/skills/dung/dungDbFunctions';
import { SkillsEnum } from '../../../lib/skilling/types';
import { DungeoneeringOptions } from '../../../lib/types/minions';
import { randomVariation, roll } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export const dungeoneeringTask: MinionTask = {
	type: 'Dungeoneering',
	async run(data: DungeoneeringOptions) {
		const { channelID, duration, userID, floor, quantity, users } = data;
		const user = await mUserFetch(userID);

		let baseXp = ((Math.log(floor * 16 + 1) * quantity) / (36 - floor * 5)) * 59_000;
		baseXp *= 1.5;
		let str = `<:dungeoneering:828683755198873623> ${user}, your party finished ${quantity}x Floor ${floor} dungeons.\n\n`;
		const minutes = duration / Time.Minute;

		for (const id of users) {
			const u = await mUserFetch(id);
			let xp = Math.floor(randomVariation((baseXp * u.skillLevel(SkillsEnum.Dungeoneering)) / 120, 5));
			const maxFloor = maxFloorUserCanDo(u);
			xp = reduceNumByPercent(xp, (maxFloor - floor) * 5);

			if (floor === maxFloor) {
				xp *= 1.5;
			}

			const tokens = Math.floor((xp * 0.1) / 4);
			const gorajanEquipped = numberOfGorajanOutfitsEquipped(u);
			let bonusXP = 0;
			if (gorajanEquipped > 0) {
				bonusXP += Math.floor(xp * (gorajanEquipped / 2));
				xp += bonusXP;
			}
			const xpStr = await u.addXP({
				skillName: SkillsEnum.Dungeoneering,
				amount: xp / 5,
				duration,
				minimal: false
			});
			await u.update({
				dungeoneering_tokens: {
					increment: tokens
				}
			});

			// Allow MBs to roll per floor and not trip
			// This allows people that wants to farm mbs and not xp to do a lot of small floors
			let gotMysteryBox = false;
			let boxScrollChance = 5;
			const differenceFromMax = maxFloorUserCanDo(u) - floor;
			boxScrollChance += Math.floor(differenceFromMax * 11.5);
			for (let i = 0; i < quantity; i++) {
				if (u.bank.has('Scroll of mystery') && roll(boxScrollChance)) {
					await u.addItemsToBank({ items: new Bank().add(MysteryBoxes.roll()), collectionLog: true });
					if (!gotMysteryBox) gotMysteryBox = true;
				}
			}

			str += `${
				gotMysteryBox ? Emoji.MysteryBox : ''
			} ${u} received: ${xpStr} and <:dungeoneeringToken:829004684685606912> ${tokens.toLocaleString()} Dungeoneering tokens`;
			if (gorajanEquipped > 0) {
				str += ` ${bonusXP.toLocaleString()} Bonus XP`;
			}

			if (floor >= 5 && roll(Math.floor(gorajanShardChance(user).chance / minutes))) {
				str += ' **1x Gorajan shards**';
				let quantity = 1;

				if (isDoubleLootActive(duration)) {
					quantity *= 2;
				}
				await u.addItemsToBank({ items: new Bank().add('Gorajan shards', quantity), collectionLog: true });
			}
			if (floor === 7 && roll(Math.floor(20_000 / minutes))) {
				str += ' **1x Gorajan bonecrusher (u)**';
				await u.addItemsToBank({ items: new Bank().add('Gorajan bonecrusher (u)'), collectionLog: true });
			}
			str += '\n';
		}

		handleTripFinish(user, channelID, str, undefined, data, null);
	}
};
