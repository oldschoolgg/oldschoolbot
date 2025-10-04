import postgres from 'postgres';

export const sql = postgres((process.env.DATABASE_URL as string).split('?')[0], {
	onnotice: notice => {
		if (notice.message.includes('already exists, skipping')) return;
		console.log('SQL Notice: ', notice.message);
	},
	max: 1
});
