import { Activity, activity_type_enum } from '@prisma/client';
import { clamp, randArrItem, sumArr, Time } from 'e';

import { getUsersLMSStats } from '../tasks/minions/minigames/lmsActivity';
import { prisma } from './settings/prisma';

/**
 *
 *
 * An item from revs that shows you what activites ppl are doing for pvping them
 * Killing people resets their xp, and gives you some of it as a lamp.
 * Killing people gives you their equipped items, and some of their bank.
 * You cannot kill the same person twice in a row.
 *
 *
 *
 * masses?
 * Dyed items are protected always?
 */
async function findKillableUsers(killer: MUser) {
	const activeTasks = await prisma.activity.findMany({
		where: {
			completed: false,
			finish_date: {
				gte: new Date(Date.now() + Number(Time.Minute))
			},
			user_id: {
				not: BigInt(killer.id)
			}
		}
	});

	return activeTasks;
}

async function pickKillableUser(killer: MUser, type: activity_type_enum): Promise<Activity | undefined> {
	const activeTasks = await findKillableUsers(killer);
	const filteredTasks = activeTasks.filter(task => task.type === type);
	return randArrItem(filteredTasks);
}

async function calculateUserDMMStrength(user: MUser) {
	let effecters = [];
	// -100 hugely bad, guaranteed death basically
	// -50 very bad
	// 20 helps a bit
	// 50 very good
	// 100 = hugely good

	// Veryyy bad if <43 prayer
	effecters.push({
		name: 'Prayer level Under 43',
		difference: -95,
		isApplied: user.skillLevel('prayer') < 43
	});

	// LMS
	const gamesWon = clamp((await getUsersLMSStats(user)).gamesWon, 0, 100);
	effecters.push({
		name: `Won ${gamesWon} LMS games`,
		difference: gamesWon,
		isApplied: gamesWon > 0
	});

	// Hunter
	const blackChinsCaught = clamp((await user.getCreatureScore(9)) / 100, 0, 100);
	effecters.push({
		name: `Black Chins: ${blackChinsCaught}`,
		difference: blackChinsCaught,
		isApplied: blackChinsCaught > 0
	});

	// Revenants
	const totalMsRevs = await prisma.activity.aggregate({
		_sum: {
			duration: true
		},
		where: {
			user_id: BigInt(user.id),
			type: 'Revenants'
		}
	});
	const totalHoursRevs = (totalMsRevs._sum.duration ?? 0) / Time.Hour;
	effecters.push({
		name: `${totalHoursRevs} hours of Revenants`,
		difference: clamp(totalHoursRevs, 0, 30),
		isApplied: totalHoursRevs > 0
	});

	// General game experience
	const totalMs = await prisma.activity.aggregate({
		_sum: {
			duration: true
		},
		where: {
			user_id: BigInt(user.id)
		}
	});
	const totalHours = (totalMs._sum.duration ?? 0) / Time.Hour;
	effecters.push({
		name: `${totalHoursRevs} hours of general gameplay`,
		difference: clamp(totalHours, 0, 5),
		isApplied: totalHours > 0
	});

	// Gear, matters hugely

	const strength = sumArr(effecters.map(i => i.difference));
}

async function handlePKAttempt(killer: MUser, type: activity_type_enum) {
	const task = pickKillableUser(killer, type);
	if (!task) return null;
}
