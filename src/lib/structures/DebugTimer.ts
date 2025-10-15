import type { PerformanceLogContext } from '@/lib/util/logger.js';

export class DebugStopwatch {
	public digits: number = 2;
	public name: string;
	public interaction: PerformanceLogContext['interaction'];
	#start: number;
	#end: number | null;

	public constructor({ name, interaction }: { name: string; interaction: PerformanceLogContext['interaction'] }) {
		this.name = name;
		this.interaction = interaction;
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

	public stop(text?: string): void {
		if (this.running) this.#end = performance.now();
		if (text) {
			Logging.logPerf({
				duration: this.duration,
				text: `${this.name} ${text}`,
				interaction: this.interaction
			});
		}
	}

	private timeToString(time: number): string {
		if (time >= 1000) return `${(time / 1000).toFixed(this.digits)}s`;
		if (time >= 1) return `${time.toFixed(this.digits)}ms`;
		return `${(time * 1000).toFixed(this.digits)}μs`;
	}

	public toString(): string {
		return this.timeToString(this.duration);
	}

	public lastCheckpoint: number | null = null;
	public check(text?: string) {
		const checkTime = performance.now() - (this.lastCheckpoint ?? this.#start);
		this.lastCheckpoint = performance.now();
		if (text) {
			Logging.logPerf({
				duration: checkTime,
				text: `${this.name} ${text}`,
				interaction: this.interaction
			});
		}
	}
}
