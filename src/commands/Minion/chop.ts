import { CommandStore, KlasaMessage } from 'klasa';

import { Favours, gotFavour } from '../../lib/minions/data/kourendFavour';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Woodcutting from '../../lib/skilling/skills/woodcutting';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { WoodcuttingActivityTaskOptions } from '../../lib/types/minions';
import { determineWoodcuttingTime, formatDuration, itemNameFromID, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import itemID from '../../lib/util/itemID';

const axes = [
	{
		id: itemID('Crystal axe'),
		multiplier: 4,
		wcLvl: 71
	},
	{
		id: itemID('Infernal axe'),
		multiplier: 3.75,
		wcLvl: 61
	},
	{
		id: itemID('Dragon axe'),
		multiplier: 3.75,
		wcLvl: 61
	},
	{
		id: itemID('Rune axe'),
		multiplier: 3.5,
		wcLvl: 41
	},
	{
		id: itemID('Adamant axe'),
		multiplier: 3,
		wcLvl: 31
	},
	{
		id: itemID('Mithril axe'),
		multiplier: 2.5,
		wcLvl: 21
	},
	{
		id: itemID('Black axe'),
		multiplier: 2.25,
		wcLvl: 11
	},
	{
		id: itemID('Steel axe'),
		multiplier: 2,
		wcLvl: 6
	},
	{
		id: itemID('Iron axe'),
		multiplier: 1.5,
		wcLvl: 1
	},
	{
		id: itemID('Bronze axe'),
		multiplier: 1,
		wcLvl: 1
	}
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			usage: '<quantity:int{1}|name:...string> [name:...string]',
			usageDelim: ' ',
			description: 'Sends your minion to chop logs.',
			examples: ['+chop 100 logs', '+chop magic logs'],
			categoryFlags: ['skilling', 'minion']
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [quantity, name = '']: [null | number | string, string]) {
		if (typeof quantity === 'string') {
			name = quantity;
			quantity = null;
		}

		const log = Woodcutting.Logs.find(
			log =>
				stringMatches(log.name, name) ||
				stringMatches(log.name.split(' ')[0], name) ||
				log.aliases?.some(a => stringMatches(a, name))
		);

		if (!log) {
			return msg.channel.send(
				`That's not a valid log to chop. Valid logs are ${Woodcutting.Logs.map(log => log.name).join(', ')}.`
			);
		}

		if (msg.author.skillLevel(SkillsEnum.Woodcutting) < log.level) {
			return msg.channel.send(`${msg.author.minionName} needs ${log.level} Woodcutting to chop ${log.name}.`);
		}

		const QP = msg.author.settings.get(UserSettings.QP);
		if (QP < log.qpRequired) {
			return msg.channel.send(`${msg.author.minionName} needs ${log.qpRequired} QP to cut ${log.name}.`);
		}

		const [hasFavour, requiredPoints] = gotFavour(msg.author, Favours.Hosidius, 75);
		if (!hasFavour && log.name === 'Redwood Logs') {
			return msg.channel.send(
				`${msg.author.minionName} needs ${requiredPoints}% Hosidius Favour to chop Redwood at the Woodcutting Guild!`
			);
		}

		let powerChopping = false;
		if (msg.flagArgs.pc || msg.flagArgs.powerchop || msg.flagArgs.powerChopping || msg.flagArgs.powerchopping) {
			powerChopping = true;
		}

		// If the user has an axe apply boost
		const boosts = [];
		let multiplier = 0;
		for (const axe of axes) {
			if (
				msg.author.hasItemEquippedOrInBank(axe.id) &&
				msg.author.skillLevel(SkillsEnum.Woodcutting) >= axe.wcLvl
			) {
				multiplier = axe.multiplier;
				boosts.push(`${axe.multiplier}x speed for ${itemNameFromID(axe.id)}`);
				break;
			}
		}

		if (multiplier === 0) {
			return msg.channel.send('You need to own a axe suitable for your woodcutting level!');
		}

		let wcLvl = msg.author.skillLevel(SkillsEnum.Woodcutting);

		// Invisible wc boost for woodcutting guild
		if (msg.author.skillLevel(SkillsEnum.Woodcutting) >= 60 && log.wcGuild && hasFavour) {
			wcLvl += 7;
		}

		// Calculate the time it takes to chop a single log of this type, at this persons level.
		let [timetoChop, newQuantity] = determineWoodcuttingTime(
			quantity,
			msg.author,
			log,
			multiplier,
			powerChopping,
			wcLvl
		);

		const duration = timetoChop;

		await addSubTaskToActivityTask<WoodcuttingActivityTaskOptions>({
			logID: log.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity: newQuantity,
			duration,
			powerChopping,
			type: 'Woodcutting'
		});

		let response = `${msg.author.minionName} is now chopping ${newQuantity}x ${
			log.name
		}, it'll take around ${formatDuration(duration)} to finish.`;

		if (boosts.length > 0) {
			response += `\n\n**Boosts:** ${boosts.join(', ')}.`;
		}

		return msg.channel.send(response);
	}
}
