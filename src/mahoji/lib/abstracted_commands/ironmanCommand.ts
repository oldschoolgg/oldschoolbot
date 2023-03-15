import { Prisma } from '@prisma/client';
import { ChatInputCommandInteraction } from 'discord.js';
import { noOp } from 'e';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import { BitField } from '../../../lib/constants';
import { roboChimpUserFetch } from '../../../lib/roboChimp';
import { prisma } from '../../../lib/settings/prisma';
import { assert } from '../../../lib/util';
import { handleMahojiConfirmation } from '../../../lib/util/handleMahojiConfirmation';
import { minionIsBusy } from '../../../lib/util/minionIsBusy';
import { mahojiUsersSettingsFetch } from '../../mahojiSettings';

export async function ironmanCommand(user: MUser, interaction: ChatInputCommandInteraction, permanent?: boolean) {
	if (minionIsBusy(user.id)) return 'Your minion is busy.';
	if (user.isIronman) {
		const isPerm = user.bitfield.includes(BitField.PermanentIronman);
		if (isPerm) return "You're a **permanent** ironman and you cannot de-iron.";
		if (permanent) {
			await handleMahojiConfirmation(
				interaction,
				'Would you like to change your ironman to a *permanent* iron? The only thing in your account that will change, is that you will no longer be able to de-iron. This is *permanent* and cannot be reversed.'
			);
			await user.update({
				bitfield: {
					push: BitField.PermanentIronman
				}
			});
			return 'You are now a **permanent** Ironman, Enjoy!';
		}
		await handleMahojiConfirmation(
			interaction,
			'Would you like to stop being an ironman? You will keep all your items and stats but you will have to start over if you want to play as an ironman again.'
		);
		await user.update({
			minion_ironman: false
		});
		return 'You are no longer an ironman.';
	}

	const existingGiveaways = await prisma.giveaway.findMany({
		where: {
			user_id: user.id,
			completed: false
		}
	});

	if (existingGiveaways.length !== 0) {
		return "You can't become an ironman because you have active giveaways.";
	}

	await handleMahojiConfirmation(
		interaction,
		`Are you sure you want to start over and play as an ironman?

:warning: **Read the following text before confirming. This is your only warning. ** :warning:

The following things will be COMPLETELY reset/wiped from your account, with no chance of being recovered: Your entire bank, collection log, GP/Coins, QP/Quest Points, Clue Scores, Monster Scores, all XP. If you type \`confirm\`, they will all be wiped.

After becoming an ironman:
	- You will no longer be able to receive GP from  \`+daily\`
	- You will no longer be able to use \`+pay\`, \`+duel\`, \`+sellto\`, \`+sell\`, \`+dice\`
	- You can de-iron at any time, and keep all your stuff acquired while playing as an ironman.`
	);

	const mUser = await mahojiUsersSettingsFetch(user.id);

	type KeysThatArentReset =
		| 'ironman_alts'
		| 'main_account'
		| 'bank_bg_hex'
		| 'bank_sort_weightings'
		| 'bank_sort_method'
		| 'premium_balance_expiry_date'
		| 'premium_balance_tier'
		| 'minion_bought_date'
		| 'id'
		| 'pets'
		| 'RSN'
		| 'bitfield';

	const bitFieldsToKeep: BitField[] = [
		BitField.IsPatronTier1,
		BitField.IsPatronTier2,
		BitField.IsPatronTier3,
		BitField.IsPatronTier4,
		BitField.IsPatronTier5,
		BitField.isModerator,
		BitField.isContributor,
		BitField.BypassAgeRestriction,
		BitField.HasPermanentEventBackgrounds,
		BitField.HasPermanentTierOne,
		BitField.DisabledRandomEvents,
		BitField.AlwaysSmallBank,
		BitField.IsWikiContributor,
		BitField.IsPatronTier6
	];

	const createOptions: Required<Pick<Prisma.UserCreateInput, KeysThatArentReset>> = {
		id: user.id,
		main_account: mUser.main_account,
		ironman_alts: mUser.ironman_alts,
		bank_bg_hex: mUser.bank_bg_hex,
		bank_sort_method: mUser.bank_sort_method,
		bank_sort_weightings: mUser.bank_sort_weightings as ItemBank,
		minion_bought_date: mUser.minion_bought_date,
		RSN: mUser.RSN,
		premium_balance_expiry_date: mUser.premium_balance_expiry_date,
		premium_balance_tier: mUser.premium_balance_tier,
		pets: mUser.pets as ItemBank,
		bitfield: bitFieldsToKeep.filter(i => user.bitfield.includes(i))
	};

	try {
		// Delete tables with foreign keys first:
		await prisma.botItemSell.deleteMany({ where: { user_id: user.id } }).catch(noOp);
		await prisma.pinnedTrip.deleteMany({ where: { user_id: user.id } }).catch(noOp);
		await prisma.farmedCrop.deleteMany({ where: { user_id: user.id } }).catch(noOp);
		// Now we can delete the user
		await prisma.user.delete({
			where: { id: user.id }
		});
		await prisma.user.create({
			data: createOptions
		});
		await prisma.slayerTask.deleteMany({ where: { user_id: user.id } }).catch(noOp);
		await prisma.playerOwnedHouse.delete({ where: { user_id: user.id } }).catch(noOp);
		await prisma.minigame.delete({ where: { user_id: user.id } }).catch(noOp);
		await prisma.xPGain.deleteMany({ where: { user_id: BigInt(user.id) } }).catch(noOp);
		await prisma.newUser.delete({ where: { id: user.id } }).catch(noOp);
		await prisma.activity.deleteMany({ where: { user_id: BigInt(user.id) } }).catch(noOp);
		await prisma.stashUnit.deleteMany({ where: { user_id: BigInt(user.id) } }).catch(noOp);
		await prisma.userStats.deleteMany({ where: { user_id: BigInt(user.id) } }).catch(noOp);

		// Refund the leagues points they spent
		const roboChimpUser = await roboChimpUserFetch(user.id);
		if (roboChimpUser.leagues_points_total >= 0) {
			await roboChimpClient.user.update({
				where: {
					id: BigInt(user.id)
				},
				data: {
					leagues_points_balance_osb: roboChimpUser.leagues_points_balance_osb
				}
			});
		}
	} catch (_) {}

	const { newUser } = await user.update({
		minion_ironman: true,
		minion_hasBought: true
	});
	assert(
		!newUser.GP && !newUser.QP && !newUser.skills_woodcutting && !newUser.total_cox_points,
		`Ironman sanity check - ID: ${newUser.id}`
	);
	return 'You are now an ironman.';
}
