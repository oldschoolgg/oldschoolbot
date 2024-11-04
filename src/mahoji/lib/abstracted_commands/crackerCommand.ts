import type { ChatInputCommandInteraction, User } from 'discord.js';
import { shuffleArr } from 'e';
import { Bank, LootTable } from 'oldschooljs';

import { Emoji } from '../../../lib/constants';
import { handleMahojiConfirmation } from '../../../lib/util/handleMahojiConfirmation';
import { addToOpenablesScores } from '../../mahojiSettings';

const HatTable = new LootTable()
	.add('Red partyhat', 1, 32)
	.add('Yellow partyhat', 1, 28)
	.add('White partyhat', 1, 23)
	.add('Green partyhat', 1, 20)
	.add('Blue partyhat', 1, 15)
	.add('Purple partyhat', 1, 10);

const JunkTable = new LootTable()
	.add('Chocolate bar', 1, 1 / 5.2)
	.add('Silver bar', 1, 1 / 7.6)
	.add('Spinach roll', 1, 1 / 8)
	.add('Chocolate cake', 1, 1 / 8.6)
	.add('Holy symbol', 1, 1 / 11.7)
	.add('Silk', 1, 1 / 12.2)
	.add('Gold ring', 1, 1 / 13.9)
	.add('Black dagger', 1, 1 / 24.3)
	.add('Law rune', 1, 1 / 25.3);

export async function crackerCommand({
	ownerID,
	otherPersonID,
	interaction,
	otherPersonAPIUser
}: {
	otherPersonAPIUser: User;
	ownerID: string;
	otherPersonID: string;
	interaction: ChatInputCommandInteraction;
}) {
	const otherPerson = await mUserFetch(otherPersonID);
	const owner = await mUserFetch(ownerID);
	if (otherPerson.user.minion_ironman) return 'That person is an ironman, they stand alone.';
	if (otherPersonAPIUser.bot) return "Bot's don't have hands.";
	if (otherPerson.id === owner.id) return 'Nice try.';

	if (!owner.bank.has('Christmas cracker')) {
		return "You don't have any Christmas crackers.";
	}

	await handleMahojiConfirmation(
		interaction,
		`${Emoji.ChristmasCracker} Are you sure you want to use your cracker on them? Either person could get the partyhat! Please confirm if you understand and wish to use it.`
	);

	await owner.removeItemsFromBank(new Bank().add('Christmas cracker', 1));
	const winnerLoot = HatTable.roll();
	const loserLoot = JunkTable.roll();
	const [winner, loser] = shuffleArr([otherPerson, owner]);
	await winner.addItemsToBank({ items: winnerLoot, collectionLog: true });
	await loser.addItemsToBank({ items: loserLoot, collectionLog: true });
	await addToOpenablesScores(owner, new Bank().add('Christmas cracker', 1).freeze());

	return `${Emoji.ChristmasCracker} ${owner} pulled a Christmas cracker with ${otherPerson} and....\n\n ${winner} received ${winnerLoot}, ${loser} received ${loserLoot}.`;
}
