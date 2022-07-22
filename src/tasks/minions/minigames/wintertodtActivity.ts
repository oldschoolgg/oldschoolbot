import { randInt, Time } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { Emoji, Events } from '../../../lib/constants';
import { trackLoot } from '../../../lib/settings/prisma';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { WintertodtCrate } from '../../../lib/simulation/wintertodt';
import Firemaking from '../../../lib/skilling/skills/firemaking';
import { SkillsEnum } from '../../../lib/skilling/types';
import { ActivityTaskOptionsWithQuantity } from '../../../lib/types/minions';
import { clAdjustedDroprate, rand, roll, updateBankSetting } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { makeBankImage } from '../../../lib/util/makeBankImage';

export default class extends Task {
	async run(data: ActivityTaskOptionsWithQuantity) {
		const { userID, channelID, quantity, duration } = data;
		const user = await this.client.fetchUser(userID);
		const currentLevel = user.skillLevel(SkillsEnum.Firemaking);

		let loot = new Bank();

		let totalPoints = 0;

		for (let i = 0; i < quantity; i++) {
			const points = rand(1000, 5000);
			totalPoints += points;

			loot.add(
				WintertodtCrate.open({
					points,
					itemsOwned: user.allItemsOwned().clone().add(loot).bank,
					skills: user.rawSkills
				})
			);
		}

		let gotToad = false;
		const dropRate = clAdjustedDroprate(user, 'Wintertoad', 3000 / Math.floor(duration / Time.Minute), 1.2);
		if (duration > Time.Minute * 20 && roll(dropRate)) {
			gotToad = true;
			loot.add('Wintertoad');
		}

		// Track loot in Economy Stats
		await updateBankSetting(this.client, ClientSettings.EconomyStats.WintertodtLoot, loot);

		if (loot.has('Phoenix')) {
			this.client.emit(
				Events.ServerNotification,
				`${Emoji.Phoenix} **${user.username}'s** minion, ${
					user.minionName
				}, just received a Phoenix! Their Wintertodt KC is ${
					(await user.getMinigameScore('wintertodt')) + quantity
				}, and their Firemaking level is ${user.skillLevel(SkillsEnum.Firemaking)}.`
			);
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
		user.addXP({ skillName: SkillsEnum.Construction, amount: conXP });

		// If they have the entire pyromancer outfit, give an extra 0.5% xp bonus
		if (
			user.getGear('skilling').hasEquipped(
				Object.keys(Firemaking.pyromancerItems).map(i => parseInt(i)),
				true
			)
		) {
			const amountToAdd = Math.floor(fmXpToGive * (2.5 / 100));
			fmXpToGive += amountToAdd;
			fmBonusXP += amountToAdd;
		} else {
			// For each pyromancer item, check if they have it, give its' XP boost if so.
			for (const [itemID, bonus] of Object.entries(Firemaking.pyromancerItems)) {
				if (user.hasItemEquippedAnywhere(parseInt(itemID))) {
					const amountToAdd = Math.floor(fmXpToGive * (bonus / 100));
					fmXpToGive += amountToAdd;
					fmBonusXP += amountToAdd;
				}
			}
		}

		await user.addXP({ skillName: SkillsEnum.Woodcutting, amount: wcXpToGive });
		await user.addXP({ skillName: SkillsEnum.Firemaking, amount: fmXpToGive });
		const newLevel = user.skillLevel(SkillsEnum.Firemaking);

		if (user.usingPet('Flappy')) {
			loot.multiply(2);
		}
		if (user.hasItemEquippedAnywhere('Firemaking master cape')) {
			loot.multiply(2);
		}

		const { itemsAdded, previousCL } = await user.addItemsToBank({ items: loot, collectionLog: true });
		incrementMinigameScore(user.id, 'wintertodt', quantity);

		const image = await makeBankImage({
			bank: itemsAdded,
			user,
			previousCL
		});

		let output = `${user}, ${
			user.minionName
		} finished subduing Wintertodt ${quantity}x times. You got ${fmXpToGive.toLocaleString()} Firemaking XP, ${wcXpToGive.toLocaleString()} Woodcutting XP and ${conXP.toLocaleString()} Construction XP, you cut ${numberOfRoots}x Bruma roots.`;

		if (fmBonusXP > 0) {
			output += `\n\n**Firemaking Bonus XP:** ${fmBonusXP.toLocaleString()}`;
		}

		if (newLevel > currentLevel) {
			output += `\n\n${user.minionName}'s Firemaking level is now ${newLevel}!`;
		}

		if (gotToad) {
			output += '\n\n<:wintertoad:749945071230779493> A Wintertoad sneakily hops into your bank!';
		}
		await trackLoot({
			loot: itemsAdded,
			id: 'wintertodt',
			type: 'Minigame',
			changeType: 'loot',
			duration: data.duration,
			kc: quantity
		});

		handleTripFinish(
			user,
			channelID,
			output,
			['k', { name: 'wintertodt' }, true],
			image.file.buffer,
			data,
			itemsAdded
		);
	}
}
