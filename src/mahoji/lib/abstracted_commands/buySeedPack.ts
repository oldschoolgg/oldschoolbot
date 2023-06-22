import { ChatInputCommandInteraction } from 'discord.js';
import { Bank } from 'oldschooljs';

import { Favours, gotFavour } from '../../../lib/minions/data/kourendFavour';
import { openSeedPack } from '../../../lib/skilling/functions/calcFarmingContracts';
import { SkillsEnum } from '../../../lib/skilling/types';
import { handleMahojiConfirmation } from '../../../lib/util/handleMahojiConfirmation';
import { makeBankImage } from '../../../lib/util/makeBankImage';

export async function buySeedPack(user: MUser, interaction: ChatInputCommandInteraction, quantity: number) {
	const cost = new Bank().add('Spirit seed', 1).multiply(quantity);
	if (user.minionIsBusy) {
		return 'Your minion is busy.';
	}

	if (!gotFavour(user, Favours.Hosidius, 60)[0]) {
		return 'Trading in spirit seeds for seed packs requires 60% Hosidius Favour.';
	}

	if (user.skillLevel(SkillsEnum.Farming) < 45) return 'You require atleast 45 farming to trade in spirit seeds';

	if (!user.owns(cost)) {
		return "You don't have enough spirit seeds for that.";
	}

	await handleMahojiConfirmation(
		interaction,
		`${user}, please confirm that you want to buy ${quantity}x Seed pack${quantity > 1 ? 's' : ''} for: ${cost}${quantity > 1 ? 's' : ''
		}.`
	);

	let loot = new Bank();
	for (let i = 0; i < quantity; i++) {
		loot.add(openSeedPack(5));
	}

	await transactItems({ userID: user.id, itemsToRemove: cost, itemsToAdd: loot, collectionLog: true });

	if (quantity < 5) {
		return `You recieved ${loot}.`;
	}

	const image = await makeBankImage({
		title: `Loot from ${quantity} Seed pack${quantity > 1 ? 's' : ''}`,
		bank: loot
	});
	return { files: [image.file] };
}
