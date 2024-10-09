import { type WriteStream, createWriteStream } from 'node:fs';

export class TSVWriter {
	private stream: WriteStream;
	private buffer: string[] = [];
	private bufferSize: number;
	private columns: number | null = null;

	constructor(filename: string, bufferSize = 10) {
		this.stream = createWriteStream(filename, { flags: 'w' });
		this.bufferSize = bufferSize;
	}

	writeRow(row: string[]) {
		if (!this.columns) {
			this.columns = row.length;
		}
		if (row.length !== this.columns) {
			throw new Error(`Row length mismatch. Expected ${this.columns}, got ${row.length}`);
		}
		this.buffer.push(row.join('\t'));
		if (this.buffer.length >= this.bufferSize) {
			this.flush();
		}
	}

	private flush() {
		if (this.buffer.length > 0) {
			this.stream.write(`${this.buffer.join('\n')}\n`);
			this.buffer = [];
		}
	}

	end() {
		return new Promise<void>((resolve, reject) => {
			this.flush();
			this.stream.end(() => resolve());
			this.stream.on('error', reject);
		});
	}
}
