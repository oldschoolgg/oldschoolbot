export async function checkTableBankMatches(user: MUser) {
	await user.sync();
	const clFromDB = await user.fetchCL();
	if (user.cl.toString() !== clFromDB.toString()) {
		console.error(`CL mismatch for user ${user.id}: ${user.cl.difference(clFromDB).toString()}`);
	}
}
