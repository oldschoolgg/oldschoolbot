import { randArrItem } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';
import { addArrayOfNumbers } from 'oldschooljs/dist/util';

import { BotCommand } from '../../lib/BotCommand';
import { championScrolls } from '../../lib/collectionLog';
import { Activity, Emoji, Tasks, Time } from '../../lib/constants';
import { maxOtherStats } from '../../lib/gear/data/maxGearStats';
import { GearSetupTypes } from '../../lib/gear/types';
import { MinigameIDsEnum } from '../../lib/minions/data/minigames';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { HighGambleTable, LowGambleTable, MediumGambleTable } from '../../lib/simulation/baGamble';
import { MakePartyOptions } from '../../lib/types';
import {
	BarbarianAssaultActivityTaskOptions,
	MinigameActivityTaskOptions
} from '../../lib/types/minions';
import {
	calcWhatPercent,
	formatDuration,
	reduceNumByPercent,
	round,
	stringMatches
} from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import getOSItem from '../../lib/util/getOSItem';
import { randomVariation } from '../../lib/util/randomVariation';

const BarbBuyables = [
	{
		item: getOSItem('Fighter hat'),
		cost: 275 * 4
	},
	{
		item: getOSItem('Ranger hat'),
		cost: 275 * 4
	},
	{
		item: getOSItem('Healer hat'),
		cost: 275 * 4
	},
	{
		item: getOSItem('Runner hat'),
		cost: 275 * 4
	},
	{
		item: getOSItem('Fighter torso'),
		cost: 375 * 4
	},
	{
		item: getOSItem('Penance skirt'),
		cost: 375 * 4
	},
	{
		item: getOSItem('Runner boots'),
		cost: 100 * 4
	},
	{
		item: getOSItem('Penance gloves'),
		cost: 150 * 4
	}
];

const levels = [
	{
		level: 2,
		cost: 200 * 4
	},
	{
		level: 3,
		cost: 300 * 4
	},
	{
		level: 4,
		cost: 400 * 4
	},
	{
		level: 5,
		cost: 500 * 4
	}
];

const GambleTiers = [
	{
		name: 'Low',
		cost: 200,
		table: LowGambleTable
	},
	{
		name: 'Medium',
		cost: 400,
		table: MediumGambleTable
	},
	{
		name: 'High',
		cost: 500,
		table: HighGambleTable
	}
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			altProtection: true,
			categoryFlags: ['minion', 'pvm', 'minigame'],
			description:
				'Sends your minion to do the Champions Challenge, if you have all the champion scrolls',
			examples: ['+cc'],
			aliases: ['cc']
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage) {
		const bank = msg.author.bank();
		if (!bank.has(championScrolls)) {
			return msg.send(
				`You don't have a set of Champion Scrolls to do the Champion's Challenge! You need 1 of each.`
			);
		}
		for (const id of championScrolls) bank.remove(id);
		await msg.author.settings.update(UserSettings.Bank, bank.bank);
		await addSubTaskToActivityTask<MinigameActivityTaskOptions>(
			this.client,
			Tasks.MinigameTicker,
			{
				userID: msg.author.id,
				channelID: msg.channel.id,
				quantity: 1,
				duration: Time.Minute * 20,
				type: Activity.ChampionsChallenge,
				minigameID: MinigameIDsEnum.ChampionsChallenge
			}
		);
		return msg.send(
			`**Honour Points:** ${msg.author.settings.get(
				UserSettings.HonourPoints
			)} **Honour Level:** ${msg.author.settings.get(UserSettings.HonourLevel)}\n\n` +
				`You can start a Barbarian Assault party using \`${msg.cmdPrefix}ba start\`, you'll need exactly 4 people to join to start.` +
				` We have a channel dedicated to Barbarian Assault parties in the support server (discord.gg/ob). \n` +
				`Barbarian Assault works differently in the bot than ingame, there's only 1 role, no waves, and 1 balance of honour points.` +
				`\n\nYou can buy rewards with \`${msg.cmdPrefix}ba buy\`, level up your Honour Level with \`${msg.cmdPrefix}ba level\`.` +
				` You can gamble using \`${msg.cmdPrefix}ba gamble high/medium/low\`.`
		);
	}
}
