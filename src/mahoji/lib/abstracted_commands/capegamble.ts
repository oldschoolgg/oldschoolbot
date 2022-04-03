import { KlasaUser } from 'klasa';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';
import { Bank } from 'oldschooljs';

import { client } from '../../..';
import { Events } from '../../../lib/constants';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { roll } from '../../../lib/util';
import chatHeadImage from '../../../lib/util/chatHeadImage';
import { formatOrdinal } from '../../../lib/util/formatOrdinal';
import getOSItem from '../../../lib/util/getOSItem';
import { handleMahojiConfirmation } from '../../mahojiSettings';

export async function capeGambleStatsCommand(user: KlasaUser) {
	const firesGambled = user.settings.get(UserSettings.Stats.FireCapesSacrificed);
	const infernalsGambled = user.settings.get(UserSettings.Stats.InfernalCapesSacrificed);

	return `You can gamble Fire capes and Infernal capes like this: \"\gamble cape fire/infernal\"

**Fire Cape's Sacrificed:** ${firesGambled}
**Infernal Cape's Gambled:** ${infernalsGambled}`;
}

export async function capeGambleCommand(user: KlasaUser, type: string, interaction: SlashCommandInteraction) {
	const firesGambled = user.settings.get(UserSettings.Stats.FireCapesSacrificed);
	const infernalsGambled = user.settings.get(UserSettings.Stats.InfernalCapesSacrificed);
	if (!type) {
		return `You can gamble Fire capes and Infernal capes like this: \"\gamble cape fire/infernal\"
	
	**Fire Cape's Sacrificed:** ${firesGambled}
	**Infernal Cape's Gambled:** ${infernalsGambled}`;
	}

	const item = getOSItem(type === 'fire' ? 'Fire cape' : 'Infernal cape');
	const key = type === 'fire' ? UserSettings.Stats.FireCapesSacrificed : UserSettings.Stats.InfernalCapesSacrificed;

	const capesOwned = await user.bank().amount(item.id);

	if (capesOwned < 1) return `You have no ${item.name}'s' to gamble!`;

	await handleMahojiConfirmation(interaction, `Are you sure you want to gamble a ${item.name}?`);

	const newSacrificedCount = user.settings.get(key) + 1;
	await user.removeItemsFromBank(new Bank().add(item.id));
	await user.settings.update(key, newSacrificedCount);

	const chance = type === 'fire' ? 200 : 100;
	const pet = getOSItem(type === 'fire' ? 'Tzrek-Jad' : 'Jal-nib-rek');

	if (roll(chance)) {
		await user.addItemsToBank({ items: new Bank().add(pet.id), collectionLog: true });
		client.emit(
			Events.ServerNotification,
			`**${user.username}'s** just received their ${formatOrdinal(user.cl().amount(pet.id))} ${
				pet.name
			} pet by sacrificing a ${item.name} for the ${formatOrdinal(newSacrificedCount)} time!`
		);
		return {
			files: [
				await chatHeadImage({
					content:
						type === 'fire'
							? 'You lucky. Better train him good else TzTok-Jad find you, JalYt.'
							: 'Luck be a TzHaar tonight. Jal-Nib-Rek is yours.',
					head: type === 'fire' ? 'mejJal' : 'ketKeh'
				})
			]
		};
	}

	return {
		files: [
			await chatHeadImage({
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
		]
	};
}
