import { formatOrdinal } from '@oldschoolgg/toolkit';
import { ChatInputCommandInteraction } from 'discord.js';
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

export async function capeGambleCommand(
	user: MUser,
	type: string,
	interaction: ChatInputCommandInteraction,
	autoconfirm: boolean = false
) {
	const item = getOSItem(type === 'fire' ? 'Fire cape' : 'Infernal cape');
	const key: 'infernal_cape_sacrifices' | 'firecapes_sacrificed' =
		type === 'fire' ? 'firecapes_sacrificed' : 'infernal_cape_sacrifices';
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
			firecapes_sacrificed: true
		}
	);
	const newSacrificedCount = newStats[key];

	const chance = type === 'fire' ? 200 : 100;
	const pet = getOSItem(type === 'fire' ? 'Tzrek-Jad' : 'Jal-nib-rek');
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
						content:
							type === 'fire'
								? 'You lucky. Better train him good else TzTok-Jad find you, JalYt.'
								: 'Luck be a TzHaar tonight. Jal-Nib-Rek is yours.',
						head: type === 'fire' ? 'mejJal' : 'ketKeh'
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
					content:
						type === 'fire'
							? `You not lucky. Maybe next time, JalYt. This is the ${formatOrdinal(
									newSacrificedCount
							  )} time you gamble cape.`
							: `No Jal-Nib-Rek for you. This is the ${formatOrdinal(
									newSacrificedCount
							  )} time you gamble cape.`,
					head: type === 'fire' ? 'mejJal' : 'ketKeh'
				})
			}
		]
	};
}
