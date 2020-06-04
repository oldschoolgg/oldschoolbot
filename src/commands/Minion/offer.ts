import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Tasks, Time } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import Prayer from '../../lib/skilling/skills/prayer';
import { SkillsEnum } from '../../lib/skilling/types';
import { OfferingActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import checkActivityQuantity from '../../lib/util/checkActivityQuantity';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[quantity:int{1}] <boneName:...string>',
			usageDelim: ' '
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [quantity, boneName]: [number, string]) {
		// default bury speed
		const speedMod = 4.8;

		// will be used if another altar is added
		let altar = '';
		altar = 'at the chaos altar';

		await msg.author.settings.sync(true);
		const bone = Prayer.Bones.find(
			bone =>
				stringMatches(bone.name, boneName) ||
				stringMatches(bone.name.split(' ')[0], boneName)
		);

		if (!bone) {
			return msg.send(
				`That's not a valid bone to offer. Valid bones are ${Prayer.Bones.map(
					bone => bone.name
				).join(', ')}.`
			);
		}

		if (msg.author.skillLevel(SkillsEnum.Prayer) < bone.level) {
			return msg.send(
				`${msg.author.minionName} needs ${bone.level} Prayer to offer ${bone.name}.`
			);
		}

		const timeToBuryABone = speedMod * (Time.Second * 1.2 + Time.Second / 4);

		quantity = checkActivityQuantity(msg.author, quantity, timeToBuryABone, bone.inputItems);
		const duration = quantity * timeToBuryABone;

		await msg.author.removeItemFromBank(bone.id, quantity);

		await addSubTaskToActivityTask<OfferingActivityTaskOptions>(
			this.client,
			Tasks.SkillingTicker,
			{
				boneID: bone.id,
				userID: msg.author.id,
				channelID: msg.channel.id,
				quantity,
				duration,
				type: Activity.Offering
			}
		);
		return msg.send(
			`${msg.author.minionName} is now offering ${quantity}x ${
				bone.name
			} ${altar}, it'll take around ${formatDuration(duration)} to finish.`
		);
	}
}
