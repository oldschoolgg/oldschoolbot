interface TestPotatoBingoToolsOptions {
	start_bingo?: string;
}

export async function handleTestPotatoBingoTools(user: MUser, options: TestPotatoBingoToolsOptions) {
	if (options.start_bingo) {
		const bingo = await prisma.bingo.findFirst({
			where: {
				id: Number(options.start_bingo),
				creator_id: user.id
			}
		});
		if (!bingo) return 'Invalid bingo.';
		await prisma.bingo.update({
			where: {
				id: bingo.id
			},
			data: {
				start_date: new Date()
			}
		});
		return 'Your bingo start date has been set to this moment, so it has just started.';
	}
	return 'Nothin!';
}
