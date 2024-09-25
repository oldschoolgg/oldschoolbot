import { formatOrdinal } from '@oldschoolgg/toolkit/util';
import type { ChatInputCommandInteraction } from 'discord.js';
import { Bank } from 'oldschooljs';

import { Events } from '../../../lib/constants';
import { roll } from '../../../lib/util';
import { newChatHeadImage } from '../../../lib/util/chatHeadImage';
import getOSItem from '../../../lib/util/getOSItem';
import { handleMahojiConfirmation } from '../../../lib/util/handleMahojiConfirmation';
import { userStatsUpdate } from '../../mahojiSettings';

export async function capeGambleStatsCommand(user: MUser) {
	const stats = await user.fetchStats({ firecapes_sacrificed: true, infernal_cape_sacrifices: true });

	return `You can gamble Fire capes and Infernal capes like this: \"\gamble cape fire/infernal\"

**Fire Cape's Sacrificed:** ${stats.firecapes_sacrificed}
**Infernal Cape's Gambled:** ${stats.infernal_cape_sacrifices}`;
}

const itemGambles = [
	{
		type: 'fire',
		item: getOSItem('Fire cape'),
		trackerKey: 'firecapes_sacrificed',
		chatHead: 'mejJal',
		chance: 200,
		success: {
			loot: getOSItem('Tzrek-Jad'),
			message: 'You lucky. Better train him good else TzTok-Jad find you, JalYt.'
		},
		failMessage: (newSacrificedCount: number) =>
			`You not lucky. Maybe next time, JalYt. This is the ${formatOrdinal(
				newSacrificedCount
			)} time you gamble cape.`
	},
	{
		type: 'infernal',
		item: getOSItem('Infernal cape'),
		trackerKey: 'infernal_cape_sacrifices',
		chatHead: 'ketKeh',
		chance: 100,
		success: {
			loot: getOSItem('Jal-nib-rek'),
			message: 'Luck be a TzHaar tonight. Jal-Nib-Rek is yours.'
		},
		failMessage: (newSacrificedCount: number) =>
			`No Jal-Nib-Rek for you. This is the ${formatOrdinal(newSacrificedCount)} time you gamble cape.`
	},
	{
		type: 'quiver',
		item: getOSItem("Dizana's quiver (uncharged)"),
		trackerKey: 'quivers_sacrificed',
		chatHead: 'minimus',
		chance: 200,
		success: {
			loot: getOSItem('Smol heredit'),
			message: 'He seems to like you. Smol heredit is yours.'
		},
		failMessage: (newSacrificedCount: number) =>
			`He doesn't want to go with you. Sorry. This is the ${formatOrdinal(
				newSacrificedCount
			)} time you gambled a quiver.`
	}
] as const;

export async function capeGambleCommand(
	user: MUser,
	type: string,
	interaction: ChatInputCommandInteraction,
	autoconfirm = false
) {
	const src = itemGambles.find(i => i.type === type);
	if (!src) return 'Invalid type. You can only gamble fire capes, infernal capes, or quivers.';
	const { item } = src;
	const key = src.trackerKey;
	const capesOwned = user.bank.amount(item.id);

	if (capesOwned < 1) return `You have no ${item.name}'s to gamble!`;

	if (!autoconfirm) {
		await handleMahojiConfirmation(interaction, `Are you sure you want to gamble a ${item.name}?`);
	}

	// Double check after confirmation dialogue:
	await user.sync();
	if (user.bank.amount(item.id) < 1) return `You have no ${item.name}'s to gamble!`;

	const newStats = await userStatsUpdate(
		user.id,
		{
			[key]: {
				increment: 1
			}
		},
		{
			infernal_cape_sacrifices: true,
			firecapes_sacrificed: true,
			quivers_sacrificed: true
		}
	);
	const newSacrificedCount = newStats[key];

	const { chance } = src;
	const pet = src.success.loot;
	const gotPet = roll(chance);
	const loot = gotPet ? new Bank().add(pet.id) : undefined;

	await user.transactItems({ itemsToAdd: loot, itemsToRemove: new Bank().add(item.id), collectionLog: true });

	if (gotPet) {
		globalClient.emit(
			Events.ServerNotification,
			`**${user.badgedUsername}'s** just received their ${formatOrdinal(
				(await mUserFetch(user.id)).cl.amount(pet.id)
			)} ${pet.name} pet by sacrificing a ${item.name} for the ${formatOrdinal(newSacrificedCount)} time!`
		);
		return {
			files: [
				{
					name: 'image.jpg',
					attachment: await newChatHeadImage({
						content: src.success.message,
						head: src.chatHead
					})
				}
			]
		};
	}

	return {
		files: [
			{
				name: 'image.jpg',
				attachment: await newChatHeadImage({
					content: src.failMessage(newSacrificedCount),
					head: src.chatHead
				})
			}
		]
	};
}
