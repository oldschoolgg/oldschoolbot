const tasks: Task[] = [];

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Task {
	constructor() {
		tasks.push(this);
	}
}

console.log(tasks);
