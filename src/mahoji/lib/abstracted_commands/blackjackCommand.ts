import { join } from 'node:path';
import { ButtonBuilder, ButtonStyle, EmbedBuilder, SpecialResponse } from '@oldschoolgg/discord';
import { Time } from '@oldschoolgg/toolkit';
import { Bank, toKMB } from 'oldschooljs';

import {
	additionalBetRequiredForAction,
	applyInsuranceDecision,
	applyPlayerAction,
	autoStand,
	availableActions,
	type BlackjackAction,
	type BlackjackCard,
	type BlackjackGame,
	calculateInsuranceBet,
	createBlackjackGame,
	handValue,
	settleBlackjackGame
} from '@/lib/blackjack/engine.js';
import {
	createActiveBlackjackGame,
	createPendingBlackjackStart,
	destroyActiveBlackjackGame,
	destroyPendingBlackjackStart,
	getActiveBlackjackGame,
	getActiveBlackjackGameByNonce,
	getPendingBlackjackStart,
	getPendingBlackjackStartByNonce,
	hasActiveBlackjackGame,
	hasPendingBlackjackStart,
	refreshBlackjackTimeout,
	refreshPendingBlackjackStartTimeout,
	touchActiveBlackjackGame,
	touchPendingBlackjackStart,
	updateBlackjackMessageID,
	updatePendingBlackjackStartMessageID
} from '@/lib/blackjack/state.js';
import { type CanvasImage, canvasToBuffer, createCanvas, loadImage } from '@/lib/canvas/canvasUtil.js';
import { mahojiParseNumber } from '@/mahoji/mahojiSettings.js';

const BLACKJACK_MIN_BET = 1_000_000;
const BLACKJACK_MAX_BET = 5_000_000_000;
const BLACKJACK_CONFIRM_TIMEOUT = Time.Second * 15;
const BLACKJACK_DECISION_TIMEOUT = Time.Second * 45;
const BLACKJACK_IMAGE_NAME = 'blackjack_table.png';
const BLACKJACK_CARD_ASSET_DIR = './src/lib/resources/images/gambling/cards';

type InsuranceAction = 'INSURE' | 'NO_INSURE';
type BlackjackButtonAction = BlackjackAction | InsuranceAction;
type BlackjackStartAction = 'CONFIRM' | 'CANCEL';

function makeBlackjackButtonID(action: BlackjackButtonAction, nonce: string): string {
	return `BJ|${action}|${nonce}`;
}

function makeBlackjackStartButtonID(action: BlackjackStartAction, nonce: string): string {
	return `BJC|${action}|${nonce}`;
}

function parseBlackjackButtonID(id: string): { action: BlackjackButtonAction; nonce: string } | null {
	const [prefix, action, nonce] = id.split('|');
	if (prefix !== 'BJ' || !action || !nonce) return null;
	if (!['HIT', 'STAND', 'DOUBLE', 'SPLIT', 'INSURE', 'NO_INSURE'].includes(action)) return null;
	return { action: action as BlackjackButtonAction, nonce };
}

function parseBlackjackStartButtonID(id: string): { action: BlackjackStartAction; nonce: string } | null {
	const [prefix, action, nonce] = id.split('|');
	if (prefix !== 'BJC' || !action || !nonce) return null;
	if (!['CONFIRM', 'CANCEL'].includes(action)) return null;
	return { action: action as BlackjackStartAction, nonce };
}

function outcomeLabel(outcome: 'blackjack' | 'win' | 'lose' | 'push'): string {
	if (outcome === 'blackjack') return 'Blackjack';
	if (outcome === 'win') return 'Win';
	if (outcome === 'lose') return 'Lose';
	return 'Push';
}

const cardImageCache = new Map<string, Promise<CanvasImage>>();

function rankAssetName(rank: BlackjackCard['rank']): string {
	if (rank === 'A') return 'ace';
	if (rank === 'J') return 'jack';
	if (rank === 'Q') return 'queen';
	if (rank === 'K') return 'king';
	return rank;
}

function cardAssetFile(card: BlackjackCard | 'back'): string {
	if (card === 'back') return 'back.svg';
	return `${rankAssetName(card.rank)}_of_${card.suit}.svg`;
}

