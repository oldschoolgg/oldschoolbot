export async function findGroupOfUser(userID: string) {
	const user = await roboChimpClient.user.findUnique({
		where: {
			id: BigInt(userID)
		}
	});
	if (!user || !user.user_group_id) return [userID];
	const group = await roboChimpClient.user.findMany({
		where: {
			user_group_id: user.user_group_id
		}
	});
	if (!group) return [userID];
	return group.map(u => u.id.toString());
}
