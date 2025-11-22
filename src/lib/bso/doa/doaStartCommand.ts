import type { DOAOptions } from '@/lib/bso/bsoTypes.js';
import {
	calcDOAInput,
	calculateUserGearPercents,
	checkDOATeam,
	checkDOAUser,
	createDOATeam
} from '@/lib/bso/depthsOfAtlantis.js';

import { Emoji, formatDuration, Time } from '@oldschoolgg/toolkit';
import { Bank, Items } from 'oldschooljs';
import { clamp } from 'remeda';

import { degradeItem } from '@/lib/degradeableItems.js';
import { trackLoot } from '@/lib/lootTrack.js';
import type { MakePartyOptions } from '@/lib/types/index.js';
import { bankToStrShortNames } from '@/lib/util/smallUtils.js';
import { mahojiParseNumber } from '@/mahoji/mahojiSettings.js';

export async function doaStartCommand(
	interaction: MInteraction,
	user: MUser,
	challengeMode: boolean,
	solo: boolean,
	channelId: string,
	teamSize: number | undefined,
	quantityInput: number | undefined
): CommandResponse {
	if (await user.minionIsBusy()) {
		return `${user.usernameOrMention} minion is busy`;
	}

	const initialCheck = await checkDOAUser({
		user,
		challengeMode,
		duration: Time.Hour,
		quantity: 1
	});
	if (typeof initialCheck === 'string') {
		return initialCheck;
	}

	if (await user.minionIsBusy()) {
		return "Your minion is busy, so you can't start a raid.";
	}

	const maxSize = mahojiParseNumber({ input: teamSize, min: 2, max: 8 }) ?? 8;

	const partyOptions: MakePartyOptions = {
		interaction,
		leader: user,
		minSize: 1,
		maxSize,
		ironmanAllowed: true,
		message: `${user.usernameOrMention} is hosting a Depths of Atlantis mass! Use the buttons below to join/leave.`,
		customDenier: async checkUser => {
			const checkResult = await checkDOAUser({
				user: checkUser,
				challengeMode,
				duration: Time.Hour,
				quantity: 1
			});
			if (typeof checkResult === 'string') {
				return [true, checkResult];
			}

			return [false];
		}
	};

	const users = solo ? [user] : (await globalClient.makeParty(partyOptions)).slice(0, maxSize);

	if (await ActivityManager.anyMinionIsBusy(users.map(u => u.id))) {
		return 'One of the users in your mass has a busy minion.';
	}

	const teamCheck = await checkDOATeam(users, challengeMode, 1);
	if (typeof teamCheck === 'string') {
		return {
			content: `Your mass failed to start because of this reason: ${teamCheck} ${users}`,
			allowedMentions: {
				users: users.map(i => i.id)
			}
		};
	}

	const baseDuration = createDOATeam({
		team: teamCheck,
		quantity: 1,
		challengeMode
	}).fakeDuration;
	const maxTripLength = Math.max(...(await Promise.all(users.map(i => i.calcMaxTripLength('DepthsOfAtlantis')))));
	const maxQuantity = clamp(Math.floor(maxTripLength / baseDuration), { min: 1, max: 5 });
	const quantity = clamp(quantityInput ?? maxQuantity, { min: 1, max: maxQuantity });

	const createdDOATeam = createDOATeam({
		team: teamCheck,
		quantity,
		challengeMode
	});

	let debugStr = '';

	const totalCost = new Bank();

	const costResult = await Promise.all(
		users.map(async u => {
			const { cost, sangCharges, voidStaffCharges, tumShadowCharges } = await calcDOAInput({
				user: u,
				duration: createdDOATeam.fakeDuration,
				quantity,
				challengeMode
			});
			const { realCost } = await u.specialRemoveItems(cost.clone());

			await degradeItem({
				item: Items.getOrThrow('Sanguinesti staff'),
				chargesToDegrade: sangCharges,
				user: u
			});

			if (voidStaffCharges) {
				await degradeItem({
					item: Items.getOrThrow('Void staff'),
					chargesToDegrade: voidStaffCharges,
					user: u
				});
			} else if (tumShadowCharges) {
				await degradeItem({
					item: Items.getOrThrow("Tumeken's shadow"),
					chargesToDegrade: tumShadowCharges,
					user: u
				});
			} else {
				throw new Error('No staff equipped');
			}
			await u.statsBankUpdate('doa_cost', realCost);
			const effectiveCost = realCost.clone();
			totalCost.add(effectiveCost);

			const { total } = calculateUserGearPercents(u.gear);

			const gearMarker = users.length > 5 ? 'Gear: ' : Emoji.Gear;
			const boostsMarker = users.length > 5 ? 'Boosts: ' : Emoji.CombatSword;
			debugStr += `**- ${u.usernameOrMention}** ${gearMarker}${total.toFixed(
				1
			)}% ${boostsMarker} used ${bankToStrShortNames(realCost)}\n\n`;
			return {
				userID: u.id,
				effectiveCost
			};
		})
	);

	await ClientSettings.updateBankSetting('doa_cost', totalCost);
	await trackLoot({
		totalCost,
		id: 'depths_of_atlantis',
		type: 'Minigame',
		changeType: 'cost',
		users: costResult.map(i => ({
			id: i.userID,
			cost: i.effectiveCost,
			duration: createdDOATeam.realDuration
		}))
	});
	await ActivityManager.startTrip<DOAOptions>({
		userID: user.id,
		channelId,
		duration: createdDOATeam.realDuration,
		type: 'DepthsOfAtlantis',
		leader: user.id,
		users: users.map(i => i.id),
		fakeDuration: createdDOATeam.fakeDuration,
		quantity,
		cm: challengeMode,
		raids: createdDOATeam.raids
	});

	let str = `${partyOptions.leader.usernameOrMention}'s party (${users
		.map(u => u.usernameOrMention)
		.join(', ')}) is now off to do ${quantity === 1 ? 'a' : `${quantity}x`} ${
		challengeMode ? 'Challenge Mode' : ''
	} Depths of Atlantis raid - the total trip will take ${formatDuration(createdDOATeam.fakeDuration)}.`;

	str += ` \n\n${debugStr}`;

	return str;
}