async function loadCardAsset(card: BlackjackCard | 'back'): Promise<CanvasImage> {
	const file = cardAssetFile(card);
	let cached = cardImageCache.get(file);
	if (!cached) {
		cached = loadImage(join(BLACKJACK_CARD_ASSET_DIR, file));
		cardImageCache.set(file, cached);
	}
	return cached;
}

async function renderBlackjackTableImage({
	game,
	hideDealerHole
}: {
	game: BlackjackGame;
	hideDealerHole: boolean;
}): Promise<Buffer> {
	const dealerVisibleCards = hideDealerHole ? [game.dealerCards[0]] : game.dealerCards;
	const dealerTotal = handValue(dealerVisibleCards).total;
	const dealerCards: (BlackjackCard | 'back')[] = game.dealerCards.map((card, index) =>
		hideDealerHole && index === 1 ? 'back' : card
	);
	const rows: { label: string; cards: (BlackjackCard | 'back')[] }[] = [
		{ label: `Dealer (${dealerTotal})`, cards: dealerCards },
		...game.hands.map((hand, index) => ({
			label: `Hand ${index + 1} (${handValue(hand.cards).total})`,
			cards: hand.cards
		}))
	];
	const maxCards = Math.max(2, ...rows.map(row => row.cards.length));
	const base = await loadCardAsset('back');
	const cardScale = 0.42;
	const cardWidth = Math.max(40, Math.floor(base.width * cardScale));
	const cardHeight = Math.max(58, Math.floor(base.height * cardScale));
	const cardGap = 10;
	const rowGap = 18;
	const rowLabelHeight = 22;
	const paddingX = 24;
	const paddingY = 18;
	const titleHeight = 0;
	const width = paddingX * 2 + maxCards * cardWidth + Math.max(0, maxCards - 1) * cardGap;
	const height =
		paddingY * 2 + titleHeight + rows.length * (rowLabelHeight + cardHeight) + rowGap * (rows.length - 1);

	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext('2d');

	ctx.fillStyle = '#0a5e2a';
	ctx.fillRect(0, 0, width, height);
	ctx.strokeStyle = '#e4c870';
	ctx.lineWidth = 3;
	ctx.strokeRect(2, 2, width - 4, height - 4);

	let y = paddingY + titleHeight;
	for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
		const row = rows[rowIndex];
		const isCurrentHand = rowIndex > 0 && game.phase === 'player' && game.currentHandIndex === rowIndex - 1;
		ctx.fillStyle = isCurrentHand ? '#ffe066' : '#ffffff';
		ctx.font = 'bold 18px sans-serif';
		const rowLabel = isCurrentHand ? `> ACTIVE: ${row.label}` : row.label;
		ctx.fillText(rowLabel, paddingX, y + 16);
		const cardsY = y + rowLabelHeight;

		for (let cardIndex = 0; cardIndex < row.cards.length; cardIndex++) {
			const card = row.cards[cardIndex];
			const asset = await loadCardAsset(card);
			const x = paddingX + cardIndex * (cardWidth + cardGap);
			ctx.drawImage(asset, x, cardsY, cardWidth, cardHeight);
		}
		y += rowLabelHeight + cardHeight + rowGap;
	}

	return canvasToBuffer(canvas);
}

async function maybeAddBlackjackImage({
	game,
	embed,
	descriptionBelowImage
}: {
	game: BlackjackGame;
	embed: EmbedBuilder;
	descriptionBelowImage?: string;
}): Promise<{ embeds: EmbedBuilder[]; file?: { name: string; buffer: Buffer } }> {
	try {
		const hideDealerHole = game.phase === 'insurance' || game.phase === 'player';
		const imageBuffer = await renderBlackjackTableImage({ game, hideDealerHole });
		embed.setImage(`attachment://${BLACKJACK_IMAGE_NAME}`);
		if (descriptionBelowImage) {
			embed.setDescription(null);
			const belowEmbed = new EmbedBuilder().setColor(0x2b2d31).setDescription(descriptionBelowImage);
			return {
				embeds: [embed, belowEmbed],
				file: { name: BLACKJACK_IMAGE_NAME, buffer: imageBuffer }
			};
		}
		return {
			embeds: [embed],
			file: { name: BLACKJACK_IMAGE_NAME, buffer: imageBuffer }
		};
	} catch (err) {
		Logging.logError(err as Error);
		return { embeds: [embed] };
	}
}

