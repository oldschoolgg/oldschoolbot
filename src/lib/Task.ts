import { activity_type_enum } from '@prisma/client';

const tasks: MinionTask[] = [];

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export interface MinionTask {
	type: activity_type_enum;
	run: Function;
}

console.log(tasks);
