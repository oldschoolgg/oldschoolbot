import { randomBytes } from 'node:crypto';

import type { BlackjackGame } from '@/lib/blackjack/engine.js';

export interface ActiveBlackjackGame {
	userID: string;
	channelID: string;
	messageID: string | null;
	nonce: string;
	game: BlackjackGame;
	createdAt: number;
	updatedAt: number;
	timeout: NodeJS.Timeout | null;
}

export interface PendingBlackjackStart {
	userID: string;
	channelID: string;
	messageID: string | null;
	nonce: string;
	amount: number;
	createdAt: number;
	updatedAt: number;
	timeout: NodeJS.Timeout | null;
}

const gamesByUser = new Map<string, ActiveBlackjackGame>();
const userByNonce = new Map<string, string>();
const pendingStartsByUser = new Map<string, PendingBlackjackStart>();
const pendingStartUserByNonce = new Map<string, string>();

function generateNonce(): string {
	return randomBytes(10).toString('hex');
}

function removeNonce(nonce: string): void {
	userByNonce.delete(nonce);
}

function removePendingStartNonce(nonce: string): void {
	pendingStartUserByNonce.delete(nonce);
}

export function hasActiveBlackjackGame(userID: string): boolean {
	return gamesByUser.has(userID);
}

export function hasPendingBlackjackStart(userID: string): boolean {
	return pendingStartsByUser.has(userID);
}

export function getActiveBlackjackGame(userID: string): ActiveBlackjackGame | null {
	return gamesByUser.get(userID) ?? null;
}

export function getPendingBlackjackStart(userID: string): PendingBlackjackStart | null {
	return pendingStartsByUser.get(userID) ?? null;
}

export function getActiveBlackjackGameByNonce(nonce: string): ActiveBlackjackGame | null {
	const userID = userByNonce.get(nonce);
	if (!userID) return null;
	return gamesByUser.get(userID) ?? null;
}

export function getPendingBlackjackStartByNonce(nonce: string): PendingBlackjackStart | null {
	const userID = pendingStartUserByNonce.get(nonce);
	if (!userID) return null;
	return pendingStartsByUser.get(userID) ?? null;
}

export function createActiveBlackjackGame({
	userID,
	channelID,
	game
}: {
	userID: string;
	channelID: string;
	game: BlackjackGame;
}): ActiveBlackjackGame {
	if (gamesByUser.has(userID)) {
		throw new Error('User already has an active blackjack game.');
	}
	const now = Date.now();
	const nonce = generateNonce();
	const active: ActiveBlackjackGame = {
		userID,
		channelID,
		messageID: null,
		nonce,
		game,
		createdAt: now,
		updatedAt: now,
		timeout: null
	};
	gamesByUser.set(userID, active);
	userByNonce.set(nonce, userID);
	return active;
}

export function createPendingBlackjackStart({
	userID,
	channelID,
	amount
}: {
	userID: string;
	channelID: string;
	amount: number;
}): PendingBlackjackStart {
	if (pendingStartsByUser.has(userID)) {
		throw new Error('User already has a pending blackjack start.');
	}
	const now = Date.now();
	const nonce = generateNonce();
	const pending: PendingBlackjackStart = {
		userID,
		channelID,
		messageID: null,
		nonce,
		amount,
		createdAt: now,
		updatedAt: now,
		timeout: null
	};
	pendingStartsByUser.set(userID, pending);
	pendingStartUserByNonce.set(nonce, userID);
	return pending;
}

export function updateBlackjackMessageID(userID: string, messageID: string): void {
	const game = gamesByUser.get(userID);
	if (!game) return;
	game.messageID = messageID;
	game.updatedAt = Date.now();
}

export function updatePendingBlackjackStartMessageID(userID: string, messageID: string): void {
	const pending = pendingStartsByUser.get(userID);
	if (!pending) return;
	pending.messageID = messageID;
	pending.updatedAt = Date.now();
}

export function refreshBlackjackTimeout({
	userID,
	timeoutMs,
	onTimeout
}: {
	userID: string;
	timeoutMs: number;
	onTimeout: (game: ActiveBlackjackGame) => Promise<void> | void;
}): void {
	const game = gamesByUser.get(userID);
	if (!game) return;
	if (game.timeout) {
		clearTimeout(game.timeout);
	}
	const expectedNonce = game.nonce;
	game.timeout = setTimeout(async () => {
		const current = gamesByUser.get(userID);
		if (!current) return;
		if (current.nonce !== expectedNonce) return;
		try {
			await onTimeout(current);
		} catch (err) {
			Logging.logError(err as Error);
		}
	}, timeoutMs);
}

export function refreshPendingBlackjackStartTimeout({
	userID,
	timeoutMs,
	onTimeout
}: {
	userID: string;
	timeoutMs: number;
	onTimeout: (pending: PendingBlackjackStart) => Promise<void> | void;
}): void {
	const pending = pendingStartsByUser.get(userID);
	if (!pending) return;
	if (pending.timeout) {
		clearTimeout(pending.timeout);
	}
	const expectedNonce = pending.nonce;
	pending.timeout = setTimeout(async () => {
		const current = pendingStartsByUser.get(userID);
		if (!current) return;
		if (current.nonce !== expectedNonce) return;
		try {
			await onTimeout(current);
		} catch (err) {
			Logging.logError(err as Error);
		}
	}, timeoutMs);
}

export function clearBlackjackTimeout(userID: string): void {
	const game = gamesByUser.get(userID);
	if (!game) return;
	if (game.timeout) {
		clearTimeout(game.timeout);
		game.timeout = null;
	}
}

export function clearPendingBlackjackStartTimeout(userID: string): void {
	const pending = pendingStartsByUser.get(userID);
	if (!pending) return;
	if (pending.timeout) {
		clearTimeout(pending.timeout);
		pending.timeout = null;
	}
}

export function destroyActiveBlackjackGame(userID: string): void {
	const game = gamesByUser.get(userID);
	if (!game) return;
	if (game.timeout) {
		clearTimeout(game.timeout);
	}
	removeNonce(game.nonce);
	gamesByUser.delete(userID);
}

export function destroyPendingBlackjackStart(userID: string): void {
	const pending = pendingStartsByUser.get(userID);
	if (!pending) return;
	if (pending.timeout) {
		clearTimeout(pending.timeout);
	}
	removePendingStartNonce(pending.nonce);
	pendingStartsByUser.delete(userID);
}

export function touchActiveBlackjackGame(userID: string): void {
	const game = gamesByUser.get(userID);
	if (!game) return;
	game.updatedAt = Date.now();
}

export function touchPendingBlackjackStart(userID: string): void {
	const pending = pendingStartsByUser.get(userID);
	if (!pending) return;
	pending.updatedAt = Date.now();
}
