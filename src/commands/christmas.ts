import { randArrItem, Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { antiSantaOutfit } from '../lib/data/CollectionsExport';
import { minionNotBusy, requiresMinion } from '../lib/minions/decorators';
import { UserSettings } from '../lib/settings/types/UserSettings';
import { BotCommand } from '../lib/structures/BotCommand';
import { ChristmasTaskOptions } from '../lib/types/minions';
import { formatDuration, murMurHashChance } from '../lib/util';
import addSubTaskToActivityTask from '../lib/util/addSubTaskToActivityTask';
import chatHeadImage from '../lib/util/chatHeadImage';

const duration = Time.Minute * 30;
const quantity = duration / (Time.Minute * 3);

const onTaskStealing = [
	'Good minion! Steal those presents from those filthy kids.',
	'Go and steal some presents!',
	"Go, steal! We won't stop until we have them all!",
	'Steal more presents!'
];
const offTaskStealing = ['Why are you stealing presents?!', 'Those innocent kids! Stop!', 'How could you?!'];

const onTaskDelivering = [
	'Deliver more and more presents!',
	"Don't miss any house, let no child go without presents!",
	"Keep delivering, we're almost done!"
];
const offTaskDelivering = [
	"Why are you GIVING them presents?! You're supposed to be stealing!",
	"Don't give them presents, steal them!",
	"Arghhh!! Don't give them presents!"
];
const runDeliver = ['Go deliver presents!'];
const runSteal = ['Go steal presents!'];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			altProtection: true,
			categoryFlags: ['minion', 'minigame'],
			description: 'Sends your minion to do the christmas event.',
			examples: ['+christmas'],
			subcommands: true,
			usage: '[deliver|steal]',
			usageDelim: ' ',
			aliases: ['xmas']
		});
	}

	getStyle(id: string) {
		return murMurHashChance(id, 44) ? 'good' : 'evil';
	}

	@requiresMinion
	async run(msg: KlasaMessage) {
		const style = this.getStyle(msg.author.id);
		if (style === 'evil' && !msg.author.cl().has('Antisanta mask')) {
			await msg.author.addItemsToBank(antiSantaOutfit, true);
			await msg.channel.send({
				content: `You received: ${antiSantaOutfit}.`,
				files: [
					await chatHeadImage({
						content: 'Take this outfit, it will give you special powers for stealing presents!',
						head: 'antiSanta'
					})
				]
			});
		}
		const delivered = msg.author.settings.get(UserSettings.PresentsDelivered);
		const stolen = msg.author.settings.get(UserSettings.PresentsStolen);
		return msg.channel.send({
			content: `This year, minions are delivering presents to all the Gielinor children! ${
				style === 'good'
					? 'But, there are some evil minions out there stealing presents, we need to make sure everyone gets a present!'
					: "And, we're gonna stop them and get all those presents for ourselves!"
			}
			
**Presents Delivered:** ${delivered}
**Presents Stolen:** ${stolen}
**Job:** ${
				style === 'evil'
					? `Stealing presents (\`${msg.cmdPrefix}christmas steal (or deliver...)\`)`
					: `Delivering presents (\`${msg.cmdPrefix}christmas deliver (or steal...)\`)`
			}`,
			files: [
				await chatHeadImage({
					head: style === 'good' ? 'santa' : 'antiSanta',
					content: randArrItem(style === 'good' ? runDeliver : runSteal)
				})
			]
		});
	}

	@minionNotBusy
	async deliver(msg: KlasaMessage) {
		const style = this.getStyle(msg.author.id);

		await addSubTaskToActivityTask<ChristmasTaskOptions>({
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: 'Christmas',
			action: 'deliver'
		});

		return msg.channel.send({
			content: `${
				msg.author.minionName
			} is now off to deliver ${quantity}x presents, it'll take around ${formatDuration(duration)} to finish.`,
			files: [
				await chatHeadImage({
					content: randArrItem(style === 'good' ? onTaskDelivering : offTaskDelivering),
					head: style === 'good' ? 'santa' : 'antiSanta'
				})
			]
		});
	}

	@minionNotBusy
	async steal(msg: KlasaMessage) {
		const style = this.getStyle(msg.author.id);

		await addSubTaskToActivityTask<ChristmasTaskOptions>({
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: 'Christmas',
			action: 'steal'
		});

		return msg.channel.send({
			content: `${
				msg.author.minionName
			} is now off to steal ${quantity}x presents, it'll take around ${formatDuration(duration)} to finish.`,
			files: [
				await chatHeadImage({
					content: randArrItem(style === 'evil' ? onTaskStealing : offTaskStealing),
					head: style === 'evil' ? 'antiSanta' : 'santa'
				})
			]
		});
	}
}
