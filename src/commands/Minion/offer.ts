import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Tasks, Time } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Prayer from '../../lib/skilling/skills/prayer';
import { SkillsEnum } from '../../lib/skilling/types';
import { OfferingActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '<quantity:int{1}|name:...string> [name:...string]',
			usageDelim: ' ',
			categoryFlags: ['minion', 'skilling'],
			description: 'Sends your minion to offer bones to the chaos altar.',
			examples: ['+offer dragon bones']
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [quantity, boneName = '']: [null | number | string, string]) {
		// default bury speed
		const speedMod = 4.8;

		// will be used if another altar is added
		let altar = '';
		altar = 'at the chaos altar';

		if (typeof quantity === 'string') {
			boneName = quantity;
			quantity = null;
		}

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

		// If no quantity provided, set it to the max.
		if (quantity === null) {
			const amountOfBonesOwned = msg.author.settings.get(UserSettings.Bank)[bone.inputId];
			if (!amountOfBonesOwned) return msg.send(`You have no ${bone.name}.`);
			quantity = Math.min(
				Math.floor(msg.author.maxTripLength / timeToBuryABone),
				amountOfBonesOwned
			);
		}

		// Check the user has the required bones to bury.
		const hasRequiredBones = await msg.author.hasItem(bone.inputId, quantity);
		if (!hasRequiredBones) {
			return msg.send(`You dont have ${quantity}x ${bone.name}.`);
		}

		const duration = quantity * timeToBuryABone;

		if (duration > msg.author.maxTripLength) {
			return msg.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					msg.author.maxTripLength
				)}, try a lower quantity. The highest amount of ${
					bone.name
				}s you can bury is ${Math.floor(msg.author.maxTripLength / timeToBuryABone)}.`
			);
		}

		await msg.author.removeItemFromBank(bone.inputId, quantity);

		await addSubTaskToActivityTask<OfferingActivityTaskOptions>(
			this.client,
			Tasks.SkillingTicker,
			{
				boneID: bone.inputId,
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
