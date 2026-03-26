import { Bank, } from 'oldschooljs';

import { trackLoot } from '@/lib/lootTrack.js';
import type { ValeTotemsActivityTaskOptions } from '@/lib/types/minions.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';
import {BitField} from "@/lib/constants.js";
import {claimValeOfferings} from "@/lib/minions/data/valeTotems.js";

export const valeTotemsTask: MinionTask = {
	type: 'ValeTotems',
	async run(data: ValeTotemsActivityTaskOptions, { user, handleTripFinish, rng }) {
		const { channelId, quantity, duration, offerings, fletchXp } = data;
		const TOTEMS_PER_LAP = 8;

		const { newScore } = await user.incrementMinigameScore('vale_totems', quantity * TOTEMS_PER_LAP);
		const loot = new Bank();
		const totalLoot = new Bank();
		let itemsAdded = new Bank();


		const autoClaim = user.bitfield.includes(BitField.ToggleAutoRummage)
		const offeringsInBank = user.bank.amount('Vale offerings');
		let extraMsg = '';
		let previousCL = new Bank().add('Vale offerings', 1);

		if (autoClaim) {

			const offeringMsg = (rewards: number, offerings: number, bankOfferings: number, total:number, remaining: number) => {
				return `You earned ${offerings} on your trip, had ${bankOfferings} in your bank, for a total of ${total}. You auto-rummaged to earn ${rewards} research points, leaving you with ${remaining}x Vale offerings left.`;
			}
			const totalOfferings = offerings + offeringsInBank;
			await user.addItemsToCollectionLog({ itemsToAdd: new Bank().add('Vale offerings', totalOfferings)});

			const rewards = Math.floor(totalOfferings / 100);
			const remainder = totalOfferings % 100;
			const diff = offeringsInBank - remainder;

			// Note: We are not using transactItems here because we're autoclaiming, and CL wouldn't be right.
			const offeringsAdded = new Bank();
			const offeringsRemoved = new Bank();
			if (diff > 0) {
				offeringsRemoved.add('Vale offerings', diff);
				await user.removeItemsFromBank(offeringsRemoved)
				extraMsg = offeringMsg(rewards, offerings, offeringsInBank, totalOfferings, user.bank.amount('Vale offerings'));
			} else if (diff < 0) {
				offeringsAdded.add('Vale offerings', -diff);
				await user.addItemsToBank({ items: offeringsAdded.add('Vale offerings', -diff), collectionLog: false})
				extraMsg = offeringMsg(rewards, offerings, offeringsInBank, totalOfferings, user.bank.amount('Vale offerings'));
			} else {
				if (offeringsInBank > 0) {
					offeringsRemoved.add('Vale offerings', offeringsInBank);
					await user.removeItemsFromBank(offeringsRemoved);
				}
				extraMsg = offeringMsg(rewards, offerings, offeringsInBank, totalOfferings, 0);
			}
			const userStats = await user.fetchStats();
			const { loot: rewardLoot, msg: rewardMsg } = claimValeOfferings(user, userStats, rewards, rng);
			loot.add(rewardLoot);
			extraMsg = `${extraMsg}\n\n${rewardMsg}`;

			const { previousCL: pclBank, itemsAdded } = await user.transactItems({
				collectionLog: true,
				itemsToAdd: loot
			});
			previousCL = pclBank;

			await ClientSettings.updateBankSetting('vt_loot', loot);
			await user.statsUpdate({
				vale_research_points: {
					increment: rewards
				}
			});

			// Total loot includes the offerings.
			totalLoot.add(itemsAdded).add('Vale offerings', offerings);

		} else {
			loot.add('Vale offerings', offerings);
			totalLoot.add(loot);
			const { itemsAdded: addItemsLootResult } = await user.addItemsToBank({ items: loot, collectionLog: true });
			itemsAdded = addItemsLootResult;
		}

		await trackLoot({
			totalLoot,
			id: 'vale_totems',
			type: 'Minigame',
			changeType: 'loot',
			duration: data.duration,
			kc: quantity,
			users: [
				{
					id: user.id,
					loot: totalLoot,
					duration
				}
			]
		});

		const constructionXp = user.skillLevel('construction') * TOTEMS_PER_LAP * quantity;

		const [fletchingXpRes, constructionXpRes] = await Promise.all([
			user.addXP({
				skillName: 'fletching',
				amount: fletchXp,
				duration,
				source: 'ValeTotems'
			}),
			user.addXP({
				skillName: 'construction',
				amount: constructionXp,
				duration,
				source: 'ValeTotems'
			})
		]);

		const str = `${user}, ${user.minionName} finished doing the Vale Totems ${quantity}x laps, and constructed ${
			quantity * TOTEMS_PER_LAP
		} totems (total constructed ${newScore} Totems). ${extraMsg}\n\n${fletchingXpRes}\n${constructionXpRes}`;

		const image = await makeBankImage({
			bank: loot,
			title: `Loot From ${quantity}x laps of Vale Totems`,
			user,
			previousCL
		});

		return handleTripFinish({
			user,
			channelId,
			message: { content: str, files: [image] },
			data,
			loot: itemsAdded
		});
	}
};
