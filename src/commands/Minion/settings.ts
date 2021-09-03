import { objectEntries, uniqueArr } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { BitField } from '../../lib/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { stringMatches } from '../../lib/util';

const bitfieldSettings = {
	'Gorajan bonecrusher': {
		description: {
			enabled: 'The Gorajan Bonecrusher will automatically bury bones for you and award 4x the experience.',
			disabled: 'The Gorajan Bonecrusher will STOP automatically burying bones for you.'
		},
		inverse: true,
		alias: ['dgb', 'gb', 'gorajan bonecrusher', 'gorajan', 'bonecrusher'],
		bitfield: BitField.DisableGorajanBonecrusher
	},
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

	async run(msg: KlasaMessage, [_type, _bitfield]: ['enable' | 'disable', string]) {
		await msg.author.settings.sync(true);
		const userBitfields = [...msg.author.settings.get(UserSettings.BitField)];
		console.log(_type, _bitfield);
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

		const userHaveBitfield = userBitfields.includes(bitfield[1].bitfield);

		let type: 'enabled' | 'disabled' | undefined = undefined;

		if (bitfield[1].inverse) {
			if (_type === 'disable') _type = 'enable';
			else if (_type === 'enable') _type = 'disable';
		}

		if (userHaveBitfield && _type === 'disable') {
			type = bitfield[1].inverse ? 'enabled' : 'disabled';
			userBitfields.splice(
				userBitfields.findIndex(f => f === bitfield[1].bitfield),
				1
			);
		} else if (userHaveBitfield && _type === 'enable') {
			return msg.channel.send(`You already have this setting ${bitfield[1].inverse ? 'disabled' : 'enabled'}.`);
		} else if (!userHaveBitfield && _type === 'disable') {
			return msg.channel.send(`You already have this setting ${bitfield[1].inverse ? 'enabled' : 'disabled'}.`);
		} else {
			type = bitfield[1].inverse ? 'disabled' : 'enabled';
			userBitfields.push(bitfield[1].bitfield);
		}

		await msg.author.settings.update(UserSettings.BitField, uniqueArr(userBitfields.filter(f => f)), {
			arrayAction: 'overwrite'
		});

		return msg.channel.send(
			`You have sucessfully **${type.toUpperCase()}** the **${bitfield[0]}** setting.\n${
				bitfield[1].description[type]
			}`
		);
	}
}
