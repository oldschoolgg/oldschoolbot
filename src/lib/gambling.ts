interface CreateGambleOptions {
	user_id: string;
	game: string;
	bet_amount: number;
	bet_item_id?: number;
}

interface SettleGambleOptions {
	won: boolean;
	profit_loss: number;
	payout_amount?: number;
	payout_item_id?: number;
}

export function createGamble({ user_id, game, bet_amount, bet_item_id }: CreateGambleOptions) {
	return prisma.gamble.create({
		data: {
			user_id,
			game,
			bet_amount: BigInt(bet_amount),
			bet_item_id
		}
	});
}

export function settleGamble(id: number, { won, profit_loss, payout_amount = 0, payout_item_id }: SettleGambleOptions) {
	return prisma.gamble.update({
		where: { id },
		data: {
			won,
			profit_loss: BigInt(profit_loss),
			payout_amount: BigInt(payout_amount),
			payout_item_id,
			settled_at: new Date()
		}
	});
}
