import { percentChance, reduceNumByPercent, Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { userhasDiaryTier, WesternProv } from '../../lib/diaries';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { MinigameActivityTaskOptions } from '../../lib/types/minions';
import { addArrayOfNumbers, formatDuration } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import getOSItem from '../../lib/util/getOSItem';

const diaryBoosts = [
	[WesternProv.elite, 100],
	[WesternProv.medium, 50],
	[WesternProv.easy, 25]
] as const;

const baseChompyPerHour = 100;

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

const avas = [
	[getOSItem("Ava's accumulator"), 72],
	[getOSItem("Ava's assembler"), 80]
] as const;

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			usage: '[claim]',
			description: 'Sends your minion to catch chompies.',
			examples: ['+chompyhunt', '+ch', '+ch claim'],
			categoryFlags: ['minion', 'minigame'],
			subcommands: true,
			aliases: ['ch']
		});
	}

	@requiresMinion
	async claim(msg: KlasaMessage) {
		const chompyScore = await msg.author.getMinigameScore('big_chompy_bird_hunting');
		const userBank = msg.author.bank({ withGP: true });
		const cl = msg.author.cl();

		const missingHats = chompyHats.filter(c => (!userBank.has(c[0].id) || !cl.has(c[0].id)) && chompyScore >= c[1]);

		if (missingHats.length === 0) return msg.channel.send('There is nothing to claim.');
		const missingHatsBank = new Bank();
		for (const mh of missingHats) missingHatsBank.add(mh[0].id, 1);

		const totalPrice = addArrayOfNumbers(missingHats.map(m => m[1] * 44));

		if (msg.author.bank({ withGP: true }).amount('Coins') < totalPrice) {
			return msg.channel.send(
				`You need at least ${totalPrice.toLocaleString()} GP to claim the hats you are missing.`
			);
		}

		await msg.confirm(
			`You need to pay a fee of ${totalPrice.toLocaleString()} GP to claim all the hats you are missing from your bank/collection log. Do you want to pay the fee?`
		);

		await msg.author.removeGP(totalPrice);
		await msg.author.addItemsToBank({ items: missingHatsBank, collectionLog: true });

		return msg.channel.send(`Added the following hats to your bank: ${missingHatsBank}`);
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage) {
		if (msg.author.settings.get(UserSettings.QP) < 10) {
			return msg.channel.send('You need atleast 10 QP to hunt Chompy birds.');
		}

		const rangeGear = msg.author.getGear('range');
		if (!rangeGear.hasEquipped('Ogre bow')) {
			return msg.channel.send(
				'You need an Ogre bow equipped in your range outfit, and Ogre arrows to hunt Chompy birds!'
			);
		}

		const tripLength = msg.author.maxTripLength('BigChompyBirdHunting');

		let boosts = [];
		let quantity = Math.floor((baseChompyPerHour / Time.Hour) * tripLength);
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

		let arrowsNeeded = quantity;
		for (const [ava, percent] of avas) {
			if (rangeGear.hasEquipped(ava.name)) {
				arrowsNeeded = Math.floor(reduceNumByPercent(arrowsNeeded, percent));
				boosts.push(`${percent}% less arrows for ${ava.name}`);
				break;
			}
		}

		const cost = new Bank().add('Ogre arrow', arrowsNeeded);
		if (!msg.author.owns(cost)) {
			return msg.channel.send(
				`You don't have enough Ogre arrow's to kill ${quantity}x Chompy birds, you need ${arrowsNeeded}.`
			);
		}

		await msg.author.removeItemsFromBank(cost);

		await addSubTaskToActivityTask<MinigameActivityTaskOptions>({
			userID: msg.author.id,
			channelID: msg.channel.id,
			duration: tripLength,
			type: 'BigChompyBirdHunting',
			quantity,
			minigameID: 'big_chompy_bird_hunting'
		});

		let str = `${msg.author.minionName} is now hunting Big Chompy's! The trip will take ${formatDuration(
			tripLength
		)}. Removed ${cost} from your bank.`;

		if (boosts.length > 0) {
			str += `\n**Boosts:** ${boosts.join(', ')}.`;
		}

		return msg.channel.send(str);
	}
}
