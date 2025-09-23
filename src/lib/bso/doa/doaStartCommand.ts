import { type CommandResponse, formatDuration } from '@oldschoolgg/toolkit';
import { Emoji } from '@oldschoolgg/toolkit/constants';
import { channelIsSendable } from '@oldschoolgg/toolkit/discord-util';
import { clamp, Time } from 'e';
import { Bank, Items } from 'oldschooljs';

import { degradeItem } from '@/lib/degradeableItems.js';
import {
	calcDOAInput,
	calculateUserGearPercents,
	checkDOATeam,
	checkDOAUser,
	createDOATeam
} from '@/lib/depthsOfAtlantis.js';
import { trackLoot } from '@/lib/lootTrack.js';
import { setupParty } from '@/lib/party.js';
import type { MakePartyOptions } from '@/lib/types/index.js';
import type { DOAOptions } from '@/lib/types/minions.js';
import addSubTaskToActivityTask from '@/lib/util/addSubTaskToActivityTask.js';
import { calcMaxTripLength } from '@/lib/util/calcMaxTripLength.js';
import { bankToStrShortNames } from '@/lib/util/smallUtils.js';
import { updateBankSetting } from '@/lib/util/updateBankSetting.js';
import { mahojiParseNumber, userStatsBankUpdate } from '@/mahoji/mahojiSettings.js';

export async function doaStartCommand(
	user: MUser,
	challengeMode: boolean,
	solo: boolean,
	channelID: string,
	teamSize: number | undefined,
	quantityInput: number | undefined
): CommandResponse {
	if (user.minionIsBusy) {
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

	if (user.minionIsBusy) {
		return "Your minion is busy, so you can't start a raid.";
	}

	const maxSize = mahojiParseNumber({ input: teamSize, min: 2, max: 8 }) ?? 8;

	const partyOptions: MakePartyOptions = {
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

	const channel = globalClient.channels.cache.get(channelID);
	if (!channelIsSendable(channel)) return 'No channel found.';

	let usersWhoConfirmed = [];
	try {
		usersWhoConfirmed = solo ? [user] : await setupParty(channel, user, partyOptions);
	} catch (err: any) {
		return {
			content: typeof err === 'string' ? err : 'Your mass failed to start.',
			ephemeral: true
		};
	}
	const users = usersWhoConfirmed.filter(u => !u.minionIsBusy).slice(0, maxSize);

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
	const maxTripLength = Math.max(...users.map(i => calcMaxTripLength(i, 'DepthsOfAtlantis')));
	const maxQuantity = clamp(Math.floor(maxTripLength / baseDuration), 1, 5);
	const quantity = clamp(quantityInput ?? maxQuantity, 1, maxQuantity);

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
			await userStatsBankUpdate(u.id, 'doa_cost', realCost);
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

	await updateBankSetting('doa_cost', totalCost);
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
	await addSubTaskToActivityTask<DOAOptions>({
		userID: user.id,
		channelID: channelID.toString(),
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
