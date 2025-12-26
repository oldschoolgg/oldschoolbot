export async function incrementUserCounter(_userID: string, _key: string, incrementValue: number) {
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
			value: incrementValue
		},
		update: {
			value: {
				increment: incrementValue
			}
		}
	});
	return result;
}
