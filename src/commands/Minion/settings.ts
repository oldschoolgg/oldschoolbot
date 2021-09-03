import { objectEntries, uniqueArr } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { BitField } from '../../lib/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { stringMatches } from '../../lib/util';

type TType = 'enable' | 'disable';
type TBFSettings = Record<
	string,
	{
		description: {
			enabled: string;
			disabled: string;
		};
		// Inverse means disabled means enabled and enabled means disabled
		// For rare cases where it sounds better to show something is enabled when the bitfield is off
		// Make sure the description follows its use acordingly
		inverse: boolean;
		alias: string[];
		// What bitfield will be changed
		bitfield: BitField;
		// If necessary, a custom validation to be run
		customValidation?: (msg: KlasaMessage, proposedState?: TType) => Promise<{ allowed: boolean; reason?: string }>;
		// When changing this BF, do...
		// Useful when the user cant have two bitfields enabled/disabled
		onChange?: (msg: KlasaMessage, newState: 'enabled' | 'disabled') => Promise<void>;
	}
>;

const bitfieldSettings: TBFSettings = {
	'Small banks': {
		description: {
			enabled: 'Your loot/bank images, will always show as smaller as possible.',
			disabled:
				'Your loot/bank images, will always show as normal. This setting is ignored when using Dark/Default/Transparent bank backgrounds.'
		},
		inverse: false,
		alias: ['sb', 'smallb', 'small bank'],
		bitfield: BitField.AlwaysSmallBank
	}
};

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[type:string] [bitfield:...string]',
			usageDelim: ' ',
			oneAtTime: true,
			cooldown: 5,
			altProtection: true,
			aliases: ['toggle'],
			categoryFlags: ['minion'],
			description: 'Enable or disable certain account settings that you unlock when playing.',
			examples: ['+settings disable gorajan bonecrusher']
		});
	}

	async run(msg: KlasaMessage, [_type, _bitfield]: [TType, string]) {
		await msg.author.settings.sync(true);
		const userBitfields = [...msg.author.settings.get(UserSettings.BitField)];

		if (!_type || !['enable', 'disable'].includes(_type.toLowerCase()) || msg.flagArgs.help) {
			return msg.channel.send(
				`Here are the settings you can change:\n${objectEntries(bitfieldSettings)
					.map(b => {
						const current = userBitfields.includes(b[1].bitfield);
						return `>> ${b[0]}\n**Enabled**: ${b[1].description.enabled}\n**Disabled**: ${
							b[1].description.disabled
						}\nYour status: \`${
							current ? (b[1].inverse ? 'Disabled' : 'Enabled') : b[1].inverse ? 'Enabled' : 'Disabled'
						}\``;
					})
					.join('\n')}`
			);
		}

		const bitfield = objectEntries(bitfieldSettings).find(
			b => stringMatches(b[0], _bitfield) || b[1].alias.some(a => stringMatches(a, _bitfield))
		);

		if (!bitfield) {
			return msg.channel.send(`**${_bitfield.toLowerCase()}** is not a valid setting you can change.`);
		}

		const bfData = bitfield[1];
		const bfName = bitfield[0];

		const userHaveBitfield = userBitfields.includes(bfData.bitfield);

		let type: 'enabled' | 'disabled' | undefined = undefined;

		if (bfData.inverse) {
			if (_type === 'disable') _type = 'enable';
			else if (_type === 'enable') _type = 'disable';
		}

		if (bfData.customValidation) {
			const bfCustomValidation = await bfData.customValidation(msg, _type as TType);
			if (!bfCustomValidation.allowed) {
				return msg.channel.send(
					`You are not allowed to change the state of this setting for the following reason: ${bfCustomValidation.reason}`
				);
			}
		}

		if (userHaveBitfield && _type === 'disable') {
			type = bfData.inverse ? 'enabled' : 'disabled';
			userBitfields.splice(
				userBitfields.findIndex(f => f === bfData.bitfield),
				1
			);
		} else if (userHaveBitfield && _type === 'enable') {
			return msg.channel.send(`You already have this setting ${bfData.inverse ? 'disabled' : 'enabled'}.`);
		} else if (!userHaveBitfield && _type === 'disable') {
			return msg.channel.send(`You already have this setting ${bfData.inverse ? 'enabled' : 'disabled'}.`);
		} else {
			type = bfData.inverse ? 'disabled' : 'enabled';
			userBitfields.push(bfData.bitfield);
		}

		if (bfData.onChange) await bfData.onChange(msg, type);

		await msg.author.settings.update(UserSettings.BitField, uniqueArr(userBitfields.filter(f => f)), {
			arrayAction: 'overwrite'
		});

		return msg.channel.send(
			`You have sucessfully **${type.toUpperCase()}** the **${bfName}** setting.\n${bfData.description[type]}`
		);
	}
}
