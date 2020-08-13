import { CommandStore, KlasaMessage } from 'klasa';
import { BotCommand } from '../../lib/BotCommand';
import { stringMatches, formatDuration, rand } from '../../lib/util';
import { Time, Activity, Tasks } from '../../lib/constants';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { BankstandActivityTaskOptions } from '../../lib/types/minions';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';

export const Banks = [
	'Falador west',
	'Falador east',
	'Grand exchange',
	'GE',
	'Varrock west',
	'Varrock east',
	'Lumbridge'
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Stand at a bank of choice',
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[name:...string]',
			usageDelim: ' ',
			aliases: ['bs', 'bankstand']
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [bankName = '']: [string]) {
		bankName = bankName.toLowerCase();
		if (!msg.author.hasMinion) {
			throw `You dont have a minion`;
		}

		if (msg.author.minionIsBusy) {
			return msg.send(msg.author.minionStatus);
		}
		let bank;

		if (bankName === 'random') {
			bank = Banks[rand(0, Banks.length - 1)];
		} else {
			bank = Banks.find(
				bank => stringMatches(bank, bankName) || stringMatches(bank.split(' ')[0], bankName)
			);
		}

		if (!bank) {
			throw `Thats not a valid bank to stand at. Valid banks are ${Banks.map(
				bank => bank
			).join(', ')}.`;
		}

		// Time to stand at bank
		const lessTime = rand(0, 5);
		const bankStandTime = Time.Minute * 30 - Time.Minute * lessTime;
		await msg.author.settings.sync(true);
		const duration = bankStandTime;

		const data: BankstandActivityTaskOptions = {
			bankID: bank,
			userID: msg.author.id,
			channelID: msg.channel.id,
			duration,
			type: Activity.Bankstanding,
			id: rand(1, 10_000_000),
			finishDate: Date.now() + duration / 100000
		};

		await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);

		return msg.send(
			`${
				msg.author.minionName
			} is now bankstanding at ${bank}, it'll take around ${formatDuration(
				duration
			)} to finish.`
		);
	}
}
