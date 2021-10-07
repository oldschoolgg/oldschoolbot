import { Time } from '@sapphire/time-utilities';
import { calcPercentOfNum } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { createQueryBuilder } from 'typeorm';

import { Activity } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { BotCommand } from '../../lib/structures/BotCommand';
import { ActivityTable } from '../../lib/typeorm/ActivityTable.entity';
import { TrickOrTreatOptions } from '../../lib/types/minions';
import { britishTime, formatDuration, isNightTime } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import getOSItem from '../../lib/util/getOSItem';
import resolveItems from '../../lib/util/resolveItems';

const scaryItems = resolveItems([
	'Scythe',
	'Red halloween mask',
	'Blue halloween mask',
	'Green halloween mask',
	"Black h'ween mask",
	'Skeleton mask',
	'Skeleton shirt',
	'Skeleton leggings',
	'Skeleton gloves',
	'Skeleton boots',
	'Jack lantern mask',
	'Zombie head',
	"Black h'ween mask",
	'Grim reaper hood',
	'Antisanta mask',
	'Antisanta jacket',
	'Antisanta pantaloons',
	'Antisanta gloves',
	'Antisanta boots',
	'Gravedigger mask',
	'Gravedigger top',
	'Gravedigger leggings',
	'Gravedigger gloves',
	'Gravedigger boots',
	'Banshee mask',
	'Banshee top',
	'Banshee robe',
	'Jonas mask',
	'Spooky hood',
	'Spooky robe',
	'Spooky skirt',
	'Spooky gloves',
	'Spooky boots',
	'Spookier hood',
	'Spookier robe',
	'Spookier skirt',
	'Spookier gloves',
	'Spookier boots',
	'Pumpkin lantern',
	'Skeleton lantern',
	'Web cloak',
	'Eek',
	'Evil chicken head',
	'Evil chicken wings',
	'Evil chicken legs',
	'Evil chicken feet',
	'Clown mask',
	'Clown bow tie',
	'Clown gown',
	'Clown trousers',
	'Clown shoes',
	'Hunting knife',
	'Anti-panties',
	'Warlock top',
	'Warlock legs',
	'Warlock cloak',
	'Witch top',
	'Witch skirt',
	'Witch cloak'
]);

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			categoryFlags: ['minion', 'skilling'],
			examples: ['+bury dragon bones', '+bury 10 bones'],
			description: 'Burys bones from your bank to train prayer.',
			aliases: ['tot']
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage) {
		if (!isNightTime()) {
			const time = britishTime();
			return msg.channel.send(
				`You can only trick or treat at night time, it's currently ${time.toLocaleTimeString()}!`
			);
		}

		const start = britishTime();
		start.setTime(start.getTime() + Time.Hour * 10);
		start.setHours(0, 0, 0, 0);
		const end = britishTime();
		end.setTime(start.getTime() + Time.Hour * 10);
		end.setHours(23, 59, 59, 9999);
		const trips = await createQueryBuilder(ActivityTable)
			.select()
			.where('user_id = :userID', {
				userID: msg.author.id
			})
			.andWhere("type = 'TrickOrTreat'", {
				startDate: start,
				endDate: end
			})
			.andWhere('(start_date, finish_date) OVERLAPS (:startDate, :endDate)', {
				startDate: start,
				endDate: end
			})
			.getMany();

		if (trips.length >= 5) {
			return msg.channel.send(
				"You've done too much trick-or-treating today! People won't give you anymore candy until tomorrow."
			);
		}

		const duration = msg.author.maxTripLength(Activity.TrickOrTreat);
		let rolls = Math.floor(duration / Time.Minute / 3.5);

		const setupToUse =
			Object.values(msg.author.rawGear()).find(i => i.hasEquipped(scaryItems, false)) ??
			msg.author.getGear('misc');

		let amountEquipped = 0;
		for (const i of scaryItems) {
			if (amountEquipped === 5) break;
			if (setupToUse.hasEquipped(getOSItem(i).name)) amountEquipped++;
		}

		if (amountEquipped === 0) {
			return msg.channel.send('You have no scary items equipped! How will you get any treats?');
		}

		const boosts = [];
		const bonus = Math.ceil(amountEquipped * 2.5);
		boosts.push(`${bonus} extra rolls for Scary gear`);
		rolls += bonus;

		if (
			setupToUse.hasEquipped(['Warlock cloak', 'Warlock top', 'Warlock legs'], true) ||
			setupToUse.hasEquipped(['Witch cloak', 'Witch top', 'Witch skirt'], true)
		) {
			rolls += Math.floor(calcPercentOfNum(10, rolls));
			boosts.push('10% rolls for Witch/Warlock outfit');
		}

		if (setupToUse.hasEquipped(['Malygos mask', 'Ignecarus mask'], false)) {
			rolls += Math.floor(calcPercentOfNum(10, rolls));
			boosts.push('10% rolls for Malygos/Ignecarus mask');
		}

		await addSubTaskToActivityTask<TrickOrTreatOptions>({
			userID: msg.author.id,
			channelID: msg.channel.id,
			duration,
			type: Activity.TrickOrTreat,
			rolls
		});

		let str = `${msg.author.minionName} is now Trick or Treating! This trip will take ${formatDuration(duration)}.`;

		if (boosts.length > 0) {
			str += `\n\n**Boosts:** ${boosts.join(', ')}`;
		}
		return msg.channel.send(str);
	}
}
