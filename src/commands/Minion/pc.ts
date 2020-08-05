import { CommandStore, KlasaMessage } from 'klasa';
import { BotCommand } from '../../lib/BotCommand';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { requiresMinion, minionNotBusy } from '../../lib/minions/decorators';
import { Time } from 'oldschooljs/dist/constants';
import { formatDuration } from '../../lib/util';
import { rand } from '../../util';
import { PestControlActivityTaskOptions } from '../../lib/types/minions';
import { MinigameIDsEnum } from '../../lib/minions/data/minigames';
import { Activity, Tasks } from '../../lib/constants';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

const landers = [
	{ name: 'novice', points: 3, gamesRequired: 0, timeToFinish: Time.Minute * 4.5 },
	{ name: 'intermediate', points: 4, gamesRequired: 100, timeToFinish: Time.Minute * 3.1 },
	{ name: 'veteran', points: 5, gamesRequired: 200, timeToFinish: Time.Minute * 2 }
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 3,
			usage: '[quantity:int{1}]',
			aliases: ['pestcontrol', 'pest-control'],
			oneAtTime: true
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [quantity]: [null | number | string]) {
		await msg.author.settings.sync(true);
		if (msg.flagArgs.points) {
			const points = msg.author.settings.get(UserSettings.CommendationPoints);

			return msg.channel.send(`You have ${points} commendation points`);
		}

		const { maxTripLength, minionName } = msg.author;

		const pcGames = msg.author.getMinigameScore(MinigameIDsEnum.PestControl);
		const selectedLanders = landers.filter(({ gamesRequired }) => pcGames >= gamesRequired);

		if (!selectedLanders.length) {
			throw 'WTF?';
		}

		const { timeToFinish, points, name: landerName } = selectedLanders.reverse()[0];
		const maxPossibleGames: number = Math.floor(
			msg.author.maxTripLength / timeToFinish
		) as number;

		if (quantity === null || quantity === undefined) {
			quantity = maxPossibleGames;
		}

		let duration = timeToFinish * (quantity as number);

		if (duration > msg.author.maxTripLength) {
			throw `${minionName} can't play pest control for longer than ${formatDuration(
				maxTripLength
			)}, try a lower quantity. The highest amount you can do for the ${landerName} lander is ${maxPossibleGames}`;
		}

		const randomAddedDuration = rand(1, 20);
		duration += (randomAddedDuration * duration) / 100;

		const data: PestControlActivityTaskOptions = {
			quantity: quantity as number,
			duration,
			id: rand(1, 10_000_000),
			finishDate: Date.now() + duration,
			pointsPerGame: points,
			minigameID: MinigameIDsEnum.PestControl,
			channelID: msg.channel.id,
			userID: msg.author.id,
			type: Activity.PestControl
		};

		await addSubTaskToActivityTask(this.client, Tasks.MinigameTicker, data);

		const response = `${minionName} is now completing ${
			data.quantity
		} ${landerName} pest control games, it'll take around ${formatDuration(
			duration
		)} to finish`;

		return msg.send(response);
	}
}
