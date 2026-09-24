export type GamblingTransactionType = 'dice' | 'duel' | 'hot_cold' | 'lucky_pick' | 'slots';

export async function trackGamblingTransaction({
	userID,
	type,
	amountStaked,
	pnl
}: {
	userID: string;
	type: GamblingTransactionType;
	amountStaked: number;
	pnl: number;
}) {
	await prisma.$executeRaw`
INSERT INTO gambling_transaction (user_id, type, amount_staked, pnl)
VALUES (${BigInt(userID)}, ${type}, ${BigInt(amountStaked)}, ${BigInt(Math.trunc(pnl))});
`;
}