function gameDescription({ game, timedOut = false }: { game: BlackjackGame; timedOut?: boolean }): string | null {
	if (game.phase === 'insurance') {
		return `Dealer shows an Ace. Insurance is available.\nMain bet: ${toKMB(game.baseBet)}.`;
	}
	if (game.phase === 'player') {
		const activeHandText =
			game.hands.length > 1 ? `\nActive hand: ${game.currentHandIndex + 1}/${game.hands.length}.` : '';
		return `Choose an action. Auto-stand in ${Math.floor(BLACKJACK_DECISION_TIMEOUT / 1000)}s.${activeHandText}`;
	}
	if (game.phase === 'dealer') {
		return 'Dealer is playing out the hand.';
	}
	if (timedOut) {
		return 'Timed out. The hand was auto-stood and settled safely.';
	}
	return null;
}

function gameEmbed({ game, timedOut = false }: { game: BlackjackGame; timedOut?: boolean }): EmbedBuilder {
	const embed = new EmbedBuilder().setTitle('Blackjack').setColor(0x1f8b4c);
	const description = gameDescription({ game, timedOut });
	if (description) embed.setDescription(description);
	return embed;
}

function finishedDescription({ game, timedOut = false }: { game: BlackjackGame; timedOut?: boolean }): string {
	const settlement = settleBlackjackGame(game);
	const lines: string[] = [];
	for (const hand of settlement.hands) {
		lines.push(
			`Hand ${hand.index + 1}: ${outcomeLabel(hand.outcome)} (${hand.playerValue.total}) ${toKMB(hand.payout)}`
		);
	}
	if (settlement.insuranceBet > 0) {
		lines.push(
			`Insurance: ${settlement.insurancePayout > 0 ? 'Win' : 'Lose'} (${toKMB(settlement.insurancePayout)})`
		);
	}
	lines.push(`Net: ${settlement.net >= 0 ? '+' : ''}${toKMB(settlement.net)}`);
	return `${timedOut ? 'Timed out, auto-stand applied.\n' : ''}${lines.join('\n')}`;
}

function finishedEmbed({ game, timedOut = false }: { game: BlackjackGame; timedOut?: boolean }): EmbedBuilder {
	const settlement = settleBlackjackGame(game);
	return new EmbedBuilder()
		.setTitle('Blackjack Result')
		.setColor(settlement.net >= 0 ? 0x57f287 : 0xed4245)
		.setDescription(finishedDescription({ game, timedOut }));
}

function activeComponents(game: BlackjackGame, nonce: string): ButtonBuilder[][] {
	if (game.phase === 'insurance') {
		return [
			[
				new ButtonBuilder()
					.setCustomId(makeBlackjackButtonID('INSURE', nonce))
					.setLabel('Take insurance')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId(makeBlackjackButtonID('NO_INSURE', nonce))
					.setLabel('Skip insurance')
					.setStyle(ButtonStyle.Secondary)
			]
		];
	}
	if (game.phase !== 'player') return [];
	const actions = availableActions(game);
	const row: ButtonBuilder[] = [];
	if (actions.hit) {
		row.push(
			new ButtonBuilder()
				.setCustomId(makeBlackjackButtonID('HIT', nonce))
				.setLabel('Hit')
				.setStyle(ButtonStyle.Primary)
		);
	}
	if (actions.stand) {
		row.push(
			new ButtonBuilder()
				.setCustomId(makeBlackjackButtonID('STAND', nonce))
				.setLabel('Stand')
				.setStyle(ButtonStyle.Secondary)
		);
	}
	if (actions.double) {
		row.push(
			new ButtonBuilder()
				.setCustomId(makeBlackjackButtonID('DOUBLE', nonce))
				.setLabel('Double')
				.setStyle(ButtonStyle.Success)
		);
	}
	if (actions.split) {
		row.push(
			new ButtonBuilder()
				.setCustomId(makeBlackjackButtonID('SPLIT', nonce))
				.setLabel('Split')
				.setStyle(ButtonStyle.Secondary)
		);
	}
	return row.length > 0 ? [row] : [];
}

