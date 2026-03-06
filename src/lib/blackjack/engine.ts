export type BlackjackSuit = 'clubs' | 'diamonds' | 'hearts' | 'spades';
export type BlackjackRank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
export type BlackjackPhase = 'insurance' | 'player' | 'dealer' | 'finished';
export type BlackjackAction = 'HIT' | 'STAND' | 'DOUBLE' | 'SPLIT';

export interface BlackjackCard {
	rank: BlackjackRank;
	suit: BlackjackSuit;
	value: number;
}

export interface BlackjackHand {
	cards: BlackjackCard[];
	bet: number;
	stood: boolean;
	doubled: boolean;
	isSplitHand: boolean;
	isSplitAces: boolean;
	canBlackjackPayout: boolean;
}

export interface BlackjackGame {
	baseBet: number;
	shoe: BlackjackCard[];
	hands: BlackjackHand[];
	currentHandIndex: number;
	dealerCards: BlackjackCard[];
	phase: BlackjackPhase;
	insuranceBet: number;
	dealerPeeked: boolean;
	dealerHasBlackjack: boolean | null;
}

export interface HandValue {
	total: number;
	hardTotal: number;
	softTotal: number;
	isSoft: boolean;
	isBust: boolean;
	isBlackjack: boolean;
}

export interface BlackjackActions {
	hit: boolean;
	stand: boolean;
	double: boolean;
	split: boolean;
	takeInsurance: boolean;
	declineInsurance: boolean;
}

export type BlackjackHandOutcome = 'blackjack' | 'win' | 'lose' | 'push';

export interface BlackjackSettlementHand {
	index: number;
	outcome: BlackjackHandOutcome;
	bet: number;
	payout: number;
	playerValue: HandValue;
}

export interface BlackjackSettlement {
	hands: BlackjackSettlementHand[];
	insuranceBet: number;
	insurancePayout: number;
	totalWagered: number;
	totalPayout: number;
	net: number;
	dealerValue: HandValue;
	dealerHasBlackjack: boolean;
}

const ranks: BlackjackRank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const suits: BlackjackSuit[] = ['clubs', 'diamonds', 'hearts', 'spades'];

function cardValue(rank: BlackjackRank): number {
	if (rank === 'A') return 11;
	if (rank === 'J' || rank === 'Q' || rank === 'K') return 10;
	return Number(rank);
}

function cloneCard(card: BlackjackCard): BlackjackCard {
	return { ...card };
}

function drawCard(game: BlackjackGame): BlackjackCard {
	const card = game.shoe.pop();
	if (!card) {
		throw new Error('Blackjack shoe is empty.');
	}
	return cloneCard(card);
}

function getCurrentHand(game: BlackjackGame): BlackjackHand | null {
	return game.hands[game.currentHandIndex] ?? null;
}

function isTenValueRank(rank: BlackjackRank): boolean {
	return rank === '10' || rank === 'J' || rank === 'Q' || rank === 'K';
}

function canDealerPeek(game: BlackjackGame): boolean {
	const upcard = game.dealerCards[0];
	return upcard.rank === 'A' || isTenValueRank(upcard.rank);
}

function peekDealerForBlackjack(game: BlackjackGame): void {
	if (game.dealerPeeked) return;
	game.dealerPeeked = true;
	if (!canDealerPeek(game)) {
		game.dealerHasBlackjack = false;
		return;
	}
	game.dealerHasBlackjack = handValue(game.dealerCards).isBlackjack;
}

function normalizeHandAfterDraw(hand: BlackjackHand): void {
	const value = handValue(hand.cards);
	if (value.isBust || value.total === 21) {
		hand.stood = true;
	}
}

function advanceToNextHand(game: BlackjackGame): void {
	if (game.phase !== 'player') return;
	while (true) {
		const hand = getCurrentHand(game);
		if (!hand) {
			playDealer(game);
			return;
		}
		const value = handValue(hand.cards);
		if (!hand.stood && !value.isBust) return;
		game.currentHandIndex += 1;
		if (game.currentHandIndex >= game.hands.length) {
			playDealer(game);
			return;
		}
	}
}

export function handValue(cards: BlackjackCard[]): HandValue {
	let hardTotal = 0;
	let aceCount = 0;
	for (const card of cards) {
		if (card.rank === 'A') {
			aceCount += 1;
			hardTotal += 1;
		} else {
			hardTotal += card.value;
		}
	}
	const canUseSoftAce = aceCount > 0 && hardTotal + 10 <= 21;
	const softTotal = canUseSoftAce ? hardTotal + 10 : hardTotal;
	return {
		total: softTotal,
		hardTotal,
		softTotal,
		isSoft: canUseSoftAce,
		isBust: softTotal > 21,
		isBlackjack: cards.length === 2 && softTotal === 21
	};
}

export function dealerShouldHit(value: HandValue, { hitSoft17 }: { hitSoft17: boolean }): boolean {
	if (value.total < 17) return true;
	if (hitSoft17 && value.total === 17 && value.isSoft) return true;
	return false;
}

