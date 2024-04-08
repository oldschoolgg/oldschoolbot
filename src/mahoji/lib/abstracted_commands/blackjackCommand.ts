import { channelIsSendable } from '@oldschoolgg/toolkit';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction } from 'discord.js';
import { Time } from 'e';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { Bank } from 'oldschooljs';
import { toKMB } from 'oldschooljs/dist/util';

import { awaitMessageComponentInteraction } from '../../../lib/util';
import { handleMahojiConfirmation } from '../../../lib/util/handleMahojiConfirmation';
import { deferInteraction } from '../../../lib/util/interactionReply';
import { mahojiParseNumber } from '../../mahojiSettings';

const returnButtons = [
	new ActionRowBuilder<ButtonBuilder>().addComponents([
		new ButtonBuilder({
			label: 'Hit',
			style: ButtonStyle.Secondary,
			customId: 'hit'
		}),
		new ButtonBuilder({
			label: 'Stand',
			style: ButtonStyle.Secondary,
			customId: 'stand'
		})
	])
];

interface Card {
	suit: string;
	value: string;
}

// Define constants for suits and values
const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'];

// Function to create a deck of cards
function createDeck(): Card[] {
	const deck: Card[] = [];
	for (const suit of suits) {
		for (const value of values) {
			deck.push({ suit, value });
		}
	}
	return deck;
}

// Function to shuffle the deck
function shuffleDeck(deck: Card[]): void {
	for (let i = deck.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[deck[i], deck[j]] = [deck[j], deck[i]];
	}
}

// Function to deal a card from the deck
function dealCard(deck: Card[]): Card {
	return deck.pop()!;
}

// Function to calculate the value of a hand
function calculateHandValue(hand: Card[]): number {
	let sum = 0;
	let aceCount = 0;
	for (const card of hand) {
		if (card.value === 'Ace') {
			sum += 11;
			aceCount++;
		} else if (card.value === 'Jack' || card.value === 'Queen' || card.value === 'King') {
			sum += 10;
		} else {
			sum += parseInt(card.value);
		}
	}
	while (sum > 21 && aceCount > 0) {
		sum -= 10;
		aceCount--;
	}
	return sum;
}

export async function blackjackCommand(
	user: MUser,
	_amount: string,
	interaction: ChatInputCommandInteraction
): CommandResponse {
	await deferInteraction(interaction);
	const amount = mahojiParseNumber({ input: _amount, min: 1 });

	if (user.isIronman) {
		return "Ironmen can't gamble! Go pickpocket some men for GP.";
	}

	if (!amount) {
		return `**Blackjack:**
- Beat the dealer to win! You must gamble between 20m and 1b.`;
	}

	if (amount < 20_000_000 || amount > 1_000_000_000) {
		return 'You can only gamble between 20m and 1b.';
	}

	const channel = globalClient.channels.cache.get(interaction.channelId);
	if (!channelIsSendable(channel)) return 'Invalid channel.';

	await handleMahojiConfirmation(
		interaction,
		`Are you sure you want to gamble ${toKMB(amount)}? You might lose it all, you might win a lot.`
	);
	await user.sync();
	const currentBalance = user.GP;
	if (currentBalance < amount) {
		return "You don't have enough GP to make this bet.";
	}
	await user.removeItemsFromBank(new Bank().add('Coins', amount));

	// Create and shuffle the deck
	const deck = createDeck();
	shuffleDeck(deck);

	// Deal initial hands
	const playerHand = [dealCard(deck), dealCard(deck)];
	const dealerHand = [dealCard(deck), dealCard(deck)];

	// Check for player blackjack
	if (calculateHandValue(playerHand) === 21) {
		await user.addItemsToBank({ items: new Bank().add('Coins', amount * 2), collectionLog: false });
		const playerCards = `**Your Hand**: ${playerHand.map(card => `${card.value} of ${card.suit}`).join(', ')}`;
		return `Blackjack! Player wins!\n${playerCards}`;
	}

	// Send initial message with player's hand and hit/stand buttons
	let playerHandValue = calculateHandValue(playerHand);
	const dealerCard = dealerHand[0];
	let content = `**Dealer Card**: ${dealerCard.value} of ${dealerCard.suit}\n**Your Hand**: ${playerHand
		.map(card => `${card.value} of ${card.suit}`)
		.join(', ')}`;

	const sentMessage = await channel.send({ content, components: returnButtons });

	try {
		while (true) {
			const selection = await awaitMessageComponentInteraction({
				message: sentMessage,
				filter: i => {
					if (i.user.id !== user.id) {
						i.reply({ ephemeral: true, content: 'This is not your confirmation message.' });
						return false;
					}
					return true;
				},
				time: Time.Second * 15
			});
			if (!selection.isButton()) continue;
			switch (selection.customId) {
				case 'hit': {
					// Player hits
					playerHand.push(dealCard(deck));
					playerHandValue = calculateHandValue(playerHand);
					if (playerHandValue > 21) {
						// Player busts, update message content to show full hand
						content = `**Dealer Card**: ${dealerCard.value} of ${
							dealerCard.suit
						}\n**Your Final Hand**: ${playerHand.map(card => `${card.value} of ${card.suit}`).join(', ')}`;
						await sentMessage.edit({ content, components: [] });
						return 'Player busts! Dealer wins!';
					}
					// Player hasn't bust yet, update message content with the new full hand
					content = `Dealer Card: ${dealerCard.value} of ${dealerCard.suit}\n**Your Hand**: ${playerHand
						.map(card => `${card.value} of ${card.suit}`)
						.join(', ')}`;
					await sentMessage.edit({ content, components: returnButtons });
					break;
				}

				case 'stand': {
					// Player stands
					while (calculateHandValue(dealerHand) < 17) {
						dealerHand.push(dealCard(deck));
					}

					// Update message content to show dealer's hand and player's final hand
					const content = `**Dealer's Hand**: ${dealerHand
						.map(card => `${card.value} of ${card.suit}`)
						.join(', ')}\n**Your Final Hand**: ${playerHand
						.map(card => `${card.value} of ${card.suit}`)
						.join(', ')}`;
					await sentMessage.edit({ content, components: [] });

					// Determine the winner
					const playerHandValue = calculateHandValue(playerHand);
					if (playerHandValue > 21) {
						return 'Player busts! Dealer wins!';
					}
					const dealerHandValue = calculateHandValue(dealerHand);
					if (dealerHandValue > 21 || playerHandValue > dealerHandValue) {
						await user.addItemsToBank({ items: new Bank().add('Coins', amount * 2), collectionLog: false });
						return 'Player wins!';
					}
					return 'Dealer wins!';
				}
			}
		}
	} catch (err: unknown) {
		console.error(err);
	} finally {
		await sentMessage.edit({ components: [] });
	}
	return 'Timed out, Dealer wins!';
}
