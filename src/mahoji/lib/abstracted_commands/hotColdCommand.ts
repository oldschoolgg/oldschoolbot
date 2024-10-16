import type { CommandResponse } from '@oldschoolgg/toolkit/util';
import type { ChatInputCommandInteraction } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { LootTable } from 'oldschooljs';
import { toKMB } from 'oldschooljs/dist/util';

import { resolveItems } from 'oldschooljs/dist/util/util';
import { mahojiClientSettingsUpdate } from '../../../lib/util/clientSettings';
import { handleMahojiConfirmation } from '../../../lib/util/handleMahojiConfirmation';
import { mahojiParseNumber, userStatsUpdate } from '../../mahojiSettings';

export const flowerTable = new LootTable()
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
const blackAndWhite = resolveItems(['Black flowers', 'White flowers']);

const explanation =
	"Hot and Cold Rules: You pick hot (red, yellow, orange) or cold (purple, blue, assorted), and if you guess right, you win. If it's mixed, you lose. If its black or white, you win **5x** your bet.";

export async function hotColdCommand(
	interaction: ChatInputCommandInteraction,
	user: MUser,
	choice: 'hot' | 'cold' | undefined,
	_amount: string | undefined
) {
	if (user.isIronman) return 'Ironmen cannot gamble.';
	const amount = mahojiParseNumber({ input: _amount, min: 1 });
	if (!amount || !choice || !['hot', 'cold'].includes(choice) || !Number.isInteger(amount)) return explanation;
	if (amount < 10_000_000 || amount > 500_000_000) return 'You must gamble between 10m and 500m.';
	if (user.GP < amount) return "You can't afford to gamble that much.";
	const flowerLoot = flowerTable.roll();
	const flower = flowerLoot.items()[0][0];

	await handleMahojiConfirmation(
		interaction,
		`Are you sure you want to gamble ${toKMB(amount)}? You might lose it all, you might win a lot.
${explanation}`
	);

	await user.sync();
	if (user.GP < amount) return "You can't afford to gamble that much.";
	await transactItems({
		userID: user.id,
		itemsToAdd: flowerLoot,
		collectionLog: true
	});

	const embed = new EmbedBuilder()
		.setTitle(`You picked ${choice} and got '${flower.name}'!`)
		.setThumbnail(`https://chisel.weirdgloop.org/static/img/osrs-sprite/${flower.id}.png`)
		.setFooter({
			text: `You received ${flowerLoot}`
		});
	const response: Awaited<CommandResponse> = {
		embeds: [embed]
	};

	// You get 5x if you roll a black/white flower
	if (blackAndWhite.includes(flower.id)) {
		const amountWon = amount * 5;
		await user.update({
			GP: {
				increment: amountWon
			}
		});
		await userStatsUpdate(
			user.id,
			{
				gp_hotcold: {
					increment: amountWon
				}
			},
			{}
		);
		await mahojiClientSettingsUpdate({
			gp_hotcold: {
				decrement: amountWon
			}
		});
		embed
			.setDescription(
				`You rolled a special flower, and received 5x of your bet! You received ${toKMB(amountWon)}`
			)
			.setColor(6_875_960);
		return response;
	}

	await user.update({
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
		await user.update({
			GP: {
				increment: amount * 2
			}
		});
		await userStatsUpdate(
			user.id,
			{
				gp_hotcold: {
					increment: amount
				}
			},
			{}
		);
		embed.setDescription(`You **won** ${toKMB(amountWon)}!`).setColor(6_875_960);
		return response;
	}
	await userStatsUpdate(
		user.id,
		{
			gp_hotcold: {
				decrement: amount
			}
		},
		{}
	);

	embed.setDescription(`You lost ${toKMB(amount)}.`).setColor(15_417_396);
	return response;
}
