import { clAdjustedDroprate } from '@/lib/bso/bsoUtil.js';

import { calcPerHour, Emoji, Events, Time } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import { trackLoot } from '@/lib/lootTrack.js';
import { WintertodtCrate } from '@/lib/simulation/wintertodt.js';
import Firemaking from '@/lib/skilling/skills/firemaking.js';
import type { ActivityTaskOptionsWithQuantity } from '@/lib/types/minions.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';

export const wintertodtTask: MinionTask = {
	type: 'Wintertodt',
	async run(data: ActivityTaskOptionsWithQuantity, { user, handleTripFinish, rng }) {
		const { channelId, quantity, duration } = data;
		const hasMasterCape = user.hasEquippedOrInBank('Firemaking master cape');

		const { newScore } = await user.incrementMinigameScore('wintertodt', quantity);
		const loot = new Bank();

		let totalPoints = 0;

		for (let i = 0; i < quantity; i++) {
			const points = rng.randInt(1000, 5000);
			totalPoints += points;

			loot.add(
				WintertodtCrate.open({
					points,
					itemsOwned: user.allItemsOwned.clone().add(loot),
					skills: user.skillsAsXP,
					firemakingXP: user.skillsAsXP.firemaking
				})
			);
		}

		let gotToad = false;
		const dropRate = clAdjustedDroprate(user, 'Wintertoad', 3000 / Math.floor(duration / Time.Minute), 1.2);
		if (duration > Time.Minute * 20 && rng.roll(dropRate)) {
			gotToad = true;
			loot.add('Wintertoad');
		}

		// Track loot in Economy Stats
		await ClientSettings.updateBankSetting('economyStats_wintertodtLoot', loot);

		if (loot.has('Phoenix')) {
			globalClient.emit(
				Events.ServerNotification,
				`${Emoji.Phoenix} **${user.badgedUsername}'s** minion, ${
					user.minionName
				}, just received a Phoenix! Their Wintertodt KC is ${
					newScore
				}, and their Firemaking level is ${user.skillsAsLevels.firemaking}.`
			);
		}

		/**
		 * https://oldschool.runescape.wiki/w/Wintertodt#Rewards_2
		 *
		 * Adding/cutting a root gives 10pts, therefore number of roots from this trip is totalPoints/10
		 */
		const numberOfRoots = Math.floor((totalPoints - 50 * quantity) / 10);
		const fmLvl = user.skillsAsLevels.firemaking;
		const wcLvl = user.skillsAsLevels.woodcutting;
		const conLevel = user.skillsAsLevels.construction;

		let fmXpToGive = Math.floor(fmLvl * 100 * quantity + numberOfRoots * (fmLvl * 3));
		let fmBonusXP = 0;
		const wcXpToGive = Math.floor(numberOfRoots * (wcLvl * 0.3));
		const constructionXPPerBrazier = conLevel * 4;
		let numberOfBraziers = 0;
		for (let i = 0; i < quantity; i++) {
			numberOfBraziers += rng.randInt(1, 7);
		}
		const conXP = numberOfBraziers * constructionXPPerBrazier;
		let xpStr = await user.addXP({ skillName: 'construction', amount: conXP, duration: data.duration });

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
			skillName: 'woodcutting',
			amount: wcXpToGive,
			duration: data.duration,
			source: 'Wintertodt'
		})}`;
		xpStr += `, ${await user.addXP({
			skillName: 'firemaking',
			amount: fmXpToGive,
			duration: data.duration,
			source: 'Wintertodt'
		})}`;
		const flappyRes = await user.hasFlappy(duration);
		if (flappyRes.shouldGiveBoost) {
			loot.multiply(2);
		}
		if (hasMasterCape) {
			loot.multiply(2);
		}

		const { itemsAdded, previousCL } = await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		const image = await makeBankImage({
			title: `Loot From ${quantity}x Wintertodt`,
			bank: itemsAdded,
			user,
			previousCL
		});

		let output = `${user}, ${user.minionName} finished subduing Wintertodt ${quantity}x times (${calcPerHour(quantity, data.duration).toFixed(1)}/hr), you now have ${newScore} KC. ${xpStr}, you cut ${numberOfRoots}x Bruma roots.`;

		if (fmBonusXP > 0) {
			output += `\n\n**Firemaking Bonus XP:** ${fmBonusXP.toLocaleString()}`;
		}

		if (hasMasterCape) {
			output += '\n\n2x loot for Firemaking master cape.';
		}

		if (gotToad) {
			output += '\n\n<:wintertoad:749945071230779493> A Wintertoad sneakily hops into your bank!';
		}
		if (flappyRes.shouldGiveBoost) output += `\n${flappyRes.userMsg}`;

		await trackLoot({
			totalLoot: itemsAdded,
			id: 'wintertodt',
			type: 'Minigame',
			changeType: 'loot',
			duration: data.duration,
			kc: quantity,
			users: [
				{
					id: user.id,
					loot: itemsAdded,
					duration: data.duration
				}
			]
		});

		return handleTripFinish({
			user,
			channelId,
			message: { content: output, files: [image] },
			data,
			loot: itemsAdded
		});
	}
};
