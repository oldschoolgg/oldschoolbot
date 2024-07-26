import { Time, randInt, roll } from 'e';
import { Bank } from 'oldschooljs';
import { userHasFlappy } from '../../../lib/invention/inventions';

import { incrementMinigameScore } from '../../../lib/settings/settings';
import { WintertodtCrate } from '../../../lib/simulation/wintertodt';
import Firemaking from '../../../lib/skilling/skills/firemaking';
import { SkillsEnum } from '../../../lib/skilling/types';
import type { ActivityTaskOptionsWithQuantity } from '../../../lib/types/minions';
import { clAdjustedDroprate } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { makeBankImage } from '../../../lib/util/makeBankImage';

export const wintertodtTask: MinionTask = {
	type: 'Wintertodt',
	async run(data: ActivityTaskOptionsWithQuantity) {
		const { userID, channelID, quantity, duration } = data;
		const user = await mUserFetch(userID);
		const hasMasterCape = user.hasEquippedOrInBank('Firemaking master cape');

		const loot = new Bank();

		let totalPoints = 0;

		for (let i = 0; i < quantity; i++) {
			const points = randInt(1000, 5000);
			totalPoints += points;

			loot.add(
				WintertodtCrate.open({
					points,
					itemsOwned: user.allItemsOwned.clone().add(loot).bank,
					skills: user.skillsAsXP,
					firemakingXP: user.skillsAsXP.firemaking
				})
			);
		}

		let gotToad = false;
		const dropRate = clAdjustedDroprate(user, 'Wintertoad', 3000 / Math.floor(duration / Time.Minute), 1.2);
		if (duration > Time.Minute * 20 && roll(dropRate)) {
			gotToad = true;
			loot.add('Wintertoad');
		}

		/**
		 * https://oldschool.runescape.wiki/w/Wintertodt#Rewards_2
		 *
		 * Adding/cutting a root gives 10pts, therefore number of roots from this trip is totalPoints/10
		 */
		const numberOfRoots = Math.floor((totalPoints - 50 * quantity) / 10);
		const fmLvl = user.skillLevel(SkillsEnum.Firemaking);
		const wcLvl = user.skillLevel(SkillsEnum.Woodcutting);
		const conLevel = user.skillLevel(SkillsEnum.Construction);

		let fmXpToGive = Math.floor(fmLvl * 100 * quantity + numberOfRoots * (fmLvl * 3));
		let fmBonusXP = 0;
		const wcXpToGive = Math.floor(numberOfRoots * (wcLvl * 0.3));
		const constructionXPPerBrazier = conLevel * 4;
		let numberOfBraziers = 0;
		for (let i = 0; i < quantity; i++) {
			numberOfBraziers += randInt(1, 7);
		}
		const conXP = numberOfBraziers * constructionXPPerBrazier;
		let xpStr = await user.addXP({ skillName: SkillsEnum.Construction, amount: conXP, duration: data.duration });

		// If they have the entire pyromancer outfit, give an extra 0.5% xp bonus
		if (
			user.hasEquippedOrInBank(
				Object.keys(Firemaking.pyromancerItems).map(i => Number.parseInt(i)),
				'every'
			)
		) {
			const amountToAdd = Math.floor(fmXpToGive * (2.5 / 100));
			fmXpToGive += amountToAdd;
			fmBonusXP += amountToAdd;
		} else {
			// For each pyromancer item, check if they have it, give its' XP boost if so.
			for (const [itemID, bonus] of Object.entries(Firemaking.pyromancerItems)) {
				if (user.hasEquippedOrInBank(Number.parseInt(itemID))) {
					const amountToAdd = Math.floor(fmXpToGive * (bonus / 100));
					fmXpToGive += amountToAdd;
					fmBonusXP += amountToAdd;
				}
			}
		}

		xpStr += `, ${await user.addXP({
			skillName: SkillsEnum.Woodcutting,
			amount: wcXpToGive,
			duration: data.duration,
			source: 'Wintertodt'
		})}`;
		xpStr += `, ${await user.addXP({
			skillName: SkillsEnum.Firemaking,
			amount: fmXpToGive,
			duration: data.duration,
			source: 'Wintertodt'
		})}`;
		const flappyRes = await userHasFlappy({ user, duration });
		if (flappyRes.shouldGiveBoost) {
			loot.multiply(2);
		}
		if (hasMasterCape) {
			loot.multiply(2);
		}

		const { itemsAdded, previousCL } = await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});
		await incrementMinigameScore(user.id, 'wintertodt', quantity);

		const image = await makeBankImage({
			title: `Loot From ${quantity}x Wintertodt`,
			bank: itemsAdded,
			user,
			previousCL
		});

		let output = `${user}, ${
			user.minionName
		} finished subduing Wintertodt ${quantity}x times. ${xpStr}, you cut ${numberOfRoots}x Bruma roots${
			hasMasterCape ? ', 2x loot for Firemaking master cape.' : '.'
		}`;

		if (fmBonusXP > 0) {
			output += `\n\n**Firemaking Bonus XP:** ${fmBonusXP.toLocaleString()}`;
		}

		if (gotToad) {
			output += '\n\n<:wintertoad:749945071230779493> A Wintertoad sneakily hops into your bank!';
		}
		if (flappyRes.shouldGiveBoost) output += `\n${flappyRes.userMsg}`;

		return handleTripFinish(user, channelID, output, image.file.attachment, data, itemsAdded);
	}
};
