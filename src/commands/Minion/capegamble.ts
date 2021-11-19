import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { Events } from '../../lib/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { roll } from '../../lib/util';
import chatHeadImage from '../../lib/util/chatHeadImage';
import { formatOrdinal } from '../../lib/util/formatOrdinal';
import getOSItem from '../../lib/util/getOSItem';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			categoryFlags: ['minion'],
			examples: ['+capegamble infernal', '+capegamble infernal', '+capegamble skin'],
			usage: '[fire|infernal|skin]',
			description: 'Allows you to gamble fire capes for a chance at the jad pet.'
		});
	}	

	async run(msg: KlasaMessage, [type]: ['fire' | 'infernal' | 'skin' | undefined]) {
		const firesGambled = msg.author.settings.get(UserSettings.Stats.FireCapesSacrificed);
		const infernalsGambled = msg.author.settings.get(UserSettings.Stats.InfernalCapesSacrificed);
		const skinsGambled = msg.author.settings.get(UserSettings.Stats.SkinsSacrificed);
		if (!type) {
			return msg.channel
				.send(`You can gamble Fire capes and Infernal capes, and Zuk skins like this: \`${msg.cmdPrefix}capegamble fire/infernal/skin\`

**Fire Cape's Gambled:** ${firesGambled}
**Infernal Cape's Gambled:** ${infernalsGambled}
**Skins Gambled:** ${skinsGambled}`);
		}

		const item = getOSItem(type === 'fire' ? 'Fire cape' : 'Infernal cape' : "TzKal-Zuk's skin");
		const key =
			type === 'fire' ? UserSettings.Stats.FireCapesSacrificed : UserSettings.Stats.InfernalCapesSacrificed : UserSettings.Stats.SkinsSacrificed;

		const capesOwned = await msg.author.bank().amount(item.id);

		if (capesOwned < 1) return msg.channel.send(`You have no ${item.name}'s' to gamble!`);

		await msg.confirm(`Are you sure you want to gamble a ${item.name}?`);

		const newSacrificedCount = msg.author.settings.get(key) + 1;
		await msg.author.removeItemsFromBank(new Bank().add(item.id));
		await msg.author.settings.update(key, newSacrificedCount);

		const chance = type === 'fire' ? 200 : 100 : 175;
		const pet = getOSItem(type === 'fire' ? 'Tzrek-Jad' : 'Jal-nib-rek' : 'Jal-MejJak');

		if (roll(chance)) {
			await msg.author.addItemsToBank(new Bank().add(pet.id), true);
			this.client.emit(
				Events.ServerNotification,
				`**${msg.author.username}'s** just received their ${formatOrdinal(msg.author.cl().amount(pet.id))} ${
					pet.name
				} pet by sacrificing a ${item.name} for the ${formatOrdinal(newSacrificedCount)} time!`
			);
			return msg.channel.send({
				files: [
					await chatHeadImage({
						content:
							type === 'fire'
								? 'You lucky. Better train him good else TzTok-Jad find you, JalYt.'
								: 'Luck be a TzHaar tonight. Jal-Nib-Rek is yours.',
								: 'JalYt luck shines today, Jal-MejJak heal you good.',
						head: type === 'fire' ? 'mejJal' : 'ketKeh'
					})
				]
			});
		}
		return msg.channel.send({
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
							: `Jal-MejJak did not join you. This is the ${formatOrdinal(
									newSacrificedCount
							  )} time you gamble cape.`,
					head: type === 'fire' ? 'mejJal' : 'ketKeh'
				})
			]
		});
	}
}