export function createShuffledShoe(rng: RNGProvider, decks = 4): BlackjackCard[] {
	if (decks < 1) throw new Error('Decks must be at least 1.');
	const shoe: BlackjackCard[] = [];
	for (let deckIndex = 0; deckIndex < decks; deckIndex++) {
		for (const suit of suits) {
			for (const rank of ranks) {
				shoe.push({ suit, rank, value: cardValue(rank) });
			}
		}
	}
	for (let i = shoe.length - 1; i > 0; i--) {
		const j = rng.randInt(0, i);
		[shoe[i], shoe[j]] = [shoe[j], shoe[i]];
	}
	return shoe;
}

export function createBlackjackGame({
	bet,
	rng,
	decks = 4
}: {
	bet: number;
	rng: RNGProvider;
	decks?: number;
}): BlackjackGame {
	if (!Number.isInteger(bet) || bet < 1) {
		throw new Error(`Invalid blackjack bet: ${bet}`);
	}
	const shoe = createShuffledShoe(rng, decks);
	const game: BlackjackGame = {
		baseBet: bet,
		shoe,
		hands: [
			{
				cards: [],
				bet,
				stood: false,
				doubled: false,
				isSplitHand: false,
				isSplitAces: false,
				canBlackjackPayout: true
			}
		],
		currentHandIndex: 0,
		dealerCards: [],
		phase: 'player',
		insuranceBet: 0,
		dealerPeeked: false,
		dealerHasBlackjack: null
	};

	const hand = game.hands[0];
	hand.cards.push(drawCard(game));
	game.dealerCards.push(drawCard(game));
	hand.cards.push(drawCard(game));
	game.dealerCards.push(drawCard(game));

	const playerHasBlackjack = handValue(hand.cards).isBlackjack;
	const upcard = game.dealerCards[0];

	if (playerHasBlackjack) {
		if (canDealerPeek(game)) {
			peekDealerForBlackjack(game);
		}
		game.phase = 'finished';
		return game;
	}

	if (upcard.rank === 'A') {
		game.phase = 'insurance';
		return game;
	}

	if (isTenValueRank(upcard.rank)) {
		peekDealerForBlackjack(game);
		game.phase = game.dealerHasBlackjack ? 'finished' : 'player';
		return game;
	}

	game.phase = 'player';
	return game;
}

export function calculateInsuranceBet(baseBet: number): number {
	return Math.floor(baseBet / 2);
}

export function applyInsuranceDecision(game: BlackjackGame, takeInsurance: boolean): void {
	if (game.phase !== 'insurance') {
		throw new Error('Insurance is not available in this phase.');
	}
	game.insuranceBet = takeInsurance ? calculateInsuranceBet(game.baseBet) : 0;
	peekDealerForBlackjack(game);
	game.phase = game.dealerHasBlackjack ? 'finished' : 'player';
}

export function availableActions(game: BlackjackGame): BlackjackActions {
	if (game.phase === 'insurance') {
		return {
			hit: false,
			stand: false,
			double: false,
			split: false,
			takeInsurance: true,
			declineInsurance: true
		};
	}
	if (game.phase !== 'player') {
		return {
			hit: false,
			stand: false,
			double: false,
			split: false,
			takeInsurance: false,
			declineInsurance: false
		};
	}
	const hand = getCurrentHand(game);
	if (!hand) {
		return {
			hit: false,
			stand: false,
			double: false,
			split: false,
			takeInsurance: false,
			declineInsurance: false
		};
	}
	const value = handValue(hand.cards);
	const canStand = !hand.stood && !value.isBust;
	const canHit = canStand && !(hand.isSplitAces && hand.cards.length >= 2);
	const canDouble = canStand && hand.cards.length === 2 && !hand.doubled && !hand.isSplitAces;
	const canSplit =
		canStand &&
		hand.cards.length === 2 &&
		hand.cards[0].rank === hand.cards[1].rank &&
		!hand.doubled &&
		game.hands.length < 4;
	return {
		hit: canHit,
		stand: canStand,
		double: canDouble,
		split: canSplit,
		takeInsurance: false,
		declineInsurance: false
	};
}

export function additionalBetRequiredForAction(game: BlackjackGame, action: BlackjackAction): number {
	if (game.phase !== 'player') return 0;
	const hand = getCurrentHand(game);
	if (!hand) return 0;
	if (action === 'DOUBLE') {
		const actions = availableActions(game);
		return actions.double ? hand.bet : 0;
	}
	if (action === 'SPLIT') {
		const actions = availableActions(game);
		return actions.split ? hand.bet : 0;
	}
	return 0;
}

