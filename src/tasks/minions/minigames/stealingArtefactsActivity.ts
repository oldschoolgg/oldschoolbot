import { Time } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import { calculateStealingArtefactsXpPerHour, getGlassblowingProduct } from '@/lib/minions/data/stealingArtefacts.js';
import type { StealingArtefactsActivityTaskOptions } from '@/lib/types/minions.js';

export const stealingArtefactsTask: MinionTask = {
	type: 'StealingArtefacts',
	async run(data: StealingArtefactsActivityTaskOptions, { user, handleTripFinish, rng }) {
		const { channelId, duration, stamina, teleportEligible, glassblow } = data;
		const thievingLevel = user.skillsAsLevels.thieving;
		const hasGraceful = user.hasGracefulEquipped();

		const hours = duration / Time.Hour;
		const xpInfo = calculateStealingArtefactsXpPerHour({
			thievingLevel,
			teleportEligible,
			hasGraceful,
			stamina
		});

		const deliveries = Math.floor(xpInfo.deliveriesPerHour * hours);
		const thievingXp = Math.floor(xpInfo.finalXpPerHour * hours);

		let coinsGained = 0;
		for (let i = 0; i < deliveries; i++) {
			coinsGained += rng.randInt(500, 1000);
		}

		if (deliveries > 0) {
			await user.incrementMinigameScore('stealing_artefacts', deliveries);
		}

		const loot = new Bank();
		if (coinsGained > 0) {
			loot.add('Coins', coinsGained);
			await ClientSettings.updateClientGPTrackSetting('gp_pickpocket', coinsGained);
		}

		let craftingXp = 0;
		if (glassblow) {
			const product = getGlassblowingProduct(glassblow.product);
			if (product) {
				loot.add(product.item.id, glassblow.itemsMade);
				craftingXp = glassblow.itemsMade * product.xp;
			}
		}

		const { previousCL, itemsAdded } = await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		const thievingXpMessage = await user.addXP({ skillName: 'thieving', amount: thievingXp, duration });
		const craftingXpMessage =
			glassblow && craftingXp > 0
				? await user.addXP({ skillName: 'crafting', amount: craftingXp, duration })
				: null;

		const boosts = [
			hasGraceful ? 'Graceful equipped (+20%)' : null,
			stamina ? 'Stamina potions selected (+30%)' : null,
			teleportEligible ? 'Teleport efficiency active' : null
		].filter(Boolean);

		let message = `${user}, ${user.minionName} finished stealing artefacts.\n`;
		if (boosts.length > 0) {
			message += `**Boosts active:** ${boosts.join(', ')}\n`;
		}

		message += thievingXpMessage;
		if (craftingXpMessage) {
			message += `\n${craftingXpMessage}`;
		}

		const embed = new MessageBuilder().setContent(message);
		if (itemsAdded.length > 0) {
			embed.addBankImage({
				bank: itemsAdded,
				title: 'Loot from Stealing artefacts',
				user,
				previousCL
			});
		}

		handleTripFinish({ user, channelId, message: embed, data, loot: itemsAdded });
	}
};
