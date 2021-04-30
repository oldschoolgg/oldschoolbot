import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { Activity, Time } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { getNewUser } from '../../lib/settings/settings';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { MinigameActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, stringMatches, updateBankSetting } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { determineRunes } from '../../lib/util/determineRunes';
import getOSItem from '../../lib/util/getOSItem';
import { pizazzPointsPerHour } from '../../tasks/minions/minigames/mageTrainingArenaActivity';

const RuneTable = new LootTable()
	.every('Law rune', [11, 14])
	.every('Cosmic rune', [18, 22])
	.every('Nature rune', [18, 22])
	.every('Fire rune', [35, 45]);

const buyables = [
	{
		item: getOSItem('Infinity gloves'),
		cost: 420
	},
	{
		item: getOSItem('Infinity hat'),
		cost: 810
	},
	{
		item: getOSItem('Infinity top'),
		cost: 960
	},
	{
		item: getOSItem('Infinity bottoms'),
		cost: 1110
	},
	{
		item: getOSItem('Infinity boots'),
		cost: 280
	},
	{
		item: getOSItem('Beginner wand'),
		cost: 30
	},
	{
		item: getOSItem('Apprentice wand'),
		cost: 71,
		upgradesFrom: getOSItem('Beginner wand')
	},
	{
		item: getOSItem('Teacher wand'),
		cost: 143,
		upgradesFrom: getOSItem('Apprentice wand')
	},
	{
		item: getOSItem('Master wand'),
		cost: 575,
		upgradesFrom: getOSItem('Teacher wand')
	},
	{
		item: getOSItem("Mage's book"),
		cost: 1260
	}
];

export default class CastleWarsCommand extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			description: 'Sends your minion to train the Mage Training Arena.',
			usage: '[train|buy] [name:...str]',
			usageDelim: ' ',
			examples: ['+mta'],
			categoryFlags: ['minion', 'minigame'],
			subcommands: true
		});
	}

	async run(msg: KlasaMessage) {
		const user = await getNewUser(msg.author.id);
		return msg.send(`You have **${user.PizazzPoints.toLocaleString()}** Pizazz points.

**Pizazz Points Per Hour:** ${pizazzPointsPerHour}
${buyables
	.map(
		i =>
			`${i.item.name} - ${i.cost} pts - ${formatDuration(
				(i.cost / pizazzPointsPerHour) * (Time.Minute * 60)
			)}`
	)
	.join('\n')}

Hint: Magic Training Arena is combined into 1 room, and 1 set of points - rewards take approximately the same amount of time to get.`);
	}

	@requiresMinion
	@minionNotBusy
	async train(msg: KlasaMessage) {
		const roomDuration = Time.Minute * 14;
		const quantity = Math.floor(
			msg.author.maxTripLength(Activity.MageTrainingArena) / roomDuration
		);
		const duration = quantity * roomDuration;

		const cost = determineRunes(msg.author, new Bank().add(RuneTable.roll())).multiply(
			quantity
		);

		if (!msg.author.owns(cost)) {
			return msg.channel.send(
				`You don't have enough items for this trip, you need: ${cost}.`
			);
		}

		await msg.author.removeItemsFromBank(cost);
		await updateBankSetting(this.client, ClientSettings.EconomyStats.MTACostBank, cost);

		await addSubTaskToActivityTask<MinigameActivityTaskOptions>(this.client, {
			userID: msg.author.id,
			channelID: msg.channel.id,
			duration,
			type: Activity.MageTrainingArena,
			quantity,
			minigameID: 'MagicTrainingArena'
		});

		return msg.send(
			`${
				msg.author.minionName
			} is now doing ${quantity} Magic Training Arena rooms. The trip will take around ${formatDuration(
				duration
			)}. Removed ${cost} from your bank.`
		);
	}

	async buy(msg: KlasaMessage, [input = '']: [string]) {
		const buyable = buyables.find(i => stringMatches(input, i.item.name));
		if (!buyable) {
			return msg.send(
				`Here are the items you can buy: \n\n${buyables
					.map(i => `**${i.item.name}:** ${i.cost} points`)
					.join('\n')}.`
			);
		}

		const { item, cost, upgradesFrom } = buyable;
		const newUser = await getNewUser(msg.author.id);
		const balance = newUser.PizazzPoints;

		if (upgradesFrom && !msg.author.owns(upgradesFrom.id)) {
			return msg.channel.send(
				`To buy a ${item.name}, you need to upgrade to it with a ${upgradesFrom.name}, which you do not own.`
			);
		}

		if (balance < cost) {
			return msg.send(
				`You don't have enough Pizazz Points to buy the ${item.name}. You need ${cost}, but you have only ${balance}.`
			);
		}

		if (upgradesFrom) {
			await msg.author.removeItemFromBank(upgradesFrom.id);
		}
		newUser.PizazzPoints -= cost;
		await newUser.save();

		await msg.author.addItemsToBank({ [item.id]: 1 }, true);

		return msg.send(`Successfully purchased 1x ${item.name} for ${cost} Pizazz Points.`);
	}
}
