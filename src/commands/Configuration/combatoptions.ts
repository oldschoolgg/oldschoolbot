import { CommandStore, KlasaMessage } from 'klasa';

import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { CombatOptionsEnum, CombatOptionsArray } from '../../lib/minions/data/combatConstants'
import { stringMatches } from "../../lib/util";

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			runIn: ['text', 'dm'],
			usage: '[add|remove|list|help] [input:...str]',
			usageDelim: ' ',
			categoryFlags: ['settings', 'minion'],
			aliases: ['cbopts', 'cbops'],
			examples: ['+combatoptions add always cannon', '+combatoptions remove always cannon'],
			description: 'Allows you to disable receiving random events for yourself.'
		});
	}

	async run(msg: KlasaMessage, [command, option]: [string | undefined, string | undefined]) {
		if (!command || (command && command === 'list')) {
			// List enabled combat options:
			const myCBOpts = await msg.author.settings.get(UserSettings.CombatOptions);
			const cbOpts = myCBOpts.map(o => {
				return CombatOptionsArray.find(coa => { return coa!.id === o; })!.name;
			});
			return msg.channel.send(`Your current combat options are:\n${
				cbOpts.join(`\n`)
			}\n\nTry: \`${msg.cmdPrefix}cbops help\``);
		}

		if (command === 'help' || !option || !['add', 'remove'].includes(command)) {
			return msg.channel.send(
				`Changes your Combat Options. Usage: \`${msg.cmdPrefix}cbops [add/remove/list] always cannon\`` +
				`\n\nList of possible options:\n${CombatOptionsArray.map(coa => { return `**${coa!.name}**: ` +
				`${coa!.desc}`; }).join(`\n`)}`
			);
		}

		const newcbopt = CombatOptionsArray.find(
			item =>
				stringMatches(option, item.name) ||
				(item.aliases && item.aliases.some(alias => stringMatches(alias, option)))
		);
		if (!newcbopt) {
			return msg.channel.send(`Cannot find matching option. Try: \`${msg.cmdPrefix}cbops help\``);
		}

		const myCBOpts = await msg.author.settings.get(UserSettings.CombatOptions);

		const currentStatus = myCBOpts.includes(newcbopt.id);

		const nextBool = command !== 'remove';

		if (currentStatus === nextBool) {
			return msg.send(
				`"${newcbopt.name}" is already ${currentStatus ? 'enabled' : 'disabled'} for you.`
			);
		}

		//If enabling Ice Barrage, make sure burst isn't also enabled:
		if (nextBool && newcbopt.id === CombatOptionsEnum.AlwaysIceBarrage && myCBOpts.includes(CombatOptionsEnum.AlwaysIceBurst))
			await msg.author.settings.update(UserSettings.CombatOptions, CombatOptionsEnum.AlwaysIceBurst);
		//If enabling Ice Burst, make sure barrage isn't also enabled:
		if (nextBool && newcbopt.id === CombatOptionsEnum.AlwaysIceBurst && myCBOpts.includes(CombatOptionsEnum.AlwaysIceBarrage))
			await msg.author.settings.update(UserSettings.CombatOptions, CombatOptionsEnum.AlwaysIceBarrage);

		await msg.author.settings.update(UserSettings.CombatOptions, newcbopt.id);

		return msg.send(`${newcbopt.name} is now ${nextBool ? 'enabled' : 'disabled'} for you.`);
	}
}
