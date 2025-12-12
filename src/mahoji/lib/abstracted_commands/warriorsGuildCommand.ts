import { formatDuration, Time } from '@oldschoolgg/toolkit';
import { Bank, EGear } from 'oldschooljs';

import type { ActivityTaskOptionsWithQuantity, AnimatedArmourActivityTaskOptions } from '@/lib/types/minions.js';
import { formatTripDuration } from '@/lib/util/minionUtils.js';
export const Armours = [
	{
		name: 'Rune',
		timeToFinish: Time.Minute * 1.2,
		tokens: 40,
		items: [EGear.RUNE_FULL_HELM, EGear.RUNE_PLATEBODY, EGear.RUNE_PLATELEGS]
	},
	{
		name: 'Adamant',
		timeToFinish: Time.Minute * 1.15,
		tokens: 30,
		items: [EGear.ADAMANT_FULL_HELM, EGear.ADAMANT_PLATEBODY, EGear.ADAMANT_PLATELEGS]
	},
	{
		name: 'Mithril',
		timeToFinish: Time.Minute * 0.95,
		tokens: 25,
		items: [EGear.MITHRIL_FULL_HELM, EGear.MITHRIL_PLATEBODY, EGear.MITHRIL_PLATELEGS]
	},
	{
		name: 'Black',
		timeToFinish: Time.Minute * 0.65,
		tokens: 20,
		items: [EGear.BLACK_FULL_HELM, EGear.BLACK_PLATEBODY, EGear.BLACK_PLATELEGS]
	}
];

async function tokensCommand(user: MUser, channelId: string, quantity: number | undefined) {
	const maxTripLength = await user.calcMaxTripLength('AnimatedArmour');
	const userBank = user.bank;

	const armorSet = Armours.find(set => userBank.has(set.items));
	if (!armorSet) {
		return `You don't have any armor sets to use for getting tokens! Get a full helm, platebody and platelegs of one of the following: ${Armours.map(
			t => t.name
		).join(', ')}.`;
	}

	if (!quantity) {
		quantity = Math.floor(maxTripLength / armorSet.timeToFinish);
	}

	const duration = armorSet.timeToFinish * quantity;

	if (duration > maxTripLength) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount of animated ${armorSet.name} armour you can kill is ${Math.floor(
			maxTripLength / armorSet.timeToFinish
		)}.`;
	}

	await ActivityManager.startTrip<AnimatedArmourActivityTaskOptions>({
		armourID: armorSet.name,
		userID: user.id,
		channelId,
		quantity,
		duration,
		type: 'AnimatedArmour'
	});

	const response = `${user.minionName} is now killing ${quantity}x animated ${
		armorSet.name
	} armour, it'll take around ${await formatTripDuration(user, duration)} to finish.`;

	return response;
}

async function cyclopsCommand(user: MUser, channelId: string, quantity: number | undefined) {
	const userBank = user.bank;
	const hasAttackCape = user.gear.melee.hasEquipped('Attack cape');
	const maxTripLength = await user.calcMaxTripLength('Cyclops');
	// Check if either 100 warrior guild tokens or attack cape (similar items in future)
	const amountTokens = userBank.amount('Warrior guild token');
	if (!hasAttackCape && amountTokens < 100) {
		return 'You need at least 100 Warriors guild tokens to kill Cyclops.';
	}
	// If no quantity provided, set it to the max.
	if (!quantity) {
		const maxTokensTripLength = Math.floor((hasAttackCape ? 100_000 : amountTokens - 10) / 10) * Time.Minute;
		quantity = Math.floor(
			(maxTokensTripLength > maxTripLength ? maxTripLength : maxTokensTripLength) / (Time.Second * 30)
		);
	}

	const duration = Time.Second * 30 * quantity;

	if (duration > maxTripLength) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount of cyclopes that can be killed is ${Math.floor(
			maxTripLength / (Time.Second * 30)
		)}.`;
	}

	const tokensToSpend = Math.floor((duration / Time.Minute) * 10 + 10);

	if (!hasAttackCape && amountTokens < tokensToSpend) {
		return `You don't have enough Warrior guild tokens to kill cyclopes for ${formatDuration(
			duration
		)}, try a lower quantity. You need at least ${Math.floor(
			(duration / Time.Minute) * 10 + 10
		)}x Warrior guild tokens to kill ${quantity}x cyclopes.`;
	}

	if (!hasAttackCape) {
		await user.transactItems({
			itemsToRemove: new Bank().add('Warrior guild token', tokensToSpend)
		});
	}

	await ActivityManager.startTrip<ActivityTaskOptionsWithQuantity>({
		userID: user.id,
		channelId,
		quantity,
		duration,
		type: 'Cyclops'
	});

	const response = `${user.minionName} is now off to kill ${quantity}x Cyclops, it'll take around ${formatDuration(
		duration
	)} to finish. ${
		hasAttackCape
			? 'You used no warrior guild tokens because you have an Attack cape.'
			: `Removed ${tokensToSpend} Warrior guild tokens from your bank.`
	}`;

	return response;
}

export async function warriorsGuildCommand(
	user: MUser,
	channelId: string,
	choice: string,
	quantity: number | undefined
) {
	const atkLvl = user.skillLevel('attack');
	const strLvl = user.skillLevel('strength');
	if (atkLvl + strLvl < 130 && atkLvl !== 99 && strLvl !== 99) {
		return "To enter the Warrior's Guild, your Attack and Strength levels must add up to at least 130, or you must have level 99 in either.";
	}

	if (choice === 'cyclops') {
		return cyclopsCommand(user, channelId, quantity);
	}
	return tokensCommand(user, channelId, quantity);
}
