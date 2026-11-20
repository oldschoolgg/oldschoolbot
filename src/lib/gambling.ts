interface CreateGambleOptions {
	userId: string;
	game: string;
	betAmount: number;
	betItemId?: number;
}

interface SettleGambleOptions {
	won: boolean;
	profitLoss: number;
	payoutAmount?: number;
	payoutItemId?: number;
}

export function createGamble({ userId, game, betAmount, betItemId }: CreateGambleOptions) {
	return prisma.gamble.create({
		data: {
			user_id: userId,
			game,
			bet_amount: BigInt(betAmount),
			bet_item_id: betItemId
		}
	});
}

export function settleGamble(id: number, { won, profitLoss, payoutAmount = 0, payoutItemId }: SettleGambleOptions) {
	return prisma.gamble.update({
		where: { id },
		data: {
			won,
			profit_loss: BigInt(profitLoss),
			payout_amount: BigInt(payoutAmount),
			payout_item_id: payoutItemId,
			settled_at: new Date()
		}
	});
}
