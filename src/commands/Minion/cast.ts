import { Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { Activity } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { Castables } from '../../lib/skilling/skills/magic/castables';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { CastingActivityTaskOptions } from '../../lib/types/minions';
import { addBanks, formatDuration, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { determineRunes } from '../../lib/util/determineRunes';

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
			return msg.channel.send(
				`That is not a valid spell to cast, the spells you can cast are: ${Castables.map(i => i.name).join(
					', '
				)}.`
			);
		}

		if (msg.author.skillLevel(SkillsEnum.Magic) < spell.level) {
			return msg.channel.send(`${msg.author.minionName} needs ${spell.level} Magic to cast ${spell.name}.`);
		}

		if (spell.craftLevel && msg.author.skillLevel(SkillsEnum.Crafting) < spell.craftLevel) {
			return msg.channel.send(
				`${msg.author.minionName} needs ${spell.craftLevel} Crafting to cast ${spell.name}.`
			);
		}

		if (spell.qpRequired && msg.author.settings.get(UserSettings.QP) < spell.qpRequired) {
			return msg.channel.send(`${msg.author.minionName} needs ${spell.qpRequired} QP to cast ${spell.name}.`);
		}

		await msg.author.settings.sync(true);
		const userBank = msg.author.bank();

		let timeToEnchantTen = spell.ticks * Time.Second * 0.6 + Time.Second / 4;

		const maxTripLength = msg.author.maxTripLength(Activity.Casting);

		const quantitySpecified = quantity !== null;

		if (quantity === null) {
			quantity = Math.floor(maxTripLength / timeToEnchantTen);
			const spellRunes = determineRunes(msg.author, spell.input.clone());
			const max = userBank.fits(spellRunes);
			if (max < quantity && max !== 0) quantity = max;
		}

		const duration = quantity * timeToEnchantTen;

		if (duration > maxTripLength) {
			return msg.channel.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					maxTripLength
				)}, try a lower quantity. The highest amount of ${spell.name}s you can cast is ${Math.floor(
					maxTripLength / timeToEnchantTen
				)}.`
			);
		}
		const cost = determineRunes(msg.author, spell.input.clone().multiply(quantity));
		if (!userBank.has(cost.bank)) {
			return msg.channel.send(
				`You don't have the materials needed to cast ${quantity}x ${spell.name}, you need ${
					spell.input
				}, you're missing **${cost.clone().remove(userBank)}** (Cost: ${cost}).`
			);
		}

		const userGP = msg.author.settings.get(UserSettings.GP);

		let gpCost = 0;
		if (spell.gpCost) {
			gpCost = spell.gpCost * quantity;
			if (gpCost > userGP) {
				return msg.channel.send(`You need ${gpCost} GP to create ${quantity} planks.`);
			}
			await msg.author.removeGP(gpCost);
		}

		await msg.author.removeItemsFromBank(cost.bank);
		await this.client.settings.update(
			ClientSettings.EconomyStats.MagicCostBank,
			addBanks([this.client.settings.get(ClientSettings.EconomyStats.MagicCostBank), cost.bank])
		);

		await addSubTaskToActivityTask<CastingActivityTaskOptions>({
			spellID: spell.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Casting,
			quantitySpecified
		});

		const magicXpHr = `${Math.round(
			((spell.xp * quantity) / (duration / Time.Minute)) * 60
		).toLocaleString()} Magic XP/Hr`;

		let craftXpHr = '';
		if (spell.craftXp) {
			craftXpHr = `and** ${Math.round(
				((spell.craftXp * quantity) / (duration / Time.Minute)) * 60
			).toLocaleString()} Crafting XP/Hr**`;
		}

		return msg.channel.send(
			`${msg.author.minionName} is now casting ${quantity}x ${spell.name}, it'll take around ${formatDuration(
				duration
			)} to finish. Removed ${cost}${
				spell.gpCost ? ` and ${gpCost} Coins` : ''
			} from your bank. **${magicXpHr}** ${craftXpHr}`
		);
	}
}
