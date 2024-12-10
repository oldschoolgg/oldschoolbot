import { Time, reduceNumByPercent } from 'e';
import { Bank } from 'oldschooljs';

import { PortentID, chargePortentIfHasCharges } from '../../../lib/bso/divination';
import { MysteryBoxes } from '../../../lib/bsoOpenables';
import { isDoubleLootActive } from '../../../lib/doubleLoot';
import {
	calcMaxFloorUserCanDo,
	calcUserGorajanShardChance,
	numberOfGorajanOutfitsEquipped
} from '../../../lib/skilling/skills/dung/dungDbFunctions';
import { SkillsEnum } from '../../../lib/skilling/types';
import type { DungeoneeringOptions } from '../../../lib/types/minions';
import { randomVariation, roll, toKMB } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { userStatsUpdate } from '../../../mahoji/mahojiSettings';

export function calculateDungeoneeringResult({
	floor,
	quantity,
	gorajanEquipped,
	hasScrollOfMystery,
	gorajanShardChance,
	duration,
	dungeoneeringLevel,
	maxFloorUserCanDo,
	hasDungeonPortent
}: {
	duration: number;
	floor: number;
	quantity: number;
	dungeoneeringLevel: number;
	gorajanEquipped: number;
	hasScrollOfMystery: boolean;
	gorajanShardChance: number;
	maxFloorUserCanDo: number;
	hasDungeonPortent: boolean;
}) {
	const minutes = Math.ceil(duration / Time.Minute);

	let baseXp = ((Math.log(floor * 16 + 1) * quantity) / (36 - floor * 5)) * 59_000;
	baseXp *= 1.5;
	let xp = Math.floor(randomVariation((baseXp * dungeoneeringLevel) / 120, 5));
	xp = reduceNumByPercent(xp, (maxFloorUserCanDo - floor) * 5);
	if (floor === maxFloorUserCanDo) {
		xp *= 1.5;
	}
	let tokens = Math.floor((xp * 0.1) / 4);
	let bonusXP = 0;
	if (gorajanEquipped > 0) {
		bonusXP += Math.floor(xp * (gorajanEquipped / 2));
		xp += bonusXP;
	}

	const loot = new Bank();

	// Allow MBs to roll per floor and not trip
	// This allows people that wants to farm mbs and not xp to do a lot of small floors
	let gotMysteryBox = false;
	let boxScrollChance = 5;
	const differenceFromMax = maxFloorUserCanDo - floor;
	boxScrollChance += Math.floor(differenceFromMax * 11.5);
	for (let i = 0; i < quantity; i++) {
		if (hasScrollOfMystery && roll(boxScrollChance)) {
			loot.add(MysteryBoxes.roll());
			if (!gotMysteryBox) gotMysteryBox = true;
		}
	}

	const goraShardChanceX = Math.floor(gorajanShardChance / minutes);
	if (floor >= 5 && roll(goraShardChanceX)) {
		let qty = 1;
		if (isDoubleLootActive(duration)) {
			qty *= 2;
		}
		loot.add('Gorajan shards', qty);
	}
	if (floor === 7 && roll(Math.floor(20_000 / minutes))) {
		loot.add('Gorajan bonecrusher (u)');
	}

	const portentXP = Math.ceil(tokens * 16.646);
	if (hasDungeonPortent && tokens > 0) {
		xp += portentXP;
		tokens = 0;
	}

	return { xp: xp / 5, tokens, loot, portentXP, goraShardChanceX };
}

export const dungeoneeringTask: MinionTask = {
	type: 'Dungeoneering',
	async run(data: DungeoneeringOptions) {
		const { channelID, duration, userID, floor, quantity, users } = data;
		const user = await mUserFetch(userID);

		let str = `<:dungeoneering:828683755198873623> ${user}, your party finished ${quantity}x Floor ${floor} dungeons.\n\n`;

		for (const id of users) {
			const u = await mUserFetch(id);
			const gorajanEquipped = numberOfGorajanOutfitsEquipped(u);
			const portentResult = await chargePortentIfHasCharges({
				user: u,
				portentID: PortentID.DungeonPortent,
				charges: Math.floor(duration / Time.Minute)
			});
			const { xp, tokens, loot, portentXP } = calculateDungeoneeringResult({
				floor,
				quantity,
				dungeoneeringLevel: u.skillLevel('dungeoneering'),
				gorajanEquipped,
				hasScrollOfMystery: u.bank.has('Scroll of mystery'),
				gorajanShardChance: calcUserGorajanShardChance(u).chance,
				duration,
				maxFloorUserCanDo: calcMaxFloorUserCanDo(u),
				hasDungeonPortent: portentResult.didCharge
			});

			const xpStr = await u.addXP({
				skillName: SkillsEnum.Dungeoneering,
				amount: xp,
				duration,
				minimal: false
			});

			await u.addItemsToBank({ items: loot, collectionLog: true });

			if (tokens > 0) {
				await u.update({
					dungeoneering_tokens: {
						increment: tokens
					}
				});
			}

			if (portentXP > 0) {
				await userStatsUpdate(user.id, {
					xp_from_dungeon_portent: {
						increment: portentXP
					}
				});
			}

			if (portentResult.didCharge) {
				str += `${u} received: ${xpStr}, ${toKMB(portentXP)} of which is from from their portent (${
					portentResult.portent.charges_remaining
				} charges remaining)`;
			} else {
				str += `${u} received: ${xpStr} and <:dungeoneeringToken:829004684685606912> ${tokens.toLocaleString()} Dungeoneering tokens${
					loot.length > 0 ? ` and **${loot}**.` : '.'
				}`;
			}

			str += '\n';
		}

		handleTripFinish(user, channelID, str, undefined, data, null);
	}
};
