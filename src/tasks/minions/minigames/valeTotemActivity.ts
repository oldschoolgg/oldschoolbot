import { roll } from '@oldschoolgg/rng';
import { Bank } from 'oldschooljs';

import { trackLoot } from '@/lib/lootTrack.js';
import { cleanDirtyArrows, preRollTable, rummageOfferings } from '@/lib/minions/data/valeTotems.js';
import type { ValeTotemsActivityTaskOptions } from '@/lib/types/minions.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';

export const valeTotemsTask: MinionTask = {
	type: 'ValeTotems',
	async run(data: ValeTotemsActivityTaskOptions, { user, handleTripFinish }) {
		const { channelID, quantity, duration, offerings, fletchXp } = data;
		const TOTEMS_PER_LAP = 8;

		await user.incrementMinigameScore('vale_totems', quantity * TOTEMS_PER_LAP);

		const userStats = await user.fetchStats();
		const totalOfferings = offerings + userStats.vale_offerings;
		const rewards = Math.floor(totalOfferings / 100);
		const remainder = totalOfferings % 100;

		await user.statsUpdate({
			vale_research_points: {
				increment: rewards
			},
			vale_offerings: remainder
		});

		const fletchingLvl = user.skillLevel('fletching');
		const hasForestryKit = user.hasEquippedOrInBank('Forestry kit');

		const loot = new Bank();
		for (let i = 0; i < rewards; i++) {
			if (roll(100)) {
				loot.add(preRollTable.roll());
				continue;
			}
			loot.add(rummageOfferings(fletchingLvl, hasForestryKit));
		}

		// Dirty arrowtips and it's logic
		const DIRTY_ARROWTIPS_ID = 31047;
		const hasDirtyArrowtips = loot.has(DIRTY_ARROWTIPS_ID);
		let dirtyArrowTipCount: number | undefined;

		if (hasDirtyArrowtips) {
			dirtyArrowTipCount = loot.amount(DIRTY_ARROWTIPS_ID);
			loot.remove(DIRTY_ARROWTIPS_ID, dirtyArrowTipCount);
			for (let i = 0; i < dirtyArrowTipCount; i++) {
				loot.add(cleanDirtyArrows(fletchingLvl));
			}
		}

		const { previousCL, itemsAdded } = await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		const constructionXp = user.skillLevel('construction') * TOTEMS_PER_LAP * quantity;

		const [fletchingXpRes, constructionXpRes] = await Promise.all([
			user.addXP({
				skillName: 'fletching',
				amount: fletchXp,
				duration
			}),
			user.addXP({
				skillName: 'construction',
				amount: constructionXp,
				duration
			})
		]);

		await trackLoot({
			totalLoot: itemsAdded,
			id: 'vale_totems',
			type: 'Minigame',
			changeType: 'loot',
			duration: data.duration,
			kc: quantity,
			users: [
				{
					id: user.id,
					duration,
					loot: itemsAdded
				}
			]
		});

		const str = `${user}, ${user.minionName} finished doing the Vale Totems ${quantity}x laps, and constructed ${
			quantity * TOTEMS_PER_LAP
		} totems. ${user.minionName} gained ${rewards} Vale Research points (total ${userStats.vale_research_points + rewards}). ${
			hasDirtyArrowtips
				? `While rummaging through the offerings,${user.minionName} discovered and cleaned ${dirtyArrowTipCount}x Dirty arrowtips.`
				: ''
		} ${
			remainder > 0
				? `${remainder}x vale offerings remain to be rummaged through, and they will count toward the next trip.`
				: ''
		} \n\n${fletchingXpRes}\n${constructionXpRes}`;

		const image = await makeBankImage({
			bank: itemsAdded,
			title: `Loot From ${quantity}x laps of Vale Totems`,
			user,
			previousCL
		});

		handleTripFinish(user, channelID, str, image.file.attachment, data, itemsAdded);
	}
};
