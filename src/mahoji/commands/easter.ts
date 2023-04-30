import { mentionCommand } from '@oldschoolgg/toolkit';
import { InteractionReplyOptions } from 'discord.js';
import { randArrItem, roll } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';

import { decodeEggNames, eggNameEffect, EggType, eggTypes, encodeEggNames, validateEggType } from '../../lib/easter';
import { mahojiChatHead } from '../../lib/util/chatHeadImage';
import { resolveOSItems } from '../../lib/util/resolveItems';
import { OSBMahojiCommand } from '../lib/util';

function bunnyMsg(msg: string) {
	return mahojiChatHead({
		content: msg,
		head: 'bunny'
	});
}

export const easterCommand: OSBMahojiCommand = {
	name: 'easter',
	description: 'The 2023 Easter Event!',
	attributes: {
		requiresMinion: true
	},
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'start',
			description: 'Start the event!'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'create_egg',
			description: 'Create an Easter Egg!',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'first_type',
					description: 'The type of egg you want to make.',
					required: true,
					choices: eggTypes.map(i => ({ name: i, value: i }))
				},
				{
					type: ApplicationCommandOptionType.String,
					name: 'second_type',
					description: 'The type of egg you want to make.',
					required: true,
					choices: eggTypes.map(i => ({ name: i, value: i }))
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'hand_in',
			description: 'Hand in an Easter Egg!'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'not_handed_in',
			description: "See what eggs you haven't handed in"
		}
	],
	run: async ({
		options,
		userID
	}: CommandRunOptions<{
		start?: {};
		create_egg?: {
			first_type: string;
			second_type: string;
		};
		hand_in?: {};
		not_handed_in?: {};
	}>) => {
		const user = await mUserFetch(userID);
		if (options.start) {
			if (user.owns('Chocolate pot')) {
				return bunnyMsg('You already started the event, go make some Easter Eggs, and then hand them to me!');
			}
			const loot = new Bank().add('Chocolate pot');
			await user.addItemsToBank({ items: loot, collectionLog: true });

			let msg =
				'Take this Chocolate pot, and using Chocolate bars, make some Easter Eggs, and then hand them to me!';
			if (user.id === '268767449791332354') {
				msg = 'Take this Chocolate pot, and using Chocolate bars, ma... wait a minute, you ARE an Egg...';
			}

			return {
				...(await bunnyMsg(msg)),
				content: `You received: ${loot}. Find *Egg coating*'s while doing trips, and use those and Chocolate bars to create Easter eggs using${mentionCommand(
					globalClient,
					'easter',
					'create_egg'
				)} - then hand them into the Easter Bunny using ${mentionCommand(globalClient, 'easter', 'hand_in')}.`
			};
		}

		const eggsMade = user.user.easter_egg_types_made;

		if (options.create_egg) {
			if (user.user.easter_egg_to_hand_in) return 'You already have an egg to hand in!';
			if (!user.owns('Chocolate pot')) return 'You need to start the event first!';
			const firstName = options.create_egg.first_type as EggType;
			const lastName = options.create_egg.second_type as EggType;
			const validity = validateEggType(firstName, lastName);
			if (typeof validity === 'string') return validity;
			const encoded = encodeEggNames(firstName, lastName);
			if (eggsMade.includes(encoded)) {
				return "You've already made this egg... try something new!";
			}

			const cost = new Bank().add('Chocolate bar', 100).add('Egg coating');
			if (!user.owns(cost)) return `You need ${cost} to make an Easter Egg!`;
			await user.removeItemsFromBank(cost);
			await user.update({
				easter_egg_to_hand_in: encodeEggNames(firstName, lastName)
			});

			return `You created a ${firstName} ${lastName} egg! Hand it in to the Easter Bunny now: ${mentionCommand(
				globalClient,
				'easter',
				'hand_in'
			)}`;
		}

		if (options.hand_in) {
			if (!user.user.easter_egg_to_hand_in) return bunnyMsg('You dont have an egg to hand in...');
			const egg = decodeEggNames(user.user.easter_egg_to_hand_in);
			await user.update({
				easter_egg_to_hand_in: null,
				easter_egg_types_made: {
					push: encodeEggNames(egg[0], egg[1])
				}
			});

			const response: InteractionReplyOptions = {
				...(await bunnyMsg(await eggNameEffect(user, ...egg)))
			};

			const unownedCosmetic = resolveOSItems(['Floppy bunny ears', 'Easter egg backpack']).filter(
				i => !user.cl.has(i.id)
			);
			const eggsHandedIn = user.user.easter_egg_types_made.length;
			const isMissingAnItem = unownedCosmetic.length > 0;

			const dropRate = isMissingAnItem ? (eggsHandedIn > 35 ? 2 : 10) : 10;

			if (roll(dropRate)) {
				if (unownedCosmetic.length > 0) {
					const item = randArrItem(unownedCosmetic);
					const loot = new Bank().add(item.id);
					await user.addItemsToBank({ items: loot, collectionLog: true });
					response.content = `The Easter Bunny has given you an extra reward: ${loot}.`;
				}
			}
			return response;
		}

		if (options.not_handed_in) {
			const allPossibleEggs = eggTypes.flatMap(first => eggTypes.map(second => encodeEggNames(first, second)));
			const notMade = allPossibleEggs.filter(i => !eggsMade.includes(i));
			if (notMade.length === 0) return 'You have made all the eggs!';
			return `You have not made the following eggs: ${notMade
				.map(i => decodeEggNames(i))
				.filter(a => validateEggType(...a) === null)
				.map(t => t.join(' '))
				.join(', ')}`;
		}

		return 'Invalid command.';
	}
};
