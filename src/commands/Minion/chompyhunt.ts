import { percentChance } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { Activity, Time } from '../../lib/constants';
import { userhasDiaryTier, WesternProv } from '../../lib/diaries';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { MinigameActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import getOSItem from '../../lib/util/getOSItem';

const diaryBoosts = [
	[WesternProv.elite, 100],
	[WesternProv.medium, 50],
	[WesternProv.easy, 25]
] as const;

const baseChompyPerHour = 150;

export const chompyHats = [
	[getOSItem('Chompy bird hat (ogre bowman)'), 30],
	[getOSItem('Chompy bird hat (bowman)'), 40],
	[getOSItem('Chompy bird hat (ogre yeoman)'), 50],
	[getOSItem('Chompy bird hat (yeoman)'), 70],
	[getOSItem('Chompy bird hat (ogre marksman)'), 95],
	[getOSItem('Chompy bird hat (marksman)'), 125],
	[getOSItem('Chompy bird hat (ogre woodsman)'), 170],
	[getOSItem('Chompy bird hat (woodsman)'), 225],
	[getOSItem('Chompy bird hat (ogre forester)'), 300],
	[getOSItem('Chompy bird hat (forester)'), 400],
	[getOSItem('Chompy bird hat (ogre bowmaster)'), 550],
	[getOSItem('Chompy bird hat (bowmaster)'), 700],
	[getOSItem('Chompy bird hat (ogre expert)'), 1000],
	[getOSItem('Chompy bird hat (expert)'), 1300],
	[getOSItem('Chompy bird hat (ogre dragon archer)'), 1700],
	[getOSItem('Chompy bird hat (dragon archer)'), 2250],
	[getOSItem('Chompy bird hat (expert ogre dragon archer)'), 3000],
	[getOSItem('Chompy bird hat (expert dragon archer)'), 4000]
] as const;

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			description: 'Sends your minion to catch chompies.',
			examples: ['+chompyhunt', '+ch'],
			categoryFlags: ['minion', 'minigame'],
			subcommands: true,
			aliases: ['ch']
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage) {
		if (msg.author.settings.get(UserSettings.QP) < 10) {
			return msg.channel.send(`You need atleast 10 QP to hunt Chompy birds.`);
		}

		const tripLength = msg.author.maxTripLength(Activity.BigChompyBirdHunting);

		let boosts = [];
		let quantity = (baseChompyPerHour / Time.Hour) * tripLength;
		for (const [diary, boost] of diaryBoosts) {
			const [hasDiary] = await userhasDiaryTier(msg.author, diary);
			if (hasDiary) {
				let bonus = 0;
				for (let i = 0; i < quantity; i++) {
					if (percentChance(boost)) {
						bonus++;
					}
				}
				quantity += bonus;
				boosts.push(`${boost}% for ${diary.name} ${WesternProv.name}`);

				break;
			}
		}

		const cost = new Bank().add('Ogre arrow', quantity);
		if (!msg.author.owns(cost)) {
			return msg.channel.send(
				`You don't have enough Ogre arrow's to kill ${quantity}x Chompy birds, you need ${quantity}.`
			);
		}

		await msg.author.removeItemsFromBank(cost);

		await addSubTaskToActivityTask<MinigameActivityTaskOptions>(this.client, {
			userID: msg.author.id,
			channelID: msg.channel.id,
			duration: tripLength,
			type: Activity.BigChompyBirdHunting,
			quantity,
			minigameID: 'BigChompyBirdHunting'
		});

		let str = `${
			msg.author.minionName
		} is now hunting Big Chompy's! The trip will take ${formatDuration(tripLength)}.`;

		if (boosts.length > 0) {
			str += `\n**Boosts:** ${boosts.join(', ')}.`;
		}

		return msg.send(str);
	}
}
