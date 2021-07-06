import { Task } from 'klasa';

import {
	addLFGLoot,
	addLFGNoDrops,
	addLFGText,
	availableQueues,
	prepareLFGMessage,
	sendLFGMessages
} from '../../lib/lfg/LfgUtils';
import { LfgStatusTable } from '../../lib/typeorm/LfgStatusTable.entity';
import { LfgActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

function mergeLoot(loot_a: Record<string, number>, loot_b: Record<string, number>) {
	const result = loot_a;
	Object.entries(loot_b).forEach(data => {
		result[data[0]] = (result[data[0]] ?? 0) + data[1];
	});
	return result;
}

export default class extends Task {
	async run(data: LfgActivityTaskOptions) {
		const { queueId } = data;
		const lfgQueue = availableQueues.find(queue => queue.uniqueID === queueId)!;

		let extra = lfgQueue.extraParams;

		// Add extra params to the activity
		let handleData = {
			...data,
			...extra,
			...data.extras
		};

		let lootString = prepareLFGMessage(lfgQueue.name, data.quantity, data.channels);

		const { usersWithLoot, usersWithoutLoot, extraMessage } = await lfgQueue.lfgClass.HandleTripFinish({
			data: handleData,
			client: this.client,
			queue: lfgQueue
		});

		let totalLoot: Record<string, number> = {};

		if (usersWithLoot) {
			usersWithLoot.forEach(e => {
				let lootObtainedString = '';

				if (e.lootedNonItems) {
					lootObtainedString += Object.entries(e.lootedNonItems)
						.map(loot => `${loot[1].toLocaleString()}x ${loot[0]}`)
						.join(', ');
					totalLoot = mergeLoot(totalLoot, e.lootedNonItems);
				}
				if (e.lootedItems && e.lootedItems.items().length > 0) {
					lootObtainedString += (lootObtainedString ? ', ' : '') + e.lootedItems.toString();
					totalLoot = mergeLoot(totalLoot, e.lootedItems.bank);
				}

				lootString = addLFGLoot(
					lootString,
					e.emoji,
					e.user,
					lootObtainedString,
					e.spoiler ?? true,
					data.channels
				);
			});
		}

		if (usersWithoutLoot) {
			lootString = await addLFGNoDrops(lootString, this.client, usersWithoutLoot, data.channels);
		}

		if (extraMessage) {
			lootString = addLFGText(lootString, extraMessage, data.channels);
		}

		// Update global statistics
		let table = await LfgStatusTable.findOne(lfgQueue.uniqueID);
		if (!table) {
			table = new LfgStatusTable();
			table.id = lfgQueue.uniqueID;
		}
		table.qtyKilledDone = (table.qtyKilledDone ?? 0) + data.quantity;
		table.timesSent = (table.timesSent ?? 0) + 1;
		table.usersServed = (table.usersServed ?? 0) + data.users.length;
		table.lootObtained = mergeLoot(table.lootObtained ?? {}, totalLoot);
		await table.save();

		if (data.users.length === 1) {
			const channel = Object.keys(lootString)[0];
			const leader = await this.client.users.fetch(data.userID);
			const loot = usersWithLoot ? usersWithLoot.find(u => u.user === leader)?.lootedItems : undefined;
			let image: any = undefined;
			if (loot !== undefined) {
				image = await this.client.tasks
					.get('bankImage')!
					.generateBankImage(loot.bank, `${data.quantity}x ${lfgQueue.name}`, true, { showNewCL: 1 }, leader);
			}
			await handleTripFinish(
				this.client,
				leader,
				channel,
				lootString[channel],
				res => {
					leader.log(`continued trip of ${data.quantity}x ${lfgQueue.name.toLowerCase()}`);
					res.commandText = 'solo';
					return this.client.commands.get('solo')!.run(res, [lfgQueue.name]);
				},
				!image ? undefined : image!.image ? image!.image : image,
				data,
				loot ? loot.bank : null
			);
		} else {
			return sendLFGMessages(lootString, this.client, data.channels);
		}
	}
}
