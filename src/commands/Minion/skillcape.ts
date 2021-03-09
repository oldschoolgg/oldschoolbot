import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';
import { toKMB } from 'oldschooljs/dist/util/util';

import { Channel, Time } from '../../lib/constants';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Skillcapes, { MasterSkillcapes } from '../../lib/skilling/skillcapes';
import { BotCommand } from '../../lib/structures/BotCommand';
import {
	cleanMentions,
	convertXPtoLVL,
	countSkillsAtleast99,
	stringMatches,
	toTitleCase
} from '../../lib/util';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import { sendToChannelID } from '../../lib/util/webhook';

const skillCapeCost = 99_000;

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<skillname:string>',
			oneAtTime: true,
			cooldown: 5,
			altProtection: true,
			categoryFlags: ['minion'],
			description:
				'Purchases skillcapes from the bot, you can buy untrimmed capes if its your first 99.',
			examples: ['+skillcape mining']
		});
	}

	async run(msg: KlasaMessage, [skillName]: [string]) {
		skillName = skillName.toLowerCase();

		await msg.author.settings.sync(true);
		const GP = msg.author.settings.get(UserSettings.GP);

		if (skillName.includes('master')) {
			const cost = 1_000_000_000;
			const masterCape = MasterSkillcapes.find(cape =>
				stringMatches(cape.item.name, skillName)
			);
			if (!masterCape) return msg.send(`That's not a valid master cape.`);
			if ((msg.author.settings.get(`skills.${masterCape.skill}`) as number) < 500_000_000) {
				return msg.send(`You need 500m XP in a skill to buy the master cape for it.`);
			}
			if (GP < cost) {
				return msg.send(`You need ${toKMB(cost)} GP to purchase a master skill cape.`);
			}
			const sellMsg = await msg.channel.send(
				`${msg.author}, say \`confirm\` to confirm that you want to purchase a ${
					masterCape.item.name
				} for ${toKMB(cost)}.`
			);

			// Confirm the user wants to buy
			try {
				await msg.channel.awaitMessages(
					_msg =>
						_msg.author.id === msg.author.id &&
						_msg.content.toLowerCase() === 'confirm',
					{
						max: 1,
						time: Time.Second * 15,
						errors: ['time']
					}
				);
			} catch (err) {
				return sellMsg.edit(`Cancelling purchase.`);
			}

			await msg.author.removeGP(cost);
			await msg.author.addItemsToBank({ [masterCape.item.id]: 1 }, true);
			await this.client.settings.update(
				ClientSettings.EconomyStats.BuyCostBank,
				new Bank(this.client.settings.get(ClientSettings.EconomyStats.BuyCostBank)).add(
					'Coins',
					cost
				).bank
			);

			sendToChannelID(this.client, Channel.Notifications, {
				content: `${cleanMentions(null, msg.author.username)} just purchased a ${
					masterCape.item.name
				}!`
			});

			return msg.send(`You purchased 1x ${masterCape.item.name} for ${toKMB(cost)}.`);
		}

		if (GP < skillCapeCost) return msg.send(`You don't have enough GP to buy a skill cape.`);

		const capeObject = Skillcapes.find(cape => stringMatches(cape.skill, skillName));
		if (!capeObject) return msg.send(`That's not a valid skill.`);

		const levelInSkill = convertXPtoLVL(
			msg.author.settings.get(`skills.${skillName}`) as number
		);

		if (levelInSkill < 99) {
			return msg.send(
				`Your ${toTitleCase(
					skillName
				)} level is less than 99! You can't buy a skill cape, noob.`
			);
		}

		const itemsToPurchase =
			countSkillsAtleast99(msg.author) > 1
				? { [capeObject.hood]: 1, [capeObject.trimmed]: 1 }
				: { [capeObject.hood]: 1, [capeObject.untrimmed]: 1 };

		const itemString = await createReadableItemListFromBank(this.client, itemsToPurchase);

		const sellMsg = await msg.channel.send(
			`${
				msg.author
			}, say \`confirm\` to confirm that you want to purchase ${itemString} for ${toKMB(
				skillCapeCost
			)}.`
		);

		// Confirm the user wants to buy
		try {
			await msg.channel.awaitMessages(
				_msg =>
					_msg.author.id === msg.author.id && _msg.content.toLowerCase() === 'confirm',
				{
					max: 1,
					time: Time.Second * 15,
					errors: ['time']
				}
			);
		} catch (err) {
			return sellMsg.edit(
				`Cancelling purchase of ${toTitleCase(capeObject.skill)} skill cape.`
			);
		}

		await msg.author.removeGP(skillCapeCost);
		await msg.author.addItemsToBank(itemsToPurchase, true);
		await this.client.settings.update(
			ClientSettings.EconomyStats.BuyCostBank,
			new Bank(this.client.settings.get(ClientSettings.EconomyStats.BuyCostBank)).add(
				'Coins',
				skillCapeCost
			).bank
		);

		return msg.send(`You purchased ${itemString} for ${toKMB(skillCapeCost)}.`);
	}
}
