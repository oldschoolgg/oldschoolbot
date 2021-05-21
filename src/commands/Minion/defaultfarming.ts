import { CommandStore, KlasaMessage } from 'klasa';

import { requiresMinion } from '../../lib/minions/decorators';
import { CompostTier } from '../../lib/minions/farming/types';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { stringMatches } from '../../lib/util';

const CompostTiers = [
	{
		name: 'Compost'
	},
	{
		name: 'Supercompost'
	},
	{
		name: 'Ultracompost'
	}
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			usage: '[tier|pay] [CompostTierOrEnable:...string]',
			usageDelim: ' ',
			oneAtTime: true,
			subcommands: true,
			description:
				'Changes which compost tier to automatically use while farming and whether or not to autopay for crops.',
			examples: ['+defaultfarming tier supercompost', '+defaultfarming pay enable']
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage) {
		await msg.author.settings.sync(true);
		const currentCompostTier = msg.author.settings.get(UserSettings.Minion.DefaultCompostToUse);
		const currentPaymentSetting = msg.author.settings.get(UserSettings.Minion.DefaultPay);

		return msg.send(
			`Your current compost tier to automatically use is ${currentCompostTier}.` +
				`\nYour current payment default is ${
					currentPaymentSetting ? `` : `**not**`
				} to automatically pay.` +
				`\n\`${msg.cmdPrefix}defaultfarming tier <compost_type>\` will set your default compost to what you specify.` +
				`\n\`${msg.cmdPrefix}defaultfarming pay <enable/disable>\` will either enable automatic payments or disable them.`
		);
	}

	async tier(msg: KlasaMessage, [newCompostTier]: [CompostTier]) {
		await msg.author.settings.sync(true);

		if (newCompostTier === undefined) {
			return msg.send(
				'You must specify a compost type. The available tiers to select are `compost`, `supercompost`, and `ultracompost`.' +
					`For example, \`${msg.cmdPrefix}defaultfarming tier supercompost\`.`
			);
		}

		const compostTier = CompostTiers.find(i => stringMatches(newCompostTier, i.name));
		if (!compostTier) {
			return msg.send(
				'The available tiers to select are `compost`, `supercompost`, and `ultracompost`.' +
					`For example, \`${msg.cmdPrefix}defaultfarming tier supercompost\`.`
			);
		}

		const currentCompostTier = msg.author.settings.get(UserSettings.Minion.DefaultCompostToUse);

		if (currentCompostTier !== newCompostTier) {
			await msg.author.settings.update(
				UserSettings.Minion.DefaultCompostToUse,
				newCompostTier
			);

			return msg.send(
				`Your minion will now automatically use ${newCompostTier} for farming, if you have any.`
			);
		}
		return msg.send(`You are already automatically using this type of compost.`);
	}

	async pay(msg: KlasaMessage, [trueOrFalse]: ['enable' | 'disable']) {
		await msg.author.settings.sync(true);

		if (trueOrFalse === 'enable') {
			await msg.author.settings.update(UserSettings.Minion.DefaultPay, true);

			return msg.send(
				`Your minion will now automatically pay for farming, if you have the payment needed.`
			);
		} else if (trueOrFalse === 'disable') {
			await msg.author.settings.update(UserSettings.Minion.DefaultPay, false);

			return msg.send(`Your minion will now **not** automatically pay for farming.`);
		}
		return msg.send(
			'The available options for pay is `enable` and `disable`.' +
				`\nFor example, \`${msg.cmdPrefix}defaultfarming pay enable\`.`
		);
	}
}
