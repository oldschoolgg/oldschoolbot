import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';
import { Bank } from 'oldschooljs';

import { Events } from '../../../lib/constants';
import { roll } from '../../../lib/util';
import { newChatHeadImage } from '../../../lib/util/chatHeadImage';
import { formatOrdinal } from '../../../lib/util/formatOrdinal';
import getOSItem from '../../../lib/util/getOSItem';
import { handleMahojiConfirmation } from '../../mahojiSettings';

export async function capeGambleStatsCommand(user: MUser) {
	const firesGambled = user.user.stats_fireCapesSacrificed;
	const infernalsGambled = user.user.infernal_cape_sacrifices;

	return `You can gamble Fire capes and Infernal capes like this: \"\gamble cape fire/infernal\"

**Fire Cape's Sacrificed:** ${firesGambled}
**Infernal Cape's Gambled:** ${infernalsGambled}`;
}

export async function capeGambleCommand(user: MUser, type: string, interaction: SlashCommandInteraction) {
	const item = getOSItem(type === 'fire' ? 'Fire cape' : 'Infernal cape');
	const key: 'infernal_cape_sacrifices' | 'stats_fireCapesSacrificed' =
		type === 'fire' ? 'stats_fireCapesSacrificed' : 'infernal_cape_sacrifices';
	const capesOwned = await user.bank.amount(item.id);

	if (capesOwned < 1) return `You have no ${item.name}'s to gamble!`;

	await handleMahojiConfirmation(interaction, `Are you sure you want to gamble a ${item.name}?`);

	const newUser = await user.update({
		[key]: {
			increment: 1
		}
	});
	const newSacrificedCount = newUser.newUser[key];
	await user.removeItemsFromBank(new Bank().add(item.id));

	const chance = type === 'fire' ? 200 : 100;
	const pet = getOSItem(type === 'fire' ? 'Tzrek-Jad' : 'Jal-nib-rek');

	if (roll(chance)) {
		await user.addItemsToBank({ items: new Bank().add(pet.id), collectionLog: true });
		globalClient.emit(
			Events.ServerNotification,
			`**${user.usernameOrMention}'s** just received their ${formatOrdinal(
				(await mUserFetch(user.id)).cl.amount(pet.id)
			)} ${pet.name} pet by sacrificing a ${item.name} for the ${formatOrdinal(newSacrificedCount)} time!`
		);
		return {
			attachments: [
				{
					fileName: 'image.jpg',
					buffer: await newChatHeadImage({
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
		attachments: [
			{
				fileName: 'image.jpg',
				buffer: await newChatHeadImage({
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
