import { Embed } from '@discordjs/builders';
import { User } from '@prisma/client';
import { KlasaUser } from 'klasa';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';
import { LootTable } from 'oldschooljs';
import { toKMB } from 'oldschooljs/dist/util';

import resolveItems from '../../../lib/util/resolveItems';
import {
	handleMahojiConfirmation,
	mahojiClientSettingsUpdate,
	mahojiParseNumber,
	mahojiUserSettingsUpdate
} from '../../mahojiSettings';

const flowerTable = new LootTable()
	.add('Red flowers', 1, 150)
	.add('Yellow flowers', 1, 150)
	.add('Orange flowers', 1, 150)

	.add('Blue flowers', 1, 150)
	.add('Purple flowers', 1, 150)
	.add('Assorted flowers', 1, 150)

	.add('Mixed flowers', 1, 150)

	.add('Black flowers', 1, 2)
	.add('White flowers', 1, 1);

const hot = resolveItems(['Red flowers', 'Yellow flowers', 'Orange flowers']);
const cold = resolveItems(['Blue flowers', 'Purple flowers', 'Assorted flowers']);
const rerolls = resolveItems(['Black flowers', 'White flowers']);

const explanation =
	"Hot and Cold Rules: You pick hot (red, yellow, orange) or cold (purple, blue, assorted), and if you guess right, you win. If it's mixed, you lose. If its black or white, nobody wins and you're refunded.";

export async function hotColdCommand(
	interaction: SlashCommandInteraction,
	klasaUser: KlasaUser,
	user: User,
	choice: 'hot' | 'cold' | undefined,
	_amount: string | undefined
) {
	const amount = mahojiParseNumber({ input: _amount, min: 1 });
	if (!amount || !choice || !['hot', 'cold'].includes(choice)) return explanation;
	if (amount < 10_000_000 || amount > 500_000_000) return 'You must gamble between 10m and 500m.';
	if (user.GP < amount) return "You can't afford to gamble that much.";
	const flowerLoot = flowerTable.roll();
	let flower = flowerLoot.items()[0][0];

	await handleMahojiConfirmation(
		interaction,
		`Are you sure you want to gamble ${toKMB(amount)}? You might lose it all, you might win a lot.
${explanation}`
	);

	await klasaUser.addItemsToBank({ items: flowerLoot, collectionLog: true });

	const embed = new Embed()
		.setTitle(`You picked ${choice} and got '${flower.name}'!`)
		.setThumbnail(`https://chisel.weirdgloop.org/static/img/osrs-sprite/${flower.id}.png`)
		.setFooter({
			text: `You received ${flowerLoot}`
		});
	const response: Awaited<CommandResponse> = {
		embeds: [embed]
	};

	if (rerolls.includes(flower.id)) {
		embed.setDescription('The gamble was cancelled, no GP was removed or added.');
		return response;
	}
	await mahojiUserSettingsUpdate(user.id, {
		GP: {
			decrement: amount
		}
	});
	const arrToCheck = choice === 'hot' ? hot : cold;
	const playerDidWin = flower.name !== 'Mixed flowers' && arrToCheck.includes(flower.id);
	const key = playerDidWin ? 'increment' : 'decrement';
	await mahojiClientSettingsUpdate({
		gp_hotcold: {
			[key]: amount
		}
	});

	if (playerDidWin) {
		const amountWon = amount * 2;
		await mahojiUserSettingsUpdate(user.id, {
			GP: {
				increment: amount * 2
			},
			gp_hotcold: {
				increment: amount
			}
		});
		embed.setDescription(`You **won** ${toKMB(amountWon)}!`).setColor(6_875_960);
		return response;
	}
	await mahojiUserSettingsUpdate(user.id, {
		gp_hotcold: {
			decrement: amount
		}
	});

	embed.setDescription(`You lost ${toKMB(amount)}.`).setColor(15_417_396);
	return response;
}
