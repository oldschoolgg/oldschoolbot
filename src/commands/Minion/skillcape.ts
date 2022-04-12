import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';
import { toKMB } from 'oldschooljs/dist/util/util';

import { Channel } from '../../lib/constants';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Skillcapes, { MasterSkillcapes } from '../../lib/skilling/skillcapes';
import { BotCommand } from '../../lib/structures/BotCommand';
import { cleanMentions, convertXPtoLVL, countSkillsAtleast99, stringMatches, toTitleCase } from '../../lib/util';
import { sendToChannelID } from '../../lib/util/webhook';

const skillCapeCost = 99_000;

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<skillname:string>',
			altProtection: true,
			categoryFlags: ['minion'],
			description: 'Purchases skillcapes from the bot, you can buy untrimmed capes if its your first 99.',
			examples: ['+skillcape mining']
		});
	}

	async run(msg: KlasaMessage, [skillName]: [string]) {
		skillName = skillName.toLowerCase();

		await msg.author.settings.sync(true);
		const GP = msg.author.settings.get(UserSettings.GP);

		if (skillName.includes('master')) {
			const cost = 1_000_000_000;
			const masterCape = MasterSkillcapes.find(cape => stringMatches(cape.item.name, skillName));
			if (!masterCape) return msg.channel.send("That's not a valid master cape.");
			if ((msg.author.settings.get(`skills.${masterCape.skill}`) as number) < 500_000_000) {
				return msg.channel.send('You need 500m XP in a skill to buy the master cape for it.');
			}
			if (GP < cost) {
				return msg.channel.send(`You need ${toKMB(cost)} GP to purchase a master skill cape.`);
			}

			await msg.confirm(
				`${msg.author}, please confirm that you want to purchase a ${masterCape.item.name} for ${toKMB(cost)}.`
			);

			await msg.author.removeGP(cost);
			await msg.author.addItemsToBank({ items: { [masterCape.item.id]: 1 }, collectionLog: true });
			await this.client.settings.update(
				ClientSettings.EconomyStats.BuyCostBank,
				new Bank(this.client.settings.get(ClientSettings.EconomyStats.BuyCostBank)).add('Coins', cost).bank
			);

			sendToChannelID(this.client, Channel.Notifications, {
				content: `${cleanMentions(null, msg.author.username)} just purchased a ${masterCape.item.name}!`
			});

			return msg.channel.send(`You purchased 1x ${masterCape.item.name} for ${toKMB(cost)}.`);
		}

		if (GP < skillCapeCost) return msg.channel.send("You don't have enough GP to buy a skill cape.");

		const capeObject = Skillcapes.find(cape => stringMatches(cape.skill, skillName));
		if (!capeObject) return msg.channel.send("That's not a valid skill.");

		const levelInSkill = convertXPtoLVL(msg.author.settings.get(`skills.${skillName}`) as number);

		if (levelInSkill < 99) {
			return msg.channel.send(
				`Your ${toTitleCase(skillName)} level is less than 99! You can't buy a skill cape, noob.`
			);
		}

		const itemsToPurchase =
			countSkillsAtleast99(msg.author) > 1
				? { [capeObject.hood]: 1, [capeObject.trimmed]: 1 }
				: { [capeObject.hood]: 1, [capeObject.untrimmed]: 1 };

		const itemString = new Bank(itemsToPurchase).toString();

		await msg.confirm(
			`${msg.author}, please confirm that you want to purchase ${itemString} for ${toKMB(skillCapeCost)}.`
		);

		await msg.author.removeGP(skillCapeCost);
		await msg.author.addItemsToBank({ items: itemsToPurchase, collectionLog: true });
		await this.client.settings.update(
			ClientSettings.EconomyStats.BuyCostBank,
			new Bank(this.client.settings.get(ClientSettings.EconomyStats.BuyCostBank)).add('Coins', skillCapeCost).bank
		);

		return msg.channel.send(`You purchased ${itemString} for ${toKMB(skillCapeCost)}.`);
	}
}
