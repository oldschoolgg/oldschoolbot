import { CommandStore, KlasaMessage } from 'klasa';

import { Activity, Emoji, Time } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { MakePartyOptions } from '../../lib/types';
import { SoulWarsOptions } from '../../lib/types/minions';
import { formatDuration, randomVariation, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import getOSItem from '../../lib/util/getOSItem';

const buyables = [
	{
		item: getOSItem('Red soul cape'),
		tokens: 2500
	},
	{
		item: getOSItem('Blue soul cape'),
		tokens: 2500
	},
	{
		item: getOSItem('Ectoplasmator'),
		tokens: 250
	},
	{
		item: getOSItem('Spoils of war'),
		tokens: 30
	}
];

const imbueables = [
	{
		input: getOSItem('Black mask'),
		output: getOSItem('Black mask (i)'),
		tokens: 500
	},
	{
		input: getOSItem('Slayer helmet'),
		output: getOSItem('Slayer helmet (i)'),
		tokens: 500
	},
	{
		input: getOSItem('Turquoise slayer helmet'),
		output: getOSItem('Turquoise slayer helmet (i)'),
		tokens: 500
	},
	{
		input: getOSItem('Red slayer helmet'),
		output: getOSItem('Red slayer helmet (i)'),
		tokens: 500
	},
	{
		input: getOSItem('Green slayer helmet'),
		output: getOSItem('Green slayer helmet (i)'),
		tokens: 500
	},
	{
		input: getOSItem('Twisted slayer helmet'),
		output: getOSItem('Twisted slayer helmet (i)'),
		tokens: 500
	},
	{
		input: getOSItem('Black slayer helmet'),
		output: getOSItem('Black slayer helmet (i)'),
		tokens: 500
	},
	{
		input: getOSItem('Purple slayer helmet'),
		output: getOSItem('Purple slayer helmet (i)'),
		tokens: 500
	},
	{
		input: getOSItem('Hydra slayer helmet'),
		output: getOSItem('Hydra slayer helmet (i)'),
		tokens: 500
	},
	{
		input: getOSItem('Salve amulet'),
		output: getOSItem('Salve amulet (i)'),
		tokens: 320
	},
	{
		input: getOSItem('Salve amulet (e)'),
		output: getOSItem('Salve amulet(ei)'),
		tokens: 320
	},
	{
		input: getOSItem('Ring of the gods'),
		output: getOSItem('Ring of the gods (i)'),
		tokens: 260
	},
	{
		input: getOSItem('Ring of suffering'),
		output: getOSItem('Ring of suffering (i)'),
		tokens: 300
	},
	{
		input: getOSItem('Ring of suffering (r)'),
		output: getOSItem('Ring of suffering (ri)'),
		tokens: 300
	},
	{
		input: getOSItem('Berserker ring'),
		output: getOSItem('Berserker ring (i)'),
		tokens: 260
	},
	{
		input: getOSItem('Warrior ring'),
		output: getOSItem('Warrior ring (i)'),
		tokens: 260
	},
	{
		input: getOSItem('Archers ring'),
		output: getOSItem('Archers ring (i)'),
		tokens: 260
	},
	{
		input: getOSItem('Seers ring'),
		output: getOSItem('Seers ring (i)'),
		tokens: 260
	},
	{
		input: getOSItem('Tyrannical ring'),
		output: getOSItem('Tyrannical ring (i)'),
		tokens: 260
	},
	{
		input: getOSItem('Treasonous ring'),
		output: getOSItem('Treasonous ring (i)'),
		tokens: 260
	},
	{
		input: getOSItem('Granite ring'),
		output: getOSItem('Granite ring (i)'),
		tokens: 200
	}
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			altProtection: true,
			requiredPermissions: ['ADD_REACTIONS', 'ATTACH_FILES'],
			categoryFlags: ['minion', 'minigame'],
			description: 'Sends your minion to do the Soul Wars minigame.',
			examples: ['+soulwars'],
			subcommands: true,
			usage: '[buy|imbue] [str:...str]',
			usageDelim: ' ',
			aliases: ['sw']
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [input]: [string]) {
		const partyOptions: MakePartyOptions = {
			leader: msg.author,
			minSize: 1,
			maxSize: 99,
			ironmanAllowed: true,
			message: `${msg.author.username} is starting a Soul Wars mass! Anyone can click the ${Emoji.Join} reaction to join, click it again to leave.`,
			customDenier: user => {
				if (!user.hasMinion) {
					return [true, "you don't have a minion."];
				}
				if (user.minionIsBusy) {
					return [true, 'your minion is busy.'];
				}

				return [false];
			}
		};

		const users =
			input === 'solo'
				? [msg.author]
				: (await msg.makePartyAwaiter(partyOptions)).filter(u => !u.minionIsBusy);
		if (users.length === 0) {
			return;
		}

		const perDuration = randomVariation(Time.Minute * 7, 5);
		const quantity = Math.floor(msg.author.maxTripLength(Activity.SoulWars) / perDuration);
		const duration = quantity * perDuration;

		await addSubTaskToActivityTask<SoulWarsOptions>(this.client, {
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.SoulWars,
			leader: msg.author.id,
			users: users.map(u => u.id)
		});

		const str = `${partyOptions.leader.username}'s party (${users
			.map(u => u.username)
			.join(
				', '
			)}) is now off to do ${quantity}x games of Soul Wars - the total trip will take ${formatDuration(
			duration
		)}.`;

		return msg.channel.send(str);
	}

	async buy(msg: KlasaMessage, [input = '']: [string]) {
		const item = buyables.find(i => stringMatches(input, i.item.name));
		if (!item) {
			return msg.channel.send(
				`That's not a valid item to buy from the Soul Wars shop. These are the items you can buy: ${buyables
					.map(i => i.item.name)
					.join(', ')}.`
			);
		}
		const bal = msg.author.settings.get(UserSettings.ZealTokens);
		if (bal < item.tokens) {
			return msg.channel.send(
				`You don't have enough Zeal Tokens to buy a ${item.item.name}. You have ${bal} but need ${item.tokens}.`
			);
		}
		await msg.author.settings.update(UserSettings.ZealTokens, bal - item.tokens);
		await msg.author.addItemsToBank({ [item.item.id]: 1 }, true);
		return msg.channel.send(
			`Added 1x ${item.item.name} to your bank, removed ${item.tokens}x Zeal Tokens.`
		);
	}

	async imbue(msg: KlasaMessage, [input = '']: [string]) {
		const item = imbueables.find(
			i => stringMatches(input, i.input.name) || stringMatches(input, i.output.name)
		);
		if (!item) {
			return msg.channel.send(
				`That's not a valid item you can imbue. These are the items you can imbue: ${imbueables
					.map(i => i.input.name)
					.join(', ')}.`
			);
		}
		const bal = msg.author.settings.get(UserSettings.ZealTokens);
		if (bal < item.tokens) {
			return msg.channel.send(
				`You don't have enough Zeal Tokens to imbue a ${item.input.name}. You have ${bal} but need ${item.tokens}.`
			);
		}
		const bank = msg.author.bank();
		if (!bank.has(item.input.id)) {
			return msg.send(`You don't have a ${item.input.name}.`);
		}
		await msg.author.settings.update(UserSettings.ZealTokens, bal - item.tokens);
		await msg.author.removeItemsFromBank({ [item.input.id]: 1 });
		await msg.author.addItemsToBank({ [item.output.id]: 1 }, true);
		return msg.channel.send(
			`Added 1x ${item.output.name} to your bank, removed ${item.tokens}x Zeal Tokens and 1x ${item.input.name}.`
		);
	}
}
