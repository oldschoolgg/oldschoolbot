import { percentChance } from '@oldschoolgg/rng';
import { formatDuration, Time, UserError } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import { avasDevices, chompyHats } from '@/lib/data/CollectionsExport.js';
import type { MinigameActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';

const diaryBoosts = [
	['westernprovinces.elite', 100],
	['westernprovinces.medium', 50],
	['westernprovinces.easy', 25]
] as const;

const baseChompyPerHour = 100;

export async function chompyHuntClaimCommand(user: MUser) {
	const chompyScore = await user.fetchMinigameScore('big_chompy_bird_hunting');
	const userBank = user.bank;
	const { cl } = user;

	const missingHats = chompyHats.filter(c => (!userBank.has(c[0].id) || !cl.has(c[0].id)) && chompyScore >= c[1]);

	if (missingHats.length === 0) return 'There is nothing to claim.';
	const missingHatsBank = new Bank();
	for (const mh of missingHats) missingHatsBank.add(mh[0].id, 1);

	await user.addItemsToBank({ items: missingHatsBank, collectionLog: true });
	return `Added the following hats to your bank: ${missingHatsBank}`;
}

export async function chompyHuntCommand(user: MUser, channelId: string) {
	if (user.QP < 10) {
		return 'You need at least 10 QP to hunt Chompy birds.';
	}

	const rangeGear = user.gear.range;
	if (!rangeGear.hasEquipped('Ogre bow') || !rangeGear.hasEquipped('Ogre arrow')) {
		return 'You need an Ogre bow equipped in your range outfit, and Ogre arrows to hunt Chompy birds!';
	}

	const tripLength = await user.calcMaxTripLength('BigChompyBirdHunting');

	const boosts: string[] = [];
	let quantity = Math.floor((baseChompyPerHour / Time.Hour) * tripLength);
	for (const [diary, boost] of diaryBoosts) {
		const hasDiary = user.hasDiary(diary);
		if (hasDiary) {
			let bonus = 0;
			for (let i = 0; i < quantity; i++) {
				if (percentChance(boost)) {
					bonus++;
				}
			}
			quantity += bonus;
			boosts.push(`${boost}% for ${diary.replace('.', ' ')}`);

			break;
		}
	}

	const avasDevice = avasDevices.find(avas => rangeGear.hasEquipped(avas.item.id));
	if (avasDevice) {
		boosts.push(`${avasDevice.reduction}% less arrows for ${avasDevice.item.name}`);
	}

	const cost = new Bank().add('Ogre arrow', quantity);
	const realCost = new Bank();
	try {
		realCost.add((await user.specialRemoveItems(cost)).realCost);
	} catch (err: unknown) {
		if (err instanceof UserError) {
			return err.message;
		}
		throw err;
	}

	await ActivityManager.startTrip<MinigameActivityTaskOptionsWithNoChanges>({
		userID: user.id,
		channelId,
		duration: tripLength,
		type: 'BigChompyBirdHunting',
		quantity,
		minigameID: 'big_chompy_bird_hunting'
	});

	let str = `${user.minionName} is now hunting chompy birds! The trip will take ${formatDuration(
		tripLength
	)}. Removing items: ${realCost}.`;

	if (boosts.length > 0) {
		str += `\n**Boosts:** ${boosts.join(', ')}.`;
	}

	return str;
}
