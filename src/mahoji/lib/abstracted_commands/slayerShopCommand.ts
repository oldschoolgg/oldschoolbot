import type { ChatInputCommandInteraction } from 'discord.js';
import { removeFromArr } from 'e';
import { Bank } from 'oldschooljs';

import { BitField } from '../../../lib/constants';
import { SlayerRewardsShop } from '../../../lib/slayer/slayerUnlocks';
import { makeTable, stringMatches } from '../../../lib/util';
import { handleMahojiConfirmation } from '../../../lib/util/handleMahojiConfirmation';
import { logError } from '../../../lib/util/logError';

const slayerPurchaseError =
	'An error occurred trying to make this purchase. Please try again or contact #help-and-support if the issue persists.';

export async function slayerShopBuyCommand({
	userID,
	buyable,
	quantity,
	disable,
	interaction
}: {
	userID: string;
	buyable: string;
	quantity?: number;
	disable?: boolean;
	interaction?: ChatInputCommandInteraction;
}) {
	const user = await mUserFetch(userID);
	const buyableObj = SlayerRewardsShop.find(
		reward => stringMatches(reward.name, buyable) || reward.aliases?.some(alias => stringMatches(alias, buyable))
	);
	if (!buyableObj) {
		return `Cannot find Slayer buyable with the name ${buyable}`;
	}
	if (buyableObj.item) {
		// Handle buying items with slayer points:
		if (buyableObj.haveOne && user.allItemsOwned.has(buyableObj.item)) {
			return `You already own a ${buyableObj.name}`;
		}
		const qty = buyableObj.haveOne ? 1 : (quantity ?? 1);
		const cost = qty * buyableObj.slayerPointCost;
		if (user.user.slayer_points >= cost) {
			try {
				await user.update({ slayer_points: { decrement: cost } });
				await user.addItemsToBank({ items: new Bank().add(buyableObj.item, qty), collectionLog: true });
				return `You bought ${qty}x ${buyableObj.name}.`;
			} catch (e) {
				logError(e, {
					user_id: user.id,
					slayer_buyable: buyable,
					slayer_buyable_id: String(buyableObj.id),
					quantity: String(qty)
				});
				return slayerPurchaseError;
			}
		} else {
			return `You don't have enough slayer points to purchase ${qty}x ${buyableObj.name}. You need ${cost} and you have ${user.user.slayer_points}.`;
		}
	} else if (!disable) {
		// Here we unlock and unlockable reward:
		if (user.user.slayer_unlocks.includes(buyableObj.id)) {
			return `You already have ${buyableObj.name} unlocked.`;
		}
		const cost = buyableObj.slayerPointCost;
		if (user.user.slayer_points >= cost) {
			const newUnlocks = [...user.user.slayer_unlocks, buyableObj.id];
			try {
				const { newUser } = await user.update({
					slayer_points: { decrement: cost },
					slayer_unlocks: newUnlocks
				});
				if (
					newUnlocks.length === SlayerRewardsShop.filter(u => !u.item).length &&
					!user.bitfield.includes(BitField.HadAllSlayerUnlocks)
				) {
					await user.update({
						bitfield: {
							push: BitField.HadAllSlayerUnlocks
						}
					});
				}
				return `You successfully unlocked ${buyableObj.name}. Remaining slayer points: ${newUser.slayer_points}`;
			} catch (e) {
				logError(e, { user_id: user.id, slayer_unlock: buyable });
				return slayerPurchaseError;
			}
		} else {
			return `You don't have enough slayer points to purchase ${buyableObj.name} You need ${buyableObj.slayerPointCost} and have ${user.user.slayer_points}`;
		}
	} else {
		// Here we will disable a previous unlocked reward.
		if (!user.user.slayer_unlocks.includes(buyableObj.id)) {
			return `You don't have ${buyableObj.name} unlocked.`;
		}
		if (interaction) {
			await handleMahojiConfirmation(
				interaction,
				`Are you sure you want disable ${buyableObj.name}? You will have to pay ${buyableObj.slayerPointCost} to unlock it again.`
			);
		}
		const newUnlocks = removeFromArr(user.user.slayer_unlocks, buyableObj.id);
		await user.update({ slayer_unlocks: newUnlocks });
		return `You have disabled the reward: ${buyableObj.name}.`;
	}
}
export function slayerShopListMyUnlocks(mahojiUser: MUser) {
	if (mahojiUser.user.slayer_unlocks.length === 0) {
		return "You don't have any Slayer rewards unlocked.";
	}
	const myUnlocks = SlayerRewardsShop.filter(srs => mahojiUser.user.slayer_unlocks.includes(srs.id));
	const unlocksStr = myUnlocks.map(unlock => unlock.name).join('\n');

	const content = `Current points: ${mahojiUser.user.slayer_points}\n**You currently have the following rewards unlocked:**\n${unlocksStr}\n\nUsage:\n\`/slayer rewards [unlock|buy|disable] Reward\`\nExample:\n\`/slayer rewards unlock unlockable:Malevolent Masquerade\``;
	if (content.length > 2000) {
		return {
			content: 'Your currently unlocked Slayer rewards',
			files: [{ attachment: Buffer.from(content.replace(/`/g, '')), name: 'myUnlocks.txt' }]
		};
	}
	return content;
}

export function slayerShopListRewards(type: 'all' | 'unlocks' | 'buyables') {
	const availableUnlocks = SlayerRewardsShop.filter(srs =>
		type === 'all' ? true : type === 'unlocks' ? !srs.item : Boolean(srs.item)
	);

	const unlockTable = makeTable(
		['Slayer Points', 'name: ', 'Description', 'Type'],
		availableUnlocks.map(i => [i.slayerPointCost, i.name, i.desc, i.extendMult === undefined ? 'unlock' : 'extend'])
	);

	const content = type === 'all' ? 'List of all slayer rewards' : `List sof slayer ${type}`;
	return {
		content,
		files: [{ attachment: Buffer.from(unlockTable), name: 'slayerRewardsUnlocks.txt' }]
	};
}
