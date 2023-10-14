import { bold } from 'discord.js';
import { noOp, randArrItem } from 'e';
import { Bank } from 'oldschooljs';

import { determineMortimerLoot } from '../../../lib/halloween/halloween';
import { prisma } from '../../../lib/settings/prisma';
import { MALEDICT_MORTIMER_ID, mortimerEndMessages } from '../../../lib/simulation/maledictMortimer';
import { MortimerOptions } from '../../../lib/types/minions';
import { itemNameFromID } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { makeBankImage } from '../../../lib/util/makeBankImage';
import resolveItems from '../../../lib/util/resolveItems';

export const mortimerTask: MinionTask = {
	type: 'Mortimer',
	async run(data: MortimerOptions) {
		const { channelID, userID } = data;
		const user = await mUserFetch(userID);

		const activeTrick = await prisma.mortimerTricks.findFirst({
			where: {
				target_id: user.id,
				completed: false
			}
		});
		let trickDidActivate = false;

		await user.incrementKC(MALEDICT_MORTIMER_ID, 1);

		const loot = new Bank();
		loot.add(determineMortimerLoot(user));

		let icon = '';
		if (resolveItems(['Covenant of grimace', 'Mini mortimer']).some(i => loot.has(i))) {
			icon = '🟨';
		} else if (
			resolveItems([
				'Maledict amulet',
				'Maledict codex',
				'Maledict hat',
				'Maledict top',
				'Maledict legs',
				'Maledict boots',
				'Maledict cape',
				'Maledict ring',
				'Maledict gloves'
			]).some(i => loot.has(i))
		) {
			icon = '🟪';
		} else if (activeTrick !== null) {
			// They didn't get a unique, so if they have an active trick, trick them.
			await prisma.mortimerTricks.update({
				where: {
					id: activeTrick.id
				},
				data: {
					completed: true
				}
			});
			trickDidActivate = true;
		}
		await user.addItemsToBank({ items: loot, collectionLog: true });

		const fakeLoot = loot.clone();
		if (trickDidActivate) {
			const item = randArrItem(['Covenant of grimace', 'Mini mortimer', 'Maledict codex', 'Maledict amulet']);
			globalClient.users.cache
				.get(activeTrick!.trickster_id)
				?.send(`You just tricked ${user.rawUsername} into thinking they got a ${itemNameFromID(item)}!`)
				.catch(noOp);
			fakeLoot.add(item);
		}

		const str = `Maledict Mortimer says... ${bold(randArrItem(mortimerEndMessages))}

${icon}${user.rawUsername} received ${bold(fakeLoot.toString())}.`;

		return handleTripFinish(
			user,
			channelID,
			str,
			(await makeBankImage({ bank: fakeLoot, title: 'Loot From Maledict Mortimer', user })).file.attachment,
			data,
			loot
		);
	}
};
