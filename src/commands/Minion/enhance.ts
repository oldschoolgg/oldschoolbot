import { KlasaMessage, CommandStore } from 'klasa';
import { BotCommand } from '../../lib/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['enhance', 'exp', 'xp'],
			usage: '[amount:int{-200000000,200000000}] [skillName:string]',
			usageDelim: ' '
		});
	}

	async run(msg: KlasaMessage, [amount, skillName]: [number, string]) {
		await msg.author.settings.sync(true);
		const currentXP = msg.author.settings.get(`skills.${skillName}`) as number;
		const newXP = Math.min(200000000, currentXP + amount);
		if (newXP < 0) {
			await msg.author.settings.update(`skills.${skillName}`, 0);
		} else {
			await msg.author.settings.update(`skills.${skillName}`, Math.floor(newXP));
		}
	}
}