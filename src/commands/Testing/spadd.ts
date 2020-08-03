import { KlasaMessage, CommandStore } from 'klasa';
import { BotCommand } from '../../lib/BotCommand';
import { UserSettings } from '../../lib/settings/types/UserSettings';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['expadd', 'xpadd'],
			usage: '[amount:int{-200000000,200000000}] [skillName:string]',
			usageDelim: ' '
		});
	}

	async run(msg: KlasaMessage, [amount, skillName]: [number, string]) {
		// Make 100% sure this command can never be used in prod
		if (
			this.client.production ||
			!this.client.user ||
			this.client.user.id === '303730326692429825'
		) {
			return;
		}
		await msg.author.settings.sync(true);
		const { settings } = msg.author;
		const slayerInfo = settings.get(UserSettings.Slayer.SlayerInfo);
		const currentSP = slayerInfo.slayerPoints;
		const newSP = Math.min(200000000, currentSP + amount);
		if (newSP < 0) {
			const newSlayerInfo = {
				...slayerInfo,
				slayerPoints: 0
			};
			await settings.update(UserSettings.Slayer.SlayerInfo, newSlayerInfo, {
				arrayAction: 'overwrite'
			});
			return msg.send(`Your current SlayerPoints is now ${newSP}`);
		} else {
			const newSlayerInfo = {
				...slayerInfo,
				slayerPoints: newSP
			};
			await settings.update(UserSettings.Slayer.SlayerInfo, newSlayerInfo, {
				arrayAction: 'overwrite'
			});
			return msg.send(`Your current SlayerPoints is now ${newSP}`);
		}
	}
}