function gameIsFinished(game: BlackjackGame): boolean {
	return game.phase === 'finished';
}

function startConfirmationComponents(nonce: string): ButtonBuilder[][] {
	return [
		[
			new ButtonBuilder()
				.setCustomId(makeBlackjackStartButtonID('CONFIRM', nonce))
				.setLabel('Confirm')
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setCustomId(makeBlackjackStartButtonID('CANCEL', nonce))
				.setLabel('Cancel')
				.setStyle(ButtonStyle.Secondary)
		]
	];
}

async function applySettlementToUser(user: MUser, game: BlackjackGame): Promise<void> {
	const settlement = settleBlackjackGame(game);
	const tasks: Promise<unknown>[] = [user.updateGPTrackSetting('gp_blackjack', settlement.net)];
	if (settlement.totalPayout > 0) {
		tasks.push(
			user.transactItems({
				itemsToAdd: new Bank().add('Coins', settlement.totalPayout),
				collectionLog: false
			})
		);
	}
	await Promise.all(tasks);
}

async function onBlackjackTimeout(userID: string, nonce: string): Promise<void> {
	const active = getActiveBlackjackGame(userID);
	if (!active || active.nonce !== nonce) return;

	const user = await mUserFetch(userID);
	await user.withLock('blackjack_timeout', async lockedUser => {
		const current = getActiveBlackjackGame(userID);
		if (!current || current.nonce !== nonce) return;
		autoStand(current.game);
		await applySettlementToUser(lockedUser, current.game);
		const finalEmbed = finishedEmbed({ game: current.game, timedOut: true });
		destroyActiveBlackjackGame(userID);
		try {
			if (current.messageID) {
				await globalClient.editMessage(current.channelID, current.messageID, {
					embeds: [finalEmbed],
					components: []
				});
				return;
			}
			const finalVisual = await maybeAddBlackjackImage({
				game: current.game,
				embed: finalEmbed,
				descriptionBelowImage: finishedDescription({ game: current.game, timedOut: true })
			});
			await globalClient.sendMessage(current.channelID, {
				content: `<@${userID}>`,
				embeds: finalVisual.embeds,
				files: finalVisual.file ? [finalVisual.file] : undefined
			});
		} catch {
			const finalVisual = await maybeAddBlackjackImage({
				game: current.game,
				embed: finalEmbed,
				descriptionBelowImage: finishedDescription({ game: current.game, timedOut: true })
			});
			await globalClient.sendMessage(current.channelID, {
				content: `<@${userID}>`,
				embeds: finalVisual.embeds,
				files: finalVisual.file ? [finalVisual.file] : undefined
			});
		}
	});
}

async function onBlackjackStartTimeout(userID: string, nonce: string): Promise<void> {
	const pending = getPendingBlackjackStart(userID);
	if (!pending || pending.nonce !== nonce) return;
	destroyPendingBlackjackStart(userID);
	if (!pending.messageID) return;
	try {
		await globalClient.editMessage(pending.channelID, pending.messageID, {
			content: 'You ran out of time to confirm blackjack.',
			components: []
		});
	} catch {
		// Ignore timeout-edit failures.
	}
}

function scheduleBlackjackStartTimeout(userID: string): void {
	refreshPendingBlackjackStartTimeout({
		userID,
		timeoutMs: BLACKJACK_CONFIRM_TIMEOUT,
		onTimeout: pending => onBlackjackStartTimeout(pending.userID, pending.nonce)
	});
}

function scheduleBlackjackTimeout(userID: string): void {
	refreshBlackjackTimeout({
		userID,
		timeoutMs: BLACKJACK_DECISION_TIMEOUT,
		onTimeout: game => onBlackjackTimeout(game.userID, game.nonce)
	});
}

