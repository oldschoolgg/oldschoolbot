import { Prisma } from '@prisma/client';
import { noOp } from 'e';
import { KlasaUser } from 'klasa';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import { roboChimpUserFetch } from '../../../lib/roboChimp';
import { prisma } from '../../../lib/settings/prisma';
import { assert } from '../../../lib/util';
import { minionIsBusy } from '../../../lib/util/minionIsBusy';
import { handleMahojiConfirmation, mahojiUserSettingsUpdate, mahojiUsersSettingsFetch } from '../../mahojiSettings';

export async function ironmanCommand(user: KlasaUser, interaction: SlashCommandInteraction) {
	if (minionIsBusy(user.id)) return 'Your minion is busy.';
	if (user.isIronman) {
		return 'You are alrady an ironman.';
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
	- You will no longer be able to receive GP from  \`=daily\`
	- You will no longer be able to use \`=pay\`, \`=duel\`, \`=sellto\`, \`=sell\`, \`=dice\`, \`=gri\`
	- You **cannot** de-iron, it is PERMANENT.
    - Your entire BSO account, EVERYTHING, will be reset.
Type \`confirm permanent ironman\` if you understand the above information, and want to become an ironman now.`
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
		| 'patreon_id'
		| 'github_id';
	const createOptions: Required<Pick<Prisma.UserCreateInput, KeysThatArentReset>> = {
		id: user.id,
		main_account: mUser.main_account,
		ironman_alts: mUser.ironman_alts,
		bank_bg_hex: mUser.bank_bg_hex,
		bank_sort_method: mUser.bank_sort_method,
		bank_sort_weightings: mUser.bank_sort_weightings as ItemBank,
		minion_bought_date: mUser.minion_bought_date,
		github_id: mUser.github_id,
		patreon_id: mUser.patreon_id,
		RSN: mUser.RSN,
		premium_balance_expiry_date: mUser.premium_balance_expiry_date,
		premium_balance_tier: mUser.premium_balance_tier,
		pets: mUser.pets as ItemBank
	};

	try {
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
		await prisma.tameActivity.deleteMany({ where: { user_id: user.id } });
		await prisma.tame.deleteMany({ where: { user_id: user.id } });
		await prisma.fishingContestCatch.deleteMany({ where: { user_id: BigInt(user.id) } });

		// Refund the leagues points they spent
		const roboChimpUser = await roboChimpUserFetch(BigInt(user.id));
		if (roboChimpUser.leagues_points_total >= 0) {
			await roboChimpClient.user.update({
				where: {
					id: Number(user.id)
				},
				data: {
					leagues_points_balance_bso: roboChimpUser.leagues_points_balance_bso
				}
			});
		}
	} catch (_) {}

	const { newUser } = await mahojiUserSettingsUpdate(user.id, {
		minion_ironman: true,
		minion_hasBought: true
	});
	assert(
		!newUser.GP && !newUser.QP && !newUser.skills_woodcutting && !newUser.total_cox_points,
		'Ironman sanity check'
	);
	return 'You are now an ironman.';
}
