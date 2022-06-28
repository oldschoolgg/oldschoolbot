import { Task } from 'klasa';

import { DisassembleTaskOptions, disassemblyTask } from '../../../lib/invention/disassemble';

export default class extends Task {
	async run(data: DisassembleTaskOptions) {
		disassemblyTask(data);
	}
}