export async function blackjackCommand({
	user,
	interaction,
	channelID,
	amountInput
}: {
	user: MUser;
	interaction: MInteraction;
	channelID: string;
	amountInput: string | undefined;
}): Promise<CommandResponse> {
	const amount = mahojiParseNumber({ input: amountInput, min: 1 });
	if (!amount) {
		return `Play blackjack with standard casino rules.
- Bet range: ${toKMB(BLACKJACK_MIN_BET)} to ${toKMB(BLACKJACK_MAX_BET)}
- 4 deck shoe, dealer stands on soft 17, blackjack pays 3:2.
- Supports insurance, double and split (including split aces).

Use: ${globalClient.mentionCommand('gamble', 'blackjack')} amount:100m`;
	}
	if (amount < BLACKJACK_MIN_BET || amount > BLACKJACK_MAX_BET) {
		return `You must bet between ${toKMB(BLACKJACK_MIN_BET)} and ${toKMB(BLACKJACK_MAX_BET)}.`;
	}
	if (hasActiveBlackjackGame(user.id)) {
		return 'You already have an active blackjack game.';
	}
	if (hasPendingBlackjackStart(user.id)) {
		return 'You already have a pending blackjack confirmation.';
	}
	const pending = createPendingBlackjackStart({
		userID: user.id,
		channelID,
		amount
	});
	const sent = await interaction.replyWithResponse({
		content: `Are you sure you want to play blackjack for ${toKMB(amount)}?\n\nYou have ${Math.floor(BLACKJACK_CONFIRM_TIMEOUT / 1000)} seconds to confirm.`,
		components: startConfirmationComponents(pending.nonce)
	});
	if (sent?.message_id) {
		updatePendingBlackjackStartMessageID(user.id, sent.message_id);
	}
	scheduleBlackjackStartTimeout(user.id);
	return SpecialResponse.RespondedManually;
}

