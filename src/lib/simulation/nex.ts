// /**
//  * pay 100k to get items back if die
//  *
//  *
//  * --- REQUIREMENTS ---
//  * requires dragon cbow or armadyl cbow or zaryte cbow or twisted bow
//  *
//  *
//  *
//  *
//  */

// import { User } from '@prisma/client';
// import { User as DJUser } from 'discord.js';

// import { getSkillsOfMahojiUser } from '../../mahoji/mahojiSettings';
// import { Skills } from '../types';
// import { formatSkillRequirements, skillsMeetRequirements } from '../util';

// const minStats: Skills = {
// 	attack: 90,
// 	strength: 90,
// 	defence: 90,
// 	ranged: 90,
// 	magic: 94,
// 	prayer: 77
// };
// interface TeamMember {
// 	user: User;
// 	djsUser: DJUser;
// }

// interface NexContext {
// 	quantity: number;
// 	team: TeamMember[];
// }

// // interface NexResult {
// // 	inhibitedReason: string;
// // }

// // async function handleNex({ quantity, team }: NexContext) {
// // 	for (const { user, djsUser } of team) {
// // 		if (!skillsMeetRequirements(getSkillsOfMahojiUser(user), minStats)) {
// // 			return `${djsUser.username} doesn't have the skill requirements: ${formatSkillRequirements(minStats)}.`;
// // 		}
// // 	}
// // }
