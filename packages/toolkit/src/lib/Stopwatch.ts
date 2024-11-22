import { formatDuration } from '../util/datetime';

// MIT Copyright (c) 2020 The Sapphire Community and its contributors, gc
export class Stopwatch {
	public digits: number;
	#start: number;
	#end: number | null;

	public constructor(digits = 2) {
		this.digits = digits;
		this.#start = performance.now();
		this.#end = null;
	}

	public get duration(): number {
		return this.#end ? this.#end - this.#start : performance.now() - this.#start;
	}

	public get running(): boolean {
		return Boolean(!this.#end);
	}

	public restart(): this {
		this.#start = performance.now();
		this.#end = null;
		return this;
	}

	public reset(): this {
		this.#start = performance.now();
		this.#end = this.#start;
		return this;
	}

	public start(): this {
		if (!this.running) {
			this.#start = performance.now() - this.duration;
			this.#end = null;
		}

		return this;
	}

	public stop(text?: string): this {
		if (this.running) this.#end = performance.now();
		if (text) {
			console.log(`${this.toString()}: ${text}`);
		}
		return this;
	}

	public toString(): string {
		const time = this.duration;
		if (time >= 1000) return `${(time / 1000).toFixed(this.digits)}s`;
		if (time >= 1) return `${time.toFixed(this.digits)}ms`;
		return `${(time * 1000).toFixed(this.digits)}μs`;
	}

	public lastCheckpoint: number | null = null;
	public check(text: string) {
		const checkTime = performance.now() - (this.lastCheckpoint ?? this.#start);
		const checkTimeStr = checkTime > 0 ? `${formatDuration(checkTime, true, true)}` : '';
		console.log(`${this.toString()}: ${text} in ${checkTimeStr}`);
		this.lastCheckpoint = performance.now();
	}
}
