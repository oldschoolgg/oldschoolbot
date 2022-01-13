import { CronJob } from 'cron';
// 0 1 * * *
new CronJob(
	'* * * * *',
	() => {
		console.log(new Date().toLocaleString());
	},
	undefined,
	undefined,
	'UTC'
).start();
