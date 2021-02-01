import { CommandStore, KlasaMessage } from 'klasa';

import { Activity, Time } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { Castables } from '../../lib/skilling/skills/magic/castables';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { CastingActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[quantity:int{1}|name:...string] [name:...string]',
			usageDelim: ' ',
			description: 'Sends your minion to enchant items.',
			examples: ['+enchant 100 opal bolts', '+enchant ruby bolts'],
			categoryFlags: ['minion', 'skilling']
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [quantity, name = '']: [null | number | string, string]) {
		if (typeof quantity === 'string') {
			name = quantity;
			quantity = null;
		}

		const spell = Castables.find(spell => stringMatches(spell.name, name));

		if (!spell) {
			return msg.send(
				`That is not a valid spell to cast, the spells you can cast are: ${Castables.map(
					i => i.name
				).join(', ')}.`
			);
		}

		if (msg.author.skillLevel(SkillsEnum.Magic) < spell.level) {
			return msg.send(
				`${msg.author.minionName} needs ${spell.level} Magic to cast ${spell.name}.`
			);
		}

		await msg.author.settings.sync(true);
		const userBank = msg.author.bank();

		let timeToEnchantTen = spell.ticks * Time.Second * 0.6 + Time.Second / 4;

		if (quantity === null) {
			quantity = Math.floor(msg.author.maxTripLength / timeToEnchantTen);
			const max = userBank.fits(spell.input);
			if (max < quantity) quantity = max;
		}

		const cost = spell.input.clone().multiply(quantity);
		if (!userBank.has(cost.bank)) {
			return msg.send(
				`You don't have the materials needed to cast ${spell.name}, you need ${
					spell.input
				}, you're missing **${cost.clone().remove(userBank)}**.`
			);
		}
		await msg.author.removeItemsFromBank(cost.bank);

		const duration = quantity * timeToEnchantTen;

		if (duration > msg.author.maxTripLength) {
			return msg.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					msg.author.maxTripLength
				)}, try a lower quantity. The highest amount of ${
					spell.name
				}s you can cast is ${Math.floor(msg.author.maxTripLength / timeToEnchantTen)}.`
			);
		}

		await addSubTaskToActivityTask<CastingActivityTaskOptions>(this.client, {
			spellID: spell.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Casting
		});

		return msg.send(
			`${msg.author.minionName} is now casting ${quantity}x ${
				spell.name
			}, it'll take around ${formatDuration(duration)} to finish.`
		);
	}
}
