import type { RNGProvider } from 'node-rng';
import { describe, expect, test } from 'vitest';

import {
	applyInsuranceDecision,
	applyPlayerAction,
	type BlackjackCard,
	type BlackjackGame,
	createBlackjackGame,
	handValue,
	playDealer,
	settleBlackjackGame
} from '@/lib/blackjack/engine.js';

function card(rank: BlackjackCard['rank'], suit: BlackjackCard['suit'] = 'spades'): BlackjackCard {
	const value = rank === 'A' ? 11 : ['J', 'Q', 'K'].includes(rank) ? 10 : Number(rank);
	return { rank, suit, value };
}

function baseGame(): BlackjackGame {
	return {
		baseBet: 100,
		shoe: [],
		hands: [
			{
				cards: [card('10'), card('7')],
				bet: 100,
				stood: false,
				doubled: false,
				isSplitHand: false,
				isSplitAces: false,
				canBlackjackPayout: true
			}
		],
		currentHandIndex: 0,
		dealerCards: [card('10', 'hearts'), card('7', 'clubs')],
		phase: 'player',
		insuranceBet: 0,
		dealerPeeked: false,
		dealerHasBlackjack: null
	};
}

describe('blackjack engine', () => {
	test('handValue handles soft totals and blackjack', () => {
		expect(handValue([card('A'), card('6')])).toMatchObject({
			total: 17,
			isSoft: true,
			isBust: false,
			isBlackjack: false
		});
		expect(handValue([card('A'), card('K')])).toMatchObject({
			total: 21,
			isBlackjack: true
		});
		expect(handValue([card('A'), card('A'), card('9')])).toMatchObject({
			total: 21,
			isSoft: true
		});
	});

	test('dealer stands on soft 17 (S17)', () => {
		const game = baseGame();
		game.phase = 'dealer';
		game.dealerCards = [card('A'), card('6')];
		game.shoe = [card('5')];
		playDealer(game);
		expect(game.dealerCards).toHaveLength(2);
		expect(handValue(game.dealerCards).total).toBe(17);
		expect(game.phase).toBe('finished');
	});

	test('split aces draw one card each and auto-stand', () => {
		const game = baseGame();
		game.hands[0].cards = [card('A'), card('A')];
		game.hands[0].canBlackjackPayout = true;
		game.dealerCards = [card('10'), card('7')];
		game.shoe = [card('2'), card('3')];
		applyPlayerAction(game, 'SPLIT');

		expect(game.hands).toHaveLength(2);
		expect(game.hands[0].isSplitAces).toBe(true);
		expect(game.hands[1].isSplitAces).toBe(true);
		expect(game.hands[0].cards).toHaveLength(2);
		expect(game.hands[1].cards).toHaveLength(2);
		expect(game.hands[0].stood).toBe(true);
		expect(game.hands[1].stood).toBe(true);
		expect(game.phase).toBe('finished');
	});

	test('insurance settles correctly when dealer has blackjack', () => {
		const game = baseGame();
		game.phase = 'insurance';
		game.hands[0].cards = [card('10'), card('9')];
		game.dealerCards = [card('A'), card('K')];

		applyInsuranceDecision(game, true);
		expect(game.phase).toBe('finished');
		expect(game.insuranceBet).toBe(50);

		const settlement = settleBlackjackGame(game);
		expect(settlement.dealerHasBlackjack).toBe(true);
		expect(settlement.totalWagered).toBe(150);
		expect(settlement.insurancePayout).toBe(150);
		expect(settlement.totalPayout).toBe(150);
		expect(settlement.net).toBe(0);
	});

	test('dealer 10-value upcard is peek-only, not insurance', () => {
		const rng: RNGProvider = {
			roll: () => true,
			randInt: (_min, max) => max,
			randFloat: (_min, max) => max,
			rand: () => 1,
			shuffle: array => array,
			pick: array => array[array.length - 1],
			percentChance: () => true,
			randomVariation: value => value
		};
		const game = createBlackjackGame({ bet: 100, rng, decks: 1 });
		expect(game.dealerCards[0].rank).toBe('Q');
		expect(game.phase).toBe('player');
		expect(game.dealerPeeked).toBe(true);
		expect(game.dealerHasBlackjack).toBe(false);
	});
});
