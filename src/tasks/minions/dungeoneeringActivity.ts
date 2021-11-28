import { noOp, reduceNumByPercent, Time } from 'e';
import { KlasaUser, Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { DungeoneeringOptions, maxFloorUserCanDo } from '../../commands/Minion/dung';
import { Emoji } from '../../lib/constants';
import { gorajanArcherOutfit, gorajanOccultOutfit, gorajanWarriorOutfit } from '../../lib/data/CollectionsExport';
import { getRandomMysteryBox } from '../../lib/data/openables';
import { isDoubleLootActive } from '../../lib/doubleLoot';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { randomVariation, roll, toKMB } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export function gorajanShardChance(user: KlasaUser) {
	let goraShardBoosts = [];
	let baseRate = 2000;
	if (user.hasItemEquippedAnywhere('Dungeoneering master cape')) {
		baseRate /= 2;
		goraShardBoosts.push('2x for Dung. mastery');
	} else if (user.skillLevel(SkillsEnum.Dungeoneering) >= 99) {
		baseRate = reduceNumByPercent(baseRate, 30);
		goraShardBoosts.push('30% for 99+ Dungeoneering');
	}

	if (user.hasItemEquippedAnywhere('Ring of luck')) {
		baseRate = reduceNumByPercent(baseRate, 5);
		goraShardBoosts.push('5% for Ring of Luck');
	}
	return {
		chance: baseRate,
		boosts: goraShardBoosts
	};
}

const data = [
	[gorajanWarriorOutfit, 'melee'],
	[gorajanOccultOutfit, 'mage'],
	[gorajanArcherOutfit, 'range']
] as const;

export function numberOfGorajanOutfitsEquipped(user: KlasaUser) {
	let num = 0;
	for (const outfit of data) {
		if (user.getGear(outfit[1]).hasEquipped(outfit[0], true)) num++;
	}
	return num;
}
export default class extends Task {
	async run(data: DungeoneeringOptions) {
		const { channelID, duration, userID, floor, quantity, users } = data;
		const user = await this.client.fetchUser(userID);

		let baseXp = ((Math.log(floor * 16 + 1) * quantity) / (36 - floor * 5)) * 59_000;
		baseXp *= 1.5;
		let str = `<:dungeoneering:828683755198873623> ${user}, your party finished ${quantity}x Floor ${floor} dungeons.\n\n`;
		const minutes = duration / Time.Minute;

		for (const id of users) {
			const u = await this.client.fetchUser(id).catch(noOp);
			if (!u) return;
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
			await u.addXP({
				skillName: SkillsEnum.Dungeoneering,
				amount: xp / 5,
				duration
			});
			await u.settings.update(
				UserSettings.DungeoneeringTokens,
				u.settings.get(UserSettings.DungeoneeringTokens) + tokens
			);
			let rawXPHr = (xp / (duration / Time.Minute)) * 60;
			rawXPHr = Math.floor(xp / 1000) * 1000;

			// Allow MBs to roll per floor and not trip
			// This allows people that wants to farm mbs and not xp to do a lot of small floors
			let gotMysteryBox = false;
			let boxScrollChance = 5;
			const differenceFromMax = maxFloorUserCanDo(u) - floor;
			boxScrollChance += Math.floor(differenceFromMax * 11.5);
			for (let i = 0; i < quantity; i++) {
				if (u.bank().has('Scroll of mystery') && roll(boxScrollChance)) {
					await u.addItemsToBank({ [getRandomMysteryBox()]: 1 });
					if (!gotMysteryBox) gotMysteryBox = true;
				}
			}

			str += `${gotMysteryBox ? Emoji.MysteryBox : ''} ${u} received: ${xp.toLocaleString()} XP (${toKMB(
				rawXPHr
			)}/hr) and <:dungeoneeringToken:829004684685606912> ${tokens.toLocaleString()} Dungeoneering tokens (${toKMB(
				(rawXPHr * 0.1) / 4
			)}/hr)`;
			if (gorajanEquipped > 0) {
				str += ` ${bonusXP.toLocaleString()} Bonus XP`;
			}

			if (floor >= 5 && roll(Math.floor(gorajanShardChance(user).chance / minutes))) {
				str += ' **1x Gorajan shards**';
				let quantity = 1;

				if (isDoubleLootActive(this.client, duration)) {
					quantity *= 2;
				}
				await u.addItemsToBank(new Bank().add('Gorajan shards', quantity), true);
			}
			if (floor === 7 && roll(Math.floor(20_000 / minutes))) {
				str += ' **1x Gorajan bonecrusher (u)**';
				await u.addItemsToBank(new Bank().add('Gorajan bonecrusher (u)'), true);
			}
			str += '\n';
		}

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			users.length > 1 ? undefined : ['dung', ['solo'], true],
			undefined,
			data,
			null
		);
	}
}
