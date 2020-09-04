import { KlasaUser, Task } from 'klasa';

import clueTiers from '../../lib/minions/data/clueTiers';
import { ClueActivityTaskOptions } from '../../lib/types/minions';
import { Events } from '../../lib/constants';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import {
	roll,
	multiplyBank,
	addItemToBank,
	itemID,
	rand,
	addBanks,
	stringMatches
} from '../../lib/util';
import { getRandomMysteryBox } from '../../lib/openables';
import LootTable from 'oldschooljs/dist/structures/LootTable';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import reducedClueTime from '../../lib/minions/functions/reducedClueTime';
import { collectionLogTypes } from '../../lib/collectionLog';

const possibleFound = new LootTable()
	.add('Reward casket (beginner)')
	.add('Reward casket (easy)')
	.add('Reward casket (medium)')
	.add('Reward casket (hard)')
	.add('Reward casket (elite)')
	.add('Reward casket (master)');

const possibleFoundMysteryBox = new LootTable()
	.add('Tradeable mystery box')
	.oneIn(3, 'Untradeable mystery box');

interface ZippyClueWeight {
	[key: string]: number;
}

const zippyClueWeight: ZippyClueWeight = {
	Beginner: 1,
	Easy: 2,
	Medium: 2,
	Hard: 4,
	Elite: 6,
	Master: 9
};

export default class extends Task {
	/**
	 * Returns true or false, if the user has the clue tier completed (minus the clue rares), so it is fair for Master, Elite and Hard clues
	 * @param user
	 * @param tier
	 */
	async clueCollectionComplete(user: KlasaUser, tier: string) {
		await user.settings.sync(true);
		const type = collectionLogTypes
			.slice(1)
			.find(_type => _type.aliases.some(name => stringMatches(name, tier.toLowerCase())));
		if (!type) {
			return false;
		}
		let rareItems: any = [];
		const rareType = collectionLogTypes.find(cl => cl.name === 'Clues Rare');
		if (rareType) rareItems = Object.values(rareType.items).flat(Infinity);
		const items = Object.values(type.items).flat(100);
		const log = user.settings.get(UserSettings.CollectionLogBank);
		return (
			items.filter(item => {
				return log[item] > 0 || rareItems.indexOf(item) > 0;
			}).length === items.length
		);
	}

	async run({ clueID, userID, channelID, quantity, duration }: ClueActivityTaskOptions) {
		const clueTier = clueTiers.find(mon => mon.id === clueID);
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);

		const logInfo = `ClueID[${clueID}] userID[${userID}] channelID[${channelID}] quantity[${quantity}]`;

		if (!clueTier) {
			this.client.emit(Events.Wtf, `Missing user or clue - ${logInfo}`);
			return;
		}

		let str = `${user}, ${user.minionName} finished completing ${quantity} ${
			clueTier.name
		} clues. ${user.minionName} carefully places the reward casket${
			quantity > 1 ? 's' : ''
		} in your bank. You can open this casket using \`+open ${clueTier.name}\``;

		let loot = { [clueTier.id]: quantity };
		if (user.equippedPet() === itemID('Zippy')) {
			// detects if the user is doing it's max clues trip based on the clueTier
			const [timeToFinish] = reducedClueTime(
				clueTier,
				user.settings.get(UserSettings.ClueScores)[clueTier.id] ?? 1
			);
			const timeCheck = (timeToFinish / 2) * (quantity + 1) >= user.maxTripLength;
			let bonusLoot = {};
			const maxRolls = rand(quantity, quantity * zippyClueWeight[clueTier.name]);
			for (let i = 0; i < maxRolls; i++) {
				const { item } = roll(9)
					? possibleFoundMysteryBox.roll()[0]
					: possibleFound.roll().filter(i => i.item >= clueTier.id)[0] ?? {
							item: clueTier.id,
							quantity: 1
					  };
				bonusLoot = addItemToBank(bonusLoot, item);
			}
			// checks if the user has the collection log completed
			const clComplete = await this.clueCollectionComplete(user, clueTier.name);
			let doubledLoot = false;
			if (timeCheck && roll(clComplete ? 10 : 50)) {
				doubledLoot = true;
				bonusLoot = multiplyBank(bonusLoot, 2);
			}
			loot = addBanks([loot, bonusLoot]);
			str += `\n\nZippy has found ${Object.values(bonusLoot).reduce(
				(sum, i) => Number(sum) + Number(i),
				0
			)} extra items for you: ${await createReadableItemListFromBank(
				this.client,
				bonusLoot
			)}. ${
				doubledLoot
					? `With enough time following you, Zippy managed to double it's loot!`
					: ``
			}`;
		}
		if (roll(10)) {
			loot = multiplyBank(loot, 2);
			loot[getRandomMysteryBox()] = 1;
		}
		await user.addItemsToBank(loot, true);

		this.client.emit(
			Events.Log,
			`${user.username}[${user.id}] received ${quantity} ${clueTier.name} Clue Caskets.`
		);

		const channel = this.client.channels.get(channelID);
		if (!channelIsSendable(channel)) return;

		this.client.queuePromise(() => {
			channel.send(str);
		});
	}
}
