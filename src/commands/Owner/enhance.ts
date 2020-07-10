import { KlasaMessage, CommandStore } from 'klasa';
import { BotCommand } from '../../lib/BotCommand';
import { convertXPtoLVL } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['enhance', 'exp', 'xp'],
			usage: '<amount:int{-200000000,200000000}> <skillName:string>',
			usageDelim: ' '
		});
	}

	async run(msg: KlasaMessage, [amount, skillName] : [number, string]) {
		await msg.author.settings.sync(true);
		
		const currentXP = msg.author.settings.get(`skills.${skillName}`) as number;
		
		var newXP = Math.min(200_000_000, currentXP + amount);
		if (newXP < 0) { 
			await msg.author.settings.update(`skills.${skillName}`, 0);
		} else {
			await msg.author.settings.update(`skills.${skillName}`, Math.floor(newXP));
			await msg.reply( 'Currently Level: '+convertXPtoLVL(msg.author.settings.get(`skills.${skillName}`) as number));
		}
	}
}
