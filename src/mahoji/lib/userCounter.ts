export async function incrementUserCounter(_userID: string, _key: string, incrementUserCounter: number) {
	const userID = BigInt(_userID);
	const key = _key.toLowerCase();
	const result = await prisma.userCounter.upsert({
		where: {
			user_id_key: {
				user_id: userID,
				key
			}
		},
		create: {
			user_id: userID,
			key,
			value: incrementUserCounter
		},
		update: {
			value: {
				increment: incrementUserCounter
			}
		}
	});
	return result;
}