export async function blackjackButtonHandler({
	customID,
	interaction,
	rng
}: {
	customID: string;
	interaction: OSInteraction;
	rng: RNGProvider;
}): Promise<CommandResponse> {
	const startParsed = parseBlackjackStartButtonID(customID);
	if (startParsed) {
		const pending = getPendingBlackjackStartByNonce(startParsed.nonce);
		if (!pending) {
			return { content: 'This blackjack confirmation is no longer active.', ephemeral: true };
		}
		if (interaction.userId !== pending.userID) {
			return { content: "This isn't your blackjack confirmation.", ephemeral: true };
		}

		const user = await mUserFetch(pending.userID);
		await user.withLock('blackjack_start_button', async lockedUser => {
			const currentPending = getPendingBlackjackStartByNonce(startParsed.nonce);
			if (!currentPending || currentPending.userID !== interaction.userId) {
				await interaction.reply({
					content: 'This blackjack confirmation is no longer active.',
					ephemeral: true
				});
				return;
			}
			touchPendingBlackjackStart(currentPending.userID);

			if (startParsed.action === 'CANCEL') {
				destroyPendingBlackjackStart(currentPending.userID);
				await interaction.update({
					content: 'Blackjack cancelled.',
					embeds: [],
					components: []
				});
				return;
			}

			destroyPendingBlackjackStart(currentPending.userID);
			if (hasActiveBlackjackGame(lockedUser.id)) {
				await interaction.update({
					content: 'You already have an active blackjack game.',
					embeds: [],
					components: []
				});
				return;
			}

			try {
				await lockedUser.transactItems({
					itemsToRemove: new Bank().add('Coins', currentPending.amount)
				});
			} catch {
				await interaction.update({
					content: "You don't have enough GP to make this bet.",
					embeds: [],
					components: []
				});
				return;
			}

			const game = createBlackjackGame({ bet: currentPending.amount, rng });
			if (game.phase === 'finished') {
				await applySettlementToUser(lockedUser, game);
				const finalVisual = await maybeAddBlackjackImage({
					game,
					embed: finishedEmbed({ game }),
					descriptionBelowImage: finishedDescription({ game })
				});
				await interaction.update({
					content: '',
					embeds: finalVisual.embeds,
					components: [],
					files: finalVisual.file ? [finalVisual.file] : undefined
				});
				return;
			}

			const active = createActiveBlackjackGame({
				userID: lockedUser.id,
				channelID: currentPending.channelID,
				game
			});
			updateBlackjackMessageID(lockedUser.id, interaction.messageId);
			scheduleBlackjackTimeout(lockedUser.id);
			const gameVisual = await maybeAddBlackjackImage({
				game,
				embed: gameEmbed({ game }),
				descriptionBelowImage: gameDescription({ game }) ?? undefined
			});
			await interaction.update({
				content: '',
				embeds: gameVisual.embeds,
				components: activeComponents(game, active.nonce),
				files: gameVisual.file ? [gameVisual.file] : undefined
			});
		});
		return SpecialResponse.RespondedManually;
	}

	const parsed = parseBlackjackButtonID(customID);
	if (!parsed) {
		return { content: 'Invalid blackjack interaction.', ephemeral: true };
	}
	const active = getActiveBlackjackGameByNonce(parsed.nonce);
	if (!active) {
		return { content: 'This blackjack game is no longer active.', ephemeral: true };
	}
	if (interaction.userId !== active.userID) {
		return { content: "This isn't your blackjack game.", ephemeral: true };
	}

	const user = await mUserFetch(active.userID);
	await user.withLock('blackjack_button', async lockedUser => {
		const current = getActiveBlackjackGameByNonce(parsed.nonce);
		if (!current || current.userID !== interaction.userId) {
			await interaction.reply({ content: 'This blackjack game is no longer active.', ephemeral: true });
			return;
		}
		let deductedBet = 0;
		try {
			if (parsed.action === 'INSURE' || parsed.action === 'NO_INSURE') {
				if (current.game.phase !== 'insurance') {
					await interaction.reply({ content: 'Insurance is not available now.', ephemeral: true });
					return;
				}
				if (parsed.action === 'INSURE') {
					const insuranceBet = calculateInsuranceBet(current.game.baseBet);
					if (insuranceBet > 0) {
						try {
							await lockedUser.transactItems({
								itemsToRemove: new Bank().add('Coins', insuranceBet)
							});
							deductedBet = insuranceBet;
						} catch {
							await interaction.reply({ content: "You can't afford insurance.", ephemeral: true });
							return;
						}
					}
					applyInsuranceDecision(current.game, true);
				} else {
					applyInsuranceDecision(current.game, false);
				}
			} else {
				if (current.game.phase !== 'player') {
					await interaction.reply({ content: 'You cannot act right now.', ephemeral: true });
					return;
				}
				const extraBet = additionalBetRequiredForAction(current.game, parsed.action);
				if (extraBet > 0) {
					try {
						await lockedUser.transactItems({
							itemsToRemove: new Bank().add('Coins', extraBet)
						});
						deductedBet = extraBet;
					} catch {
						await interaction.reply({
							content: `You need ${toKMB(extraBet)} more GP for that action.`,
							ephemeral: true
						});
						return;
					}
				}
				applyPlayerAction(current.game, parsed.action);
			}
		} catch (err) {
			if (deductedBet > 0) {
				await lockedUser.transactItems({
					itemsToAdd: new Bank().add('Coins', deductedBet),
					collectionLog: false
				});
			}
			await interaction.reply({ content: (err as Error).message, ephemeral: true });
			return;
		}

		touchActiveBlackjackGame(current.userID);
		if (gameIsFinished(current.game)) {
			await applySettlementToUser(lockedUser, current.game);
			const finalVisual = await maybeAddBlackjackImage({
				game: current.game,
				embed: finishedEmbed({ game: current.game }),
				descriptionBelowImage: finishedDescription({ game: current.game })
			});
			destroyActiveBlackjackGame(current.userID);
			await interaction.update({
				embeds: finalVisual.embeds,
				components: [],
				files: finalVisual.file ? [finalVisual.file] : undefined
			});
			return;
		}

		scheduleBlackjackTimeout(current.userID);
		const gameVisual = await maybeAddBlackjackImage({
			game: current.game,
			embed: gameEmbed({ game: current.game }),
			descriptionBelowImage: gameDescription({ game: current.game }) ?? undefined
		});
		await interaction.update({
			embeds: gameVisual.embeds,
			components: activeComponents(current.game, current.nonce),
			files: gameVisual.file ? [gameVisual.file] : undefined
		});
	});

	return SpecialResponse.RespondedManually;
}