export function applyPlayerAction(game: BlackjackGame, action: BlackjackAction): void {
	if (game.phase !== 'player') {
		throw new Error('You cannot act right now.');
	}
	const hand = getCurrentHand(game);
	if (!hand) {
		throw new Error('No active blackjack hand.');
	}
	const actions = availableActions(game);
	if (action === 'HIT') {
		if (!actions.hit) throw new Error('You cannot hit this hand.');
		hand.cards.push(drawCard(game));
		normalizeHandAfterDraw(hand);
		advanceToNextHand(game);
		return;
	}
	if (action === 'STAND') {
		if (!actions.stand) throw new Error('You cannot stand this hand.');
		hand.stood = true;
		advanceToNextHand(game);
		return;
	}
	if (action === 'DOUBLE') {
		if (!actions.double) throw new Error('You cannot double this hand.');
		hand.bet += hand.bet;
		hand.doubled = true;
		hand.cards.push(drawCard(game));
		hand.stood = true;
		advanceToNextHand(game);
		return;
	}
	if (action === 'SPLIT') {
		if (!actions.split) throw new Error('You cannot split this hand.');
		const [leftCard, rightCard] = hand.cards;
		const splitBet = hand.bet;
		const splitAces = leftCard.rank === 'A' && rightCard.rank === 'A';
		const leftHand: BlackjackHand = {
			cards: [leftCard, drawCard(game)],
			bet: splitBet,
			stood: false,
			doubled: false,
			isSplitHand: true,
			isSplitAces: splitAces,
			canBlackjackPayout: false
		};
		const rightHand: BlackjackHand = {
			cards: [rightCard, drawCard(game)],
			bet: splitBet,
			stood: false,
			doubled: false,
			isSplitHand: true,
			isSplitAces: splitAces,
			canBlackjackPayout: false
		};
		if (splitAces) {
			leftHand.stood = true;
			rightHand.stood = true;
		} else {
			normalizeHandAfterDraw(leftHand);
			normalizeHandAfterDraw(rightHand);
		}
		game.hands.splice(game.currentHandIndex, 1, leftHand, rightHand);
		advanceToNextHand(game);
		return;
	}
	throw new Error(`Unknown blackjack action: ${action}`);
}

export function playDealer(game: BlackjackGame): void {
	game.phase = 'dealer';
	if (game.dealerHasBlackjack) {
		game.phase = 'finished';
		return;
	}
	while (true) {
		const value = handValue(game.dealerCards);
		if (!dealerShouldHit(value, { hitSoft17: false })) break;
		game.dealerCards.push(drawCard(game));
	}
	game.phase = 'finished';
}

export function autoStand(game: BlackjackGame): void {
	if (game.phase === 'insurance') {
		applyInsuranceDecision(game, false);
	}
	if (game.phase !== 'player') return;
	for (let i = game.currentHandIndex; i < game.hands.length; i++) {
		const hand = game.hands[i];
		const value = handValue(hand.cards);
		if (!value.isBust) {
			hand.stood = true;
		}
	}
	advanceToNextHand(game);
}

export function settleBlackjackGame(game: BlackjackGame): BlackjackSettlement {
	if (game.phase !== 'finished') {
		throw new Error('Cannot settle unfinished blackjack game.');
	}
	const dealerValue = handValue(game.dealerCards);
	const dealerHasBlackjack = game.dealerHasBlackjack ?? dealerValue.isBlackjack;
	const handResults: BlackjackSettlementHand[] = [];
	let totalPayout = 0;
	let totalWagered = game.insuranceBet;

	for (let index = 0; index < game.hands.length; index++) {
		const hand = game.hands[index];
		const playerValue = handValue(hand.cards);
		totalWagered += hand.bet;
		let outcome: BlackjackHandOutcome;
		let payout = 0;

		if (playerValue.isBust) {
			outcome = 'lose';
		} else if (hand.canBlackjackPayout && playerValue.isBlackjack && !dealerHasBlackjack) {
			outcome = 'blackjack';
			payout = Math.floor(hand.bet * 2.5);
		} else if (dealerHasBlackjack && hand.canBlackjackPayout && playerValue.isBlackjack) {
			outcome = 'push';
			payout = hand.bet;
		} else if (dealerHasBlackjack) {
			outcome = 'lose';
		} else if (dealerValue.isBust) {
			outcome = 'win';
			payout = hand.bet * 2;
		} else if (playerValue.total > dealerValue.total) {
			outcome = 'win';
			payout = hand.bet * 2;
		} else if (playerValue.total === dealerValue.total) {
			outcome = 'push';
			payout = hand.bet;
		} else {
			outcome = 'lose';
		}

		totalPayout += payout;
		handResults.push({
			index,
			outcome,
			bet: hand.bet,
			payout,
			playerValue
		});
	}

	const insurancePayout = game.insuranceBet > 0 && dealerHasBlackjack ? game.insuranceBet * 3 : 0;
	totalPayout += insurancePayout;

	return {
		hands: handResults,
		insuranceBet: game.insuranceBet,
		insurancePayout,
		totalWagered,
		totalPayout,
		net: totalPayout - totalWagered,
		dealerValue,
		dealerHasBlackjack
	};
}
