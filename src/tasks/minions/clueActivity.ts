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

// Commented how the weight affects the extra rewards for 30 minute trips
// Weight based on trips without any bonuses
// 1/500 becomes 1/100 if CL is complete
const zippyClueWeight: ZippyClueWeight = {
	Beginner: 1, // Roll: 13 to 13 | Avg: 13 | 1/10: 26 | 1/500: 52 | Box: 1/26 | Rolls/Box[MaxTrip]: 1/27[18]
	Easy: 2, //     Roll: 9  to 18 | Avg: 13 | 1/10: 26 | 1/500: 52 | Box: 1/24 | Rolls/Box[MaxTrip]: 1/24[16]
	Medium: 2, //   Roll: 6  to 12 | Avg: 9  | 1/10: 18 | 1/500: 36 | Box: 1/24 | Rolls/Box[MaxTrip]: 1/24[16]
	Hard: 3, //     Roll: 4  to 12 | Avg: 8  | 1/10: 16 | 1/500: 32 | Box: 1/20 | Rolls/Box[MaxTrip]: 1/21[14]
	Elite: 5, //    Roll: 3  to 15 | Avg: 9  | 1/10: 18 | 1/500: 36 | Box: 1/14 | Rolls/Box[MaxTrip]: 1/15[10]
	Master: 7 //    Roll: 3  to 21 | Avg: 12 | 1/10: 24 | 1/500: 48 | Box: 1/8  | Rolls/Box[MaxTrip]: 1/9[6]
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
				// detects if the clue should reward a mystery box or not. The better the clue,
				// more often it'll get here.
				const { item } = roll(
					Math.ceil((10 - zippyClueWeight[clueTier.name]) * (timeCheck ? 2 : 3))
				)
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
